# Anleitung – Brute-Force-Schutz (fail2ban) und automatische Sicherheitsupdates

**Bezug:** Story 16 „Server nach IT-Grundschutz härten" – Akzeptanzkriterium
*„Brute-Force-Schutz und automatische Sicherheitsupdates sind aktiv und ihr Status ist
dokumentiert"* (siehe `docs/user_stories.md`).

Diese Anleitung dokumentiert, wie auf dem VPS der Brute-Force-Schutz (fail2ban) eingerichtet
und die automatischen Sicherheitsupdates (unattended-upgrades) geprüft wurden, warum so,
und wie nachgewiesen wurde, dass beides wirkt.

Datum der Umsetzung und Prüfung: 2026-10-01. Alle Uhrzeiten sind Serverzeit (UTC).
Fremde und eigene IP-Adressen sind maskiert (`x.x`) oder durch Platzhalter ersetzt.

---

## 1. Ziel

1. Wiederholte fehlgeschlagene SSH-Anmeldungen derselben IP-Adresse führen automatisch zu
   einer zeitlich begrenzten Sperre dieser Adresse (**Brute-Force-Schutz**).
2. Sicherheitsupdates werden ohne Zutun eines Administrators installiert
   (**automatische Sicherheitsupdates**).
3. Für beides ist der Status nachweisbar: Konfiguration, Laufzeitstatus, Protokolle.

---

## 2. Ausgangslage

Server: Ubuntu 24.04.5 LTS (VPS). Vorher bereits umgesetzt (siehe
`docs/anleitung_ssh_zugang.md` und `docs/anleitung_firewall_ufw.md`):

- SSH nur per Schlüssel, `passwordauthentication no`.
- Firewall `ufw` aktiv, Default deny incoming, nur `22/tcp` erlaubt.

Bestandsaufnahme vor der Änderung:

```bash
lsb_release -ds
dpkg -l fail2ban unattended-upgrades
systemctl is-active fail2ban unattended-upgrades
```

| Paket | Zustand vorher |
|---|---|
| `fail2ban` | **nicht installiert** (`dpkg`: „no packages found") |
| `unattended-upgrades` | installiert (`ii`, Version 2.9.1+nmu4ubuntu1) und `active` |

Hinweis: `systemctl is-active` meldet für ein nicht installiertes Paket ebenfalls
`inactive`. Ob etwas installiert ist, zeigt nur `dpkg -l`.

### Warum ein Brute-Force-Schutz, obwohl Passwort-Login aus ist?

Der Server ist öffentlich erreichbar und wird dauernd von automatischen Scannern
angesprochen. Das Journal von `sshd` enthält seit Inbetriebnahme **112.968 Zeilen**
(Auswertung mit `fail2ban-regex`, Abschnitt 5). Typische Meldungen:

```
Invalid user admin from 2.57.x.x port 50614
Invalid user ftpuser from 187.212.x.x port 49044
Connection closed by authenticating user root 195.154.x.x port 48104 [preauth]
```

Die Scanner probieren Standardnamen (`root`, `admin`, `ubuntu`, `ftpuser`, `bot_server`, …).
Es steht keine einzige Zeile `Failed password` im ausgewerteten Journal-Ausschnitt: Weil die
Passwort-Anmeldung abgeschaltet ist, scheitern die Angreifer, bevor ein Passwort geprüft wird.
Die eigentliche Absicherung ist also der Schlüssel-Login. fail2ban ist die **zweite Schicht**
(*Defense in Depth*): Es spart Ressourcen und Log-Rauschen und bremst hartnäckige Angreifer.

---

## 3. Konzept und Entscheidungen

### Wie fail2ban arbeitet

fail2ban **beobachtet** Protokolle (hier das systemd-Journal von `sshd`) und **zählt**
fehlgeschlagene Anmeldungen **pro IP-Adresse**. Überschreitet eine IP das Limit, trägt
fail2ban sie in eine Sperrliste der Firewall (nftables) ein. Die **Durchsetzung** übernimmt
also der Kernel, nicht fail2ban selbst.

| Baustein | Aufgabe | Entscheidet |
|---|---|---|
| `ufw` | Feste Regeln: welche Ports sind erreichbar | statisch, pro Paket, ohne Gedächtnis |
| `fail2ban` | Liest Logs, zählt Fehlversuche je IP | dynamisch, nach Verhalten |
| `nftables` (Kernel) | Verwirft/lehnt Pakete gesperrter IPs ab | setzt um, was die beiden anderen vorgeben |

### Werkzeug: fail2ban

| Alternative | Vorteil | Nachteil |
|---|---|---|
| `fail2ban` (gewählt) | In den Ubuntu-Paketquellen, signiert und gepflegt; fertiger Filter für SSH; wird per `apt` aktualisiert | Zählt nur pro IP (siehe Grenzen) |
| `ufw limit 22/tcp` | Ohne Zusatzsoftware, Rate-Limit direkt in der Firewall | Reagiert auf die Verbindungsrate, nicht auf fehlgeschlagene Anmeldungen. Nach ufw-Dokumentation sperrt es IPs mit zu vielen Verbindungen in kurzer Zeit, auch legitime (z. B. automatisierte Zugriffe). Nicht getestet |
| CrowdSec | Teilt Sperrlisten mit anderen Installationen | Zusätzlicher Dienst und Konto, für die Projektgröße unnötig. Nicht getestet, hier nur als Alternative genannt |
| Weder noch | Weniger Komponenten | Log-Rauschen und Last durch Dauerscans bleiben |

Gewählt: **fail2ban aus den Ubuntu-Paketquellen**. Eine manuelle Installation von GitHub wäre
neuer, bekäme aber keine automatischen Updates über die Paketverwaltung.

### Parameter: Standardwerte übernommen

| Parameter | Wert | Bedeutung |
|---|---|---|
| `maxretry` | 5 | erlaubte Fehlversuche |
| `findtime` | 600 s | Zeitfenster, in dem gezählt wird |
| `bantime` | 600 s | Dauer der Sperre |
| `ignoreip` | leer | keine Ausnahmen (keine Whitelist) |

Die Werte wurden mit `sudo fail2ban-client get sshd <parameter>` aus dem **laufenden** Dienst
gelesen. Das ist verlässlicher als Konfigurationsdateien, weil sich mehrere Dateien
überlagern können.

Entscheidung: **Standardwerte übernehmen**, keine eigene `jail.local`. Begründung: Sie sind
ein bekannter Kompromiss, und die Tests (Abschnitt 5) bestätigen sie. Wer später Werte
ändert, legt `/etc/fail2ban/jail.local` oder `/etc/fail2ban/jail.d/*.local` an. Die Datei
`jail.conf` wird **nie** direkt geändert, weil Paketupdates sie überschreiben.

**Keine Whitelist (`ignoreip`):** Eine feste Heim-IP einzutragen würde den Test von dort
unmöglich machen, und Heim-IPs ändern sich oft. Eine Ausnahme ist außerdem ein Risiko, wenn
der freigestellte Rechner übernommen wird. Sperren laufen nach 10 Minuten von selbst ab,
eine Selbstaussperrung ist also zeitlich begrenzt.

### Filter-Modus: `normal`

Der SSH-Filter hat Modi. Im Standardmodus `normal` zählen u. a. `Invalid user … from <IP>`
und `maximum authentication attempts exceeded`. Zeilen wie
`Connection closed by authenticating user root … [preauth]` werden zwar erkannt, aber mit
`F-NOFAIL` **nicht als Fehlversuch gezählt**.

| Modus | Vorteil | Nachteil |
|---|---|---|
| `normal` (Standard, gewählt) | Wenig Fehlalarme | Scanner, die nur `root` probieren und sofort die Verbindung schließen, bleiben ungezählt |
| `aggressive` | Zählt auch diese Verbindungsabbrüche | Mehr Fehlalarme (z. B. ein Client mit falschem Schlüssel) |

Gewählt: `normal`. Da der Schlüssel-Login die Hauptabsicherung ist, wiegt ein Fehlalarm
(Selbstaussperrung) schwerer als ein ungezählter Scanner.

### Automatische Updates: nur Sicherheitsquellen

`unattended-upgrades` installiert nach Zeitplan Updates aus den in `Allowed-Origins`
erlaubten Quellen. Gewählt wurde die **Standardeinstellung** von Ubuntu:

| Quelle | Aktiv |
|---|---|
| `noble` (Basis-Release) | ja |
| `noble-security` | ja |
| `noble-apps-security`, `noble-infra-security` (ESM) | ja |
| `noble-updates` | **nein** |

| Variante | Vorteil | Nachteil |
|---|---|---|
| Nur Sicherheitsquellen (gewählt) | Wenige, gezielte Änderungen, geringes Risiko für Brüche | Normale Fehlerkorrekturen müssen manuell eingespielt werden |
| Zusätzlich `-updates` | Server ist immer aktuell | Höheres Risiko, dass ein Update die Anwendung beeinflusst |

### Neustart: manuell mit festem Prozess

Kernel-Updates sind erst nach einem **Neustart** wirksam. `unattended-upgrades` kann
automatisch neu starten (`Automatic-Reboot`). Das ist in der Konfiguration nicht aktiviert
(die Option ist auskommentiert, es gilt der Standard „kein automatischer Neustart"). Dass
der Server nach dem Kernel-Update vom 24.09. sieben Tage ohne Neustart weiterlief
(Abschnitt 6), bestätigt das.

| Weg | Vorteil | Nachteil |
|---|---|---|
| **A: `Automatic-Reboot "true"`** mit fester Uhrzeit | Patches werden ohne Zutun wirksam | Ungeplanter Ausfall, die Anwendung startet eventuell nicht sauber, ein Fehler fällt nachts niemandem auf |
| **B: Manuell, mit Checkliste** (gewählt) | Kontrolle, kein Überraschungsausfall | Hängt an einem Menschen, kann vergessen werden (hier: 7 Tage) |
| **C: Livepatch** (Ubuntu Pro) | Kernel-Korrekturen ohne Neustart | Braucht Ubuntu Pro und Einrichtung, deckt nicht alles ab. Nicht geprüft, ob beim Anbieter möglich |

Gewählt: **B**, solange die Anwendung im Aufbau ist und kein Wartungsfenster besteht. Das
Risiko (vergessener Neustart) wird durch die Checkliste in Abschnitt 8 begrenzt.

**Wichtig für die Aussage „automatisch":** Das *Installieren* ist vollautomatisch, das
*Wirksamwerden* von Kernel-Updates nicht. Das Kriterium „automatische Sicherheitsupdates
sind aktiv" ist erfüllt, vollautomatischer Schutz bis zum laufenden neuen Kernel ist es
ohne Neustart-Prozess nicht.

---

## 4. Umsetzung

Ausführende Person: Systemintegration, auf dem Server mit dem sudo-Konto.

### fail2ban installieren

```bash
sudo apt update
sudo apt install fail2ban
```

| Befehl | Wirkung |
|---|---|
| `apt update` | Lädt nur die Liste der verfügbaren Pakete neu |
| `apt install fail2ban` | Installiert Dienst, Client `fail2ban-client` und fertige Filter |

Die Voreinstellung von Debian/Ubuntu liegt in `/etc/fail2ban/jail.d/defaults-debian.conf`:

```
[DEFAULT]
banaction = nftables
banaction_allports = nftables[type=allports]
backend = systemd

[sshd]
enabled = true
```

| Zeile | Bedeutung |
|---|---|
| `banaction = nftables` | Gesperrt wird über nftables |
| `backend = systemd` | fail2ban liest das systemd-Journal, nicht `auth.log` |
| `[sshd] enabled = true` | Der Jail für SSH ist ab Installation aktiv |

Es war **keine weitere Konfiguration nötig**. Der Dienst startet beim Booten
(`systemctl is-enabled fail2ban` → `enabled`).

### unattended-upgrades

Das Paket war bereits installiert und aktiv. Es wurde **nichts geändert**, nur geprüft
(Abschnitt 6).

---

## 5. Nachweis fail2ban

### 5.1 Status

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

Direkt nach der Installation:

```
Status
|- Number of jail:      1
`- Jail list:   sshd
```

```
Status for the jail: sshd
|- Filter
|  |- Currently failed: 5
|  |- Total failed:     10
|  `- Journal matches:  _SYSTEMD_UNIT=sshd.service + _COMM=sshd
`- Actions
   |- Currently banned: 0
   |- Total banned:     0
   `- Banned IP list:
```

fail2ban liest beim Start das Journal rückwirkend. Die 10 Fehlversuche stammen von fremden
Scannern. `Currently banned: 0`, obwohl `Currently failed: 5`: Die Fehlversuche kamen von
**verschiedenen** IPs, und fail2ban zählt pro IP.

### 5.2 Filter gegen das echte Journal getestet

```bash
sudo fail2ban-regex systemd-journal sshd
```

Ergebnis (Auszug):

```
Lines: 112968 lines, 74330 ignored, 35514 matched, 3124 missed
```

| Wert | Bedeutung |
|---|---|
| 112.968 Zeilen | gesamtes `sshd`-Journal seit Inbetriebnahme |
| 35.514 matched | als Fehlversuch gezählt, überwiegend `Invalid user … from <IP>` (35.162 Treffer) |
| 74.330 ignored | erkannt, aber nicht gezählt (`Connection closed …`, `F-NOFAIL`) |
| 3.124 missed | vom Filter nicht erfasst (andere `sshd`-Meldungen) |

### 5.3 Kontrollierter Sperrtest

**Vorbereitung:** Ein Test von der eigenen Heim-IP hätte diese gesperrt. Der Test lief
deshalb von einem **Laptop im Mobilfunk-Hotspot** (andere öffentliche IP). Die Hauptsitzung
über die Heim-IP blieb dadurch ungestört.

Es wurde ein **erfundener Benutzername** (`testuser`) verwendet. Bei einem echten Namen ohne
Schlüssel schreibt der Server nur `Connection closed by authenticating user … [preauth]`,
das nicht gezählt wird, es gäbe keine Sperre.

Am Laptop, fünfmal hintereinander:

```bash
ssh -o ConnectTimeout=10 testuser@<SERVER-IP>
```

Ergebnis: fünfmal `Permission denied (publickey)`, danach `Connection refused`.

Protokoll `/var/log/fail2ban.log` (Auszug, Hotspot-IP maskiert):

```
2026-10-01 12:21:49 [sshd] Found <HOTSPOT-IP> - 2026-10-01 12:21:49
2026-10-01 12:23:56 [sshd] Found <HOTSPOT-IP> - 2026-10-01 12:23:56
2026-10-01 12:24:01 [sshd] Found <HOTSPOT-IP> - 2026-10-01 12:24:01
2026-10-01 12:24:05 [sshd] Found <HOTSPOT-IP> - 2026-10-01 12:24:05
2026-10-01 12:24:08 [sshd] Found <HOTSPOT-IP> - 2026-10-01 12:24:07
2026-10-01 12:24:08 NOTICE  [sshd] Ban <HOTSPOT-IP>
...
2026-10-01 12:34:08 NOTICE  [sshd] Unban <HOTSPOT-IP>
```

- Fünf Treffer innerhalb von 10 Minuten (`maxretry 5`, `findtime 600`), **eine Sekunde**
  nach dem fünften erfolgt der `Ban`.
- Der `Unban` kommt **exakt 10:00 Minuten** später (`bantime 600`). Die Sperre endet von selbst.

Status während der Sperre:

```
|- Currently banned: 1
|- Total banned:     1
`- Banned IP list:   <HOTSPOT-IP>
```

### 5.4 Wirkung im Kernel (nftables)

```bash
sudo nft list ruleset | grep -iE "f2b|sshd|saddr"
sudo nft list set inet f2b-table addr-set-sshd
```

```
table inet f2b-table {
        set addr-set-sshd {
        chain f2b-chain {
                tcp dport 22 ip saddr @addr-set-sshd reject with icmp port-unreachable
```

```
set addr-set-sshd {
        type ipv4_addr
        elements = { <HOTSPOT-IP> }
}
```

- fail2ban legt eine **eigene Tabelle** (`f2b-table`) neben den ufw-Regeln an
  (`table ip filter … managed by iptables-nft` gehört zu ufw). Die ufw-Regeln bleiben
  unberührt.
- Die Regel lautet: TCP-Zielport 22 **und** Absender-IP in der Sperrliste → `reject`.
  Das erklärt das `Connection refused` am Laptop (aktive Ablehnung, kein Timeout).
- Die Sperre wird also vom **Kernel** durchgesetzt. fail2ban pflegt nur die Liste.

### 5.5 Ein echter Angreifer wurde gesperrt

Während der Prüfung hat fail2ban ohne unser Zutun eine fremde IP gesperrt:

```
2026-10-01 12:22:46 [sshd] Found 115.238.x.x
2026-10-01 12:30:19 NOTICE  [sshd] Ban 115.238.x.x
```

Das belegt die Wirkung im Echtbetrieb, nicht nur im Test.

### 5.6 Verhalten nach Neustart

Nach dem Neustart des Servers (Abschnitt 7): `fail2ban` `active`, Jail `sshd` geladen
(`status sshd`), die Zähler stehen wieder bei 0.

---

## 6. Nachweis automatische Sicherheitsupdates

### 6.1 Konfiguration

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
grep -vE '^\s*(//|$)' /etc/apt/apt.conf.d/50unattended-upgrades
```

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

```
Unattended-Upgrade::Allowed-Origins {
        "${distro_id}:${distro_codename}";
        "${distro_id}:${distro_codename}-security";
        "${distro_id}ESMApps:${distro_codename}-apps-security";
        "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::Package-Blacklist {
};
Unattended-Upgrade::DevRelease "auto";
```

| Einstellung | Bedeutung |
|---|---|
| `Update-Package-Lists "1"` | Paketlisten werden täglich geholt |
| `Unattended-Upgrade "1"` | Updates werden täglich installiert |
| `Allowed-Origins` | nur Basis-Release und Sicherheitsquellen (kein `-updates`) |
| `Package-Blacklist` leer | kein Paket ist ausgenommen |

`grep -vE '^\s*(//|$)'` blendet Kommentare (`//`) und Leerzeilen aus, es bleiben die
wirksamen Einstellungen.

### 6.2 Zeitplan

```bash
systemctl list-timers 'apt-daily*' --no-pager
```

```
NEXT                        LEFT LAST                           PASSED UNIT
Fri 2026-10-02 02:46:46 UTC  14h Thu 2026-10-01 12:12:15 UTC 22min ago apt-daily.timer
Fri 2026-10-02 06:23:03 UTC  17h Thu 2026-10-01 06:34:05 UTC    6h ago apt-daily-upgrade.timer
```

`apt-daily.timer` holt die Paketlisten, `apt-daily-upgrade.timer` führt die Updates aus.
Beide sind geplant.

### 6.3 Lauf-Log

```bash
sudo tail -n 20 /var/log/unattended-upgrades/unattended-upgrades.log
```

```
2026-10-01 06:34:06 INFO Starting unattended upgrades script
2026-10-01 06:34:06 INFO Allowed origins are: o=Ubuntu,a=noble, o=Ubuntu,a=noble-security, o=UbuntuESMApps,a=noble-apps-security, o=UbuntuESM,a=noble-infra-security
2026-10-01 06:34:08 INFO No packages found that can be upgraded unattended and no pending auto-removals
```

Der Lauf vom 01.10. hat planmäßig stattgefunden und nichts Neues gefunden. Das Log enthält
nur diesen einen Lauf.

### 6.4 Nachweis einer tatsächlichen automatischen Installation

Das Log oben zeigt keinen Installationslauf. Das apt-Protokoll belegt ihn:

```bash
sudo sh -c 'zgrep -h -B1 -A6 "Start-Date: 2026-09-24" /var/log/apt/history.log*'
```

(`sudo sh -c`, damit root die Wildcard auflöst. Die rotierten Dateien sind für normale
Benutzer nicht lesbar.)

```
Start-Date: 2026-09-24  06:50:08
Commandline: /usr/bin/unattended-upgrade
Install: linux-image-6.8.0-142-generic:amd64 (6.8.0-142.142, automatic), …
Upgrade: linux-image-virtual:amd64 (6.8.0-139.139, 6.8.0-142.142), …
End-Date: 2026-09-24  06:50:27

Start-Date: 2026-09-24  06:50:32
Commandline: /usr/bin/unattended-upgrade
Upgrade: libisns0t64:amd64 (0.101-0.3build3, 0.101-0.3ubuntu0.1)
```

- `Commandline: /usr/bin/unattended-upgrade` zeigt, dass **die Automatik** installiert hat,
  nicht ein Mensch per `apt`.
- Kernel von `6.8.0-139` auf `6.8.0-142`, außerdem `libisns0t64`. Danach wurden die alten
  `6.8.0-138`-Pakete automatisch entfernt (`Remove: …`).

### 6.5 Befund: Update installiert, aber noch nicht wirksam

```bash
cat /var/run/reboot-required.pkgs
uname -r
uptime -s
```

```
linux-image-6.8.0-142-generic
linux-base
6.8.0-139-generic
2026-09-11 10:49:48
```

- Die Datei `/var/run/reboot-required` stammt vom **24.09. 06:50**.
- Laufender Kernel: `6.8.0-139`, installiert und wartend: `6.8.0-142`.
- Der Server lief seit 11.09. ohne Neustart. Das Kernel-Update war **7 Tage installiert, aber
  nicht wirksam**.

Das ist der Grund für die Neustart-Entscheidung (Abschnitt 3) und die Checkliste
(Abschnitt 8).

---

## 7. Neustart und Nachprüfung

Der Neustart wurde am 2026-10-01 durchgeführt, weil der Server nur vom Systemintegrator
genutzt wurde und der Fallback über den Projektbetreiber bestand.

**Vorher geprüft:**

```bash
sudo sshd -t
dpkg -l 'linux-image-*' | grep '^ii'
sudo ufw status verbose
systemctl is-enabled ufw fail2ban ssh.service ssh.socket
```

- `sshd -t` ohne Ausgabe: Konfiguration ist syntaktisch in Ordnung.
- Beide Kernel `6.8.0-139` und `6.8.0-142` installiert. `139` bleibt als Rückfall im
  Boot-Menü.
- `ufw`: `enabled`, `fail2ban`: `enabled`, `ssh.socket`: `enabled`, `ssh.service`:
  `disabled`. Das ist kein Fehler: Ubuntu 24.04 startet `sshd` bei einer Verbindung über
  `ssh.socket` (Socket-Aktivierung).

**Neustart:**

```bash
sudo reboot
```

`sudo reboot` startet den Server über systemd geordnet neu.

**Nachher geprüft:**

```bash
uname -r
uptime -s
ls /var/run/reboot-required*
systemctl is-active ufw fail2ban ssh.socket
sudo ufw status verbose
sudo fail2ban-client status sshd
sudo sshd -T | grep -iE "passwordauthentication|permitrootlogin"
```

| Prüfung | Ergebnis |
|---|---|
| `uname -r` | `6.8.0-142-generic`, der neue Kernel läuft |
| `uptime -s` | `2026-10-01 12:42:00` |
| `reboot-required*` | `No such file or directory` |
| `is-active` ufw / fail2ban / ssh.socket | 3× `active` |
| `ufw status verbose` | Default deny incoming, nur `22/tcp` (IPv4 und IPv6), wie vorher |
| `fail2ban-client status sshd` | Jail läuft, Zähler wieder 0 |
| `sshd -T` | `permitrootlogin no`, `passwordauthentication no` |

Damit ist belegt, dass **alle Schutzmaßnahmen einen Neustart überstehen** und die
SSH-Härtung wirksam ist (wirksame Werte per `sshd -T`, nicht nur aus der Datei).

---

## 8. Grenzen des Tests

- **Verteilte oder langsame Scanner** unterschreiten `maxretry`. Beispiel aus den Logs:
  `187.212.x.x` erzeugte zwischen 12:11 und 12:24 fünf Treffer, nie mehr als vier innerhalb
  von 10 Minuten, und wurde nie gesperrt. Bei 1000 IPs mit je einem Versuch pro Stunde
  greift fail2ban gar nicht. Geschützt ist der Server dann durch den **Schlüssel-Login**
  (Passwörter lassen sich nicht raten) und die **Firewall** (nur Port 22).
- **Echter Benutzername:** Im Modus `normal` zählt `Connection closed by authenticating
  user … [preauth]` nicht. Das ist aus dem Filter abgeleitet (`fail2ban-regex`, `F-NOFAIL`),
  aber nicht gesondert mit einem echten Konto getestet. Der Sperrtest nutzte
  absichtlich einen erfundenen Namen.
- **Ein Testort:** Der kontrollierte Test kam von einer einzigen IP (Hotspot). IPv6 wurde
  nicht getestet. Die Sperrliste im Test enthält nur `ipv4_addr`.
- **Sperren sind zeitlich begrenzt** (10 Minuten) und wiederholen sich nicht verstärkt.
- **Automatische Updates:** Der Lauf vom 01.10. fand nichts. Eine Installation ist über das
  apt-Protokoll vom 24.09. belegt. Ob jede Art von Update (z. B. aus `-updates`) automatisch
  kommt, ist durch die Konfiguration bewusst **nicht** der Fall.
- **Wirksamkeit von Kernel-Updates** erfordert einen Neustart. Die Automatik erledigt
  ihn nicht, siehe Abschnitt 3 und 6.5.
- **Notzugang:** Der Fallback bei einem fehlgeschlagenen Neustart ist der Zugang über den
  Projektbetreiber. Dieser Weg wurde **nicht selbst getestet**.

---

## 9. Wartung (Checkliste)

Wöchentlich, an einem festen Tag, durch die Systemintegration:

1. Per SSH anmelden und prüfen, ob ein Neustart aussteht:
   ```bash
   ls /var/run/reboot-required*
   ```
   Ubuntu zeigt beim Login meist auch den Hinweis `*** System restart required ***`.
2. Ist die Datei vorhanden: Neustart im Wartungsfenster nach Absprache im Team, danach
   die Prüfungen aus Abschnitt 7 („Nachher geprüft") wiederholen.
3. Brute-Force-Schutz prüfen:
   ```bash
   sudo fail2ban-client status sshd
   ```
4. Letzte Updates prüfen:
   ```bash
   sudo tail -n 20 /var/log/unattended-upgrades/unattended-upgrades.log
   ```
5. Eine fälschlich gesperrte IP freigeben (z. B. bei Selbstaussperrung, falls noch Zugang
   besteht):
   ```bash
   sudo fail2ban-client set sshd unbanip <IP>
   ```
6. Eigene Einstellungen für fail2ban gehören in `/etc/fail2ban/jail.local` oder
   `/etc/fail2ban/jail.d/*.local`, nie in `jail.conf`.

---

## 10. Abgleich mit den Akzeptanzkriterien

Kriterium aus Story 16: *„Brute-Force-Schutz und automatische Sicherheitsupdates sind aktiv
und ihr Status ist dokumentiert"*

- [x] fail2ban ist installiert, aktiv (`active`), startet beim Booten (`enabled`) und
      überlebt einen Neustart (Abschnitt 4, 7)
- [x] Brute-Force-Schutz greift: kontrollierter Test mit `Found` → `Ban` → `Unban`, Regel
      in nftables sichtbar, echter Angreifer ebenfalls gesperrt (Abschnitt 5)
- [x] Status von fail2ban ist dokumentiert (`fail2ban-client status sshd`, Abschnitt 5)
- [x] Automatische Sicherheitsupdates sind aktiv: Schalter, erlaubte Quellen, Timer,
      Lauf-Log (Abschnitt 6.1–6.3)
- [x] Automatische Installation ist nachgewiesen (apt-Protokoll vom 24.09., Abschnitt 6.4)
- [x] Status ist dokumentiert, inklusive offenem Befund (Neustart nötig) und seiner
      Behebung (Abschnitt 6.5, 7)

Außerdem durch diese Prüfung bestätigt (aus demselben Kriterienblock von Story 16):

- [x] `PermitRootLogin no` und `passwordauthentication no` sind wirksam (`sshd -T`, nach
      dem Neustart erneut geprüft)

Nicht Teil dieser Anleitung: die Schutzbedarfsbetrachtung mit Zuordnung zu den
Grundschutz-Bausteinen SYS.1.1 und SYS.1.3 sowie das versionierte, wiederholbare Skript
(weitere Kriterien von Story 16).
