# Screenshots – Anwendung als Container-Stack

Echte Ausgaben aus dem lokalen Probelauf am 25.11.2026 (Docker 29.1.3, Windows).
Grün = erwartetes Ergebnis, Rot = gewollt blockiert, Gelb = zum Vergleichen.

| Bild | Aussage |
|---|---|
| `19_architektur.png` | Überblick: Browser → web (Caddy) → backend → postgres, zwei getrennte Netze (Quelle: `19_architektur.html`) |
| `20b_compose_stack_ausschnitt.png` | Die Stack-Konfiguration auf einen Blick |
| `20_compose_stack.png` | Komplette Datei mit Kommentaren (Backup-Folie) |
| `21_build_mit_tests.png` | Beim Bau des Backend-Images laufen alle 13 Tests, sonst entsteht kein Image |
| `22_stack_laeuft.png` | Drei Container healthy; nur `web` hat einen Port nach außen |
| `23_proxy_routing.png` | `/api` geht ans Backend, alles andere ist das Frontend; Sicherheits-Header gesetzt |
| `24_netztrennung.png` | Webserver erreicht das Backend, aber nicht die Datenbank |
| `25_container_haertung.png` | Backend läuft als UID 1000 und kann sein Dateisystem nicht verändern |
| `26_app_im_browser.png` | Die Anwendung über den Proxy, Status „Backend und Datenbank verbunden“ |

Vorschlag für die Präsentation: 19 → 20b → 24 → 26 (+ 21 als Brücke „Jakobs Tests sind Teil des Builds“).
