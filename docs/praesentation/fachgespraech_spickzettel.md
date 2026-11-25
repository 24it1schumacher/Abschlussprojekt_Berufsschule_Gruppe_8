# Spickzettel Fachgespräch 26.11.2026 – Lasse Fischer (FiSi)

Präsentation: [`Fachgespraech_Lasse_Fischer_2026-11-26.pptx`](Fachgespraech_Lasse_Fischer_2026-11-26.pptx)
(Folien 1–10 Vortrag, ab Folie 11 Backup; ausführliche Sprechertexte stehen in den Notizen jeder Folie)

## Ablauf und Zeit (5 Minuten)

| Folie | Inhalt | Zeit |
|---|---|---|
| 1 | Titel, App live unter bbk-it-08.de | 0:20 |
| 2 | Vorher → Jetzt | 0:30 |
| 3 | Architektur: ein Eingang, zwei Netze | 0:40 |
| 4 | Datenbank: Version, Volume, 127.0.0.1 | 0:40 |
| 5 | Nachweis Netztrennung und Härtung | 0:30 |
| 6 | CI mit GitHub Actions | 0:30 |
| 7 | Automatisches Deployment (Kern!) | 0:50 |
| 8 | Live und verschlüsselt | 0:30 |
| 9 | Probleme und Lessons Learned | 0:40 |
| 10 | Ergebnis und nächste Schritte | 0:20 |

Zu knapp? Folie 5 und 8 nur kurz zeigen („Nachweis siehe Bild“).

## Die Kernaussage in einem Satz

„Ein Entwickler pusht, GitHub prüft automatisch, und der Server holt sich nur geprüfte Stände selbst – ohne dass jemand einen Schlüssel zum Server bei GitHub hinterlegen muss.“

## Die Bausteine – was, wofür, wo

| Baustein | Was macht er? | Datei |
|---|---|---|
| PostgreSQL 17.11 | Datenbank im Container, Daten im Volume | `infra/postgres/compose.yaml` |
| Backend (Spring Boot) | API, läuft als UID 1000, read-only | `app/backend/Dockerfile` |
| Caddy | Webserver + Reverse Proxy + automatisches TLS | `app/frontend/Dockerfile`, `infra/proxy/Caddyfile` |
| Stack | Alle drei zusammen, zwei Netze | `infra/stack/compose.yaml` |
| CI | Tests und Prüfungen bei jedem Push | `.github/workflows/ci.yml` |
| Deployment | Timer + Skript auf dem Server | `infra/deploy/auto-update.sh`, `*.service`, `*.timer` |
| Einrichtung | Einmalig mit sudo | `infra/deploy/install.sh` |

## Begriffe, die ich erklären können muss

- **Container / Image:** Image = Bauplan (unveränderlich), Container = laufende Instanz. Container sind wegwerfbar.
- **Volume:** Speicher außerhalb des Containers; überlebt `docker compose down`, nur `down -v` löscht es.
- **Mehrstufiger Build (multi-stage):** Erst bauen (Maven/Node), dann nur das Ergebnis in ein schlankes Laufzeit-Image kopieren. Weniger Angriffsfläche.
- **Reverse Proxy:** Nimmt Anfragen von außen an, leitet intern weiter. Ein Eingang, ein Zertifikat, zentrale Sicherheits-Header.
- **Docker-Netz:** Container in verschiedenen Netzen sehen sich nicht, nicht einmal per Name.
- **DNAT / iptables:** Docker schreibt eigene Regeln (nat-Tabelle), Pakete laufen über FORWARD statt INPUT → ufw greift nicht. Deshalb Ports gezielt binden.
- **CI (Continuous Integration):** Automatisch bauen und testen bei jeder Änderung.
- **CD (Continuous Deployment):** Geprüfte Stände automatisch ausrollen.
- **Pull- vs. Push-Deployment:** Pull = Server holt selbst (kein Server-Zugang bei GitHub nötig). Push = GitHub verbindet sich per SSH (Schlüssel als Secret nötig).
- **systemd-Timer:** Wie ein Cronjob, aber mit Protokoll (journalctl), Abhängigkeiten und Härtungsoptionen.
- **ACME / Let's Encrypt:** Automatische, kostenlose Zertifikate. HTTP-01: Let's Encrypt ruft eine Datei über Port 80 ab, um die Domain zu prüfen.
- **HSTS:** Browser merkt sich, nur noch HTTPS zu nutzen.
- **Idempotent:** Mehrfach ausführen → gleicher Zustand. `install.sh` überschreibt keine Passwörter.
- **Rollback:** Bei Fehler zurück auf die vorherige Version.
- **Least Privilege:** Jeder bekommt nur die Rechte, die er braucht (Deploy-Benutzer ohne Login, ohne sudo).

## Befehle, die ich vorführen oder erklären kann

```bash
ssh projektserver
cat /var/lib/maschinenverleih-deploy/status          # was läuft gerade?
tail /var/lib/maschinenverleih-deploy/deploy.log     # was ist passiert?
systemctl list-timers maschinenverleih-deploy.timer  # wann prüft er wieder?
ss -tlnH                                             # welche Ports lauschen?
curl -I https://bbk-it-08.de                         # Header von außen
echo | openssl s_client -connect bbk-it-08.de:443 -servername bbk-it-08.de 2>/dev/null | openssl x509 -noout -issuer -dates
```

## Wahrscheinliche Fragen – Antworten

**Warum PostgreSQL?**
Nutzwertanalyse (#13). Ausschlaggebend: Die Datenbank kann überlappende Reservierungen derselben Maschine selbst verhindern (Exclusion Constraint mit `btree_gist`, Schema 006). Open Source, offizielles Docker-Image.

**Warum Docker?**
Gleiche Umgebung lokal und auf dem Server, reproduzierbar per Datei, Dienste isoliert, leicht neu aufzubauen.

**Warum ist Port 5432 nicht einfach per ufw gesperrt?**
Docker umgeht ufw (DNAT in der nat-Tabelle, Weg über FORWARD). Deshalb bindet die Compose-Datei an `127.0.0.1`. Nachweis: `ss` zeigt 127.0.0.1:5432, von außen keine Verbindung.

**Warum ist Port 80 offen, wenn alles HTTPS ist?**
Let's Encrypt prüft die Domain über Port 80 (HTTP-01), und Caddy leitet HTTP mit 308 auf HTTPS um. Über Port 80 laufen keine Anmeldedaten.

**Was passiert, wenn ein Test rot ist?**
Der Server rollt den Commit nicht aus und merkt ihn sich als fehlgeschlagen. Die laufende Version bleibt.

**Was passiert, wenn das Ausrollen fehlschlägt?**
Rollback: alter Commit, Container neu starten, Eintrag im Protokoll. SQL-Änderungen werden nicht zurückgedreht → Änderungen müssen abwärtskompatibel sein, vorher Backup (Story #26, noch offen).

**Wie sicher ist der Deploy-Benutzer?**
Kein Login, kein sudo, systemd-Härtung (`ProtectSystem=strict`, `NoNewPrivileges`). Aber: Gruppe `docker` ist praktisch root. Verbesserung: Rootless Docker (#4).

**Was ist die größte Schwachstelle?**
Wer nach `main` mergen darf, bringt (bei grüner CI) Code auf den Server. Gegenmaßnahme: Branch Protection mit Pflicht-Review, 2-Faktor-Anmeldung.

**Snapshot oder Backup?**
Snapshot liegt meist auf demselben Speicher (schützt vor Fehlkonfiguration). Backup ist eine getrennte Kopie (3-2-1-Regel: 3 Kopien, 2 Medien, 1 extern). RPO = tolerierbarer Datenverlust, RTO = Dauer der Wiederherstellung.

**Woher weißt du, dass der KI-Code funktioniert und sicher ist?**
Alles in Git nachvollziehbar (Co-Authored-By), CI prüft jeden Push, ich teste auf dem echten System und von außen, die KI hat keine sudo-Rechte auf dem Server. Zwei Fehler habe ich selbst auf dem Server gefunden, die HTTP-Lücke durch meine Nachfrage.

**Was machst du als Nächstes?**
Merge nach main + Branch Protection, Backup vor jedem Deployment (#26), Monitoring mit Alarm (#27), Rootless Docker (#4).

## Zahlen, die ich parat haben sollte

- 13 Backend-Tests · 3 CI-Prüfungen · Timer alle 2 Minuten · Rollout ca. 2 Minuten nach grüner CI
- 27 Tabellen, SQL-Schritte 002–010 · PostgreSQL 17.11 · Caddy 2.11 · Java 21
- VPS: Ubuntu 24.04, 6 Kerne, 11 GB RAM · Zertifikat 90 Tage, Erneuerung automatisch
