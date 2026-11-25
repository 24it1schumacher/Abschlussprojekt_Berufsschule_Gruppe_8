# Anleitung – PostgreSQL im Docker-Container auf dem VPS

**Bezug:** User Story 10 / [Issue #14](https://github.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8/issues/14) – PostgreSQL im Docker-Container auf dem VPS bereitstellen
**Voraussetzungen:** #13 (PostgreSQL ausgewählt), #34 (Docker installiert), #3 (Server gehärtet)
**Dateien:** [`infra/postgres/compose.yaml`](../infra/postgres/compose.yaml), [`infra/postgres/.env.example`](../infra/postgres/.env.example)

Die Anleitung beschreibt die Bereitstellung und liefert zu jedem Akzeptanzkriterium einen
Nachweis. Platzhalter: `<server>` = IP oder Hostname des VPS, `<si-konto>` / `<ae-konto>` =
persönliche Konten aus der [SSH-Anleitung](anleitung_ssh_zugang.md).

> Keine Passwörter, echten IP-Adressen oder Hostnamen in Screenshots, Logs oder Commits übernehmen.

---

## 1. Entscheidungen

| Thema | Entscheidung | Begründung | Alternative |
|---|---|---|---|
| Image | `postgres:17.11-trixie` (feste Version) | Reproduzierbar: jeder Start nutzt dasselbe Image. Ein Update ist eine bewusste Änderung per Pull Request. | `postgres:latest` → wechselt unbemerkt die Version, bei Major-Sprung startet die DB mit alten Daten nicht mehr |
| Speicher | Benanntes Volume `maschinenverleih-postgres-data` | Daten liegen außerhalb des Containers und überleben Löschen und Neuerstellen | Bind-Mount auf einen Host-Ordner (Rechte/Besitzer aufwendiger) |
| Netzwerk | Port nur an `127.0.0.1` gebunden, Zugriff per SSH-Tunnel | Docker umgeht ufw (siehe Abschnitt 6). Loopback ist von außen nie erreichbar. | Gar kein `ports:` → Entwickler bräuchten einen Container im selben Netz; VPN (WireGuard) → mehr Aufwand |
| Zugangsdaten | `.env` neben der Compose-Datei, Rechte `600`, in `.gitignore` | Passwort nie im Repository; ohne Passwort bricht der Start mit klarer Meldung ab | Docker Secrets (`POSTGRES_PASSWORD_FILE`) → Passwort auch nicht in `docker inspect` sichtbar, möglicher nächster Schritt |
| Schema | Kein `POSTGRES_DB`, keine Init-Skripte | Story verlangt: Datenbank und Schema werden ausdrücklich angelegt, nicht nebenbei | Init-Skripte in `/docker-entrypoint-initdb.d` → laufen still beim ersten Start |
| Härtung | `no-new-privileges`, Log-Größe begrenzt | Keine Rechteausweitung im Container; Logs füllen die Platte nicht | — |

---

## 2. Dateien auf den Server bringen

Auf dem eigenen PC aus dem Repository-Stammverzeichnis:

```bash
ssh <si-konto>@<server> "mkdir -p ~/maschinenverleih/postgres"
scp infra/postgres/compose.yaml infra/postgres/.env.example <si-konto>@<server>:~/maschinenverleih/postgres/
```

Auf dem Server:

```bash
cd ~/maschinenverleih/postgres
cp .env.example .env
chmod 600 .env
openssl rand -base64 32      # Ausgabe als POSTGRES_ADMIN_PASSWORD in .env eintragen
nano .env
ls -l .env                   # Erwartet: -rw------- (nur der Besitzer darf lesen)
```

Das Passwort im Passwortmanager ablegen, nicht im Chat oder Repository.

---

## 3. Image prüfen und Datenbank starten

```bash
docker compose pull          # Prüft, ob die festgelegte Version existiert
docker compose up -d
docker compose ps            # Erwartet: STATUS "Up ... (healthy)"
docker compose logs postgres | tail -n 20
```

Erwartet im Log: `database system is ready to accept connections`.

Falls `pull` meldet, dass das Tag nicht existiert: auf Docker Hub (`hub.docker.com/_/postgres`, Reiter *Tags*)
die aktuelle 17er-Version nachsehen und in `compose.yaml` anpassen.

---

## 4. Anwendungsdatenbank ausdrücklich anlegen

```bash
docker compose exec postgres psql -U postgres -d postgres
```

In `psql`:

```sql
CREATE ROLE maschinenverleih_app LOGIN;
\password maschinenverleih_app
CREATE DATABASE maschinenverleih OWNER maschinenverleih_app;
\l
\du
\q
```

`\password` fragt das Passwort verdeckt ab, es erscheint dadurch nicht in der psql-Historie.

**Optional: Schema aus dem Repository einspielen.** Die SQL-Dateien unter
`app/backend/src/main/resources/db/` per `scp` in einen Ordner `~/maschinenverleih/db/` kopieren
und dann der Reihe nach ausführen. `002` braucht Administratorrechte (Erweiterung), alle anderen
laufen als Anwendungsrolle:

```bash
cd ~/maschinenverleih/postgres
docker compose exec -T postgres psql -U postgres -d maschinenverleih -v ON_ERROR_STOP=1 < ../db/002_enable_btree_gist.sql
for f in ../db/00[3-9]_*.sql ../db/010_*.sql; do
  echo "== $f"
  { echo "SET ROLE maschinenverleih_app;"; cat "$f"; } \
    | docker compose exec -T postgres psql -U postgres -d maschinenverleih -v ON_ERROR_STOP=1 || break
done
docker compose exec postgres psql -U postgres -d maschinenverleih -c "\dt"   # Owner: maschinenverleih_app
```

`SET ROLE` vor jeder Datei sorgt dafür, dass die Anwendungsrolle Eigentümerin der Tabellen wird,
obwohl die Verbindung als Administrator läuft. Eine direkte Anmeldung als Anwendungsrolle würde
eine Passwortabfrage brauchen, und die funktioniert nicht, wenn die SQL-Datei per Pipe hineinläuft.
Die Schritte im Detail stehen in [datenbankmodell_postgresql.md](datenbankmodell_postgresql.md).

---

## 5. Nachweise zu den Akzeptanzkriterien

Tipp für die Präsentation: Ausgaben mit `| tee -a ~/nachweis_story10.log` mitschreiben und
vor dem Screenshot IP-Adressen schwärzen.

### 5.1 Feste Version, reproduzierbarer Start

```bash
docker compose config --images          # Erwartet: postgres:17.11-trixie
docker compose exec postgres psql -U postgres -tAc "SELECT version();"
```

### 5.2 Ohne Passwort kein Start

```bash
mv .env .env.bak
docker compose up -d
mv .env.bak .env
```

Erwartete Meldung (der Container wird gar nicht erst erstellt):

```text
required variable POSTGRES_ADMIN_PASSWORD is missing a value: POSTGRES_ADMIN_PASSWORD fehlt - in infra/postgres/.env setzen (siehe .env.example)
```

### 5.3 Daten bleiben erhalten (Persistenz)

```bash
docker compose exec postgres psql -U postgres -c \
  "CREATE TABLE IF NOT EXISTS nachweis_persistenz (id serial, notiz text, erstellt timestamptz DEFAULT now());
   INSERT INTO nachweis_persistenz (notiz) VALUES ('vor dem Neuerstellen');"
docker compose ps -q postgres                  # Container-ID notieren

docker compose down                            # Container und Netz weg, Volume bleibt
docker volume ls | grep maschinenverleih       # Volume ist noch da
docker compose up -d --wait

docker compose ps -q postgres                  # Neue Container-ID
docker compose exec postgres psql -U postgres -c "SELECT * FROM nachweis_persistenz;"
```

Erwartet: andere Container-ID, aber die Zeile „vor dem Neuerstellen“ ist noch vorhanden.
Danach aufräumen: `DROP TABLE nachweis_persistenz;`

> Nie `docker compose down -v` verwenden: `-v` löscht das Volume und damit alle Daten.

### 5.4 Port 5432 ist nicht öffentlich erreichbar

Auf dem Server:

```bash
sudo ss -tlnp | grep 5432                      # Erwartet: 127.0.0.1:5432, NICHT 0.0.0.0:5432
docker compose port postgres 5432              # Erwartet: 127.0.0.1:5432
sudo iptables -t nat -L DOCKER -n | grep 5432  # DNAT-Regel nur für 127.0.0.1
```

Vom eigenen PC (von außen):

```bash
nmap -Pn -p 22,5432 <server>
```

Erwartet: `22/tcp open ssh` (Gegenprobe, der Server ist erreichbar) und `5432/tcp filtered` oder `closed`.

### 5.5 Verbindungstest aus dem internen Netz

Ein Wegwerf-Container im selben Docker-Netz verbindet sich über den Dienstnamen `postgres`:

```bash
docker run --rm -it --network maschinenverleih-db-intern postgres:17.11-trixie \
  psql -h postgres -U postgres -d postgres -c "SELECT 1 AS verbindung_ok;"
```

Nach Eingabe des Admin-Passworts erwartet: eine Zeile `verbindung_ok = 1`.
`--rm` löscht den Test-Container danach wieder.

Gegenprobe ohne das interne Netz (der Name `postgres` ist dort unbekannt):

```bash
docker run --rm postgres:17.11-trixie pg_isready -h postgres -t 3   # Erwartet: "no response", Exit-Code 2
```

### 5.6 Zugriff für die Anwendungsentwicklung per SSH-Tunnel

Auf dem PC des Entwicklers:

```bash
ssh -N -L 5433:127.0.0.1:5432 <ae-konto>@<server>
```

`-L 5433:127.0.0.1:5432` leitet Port 5433 des eigenen PCs verschlüsselt an `127.0.0.1:5432` auf
dem Server weiter. 5433 statt 5432, damit es keinen Konflikt mit einer lokalen Datenbank gibt.
Das Backend nutzt dann:

| Variable | Wert |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/maschinenverleih` |
| `DB_USERNAME` | `maschinenverleih_app` |
| `DB_PASSWORD` | Passwort der Anwendungsrolle (sicher übergeben, nicht per Chat) |

Test: `GET http://localhost:8080/api/health/database` liefert eine erfolgreiche Antwort.

### 5.7 Schema wird nicht automatisch angelegt

```bash
docker compose exec postgres psql -U postgres -c "\l"
```

Direkt nach dem ersten Start gibt es nur `postgres`, `template0` und `template1`. Die Datenbank
`maschinenverleih` existiert erst nach Abschnitt 4. Im Backend verhindert
`spring.sql.init.mode=never` zusätzlich, dass SQL-Dateien beim Start laufen.

---

### 5.8 Alle Nachweise automatisch erfassen (für die Präsentation)

Zwei Skripte führen die Nachweise aus und speichern die Ausgaben als Textdateien. Server-IP,
Hostname und Kontoname werden dabei durch Platzhalter ersetzt; Passwörter erscheinen nie.

**Auf dem Server** (im Ordner mit `compose.yaml` und `.env`, Skript vorher per `scp` kopieren):

```bash
bash nachweise_server.sh
```

Es erfasst 01–08, 10 (`.env`-Rechte) und 11 (Volume). Dabei wird der Container einmal kurz neu
erstellt (Persistenztest); das Volume bleibt immer erhalten. Danach die Dateien holen:

```bash
scp -r <si-konto>@<server>:~/maschinenverleih/postgres/nachweise_vps infra/postgres/
```

**Auf dem eigenen PC** (Git Bash, Repository-Stammverzeichnis) für die Tests von außen:

```bash
bash infra/postgres/nachweise_extern.sh <server> <ssh-konto>
```

Es erfasst 12 (Portscan von außen; ohne installiertes nmap ein einfacher TCP-Test) und 13
(SSH-Tunnel auf Port 5433, Abfrage hindurch, Tunnel wieder geschlossen). Das Datenbank-Passwort
wird verdeckt abgefragt.

**Bilder erzeugen** (Chrome und Python mit Pillow nötig):

```bash
python infra/postgres/nachweise_rendern.py infra/postgres/nachweise_vps docs/praesentation/story10_vps infra/postgres/compose.yaml "VPS"
```

Der Ordner `infra/postgres/nachweise_vps/` steht in der `.gitignore`. Die Textdateien vor dem
Weitergeben kurz durchsehen.

---

## 6. Hintergrund: Warum Docker die ufw-Regeln umgeht

ufw filtert Pakete in der `INPUT`-Kette von iptables, also Pakete *an den Host*. Docker setzt
für veröffentlichte Ports eigene Regeln in der `nat`-Tabelle (`DOCKER`-Kette, DNAT). Ein Paket
an Port 5432 wird dadurch schon vor der Filterung auf die Container-IP umgeschrieben und läuft
über die `FORWARD`-Kette weiter. Die `INPUT`-Regeln von ufw sieht es nie.

Folge: `ports: - "5432:5432"` (ohne IP = `0.0.0.0`) wäre trotz `ufw deny 5432` aus dem Internet
erreichbar. Deshalb bindet die Compose-Datei ausdrücklich an `127.0.0.1`.

---

## 7. Betrieb

| Aufgabe | Befehl |
|---|---|
| Status | `docker compose ps` |
| Logs | `docker compose logs -f postgres` |
| Stoppen (Daten bleiben) | `docker compose down` |
| Starten | `docker compose up -d` |
| Version aktualisieren | Tag in `compose.yaml` per Pull Request ändern, dann `docker compose pull && docker compose up -d` |

Nur Minor-Updates (17.x → 17.y) funktionieren so. Ein Major-Wechsel (17 → 18) braucht
`pg_dump`/`pg_upgrade` und ein Backup vorher.

## 8. Lokaler Probelauf (25.11.2026)

Vor dem Einsatz auf dem VPS wurde die Compose-Datei unverändert auf einem Windows-PC mit Docker
Desktop (Docker 29.1.3) getestet. Ergebnisse:

| Nachweis | Ergebnis |
|---|---|
| 5.1 Version | `PostgreSQL 17.11 (Debian 17.11-1.pgdg13+2)`, Container `healthy` |
| 5.2 Ohne Passwort | Abbruch mit der eigenen Meldung, Exit-Code 1, kein Container erstellt |
| 5.3 Persistenz | Container-ID `0ea7d90e0d5d` → `47e7c2422f6c`, Testzeile weiterhin vorhanden |
| 5.4 Port | Lauscht nur auf `127.0.0.1:5432`; über die LAN-IP des PCs nicht erreichbar |
| 5.5 Internes Netz | `verbindung_ok = 1`; Gegenprobe ohne Netz: `no response` |
| 5.7 Kein Auto-Schema | Nach dem Start nur `postgres`, `template0`, `template1` |
| Schema 002–010 | Alle Schritte fehlerfrei, 27 Tabellen, Eigentümer `maschinenverleih_app` |
| Härtung | `no-new-privileges:true`, Log-Rotation `10m × 3` laut `docker inspect` |

Auf dem VPS noch offen: `ss`, `iptables` und `nmap` von außen (5.4) sowie der SSH-Tunnel (5.6).

## 9. Grenzen und nächste Schritte

- Kein Backup in dieser Story; Backup und Restore folgen in Story 25 / 30.
- Passwort steht als Umgebungsvariable im Container (`docker inspect` als Root zeigt es). Ausbaustufe: Docker Secrets mit `POSTGRES_PASSWORD_FILE`.
- Die Image-Version ist als Tag festgelegt, nicht als Digest (`@sha256:…`). Ein Digest wäre noch strenger reproduzierbar.
- Kein Monitoring; folgt in Story 13.
