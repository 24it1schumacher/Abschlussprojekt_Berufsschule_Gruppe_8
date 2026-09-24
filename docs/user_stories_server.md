# User Stories – Serverzugang und Härtung (VPS)

Story 4 („Server nach IT-Grundschutz absichern“) entfällt und wird durch Story 17 ersetzt.

---

## 16. Persönliche Benutzerkonten mit SSH-Key einrichten

**Als** Systemadministrator
**möchte ich** für jedes Teammitglied ein persönliches Benutzerkonto mit eigenem RSA-Schlüssel auf dem VPS anlegen,
**damit** niemand mehr als root arbeitet und jede Aktion einer Person zugeordnet werden kann.

**Akzeptanzkriterien**
- [ ] Konten für Systemintegration und Anwendungsentwicklung sind angelegt; das Verfahren für weitere Konten ist dokumentiert
- [ ] Jedes Konto meldet sich mit einem eigenen RSA-Schlüssel (mindestens 3072 Bit) an; auf dem Server liegen nur die öffentlichen Schlüssel (Rechte `700` für `.ssh`, `600` für `authorized_keys`)
- [ ] Das SI-Konto hat volle sudo-Rechte (mit Passwort); das AE-Konto startet ohne sudo-Rechte und nutzt Docker rootless (siehe Story 18)
- [ ] Zusätzliche sudo-Freigaben für das AE-Konto werden bei Bedarf im Team abgestimmt, einzeln und ohne Wildcards unter `/etc/sudoers.d/` eingetragen (mit `visudo -c` geprüft) und begründet dokumentiert
- [ ] Die Anmeldung mit allen neuen Konten ist erfolgreich getestet
- [ ] Eine kurze Anleitung zur SSH-Anmeldung mit Schlüssel liegt für neue Teammitglieder vor
- [ ] Die Benutzeranlage liegt als Skript versioniert im Git-Repository (nur öffentliche Schlüssel, keine Passwörter)

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---

## 17. Server nach IT-Grundschutz härten

**Als** Systemadministrator
**möchte ich** den öffentlich erreichbaren VPS nach den Basismaßnahmen des IT-Grundschutz härten,
**damit** ab dem ersten Tag eine sichere Grundlage für alle weiteren Komponenten besteht.

**Voraussetzung:** Story 16 ist abgeschlossen (Anmeldung mit persönlichen Konten funktioniert)

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

## 18. Rootless Docker für das Entwicklerkonto einrichten

**Als** Anwendungsentwickler
**möchte ich** mit meinem eigenen Konto Container ohne root-Rechte starten können,
**damit** ich selbstständig arbeiten kann, ohne Root-Zugriff auf den Server zu erhalten.

**Voraussetzung:** Story 5 (Docker installiert) und Story 16 (AE-Konto vorhanden)

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

## 19. Snapshot-/Backup-Strategie für schnelles Rollback einrichten

**Als** Systemadministrator
**möchte ich** regelmäßige Snapshots bzw. Backups des VPS einrichten,
**damit** ich nach einer fehlgeschlagenen Änderung oder einem Fehler den Server schnell wieder in einen funktionierenden Zustand zurückversetzen kann.

**Voraussetzung:** Story 16 ist abgeschlossen (persönliche Konten vorhanden)

**Akzeptanzkriterien**
- [ ] Eine Sicherungsstrategie ist dokumentiert: was wird gesichert (System, Konfiguration, Anwendungsdaten), wie oft (z. B. täglich) und wie lange aufbewahrt (Generationen/Retention)
- [ ] Für schnelle Rollbacks steht mindestens eine der folgenden Lösungen zur Verfügung: VM-Snapshot über den Strato-Kundenbereich und/oder inkrementelle Systemsicherung auf dem Server (z. B. Timeshift im RSYNC-Modus, da das Root-Dateisystem ext4 ohne LVM/Btrfs ist)
- [ ] Die automatische Erstellung der Sicherungen ist eingerichtet (z. B. per Cronjob) und läuft nachweislich mindestens einmal erfolgreich
- [ ] Ein Rollback wurde mindestens einmal erfolgreich getestet (Wiederherstellung eines vorherigen Zustands) und das Ergebnis ist dokumentiert
- [ ] Alte Sicherungen werden automatisch nach der festgelegten Aufbewahrungsdauer gelöscht, um den Speicherplatz zu begrenzen
- [ ] Das Einrichtungsskript bzw. die Konfiguration liegt versioniert im Git-Repository
- [ ] Die Maßnahme ist dem IT-Grundschutz-Baustein CON.3 (Datensicherungskonzept) zugeordnet

**Lernfeld:** LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten (Fachrichtung Systemintegration)
**Bündelungsfach:** Softwaretechnologie und Datenmanagement
**Aufwand (T-Shirt-Größe):** M (8 Std.)

**Labels:** `user-story`, `lernfeld-LF11b`, `fachrichtung-SI`, `size-M`

---
