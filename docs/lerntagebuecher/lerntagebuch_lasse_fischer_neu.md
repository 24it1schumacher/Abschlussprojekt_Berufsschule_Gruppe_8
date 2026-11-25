# Lerntagebuch – Lasse Fischer

---

## 01.10.2026 · Firewall (ufw) auf dem VPS einrichten und von außen prüfen

### Problem

Noch nie mit einer Firewall gearbeitet. Unklar, wie man prüft, dass nur benötigte Ports erreichbar sind. Gefahr, sich per SSH selbst auszusperren.

### Lösung

Ist-Zustand mit `ss -tulpn` und `ufw status` erfasst. Von außen mit nmap vorher/nachher gescannt. Regeln mit Default deny angelegt und mit `ufw show added` geprüft, SSH (22/tcp) erlaubt, dann erst `ufw enable`. Zweites SSH-Fenster zum Testen offen gelassen.

### Lessons Learned

- Default deny ist sicherer als Default allow.
- Reihenfolge ist wichtig: erst SSH erlauben, dann aktivieren.
- `closed` (Server antwortet mit RST) und `filtered` (Firewall verwirft still) sind nicht dasselbe.
- Nur ein Test von außen beweist die Wirkung.

---

## 01.10.2026 · Firewall-Anleitung in `docs/` dokumentieren

### Problem

Das Kriterium spricht von „geschlossen", gemessen wurde aber `filtered`.

### Lösung

Abweichung in der Doku offen begründet. Anleitung `docs/anleitung_firewall_ufw.md` geschrieben und per Pull Request eingereicht.

### Lessons Learned

- Eine Messung gehört mit Rohausgabe in die Doku, und Grenzen des Tests (nur TCP, ein Standort) nennt man selbst.

---

## 01.10.2026 · Brute-Force-Schutz mit fail2ban installieren, prüfen und testen

### Problem

Ich wusste nicht, wie fail2ban arbeitet und wie man es testet, ohne sich selbst auszusperren. Außerdem dachte ich zuerst, `inactive` heißt „installiert, aber aus"; fail2ban war gar nicht installiert. Im Log standen viele fremde Fehlversuche, aber niemand war gesperrt.

### Lösung

Mit `dpkg -l` den Ist-Zustand geprüft, fail2ban per `apt` installiert und Werte mit `fail2ban-client get sshd …` gelesen (5 Versuche, 600 s, 600 s Sperre). Filter mit `fail2ban-regex` gegen das Journal getestet. Sperrtest vom Laptop im Handy-Hotspot, damit meine Heim-IP nicht gesperrt wird, mit erfundenem Benutzernamen `testuser`. Ergebnis: 5× `Permission denied`, dann `Connection refused`. Nachweis über `fail2ban.log` (Found, Ban, Unban nach genau 10 Minuten) und die nftables-Regel.

### Lessons Learned

- fail2ban zählt Fehlversuche **pro IP** und wertet Logs aus.
- Die Sperre selbst setzt nftables im Kernel durch, fail2ban pflegt nur die Liste.
- ufw dagegen arbeitet mit festen Regeln ohne Gedächtnis.
- Langsame Scanner mit wenigen Versuchen je IP fängt fail2ban nicht. Dagegen schützen Schlüssel-Login und Firewall.
- Einen Test, der die eigene IP sperren kann, plant man vorher (zweite IP, Notzugang).
- Ein echter Benutzername ohne Schlüssel wird im Standardmodus nicht gezählt, darum der erfundene Name.

---

## 01.10.2026 · Automatische Sicherheitsupdates (unattended-upgrades) prüfen, offenen Neustart klären

### Problem

Der Dienst war `active`, aber ich wusste nicht, ob er wirklich Updates installiert. Es stellte sich heraus, dass ein Kernel-Update seit 7 Tagen installiert, aber nicht wirksam war (`6.8.0-139` lief, `6.8.0-142` wartete). Automatische Neustarts sind nicht aktiv, also ist es nicht vollautomatisch. `list-timers` blieb im Blättermodus hängen, und `zgrep` bekam wegen der Wildcard `Permission denied`.

### Lösung

Konfiguration (`20auto-upgrades`, `50unattended-upgrades`), Timer und Log geprüft. Mit `sudo sh -c 'zgrep …'` das apt-Protokoll gelesen: `Commandline: /usr/bin/unattended-upgrade` belegt die automatische Installation am 24.09. Vor dem Neustart SSH-Konfiguration mit `sshd -t` geprüft, den zweiten Kernel und die aktivierten Dienste kontrolliert und den Zugang über den Projektbetreiber als Fallback geklärt. Danach `sudo reboot` und Prüfung: Kernel `142`, kein `reboot-required` mehr, ufw, fail2ban und SSH aktiv, `PermitRootLogin no`.

### Lessons Learned

- „Installiert" und „wirksam" sind bei Kernel-Updates nicht dasselbe, erst der Neustart macht sie wirksam.
- Dass ein Dienst läuft, beweist nicht, dass er das Richtige tut, man braucht Konfiguration, Zeitplan und Protokoll.
- Vor einem Neustart braucht man einen Notzugang und prüft, dass Schutzmaßnahmen von selbst wieder starten.
- Ohne regelmäßige Kontrolle bleibt ein Neustart liegen, deshalb gehört eine Wartungs-Checkliste in die Doku.

---

## 01.10.2026 · Anleitung `docs/anleitung_bruteforce_updates.md` erstellen

### Problem

Die Doku soll für Leser klar sein, und ich muss alles im Fachgespräch erklären können.

### Lösung

Die Anleitung wurde mit Unterstützung der KI aus meinen Befehlen und Ausgaben des Tages geschrieben und von mir durchgelesen. Die Stellen, die nicht aus Messungen stammen (z. B. `ufw limit`, CrowdSec), wurden mir von der KI genannt und sind in der Doku als „nicht getestet" gekennzeichnet. IPs in der Doku sind maskiert.

### Lessons Learned

- Eine Doku muss Rohausgaben, Entscheidungen mit Alternativen und die Grenzen des Tests enthalten.
- Was ich nicht belegen kann, schreibe ich nicht als Tatsache hin.
- Echte IPs gehören nicht ins Repo.

---

## 08.10.2026 · Installation und Prüfung von Docker und Docker Compose auf dem Projektserver aus offziellen Paketquellen mit

### Problem

- was macht `install -d`#
- was macht `chmod a+r`
- was macht `tee` mit Heredoc
- was macht `Signed-By`
- Unklar, warum man den Schlüssel einträgt und woher man weiß, dass er echt ist
- Der Fingerabdruck des Docker-Schlüssels war in der aktuellen Docker-Doku nicht zu finden, eine unabhängige Prüfung war nicht möglich

### Lösung

<!-- noch auszufüllen -->

- Befehle nachgelesen (man, Dockerdokue), von Claude an Beispielen erklären lassen
-

### Lessons Learned

- **einbinden eines systemfremden apt-Repositorys**: durch die Befehle von der Dockerinstallationswebseite habe ich gelernt, wie man Schlüssel und anschließend auch Paketquellen für apt festlegt.
- **Überprüfung der Lauffähigkeit eines Services und Ubuntu**: `systemctl status <service-name>` gibt einem eine Übersicht über den aktuellen Zustand eines Services in Linux System. Zustand des Services, genutzte Systemresourcen, PID und eine kurze Übersicht cder Logs werden einem hier angezeigt
- Der öffentliche Schlüssel muss für apt lesbar sein (a+r), ein privater Schlüssel nur für den Besitzer (600)
- chmod a+r fügt Rechte hinzu (relativ), 644 setzt sie neu (absolut)
- Docker-Ports umgehen die ufw-Regeln. Deshalb keinen ports:-Eintrag oder nur an 127.0.0.1 binden
- Eine Aussage der KI zur Docker-Doku (Fingerabdruck) war falsch und wurde von mir geprüft und korrigiert

-6

## 08.10.2026 · Anleitung `docs\anleitung_docker_installieren.md` geschrieben

### Problem

<!-- Was wusste oder konnte ich nicht? Was ist schiefgelaufen? -->

### Lösung

<!-- Wie habe ich es geklärt? Welche Befehle, Quellen, Tests? Wo wurde die KI genutzt, wo nicht? -->

- Fehlenden Fingerabdruck als Grenze in die Doku geschrieben

### Lessons Learned

<!-- Was nehme ich mit? Gerne als kurze Stichpunkte. -->

---

<!-- Einträge vom 25.11.2026: Entwurf aus der Arbeitssitzung mit Claude, von mir noch gegenzulesen -->

## 25.11.2026 · PostgreSQL mit Docker Compose für den VPS bereitstellen und jedes Akzeptanzkriterium nachweisen (Story 10, #14)

### Problem

- Die lokale Compose-Datei war für die Entwicklung gedacht; für den Server fehlten feste Version, Netzwerkabgrenzung und ein klarer Fehler bei fehlendem Passwort.
- Unklar, wie man „Port nicht öffentlich“, „Daten bleiben erhalten“ und „Schema wird nicht automatisch angelegt“ so nachweist, dass es auf einer Folie überzeugt.
- Die SQL-Dateien der Anwendung (003–010) wechseln nicht selbst die Rolle; als Administrator eingespielt hätten die Tabellen dem falschen Besitzer gehört.

### Lösung

- `infra/postgres/compose.yaml`: Image `postgres:17.11-trixie`, benanntes Volume, Port nur `127.0.0.1:5432`, internes Netz, `no-new-privileges`, Log-Rotation, `${POSTGRES_ADMIN_PASSWORD:?…}` für einen sichtbaren Abbruch ohne Passwort.
- Erst lokal mit Docker Desktop getestet: Container-ID vor/nach `down`/`up` verglichen (Daten noch da), Port über die LAN-IP geprüft (zu), Verbindung aus einem Wegwerf-Container im internen Netz und Gegenprobe ohne Netz.
- Vor jede SQL-Datei `SET ROLE maschinenverleih_app` gesetzt → alle Tabellen gehören der Anwendungsrolle, nicht dem Datenbank-Administrator.
- KI-Einsatz: Claude hat Compose-Datei, Anleitung und Nachweis-Skripte entworfen; die Ergebnisse habe ich an den echten Ausgaben geprüft. Screenshots unter `docs/praesentation/story10/`.

### Lessons Learned

- Docker veröffentlicht Ports an ufw vorbei (eigene iptables-Regeln). Die Bindung an `127.0.0.1` ist die eigentliche Absicherung, nicht die ufw-Regel.
- `docker compose down` löscht Container und Netz, aber nicht das Volume; `down -v` würde alle Daten löschen.
- Ein Nachweis ist stärker mit Gegenprobe (z. B. „ohne internes Netz → keine Verbindung“).

---

## 25.11.2026 · Anwendung als Container-Stack mit Reverse Proxy betreiben (Grundlage #34, #8)

### Problem

- Die Anwendung lief nicht auf dem Server; es gab keinen Webserver, keine Images und keinen gemeinsamen Start.
- Frontend und Backend auf getrennten Ports hätten CORS und zwei offene Ports bedeutet.

### Lösung

- Mehrstufige Dockerfiles: Build-Stufe und schlanke Laufzeit-Stufe; der Anwendungs-Container läuft als UID 1000, die vorhandenen Tests laufen beim Bau mit; Caddy liefert die Oberfläche aus.
- Caddy als Reverse Proxy: `/api/*` → Backend, alles andere → Frontend. Damit ein einziger Eingang und kein CORS.
- Zwei Netze: `web-intern` (Webserver ↔ Backend) und `db-intern` (Backend ↔ Datenbank). Nachweis: Der Webserver-Container kennt `postgres` nicht (`bad address`).
- Login im Browser über den Proxy getestet (Cookie und CSRF funktionieren). Screenshots unter `docs/praesentation/app_stack/`.

### Lessons Learned

- Netztrennung begrenzt den Schaden: Wird der Webserver übernommen, erreicht er die Datenbank trotzdem nicht.
- `read_only: true` zeigt sofort, ob eine Anwendung unerwartet ins Dateisystem schreibt.
- Tests im Image-Bau sind eine einfache Qualitätsschranke: kein grüner Test, kein Image.

---

## 25.11.2026 · CI-Pipeline mit GitHub Actions einrichten (Story 27, #28)

### Problem

- Änderungen wurden bisher nicht automatisch geprüft; Fehler wären erst auf dem Server aufgefallen.

### Lösung

- `.github/workflows/ci.yml` mit drei Prüfungen: Backend-Tests, Frontend-Build, Container (Images bauen, Caddyfile und Compose prüfen, shellcheck).
- Erster Lauf rot: shellcheck fand in einem Skript ein `cd` ohne Fehlerbehandlung. Korrigiert, danach grün.

### Lessons Learned

- Die Pipeline hat schon beim ersten Lauf einen echten Fehler gefunden – genau dafür ist sie da.
- Branch Protection (Pflichtprüfungen vor dem Merge) kann nur der Repository-Besitzer einschalten.

---

## 25.11.2026 · Automatisches Deployment auf den VPS mit HTTPS unter bbk-it-08.de

### Problem

- Ziel: Änderungen im Repository sollen ohne manuelles Eingreifen auf dem Server landen, aber nur geprüfte Stände.
- Erster Versuch auf dem Server: `404` beim Download von `install.sh` – die Datei lag noch nicht auf `main`, sondern nur auf dem Feature-Branch.
- Zweiter Versuch: `Permission denied` – Git unter Windows speichert das Ausführungsrecht nicht; der Test in WSL hatte das Skript mit `bash` gestartet und den Fehler deshalb verdeckt.
- Meine Frage „ist die Portfreigabe sicher?“: Nein – Port 80 mit Login hätte Passwörter und Session-Cookie unverschlüsselt übertragen.
- Ich war mir sicher, dass wir eine eigene Domain haben, sie stand aber nirgends in der Doku.

### Lösung

- Pull-Prinzip: Ein systemd-Timer auf dem Server prüft alle 2 Minuten GitHub, rollt nur Commits mit grüner CI aus, spielt neue SQL-Dateien genau einmal ein und macht bei Fehlern einen Rollback. GitHub braucht keinen Schlüssel zum Server.
- Einmaliges `install.sh` (nur dieser Schritt braucht sudo): Systembenutzer ohne Login, zufällige Passwörter, Datenbank, Timer.
- Fehler behoben: Ausführungsrecht in Git gesetzt (`git update-index --chmod=+x`), systemd ruft zusätzlich über `bash` auf. Danach das komplette `install.sh` als root in WSL (Ubuntu 24.04) getestet – dabei noch einen Timer-Fehler gefunden und behoben.
- HTTPS: Caddy holt das Zertifikat automatisch, Port 80 nur noch für Zertifikatsprüfung und Umleitung, Cookie nur über HTTPS.
- Domain über die Rückwärtsauflösung der Server-IP gefunden: `mail.bbk-it-08.de` → Domain `bbk-it-08.de`; `bbk-it-08.de` und `www` zeigen auf den Server.
- Mit `sudo bash install.sh … bbk-it-08.de,www.bbk-it-08.de` umgestellt: Caddy hat für beide Namen automatisch Let's-Encrypt-Zertifikate geholt. Die Anwendung läuft unter https://bbk-it-08.de.
- Erster echter automatischer Rollout: Commit gepusht, Server hat gewartet, bis die CI grün war, und zwei Minuten später selbst ausgerollt.

### Lessons Learned

- Einen Befehl für jemand anderen erst selbst ausprobieren – genau so, wie er auf dem Zielsystem aufgerufen wird.
- Windows und Linux behandeln Dateirechte unterschiedlich; ausführbare Skripte brauchen das Recht im Repository (`100755`).
- „Funktioniert“ ist nicht „sicher“: Die kritische Nachfrage hat die HTTP-Lücke aufgedeckt.
- Die Gruppe `docker` ist praktisch root. Deshalb ist Branch Protection auf `main` wichtig: Wer mergen darf, bringt Code auf den Server.
- KI-Einsatz: Claude hat Skripte und Tests gebaut; zwei Fehler (404, Ausführungsrecht) habe ich auf dem Server selbst entdeckt und zurückgemeldet.

---

## 25.11.2026 · Präsentation und Spickzettel für das Fachgespräch erstellen

### Problem

- Im Review #1 waren die Folien zu dünn (Note 5 für die Präsentation): zu wenig Einblick, keine Konfigurationen und Logs.
- Ich muss alles, was heute entstanden ist, in 5 Minuten zeigen und im Fachgespräch erklären können.

### Lösung

- Präsentation `docs/praesentation/Fachgespraech_Lasse_Fischer_2026-11-26.pptx`: 10 Vortragsfolien mit echten Screenshots vom Server (Protokoll des automatischen Rollouts, Test von außen, Zertifikat, GitHub Actions) und 5 Backup-Folien (Docker und ufw, Entscheidungen mit Alternativen, mögliche Fragen).
- Zu jeder Folie Sprechernotizen mit Zeitangabe, Formulierung und Hintergrund für Rückfragen.
- Spickzettel `docs/praesentation/fachgespraech_spickzettel.md` mit Begriffen, Befehlen und Antworten.
- KI-Einsatz: Claude hat Folien und Notizen erstellt; Inhalte stammen aus der heutigen Arbeit und den echten Nachweisen.

### Lessons Learned

- Nachweise laufend sammeln statt am Ende: Die Bilder waren schon da, die Präsentation war dadurch schnell gebaut.
- Jede Folie braucht echtes Material (Konfiguration, Log, Messwert), nicht nur Stichpunkte.

---

## 25.11.2026 · Präsentation auf reine Systemintegration ausrichten und mit Review #1 abgleichen

### Problem

- In der ersten Fassung kamen Inhalte der Anwendungsentwicklung vor (Aufgaben, Tests, Schema). Meine Präsentation muss klar nur meinen FiSi-Teil zeigen.
- Unklar war, ob die neue Präsentation das Feedback aus Review #1 aufgreift und was sich wiederholen würde.

### Lösung

- Alle AE-Inhalte von den Folien entfernt; die Anwendung kommt nur als Black Box vor, die ich betreibe.
- Abgleich mit meinen Notizen zu Review #1: Neue Folie „Feedback aus Review #1 – und was daraus wurde“ und eigene Folie „Zusammenarbeit mit KI: Kontrolle in Schichten“, weil die Prüfer Deploy-Pipeline und KI-Zusammenarbeit als Schwerpunkt empfohlen hatten.
- Server-Grundschutz nur noch als „bereits gezeigt“ erwähnt; Probefragen von damals im Spickzettel beantwortet.
- Eine Aussage zur KI-Kontrolle war zu stark („jede Änderung gekennzeichnet“) und wurde korrigiert.

### Lessons Learned

- Feedback ausdrücklich aufgreifen: Prüfer sollen sehen, dass ihre Hinweise umgesetzt wurden.
- Bei Teamarbeit klar trennen, was mein Teil ist – sonst wirkt es, als würde ich fremde Arbeit vorstellen.
- Auch auf Folien gilt: nichts behaupten, was ich nicht belegen kann.

---
