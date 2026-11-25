# Automatisches Deployment – vom Commit bis auf den Server

**Bezug:** [Issue #28](https://github.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8/issues/28) (automatisierte Builds und Tests), Deployment als Erweiterung
**Baut auf:** [App-Stack](anleitung_app_stack.md), [PostgreSQL](anleitung_postgresql_vps.md)
**Dateien:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`infra/deploy/`](../infra/deploy/)

## 1. Ablauf

```text
Entwickler pusht / merged nach main
        │
        ▼
GitHub Actions (CI)                       ← läuft bei jedem Push und Pull Request
  ├─ Backend – Build und Tests            (mvn package, 13 Tests)
  ├─ Frontend – Typpruefung und Build     (tsc + vite build)
  └─ Container – Images und Konfiguration (docker build, Caddyfile, Compose, shellcheck)
        │  Ergebnis ist öffentlich über die GitHub-API abrufbar
        ▼
VPS: systemd-Timer alle 2 Minuten  →  infra/deploy/auto-update.sh
  1. git fetch: gibt es einen neuen Commit auf main?
  2. Sind alle drei CI-Prüfungen für genau diesen Commit grün?   nein → nichts tun
  3. Neue SQL-Dateien aus app/backend/src/main/resources/db/ einspielen (jede genau einmal)
  4. docker compose up --build --wait  (Backend-Tests laufen beim Bauen erneut)
  5. Prüfung durch den Webserver: /api/health/database
  6. Fehler in 3–5 → automatischer Rollback auf den vorherigen Commit
```

**Für das Team heißt das:** Jakob merged nach `main` – etwa 5 bis 10 Minuten später läuft die neue
Version auf dem Server. Niemand muss sich dafür auf dem Server anmelden.

## 2. Entscheidungen

| Thema | Entscheidung | Begründung | Alternative |
|---|---|---|---|
| Wer stößt das Deployment an? | Der Server holt selbst (Pull) | GitHub braucht keinen SSH-Schlüssel zum Server; der Server braucht keine Zugangsdaten zu GitHub (Repository ist öffentlich). Kein Geheimnis kann aus GitHub abfließen. | GitHub Actions verbindet sich per SSH (Push): braucht einen Schlüssel als GitHub-Secret, der Server muss für GitHub erreichbar sein |
| Nur geprüfte Stände | CI-Status wird vor jedem Deployment abgefragt | Ein roter Commit kommt nie auf den Server | Auf Branch Protection allein verlassen |
| Wo werden Images gebaut? | Auf dem Server (6 Kerne, 11 GB RAM) | Keine Container-Registry und keine Registry-Zugangsdaten nötig | Images in GitHub bauen und nach ghcr.io schieben (schnellerer Rollout, aber Registry-Rechte nötig) |
| Datenbankänderungen | Nummerierte SQL-Dateien, Tabelle `deploy_schema_history` | Jede Datei läuft genau einmal, nachvollziehbar mit Commit | Flyway/Liquibase im Backend (Änderung am Anwendungscode nötig) |
| Fehlerfall | Rollback auf vorherigen Commit, fehlerhafter Commit wird gemerkt | Die Anwendung bleibt erreichbar; kein Endlos-Wiederholen | Manuell eingreifen |
| Rechte | Eigener Systembenutzer ohne Login, nur Gruppe `docker` | Kein persönliches Konto, kein sudo; systemd-Härtung (`ProtectSystem=strict`, `NoNewPrivileges`) | Als root (zu viele Rechte) |

## 3. Sicherheit

| Punkt | Bewertung |
|---|---|
| Ports nach außen | 22 (SSH, nur Schlüssel), 80 und 443. Datenbank und Backend haben keinen öffentlichen Port. |
| Port 80 | Nur für die Zertifikatsprüfung von Let's Encrypt (ACME HTTP-01) und die automatische Umleitung auf HTTPS. Über Port 80 werden keine Anmeldedaten übertragen. |
| HTTPS | Caddy holt und erneuert das Zertifikat selbst. Ohne eigene Domain wird `<ip>.sslip.io` verwendet (öffentlicher DNS-Dienst, der den Namen auf die IP abbildet). Mit eigener Domain: 3. Argument von `install.sh`. |
| Cookies | `COOKIE_SECURE=true`: Das Session-Cookie wird nur über HTTPS gesendet; dazu HSTS-Header. |
| ufw und Docker | Docker veröffentlicht Ports an ufw vorbei (eigene iptables-Regeln). Die ufw-Regeln für 80/443 dokumentieren die Freigabe; die tatsächliche Freigabe steuert `ports:` in `infra/stack/compose.yaml`. |
| Deploy-Benutzer | Ohne Login-Shell und ohne sudo, aber in der Gruppe `docker` und damit praktisch root-gleich. |
| Wer kann Code auf den Server bringen? | Jeder, der nach `main` mergen darf, und die CI muss grün sein. Deshalb: Branch Protection mit Pflicht-Review und 2-Faktor-Anmeldung für alle GitHub-Konten. |

**Grenzen:** Rootless Docker (Story 17 / #4) würde die root-Gleichheit beseitigen. Ohne
Branch Protection könnte ein übernommenes GitHub-Konto Code auf den Server bringen.

## 4. Einmalige Einrichtung (nur mit sudo möglich)

```bash
curl -fsSLO https://raw.githubusercontent.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8/main/infra/deploy/install.sh
less install.sh                                     # vor dem Ausführen lesen
sudo bash install.sh <admin-email> [branch] [hostname]
```

Das Skript erzeugt alle Passwörter selbst, legt Datenbank und Rolle an, gibt 80/443 frei, rollt
die erste Version aus und zeigt **einmalig** das Startpasswort des Admin-Kontos an. Es kann nach
einem Abbruch erneut gestartet werden, ohne Passwörter zu überschreiben.

## 5. Betrieb

| Frage | Befehl |
|---|---|
| Was läuft gerade? | `cat /var/lib/maschinenverleih-deploy/status` |
| Was ist passiert? | `cat /var/lib/maschinenverleih-deploy/deploy.log` oder `journalctl -u maschinenverleih-deploy -f` |
| Wann prüft er wieder? | `systemctl list-timers maschinenverleih-deploy.timer` |
| Sofort ausrollen | `sudo systemctl start maschinenverleih-deploy.service` |
| Automatik anhalten | `sudo systemctl stop maschinenverleih-deploy.timer` |
| Gescheiterten Commit erneut versuchen | `sudo rm /var/lib/maschinenverleih-deploy/failed` |

## 6. Regeln für das Team

- Änderungen nur per Pull Request nach `main`; dort zeigt GitHub die drei Prüfungen an.
- Neue Datenbankänderung = neue Datei mit der nächsten Nummer (z. B. `011_...sql`), eigene Transaktion (`BEGIN; … COMMIT;`). Vorhandene Dateien nie ändern – sie wurden schon ausgeführt.
- Geheimnisse nie ins Repository; sie liegen nur auf dem Server in `infra/postgres/.env` und `infra/stack/.env`.
- Empfohlen (Einstellung nur durch den Repository-Besitzer): Branch Protection für `main` mit den drei Prüfungen als Pflicht.

## 7. Getestet (25.11.2026)

| Test | Ergebnis |
|---|---|
| CI auf GitHub | Erster Lauf rot: shellcheck fand ein fehlendes `|| exit` nach `cd` in einem Skript. Nach der Korrektur alle drei Prüfungen grün. |
| `auto-update.sh` echt unter Ubuntu 24.04 (WSL, Docker 29.1.3) | CI-Status über die GitHub-API gelesen, SQL 002–010 eingespielt und in `deploy_schema_history` mit Commit vermerkt, Images gebaut (Tests grün), Health-Check über den Webserver erfolgreich, Admin-Konto angelegt |
| Zweiter Lauf ohne neuen Commit | Beendet sich sofort ohne Änderung |
| Erster Server-Lauf | Abbruch mit `Permission denied`: Skripte waren im Repository nicht ausführbar (Git unter Windows speichert das Ausführungsrecht nicht). Der WSL-Test hatte das Skript mit `bash` gestartet und den Fehler deshalb nicht gezeigt. Behoben: Ausführungsrecht in Git gesetzt, systemd ruft über `bash` auf. |
| `install.sh` komplett als root in WSL (Ubuntu 24.04, systemd) | Benutzer, Klon, Passwörter, Datenbank, SQL 002–010, Bau, Start, Admin-Konto: erfolgreich. Gefunden: Timer startete nicht (`Requires=docker.service` existiert unter Docker Desktop nicht). Behoben. |
| Automatisches Ausrollen | Commit `1ea6318` gepusht → CI grün um 21:42:14 → Timer hat um 21:42:16 selbst ausgerollt |
| Rollback | Noch nicht praktisch ausgelöst |

## 8. Grenzen

- SQL-Schritte werden beim Rollback nicht zurückgenommen; Datenbankänderungen müssen abwärtskompatibel sein.
- Kein Backup vor dem Deployment (Story 25 / #26).
- Keine Benachrichtigung bei Fehlern (nur Protokoll auf dem Server).
