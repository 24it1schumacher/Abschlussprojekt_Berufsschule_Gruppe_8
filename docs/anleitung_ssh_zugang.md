# Anleitung – Persönliche Benutzerkonten mit SSH-Key (VPS)

**Bezug:** [Issue #2](https://github.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8/issues/2) – Persönliche Benutzerkonten mit SSH-Key einrichten

Diese Anleitung beschreibt den vollständigen Ablauf zur fehlerfreien Einrichtung
persönlicher SSH-Benutzerkonten auf dem VPS und dient als Nachweis für das
Akzeptanzkriterium *„Eine kurze Anleitung zur SSH-Anmeldung mit Schlüssel liegt für
neue Teammitglieder vor"*.

---

## 1. Konten-Übersicht

Entschieden für den aktuellen Team-Stand (1× SI, 1× AE):

| Konto | Person / Rolle | sudo | Zweck |
|---|---|---|---|
| `si-<name>` | Systemintegration | voll, mit Passwort | Serveradministration, Härtung, Dienste |
| `ae-<name>` | Anwendungsentwicklung | keine (Docker rootless) | Anwendungsentwicklung, Container ohne Root |

Root-Login bleibt vorerst bestehen, wird aber mit der Story „Server nach IT-Grundschutz
härten" deaktiviert. Ein separates Deploy-Konto für CI/CD ist bewusst noch nicht
angelegt (erst mit der CI/CD-Story relevant).

Weitere Konten folgen demselben Verfahren (Abschnitte 3–5) und werden hier in der
Tabelle ergänzt.

---

## 2. Voraussetzungen und Rollen

- Der **Root-Key** (privater Schlüssel zu `rsa_serverkey_strato.pub`) bleibt
  ausschließlich bei der Person, die die Ersteinrichtung durchführt (im Folgenden
  „Admin"). Er wird **niemals** an andere Teammitglieder weitergegeben oder auf
  deren Rechner benutzt.
- Jedes Teammitglied erzeugt seinen eigenen SSH-Key selbst (Abschnitt 3) und schickt
  **nur die `.pub`-Datei** über einen sicheren, internen Kanal (z. B. Team-Chat) an
  den Admin bzw. an eine Person mit bestehendem sudo-Zugang. Niemals über ein
  öffentliches Repository oder unverschlüsselt.
- Alle Server-Befehle in Abschnitt 4 werden **immer von der aufnehmenden Person**
  (Admin oder bestehendes sudo-Konto) ausgeführt — nie vom neuen Teammitglied selbst,
  da dieses zu diesem Zeitpunkt noch keinen Server-Zugang hat.

---

## 3. RSA-Key erzeugen (lokal, pro Person)

Jede Person erzeugt ihren Schlüssel **auf dem eigenen Rechner**, niemals auf dem Server:

```bash
ssh-keygen -t rsa -b 3072 -C "<vorname>@<vps-name>" -f ~/.ssh/id_rsa_maschinenverleih
```

Ablauf im Detail:

1. Befehl ausführen wie oben.
2. Abfrage `Enter passphrase (empty for no passphrase):` — für dieses Projekt ohne
   Passphrase einfach mit **Enter** bestätigen (zweimal, zur Wiederholung).
3. Prüfen, ob beide Dateien angelegt wurden:
   ```bash
   ls -l ~/.ssh/id_rsa_maschinenverleih*
   ```
   Erwartet: `id_rsa_maschinenverleih` (privat) und `id_rsa_maschinenverleih.pub`
   (öffentlich).
4. Rechte des privaten Schlüssels prüfen/korrigieren (setzt `ssh-keygen` normalerweise
   automatisch, sicherheitshalber kontrollieren):
   ```bash
   chmod 600 ~/.ssh/id_rsa_maschinenverleih
   ```

**Hinweis für Windows-Nutzer:** `ssh-keygen`, `ssh` und `scp` sind ab Windows 10
(Version 1809) als Bordmittel enthalten (OpenSSH-Client) und funktionieren in
PowerShell **identisch** zu den Befehlen in dieser Anleitung, `~` eingeschlossen. Zwei
Ausnahmen:

- Falls `ssh-keygen` nicht gefunden wird, OpenSSH-Client aktivieren:
  `Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Client*'` prüfen,
  ggf. `Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0`
- `chmod` gibt es nicht — Rechte des privaten Schlüssels stattdessen so einschränken:
  ```powershell
  icacls $HOME\.ssh\id_rsa_maschinenverleih /inheritance:r
  icacls $HOME\.ssh\id_rsa_maschinenverleih /grant:r "$($env:USERNAME):(R)"
  ```

Wichtig:

- `-b 3072`: erfüllt die Mindestanforderung aus den Akzeptanzkriterien
- Der private Schlüssel bleibt lokal, **niemals** weitergeben oder ins Repository
  committen
- Nur die `.pub`-Datei wird weitergegeben — vorher umbenennen, damit beim Empfänger
  keine gleichnamigen Dateien mehrerer Personen überschrieben werden:

```bash
cp ~/.ssh/id_rsa_maschinenverleih.pub ~/<name>.pub
```

`<name>.pub` wird anschließend wie in Abschnitt 2 beschrieben verschickt.

---

## 4. Konto auf dem Server anlegen

Ausführende Person: **Admin** (nur bei der Ersteinrichtung, 4a) oder ein **bestehendes
sudo-Konto** (alle weiteren Konten, 4b).

### 4a. Ersteinrichtung (SI- und AE-Konto zum ersten Mal) — durch den Admin, als root

Voraussetzung: Der Admin hat die `<name>.pub`-Dateien beider neuen Personen bereits
lokal vorliegen (per sicherem Kanal erhalten, siehe Abschnitt 2).

Auf dem **eigenen Rechner des Admins**, für jede der zwei Personen einmal:

```bash
# 1) Public Key hochladen
scp -i <pfad-zum-root-key> <name>.pub root@<vps-adresse>:~/eingang_<neuername>.pub

# 2) Auf dem Server einloggen
ssh -i <pfad-zum-root-key> root@<vps-adresse>
```

Auf dem **Server, als root** (einmalig vor dem ersten Konto: sudo-Paket sicherstellen,
danach je neuem Konto wiederholen):

```bash
which sudo || (apt update && apt install -y sudo)

adduser --disabled-password --gecos "" <neuername>
mkdir -p /home/<neuername>/.ssh
cp ~/eingang_<neuername>.pub /home/<neuername>/.ssh/authorized_keys
chown -R <neuername>:<neuername> /home/<neuername>/.ssh
chmod 700 /home/<neuername>/.ssh
chmod 600 /home/<neuername>/.ssh/authorized_keys
rm ~/eingang_<neuername>.pub
```

Sobald **beide** Konten angelegt sind, noch als root dem SI-Konto sudo geben
(Details Abschnitt 5):

```bash
usermod -aG sudo <si-username>
```

Erst wenn das SI-Konto sudo hat **und** sein Login erfolgreich getestet wurde
(Abschnitt 6), wird root für weitere Konten nicht mehr gebraucht. Der SSH-Login als
root wird zusätzlich mit der Härtungs-Story deaktiviert.

### 4b. Alle weiteren Konten (Onboarding neuer Teammitglieder) — über ein bestehendes sudo-Konto

Sobald mindestens ein Konto mit sudo existiert (z. B. `si-<name>`), läuft das Anlegen
identisch ab, aber mit dem **eigenen, bereits funktionierenden Key** der sudo-Person
(nicht dem Root-Key) und mit `sudo` vor den Server-Befehlen.

Auf dem **eigenen Rechner** der sudo-Person:

```bash
# 1) Public Key hochladen, mit dem eigenen, bereits funktionierenden Zugang
scp -i ~/.ssh/id_rsa_maschinenverleih <name>.pub <mein-username>@<vps-adresse>:~/eingang_<neuername>.pub

# 2) Auf dem Server einloggen
ssh -i ~/.ssh/id_rsa_maschinenverleih <mein-username>@<vps-adresse>
```

Auf dem **Server, eingeloggt als `<mein-username>`**:

```bash
sudo adduser --disabled-password --gecos "" <neuername>
sudo mkdir -p /home/<neuername>/.ssh
sudo cp ~/eingang_<neuername>.pub /home/<neuername>/.ssh/authorized_keys
sudo chown -R <neuername>:<neuername> /home/<neuername>/.ssh
sudo chmod 700 /home/<neuername>/.ssh
sudo chmod 600 /home/<neuername>/.ssh/authorized_keys
rm ~/eingang_<neuername>.pub
```

In beiden Fällen (4a und 4b) gilt: Der `cp`-Befehl kopiert **innerhalb des Servers**
die zuvor hochgeladene Datei an die Stelle, an der SSH nach berechtigten Schlüsseln
sucht (`/home/<neuername>/.ssh/authorized_keys`). Damit sind die Rechte laut
Akzeptanzkriterium erfüllt (`700` für `.ssh`, `600` für `authorized_keys`), und es
liegt ausschließlich der **öffentliche** Schlüssel auf dem Server.

---

## 5. sudo-Rechte konfigurieren

**SI-Konto** (volle Rechte, mit Passwort) — wird direkt im Anschluss an die
Kontoanlage vergeben, von derselben Person, die Abschnitt 4 ausgeführt hat:

```bash
usermod -aG sudo <si-username>        # ausgeführt als root, direkt nach 4a
sudo usermod -aG sudo <si-username>   # ausgeführt von einem bestehenden sudo-Konto, nach 4b
```

`adduser --disabled-password` legt das Konto **ohne** Passwort an (nur Key-Login
funktioniert). Da `sudo` beim SI-Konto nach dessen eigenem Passwort fragt, muss dieses
jetzt gesetzt werden — sonst kann sich das SI-Konto nie erfolgreich per `sudo`
authentifizieren:

```bash
passwd <si-username>        # ausgeführt als root, direkt nach 4a
sudo passwd <si-username>   # ausgeführt von einem bestehenden sudo-Konto, nach 4b
```

Das Passwort wird sicher (z. B. Passwortmanager) an die SI-Person übergeben, nicht
per Klartext-Chat.

**AE-Konto**: startet **ohne** sudo-Gruppe. Werden später einzelne Rechte benötigt,
wird dafür eine eigene, konkrete Regel angelegt statt Wildcards, ausgeführt von einem
bestehenden sudo-Konto:

```bash
sudo visudo -f /etc/sudoers.d/<ae-username>-<begründung>
# Beispielzeile, so eng wie möglich gefasst:
# <ae-username> ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart <konkreter-dienst>
sudo visudo -c
```

Jede Freigabe wird im Team abgestimmt und hier in dieser Datei kurz begründet
dokumentiert (Datum, Regel, Grund).

---

## 6. Anmeldung testen

Von der lokalen Maschine der jeweiligen Person aus:

```bash
ssh -i ~/.ssh/id_rsa_maschinenverleih <username>@<vps-adresse>
```

Erst wenn der Login für **alle** neuen Konten erfolgreich getestet wurde, gilt das
Akzeptanzkriterium als erfüllt.

---

## 7. SSH-Config-Datei einrichten (empfohlen)

Erspart nach erfolgreichem Login-Test das Merken von Adresse, Nutzername und Key-Pfad.
Lokal, pro Person, in `~/.ssh/config` (Datei ggf. neu anlegen):

```bash
nano ~/.ssh/config          # Windows: notepad $HOME\.ssh\config
```

Eintrag ergänzen:

```
Host maschinenverleih
    HostName <vps-adresse>
    User <username>
    IdentityFile ~/.ssh/id_rsa_maschinenverleih
```

Rechte setzen (sonst ignoriert SSH die Datei ggf.):

```bash
chmod 600 ~/.ssh/config
```

Windows-Äquivalent:

```powershell
icacls $HOME\.ssh\config /inheritance:r
icacls $HOME\.ssh\config /grant:r "$($env:USERNAME):(R)"
```

Danach genügt:

```bash
ssh maschinenverleih
```

Pro Person kann `Host` beliebig benannt werden; bei mehreren Zielen (z. B. später ein
Staging-Server) einfach einen weiteren `Host`-Block ergänzen.

---

## 8. Kurzanleitung für neue Teammitglieder

1. RSA-Key wie in Abschnitt 3 erzeugen (mind. 3072 Bit)
2. `.pub`-Datei in `<name>.pub` umbenennen und über einen sicheren Kanal an ein
   bestehendes sudo-Konto schicken (z. B. Systemintegration) — **niemals** den
   privaten Schlüssel verschicken
3. Warten, bis das Konto auf dem Server angelegt ist
4. Verbinden mit:
   ```bash
   ssh -i ~/.ssh/id_rsa_maschinenverleih <username>@<vps-adresse>
   ```
5. Bei Problemen: prüfen, ob der private Schlüssel lokal die Rechte `600` hat
   (`chmod 600 ~/.ssh/id_rsa_maschinenverleih`)
6. Optional: SSH-Config-Datei wie in Abschnitt 7 anlegen, danach reicht `ssh maschinenverleih`

---

## 9. Root-Login deaktivieren (Härtung)

**Voraussetzung: zwingend erst durchführen, wenn mindestens ein sudo-Konto (SI)
angelegt ist und dessen Login samt `sudo` erfolgreich getestet wurde (Abschnitt 5–6).**
Sonst besteht das Risiko, sich komplett vom Server auszusperren.

Das bloße Entfernen/Auskommentieren des Root-Keys aus `~root/.ssh/authorized_keys`
reicht **nicht**: Damit wäre nur die Key-Anmeldung für root blockiert, nicht aber z. B.
eine Passwort-Anmeldung. Root-Login muss stattdessen direkt in der SSH-Server-
Konfiguration gesperrt werden:

```bash
# 1) In einer BESTEHENDEN root-Sitzung (nicht ausloggen!)
sudo nano /etc/ssh/sshd_config
# Zeile setzen/anpassen:
# PermitRootLogin no

# 2) Konfiguration auf Syntaxfehler prüfen
sudo sshd -t

# 3) SSH-Dienst neu laden
sudo systemctl reload ssh
```

**Wichtig:** Die aktuelle root-Sitzung **nicht schließen**. Stattdessen in einem
**zweiten, neuen Terminal** prüfen:

```bash
ssh -i ~/.ssh/id_rsa_maschinenverleih <si-username>@<vps-adresse>   # muss funktionieren
sudo -v                                                              # muss funktionieren
ssh -i <pfad-zum-root-key> root@<vps-adresse>                        # muss abgelehnt werden
```

Erst wenn alle drei Prüfungen wie erwartet ausfallen, die root-Sitzung schließen.
Optional zur Aufräumung: den Root-Key aus `~root/.ssh/authorized_keys` entfernen —
das ist dann nur noch Aufräumen, keine Sicherheitsmaßnahme mehr, da `PermitRootLogin
no` bereits jeden Root-Login über SSH verhindert.

---

## 10. Abgleich mit den Akzeptanzkriterien

- [ ] Konten für SI und AE angelegt, Verfahren für weitere Konten dokumentiert (Abschnitt 1–4)
- [ ] RSA-Key ≥ 3072 Bit, nur Public Key auf dem Server, Rechte `700`/`600` (Abschnitt 3–4)
- [ ] SI voll mit sudo (Passwort), AE ohne sudo / rootless Docker (Abschnitt 5, Docker-Setup siehe Story 18)
- [ ] Zusätzliche sudo-Freigaben einzeln, ohne Wildcards, per `visudo -c` geprüft, begründet (Abschnitt 5)
- [ ] Anmeldung mit allen Konten erfolgreich getestet (Abschnitt 6)
- [ ] Kurzanleitung für neue Teammitglieder vorhanden (Abschnitt 8)
- [ ] Root-Login über `PermitRootLogin no` deaktiviert, SI-Zugang vorher getestet (Abschnitt 9)
- [ ] Benutzeranlage als Skript versioniert im Git-Repository (noch offen – nächster Schritt)
