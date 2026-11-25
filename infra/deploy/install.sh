#!/usr/bin/env bash
# Einmalige Einrichtung des automatischen Deployments auf dem VPS.
#
# Aufruf (als Administrator, einmalig):
#   curl -fsSLO https://raw.githubusercontent.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8/main/infra/deploy/install.sh
#   sudo bash install.sh <admin-email> [branch] [hostname]
#
#   branch    Branch, dem der Server folgt (Standard: main)
#   hostname  Name(n), unter denen die Anwendung per HTTPS erreichbar ist, z. B. "bbk-it-08.de,www.bbk-it-08.de".
#             Jeder Name braucht einen DNS-A-Record auf den Server.
#             Standard: <server-ip-mit-bindestrichen>.sslip.io (zeigt per DNS auf die Server-IP,
#             damit Let's Encrypt ohne eigene Domain ein Zertifikat ausstellen kann).
#
# Was passiert:
#   - Systembenutzer "maschinenverleih-deploy" (ohne Login, Mitglied der Gruppe docker)
#   - Repository nach /srv/maschinenverleih (oeffentlich, ohne Zugangsdaten)
#   - Passwoerter fuer Datenbank-Admin und Anwendungsrolle zufaellig erzeugen (.env, Rechte 600)
#   - Datenbank, Anwendungsrolle und Anwendungsdatenbank anlegen
#   - Ports 80 und 443 in ufw freigeben (80 nur fuer Zertifikat und Umleitung auf HTTPS)
#   - systemd-Timer aktivieren, erste Version ausrollen, erstes Admin-Konto anlegen
# Das Skript kann gefahrlos erneut ausgefuehrt werden: Passwoerter werden nie ueberschrieben.

set -euo pipefail

ADMIN_EMAIL="${1:?Aufruf: sudo bash install.sh <admin-email> [branch] [hostname]}"
BRANCH="${2:-main}"
SERVER_IP="$(hostname -I | awk '{print $1}')"
SITE_INPUT="${3:-${SERVER_IP//./-}.sslip.io}"
# Mehrere Namen erlaubt ("bbk-it-08.de,www.bbk-it-08.de"); Caddy braucht "name1, name2"
read -r -a SITE_NAMES <<< "${SITE_INPUT//,/ }"
SITE_LIST="$(printf '%s, ' "${SITE_NAMES[@]}")"; SITE_LIST="${SITE_LIST%, }"
SITE="${SITE_NAMES[0]}"   # Hauptname fuer Links und PUBLIC_ORIGIN
REPO_URL="https://github.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8.git"
DIR="/srv/maschinenverleih"
SVC_USER="maschinenverleih-deploy"
STATE="/var/lib/maschinenverleih-deploy"

[ "$(id -u)" = "0" ] || { echo "Bitte mit sudo starten." >&2; exit 1; }
command -v docker >/dev/null || { echo "Docker fehlt (Story 31 / Issue #34)." >&2; exit 1; }

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
gen_pw() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 32; }
as_svc() { sudo -u "$SVC_USER" -H "$@"; }
compose() { as_svc docker compose -f "$DIR/infra/stack/compose.yaml" "$@"; }
# Setzt KEY=VALUE in einer .env-Datei (ersetzt oder haengt an)
set_kv() {
  if grep -q "^$2=" "$1"; then sed -i "s|^$2=.*|$2=$3|" "$1"; else printf '%s=%s\n' "$2" "$3" >> "$1"; fi
}
get_kv() { grep "^$2=" "$1" | cut -d= -f2- || true; }

say "Systembenutzer $SVC_USER"
if ! id "$SVC_USER" >/dev/null 2>&1; then
  useradd --system --home-dir "$STATE" --create-home --shell /usr/sbin/nologin "$SVC_USER"
fi
usermod -aG docker "$SVC_USER"
install -d -o "$SVC_USER" -g "$SVC_USER" -m 755 "$STATE"

say "Repository nach $DIR (Branch $BRANCH)"
if [ ! -d "$DIR/.git" ]; then
  git clone --quiet --branch "$BRANCH" "$REPO_URL" "$DIR"
fi
chown -R "$SVC_USER:$SVC_USER" "$DIR"
chmod 750 "$DIR"
# Bei erneutem Lauf: auf den aktuellen Stand des Branches bringen
as_svc git -C "$DIR" fetch --quiet origin "$BRANCH"
as_svc git -C "$DIR" -c advice.detachedHead=false checkout --quiet --detach "origin/$BRANCH"

say "Zugangsdaten und Einstellungen (Passwoerter werden nie ueberschrieben)"
PG_ENV="$DIR/infra/postgres/.env"
APP_ENV="$DIR/infra/stack/.env"
[ -f "$PG_ENV" ] || printf 'POSTGRES_ADMIN_PASSWORD=%s\n' "$(gen_pw)" > "$PG_ENV"
if [ ! -f "$APP_ENV" ]; then
  cp "$DIR/infra/stack/.env.example" "$APP_ENV"
  set_kv "$APP_ENV" APP_DB_PASSWORD "$(gen_pw)"
  set_kv "$APP_ENV" BOOTSTRAP_ADMIN_EMAIL "$ADMIN_EMAIL"
  set_kv "$APP_ENV" BOOTSTRAP_ADMIN_PASSWORD "Start-$(gen_pw | head -c 16)"
fi
set_kv "$APP_ENV" SITE_ADDRESS "\"$SITE_LIST\""
set_kv "$APP_ENV" PUBLIC_ORIGIN "https://$SITE"
set_kv "$APP_ENV" WEB_BIND "0.0.0.0:80"
set_kv "$APP_ENV" WEB_TLS_BIND "0.0.0.0:443"
set_kv "$APP_ENV" COOKIE_SECURE "true"
chown "$SVC_USER:$SVC_USER" "$PG_ENV" "$APP_ENV"
chmod 600 "$PG_ENV" "$APP_ENV"
APP_PW="$(get_kv "$APP_ENV" APP_DB_PASSWORD)"
ADMIN_PW="$(get_kv "$APP_ENV" BOOTSTRAP_ADMIN_PASSWORD)"   # leer, wenn das Konto schon angelegt wurde

say "Datenbank starten und Anwendungsrolle anlegen"
compose up -d --wait postgres
psql_admin() { compose exec -T postgres psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q "$@"; }
# Passwort nur ueber stdin, nicht als Befehlsargument (waere sonst in der Prozessliste sichtbar)
if [ "$(psql_admin -tAc "SELECT 1 FROM pg_roles WHERE rolname='maschinenverleih_app'")" = "1" ]; then
  printf "ALTER ROLE maschinenverleih_app WITH LOGIN PASSWORD '%s';\n" "$APP_PW" | psql_admin
else
  printf "CREATE ROLE maschinenverleih_app LOGIN PASSWORD '%s';\n" "$APP_PW" | psql_admin
fi
if [ "$(psql_admin -tAc "SELECT 1 FROM pg_database WHERE datname='maschinenverleih'")" != "1" ]; then
  psql_admin -c "CREATE DATABASE maschinenverleih OWNER maschinenverleih_app"
fi

say "Firewall: 80 (Zertifikat + Umleitung) und 443 (HTTPS)"
# Hinweis: Docker veroeffentlicht Ports an ufw vorbei. Diese Regeln dokumentieren die Freigabe
# und gelten fuer Dienste ausserhalb von Docker; die eigentliche Freigabe ist "ports:" in compose.yaml.
if ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp comment 'Maschinenverleih: ACME + Umleitung auf HTTPS' >/dev/null
  ufw allow 443/tcp comment 'Maschinenverleih: HTTPS' >/dev/null
  ufw status | grep -E "^(22|80|443)/tcp "
else
  echo "ufw ist nicht aktiv – bitte pruefen (Story 16 / Issue #3)."
fi

say "systemd-Timer einrichten"
install -m 644 "$DIR/infra/deploy/maschinenverleih-deploy.service" /etc/systemd/system/
install -m 644 "$DIR/infra/deploy/maschinenverleih-deploy.timer" /etc/systemd/system/
rm -rf /etc/systemd/system/maschinenverleih-deploy.service.d
if [ "$BRANCH" != "main" ]; then
  mkdir -p /etc/systemd/system/maschinenverleih-deploy.service.d
  printf '[Service]\nEnvironment=DEPLOY_BRANCH=%s\n' "$BRANCH" > /etc/systemd/system/maschinenverleih-deploy.service.d/branch.conf
fi
systemctl daemon-reload

say "Erste Version ausrollen (Images bauen dauert beim ersten Mal einige Minuten)"
as_svc env FORCE=1 DEPLOY_BRANCH="$BRANCH" STATE_DIRECTORY="$STATE" bash "$DIR/infra/deploy/auto-update.sh"

if [ -n "$ADMIN_PW" ]; then
  say "Admin-Startpasswort wieder aus der Konfiguration entfernen"
  set_kv "$APP_ENV" BOOTSTRAP_ADMIN_EMAIL ""
  set_kv "$APP_ENV" BOOTSTRAP_ADMIN_PASSWORD ""
  compose up -d --wait backend
fi

systemctl enable --now maschinenverleih-deploy.timer

say "Fertig"
echo "Anwendung:        https://$SITE/"
echo "                  (das Zertifikat holt Caddy beim ersten Aufruf; kann bis zu einer Minute dauern)"
echo "Automatik:        $(systemctl is-active maschinenverleih-deploy.timer), prueft alle 2 Minuten den Branch $BRANCH"
echo "Protokoll:        cat $STATE/deploy.log"
if [ -n "$ADMIN_PW" ]; then
  echo
  echo "Erstes Admin-Konto: $ADMIN_EMAIL"
  echo "Startpasswort:      $ADMIN_PW"
  echo "Nur jetzt sichtbar. Beim ersten Login muss es geaendert werden. Bitte in den Passwortmanager uebernehmen."
fi
