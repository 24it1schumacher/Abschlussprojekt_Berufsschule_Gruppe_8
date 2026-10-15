# Anwendung

## Technologieauswahl

- Frontend: TypeScript mit Vite als Entwicklungsserver und Build-Werkzeug
- Backend: Java 21 mit Spring Boot und JDBC
- Datenbank: PostgreSQL
- Schnittstellen: REST über HTTP/JSON zwischen Frontend und Backend; JDBC/SQL zwischen Backend und PostgreSQL

Spring Boot und Vite sind ein erster technischer Startpunkt, keine zusätzliche Teamentscheidung über Frameworks. Die gewählten Werkzeuge können nach gemeinsamer Abstimmung angepasst werden.

## Voraussetzungen

- JDK 21
- Apache Maven 3.9 oder neuer (alternativ Maven-Unterstützung in IntelliJ IDEA)
- Node.js 20.19 oder neuer und npm
- Docker Engine und Docker Compose für die lokale PostgreSQL-Entwicklungsinstanz

## Starten in IntelliJ IDEA

1. Das Repository öffnen.
2. `backend/pom.xml` als Maven-Projekt laden und `de.gruppe8.maschinenverleih.MaschinenverleihApplication` starten.
3. Im Terminal in `app/frontend` `npm install` und danach `npm run dev` ausführen.
4. Die Frontend-Adresse aus der Terminalausgabe im Browser öffnen.

Vor dem Start des Backends PostgreSQL-Zugangsdaten als Umgebungsvariablen der Run-Konfiguration oder der Shell setzen:

| Variable | Beispiel für lokale Entwicklung |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/maschinenverleih` |
| `DB_USERNAME` | `maschinenverleih_app` |
| `DB_PASSWORD` | Lokal gesetztes Passwort, niemals ins Repository committen |
| `FRONTEND_ORIGIN` | `http://localhost:5173` |

Für eine PowerShell-Sitzung können die Werte so gesetzt werden (Passwort durch euer lokales Passwort ersetzen):

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/maschinenverleih"
$env:DB_USERNAME = "maschinenverleih_app"
$env:DB_PASSWORD = "LOKALES_PASSWORT"
$env:FRONTEND_ORIGIN = "http://localhost:5173"
```

Wenn dein vorhandener Container `testdocker-postgres-1` den Host-Port `5432` veröffentlicht, ist `localhost:5432` die richtige Adresse, solange du das Backend direkt aus IntelliJ auf diesem Rechner startest. Die Containerbezeichnung ist dann nicht Teil der URL. Nur wenn das Backend selbst in einem Container im selben Docker-Netzwerk läuft, verwendest du den dort erreichbaren Dienstnamen statt `localhost`.

In IntelliJ gehören dieselben Variablen in **Run/Debug Configurations → Environment variables**. `DB_URL`, `DB_USERNAME` und `DB_PASSWORD` müssen zu den Datenbanknamen, Rollen und Passwörtern passen, mit denen der laufende Container initialisiert wurde. Keine echten Zugangsdaten in `application.properties`, `.env.example` oder andere versionierte Dateien schreiben.

### Vorhandenen PostgreSQL-Container für den Anwendungstest vorbereiten

Prüfe zunächst die Portfreigabe:

```bash
docker ps --filter name=testdocker-postgres-1 --format "table {{.Names}}\t{{.Ports}}"
```

Öffne danach eine PostgreSQL-Sitzung im vorhandenen Container (falls der Administrator anders heißt als `postgres`, ersetze den Benutzernamen):

```bash
docker exec -it testdocker-postgres-1 psql -U postgres -d postgres
```

In `psql` kannst du mit `\du` prüfen, ob die Anwendungsrolle bereits existiert. Falls nicht, erstelle sie; setze anschließend ein eigenes Passwort:

```sql
CREATE ROLE maschinenverleih_app LOGIN;
\password maschinenverleih_app
```

Lege die Datenbank nur an, wenn sie noch nicht vorhanden ist:

```sql
CREATE DATABASE maschinenverleih OWNER maschinenverleih_app;
\q
```

`CREATE DATABASE` darf nicht innerhalb eines SQL-`BEGIN`/`COMMIT` ausgeführt werden. Wenn Rolle oder Datenbank schon existieren, lege sie nicht ein zweites Mal an; prüfe mit `\du` bzw. `\l` und verwende die vorhandenen Daten. `\password maschinenverleih_app` kann auch zum Ändern des Passworts einer vorhandenen Rolle verwendet werden. Setze den Rolle-Passwortwert in IntelliJ als `DB_PASSWORD`.

Der Datenbank-Verbindungstest des Backends ist `GET http://localhost:8080/api/health/database`; er führt `SELECT 1` aus und braucht noch keine Anwendungstabelle. Für das erste gespeicherte Beispiel muss `app_message` einmalig manuell erstellt werden. Unter PowerShell führst du den SQL-Schritt aus dem Repository-Hauptordner so aus:

```powershell
Get-Content -Raw app/backend/src/main/resources/db/001_create_app_message.sql | docker exec -i testdocker-postgres-1 psql -U postgres -d maschinenverleih
```

Ersetze `postgres` ggf. durch den Administratorbenutzer deines Containers. Wenn das Frontend läuft, zeigt es nach erfolgreicher Verbindungsprüfung „Backend und PostgreSQL sind erreichbar“ an; über das Formular kannst du dann eine Testnachricht anlegen und anschließend wieder aus der Datenbank lesen. Fehlt nur die Beispieltabelle, weist die Oberfläche gesondert auf SQL-Schritt 001 hin.

## PostgreSQL lokal mit Docker starten

Im Ordner `app` liegt eine Compose-Datei für die lokale Entwicklung:

```powershell
cp .env.example .env
```

Unter PowerShell lautet der Kopierbefehl `Copy-Item .env.example .env`. Setze in `.env` ein eigenes starkes `POSTGRES_ADMIN_PASSWORD` und starte dann aus `app`:

```bash
docker compose up -d postgres
```

Der Port ist nur an `127.0.0.1` des Entwicklungsrechners gebunden. Der Container richtet ausschließlich den PostgreSQL-Administrationszugang und die Systemdatenbank `postgres` ein – nicht die Anwendungsdatenbank oder deren Schema. Das Volume `postgres-data` bewahrt Daten bei einem Container-Neustart.

Lege Anwendungsrolle und Anwendungsdatenbank einmalig und ausdrücklich an:

```bash
docker compose exec postgres psql -U postgres -d postgres
```

In der `psql`-Eingabeaufforderung:

```sql
CREATE ROLE maschinenverleih_app LOGIN;
\password maschinenverleih_app
CREATE DATABASE maschinenverleih OWNER maschinenverleih_app;
\q
```

`\password` fragt das Anwendungspasswort verdeckt ab. Verwende dieses Passwort anschließend als `DB_PASSWORD` in der Backend-Run-Konfiguration.

## Datenbankschema explizit vorbereiten

Das Backend legt weder die Datenbank noch Tabellen automatisch an. `spring.sql.init.mode=never` verhindert das automatische Ausführen von SQL-Dateien beim Start. Eine berechtigte Person legt Datenbank und Anwendungsrolle nach dem vereinbarten Betriebsverfahren an. Die Beispieltabelle kann anschließend ausdrücklich ausgeführt werden:

```bash
docker compose exec -T postgres psql -U postgres -d maschinenverleih < backend/src/main/resources/db/001_create_app_message.sql
```

Das Skript wechselt zu Beginn ausdrücklich zur Rolle `maschinenverleih_app`, damit diese Eigentümerin der Tabelle wird. Unter PowerShell kann die Datei so an `psql` weitergereicht werden:

```powershell
Get-Content -Raw backend/src/main/resources/db/001_create_app_message.sql | docker compose exec -T postgres psql -U postgres -d maschinenverleih
```

Diese Tabelle ist nur für den technischen API-Test bestimmt, nicht das fachliche Datenbankschema. Das vollständige, aus ERD und User Stories abgeleitete Schema liegt in den nummerierten SQL-Schritten unter [`db`](backend/src/main/resources/db/) und wird in [PostgreSQL-Datenbankschema](../docs/datenbankmodell_postgresql.md) Schritt für Schritt erklärt. Die lokale Compose-Datei ist für Entwicklung gedacht. Die versionsfeste und abgesicherte VPS-Bereitstellung gehört zur FiSi-Story in [User Stories](../docs/user_stories.md).

## Aktueller Beispielablauf

- `GET http://localhost:8080/api/health` prüft, ob das Backend antwortet.
- `GET http://localhost:8080/api/health/database` führt `SELECT 1` gegen PostgreSQL aus.
- `GET http://localhost:8080/api/messages` listet gespeicherte Beispielnachrichten.
- `POST http://localhost:8080/api/messages` legt eine Nachricht an. Der Request enthält JSON wie `{"text":"Erste Testnachricht"}`.
- Die TypeScript-Oberfläche ruft die Nachrichten-API auf und zeigt die Ergebnisse an.
- Die vollständigen Schnittstellen sind in [`openapi.yaml`](openapi.yaml) dokumentiert.

Der Browser spricht ausschließlich mit dem Java-Backend. Nur das Backend erhält PostgreSQL-Zugangsdaten und greift mit JDBC auf die Datenbank zu.

Das Grundgerüst ist noch nicht produktionsreif: insbesondere vollständige Anmeldung und Berechtigungsprüfung, Backups und Produktionskonfiguration müssen in den dafür vorgesehenen Stories ergänzt werden. Den Entwicklungsserver und die Beispiel-API nicht ungeschützt öffentlich bereitstellen.
