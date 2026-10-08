# Docker auf einem System installieren

## Firewallproblem

Docker umgeht die ufw-Regeln, wenn öffentliche Ports angegeben werden _siehe_ [Docker und die Firewall](https://docs.docker.com/engine/install/ubuntu/#firewall-limitations)

## Docker Dokumentation aufrufen

[Docker Docs Webseite](https://docs.docker.com/engine/install/ubuntu/)

OS Requirements erfüllt, _siehe [Ubuntu Server Version](#OS-Version)_

## Alte Docker Versionen und Rückstände entfernen

Der Server ist installiert mit einem Ubuntu 24.04.

```bash
sudo  apt  remove $(dpkg  --get-selections  docker.io  docker-compose  docker-compose-v2  docker-doc  docker-buildx  podman-docker  containerd  runc  |  cut  -f1)
```

Die Ausgabe gab an, das keine Pakete entfernt wurden. Demnach war nie ein Teil dieser Pakete auf dem Gerät installiert.

## Installation übers apt-Repository

### Hinzufügen des Docker-Repositorys in apt mit Schlüsselverifikation

```bash
# Add Docker's official GPG key:
sudo  apt  update  # Paketquellen aktualisieren
sudo  apt  install  ca-certificates  curl  # nötige Programme wenn nötig, nachinstallieren
sudo  install  -m  0755  -d  /etc/apt/keyrings  #legt den Ordner mit den passenden Rechten an, in diesem Ordner landet der Schlüssel für apt, um zu überprüfen, ob die Pakete wirklich von Docker kommen(Integrität)
sudo  curl  -fsSL  https://download.docker.com/linux/ubuntu/gpg  -o  /etc/apt/keyrings/docker.asc  #lädt mit curl den öffentlichen gpg-Schlüssel von docker herunter und speichert in entsprechend ab
sudo  chmod  a+r  /etc/apt/keyrings/docker.asc  # fügt für alle Benutzer lesende Rechte hinzu. So kann apt diesen Schlüssel auch lesen und verwenden

# Add the repository to Apt sources:
sudo  tee  /etc/apt/sources.list.d/docker.sources  <<EOF  # erstellt eine Datei und befüllt diese mit Text bis zum Stichwort EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg  --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo  apt  update  # aktualisiert die Paketquellen. Docker sollte jetzt dort auch auftauchen
```

### Docker über `apt` installieren

```bash
sudo  apt  install  docker-ce  docker-ce-cli  containerd.io  docker-buildx-plugin  docker-compose-plugin  # lädt alle nötigen Pakete und Programme für Docker herunter
```

#### Verifikation der Installation

Überprüfen ob Docker richtig installiert wurde: systemctl aufrufen und überprüfen, ob der DockerService läuft

```bash
sudo  systemctl  status  docker
```

Ausgabe

```
si-lasse@ubuntu:~$ sudo systemctl status docker
[sudo] password for si-lasse:
Sorry, try again.
[sudo] password for si-lasse:
● docker.service - Docker Application Container Engine
Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled; preset: enabled)
Active: active (running) since Thu 2026-10-08 08:07:02 UTC; 36min ago
TriggeredBy: ● docker.socket
Docs: https://docs.docker.com
Main PID: 68148 (dockerd)
Tasks: 13
Memory: 30.8M (peak: 35.7M)
CPU: 1.705s
CGroup: /system.slice/docker.service
└─68148 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock

Oct 08 08:07:02 ubuntu dockerd[68148]: time="2026-10-08T08:07:02.279780281Z" level=info msg="Loading >
Oct 08 08:07:02 ubuntu dockerd[68148]: time="2026-10-08T08:07:02.292684173Z" level=info msg="Docker d>
Oct 08 08:07:02 ubuntu dockerd[68148]: time="2026-10-08T08:07:02.292877881Z" level=info msg="Initiali>
Oct 08 08:07:02 ubuntu dockerd[68148]: time="2026-10-08T08:07:02.654558483Z" level=info msg="Complete>
Oct 08 08:07:02 ubuntu dockerd[68148]: time="2026-10-08T08:07:02.663688124Z" level=info msg="Daemon h>
Oct 08 08:07:02 ubuntu dockerd[68148]: time="2026-10-08T08:07:02.663834273Z" level=info msg="API list>
Oct 08 08:07:02 ubuntu systemd[1]: Started docker.service - Docker Application Container Engine.
Oct 08 08:07:30 ubuntu dockerd[68148]: time="2026-10-08T08:07:30.072055401Z" level=info msg="image pu>
Oct 08 08:07:30 ubuntu dockerd[68148]: time="2026-10-08T08:07:30.291868784Z" level=info msg="sbJoin: >
Oct 08 08:07:30 ubuntu dockerd[68148]: time="2026-10-08T08:07:30.388607757Z" level=info msg="received>
si-lasse@ubuntu:~$
```

### hello-world Dockercontainer starten

Dieser Container ist eine verifikation, ob Docker läuffähig ist

```bash
sudo  docker  run  hello-world
```

```
si-lasse@ubuntu:/etc/apt/sources.list.d$ sudo docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
4f55086f7dd0: Pull complete
d5e71e642bf5: Download complete
Digest: sha256:5e23090353324d887c48ad5e5c56d294eab81588df9605b07d1afe895f9cc8f8
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
1. The Docker client contacted the Docker daemon.
2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
(amd64)
3. The Docker daemon created a new container from that image which runs the
executable that produces the output you are currently reading.
4. The Docker daemon streamed that output to the Docker client, which sent it
to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
$ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
https://hub.docker.com/

For more examples and ideas, visit:
https://docs.docker.com/get-started/

Docker Image wird heruntergeladen und ausgeführt. Es sollte eine Hello-World Ausgabe im Terminal auftauchen.
```

## Installierte Versionen

### Docker Engine

```bash
si-lasse@ubuntu:~$  sudo  docker  version
Client:  Docker  Engine  -  Community
Version:  29.8.2
API  version:  1.56
Go  version:  go1.26.8
Git  commit:  7fc2dff
Built:  Wed  Sep  30  19:32:28  2026
OS/Arch:  linux/amd64
Context:  default

Server:  Docker  Engine  -  Community
Engine:
Version:  29.8.2
API  version:  1.56 (minimum version  1.40)
Go  version:  go1.26.8
Git  commit:  8af9fe3
Built:  Wed  Sep  30  19:32:28  2026
OS/Arch:  linux/amd64
Experimental:  false
containerd:
Version:  v2.3.6
GitCommit:  ee2735368117d2eb259779949d5e75cdafec9761
runc:
Version:  1.5.1
GitCommit:  v1.5.1-0-g8f2685a4
docker-init:
Version:  0.19.0
GitCommit:  de40ad0
```

### Docker Compose

```bash
si-lasse@ubuntu:~$  docker  compose  version
Docker  Compose  version  v5.6.0
```

### OS-Version

```bash
si-lasse@ubuntu:~$  lsb_release  -a
No  LSB  modules  are  available.
Distributor  ID:  Ubuntu
Description:  Ubuntu  24.04.5  LTS
Release:  24.04
Codename:  noble
```

## Autostart des Dienstes

```bash
si-lasse@ubuntu:~$  systemctl  is-enabled  docker
enabled
```

## Begründungen und Grenzen

### Paketquellen

Um Docker zu installieren gibt es grob 4 verschiedene Möglichkeiten. Im Folgenden möchte ich diese einmal kurz darstellen und die Vor- und Nachteile erläutern

| Installationsweg                      | Vorteil                                                                                                               | Nachteil                                                                                                                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Offizielle Docker-Quelle (apt)        | Akuellste prod. Version von Docker selbst. Updates laufen simpel über `apt`.Signiert von Docker. Empfohlen für Server | Zusätzliche Quelle neben Ubuntu. Pakete kommen nicht von Ubuntu selbst.                                                                                                                                                            |
| Ubuntu-Paket `docker.io`              | Pakete kommen direkt aus Ubuntus eigener Quelle, kein zusätzliches Vertrauen nötig                                    | Meistens **ältere Versionen**. Docker Compose etc. sind getrennt von einander.                                                                                                                                                     |
| Convenience-Skript `(get.docker.com)` | mit einer Befehlszeile Docker auf dem System installieren                                                             | Skript aus dem Internet mit Root ausführen ohne es vorher vollständig zu prüfen. Für Produktivsysteme daher ungeeignet. Skript kann sich im Inhalt über verschiedene Versionen verändern und damit unbrauchbare Ergebnisse liefern |
| Snap                                  | Installation und Updates einfach möglich                                                                              | Snap ist ein Container System. Docker läuft isoliert. Führt nachweislich zu Problemen mit Pfaden, Volumes und Rechten.                                                                                                             |

## Grenzen des öffentlichen Schlüssels und der Verifikation der Pakete

Ich lade den Schlüssel einmalig bei Docker über den `curl` Befehl herunter. Die Verbindung selbst ist über HTTPS sicher verschlüsselt. Ein Problem besteht jedoch noch: Die Quelle von der ich den Schlüssel herunterlade kann manipuliert sein. So hätte ich dann einen kompromittierten Schlüssel eines potenziellen Angreifers installiert.

Pakete die ich über diesen Schlüssel installieren würden somit als **gültig signiert** angezeigt werden.

Die aktuelle Docker Dokumentation bietet keinen direkte Möglichkeit den Fingerabdruck des Schüssels zu verifizieren. Wir nutzen hier das Prinzip: **Trust on first use**
Wir vertrauen der download.docker.com Adresse somit.
