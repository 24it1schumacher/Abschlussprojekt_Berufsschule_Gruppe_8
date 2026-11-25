#!/usr/bin/env bash
# Automatisches Ausrollen der Anwendung auf dem Server (Pull-Prinzip).
#
# Wird alle 2 Minuten vom systemd-Timer "maschinenverleih-deploy.timer" gestartet,
# als Systembenutzer "maschinenverleih-deploy". Ablauf:
#   1. Neuen Stand von GitHub holen (nur lesend, das Repository ist oeffentlich)
#   2. Nur weitermachen, wenn die CI-Pruefungen fuer diesen Commit gruen sind
#   3. Neue SQL-Schritte aus app/backend/src/main/resources/db/ einspielen
#   4. Images neu bauen (dabei laufen die Backend-Tests) und Container ersetzen
#   5. Wenn etwas fehlschlaegt: zurueck auf den vorherigen Stand (Rollback)
#
# Der Server braucht dafuer keine Zugangsdaten zu GitHub, und GitHub hat keinen Zugang zum Server.
#
# Manuell (als root):  sudo -u maschinenverleih-deploy FORCE=1 /srv/maschinenverleih/infra/deploy/auto-update.sh
# Protokoll:           journalctl -u maschinenverleih-deploy -f

set -euo pipefail

# Das Skript liegt selbst im Repository und wird beim Update ersetzt.
# Deshalb laeuft immer eine Kopie, damit bash nicht mitten im Lauf eine geaenderte Datei liest.
if [ -z "${_DEPLOY_COPY:-}" ]; then
  tmp="$(mktemp)"; cp "$0" "$tmp"
  _DEPLOY_COPY=1 exec bash "$tmp" "$@"
fi
trap 'rm -f "$0"' EXIT

REPO_DIR="${REPO_DIR:-/srv/maschinenverleih}"
BRANCH="${DEPLOY_BRANCH:-main}"
GITHUB_REPO="${GITHUB_REPO:-24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8}"
STATE_DIR="${STATE_DIRECTORY:-/var/lib/maschinenverleih-deploy}"
REQUIRED_CHECKS=("Backend – Build und Tests" "Frontend – Typpruefung und Build" "Container – Images und Konfiguration")
STACK="$REPO_DIR/infra/stack/compose.yaml"
DB_DIR="$REPO_DIR/app/backend/src/main/resources/db"

log() { echo "[deploy] $*"; printf '%s %s\n' "$(date -Is)" "$*" >> "$STATE_DIR/deploy.log"; }
compose() { docker compose -f "$STACK" "$@"; }
psql_db() { compose exec -T postgres psql -U postgres -d maschinenverleih -v ON_ERROR_STOP=1 -q "$@"; }

# Nur ein Lauf gleichzeitig
mkdir -p "$STATE_DIR"
exec 9>"$STATE_DIR/lock"
flock -n 9 || { log "Ein anderer Lauf ist noch aktiv."; exit 0; }

cd "$REPO_DIR"
git fetch --quiet origin "$BRANCH"
OLD="$(git rev-parse HEAD)"
NEW="$(git rev-parse "origin/$BRANCH")"

if [ "$OLD" = "$NEW" ] && [ "${FORCE:-}" != "1" ]; then
  exit 0
fi
if [ -f "$STATE_DIR/failed" ] && [ "$(cat "$STATE_DIR/failed")" = "$NEW" ] && [ "${FORCE:-}" != "1" ]; then
  exit 0   # Dieser Commit ist schon einmal gescheitert; erst ein neuer Commit wird wieder versucht
fi

# --- 2. CI-Ergebnis abfragen ------------------------------------------------
ci_status() {
  curl -fsS -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$GITHUB_REPO/commits/$1/check-runs?per_page=100" |
  python3 -c '
import json, sys
required = sys.argv[1:]
runs = {r["name"]: r for r in json.load(sys.stdin)["check_runs"]}
for name in required:
    r = runs.get(name)
    if r is None or r["status"] != "completed":
        print("ausstehend"); sys.exit()
    if r["conclusion"] != "success":
        print("fehlgeschlagen: " + name); sys.exit()
print("gruen")
' "${REQUIRED_CHECKS[@]}"
}

STATUS="$(ci_status "$NEW" || echo "nicht abrufbar")"
case "$STATUS" in
  gruen) ;;
  ausstehend|"nicht abrufbar")
    log "CI fuer ${NEW:0:7} ist $STATUS – naechster Versuch in 2 Minuten."; exit 0 ;;
  *)
    log "CI fuer ${NEW:0:7} ist $STATUS – wird NICHT ausgerollt."
    echo "$NEW" > "$STATE_DIR/failed"; exit 0 ;;
esac

log "Rolle ${OLD:0:7} -> ${NEW:0:7} aus ($(git log -1 --format=%s "$NEW"))"

rollback() {
  log "FEHLER beim Ausrollen von ${NEW:0:7} – Rollback auf ${OLD:0:7}"
  echo "$NEW" > "$STATE_DIR/failed"
  git -c advice.detachedHead=false checkout --quiet --detach "$OLD"
  compose up -d --build --wait --wait-timeout 300 || log "ACHTUNG: Auch der Rollback ist fehlgeschlagen!"
  printf '%s fehlgeschlagen %s, laeuft weiter auf %s\n' "$(date -Is)" "${NEW:0:7}" "${OLD:0:7}" > "$STATE_DIR/status"
  exit 1
}

git -c advice.detachedHead=false checkout --quiet --detach "$NEW"

# --- 3. Datenbank-Schritte --------------------------------------------------
# Jede nummerierte SQL-Datei wird genau einmal ausgefuehrt und in deploy_schema_history vermerkt.
# 001 ist nur ein technisches Beispiel und wird uebersprungen.
compose up -d --wait postgres
psql_db -c "CREATE TABLE IF NOT EXISTS deploy_schema_history (
              filename text PRIMARY KEY,
              applied_at timestamptz NOT NULL DEFAULT now(),
              git_commit text NOT NULL)"
for f in "$DB_DIR"/[0-9][0-9][0-9]_*.sql; do
  name="$(basename "$f")"
  [ "$name" = "001_create_app_message.sql" ] && continue
  done_already="$(psql_db -tAc "SELECT 1 FROM deploy_schema_history WHERE filename = '$name'")"
  [ "$done_already" = "1" ] && continue
  log "SQL-Schritt $name"
  if grep -qi 'CREATE EXTENSION' "$f"; then
    psql_db < "$f" || rollback          # Erweiterungen braucht den Administrator
  else
    # Tabellen sollen der Anwendungsrolle gehoeren
    { echo "SET ROLE maschinenverleih_app;"; cat "$f"; echo "RESET ROLE;"; } | psql_db || rollback
  fi
  psql_db -c "INSERT INTO deploy_schema_history (filename, git_commit) VALUES ('$name', '$NEW')"
done

# --- 4. Bauen und ersetzen --------------------------------------------------
# --build: Backend-Tests laufen im Image-Bau; schlaegt einer fehl, bleibt die alte Version aktiv.
# --wait:  wartet, bis die Healthchecks gruen sind.
compose up -d --build --remove-orphans --wait --wait-timeout 300 || rollback

# Abschlusspruefung aus dem Webserver-Container: web -> backend -> datenbank
# (unabhaengig davon, ob das TLS-Zertifikat schon ausgestellt ist)
compose exec -T web wget -qO- -T 10 http://backend:8080/api/health/database > /dev/null || rollback

docker image prune -f > /dev/null
rm -f "$STATE_DIR/failed"
printf '%s ausgerollt %s (%s)\n' "$(date -Is)" "${NEW:0:7}" "$(git log -1 --format=%s "$NEW")" > "$STATE_DIR/status"
log "Fertig: ${NEW:0:7} laeuft."
