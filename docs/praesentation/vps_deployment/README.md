# Screenshots – Automatisches Deployment auf dem echten VPS

Echte Ausgaben vom Projektserver und von außen, 25.11.2026. Server-IP und Kontoname sind geschwärzt.
Grün = erwartetes Ergebnis, Rot = gewollt blockiert, Gelb = zum Vergleichen / Wartezustand.

| Bild | Aussage |
|---|---|
| `30_auto_deploy.png` | Commit gepusht → Server wartet, bis CI grün ist („ausstehend“) → rollt 2 Minuten später selbst aus |
| `31_timer.png` | systemd-Timer, eigener Systembenutzer ohne Login, `ProtectSystem=strict`, `NoNewPrivileges` |
| `32_ports_server.png` | Auf dem Server lauschen nur 22, 80, 443; Datenbank nur auf 127.0.0.1 |
| `33_von_aussen.png` | HTTP → Umleitung auf HTTPS, gültiges Zertifikat, HSTS; 5432 und 8080 von außen zu |
| `34_zertifikat.png` | Zertifikat automatisch von Let's Encrypt, 90 Tage gültig, erneuert sich selbst |
| `35_github_actions.png` | CI-Lauf auf GitHub: drei Prüfungen grün |
| `36_app_https.png` | Die Anwendung im Browser über HTTPS |

Erzeugt mit `bash infra/deploy/nachweise_vps.sh <hostname>`; nach dem Wechsel auf `bbk-it-08.de` neu erzeugen.

Vorschlag für die Präsentation: 19 (Architektur, Ordner `app_stack`) → 35 → 30 → 33 → 36.
