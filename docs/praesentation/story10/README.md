# Screenshots – Story 10 (PostgreSQL im Container)

Echte Terminal-Ausgaben aus dem lokalen Probelauf am 25.11.2026 (Docker 29.1.3, Windows).
Grün = erwartetes Ergebnis, Rot = gewollt blockiert, Gelb = Container-IDs zum Vergleichen.
Die LAN-IP ist durch `<LAN-IP>` ersetzt. `nur-lokaler-test` in Bild 07 ist ein Wegwerf-Passwort für den lokalen Test.

| Bild | Aussage | Akzeptanzkriterium |
|---|---|---|
| `00b_compose_ausschnitt.png` | Die Konfiguration auf einen Blick | alle |
| `00_compose_yaml.png` | Komplette Datei mit Kommentaren (Backup-Folie) | alle |
| `01_start.png` | Feste Version 17.11, Container healthy | Version, reproduzierbar |
| `02_ohne_passwort.png` | Ohne Passwort bricht Compose ab, kein Container | Zugangsdaten |
| `03_kein_autoschema.png` | Nach dem Start nur Systemdatenbanken | Kein Auto-Schema |
| `04_persistenz.png` | Neue Container-ID, Daten noch da | Persistenz |
| `05_port.png` | 5432 nur auf 127.0.0.1, über LAN-IP zu | Nicht öffentlich |
| `06_internes_netz.png` | `SELECT 1` im internen Netz, Gegenprobe ohne Netz | Verbindungstest |
| `07_schema.png` | Schema 002–010 eingespielt, 27 Tabellen der App-Rolle | Explizite Einrichtung |
| `08_haertung.png` | no-new-privileges, Log-Rotation, Restart-Policy | Härtung (Zusatz) |
| `09_secrets_git.png` | `.env` ignoriert, nur Vorlage versioniert | Zugangsdaten |

Vorschlag für 5 Minuten: 00b → 02 → 04 → 05 (+ 07 als Brücke zur Anwendung).
Noch offen auf dem VPS: `ss`/`iptables`/`nmap` von außen und SSH-Tunnel.
