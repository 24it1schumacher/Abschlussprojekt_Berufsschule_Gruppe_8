#!/usr/bin/env bash
# Erfasst die Nachweise zu User Story 10, die nur von AUSSEN pruefbar sind:
#   12 Portscan auf den VPS      (ist 5432 aus dem Internet erreichbar?)
#   13 Zugriff ueber SSH-Tunnel  (so arbeitet die Anwendungsentwicklung)
#
# Aufruf auf dem eigenen PC (Git Bash), aus dem Repository-Stammverzeichnis:
#   bash infra/postgres/nachweise_extern.sh <server> <ssh-konto>
#
# Voraussetzungen: ssh-Zugang mit Schluessel, Docker (fuer den psql-Client).
# nmap wird benutzt, wenn vorhanden; sonst ein einfacher TCP-Verbindungstest.
# Ergebnis: infra/postgres/nachweise_vps/12_*.txt und 13_*.txt (Server und Konto geschwaerzt).

set -u
SERVER="${1:?Aufruf: bash nachweise_extern.sh <server> <ssh-konto>}"
KONTO="${2:?Aufruf: bash nachweise_extern.sh <server> <ssh-konto>}"
IMAGE="postgres:17.11-trixie"
LOCALPORT=5433
OUT="$(cd "$(dirname "$0")" && pwd)/nachweise_vps"; mkdir -p "$OUT"
export MSYS_NO_PATHCONV=1

exec 3>&1
clean() { sed -e "s/${SERVER//./\\.}/<SERVER>/g" -e "s/\b$KONTO\b/<KONTO>/g"; }
run()  { echo "\$ $1" | clean; eval "$1" 2>&1 | clean; echo; }
note() { echo "\$ # $1"; }
shot() { exec > "$OUT/$1.txt"; }

tcp_test() {  # tcp_test <host> <port>
  if timeout 5 bash -c "echo > /dev/tcp/$1/$2" 2>/dev/null; then echo "$1:$2 -> offen"; else echo "$1:$2 -> keine Verbindung"; fi
}

# --- 12 Portscan von aussen --------------------------------------------------
shot 12_portscan_extern
note "Test vom eigenen PC ueber das Internet auf den VPS"
if command -v nmap >/dev/null 2>&1; then
  run "nmap -Pn -p 22,5432 $SERVER"
else
  note "nmap nicht installiert, daher einfacher TCP-Verbindungsversuch"
  run "tcp_test $SERVER 22"
  run "tcp_test $SERVER 5432"
fi

# --- 13 SSH-Tunnel -----------------------------------------------------------
exec 1>&3
echo "Fuer den Tunnel-Test wird das Admin-Passwort der Datenbank gebraucht (Eingabe unsichtbar)."
read -rs -p "Passwort: " PGPASSWORD; echo
export PGPASSWORD

shot 13_ssh_tunnel
note "Ohne Tunnel: direkte Verbindung auf den Datenbank-Port des Servers"
run "tcp_test $SERVER 5432"
note "Tunnel aufbauen: lokaler Port $LOCALPORT -> 127.0.0.1:5432 auf dem Server"
echo "\$ ssh -f -N -o ExitOnForwardFailure=yes -L $LOCALPORT:127.0.0.1:5432 $KONTO@$SERVER" | clean
ssh -f -N -o ExitOnForwardFailure=yes -L "$LOCALPORT:127.0.0.1:5432" "$KONTO@$SERVER"
echo "Tunnel-Start Exit-Code: $?"; echo
sleep 2
run "tcp_test 127.0.0.1 $LOCALPORT"
note "Abfrage durch den Tunnel (psql-Client im Wegwerf-Container)"
run "docker run --rm -e PGPASSWORD $IMAGE psql -h host.docker.internal -p $LOCALPORT -U postgres -c \"SELECT current_user AS benutzer, current_setting('server_version') AS version;\""

unset PGPASSWORD
# Tunnel wieder schliessen (ssh.exe mit genau dieser Weiterleitung beenden)
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='ssh.exe'\" | Where-Object { \$_.CommandLine -match '$LOCALPORT:127.0.0.1:5432' } | ForEach-Object { Stop-Process -Id \$_.ProcessId }" >/dev/null 2>&1
note "Tunnel geschlossen"
run "tcp_test 127.0.0.1 $LOCALPORT"

exec 1>&3
echo "Fertig. Dateien in $OUT:"
ls -1 "$OUT"
echo "Falls der Tunnel noch offen ist: im Task-Manager den Prozess ssh.exe beenden."
