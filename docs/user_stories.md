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

**Qualitätsmaßstab:** Die Stories sind nach INVEST formuliert: unabhängig (bekannte
Abhängigkeiten stehen ausdrücklich dabei), verhandelbar, wertvoll, schätzbar, klein
genug für eine umsetzbare Scheibe und anhand der Akzeptanzkriterien testbar. Größere
Themen sind auf einen klar begrenzten ersten Ausbauschritt reduziert; Erweiterungen
werden später separat priorisiert.

**Sprint-1-Vorschlag:** Sprintumfang und Auswahl der Stories werden im Kanban-Board
festgelegt. Die folgenden fachlichen Stories bilden den Projekt-Backlog und sind
nicht automatisch alle für denselben Sprint vorgesehen.

---

## 1. Maschinen nach Verfügbarkeit suchen und reservieren

**Als** Kunde
**möchte ich** verfügbare Maschinen nach Kategorie, Zeitraum und Standort suchen und eine passende Maschine reservieren können,
**damit** ich die Verfügbarkeit prüfen und meine Buchungsanfrage online abschließen kann.

**Voraussetzung:** #9 (Client-Server-Grundgerüst) und #6 (Maschinenstammdaten sind verfügbar)

**Akzeptanzkriterien**
- [ ] Kunde kann Kategorie, Zeitraum und Standort angeben; unvollständige oder ungültige Zeiträume werden verständlich zurückgewiesen
- [ ] Ergebnisliste enthält nur Maschinen, die im vollständigen Zeitraum frei sind; bei keinem Treffer wird ein leerer Zustand angezeigt
- [ ] Für eine ausgewählte Maschine kann der Kunde eine Reservierung absenden und erhält eine Bestätigung mit Maschine und Zeitraum
- [ ] Zwei gleichzeitig eingereichte, überlappende Reservierungen derselben Maschine können nicht beide bestätigt werden
- [ ] Die Reservierung ist mit Tastatur bedienbar und Eingabefelder besitzen sichtbare Beschriftungen

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-L`

---

## 2. Maschinenstammdaten erfassen und verwalten

**Als** Verleih-Mitarbeiter
**möchte ich** Maschinenstammdaten (Typ, Baujahr, Betriebsstunden und Wartungsintervall) anlegen, ansehen und bearbeiten können,
**damit** Mitarbeitende die für den Verleih benötigten Maschinendaten zentral und konsistent pflegen können.

**Voraussetzung:** #9 (Client-Server-Grundgerüst mit Datenbankanbindung)

**Akzeptanzkriterien**
- [ ] Mitarbeitende können eine Maschine mit Typ, Baujahr, Betriebsstunden und Wartungsintervall anlegen und gespeicherte Werte wieder aufrufen
- [ ] Pflichtfelder und Wertebereiche sind festgelegt; fehlende oder ungültige Eingaben werden am Feld erklärt und nicht gespeichert
- [ ] Änderungen an einer Maschine werden nach dem Speichern in der Detailansicht angezeigt
- [ ] Maschinen mit gleicher eindeutiger Kennung können nicht doppelt angelegt werden
- [ ] Excel-Import und Audit-Protokoll sind nicht Teil dieses ersten CRUD-Schritts und werden separat geplant

**Lernfeld:** LF5 – Software zur Verwaltung von Daten anpassen
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF5`, `size-M`

---

## 3. Wartungsbedarf regelbasiert berechnen und anzeigen

**Als** Werkstattplaner
**möchte ich** für jede Maschine einen nachvollziehbaren Wartungsstatus anhand des Betriebsstunden- und Zeitintervalls sehen,
**damit** ich fällige Wartungen frühzeitig einplanen kann.

**Voraussetzung:** #6 (Maschinenstammdaten mit Betriebsstunden und Wartungsintervallen)

**Akzeptanzkriterien**
- [ ] Für eine Maschine mit vollständig gepflegten Wartungsdaten wird der Status „in Ordnung“, „bald fällig“ oder „überfällig“ angezeigt
- [ ] Grenzwerte für „bald fällig“ sind dokumentiert und an einer zentralen Stelle änderbar
- [ ] Fehlende Wartungsdaten werden als „nicht bestimmbar“ angezeigt und nicht fälschlich als „in Ordnung“ gewertet
- [ ] Die Statusberechnung ist durch Tests für alle drei Status und fehlende Werte abgedeckt
- [ ] Export und Übergabe an externe Werkstattplanung sind nicht Teil dieses ersten Ausbauschritts

**Lernfeld:** LF11a – Funktionalität in Anwendungen realisieren (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11a`, `fachrichtung-AE`, `size-M`

---

## 4. Reverse Proxy automatisiert bereitstellen (Infrastructure-as-Code)

**Als** Entwicklerteam
**möchte ich** den Reverse Proxy per Infrastructure-as-Code/Configuration-as-Code automatisiert aufsetzen können,
**damit** die Umgebung jederzeit reproduzierbar zerstört und neu aufgebaut werden kann, statt alles manuell zu konfigurieren.

**Voraussetzung:** #XX (Docker ist auf dem Server installiert, siehe Story 31)

**Akzeptanzkriterien**
- [ ] Ein Skript/Playbook (z. B. Ansible, Docker Compose) richtet den Reverse Proxy vollautomatisch ein
- [ ] Die gesamte Konfiguration liegt versioniert im Git-Repository
- [ ] Nach vollständigem Löschen der Umgebung stellt ein einzelner Befehl sie wieder her
- [ ] Der Reverse Proxy leitet eine Testanfrage per HTTPS mit gültigem Zertifikat an einen Platzhalterdienst weiter

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-M`

---

## 5. Lauffähiges Client-Server-Grundgerüst mit Datenbankanbindung aufsetzen

**Als** Entwicklerteam
**möchte ich** einen kleinen Client mit einem objektorientierten Server und einem Datenbankzugriff über eine explizite Datenbank-API verbinden,
**damit** wir eine getestete technische Grundlage für weitere fachliche Funktionen haben.

**Voraussetzung:** #8 (Reverse Proxy ist eingerichtet) und #13 (Datenbanksystem ist im Team ausgewählt)

**Akzeptanzkriterien**
- [ ] Der Server ist über die vereinbarte Route des Reverse Proxys erreichbar und liefert auf eine dokumentierte Testanfrage eine erfolgreiche Antwort
- [ ] Ein Testendpunkt speichert und liest einen Beispieldatensatz über den vorgesehenen Datenbanktreiber bzw. das Datenbankprotokoll
- [ ] Der Client ruft den Testendpunkt auf und zeigt den gelesenen Beispielwert an
- [ ] Datenbank und Schema werden nicht von ORM, Framework oder anderem Tool implizit erzeugt; Einrichtung und Schemaänderung sind explizit nachvollziehbar
- [ ] Eine einfache Komponenten- oder Deployment-Übersicht zeigt Client, Server, Datenbank-API und Datenbank

**Lernfeld:** LF5 – Software zur Verwaltung von Daten anpassen
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF5`, `size-L`

---

## 6. Kundenstammdaten aus dem Altsystem übernehmen

**Als** Verleih-Mitarbeiter
**möchte ich** einen bereitgestellten Excel-Export mit Kundendaten wiederholbar in das neue System importieren können,
**damit** Kundendaten beim Umstieg vollständig und ohne unbeabsichtigte Duplikate übernommen werden.

**Voraussetzung:** #9 (Client-Server-Grundgerüst mit Datenbankanbindung)

**Akzeptanzkriterien**
- [ ] Ein festgelegtes Excel-Dateiformat wird eingelesen und auf die dokumentierten Kundenfelder abgebildet
- [ ] Vor dem Import wird eine Zusammenfassung mit Anzahl gültiger und fehlerhafter Zeilen angezeigt
- [ ] Ungültige Zeilen werden mit Zeilennummer und Fehlergrund ausgewiesen und nicht stillschweigend importiert
- [ ] Erneuter Import derselben Datei erzeugt keine doppelten Kunden
- [ ] Manuelles Anlegen und Bearbeiten von Kunden ist nicht Teil dieser Importscheibe

**Lernfeld:** LF8 – Daten systemübergreifend bereitstellen
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF8`, `size-L`

---

## 7. Rollen- und Zugriffsrechte verwalten

**Als** Systemverantwortlicher
**möchte ich** mich anmelden und nur Funktionen aufrufen können, die meiner zugewiesenen Rolle erlaubt sind,
**damit** geschützte Kunden- und Verwaltungsfunktionen nicht von unberechtigten Personen verwendet werden können.

**Voraussetzung:** #9 (Server-Grundgerüst mit Datenbankanbindung)

**Akzeptanzkriterien**
- [ ] Ein Nutzer kann sich mit gültigen Zugangsdaten anmelden; ungültige Zugangsdaten führen zu einer neutralen Fehlermeldung
- [ ] Passwörter werden ausschließlich mit einem geeigneten Passwort-Hashverfahren gespeichert, niemals im Klartext
- [ ] Mindestens die Rollen „Kunde“ und „Mitarbeiter“ sind definiert; ein nicht angemeldeter Nutzer erhält keinen Zugriff auf geschützte Funktionen
- [ ] Ein Kunde kann über die API nur eigene Beispieldaten abrufen; der Versuch, eine fremde Kunden-ID anzufordern, wird abgewiesen
- [ ] Rollen- und Berechtigungsregeln sind dokumentiert und durch automatisierte Tests abgedeckt

**Lernfeld:** LF11a – Funktionalität in Anwendungen realisieren (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11a`, `fachrichtung-AE`, `size-L`

---

## 8. Buchung zu einem verbindlichen Auftrag mit Audit-Trail machen

**Als** Kunde
**möchte ich** eine bestätigte Reservierung als Auftrag mit eindeutiger Nummer wiederfinden können,
**damit** sowohl der Kunde als auch der Verleiher einen eindeutigen Nachweis über die Buchung haben.

**Voraussetzung:** #5 (Reservierung kann angelegt werden)

**Akzeptanzkriterien**
- [ ] Für eine bestätigte Reservierung wird genau ein Auftrag mit eindeutiger Nummer sowie Kunde, Maschine und Zeitraum erzeugt
- [ ] Bei fehlender oder bereits verarbeiteter Reservierung wird kein doppelter Auftrag angelegt und ein verständlicher Fehler zurückgegeben
- [ ] Kunde und berechtigter Mitarbeiter können Nummer und aktuellen Status des Auftrags abrufen
- [ ] Erzeugung und Statusänderung werden mit Zeitpunkt, Nutzer und Aktion protokolliert; das Protokoll ist über die Anwendung nicht änderbar
- [ ] Rechnungsstellung und Korrekturverfahren sind nicht Teil dieser ersten Auftragsscheibe

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-L`

---

## 9. Datenbanksystem kriteriengeleitet auswählen

**Als** Systemadministrator
**möchte ich** anhand vorher festgelegter, zum Schulprojekt passender Kriterien ein Datenbanksystem auswählen,
**damit** die technische Grundlage vor der Bereitstellung begründet und im Team nachvollziehbar beschlossen ist.

**Akzeptanzkriterien**
- [ ] Mindestens PostgreSQL, MariaDB und MySQL werden mit vorab festgelegten Kriterien verglichen; Kriterien und Gewichte ergeben zusammen 100 %
- [ ] Lizenz- und Anschaffungskosten fließen nicht in die Bewertung ein, da für Datenbanksoftware kein Budget vorgesehen ist
- [ ] Für jedes Kriterium sind Skala, Punkte und gewichteter Beitrag nachvollziehbar dargestellt; die Summen sind rechnerisch korrekt
- [ ] Die Analyse enthält eine Empfehlung, Einschränkungen und Faktoren, die das Ergebnis ändern könnten
- [ ] Das Team bestätigt die Auswahl und hält sie in der Analyse oder einem Architecture Decision Record fest
- [ ] Die Anwendung greift später ausschließlich über eine Datenbank-API auf das ausgewählte System zu; ein Werkzeug darf Datenbank oder Schema nicht ungefragt erzeugen

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-M`

---

## 10. Datenbank-Server produktiv bereitstellen

**Als** Systemadministrator
**möchte ich** den ausgewählten Datenbankserver versioniert und reproduzierbar auf dem Strato-VPS betreiben,
**damit** die Anwendung eine erreichbare Datenbank mit kontrolliertem Zugriff verwenden kann.

**Voraussetzung:** #13 (Datenbanksystem ist ausgewählt) und #9 (Anwendung kann Datenbankzugriffe testen)

**Akzeptanzkriterien**
- [ ] Eine festgelegte Version des ausgewählten Datenbanksystems startet mit einem dokumentierten IaC-/Container-Aufruf und verwendet persistenten Speicher
- [ ] Der Datenbankport ist nur für die Anwendungsdienste bzw. ausdrücklich freigegebene Quellen erreichbar
- [ ] Zugangsdaten werden außerhalb des Repositorys bereitgestellt; ein Start ohne erforderliche Zugangsdaten schlägt sichtbar fehl
- [ ] Der Anwendungsserver aus #9 kann über seinen Datenbanktreiber eine Verbindung herstellen und eine Testabfrage ausführen
- [ ] Das Datenbankschema wird nicht durch den Containerstart oder ein ORM ungefragt erzeugt; Schemaeinrichtung ist als expliziter Schritt dokumentiert
- [ ] Backup und Restore werden in #26 behandelt und sind keine Voraussetzung für diese erste Bereitstellungsscheibe

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-L`

---

## 11. Mailserver-System kriteriengeleitet auswählen

**Als** Systemadministrator
**möchte ich** Mailcow, docker-mailserver und Stalwart anhand vorher festgelegter Projektkriterien vergleichen,
**damit** das Team eine nachvollziehbare Grundlage für den späteren E-Mail-Versand erhält.

**Akzeptanzkriterien**
- [ ] Alle drei vorgegebenen Systeme werden mit denselben, vorab festgelegten Kriterien verglichen; Gewichte ergeben 100 %
- [ ] Punkte und gewichtete Beiträge sind auf einer einheitlichen Skala angegeben und die Gesamtsummen sind nachgerechnet
- [ ] Ressourcenbedarf wird mit der tatsächlich verfügbaren VPS-Konfiguration abgeglichen
- [ ] Die Nutzwertanalyse benennt Empfehlung, wesentliche Risiken und mögliche Gründe für eine andere Wahl
- [ ] Das Team bestätigt die Auswahl; die Container- und Reverse-Proxy-Kompatibilität wird vor der Bereitstellung konkret geprüft

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-M`

---

## 12. Mailserver produktiv bereitstellen

**Als** Systemadministrator
**möchte ich** mit dem ausgewählten Mailserver aus der Anwendung eine Test-E-Mail sicher versenden können,
**damit** die technische Verbindung für spätere Buchungsbestätigungen nachgewiesen ist.

**Voraussetzung:** #15 (Mailserver-System ist ausgewählt) und #8 (Container-/Proxy-Umgebung ist verfügbar)

**Akzeptanzkriterien**
- [ ] Der ausgewählte Mailserver startet mit versionierter Konfiguration reproduzierbar auf der Zielumgebung
- [ ] Zugangsdaten werden außerhalb des Repositorys verwaltet und sind nicht in Logs oder Antworten sichtbar
- [ ] Ein dokumentierter Test-Endpunkt oder Testlauf sendet genau eine Nachricht an eine festgelegte Testadresse und meldet Erfolg oder Fehler nachvollziehbar
- [ ] SPF-, DKIM- und DMARC-Einträge werden dokumentiert; Zustellbarkeit wird mit einer Testnachricht geprüft
- [ ] Backup und Wiederherstellung von Maildaten werden in #26 behandelt und sind nicht Teil dieses ersten Versandtests

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-L`

---

## 13. Verfügbarkeit von Datenbank- und Mailserver überwachen

**Als** Systemadministrator
**möchte ich** den Zustand von Datenbank- und Mailserver anhand weniger festgelegter Prüfwerte überwachen,
**damit** ein Ausfall oder eine kritische Ressourcensituation zeitnah erkannt wird.

**Voraussetzung:** #14 und #16 (Datenbank- und Mailserver sind produktiv im Einsatz)

**Akzeptanzkriterien**
- [ ] Für Datenbank und Mailserver werden Erreichbarkeit und Speicherbelegung mit Zeitstempel erfasst
- [ ] Ein definierter Grenzwert für Nichterreichbarkeit und für kritische Speicherbelegung löst jeweils eine sichtbare Benachrichtigung aus
- [ ] Das Dashboard zeigt den letzten Prüfzeitpunkt und den aktuellen Zustand beider Dienste
- [ ] Ein kurzer Ablauf für „Dienst nicht erreichbar“ nennt Zuständigkeit und erste Prüfschritte
- [ ] Serverhärtung und Update-Management werden in #3, zentrales Log-Management in #30 behandelt

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-L`

---

## 14. TLS-Verschlüsselung automatisiert verwalten

**Als** Systemadministrator
**möchte ich** TLS-Zertifikate für die tatsächlich eingerichteten Web-Subdomains automatisch beziehen und erneuern lassen,
**damit** der Browser die Webanwendung über HTTPS mit einem gültigen Zertifikat erreicht.

**Voraussetzung:** #8 (Reverse Proxy ist eingerichtet)

**Akzeptanzkriterien**
- [ ] Für jede im Sprint eingerichtete Web-Subdomain stellt der Reverse Proxy automatisiert ein gültiges Zertifikat bereit
- [ ] Eine Anfrage über HTTP wird auf dieselbe Adresse unter HTTPS umgeleitet
- [ ] Zertifikatsablauf und automatische Erneuerung sind über den Status des Proxy bzw. einen Erneuerungstest nachvollziehbar
- [ ] Proxy-Konfiguration ist versioniert; private Schlüssel oder Zugangsdaten sind nicht eingecheckt
- [ ] Ein TLS-Prüfwerkzeug bestätigt ein gültiges Zertifikat und eine erfolgreiche HTTPS-Verbindung
- [ ] Mail-Protokolle und noch nicht bereitgestellte Shop-Subdomains sind nicht Teil dieser Web-TLS-Scheibe

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-M`

---

## 15. Persönliche Benutzerkonten mit SSH-Key einrichten

**Als** Systemadministrator
**möchte ich** für die Teammitglieder getrennte Serverkonten mit jeweils eigenem SSH-Schlüssel einrichten,
**damit** administrative und Entwicklungszugriffe Personen zugeordnet und auf das notwendige Maß begrenzt werden können.

**Akzeptanzkriterien**
- [ ] Für SI und AE existiert je ein benanntes persönliches Konto; das Verfahren für ein weiteres Konto ist dokumentiert
- [ ] Jedes Konto akzeptiert seinen eigenen Schlüssel mit mindestens 3072 Bit; auf dem Server liegt nur der öffentliche Schlüssel und die Verzeichnisrechte sind `700`/`600`
- [ ] SI kann administrative Aufgaben über sudo mit Passwort ausführen; AE ist nicht Mitglied der sudo- oder Docker-Gruppe
- [ ] Ein Login-Test mit jedem Konto ist erfolgreich und der verwendete Benutzer ist auf dem Server eindeutig feststellbar
- [ ] Die SSH-Kurzanleitung nennt Erzeugung, sichere Weitergabe des öffentlichen Schlüssels und Login-Test
- [ ] Einrichtungsskript bzw. Ablauf enthält keine privaten Schlüssel, Passwörter oder sonstigen Geheimnisse
- [ ] Rootless Docker und zusätzliche AE-Sudo-Freigaben sind nicht Teil dieser Konten-Story und werden separat umgesetzt

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 16. Server nach IT-Grundschutz härten

**Als** Systemadministrator
**möchte ich** die SSH- und Netzwerkzugänge des öffentlich erreichbaren VPS mit den festgelegten Grundmaßnahmen absichern,
**damit** der Server nur über notwendige und nachvollziehbare Zugänge erreichbar ist.

**Voraussetzung:** #2 ist abgeschlossen (Anmeldung mit persönlichen Konten funktioniert)

**Akzeptanzkriterien**
- [ ] Nach erfolgreichem Test eines sudo-Kontos aus #2 ist Root-SSH-Login gesperrt; `sshd -T` bestätigt die wirksame Einstellung
- [ ] SSH-Passwortanmeldung ist deaktiviert und ein Test bestätigt, dass nur vorgesehene Schlüsselkonten zugelassen werden
- [ ] Firewall-Regeln erlauben nur dokumentierte notwendige Ports; ein Test von außen bestätigt einen nicht benötigten Port als geschlossen
- [ ] Brute-Force-Schutz und automatische Sicherheitsupdates sind aktiv und ihr Status ist dokumentiert
- [ ] Eine kurze Schutzbedarfsbetrachtung ordnet die Maßnahmen den Grundschutz-Bausteinen SYS.1.1 und SYS.1.3 zu
- [ ] Konfiguration oder Skript ist versioniert und wiederholt ausführbar; ein erneuter Lauf erzeugt keinen Konfigurationsfehler

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 17. Rootless Docker für das Entwicklerkonto einrichten

**Als** Anwendungsentwickler
**möchte ich** Container mit meinem Entwicklerkonto im Rootless-Modus starten und stoppen können,
**damit** ich Entwicklungsdienste betreiben kann, ohne Mitglied der privilegierten Docker-Gruppe zu sein.

**Voraussetzung:** #XX (Docker installiert, Story 31) und #2 (AE-Konto vorhanden)

**Akzeptanzkriterien**
- [ ] Das AE-Konto hat gültige Subordinate UID/GID-Bereiche und der Rootless-Docker-Dienst startet ohne Root-Daemon
- [ ] `docker info` weist Rootless als Sicherheitsoption aus und das AE-Konto ist nicht Mitglied der Gruppe `docker`
- [ ] Ein Testcontainer kann ohne sudo gestartet, abgefragt und wieder entfernt werden
- [ ] Nach Abmeldung bleibt der User-Dienst gemäß vereinbarter Konfiguration erreichbar bzw. startet erneut
- [ ] Falls AppArmor die User-Namespaces blockiert, ist die dokumentierte Profilregel aktiv und ein Testcontainer startet erfolgreich
- [ ] Einrichtungsschritte sind versioniert; Zugangsdaten oder private Schlüssel sind nicht enthalten

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-M`

---

## 18. Reservierung stornieren oder ändern

**Als** Kunde
**möchte ich** eine eigene aktive Reservierung vor der festgelegten Frist stornieren oder deren Zeitraum ändern können,
**damit** ich Planänderungen selbstständig verwalten kann.

**Voraussetzung:** #5 (Reservierung ist möglich) und #11 (Kundenanmeldung und Zugriffsschutz)

**Akzeptanzkriterien**
- [ ] Ein angemeldeter Kunde sieht seine aktiven Reservierungen mit Maschine, Zeitraum und Status, aber keine fremden Reservierungen
- [ ] Stornierung ist bis zu einer dokumentierten Frist möglich; nach Fristablauf wird die Aktion abgewiesen und erklärt
- [ ] Bei einer Zeitraumänderung wird die Maschinenverfügbarkeit erneut geprüft; bei Konflikt bleibt die alte Reservierung unverändert
- [ ] Eine erfolgreiche Änderung oder Stornierung aktualisiert Status und Zeitstempel nachvollziehbar
- [ ] Der Kunde erhält nach erfolgreicher Änderung oder Stornierung eine sichtbare Bestätigung

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-M`

---

## 19. Rechnung aus Auftrag erzeugen, UStG/GoBD-konform

**Als** Verleih-Mitarbeiter
**möchte ich** aus einem abgeschlossenen Auftrag einen unveränderbaren Rechnungsentwurf mit den projektrelevanten Pflichtangaben erzeugen können,
**damit** Mitarbeitende den Abrechnungsdatensatz nachvollziehbar prüfen und als PDF bereitstellen können.

**Voraussetzung:** #12 (Auftrag mit Audit-Trail existiert)

**Akzeptanzkriterien**
- [ ] Für einen abgeschlossenen Auftrag wird höchstens ein Rechnungsdatensatz mit eindeutiger Rechnungsnummer angelegt
- [ ] Der Datensatz enthält Kunde, Auftrag, Leistungszeitraum, Rechnungsdatum, Einzelpositionen, Steuersatz und Steuerbetrag; fehlende Pflichtdaten verhindern die Erzeugung und werden benannt
- [ ] Nach Erzeugung sind Rechnungsdaten nicht überschreibbar; Korrektur oder Storno erzeugt einen verknüpften neuen Datensatz
- [ ] Für den Datensatz wird ein PDF erstellt, dessen angezeigte Werte mit den gespeicherten Rechnungsdaten übereinstimmen
- [ ] Erzeugung und Korrektur werden mit Nutzer und Zeitstempel protokolliert
- [ ] Die fachliche Prüfung der aktuell geltenden steuerrechtlichen und GoBD-Anforderungen erfolgt vor produktivem Einsatz; diese Projektstory ersetzt keine Rechtsberatung

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-L`

---

## 20. Zahlungsabwicklung anbinden

**Als** Kunde
**möchte ich** den Zahlungsstatus einer Rechnung einsehen und einen erfassten Zahlungseingang eindeutig zuordnen können,
**damit** offene und bezahlte Rechnungen für Kunde und Verleih nachvollziehbar sind.

**Voraussetzung:** #20 (Rechnung wird erzeugt)

**Akzeptanzkriterien**
- [ ] Eine Rechnung zeigt einen der dokumentierten Status „offen“, „bezahlt“ oder „überfällig“
- [ ] Ein berechtigter Mitarbeiter kann einen Zahlungseingang mit Betrag, Datum und Referenz genau einer Rechnung zuordnen
- [ ] Eine Zuordnung mit abweichendem Betrag oder bereits zugeordneter Referenz wird zur Prüfung markiert statt doppelt verbucht
- [ ] Der Kunde sieht den Zahlungsstatus seiner eigenen Rechnung, aber keine Zahlungsdaten anderer Kunden
- [ ] Status- und Zuordnungsänderungen sind mit Nutzer und Zeitstempel nachvollziehbar
- [ ] Kartenzahlung und Anbindung eines externen Zahlungsdienstleisters sind nicht Bestandteil dieses ersten Zahlungsstatus-Schritts

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-L`

---

## 21. Kundenportal – eigene Reservierungen und Aufträge ansehen

**Als** Kunde
**möchte ich** meine eigenen Reservierungen und zugehörigen Aufträge in einem persönlichen Bereich ansehen können,
**damit** ich den Stand meiner Buchungen ohne Nachfrage nachvollziehen kann.

**Voraussetzung:** #11 (Kundenanmeldung) sowie #5 (Reservierungen) und #12 (Aufträge)

**Akzeptanzkriterien**
- [ ] Nach der Anmeldung werden aktive, vergangene und stornierte Reservierungen mit Maschine, Zeitraum und Status angezeigt
- [ ] Zu einer Reservierung wird der zugehörige Auftrag mit Nummer und aktuellem Status angezeigt, sofern vorhanden
- [ ] Ein Kunde kann weder über die Oberfläche noch durch Änderung einer URL fremde Reservierungen oder Aufträge abrufen (#11)
- [ ] Bei fehlenden Buchungen wird ein verständlicher leerer Zustand angezeigt
- [ ] Rechnungsansicht und PDF-Download werden in einer eigenen Ausbaustory ergänzt

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-M`

---

## 22. Verwaltungsoberfläche für Mitarbeiter

**Als** Verleih-Mitarbeiter
**möchte ich** Reservierungen und Aufträge in einer Verwaltungsübersicht nach Status, Kunde und Zeitraum finden können,
**damit** ich Kundenanfragen und offene Vorgänge gezielt bearbeiten kann, ohne direkt auf die Datenbank zuzugreifen.

**Voraussetzung:** #11 (Mitarbeiterrolle), #5 (Reservierungen) und #12 (Aufträge)

**Akzeptanzkriterien**
- [ ] Angemeldete Mitarbeiter sehen eine paginierte Liste von Reservierungen und Aufträgen mit Status, Kunde, Maschine und Zeitraum
- [ ] Filter nach Status und Zeitraum liefern nur passende Datensätze; Kombinationen der Filter funktionieren gemeinsam
- [ ] Ein Mitarbeiter kann einen Datensatz öffnen und dessen vollständige Übersicht ansehen
- [ ] Ein Kunde oder nicht angemeldeter Nutzer kann diese Verwaltungsansicht nicht aufrufen
- [ ] Manuelle Statusänderungen und Sonderkonditionen sind nicht Teil dieser Lesescheibe und werden separat spezifiziert

**Lernfeld:** LF11a – Funktionalität in Anwendungen realisieren (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11a`, `fachrichtung-AE`, `size-M`

---

## 23. Online-Shop für Verbrauchsmaterial anbinden

**Als** Kunde
**möchte ich** ein für meinen gemieteten Maschinentyp freigegebenes Verbrauchsmaterial in einer Bestellung anfordern können,
**damit** ich benötigtes Material zusammen mit der Maschinenmiete beim Verleiher bestellen kann.

**Akzeptanzkriterien**
- [ ] Der Katalog zeigt aktive Produkte mit Bezeichnung, Preis, verfügbarem Bestand und kompatiblen Maschinentypen
- [ ] Ein Kunde kann nur ein Produkt für einen zugehörigen Maschinentyp bestellen; nicht verfügbare oder inkompatible Produkte werden abgewiesen
- [ ] Eine erfolgreiche Bestellung erzeugt eine eindeutig referenzierte Bestellposition und reduziert den Bestand genau einmal
- [ ] Reicht der Bestand nicht aus, wird keine Bestellung angelegt und der verfügbare Bestand angezeigt
- [ ] Bestellung und Bestand werden nach einem Fehler gemeinsam zurückgerollt, sodass kein halbfertiger Vorgang entsteht

**Lernfeld:** LF12a – Kundenspezifische Anwendungsentwicklung durchführen (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Gestaltung von IT-Dienstleistungen
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF12a`, `fachrichtung-AE`, `size-L`

---

## 24. Barrierefreiheitsprüfung nach ISO 9241 durchführen

**Als** Anwendungsentwickler
**möchte ich** den Buchungsablauf mit einer automatisierten und manuellen Barrierefreiheitsprüfung untersuchen,
**damit** wesentliche Bedienhindernisse vor dem Ausbau weiterer Oberflächen erkannt und behoben werden.

**Voraussetzung:** #5 (Buchungsablauf ist umgesetzt)

**Akzeptanzkriterien**
- [ ] Die vorhandenen Seiten des Buchungsablaufs werden mit einem festgelegten automatisierten Prüfwerkzeug geprüft; Werkzeug und Ergebnis sind dokumentiert
- [ ] Nutzer können den Ablauf ausschließlich mit Tastatur bedienen; Fokus ist stets sichtbar und folgt der visuellen Reihenfolge
- [ ] Eingabefelder besitzen programmatisch zugeordnete Beschriftungen und Fehler werden dem betroffenen Feld zugeordnet
- [ ] Gefundene Blocker für Tastaturbedienung oder Formularverständnis werden behoben; übrige Befunde sind mit Schweregrad und Folgeaufgabe dokumentiert
- [ ] Ein kurzer Prüfbericht nennt geprüfte Seiten, Browser, Werkzeug, Befunde und erneutes Prüfergebnis
- [ ] Kundenportal und Verwaltungsoberfläche werden erst geprüft, wenn diese Seiten umgesetzt sind

**Lernfeld:** LF10a – Benutzerschnittstellen gestalten und entwickeln (Fachrichtung Anwendungsentwicklung)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10a`, `fachrichtung-AE`, `size-M`

---

## 25. Backup und Wiederherstellung für Datenbank und Anwendung

**Als** Systemadministrator
**möchte ich** für Datenbank und Anwendungsdaten einen überprüfbaren Backup- und Restore-Ablauf einrichten,
**damit** ein Datenverlust durch einen getesteten Wiederherstellungsweg begrenzt werden kann.

**Voraussetzung:** #14 (Datenbankserver ist bereitgestellt)

**Akzeptanzkriterien**
- [ ] Gesicherte Daten, Sicherungsintervall, Aufbewahrungsdauer und Speicherort sind für Datenbank und Anwendungsdateien dokumentiert
- [ ] Sicherung wird automatisiert gestartet; Laufzeitpunkt und Erfolg oder Fehler sind prüfbar
- [ ] Mindestens eine Sicherung liegt außerhalb des laufenden Datenbankcontainers bzw. dessen alleiniger Datenträgerinstanz
- [ ] Ein Restore wird in eine getrennte Testinstanz durchgeführt; ein dokumentierter Prüfdatensatz ist danach lesbar
- [ ] Bei fehlgeschlagener Sicherung wird ein Fehler sichtbar gemeldet und die letzte erfolgreiche Sicherung bleibt erhalten
- [ ] Mailserver- und Objektspeicher-Backups werden nach Bereitstellung dieser Dienste in den Ablauf aufgenommen

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-L`

---

## 26. Monitoring und Alerting für Anwendung und Reverse Proxy

**Als** Systemadministrator
**möchte ich** die Erreichbarkeit und Antwortzeit der Anwendung über den Reverse Proxy überwachen,
**damit** ein Ausfall oder eine deutliche Verschlechterung frühzeitig sichtbar wird.

**Voraussetzung:** #8 (Reverse Proxy) und #9 (Anwendung ist erreichbar)

**Akzeptanzkriterien**
- [ ] Ein regelmäßig ausgeführter Probe-Aufruf erfasst HTTP-Erreichbarkeit, Antwortzeit und Fehlerstatus der Anwendung
- [ ] Ein Ausfall über den festgelegten Zeitraum löst eine sichtbare Benachrichtigung aus
- [ ] Ein Dashboard zeigt den letzten Messzeitpunkt und die letzten Probe-Ergebnisse
- [ ] Die Monitoring-Konfiguration ist versioniert und nach einem Neustart weiterhin aktiv
- [ ] Datenbank- und Mailserver-spezifische Metriken werden in den dafür vorgesehenen Betriebsschritten ergänzt

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-L`

---

## 27. Automatisierte Builds und Tests für Änderungen

**Als** Entwicklerteam
**möchte ich** bei jedem Pull Request automatisiert Build und Tests ausführen lassen,
**damit** fehlerhafte Änderungen erkannt werden, bevor sie in den Hauptbranch übernommen werden.

**Akzeptanzkriterien**
- [ ] Ein Pull Request startet automatisch den Build und die vorhandenen automatisierten Tests für Client und Server
- [ ] Der Status der Prüfungen ist am Pull Request sichtbar; fehlgeschlagene Pflichtprüfungen verhindern den Merge
- [ ] Die Pipeline-Konfiguration liegt versioniert im Repository und funktioniert bei einem erneuten Lauf ohne manuelle Änderungen
- [ ] Geheimnisse werden nur über geschützte CI-Variablen bereitgestellt und nicht im Log ausgegeben
- [ ] Deployment und Rollback werden separat geplant, sobald Zielumgebung und Freigabeprozess feststehen

**Lernfeld:** LF9 – Netzwerke und Dienste bereitstellen
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** L (16 Std.)

**Labels:** `user-story`, `lernfeld-LF9`, `fachrichtung-SI`, `size-L`

---

## 28. Objektspeicher für Dateien bereitstellen

**Als** Systemadministrator
**möchte ich** eine Datei über eine dokumentierte S3-kompatible Schnittstelle sicher speichern und wieder abrufen können,
**damit** Anwendungsdateien nicht ausschließlich im Dateisystem des Anwendungscontainers liegen.

**Voraussetzung:** #9 (Anwendung kann den Dienst über eine Schnittstelle testen)

**Akzeptanzkriterien**
- [ ] Der Objektspeicher startet mit versionierter Konfiguration reproduzierbar und verwendet persistenten Speicher
- [ ] Ein privater Bucket ist angelegt; anonyme Lese- und Schreibzugriffe werden abgewiesen
- [ ] Die Anwendung lädt eine Testdatei mit Zugangsdaten hoch, ruft sie wieder ab und der Dateiinhalt stimmt überein
- [ ] Falsche Zugangsdaten oder fehlende Berechtigung führen zu einer Fehlerantwort ohne Offenlegung der Schlüssel
- [ ] Zugangsschlüssel liegen außerhalb des Repositorys; Backup wird in #26 ergänzt

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-M`

---

## 29. Zentrales Log-Management für alle Container-Dienste

**Als** Systemadministrator
**möchte ich** die Anwendungs- und Reverse-Proxy-Logs zentral nach Dienst und Zeitraum durchsuchen können,
**damit** ich die Ursache eines Fehlers ohne Zugriff auf einzelne Container nachvollziehen kann.

**Voraussetzung:** #8 (Container- und Reverse-Proxy-Umgebung ist verfügbar)

**Akzeptanzkriterien**
- [ ] Anwendungs- und Reverse-Proxy-Logs werden mit Zeitstempel und Dienstkennung an einer zentralen Stelle gesammelt
- [ ] Eine Suche kann mindestens nach Dienst, Zeitraum und Textbegriff filtern
- [ ] Die Aufbewahrungsdauer ist dokumentiert; abgelaufene Einträge werden automatisch entfernt
- [ ] Zugangsdaten und Passwörter werden vor dem Speichern aus den Anwendungslogs entfernt
- [ ] Nur berechtigte Teamkonten können auf die Logs zugreifen
- [ ] Logs weiterer Container werden ergänzt, sobald diese produktiv bereitgestellt sind

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 30. Wiederherstellung von Anwendung und Datenbank erproben

**Als** Systemadministrator
**möchte ich** die Wiederherstellung der bereitgestellten Anwendung und Datenbank in einer getrennten Testumgebung erproben,
**damit** wir belegen können, dass die vorhandenen IaC- und Backup-Schritte im Notfall ausführbar sind.

**Voraussetzung:** #9 (Anwendung), #14 (Datenbankserver) und #26 (Backup-Ablauf ist verfügbar)

**Akzeptanzkriterien**
- [ ] Ein Ablaufplan nennt benötigte IaC-Version, Backup, Zugangsvoraussetzungen und Wiederherstellungsschritte
- [ ] Eine getrennte Testumgebung wird aus IaC bereitgestellt und ein Datenbank-Backup darin wiederhergestellt
- [ ] Nach dem Restore sind Anwendung und ein dokumentierter Prüffall erfolgreich erreichbar bzw. lesbar
- [ ] Wiederherstellungsdauer und Abweichungen vom Ablaufplan werden festgehalten
- [ ] Kritische Lücken erhalten jeweils eine verknüpfte Folgeaufgabe; die Produktion wird bei diesem Test nicht verändert
- [ ] Mailserver, Objektspeicher und weitere Dienste werden erst nach deren Einbindung in den Backup-Ablauf ergänzt

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 31. Docker auf dem Server installieren und einsatzbereit machen

**Als** Systemadministrator
**möchte ich** Docker (inkl. Docker Compose) auf dem VPS installieren und mit einem Testcontainer prüfen,
**damit** alle weiteren Dienste (Reverse Proxy, Datenbank, Mailserver, Anwendung) als Container betrieben werden können.

**Voraussetzung:** #2 (persönliche Konten vorhanden) und #3 (Server ist gehärtet)

**Akzeptanzkriterien**
- [ ] Docker Engine und Docker Compose sind auf dem VPS aus der offiziellen Paketquelle installiert
- [ ] Ein Testcontainer (z. B. `hello-world`) läuft erfolgreich
- [ ] Die Installation liegt als Skript versioniert im Git-Repository und ist reproduzierbar ausführbar
- [ ] Das Vorgehen ist kurz dokumentiert (Version, Installationsschritte)

**Lernfeld:** LF10b – Serverdienste bereitstellen und Administrationsaufgaben automatisieren (Fachrichtung Systemintegration)
**Bündelungsfach:** Entwicklung vernetzter Prozesse
**Aufwand (T-Shirt-Größe):** S (4 Std.)

**Labels:** `user-story`, `lernfeld-LF10b`, `fachrichtung-SI`, `size-S`

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
| 31 | #XX (nach Anlage eintragen) | | | | |

Hinweis: In den Story-Texten oben stehen Querverweise bereits direkt als `#<Issue-Nummer>`.
