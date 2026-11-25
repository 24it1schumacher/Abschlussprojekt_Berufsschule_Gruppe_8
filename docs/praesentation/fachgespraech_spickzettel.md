# Spickzettel Fachgespräch 26.11.2026 – Lasse Fischer (FiSi)

Präsentation: [`Fachgespraech_Lasse_Fischer_2026-11-26.pptx`](Fachgespraech_Lasse_Fischer_2026-11-26.pptx)
(Folien 1–12 Vortrag, ab Folie 13 Backup; ausführliche Sprechertexte stehen in den Notizen jeder Folie)

**Inhalt ausschließlich Systemintegration.** Die Anwendung wird nur als Black Box betrieben; Fragen zum Anwendungscode gehören nicht zu meinem Teil.

## Ablauf und Zeit (5 Minuten)

| Folie | Inhalt | Zeit |
|---|---|---|
| 1 | Titel und Kennzahlen | 0:10 |
| 2 | Mein Auftrag als FiSi (6 Aufgaben) | 0:20 |
| 3 | Feedback aus Review #1 → umgesetzt | 0:25 |
| 4 | Architektur: ein Eingang, zwei Netze | 0:30 |
| 5 | Datenbank: Version, Volume, 127.0.0.1 | 0:30 |
| 6 | Nachweis Netztrennung und Härtung | 0:20 |
| 7 | CI mit GitHub Actions | 0:20 |
| 8 | Automatisches Deployment (Kern!) | 0:45 |
| 9 | Live und verschlüsselt | 0:20 |
| 10 | Zusammenarbeit mit KI: Kontrolle in Schichten | 0:35 |
| 11 | Probleme und Lessons Learned | 0:25 |
| 12 | Ergebnis und nächste Schritte | 0:10 |

Zu knapp? Folie 6 und 9 nur kurz zeigen („Nachweis siehe Bild“), Folie 11 auf einen Satz kürzen.

## Was in Review #1 war (nicht wiederholen, aber darauf aufbauen)

- **Bewertung:** Inhalt Note 1, Präsentation Note 5 – zu wenig Einblick, nur 3–5 Stichpunkte je Folie.
- **Gewünscht:** Konfigurationen und Logs an Beispielen erklären, mehr Fachinhalt, **auf den Folien** präsentieren statt daneben reden → heute auf das Bild zeigen und Zeile für Zeile erklären.
- **Empfehlung der Prüfer:** vollautomatische Deploy-Pipeline und Zusammenarbeit mit KI → Folien 7–8 und 10.
- **Bereits gezeigt:** Server-Grundschutz (SSH-Schlüssel, ufw, fail2ban, unattended-upgrades) → heute nur als Grundlage erwähnen.

Probefragen aus der Vorbereitung zu Review #1 (können wieder kommen):
- **Warum fail2ban UND ufw?** ufw legt fest, welche Ports überhaupt erreichbar sind. fail2ban sperrt IP-Adressen, die an einem offenen Port (SSH) wiederholt falsche Anmeldungen versuchen. Zwei Schichten mit unterschiedlicher Aufgabe.
- **Warum war der Neustart nach dem Kernel-Update nötig?** unattended-upgrades installiert den neuen Kernel, aktiv wird er erst nach einem Neustart (laufender ≠ installierter Kernel; Hinweis in `/var/run/reboot-required`).
- **Warum umgeht Docker ufw?** Siehe unten und Backup-Folie 14.
- **Warum ein Volume?** Siehe Folie 5.

## Die Kernaussage in einem Satz

„Ein Entwickler pusht, GitHub prüft automatisch, und der Server holt sich nur geprüfte Stände selbst – ohne dass jemand einen Schlüssel zum Server bei GitHub hinterlegen muss.“

## Die Bausteine – was, wofür, wo

| Baustein | Was macht er? | Datei |
|---|---|---|
| PostgreSQL 17.11 | Datenbank im Container, Daten im Volume | `infra/postgres/compose.yaml` |
| Anwendungs-Container | läuft als UID 1000, read-only, kein Port nach außen | `app/backend/Dockerfile` (Verpackung für den Betrieb) |
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

**Wie kommt man an die Datenbank?**
Nur per SSH-Tunnel (`ssh -N -L 5433:127.0.0.1:5432 <konto>@<server>`): verschlüsselt, mit den vorhandenen SSH-Schlüsseln, ohne zusätzlichen offenen Port.

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

- 3 CI-Prüfungen · Timer alle 2 Minuten · Rollout ca. 2 Minuten nach grüner CI
- 3 Container · 2 Netze · offene Ports 22, 80, 443 · PostgreSQL 17.11 · Caddy 2.11
- VPS: Ubuntu 24.04, 6 Kerne, 11 GB RAM · Zertifikat 90 Tage, Erneuerung automatisch
