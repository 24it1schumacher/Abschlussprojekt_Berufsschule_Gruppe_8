# User Stories – Maschinenverleih (Gesamt-Backlog)

Konsolidierter Backlog aus `user_stories_beispiel.md` (Referenzvorlage) und den bereits
umgesetzten Server-Stories (`user_stories_server.md`), aufgefüllt auf 30 Stories.
Team: 1× Anwendungsentwicklung (AE) + 1× Systemintegration (SI).

Jeder Abschnitt entspricht einer User Story bzw. einem GitHub Issue.
Beim Anlegen in GitHub: Überschrift (`##`) als Issue-Titel verwenden, den Rest als
Issue-Beschreibung übernehmen, Labels wie angegeben setzen.

**Bereits als GitHub-Issues angelegt:** Story 15 (#2), Story 16 (#3), Story 17 (#4).
`create_github_issues.py` überspringt Titel, die im Repo schon als Issue existieren.

**Wichtig:** Querverweise zwischen Stories werden unten als `#<Issue-Nummer>` geschrieben
(z. B. `#8`), nicht als „Story N" — GitHub verlinkt `#N` automatisch auf das richtige Issue.
Die Story-Nummern 1–30 in dieser Datei sind nur die Reihenfolge in diesem Dokument und
stimmen NICHT mit den GitHub-Issue-Nummern überein (siehe Mapping-Tabelle am Dateiende).

**Sprint-1-Vorschlag (~30 Std./Person):**
- SI: #2 + #3 + #4 (24h, bereits erledigt/gestartet) + #13 "DB-System auswählen" (8h) = 32h
- AE: #9 "Grundgerüst" (16h) + #6 "Maschinenstammdaten" (8h) + #25 "Barrierefreiheitsprüfung" (8h) = 32h

---

## 1. Maschinen nach Verfügbarkeit suchen und reservieren

**Als** Kunde
**möchte ich** verfügbare Maschinen nach Kategorie, Zeitraum und Standort suchen und direkt reservieren können,
**damit** ich die passende Maschine für meinen Bedarf buchen kann, ohne vorher Rücksprache mit dem Vermieter halten zu müssen.

**Akzeptanzkriterien**
- [ ] Suchmaske mit Filtern für Kategorie, Verfügbarkeitszeitraum und Standort
- [ ] Ergebnisliste zeigt ausschließlich Maschinen, die im gewählten Zeitraum tatsächlich frei sind
- [ ] Reservierung wird verbindlich gespeichert, Kunde erhält eine Bestätigung
- [ ] Oberfläche ist gemäß ISO 9241 barrierefrei bedienbar

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-L`

---

## 2. Maschinenstammdaten erfassen und verwalten

**Als** Verleih-Mitarbeiter
**möchte ich** Maschinenstammdaten (Typ, Baujahr, Betriebsstunden, Wartungsintervalle) anlegen, bearbeiten und aus dem bestehenden Excel-System übernehmen können,
**damit** alle Maschinendaten zentral, konsistent und als Grundlage für spätere Auswertungen wie die Wartungsplanung verfügbar sind.

**Akzeptanzkriterien**
- [ ] Formular zum Anlegen/Bearbeiten von Maschinendatensätzen mit definierten Pflichtfeldern
- [ ] Importschnittstelle übernimmt bestehende Excel-Daten fehlerfrei
- [ ] Validierung verhindert doppelte oder fehlerhafte Einträge
- [ ] Änderungen werden nachvollziehbar protokolliert (Audit-Trail)

**Lernfeld:** LF5 – Software zur Verwaltung von Daten anpassen
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF5`, `size-M`

---

## 3. Wartungsbedarf regelbasiert berechnen und anzeigen

**Als** Werkstattplaner
**möchte ich** dass das System anhand einfacher, nachvollziehbarer Regeln (z. B. Schwellenwerte für Betriebsstunden und Zeit seit letzter Wartung) den Wartungsbedarf je Maschine berechnet und anzeigt,
**damit** ich Wartungen rechtzeitig einplanen kann, auch ohne ein Machine-Learning-Modell aufzubauen.

**Akzeptanzkriterien**
- [ ] Für jede Maschine wird aus Betriebsstunden, Wartungsintervall und letztem Wartungstermin ein Status (z. B. „ok“/„bald fällig“/„überfällig“) berechnet
- [ ] Die Regeln (Schwellenwerte) sind konfigurierbar und dokumentiert, nicht hart codiert
- [ ] Maschinen mit „bald fällig“ oder „überfällig“ werden in einer Übersicht hervorgehoben
- [ ] Die Berechnungslogik ist nachvollziehbar dokumentiert (kein Black-Box-Modell)
- [ ] Status lässt sich exportieren bzw. an die Werkstattplanung übergeben

**Lernfeld:** LF11a – Funktionalität in Anwendungen realisieren (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11a`, `fachrichtung-AE`, `size-M`

---

## 4. Infrastruktur automatisiert bereitstellen (Infrastructure-as-Code)

**Als** Entwicklerteam
**möchte ich** die Basisinfrastruktur (Container-Technologie und Reverse Proxy) per Infrastructure-as-Code/Configuration-as-Code automatisiert aufsetzen können,
**damit** die gesamte Umgebung jederzeit reproduzierbar zerstört und neu aufgebaut werden kann, statt alles manuell zu konfigurieren.

**Akzeptanzkriterien**
- [ ] Ein Skript/Playbook (z. B. Ansible, Docker Compose) richtet Container-Laufzeit und Reverse Proxy vollautomatisch ein
- [ ] Die gesamte Konfiguration liegt versioniert im Git-Repository
- [ ] Nach vollständigem Löschen der Umgebung stellt ein einzelner Befehl sie wieder her
- [ ] Der Reverse Proxy leitet eine Testanfrage per HTTPS mit gültigem Zertifikat an einen Platzhalterdienst weiter

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-L`

---

## 5. Lauffähiges Client-Server-Grundgerüst mit Datenbankanbindung aufsetzen

**Als** Entwicklerteam
**möchte ich** ein minimales, lauffähiges Grundgerüst aus Client, Server und Datenbank (angebunden über eine Datenbank-API) aufsetzen,
**damit** wir ab sofort an einzelnen fachlichen Funktionen (z. B. Maschinen- oder Kundenverwaltung) weiterarbeiten können, ohne die Basisarchitektur jedes Mal neu zu bauen.

**Voraussetzung:** #8 (Reverse Proxy ist eingerichtet)

**Akzeptanzkriterien**
- [ ] Die objektorientierte Server-Anwendung ist über den Reverse Proxy erreichbar
- [ ] Die Datenbankanbindung erfolgt ausschließlich über eine Datenbank-API (kein Tool, das die DB implizit erzeugt)
- [ ] Ein einfacher Testendpunkt schreibt/liest einen Beispieldatensatz in/aus der Datenbank
- [ ] Der Client kann sich mit dem Server verbinden und den Testendpunkt erfolgreich aufrufen
- [ ] Die Grundarchitektur ist als UML-Diagramm (z. B. Deployment- oder Komponentendiagramm) dokumentiert

**Lernfeld:** LF5 – Software zur Verwaltung von Daten anpassen
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF5`, `size-L`

---

## 6. Kundenstammdaten aus dem Altsystem übernehmen

**Als** Verleih-Mitarbeiter
**möchte ich** die bestehenden Kundendaten aus dem alten Excel-System über eine programmierte Schnittstelle in die neue Anwendung übernehmen und dort pflegen können,
**damit** kein Kunde beim Umstieg verloren geht und alle Kundendaten zentral im neuen System verfügbar sind.

**Akzeptanzkriterien**
- [ ] Importschnittstelle liest die Excel-Kundendaten ein und ordnet sie den Feldern des neuen Datenmodells zu
- [ ] Fehlerhafte oder unvollständige Datensätze werden beim Import erkannt und protokolliert statt stillschweigend übernommen
- [ ] Kundendaten lassen sich im neuen System anschließend anlegen, ändern und suchen
- [ ] Import ist wiederholbar, ohne Duplikate zu erzeugen

**Lernfeld:** LF8 – Daten systemübergreifend bereitstellen
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF8`, `size-L`

---

## 7. Rollen- und Zugriffsrechte verwalten

**Als** Systemverantwortlicher
**möchte ich** Benutzerkonten mit unterschiedlichen Rollen (z. B. Kunde, Mitarbeiter, Admin) und passenden Zugriffsrechten anlegen können,
**damit** jede Nutzergruppe nur auf die für sie vorgesehenen Daten und Funktionen zugreifen kann und die Anforderungen an Zugriffskontrollen gemäß GoBD erfüllt werden.

**Akzeptanzkriterien**
- [ ] Anmeldung erfordert gültige Zugangsdaten, Passwörter werden sicher gespeichert (Hashing)
- [ ] Jede Rolle hat klar definierte Rechte (z. B. Kunde sieht nur eigene Buchungen, Mitarbeiter sieht alle)
- [ ] Unautorisierte Zugriffsversuche auf fremde Daten werden abgelehnt und protokolliert
- [ ] Rollenzuordnung ist im System änderbar, ohne Code anzupassen

**Lernfeld:** LF11a – Funktionalität in Anwendungen realisieren (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11a`, `fachrichtung-AE`, `size-L`

---

## 8. Buchung zu einem verbindlichen Auftrag mit Audit-Trail machen

**Als** Kunde
**möchte ich** dass meine Reservierung nach Bestätigung zu einem verbindlichen Auftrag mit eindeutiger Auftragsnummer wird, dessen Entstehung nachvollziehbar dokumentiert ist,
**damit** ich einen verlässlichen Nachweis über meine Buchung habe und der Verleiher die Anforderungen an compliance-konforme Datenerfassung erfüllt.

**Voraussetzung:** #5 (Reservierung kann angelegt werden)

**Akzeptanzkriterien**
- [ ] Aus einer bestätigten Reservierung wird automatisch ein Auftrag mit eindeutiger Nummer, Kunde, Maschine und Zeitraum erzeugt
- [ ] Jede Statusänderung des Auftrags (angelegt, geändert, storniert) wird unveränderbar im Audit-Log protokolliert (Zeitstempel, Nutzer, Aktion)
- [ ] Der Auftrag ist Grundlage für die spätere Rechnungsstellung und kann nicht rückwirkend manipuliert werden
- [ ] Kunde und Mitarbeiter können den aktuellen Auftragsstatus jederzeit einsehen

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** XL (mehr als 16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-XL`

---

## 9. Datenbanksystem kriteriengeleitet auswählen

**Als** Systemadministrator
**möchte ich** anhand fachlicher und wirtschaftlicher Kriterien ein konkretes Datenbanksystem auswählen,
**damit** eine begründete, dokumentierte Entscheidung vorliegt, bevor die Datenbank produktiv aufgesetzt wird, und die Datenbank-API-Anforderung aus den Rahmenbedingungen eingehalten wird.

**Akzeptanzkriterien**
- [ ] Mindestens drei relevante Datenbanksysteme sind recherchiert und gegenübergestellt
- [ ] Bewertungskriterien sind vorab festgelegt (z. B. Lizenzkosten, Skalierbarkeit, Backup-Funktionen, Kompatibilität mit der Client-Technologie, Community/Support)
- [ ] Entscheidung liegt als dokumentierte Nutzwertanalyse mit Punktebewertung vor
- [ ] Ausgewähltes System ist ausschließlich über eine Datenbank-API ansprechbar (kein Tool, das die Datenbank implizit erzeugt)
- [ ] Entscheidung ist im Team abgestimmt und dokumentiert (z. B. als Architecture Decision Record)

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-M`

---

## 10. Datenbank-Server produktiv bereitstellen

**Als** Systemadministrator
**möchte ich** das ausgewählte Datenbanksystem automatisiert auf dem Strato-Server einrichten,
**damit** die Anwendung eine stabile, gesicherte und reproduzierbare Datenbasis nutzen kann.

**Voraussetzung:** #13 (Datenbanksystem ist ausgewählt)

**Akzeptanzkriterien**
- [ ] Datenbank läuft containerisiert und ist per IaC-Skript reproduzierbar aufsetzbar
- [ ] Zugriff ist auf notwendige Netzwerkports/-quellen beschränkt
- [ ] Zugangsdaten sind sicher hinterlegt (kein Klartext-Passwort im Repository)
- [ ] Regelmäßige automatisierte Backups sind eingerichtet und ein Restore wurde erfolgreich getestet
- [ ] Die Anwendung aus dem Grundgerüst kann sich erfolgreich verbinden

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-L`

---

## 11. Mailserver-System kriteriengeleitet auswählen

**Als** Systemadministrator
**möchte ich** aus den vorgegebenen Optionen (Mailcow, docker-mailserver, stalwart) anhand festgelegter Kriterien ein Mailserver-System auswählen,
**damit** eine begründete Entscheidung als Grundlage für Buchungsbestätigungen und den späteren Rechnungsversand vorliegt.

**Akzeptanzkriterien**
- [ ] Alle drei vorgegebenen Mailserver-Lösungen sind hinsichtlich Wartungsaufwand, Ressourcenbedarf, Funktionsumfang (z. B. DKIM/SPF, Webmail, API) und Docker-Kompatibilität verglichen
- [ ] Bewertungskriterien und Gewichtung sind vor der Bewertung festgelegt
- [ ] Entscheidung liegt als dokumentierte Nutzwertanalyse vor
- [ ] Gewähltes System ist mit der bestehenden Container- und Reverse-Proxy-Architektur kompatibel
- [ ] Entscheidung ist im Team abgestimmt und dokumentiert

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-M`

---

## 12. Mailserver produktiv bereitstellen

**Als** Systemadministrator
**möchte ich** das ausgewählte Mailserver-System (z. B. Mailcow, docker-mailserver oder stalwart) automatisiert auf dem Strato-Server einrichten,
**damit** die Anwendung Buchungsbestätigungen und spätere Rechnungen zuverlässig und sicher per E-Mail versenden kann.

**Voraussetzung:** #15 (Mailserver-System ist ausgewählt)

**Akzeptanzkriterien**
- [ ] Mailserver läuft containerisiert und ist per IaC-Skript reproduzierbar aufsetzbar
- [ ] SPF-, DKIM- und DMARC-Einträge sind korrekt konfiguriert, Testmails landen nicht im Spam
- [ ] Zugangsdaten und Postfächer sind sicher angelegt (kein Klartext-Passwort im Repository)
- [ ] Die Anwendung kann über die Mailserver-Schnittstelle erfolgreich eine Test-E-Mail versenden
- [ ] Backups der Mailserver-Konfiguration und -Daten sind eingerichtet und ein Restore wurde getestet

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-L`

---

## 13. Betrieb und Sicherheit der vernetzten Systeme gewährleisten

**Als** Systemadministrator
**möchte ich** Datenbank- und Mailserver kontinuierlich überwachen, härten und mit Sicherheitsupdates versorgen,
**damit** ein stabiler, sicherer Dauerbetrieb der Backend-Systeme gewährleistet ist und Ausfälle oder Sicherheitsvorfälle frühzeitig erkannt werden.

**Voraussetzung:** #14 und #16 (Datenbank- und Mailserver sind produktiv im Einsatz)

**Akzeptanzkriterien**
- [ ] Monitoring erfasst Verfügbarkeit, Ressourcenauslastung und Fehlerzustände von DB- und Mailserver
- [ ] Bei kritischen Zuständen (z. B. Dienst nicht erreichbar, Speicher voll) wird automatisch eine Benachrichtigung ausgelöst
- [ ] Sicherheitsupdates werden regelmäßig geprüft und dokumentiert eingespielt
- [ ] Ein einfacher Incident-Response-Ablauf (Was tun bei Ausfall/Angriff?) ist dokumentiert
- [ ] Zugriffslogs beider Dienste werden revisionssicher aufbewahrt

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-L`

---

## 14. TLS-Verschlüsselung automatisiert verwalten

**Als** Systemadministrator
**möchte ich** dass der Reverse Proxy TLS-Zertifikate automatisiert bezieht und erneuert,
**damit** alle Verbindungen zu Webportal, Online-Shop und Mailserver durchgehend verschlüsselt sind, ohne dass Zertifikate manuell nachgepflegt werden müssen.

**Voraussetzung:** #8 (Reverse Proxy ist eingerichtet)

**Akzeptanzkriterien**
- [ ] Reverse Proxy bezieht Zertifikate automatisiert (z. B. via Let's Encrypt) für alle relevanten Subdomains
- [ ] Erneuerung erfolgt automatisch vor Ablauf, ohne Downtime der Dienste
- [ ] Unverschlüsselte Verbindungen (HTTP) werden automatisch auf HTTPS umgeleitet
- [ ] Zertifikatskonfiguration ist Bestandteil des IaC-Setups und versioniert im Repository
- [ ] Ein Test mit einem SSL-Prüfwerkzeug bestätigt eine sichere Konfiguration (kein veraltetes TLS/keine schwachen Ciphers)

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-M`

---

## 15. Persönliche Benutzerkonten mit SSH-Key einrichten

**Als** Systemadministrator
**möchte ich** für jedes Teammitglied ein persönliches Benutzerkonto mit eigenem RSA-Schlüssel auf dem VPS anlegen,
**damit** niemand mehr als root arbeitet und jede Aktion einer Person zugeordnet werden kann.

**Akzeptanzkriterien**
- [ ] Konten für Systemintegration und Anwendungsentwicklung sind angelegt; das Verfahren für weitere Konten ist dokumentiert
- [ ] Jedes Konto meldet sich mit einem eigenen RSA-Schlüssel (mindestens 3072 Bit) an; auf dem Server liegen nur die öffentlichen Schlüssel (Rechte `700` für `.ssh`, `600` für `authorized_keys`)
- [ ] Das SI-Konto hat volle sudo-Rechte (mit Passwort); das AE-Konto startet ohne sudo-Rechte und nutzt Docker rootless (siehe #4)
- [ ] Zusätzliche sudo-Freigaben für das AE-Konto werden bei Bedarf im Team abgestimmt, einzeln und ohne Wildcards unter `/etc/sudoers.d/` eingetragen (mit `visudo -c` geprüft) und begründet dokumentiert
- [ ] Die Anmeldung mit allen neuen Konten ist erfolgreich getestet
- [ ] Eine kurze Anleitung zur SSH-Anmeldung mit Schlüssel liegt für neue Teammitglieder vor
- [ ] Die Benutzeranlage liegt als Skript versioniert im Git-Repository (nur öffentliche Schlüssel, keine Passwörter)

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 16. Server nach IT-Grundschutz härten

**Als** Systemadministrator
**möchte ich** den öffentlich erreichbaren VPS nach den Basismaßnahmen des IT-Grundschutz härten,
**damit** ab dem ersten Tag eine sichere Grundlage für alle weiteren Komponenten besteht.

**Voraussetzung:** #2 ist abgeschlossen (Anmeldung mit persönlichen Konten funktioniert)

**Akzeptanzkriterien**
- [ ] SSH-Anmeldung als root und per Passwort ist deaktiviert; die wirksame Konfiguration ist mit `sshd -T` geprüft
- [ ] Die Firewall lässt ausschließlich benötigte Ports zu
- [ ] Ein Schutz gegen Brute-Force-Angriffe (z. B. fail2ban) ist aktiv
- [ ] Automatische Sicherheitsupdates sind eingerichtet
- [ ] Eine Schutzbedarfsanalyse (Vertraulichkeit, Integrität, Verfügbarkeit) ist dokumentiert und die Maßnahmen sind den Bausteinen SYS.1.1 und SYS.1.3 zugeordnet
- [ ] Die Härtung liegt als Skript versioniert im Git-Repository und ist reproduzierbar ausführbar

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 17. Rootless Docker für das Entwicklerkonto einrichten

**Als** Anwendungsentwickler
**möchte ich** mit meinem eigenen Konto Container ohne root-Rechte starten können,
**damit** ich selbstständig arbeiten kann, ohne Root-Zugriff auf den Server zu erhalten.

**Voraussetzung:** #8 (Docker installiert) und #2 (AE-Konto vorhanden)

**Akzeptanzkriterien**
- [ ] Rootless Docker ist für das AE-Konto eingerichtet (Einträge in `/etc/subuid` und `/etc/subgid` vorhanden, Setup über `dockerd-rootless-setuptool.sh`)
- [ ] Der Docker-Dienst des Kontos läuft als systemd-User-Dienst und startet auch ohne aktive Anmeldung (`loginctl enable-linger`)
- [ ] `docker info` zeigt `rootless` unter den Security Options; das Konto ist nicht Mitglied der Gruppe `docker`
- [ ] Die unter Ubuntu 24.04 aktive AppArmor-Beschränkung für unprivilegierte User-Namespaces ist per AppArmor-Profil für rootlesskit gelöst
- [ ] Die Einrichtung liegt als Skript versioniert im Git-Repository

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-M`

---

## 18. Reservierung stornieren oder ändern

**Als** Kunde
**möchte ich** eine bestehende Reservierung innerhalb einer angemessenen Frist selbst stornieren oder auf einen anderen Zeitraum ändern können,
**damit** ich flexibel auf Planänderungen reagieren kann, ohne den Verleih-Mitarbeiter anrufen zu müssen.

**Akzeptanzkriterien**
- [ ] Kunde sieht in seinem Bereich alle eigenen aktiven Reservierungen
- [ ] Stornierung ist bis zu einer konfigurierbaren Frist vor Mietbeginn möglich, danach nicht mehr über Selfservice
- [ ] Änderung des Zeitraums prüft erneut die Verfügbarkeit der Maschine
- [ ] Stornierung/Änderung wird im Auftrags-/Audit-Verlauf nachvollziehbar protokolliert
- [ ] Kunde erhält eine Bestätigung der Stornierung/Änderung

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-M`

---

## 19. Rechnung aus Auftrag erzeugen, UStG/GoBD-konform

**Als** Verleih-Mitarbeiter
**möchte ich** dass aus einem abgeschlossenen Auftrag automatisch eine formal korrekte Rechnung mit allen Pflichtangaben nach UStG erzeugt wird,
**damit** die Abrechnung rechtssicher, nachvollziehbar und GoBD-konform erfolgt und nicht mehr manuell in Excel gepflegt werden muss.

**Voraussetzung:** #12 (Auftrag mit Audit-Trail existiert)

**Akzeptanzkriterien**
- [ ] Rechnung enthält alle Pflichtangaben nach § 14 UStG (fortlaufende Rechnungsnummer, Steuernummer/USt-ID, Leistungszeitraum, Steuersatz/-betrag, Rechnungs- und Leistungsdatum)
- [ ] Rechnungsnummern werden lückenlos und fortlaufend vergeben
- [ ] Einmal erzeugte Rechnungen sind unveränderbar (Korrekturen nur per Storno-/Korrekturrechnung)
- [ ] Rechnung wird als PDF erzeugt und ist archivierbar (GoBD-konforme, unveränderbare Ablage)
- [ ] Erzeugung und jede Statusänderung der Rechnung wird im Audit-Log protokolliert

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** XL (mehr als 16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-XL`

---

## 20. Zahlungsabwicklung anbinden

**Als** Kunde
**möchte ich** eine offene Rechnung direkt online bezahlen können (z. B. per Überweisung mit Referenz oder Zahlungsdienstleister),
**damit** der Bezahlvorgang für mich einfach ist und der Verleiher den Zahlungseingang automatisch zuordnen kann.

**Voraussetzung:** #20 (Rechnung wird erzeugt)

**Akzeptanzkriterien**
- [ ] Rechnung zeigt Zahlungsstatus (offen/bezahlt/überfällig)
- [ ] Zahlungseingänge werden automatisiert oder halbautomatisiert einer Rechnung zugeordnet
- [ ] Bei überfälligen Zahlungen wird eine Erinnerung ausgelöst
- [ ] Zahlungsdaten (z. B. Kartendaten) werden nicht selbst gespeichert, sondern über einen zertifizierten Zahlungsdienstleister verarbeitet
- [ ] Jede Statusänderung ist im Audit-Log nachvollziehbar

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-L`

---

## 21. Kundenportal – eigene Buchungen und Rechnungen einsehen

**Als** Kunde
**möchte ich** in einem persönlichen Bereich alle meine Reservierungen, Aufträge und Rechnungen auf einen Blick sehen können,
**damit** ich jederzeit den Überblick über meine Ausleihen und offenen Zahlungen habe, ohne nachfragen zu müssen.

**Akzeptanzkriterien**
- [ ] Übersicht zeigt aktive, vergangene und stornierte Reservierungen/Aufträge
- [ ] Rechnungen sind einzeln aufrufbar und als PDF herunterladbar
- [ ] Kunde sieht ausschließlich eigene Daten (siehe #11 – Rollen und Zugriffsrechte)
- [ ] Oberfläche ist gemäß ISO 9241 barrierefrei bedienbar

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-M`

---

## 22. Verwaltungsoberfläche für Mitarbeiter

**Als** Verleih-Mitarbeiter
**möchte ich** alle Reservierungen und Aufträge in einer zentralen Oberfläche einsehen, filtern und bei Bedarf manuell anpassen können,
**damit** ich Sonderfälle (z. B. telefonische Buchungen, Reklamationen) bearbeiten kann, ohne direkt in der Datenbank arbeiten zu müssen.

**Akzeptanzkriterien**
- [ ] Liste aller Reservierungen/Aufträge mit Filter nach Status, Kunde, Zeitraum und Maschine
- [ ] Mitarbeiter kann Status manuell ändern (z. B. Auftrag stornieren, Sonderkonditionen vermerken)
- [ ] Jede manuelle Änderung wird im Audit-Log protokolliert (wer, was, wann)
- [ ] Zugriff ist auf die Rolle „Mitarbeiter“/„Admin“ beschränkt

**Lernfeld:** LF11a – Funktionalität in Anwendungen realisieren (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11a`, `fachrichtung-AE`, `size-M`

---

## 23. Online-Shop für Verbrauchsmaterial anbinden

**Als** Kunde
**möchte ich** passendes Verbrauchsmaterial (z. B. Öl, Ersatzteile) direkt im Zusammenhang mit einer gemieteten Maschine online bestellen können,
**damit** ich alles Nötige für den Betrieb der Maschine an einer Stelle bekomme, ohne einen separaten Lieferanten suchen zu müssen.

**Akzeptanzkriterien**
- [ ] Produktkatalog für Verbrauchsmaterial mit Bestand, Preis und Verknüpfung zu passenden Maschinentypen
- [ ] Bestellung erzeugt einen Auftrag/eine Position, die zusammen mit der Maschinenmiete abgerechnet werden kann
- [ ] Lagerbestand wird bei Bestellung reduziert und bei Unterschreiten eines Mindestbestands markiert
- [ ] Bestellhistorie ist pro Kunde einsehbar

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-L`

---

## 24. Barrierefreiheitsprüfung nach ISO 9241 durchführen

**Als** Anwendungsentwickler
**möchte ich** die zentralen Oberflächen der Anwendung systematisch auf Barrierefreiheit nach ISO 9241 prüfen und gefundene Mängel beheben,
**damit** die Anwendung von möglichst vielen Nutzergruppen (z. B. mit Sehbeeinträchtigung oder motorischen Einschränkungen) bedienbar ist.

**Akzeptanzkriterien**
- [ ] Zentrale Seiten (Suche/Reservierung, Kundenportal, Verwaltung) sind mit einem automatisierten Tool (z. B. axe, Lighthouse) geprüft
- [ ] Tastaturbedienbarkeit ist für alle zentralen Funktionen sichergestellt
- [ ] Kontraste, Beschriftungen (Labels/ARIA) und Fokusreihenfolge entsprechen den Grundanforderungen von ISO 9241
- [ ] Gefundene Mängel sind dokumentiert und die kritischen sind behoben
- [ ] Ergebnis ist als kurzer Prüfbericht dokumentiert

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-M`

---

## 25. Backup- und Restore-Konzept für alle Dienste

**Als** Systemadministrator
**möchte ich** ein einheitliches Backup-Konzept für alle produktiven Dienste (Anwendung, Datenbank, Mailserver, Dateien) erstellen und automatisiert umsetzen,
**damit** im Fehlerfall kein Datenverlust entsteht und der Betrieb zuverlässig wiederhergestellt werden kann.

**Akzeptanzkriterien**
- [ ] Für jeden Dienst ist festgelegt, was, wie oft und wohin gesichert wird
- [ ] Backups laufen automatisiert (z. B. per Cronjob/Systemd-Timer) und sind versioniert im IaC-Setup hinterlegt
- [ ] Backups liegen getrennt vom Produktivsystem (z. B. externer Speicher)
- [ ] Ein vollständiger Restore aus dem Backup wurde mindestens einmal erfolgreich getestet und dokumentiert
- [ ] Aufbewahrungsfristen sind festgelegt und begründet

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-L`

---

## 26. Monitoring und Alerting für Anwendung und Reverse Proxy

**Als** Systemadministrator
**möchte ich** Verfügbarkeit, Antwortzeiten und Fehlerraten von Client-Server-Anwendung und Reverse Proxy laufend überwachen,
**damit** Ausfälle oder Leistungsprobleme erkannt werden, bevor Kunden sie melden.

**Akzeptanzkriterien**
- [ ] Monitoring erfasst Erreichbarkeit, Antwortzeiten und HTTP-Fehlerraten der Anwendung
- [ ] Bei Ausfall oder Grenzwertüberschreitung wird automatisch eine Benachrichtigung ausgelöst
- [ ] Ein einfaches Dashboard zeigt den aktuellen Systemzustand
- [ ] Monitoring-Konfiguration liegt versioniert im Repository (IaC)

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-L`

---

## 27. CI/CD-Pipeline für Build, Test und Deployment

**Als** Entwicklerteam
**möchte ich** dass Änderungen am Code automatisiert gebaut, getestet und auf den Server ausgerollt werden,
**damit** neue Funktionen schnell und ohne manuelle Fehlerquellen produktiv verfügbar sind.

**Akzeptanzkriterien**
- [ ] Push auf den Hauptbranch löst automatisch Build und Testlauf aus
- [ ] Fehlgeschlagene Tests verhindern das Deployment
- [ ] Erfolgreiches Deployment rollt die neue Version automatisiert auf den Server aus (z. B. via SSH/Container-Registry)
- [ ] Pipeline-Konfiguration liegt versioniert im Repository
- [ ] Ein Rollback auf die vorherige Version ist mit einem definierten Schritt möglich

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-L`

---

## 28. Objektspeicher für Dateien bereitstellen

**Als** Systemadministrator
**möchte ich** einen S3-kompatiblen Objektspeicher für Dateien wie Rechnungs-PDFs und Maschinenbilder bereitstellen,
**damit** Dateien zentral, sicher und unabhängig vom Anwendungsserver abgelegt werden können.

**Akzeptanzkriterien**
- [ ] Objektspeicher läuft containerisiert und ist per IaC-Skript reproduzierbar aufsetzbar
- [ ] Zugriff erfolgt ausschließlich über Zugangsschlüssel, keine öffentlich beschreibbaren Buckets
- [ ] Die Anwendung kann eine Testdatei erfolgreich hoch- und herunterladen
- [ ] Backups des Objektspeichers sind Teil des Backup-Konzepts (siehe #26)

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-M`

---

## 29. Zentrales Log-Management für alle Container-Dienste

**Als** Systemadministrator
**möchte ich** die Logs aller Container-Dienste zentral sammeln und durchsuchbar machen,
**damit** ich bei Störungen oder Sicherheitsvorfällen schnell die Ursache über alle Dienste hinweg finden kann.

**Akzeptanzkriterien**
- [ ] Logs aller produktiven Container laufen in einer zentralen Sammelstelle zusammen
- [ ] Logs sind nach Dienst, Zeitraum und Suchbegriff filterbar
- [ ] Log-Aufbewahrung ist zeitlich begrenzt und begründet festgelegt (Speicherplatz, Datenschutz)
- [ ] Zugriff auf die Logs ist auf berechtigte Rollen beschränkt

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 30. Notfallwiederherstellung der Gesamtumgebung proben

**Als** Systemadministrator
**möchte ich** den vollständigen Ausfall der Serverumgebung simulieren und die Wiederherstellung aus IaC-Skripten und Backups einmal komplett durchspielen,
**damit** im echten Notfall klar ist, dass und wie schnell die Umgebung wiederhergestellt werden kann.

**Akzeptanzkriterien**
- [ ] Ein definierter Ablaufplan für die Notfallwiederherstellung liegt dokumentiert vor
- [ ] Die Wiederherstellung wurde mindestens einmal auf einer separaten Umgebung vollständig durchgeführt
- [ ] Die dafür benötigte Zeit (Recovery Time) ist gemessen und dokumentiert
- [ ] Erkannte Lücken im IaC-Setup oder Backup-Konzept sind nachgebessert

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## Mapping: Story-Nummer (dieses Dokument) ↔ GitHub-Issue-Nummer

| Story | Issue | Story | Issue | Story | Issue |
|---|---|---|---|---|---|
| 1 | #5 | 11 | #15 | 21 | #22 |
| 2 | #6 | 12 | #16 | 22 | #23 |
| 3 | #7 | 13 | #17 | 23 | #24 |
| 4 | #8 | 14 | #18 | 24 | #25 |
| 5 | #9 | 15 | #2 | 25 | #26 |
| 6 | #10 | 16 | #3 | 26 | #27 |
| 7 | #11 | 17 | #4 | 27 | #28 |
| 8 | #12 | 18 | #19 | 28 | #29 |
| 9 | #13 | 19 | #20 | 29 | #30 |
| 10 | #14 | 20 | #21 | 30 | #31 |

Hinweis: In den Story-Texten oben stehen Querverweise bereits direkt als `#<Issue-Nummer>`.
