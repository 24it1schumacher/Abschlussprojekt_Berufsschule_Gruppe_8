# PostgreSQL-Datenbankschema

**Ziel:** Schrittweise SQL-Grundlage für die Maschinenverleih-Anwendung aus der ERD-Skizze und den User Stories. Das Schema ist auf PostgreSQL ausgelegt und so strukturiert, dass jede Datei einzeln und in der angegebenen Reihenfolge ausgeführt werden kann.

## Vor dem Ausführen

- Erst in einer **leeren Entwicklungsdatenbank** testen und ein Backup erstellen, bevor die Skripte auf einer Datenbank mit wichtigen Daten laufen.
- Datenbank `maschinenverleih` und Rolle `maschinenverleih_app` müssen bereits angelegt sein. Das Backend darf Tabellen und Datenbank nicht beim Start automatisch erzeugen.
- In diesem Repository existiert `001_create_app_message.sql` als frühes API-Testbeispiel. Es erstellt nur `app_message`; es ist **nicht** das fachliche Maschinenverleih-Schema.
- `002_enable_btree_gist.sql` benötigt Rechte zum Installieren der PostgreSQL-Erweiterung. Führe diese eine Datei mit dem Datenbank-Administrator aus. Die übrigen Dateien erstellt die Anwendungsrolle.
- Jede Datei enthält eine Transaktion. Bei einem Fehler bricht `psql` mit `ON_ERROR_STOP` ab. Behebe den Fehler und führe nur die nicht erfolgreich abgeschlossene Datei erneut aus.
- Niemals echte Passwörter in SQL-Dateien, Git oder Logs schreiben.

## SQL-Dateien der Reihe nach ausführen

Führe die Befehle aus dem Repository-Stammverzeichnis aus. `psql` fragt nach dem Passwort des jeweiligen Datenbankbenutzers.

### 1. Reservierungsüberschneidungen absichern

Als Datenbank-Administrator:

```bash
psql -h 127.0.0.1 -U postgres -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/002_enable_btree_gist.sql
```

Die Erweiterung `btree_gist` ermöglicht es PostgreSQL, für dieselbe Maschine zeitlich überlappende aktive Reservierungen mit einer Exclusion Constraint zuverlässig zurückzuweisen.

### 2. Kunden und Benutzerrollen

Als Anwendungsrolle:

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/003_customers_and_access.sql
```

### 3. Maschinen, Ersatzteile und Verbrauchsmaterial

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/004_machines_and_inventory.sql
```

### 4. Wartungspläne und Wartungshistorie

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/005_maintenance.sql
```

Die Sicht `machine_maintenance_status` liefert `NOT_CONFIGURED`, `OK`, `DUE_SOON` oder `OVERDUE`. Ein Status ist erst berechenbar, wenn Wartungsplan und mindestens ein Wartungsdatensatz vorhanden sind.

### 5. Reservierungen, Ausleihen/Aufträge und Audit-Protokoll

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/006_reservations_rentals_and_audit.sql
```

### 6. Rechnungen, Positionen und Zahlungen

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/007_invoices_and_payments.sql
```

`invoice_payment_status` berechnet den offenen Betrag und den Zahlstatus aus Positionen und Zahlungseingängen. Ein Status wird nicht zusätzlich gespeichert, damit er nicht von den zugrunde liegenden Beträgen abweichen kann.

### 7. Kundenbestellungen für Verbrauchsmaterial

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/008_customer_material_orders.sql
```

### 8. Lieferanten und Beschaffung

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -v ON_ERROR_STOP=1 -f app/backend/src/main/resources/db/009_suppliers_and_purchase_orders.sql
```

## Kurz prüfen

Nach erfolgreicher Ausführung:

```bash
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -c "\dt"
psql -h 127.0.0.1 -U maschinenverleih_app -d maschinenverleih -W -c "\dv"
```

Du solltest unter anderem Tabellen für Kunden, Maschinen, Reservierungen, Ausleihen, Rechnungen und Zahlungen sowie die Sichten `machine_maintenance_status` und `invoice_payment_status` sehen. Das Startgerüst kann weiterhin die unabhängige Tabelle `app_message` für seinen API-Test benutzen.

## Relationale Regeln und Korrekturen der ERD-Skizze

- **Maschinentyp 1:n Maschine:** Typdaten wie Bezeichnung und Tagesmietpreis stehen einmal in `machine_type`; Seriennummer, Betriebsstunden und Zustand je Maschine in `machine`.
- **Kunde 1:n Reservierung:** Die Kunden-ID wird in der Reservierung gespeichert. Eine aktive Reservierung referenziert genau eine Maschine.
- **Reservierung 1:0..1 Ausleihe/Auftrag:** `rental.reservation_id` ist eindeutig; damit kann eine Reservierung höchstens einmal in einen Auftrag überführt werden. Eine Maschine kann über die Reservierung mehrere Ausleihen über die Zeit haben.
- **Überbuchung:** Aktive, zeitlich überlappende Reservierungen derselben Maschine werden durch PostgreSQL verhindert. Intervalle sind halboffen (`[Start, Ende)`), sodass eine Buchung direkt bei Ende der vorherigen beginnen darf.
- **Rechnung und Kunde:** Die Kundenzuordnung ergibt sich über Reservierung und Auftrag. Die Rechnung speichert stattdessen einen bewusst eingefrorenen Rechnungsempfänger-Snapshot; dadurch ändern sich historische Rechnungsadressen nicht, wenn ein Kundenstammsatz aktualisiert wird.
- **Rechnung 1:n Positionen und Rechnung 1:n Zahlungen:** Zahlungseingänge gehören zur Rechnung, nicht zu einer einzelnen Rechnungsposition. Teilzahlungen sind dadurch möglich. Korrekturrechnungen verweisen auf die Ursprungsrechnung und bleiben beim selben Auftrag.
- **Wartung und Bestand:** Ersatzteile und Verbrauchsmaterial sind getrennte Entitäten; M:n-Verwendungen in Wartungsplänen und Wartungsdatensätzen liegen in Verbindungstabellen mit Menge.
- **Bestellungen:** Kundenbestellungen für Verbrauchsmaterial und Lieferantenbestellungen zur Beschaffung sind unterschiedliche Vorgänge und werden deshalb getrennt modelliert.

Die Tabellen enthalten keine berechneten Rechnungs- oder Zahlstatus-Felder und wiederholen keine Kunden-ID in Auftrag und Rechnung. Preis-, Steuer- und Empfängerwerte in Auftrags-/Rechnungspositionen sind absichtlich **historische Snapshots**: sie müssen den damaligen Vertrags- oder Rechnungsstand erhalten, auch wenn sich heutige Stammdaten ändern.

## Wichtige weitere Umsetzungspunkte

Das Schema ist eine belastbare Grundlage, aber noch keine fertige Produktionsdatenbank:

- SQL-Dateien werden derzeit manuell versioniert und ausgeführt. Vor Team- oder Produktionseinsatz sollte ein Migrationstool mit explizitem Aufruf eingeführt werden; automatische Schemaänderung beim Serverstart bleibt deaktiviert.
- `maschine_type_material` dokumentiert die erlaubten Materialien. Beim Anlegen einer Kundenbestellung muss das Backend zusätzlich innerhalb derselben Transaktion prüfen, dass Material zum Maschinentyp der verknüpften Ausleihe passt.
- Lagerbestand darf bei einer Bestellung nicht durch „erst lesen, dann schreiben“ verringert werden. Das Backend muss die Prüfung und Bestandsänderung atomar in einer Transaktion durchführen; dafür sollte eine eigene Bestell-/Lagerregel ergänzt werden, bevor Bestellungen umgesetzt werden.
- Produktive Zugangsdaten sollten eine eingeschränkte Laufzeitrolle verwenden. Migrationen und Schemaänderungen sollten mit einer getrennten Eigentümer-/Migrationsrolle erfolgen; das Startgerüst verwendet derzeit noch dieselbe Rolle für lokale Entwicklung.
- Vor einem echten produktiven Rechnungsbetrieb müssen Pflichtangaben, Aufbewahrung, Korrektur/Storno und steuerliche Regeln fachlich geprüft werden. Die Tabellen allein belegen keine Rechtskonformität.
- Die ERD-Skizze legt nicht fest, ob Kunden mehrere Adressen haben, welche genauen Excel-Felder importiert werden, wie Mietpreise/Rabatte berechnet werden, welche Wartungsarten existieren, oder wie Rückgabe, Teilzahlung, Storno und Bestandsreservierung fachlich ablaufen. Diese Regeln muss das Team vor den entsprechenden Features bestätigen.

Dieses Schema ist kein Ersatz für Backups. Teste die Migrationen und Wiederherstellung zuerst mit einer separaten Entwicklungsdatenbank.
