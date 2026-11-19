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
| `BOOTSTRAP_ADMIN_EMAIL` | Nur einmalig beim ersten Erstellen des Admin-Kontos |
| `BOOTSTRAP_ADMIN_PASSWORD` | Nur einmalig; mindestens 12 Zeichen |
| `COOKIE_SECURE` | In lokaler HTTP-Entwicklung `false`; bei HTTPS in Produktion `true` |

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

## Kern-API und erste Anmeldung

Die API kann Kunden, Konten, Maschinentypen, Standorte und Maschinen verwalten. Kunden können nach verfügbaren Maschinen suchen und Reservierungsanfragen stellen. Ein Mitarbeiter kann eine Anfrage bestätigen; dabei werden Reservierung, eindeutige Auftragsnummer und unveränderbarer Audit-Eintrag gemeinsam gespeichert. Kunden sehen über ihre Anmeldung nur ihre eigenen Reservierungen und Aufträge. Eine bestätigte Reservierung erzeugt genau einen Auftrag.

Vor dem ersten Start mit der neuen API müssen die nummerierten SQL-Schritte 003 bis 010 in Reihenfolge ausgeführt sein. Schritt 010 ergänzt das Feld für den Passwortwechsel; das Backend führt diese Dateien absichtlich **nicht** automatisch aus.

Falls 003 bis 009 bereits ausgeführt wurden, Schritt 010 einmalig aus dem Repository-Stammverzeichnis in PowerShell starten:

```powershell
Get-Content -Raw .\app\backend\src\main\resources\db\010_user_password_change.sql | docker exec -i testdocker-postgres-1 psql -U maschinenverleih_app -d maschinenverleih -v ON_ERROR_STOP=1
```

Für das einmalige erste Administratorkonto die Variablen `BOOTSTRAP_ADMIN_EMAIL` und `BOOTSTRAP_ADMIN_PASSWORD` in der IntelliJ-Run-Konfiguration setzen. Das Passwort muss mindestens 12 Zeichen lang sein. Beim Backendstart wird das Konto nur angelegt, wenn diese E-Mail noch nicht existiert; ein vorhandenes Passwort wird nicht überschrieben. Nach erfolgreicher Anlage die Bootstrap-Variablen wieder aus der Run-Konfiguration entfernen. Beim ersten Login muss das initiale Passwort geändert werden.

Ein Administrator legt Mitarbeiterkonten an. Mitarbeiter legen Kunden und zugehörige Kundenkonten an; für diese Konten wird ein temporäres Passwort vergeben, das beim ersten Login geändert werden muss. Passwörter werden mit PBKDF2 gehasht, Sitzungen verwenden ein HTTP-only-Cookie und schreibende API-Aufrufe werden mit CSRF-Token geschützt. Die Entwicklungs-API ist kein produktionsreifes Authentifizierungs- oder Compliance-System; vor einem öffentlichen Betrieb sind unter anderem HTTPS, Betriebs-/Sicherheitsprüfung und weitere Anforderungen umzusetzen.

Die REST-Schnittstelle ist in [`openapi.yaml`](openapi.yaml) beschrieben. Die TypeScript-Funktionen und Datentypen für Anmeldung, Kunden, Maschinen, Reservierungen und Aufträge liegen in `frontend/src/api.ts`. Vite sendet Sitzungs-Cookies mit und holt für schreibende Anfragen ein CSRF-Token.

## Aktueller Beispielablauf

- `GET http://localhost:8080/api/health` prüft, ob das Backend antwortet.
- `GET http://localhost:8080/api/health/database` führt `SELECT 1` gegen PostgreSQL aus.
- Nach der Anmeldung listet `GET http://localhost:8080/api/messages` gespeicherte Testnachrichten.
- `POST http://localhost:8080/api/messages` legt eine Testnachricht an. Der Request enthält JSON wie `{"text":"Erste Testnachricht"}`.
- Die Beispieloberfläche bietet Anmeldung, Passwortwechsel und Abmeldung. Die übrigen Fach-API-Funktionen werden über den TypeScript-API-Client aufgerufen; vollständige Verwaltungsformulare sind noch nicht umgesetzt.
- Die vollständigen Schnittstellen sind in [`openapi.yaml`](openapi.yaml) dokumentiert.

Der Browser spricht ausschließlich mit dem Java-Backend. Nur das Backend erhält PostgreSQL-Zugangsdaten und greift mit JDBC auf die Datenbank zu.

Der aktuelle Backend-Ausbau deckt den Startablauf für Kunden, Maschinen, Reservierungen, Aufträge und Rollen ab. Wartungshistorie/Statusberechnung, Stornoregeln, Excel-Import, Rechnungen, Zahlungen und Shop sind noch nicht als Anwendungsfunktionen umgesetzt. Das System ist noch nicht produktionsreif: Backups, Betriebsabsicherung, HTTPS-Konfiguration und eine fachliche Prüfung der Datenschutz-/Rechnungsanforderungen bleiben notwendig. Den Entwicklungsserver und die Beispiel-API nicht ungeschützt öffentlich bereitstellen.
