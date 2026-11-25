#!/usr/bin/env bash
# Erfasst die Nachweise zu User Story 10 auf dem VPS als Textdateien.
#
# Aufruf auf dem Server, im Ordner mit compose.yaml und .env:
#   bash nachweise_server.sh
#
# Ergebnis: Ordner ./nachweise_vps/ mit einer Textdatei pro Nachweis.
# Server-IPs, Hostname und Kontoname werden durch Platzhalter ersetzt.
# Passwoerter erscheinen in keiner Ausgabe.
#
# Was das Skript veraendert (alles wird wieder rueckgaengig gemacht):
#   - legt in der Systemdatenbank "postgres" die Tabelle nachweis_persistenz an und loescht sie am Ende
#   - fuehrt einmal "docker compose down" und "up" aus (kurze Unterbrechung, das Volume bleibt)
# Es loescht nie das Volume und legt keine Rollen oder Datenbanken an.

set -u
cd "$(dirname "$0")"

if [ ! -f .env ] || [ ! -f compose.yaml ]; then
  echo "Bitte im Ordner mit compose.yaml und .env starten." >&2; exit 1
fi
echo "Fuer ss, iptables und ufw wird sudo benoetigt."
sudo -v || exit 1

exec 3>&1   # Terminal-Ausgabe merken
OUT="./nachweise_vps"; mkdir -p "$OUT"; rm -f "$OUT"/*.txt
PW=$(grep '^POSTGRES_ADMIN_PASSWORD=' .env | cut -d= -f2-)
IMAGE=$(docker compose config --images)
CTR="maschinenverleih-db-postgres-1"

# Schwaerzen: alle Server-IPs (v4 und v6), Hostname, Kontoname
SED_ARGS=()
for ip in $(hostname -I); do SED_ARGS+=(-e "s/${ip//./\\.}/<SERVER-IP>/g"); done
SED_ARGS+=(-e "s/$(hostname -f 2>/dev/null || hostname)/<SERVER>/g" -e "s/$(hostname)/<SERVER>/g" -e "s/\b${USER:-$(id -un)}\b/<SI-KONTO>/g")
clean() { sed "${SED_ARGS[@]}"; }

run()  { echo "\$ $1" | clean; eval "$1" 2>&1 | clean; echo; }
note() { echo "\$ # $1"; }
shot() { exec > "$OUT/$1.txt"; }
restore_stdout() { exec 1>&3; }

# --- 01 Version und Status -------------------------------------------------
shot 01_start
run "docker compose config --images"
run "docker compose ps --format 'table {{.Name}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'"
run "docker compose exec postgres psql -U postgres -tAc 'SELECT version();'"
run "docker compose logs postgres | grep 'ready to accept' | tail -n 1"

# --- 02 Ohne Passwort kein Start (laufender Container bleibt unberuehrt) ---
shot 02_ohne_passwort
note "Start mit leerer Umgebungsdatei statt .env"
run "docker compose --env-file /dev/null up -d; echo \"Exit-Code: \$?\""
run "docker compose ps --format '{{.Name}} {{.Status}}'"

# --- 03 Kein automatisch angelegtes Schema --------------------------------
shot 03_kein_autoschema
run "docker compose exec postgres psql -U postgres -c 'SELECT datname AS datenbank, pg_get_userbyid(datdba) AS eigentuemer FROM pg_database ORDER BY 1;'"

# --- 04 Persistenz ---------------------------------------------------------
shot 04_persistenz
docker compose exec -T postgres psql -U postgres -qc 'DROP TABLE IF EXISTS nachweis_persistenz;' >/dev/null 2>&1
run "docker compose exec postgres psql -U postgres -c \"CREATE TABLE nachweis_persistenz (id serial, notiz text, erstellt timestamptz DEFAULT now()); INSERT INTO nachweis_persistenz (notiz) VALUES ('vor dem Neuerstellen');\""
run "docker compose ps -q postgres | cut -c1-12"
run "docker compose down 2>&1 | grep -E 'Container.*Removed|Network.*Removed'"
run "docker volume ls --filter name=maschinenverleih"
run "docker compose up -d --wait 2>&1 | grep -E 'Network.*Created|Healthy'"
run "docker compose ps -q postgres | cut -c1-12"
run "docker compose exec postgres psql -U postgres -c 'SELECT * FROM nachweis_persistenz;'"
docker compose exec -T postgres psql -U postgres -qc 'DROP TABLE nachweis_persistenz;' >/dev/null 2>&1

# --- 05 Port nur lokal ------------------------------------------------------
shot 05_port
run "docker compose port postgres 5432"
run "sudo ss -tlnp | grep -E 'State|:5432'"
run "sudo iptables -t nat -L DOCKER -n | grep -E 'Chain|target|5432'"
run "sudo ufw status verbose"

# --- 06 Verbindung aus dem internen Netz -----------------------------------
shot 06_internes_netz
note "Passwort wird als Umgebungsvariable durchgereicht, nicht als Befehlsargument"
export PGPASSWORD="$PW"
run "docker run --rm --network maschinenverleih-db-intern -e PGPASSWORD $IMAGE psql -h postgres -U postgres -c 'SELECT 1 AS verbindung_ok;'"
unset PGPASSWORD
note "Gegenprobe: gleicher Test OHNE das interne Netz"
run "docker run --rm $IMAGE pg_isready -h postgres -t 3; echo \"Exit-Code: \$?\""

# --- 07 Anwendungsdatenbank (nur lesen) ------------------------------------
shot 07_schema
if docker compose exec -T postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='maschinenverleih'" | grep -q 1; then
  run "docker compose exec postgres psql -U postgres -c '\\du maschinenverleih_app'"
  run "docker compose exec postgres psql -U postgres -d maschinenverleih -c \"SELECT tableowner, count(*) AS tabellen FROM pg_tables WHERE schemaname='public' GROUP BY 1;\""
else
  note "Datenbank maschinenverleih existiert noch nicht (Anleitung Abschnitt 4)"
fi

# --- 08 Haertung -------------------------------------------------------------
shot 08_haertung
run "docker inspect -f 'SecurityOpt: {{.HostConfig.SecurityOpt}}' $CTR"
run "docker inspect -f 'Logging:     {{.HostConfig.LogConfig.Type}} {{.HostConfig.LogConfig.Config}}' $CTR"
run "docker inspect -f 'Restart:     {{.HostConfig.RestartPolicy.Name}}' $CTR"

# --- 10 Zugangsdaten auf dem Server -----------------------------------------
shot 10_env_rechte
run "ls -l .env"
run "stat -c '%A %U %n' .env"

# --- 11 Volume auf dem Server ------------------------------------------------
shot 11_volume
run "docker volume inspect maschinenverleih-postgres-data --format '{{.Name}}  ->  {{.Mountpoint}}'"
run "sudo du -sh \$(docker volume inspect maschinenverleih-postgres-data --format '{{.Mountpoint}}')"

restore_stdout
echo "Fertig. Dateien in $OUT:"
ls -1 "$OUT"
echo
echo "Bitte vor dem Weitergeben kurz durchsehen:  grep -rn . $OUT | less"
