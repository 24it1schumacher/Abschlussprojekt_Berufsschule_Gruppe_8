# Anleitung – Firewall (ufw) auf dem VPS einrichten und prüfen

**Bezug:** Story 16 „Server nach IT-Grundschutz härten" – Akzeptanzkriterium
*„Firewall-Regeln erlauben nur dokumentierte notwendige Ports; ein Test von außen
bestätigt einen nicht benötigten Port als geschlossen"* (siehe `docs/user_stories.md`).

Diese Anleitung dokumentiert, wie die Firewall auf dem VPS eingerichtet wurde, warum so
und wie von außen nachgewiesen wurde, dass nicht benötigte Ports nicht erreichbar sind.

---

## 1. Ziel

Von außen sind nur die Ports erreichbar, die in der Tabelle in Abschnitt 3
dokumentiert und fachlich begründet sind. Alles andere wird von der Firewall verworfen.

---

## 2. Ausgangslage

Auf dem Server prüfen, welche Dienste lauschen und ob eine Firewall aktiv ist:

```bash
sudo ss -tulpn
sudo ufw status verbose
```

Ergebnis vor der Änderung:

- Nach außen lauschte nur **sshd auf Port 22** (`0.0.0.0:22` und `[::]:22`).
- Die Ports 53 (`systemd-resolved`, nur `127.0.0.53` / `127.0.0.54`) sind nur lokal
  erreichbar. Port 68/UDP und 546/UDP sind DHCP-Clients auf der Netzwerkkarte `ens6`
  und nehmen nur Antworten des DHCP-Servers entgegen.
- `ufw` war **inaktiv** (`Status: inactive`). Dass nur SSH offen war, lag nur daran,
  dass keine weiteren Dienste installiert waren, nicht an einer Absicherung.

Erklärung der `ss`-Optionen: `-t` TCP, `-u` UDP, `-l` nur lauschende Sockets,
`-p` zugehöriger Prozess, `-n` numerische Ausgabe.

---

## 3. Erlaubte Ports

| Port | Protokoll | Dienst | Begründung |
|---|---|---|---|
| 22 | TCP | SSH | Administration des Servers (Schlüssel-Login) |

Alle weiteren eingehenden Verbindungen sind gesperrt.
**Wer einen neuen Dienst installiert, trägt den Port zuerst hier ein und begründet ihn,
erst danach wird er mit `ufw allow` freigegeben.**

---

## 4. Konzept und Entscheidungen

### Default deny statt Default allow

| Strategie | Bedeutung | Bewertung |
|---|---|---|
| Default allow | Alles erlaubt, nur Bekanntes gesperrt | Unsicher: Neue Dienste sind sofort offen |
| Default deny | Alles gesperrt, nur Notwendiges erlaubt | Sicher: Vergessene oder neue Dienste sind automatisch geschützt |

Gewählt: **Default deny für eingehenden Verkehr**. Ausgehender Verkehr bleibt erlaubt,
damit der Server Updates laden und DNS abfragen kann. Das Risiko liegt bei eingehenden
Verbindungen; ausgehende zu sperren wäre deutlich aufwendiger und ist hier nicht
gefordert.

### Werkzeug: ufw

`ufw` (Uncomplicated Firewall) ist nur die Bedienoberfläche. Die eigentliche Filterung
macht im Linux-Kernel *netfilter* (angesprochen über nftables/iptables).

| Alternative | Vorteil | Nachteil |
|---|---|---|
| `ufw` (gewählt) | Einfache Syntax, unter Ubuntu Standard, regelt IPv4 und IPv6 gleichzeitig | Weniger Funktionen als direkte Regeln |
| `nftables` direkt | Sehr mächtig, flexibel | Komplexer, für die Projektgröße unnötig |
| `firewalld` | Zonenmodell | Bei Ubuntu unüblich, zusätzliche Komplexität |

### Zustandsbehaftet (stateful)

`ufw` merkt sich bestehende Verbindungen (Connection Tracking). Pakete einer bereits
aufgebauten, erlaubten Verbindung werden durchgelassen. Eine laufende SSH-Sitzung wird
deshalb beim Aktivieren der Firewall nicht getrennt.

### DROP statt REJECT

`ufw` verwirft gesperrte Pakete standardmäßig still (**DROP**). Der Absender bekommt
keine Antwort.

| Variante | Vorteil | Nachteil |
|---|---|---|
| DROP (Standard) | Scanner werden ausgebremst, die Firewall verrät weniger | Legitime Clients warten bei Fehlkonfiguration auf Timeouts |
| REJECT | Fehler fallen sofort auf | Verrät, dass ein Host da ist und aktiv filtert |

Für einen öffentlich erreichbaren Server wird DROP beibehalten.

---

## 5. Umsetzung

Ausführende Person: Systemintegration, auf dem Server mit dem sudo-Konto.

**Wichtig:** SSH muss **vor** dem Aktivieren erlaubt werden, sonst sperrt man sich bei
Fernzugriff selbst aus. Die Regeln lassen sich anlegen und prüfen, solange die Firewall
noch aus ist.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw show added
sudo ufw enable
sudo ufw status verbose
```

| Befehl | Wirkung |
|---|---|
| `default deny incoming` | Alles Eingehende ist verboten, außer ausdrücklich erlaubt |
| `default allow outgoing` | Der Server darf selbst nach außen verbinden |
| `allow 22/tcp` | Erlaubt SSH, nur TCP; wird für IPv4 und IPv6 angelegt (`v6`), weil sshd auch auf `[::]:22` lauscht |
| `show added` | Zeigt die angelegten Regeln, ohne sie zu aktivieren (Kontrollpunkt) |
| `enable` | Aktiviert die Firewall, auch nach einem Neustart |
| `status verbose` | Prüft den aktiven Zustand |

**Sicherheitsnetz beim Aktivieren:** Die bestehende SSH-Sitzung offen lassen und in einem
**zweiten, neuen Terminal** prüfen, ob eine neue Anmeldung funktioniert. Falls nicht,
kann im ersten Fenster mit `sudo ufw disable` zurückgerollt werden.

Ergebnis von `sudo ufw status verbose` nach der Aktivierung:

```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
22/tcp (v6)                ALLOW IN    Anywhere (v6)
```

---

## 6. Nachweis von außen

Der Test muss von einem **anderen Rechner** kommen. Ein Scan von `localhost` auf dem
Server selbst würde die Firewall umgehen und beweist nichts.

Testumgebung: WSL (Ubuntu) auf dem Rechner der Systemintegration, nmap 7.94.
Datum: 2026-10-01. Ziel: `217.154.119.133`.

```bash
nmap -Pn -p 22,80,3306 217.154.119.133
```

- `-Pn` überspringt den Ping-Test, damit auch Hosts gescannt werden, die nicht auf Ping
  antworten, und der Vorher-/Nachher-Vergleich gleiche Bedingungen hat.
- `-p 22,80,3306` prüft gezielt diese Ports: 22 (benötigt), 80 und 3306 (nicht benötigt).

| Port | Vorher (Firewall aus) | Nachher (Firewall an) |
|---|---|---|
| 22/tcp | open | open |
| 80/tcp | closed | **filtered** |
| 3306/tcp | closed | **filtered** |
| Scandauer | 0,08 s | 1,35 s |

Bedeutung der nmap-Zustände:

| Zustand | Bedeutung |
|---|---|
| `open` | Ein Dienst antwortet |
| `closed` | Der Serverkernel antwortet mit RST („hier lauscht niemand") |
| `filtered` | Keine Antwort, die Firewall verwirft das Paket |

Vorher antworteten die nicht benötigten Ports sofort mit `closed`, weil kein Dienst
darauf lauschte. Nachher werden die Pakete von der Firewall verworfen. Die längere
Scandauer entsteht, weil nmap auf Antworten wartet und die Anfrage wiederholt. Die
Ports 80 und 3306 gelten damit als **von außen nicht erreichbar**.

### Vollständiger Portscan

```bash
nmap -Pn -p- 217.154.119.133
```

`-p-` prüft alle 65535 TCP-Ports.

Ergebnis: nur 22/tcp `open`, alle anderen `filtered`

```
PORT   STATE SERVICE
22/tcp open  ssh
Not shown: 65534 filtered tcp ports (no-response
```

Zusätzlich wurde geprüft, dass eine **neue** SSH-Anmeldung nach der Aktivierung
weiterhin funktioniert (zweites Terminal).

---

## 7. Grenzen des Tests

- Es wurde nur **TCP** gescannt. UDP (`nmap -sU`) ist langsam und wurde nicht
  vollständig geprüft.
- Der Scan lief von **einem** Standort aus. Der Test von innen (`ss`, `ufw status`)
  und der Test von außen ergänzen sich.
- IPv6 wurde nicht gesondert von außen gescannt; die Regel existiert für beide
  Protokolle (`22/tcp (v6)`).

---

## 8. Wartung

1. Neuen Dienst installieren heißt: Port in Abschnitt 3 eintragen und begründen.
2. Erst dann `sudo ufw allow <port>/<protokoll>` ausführen.
3. Danach mit `sudo ss -tulpn` prüfen, dass nur erwartete Dienste lauschen, und mit
   `nmap` von außen gegenprüfen.
4. Eine nicht mehr benötigte Regel entfernen: `sudo ufw status numbered`, dann
   `sudo ufw delete <nummer>`.

---

## 9. Abgleich mit den Akzeptanzkriterien

- [x] Firewall mit Default deny aktiv, nur dokumentierte Ports erlaubt (Abschnitt 3, 5)
- [x] Test von außen bestätigt nicht benötigte Ports (80, 3306) als nicht erreichbar (Abschnitt 6)
- [x] Vollständiger Portscan `-p-` ausgewertet (Abschnitt 6)

**Hinweis zum Begriff „geschlossen":** Das Kriterium spricht von einem „geschlossenen"
Port. Gemessen wurde `filtered`: Die Firewall verwirft die Anfrage, es kommt keine
Antwort. Der Port ist damit von außen nicht nutzbar, was der Absicht des Kriteriums
entspricht. `closed` wäre technisch eine aktive Ablehnung durch den Serverkernel
(RST). Siehe Abschnitt 4 (DROP statt REJECT) für die Begründung, warum `filtered`
bewusst gewählt wurde.
