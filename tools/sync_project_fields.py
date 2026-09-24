#!/usr/bin/env python3
"""
Setzt die nativen GitHub-Projects-Felder "Size" und "Priority" für Issues im
Project "Abschlussprojekt Gruppe 8", statt das per Label zu pflegen.

Voraussetzungen:
  1. GitHub CLI installiert und eingeloggt (gh auth login), mit Schreibrechten am Project
  2. Python 3

Verwendung:
  python3 sync_project_fields.py --owner 24it1schumacher --project-number 1

  Optional (Trockenlauf ohne tatsächliches Setzen, nur Ausgabe):
  python3 sync_project_fields.py --owner 24it1schumacher --project-number 1 --dry-run

Das Skript:
  - liest die Felddefinitionen (Size/Priority) des Projects aus
  - liest alle Items des Projects aus
  - setzt Size/Priority anhand der ISSUE_FIELDS-Zuordnung unten (Schlüssel = Issue-Nummer)
  - lässt Felder unangetastet, die bereits einen Wert haben (keine Überschreibung manueller Anpassungen)
"""

import argparse
import json
import subprocess
import sys

# Issue-Nummer -> (Size, Priority). Nur Issues auflisten, die (noch) ein Feld brauchen.
# Size: XS, S, M, L, XL – aus "Aufwand (T-Shirt-Größe)" in user_stories.md
# Priority: P0 (blockierend/grundlegend), P1 (für MVP nötig), P2 (später/Ausbau)
ISSUE_FIELDS = {
    5: ("L", "P1"),   # Maschinen suchen und reservieren
    6: ("M", "P1"),   # Maschinenstammdaten erfassen und verwalten
    7: ("M", "P2"),   # Wartungsbedarf regelbasiert berechnen
    8: ("L", "P0"),   # Infrastruktur automatisiert bereitstellen (IaC)
    9: ("L", "P1"),   # Grundgerüst (bereits gesetzt, hier zur Vollständigkeit)
    10: ("L", "P1"),  # Kundenstammdaten aus dem Altsystem übernehmen
    11: ("L", "P1"),  # Rollen- und Zugriffsrechte verwalten
    12: ("XL", "P1"), # Buchung zu einem verbindlichen Auftrag
    13: ("M", "P0"),  # Datenbanksystem auswählen (Priority bereits gesetzt)
    14: ("L", "P1"),  # Datenbank-Server produktiv bereitstellen
    15: ("M", "P1"),  # Mailserver-System auswählen
    16: ("L", "P1"),  # Mailserver produktiv bereitstellen
    17: ("L", "P1"),  # Betrieb und Sicherheit DB/Mail
    18: ("M", "P1"),  # TLS-Verschlüsselung
    19: ("M", "P2"),  # Reservierung stornieren oder ändern
    20: ("XL", "P2"), # Rechnung aus Auftrag erzeugen
    21: ("L", "P2"),  # Zahlungsabwicklung anbinden
    22: ("M", "P2"),  # Kundenportal
    23: ("M", "P2"),  # Verwaltungsoberfläche für Mitarbeiter
    24: ("L", "P2"),  # Online-Shop für Verbrauchsmaterial
    25: ("M", "P2"),  # Barrierefreiheitsprüfung nach ISO 9241
    26: ("L", "P2"),  # Backup- und Restore-Konzept
    27: ("L", "P2"),  # Monitoring und Alerting
    28: ("L", "P2"),  # CI/CD-Pipeline
    29: ("M", "P2"),  # Objektspeicher für Dateien
    30: ("M", "P2"),  # Zentrales Log-Management
    31: ("M", "P2"),  # Notfallwiederherstellung
}


def run_json(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"✘ Fehler bei {' '.join(cmd)}: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def get_field_options(owner, project_number, field_name):
    data = run_json(["gh", "project", "field-list", str(project_number), "--owner", owner, "--format", "json"])
    for field in data["fields"]:
        if field["name"] == field_name:
            return field["id"], {opt["name"]: opt["id"] for opt in field.get("options", [])}
    print(f"✘ Feld '{field_name}' nicht im Project gefunden.", file=sys.stderr)
    sys.exit(1)


def get_project_id(owner, project_number):
    data = run_json(["gh", "project", "view", str(project_number), "--owner", owner, "--format", "json"])
    return data["id"]


def get_items(owner, project_number):
    data = run_json(["gh", "project", "item-list", str(project_number), "--owner", owner,
                      "--format", "json", "--limit", "200"])
    return data["items"]


def issue_number_from_url(url):
    try:
        return int(url.rstrip("/").rsplit("/", 1)[-1])
    except (ValueError, AttributeError):
        return None


def set_field(project_id, item_id, field_id, option_id, dry_run):
    cmd = ["gh", "project", "item-edit", "--id", item_id, "--field-id", field_id,
           "--project-id", project_id, "--single-select-option-id", option_id]
    if dry_run:
        print(f"[dry-run] {' '.join(cmd)}")
        return
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"✘ Fehler: {result.stderr.strip()}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Size/Priority im GitHub Project setzen")
    parser.add_argument("--owner", required=True, help="Projekt-Owner (User oder Org)")
    parser.add_argument("--project-number", required=True, type=int, help="Nummer des Projects")
    parser.add_argument("--dry-run", action="store_true", help="Nur anzeigen, nichts setzen")
    args = parser.parse_args()

    project_id = get_project_id(args.owner, args.project_number)
    size_field_id, size_options = get_field_options(args.owner, args.project_number, "Size")
    prio_field_id, prio_options = get_field_options(args.owner, args.project_number, "Priority")

    items = get_items(args.owner, args.project_number)

    for item in items:
        content = item.get("content", {})
        issue_number = issue_number_from_url(content.get("url"))
        if issue_number not in ISSUE_FIELDS:
            continue

        size, priority = ISSUE_FIELDS[issue_number]
        title = content.get("title", "?")

        if not item.get("size"):
            set_field(project_id, item["id"], size_field_id, size_options[size], args.dry_run)
            print(f"  Size={size} -> #{issue_number} {title}")
        if not item.get("priority"):
            set_field(project_id, item["id"], prio_field_id, prio_options[priority], args.dry_run)
            print(f"  Priority={priority} -> #{issue_number} {title}")


if __name__ == "__main__":
    main()
