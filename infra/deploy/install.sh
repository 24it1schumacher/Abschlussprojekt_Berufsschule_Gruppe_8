#!/usr/bin/env bash
# Einmalige Einrichtung des automatischen Deployments auf dem VPS.
#
# Aufruf (als Administrator, einmalig):
#   curl -fsSLO https://raw.githubusercontent.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8/main/infra/deploy/install.sh
#   sudo bash install.sh <admin-email> [branch]
#
# Was passiert:
#   - Systembenutzer "maschinenverleih-deploy" (ohne Login, Mitglied der Gruppe docker)
#   - Repository nach /srv/maschinenverleih klonen (oeffentlich, ohne Zugangsdaten)
#   - Passwoerter fuer Datenbank-Admin und Anwendungsrolle zufaellig erzeugen (.env, Rechte 600)
#   - Datenbank, Anwendungsrolle und Anwendungsdatenbank anlegen
#   - Port 80 in ufw freigeben
#   - systemd-Timer aktivieren, erste Version ausrollen, erstes Admin-Konto anlegen
# Das Skript kann gefahrlos erneut ausgefuehrt werden: Vorhandenes wird nicht ueberschrieben.

set -euo pipefail

ADMIN_EMAIL="${1:?Aufruf: sudo bash install.sh <admin-email> [branch]}"
BRANCH="${2:-main}"
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

say "Zugangsdaten erzeugen (nur wenn noch nicht vorhanden)"
PG_ENV="$DIR/infra/postgres/.env"
APP_ENV="$DIR/infra/stack/.env"
ADMIN_PW=""
if [ ! -f "$PG_ENV" ]; then
  printf 'POSTGRES_ADMIN_PASSWORD=%s\n' "$(gen_pw)" > "$PG_ENV"
fi
if [ ! -f "$APP_ENV" ]; then
  SERVER_IP="$(hostname -I | awk '{print $1}')"
  ADMIN_PW="Start-$(gen_pw | head -c 16)"
  sed -e "s|^APP_DB_PASSWORD=.*|APP_DB_PASSWORD=$(gen_pw)|" \
      -e "s|^PUBLIC_ORIGIN=.*|PUBLIC_ORIGIN=http://$SERVER_IP|" \
      -e "s|^WEB_BIND=.*|WEB_BIND=0.0.0.0:80|" \
      -e "s|^BOOTSTRAP_ADMIN_EMAIL=.*|BOOTSTRAP_ADMIN_EMAIL=$ADMIN_EMAIL|" \
      -e "s|^BOOTSTRAP_ADMIN_PASSWORD=.*|BOOTSTRAP_ADMIN_PASSWORD=$ADMIN_PW|" \
      "$DIR/infra/stack/.env.example" > "$APP_ENV"
fi
chown "$SVC_USER:$SVC_USER" "$PG_ENV" "$APP_ENV"
chmod 600 "$PG_ENV" "$APP_ENV"
APP_PW="$(grep '^APP_DB_PASSWORD=' "$APP_ENV" | cut -d= -f2-)"

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

say "Firewall: Port 80 (HTTP) freigeben"
if ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp comment 'Maschinenverleih Webserver' >/dev/null
  ufw status | grep -E "^(80|22)"
else
  echo "ufw ist nicht aktiv – bitte pruefen (Story 16 / Issue #3)."
fi

say "systemd-Timer einrichten"
install -m 644 "$DIR/infra/deploy/maschinenverleih-deploy.service" /etc/systemd/system/
install -m 644 "$DIR/infra/deploy/maschinenverleih-deploy.timer" /etc/systemd/system/
sed -i "s|^ExecStart=.*|ExecStart=$DIR/infra/deploy/auto-update.sh|" /etc/systemd/system/maschinenverleih-deploy.service
if [ "$BRANCH" != "main" ]; then
  mkdir -p /etc/systemd/system/maschinenverleih-deploy.service.d
  printf '[Service]\nEnvironment=DEPLOY_BRANCH=%s\n' "$BRANCH" > /etc/systemd/system/maschinenverleih-deploy.service.d/branch.conf
fi
systemctl daemon-reload

say "Erste Version ausrollen (Images bauen dauert beim ersten Mal einige Minuten)"
as_svc env FORCE=1 DEPLOY_BRANCH="$BRANCH" STATE_DIRECTORY="$STATE" "$DIR/infra/deploy/auto-update.sh"

if [ -n "$ADMIN_PW" ]; then
  say "Admin-Startpasswort wieder aus der Konfiguration entfernen"
  sed -i -e 's|^BOOTSTRAP_ADMIN_EMAIL=.*|BOOTSTRAP_ADMIN_EMAIL=|' -e 's|^BOOTSTRAP_ADMIN_PASSWORD=.*|BOOTSTRAP_ADMIN_PASSWORD=|' "$APP_ENV"
  compose up -d --wait backend
fi

systemctl enable --now maschinenverleih-deploy.timer

say "Fertig"
echo "Anwendung:        http://$(hostname -I | awk '{print $1}')/"
echo "Automatik:        $(systemctl is-active maschinenverleih-deploy.timer), prueft alle 2 Minuten den Branch $BRANCH"
echo "Protokoll:        journalctl -u maschinenverleih-deploy -f"
echo "Letzter Stand:    cat $STATE/status"
if [ -n "$ADMIN_PW" ]; then
  echo
  echo "Erstes Admin-Konto: $ADMIN_EMAIL"
  echo "Startpasswort:      $ADMIN_PW"
  echo "Nur jetzt sichtbar. Beim ersten Login muss es geaendert werden. Bitte in den Passwortmanager uebernehmen."
fi
