#!/usr/bin/env bash
# Erfasst echte Nachweise vom VPS (per SSH-Alias "projektserver", ohne sudo) und von aussen.
# Aufruf (Git Bash, Repo-Stamm):  bash infra/deploy/nachweise_vps.sh bbk-it-08.de
# Bilder:  python infra/postgres/nachweise_rendern.py infra/deploy/shots docs/praesentation/vps_deployment infra/stack/compose.yaml "VPS"
OUT="$(cd "$(dirname "$0")" && pwd)/shots"; mkdir -p "$OUT"; rm -f "$OUT"/*.txt
HOST="${1:?Hostname}"


clean() { sed -e 's/217\.154\.119\.133/<SERVER-IP>/g' -e 's/si-lasse/<SI-KONTO>/g'; }
run()  { echo "\$ $1"; eval "$1" 2>&1 | clean; echo; }
srv()  { echo "server\$ $1"; ssh -o BatchMode=yes projektserver "$1" 2>&1 | clean; echo; }
note() { echo "\$ # $1"; }
shot() { exec > "$OUT/$1.txt"; }

shot 30_auto_deploy
note "Commit gepusht -> CI gruen -> Server rollt selbst aus (Protokoll auf dem VPS)"
srv "grep -E 'Rolle|Fertig|CI fuer' /var/lib/maschinenverleih-deploy/deploy.log | tail -n 4"
srv "cat /var/lib/maschinenverleih-deploy/status"
note "Zum Vergleich: Ende der CI-Pruefung auf GitHub"
run "gh run list --repo 24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8 --branch feature/app-stack --limit 2 --json headSha,conclusion,updatedAt --jq '.[] | \"\(.headSha[0:7])  \(.conclusion)  fertig \(.updatedAt)\"'"

shot 31_timer
srv "systemctl list-timers maschinenverleih-deploy.timer --no-pager | head -n 2"
srv "systemctl show maschinenverleih-deploy.service -p User -p Result -p NoNewPrivileges -p ProtectSystem"
srv "id maschinenverleih-deploy; getent passwd maschinenverleih-deploy | cut -d: -f7"

shot 32_ports_server
srv "ss -tlnH | awk '{print \$4}' | sort -u"

shot 33_von_aussen
note "Test vom eigenen PC ueber das Internet"
run "curl -sS -o /dev/null -w 'HTTP  -> %{http_code} Umleitung nach %{redirect_url}\n' http://$HOST/"
run "curl -sS -o /dev/null -w 'HTTPS -> %{http_code}, TLS %{ssl_verify_result} (0 = Zertifikat gueltig)\n' https://$HOST/"
run "curl -sS https://$HOST/api/health/database"
run "curl -sSI https://$HOST/ | grep -iE '^(HTTP|strict|x-frame|x-content)'"
note "Datenbank- und Backend-Port von aussen"
for p in 5432 8080; do
  (timeout 5 bash -c "echo > /dev/tcp/$HOST/$p" 2>/dev/null && echo "$HOST:$p -> OFFEN") || echo "$HOST:$p -> keine Verbindung"
done; echo

shot 34_zertifikat
run "echo | openssl s_client -connect $HOST:443 -servername $HOST 2>/dev/null | openssl x509 -noout -subject -issuer -dates"
