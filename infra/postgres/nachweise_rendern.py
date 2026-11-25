"""Rendert erfasste Terminal-Ausgaben (eine .txt pro Nachweis) als PNG im Terminal-Look.

Aufruf (auf dem PC, Chrome und Pillow noetig):
  python nachweise_rendern.py <ordner-mit-txt> <ausgabeordner> <compose.yaml> "<Hinweis rechts oben>"
Beispiel:
  python infra/postgres/nachweise_rendern.py infra/postgres/nachweise_vps docs/praesentation/story10_vps infra/postgres/compose.yaml "VPS · Strato"
"""
import html, re, subprocess, sys, pathlib, tempfile

SHOTS = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2]).resolve(); OUT.mkdir(parents=True, exist_ok=True)
COMPOSE = pathlib.Path(sys.argv[3])
TAG = sys.argv[4] if len(sys.argv) > 4 else ""
# Optional: Zeilenbereiche fuer den Ausschnitt, z. B. "12-24,33-37"
RANGES = [tuple(map(int, r.split("-"))) for r in sys.argv[5].split(",")] if len(sys.argv) > 5 else [(9, 43)]
COMPOSE_TITLE = COMPOSE.resolve().relative_to(pathlib.Path(__file__).resolve().parents[2]).as_posix()
TMP = pathlib.Path(tempfile.mkdtemp(prefix="nachweise_"))
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# Titel und Hervorhebungen je Bild: (Regex, Klasse) - "ok" gruen, "block" rot/orange
META = {
    "01_start": ("Feste Version, Container healthy", [
        (r"^postgres:17\.11-trixie$", "ok"), (r"\(healthy\)", "ok"), (r"PostgreSQL 17\.11", "ok"), (r"ready to accept", "ok")]),
    "02_ohne_passwort": ("Ohne Passwort kein Start", [
        (r"missing a value", "block"), (r"^Exit-Code: 1$", "block"), (r"^0$", "block"), (r"Healthy", "ok")]),
    "03_kein_autoschema": ("Kein automatisch angelegtes Schema", [
        (r"\(3 rows\)", "ok")]),
    "04_persistenz": ("Daten überleben das Neuerstellen des Containers", [
        (r"^[0-9a-f]{12}$", "id"), (r"vor dem Neuerstellen \|", "ok"), (r"maschinenverleih-postgres-data", "ok")]),
    "05_port": ("Port 5432 nur auf Loopback", [
        (r"^127\.0\.0\.1:5432$", "ok"), (r"ABHÖREN", "ok"), (r"LISTEN.*127\.0\.0\.1:5432", "ok"), (r"dpt:5432", "ok"),
        (r"^Status: active", "ok"), (r"-> offen", "ok"), (r"keine Verbindung", "block")]),
    "06_internes_netz": ("Verbindungstest aus dem internen Docker-Netz", [
        (r"^\s+1$", "ok"), (r"no response", "block"), (r"Exit-Code: 2", "block")]),
    "07_schema": ("Schema 002–010 eingespielt, Eigentümer = Anwendungsrolle", [
        (r" ok$", "ok"), (r"maschinenverleih_app \|\s+27", "ok")]),
    "08_haertung": ("Härtung laut docker inspect", [
        (r"no-new-privileges:true", "ok"), (r"max-file:3 max-size:10m", "ok"), (r"unless-stopped", "ok")]),
    "09_secrets_git": ("Zugangsdaten nicht im Repository", [
        (r"\*\*/\.env\b", "block"), (r"\.env\.example$", "ok"), (r"compose\.yaml$", "ok"), (r"POSTGRES_ADMIN_PASSWORD=$", "ok")]),
    "10_env_rechte": ("Zugangsdaten nur für das eigene Konto lesbar", [
        (r"^-rw-------", "ok")]),
    "11_volume": ("Persistentes Volume auf dem Server", [
        (r"_data", "ok")]),
    "12_portscan_extern": ("Portscan von außen auf den Server", [
        (r"22/tcp\s+open", "ok"), (r"5432/tcp\s+(filtered|closed)", "block"), (r":22 -> offen", "ok"), (r"keine Verbindung", "block")]),
    "13_ssh_tunnel": ("Zugriff nur über den SSH-Tunnel", [
        (r"keine Verbindung", "block"), (r"-> offen", "ok"), (r"Exit-Code: 0", "ok"), (r"17\.11", "ok")]),
    # App-Stack
    "21_build_mit_tests": ("Image-Bau führt die Backend-Tests aus", [
        (r"Tests run: \d+, Failures: 0, Errors: 0", "ok"), (r"BUILD SUCCESS", "ok"), (r"Built", "ok")]),
    "22_stack_laeuft": ("Drei Container, nur der Webserver nach außen", [
        (r"^backend .*8080/tcp\s*$", "ok"), (r"^web .*127\.0\.0\.1:8080->80", "ok"), (r"^127\.0\.0\.1:8080$", "ok")]),
    "23_proxy_routing": ("Ein Eingang: Webserver leitet /api an das Backend", [
        (r'\{"status":"ok"\}', "ok"), (r"<title>", "ok"), (r"^(X-|Referrer|Permissions)", "ok")]),
    "24_netztrennung": ("Netztrennung: Webserver erreicht die Datenbank nicht", [
        (r'\{"status":"ok"\}', "ok"), (r"bad address", "block"), (r"Exit-Code: 1", "block"), (r"erreichbar", "ok"), (r"^maschinenverleih-(web|db)-intern:", "id")]),
    # VPS: automatisches Deployment
    "30_auto_deploy": ("Automatisch ausgerollt: CI grün → Server übernimmt selbst", [
        (r"ausstehend", "id"), (r"Rolle .* -> ", "ok"), (r"Fertig: ", "ok"), (r"success", "ok")]),
    "31_timer": ("systemd-Timer mit eigenem Systembenutzer", [
        (r"maschinenverleih-deploy\.timer", "ok"), (r"Result=success", "ok"), (r"ProtectSystem=strict", "ok"),
        (r"NoNewPrivileges=yes", "ok"), (r"nologin", "ok")]),
    "32_ports_server": ("Offene Ports auf dem Server", [
        (r"^0\.0\.0\.0:(22|80|443)$", "ok"), (r"^127\.0\.0\.1:5432$", "id")]),
    "33_von_aussen": ("Test von außen: nur HTTPS, interne Ports zu", [
        (r"308", "ok"), (r"HTTPS -> 200", "ok"), (r'\{"status":"ok"\}', "ok"), (r"^Strict-Transport", "ok"),
        (r"keine Verbindung", "block")]),
    "34_zertifikat": ("Automatisch ausgestelltes TLS-Zertifikat", [
        (r"Let's Encrypt", "ok"), (r"notAfter", "id")]),
    "25_container_haertung": ("Container ohne Root und mit schreibgeschütztem Dateisystem", [
        (r"uid=1000", "ok"), (r"Read-only file system", "block"), (r"Exit-Code: 1", "block"), (r"ReadOnly=true", "ok")]),
}

CSS = """
body{margin:0;background:#0f1115;font-family:'Cascadia Mono','Consolas',monospace}
.win{margin:24px;border-radius:10px;overflow:hidden;background:#1a1d23;box-shadow:0 8px 30px #0008;border:1px solid #2c313a}
.bar{background:#262a31;padding:10px 16px;display:flex;align-items:center;gap:8px;color:#aab2bf;font:600 15px 'Segoe UI',sans-serif}
.dot{width:12px;height:12px;border-radius:50%}
.t{margin-left:12px}
.tag{margin-left:auto;font-weight:400;font-size:13px;color:#7f8896}
pre{margin:0;padding:16px 20px;font-size:17px;line-height:1.45;color:#d7dae0;white-space:pre-wrap;word-break:break-all}
.cmd{color:#7fd1ff}.cmd .p{color:#98c379;font-weight:700}
.cmt{color:#7f8896;font-style:italic}
.ok{background:#1f3b2a;color:#b8f5c8;border-left:3px solid #4ade80;margin-left:-20px;padding-left:17px;display:block}
.block{background:#40231f;color:#ffc9b8;border-left:3px solid #fb7c5a;margin-left:-20px;padding-left:17px;display:block}
.id{background:#3a3419;color:#ffe58a;border-left:3px solid #facc15;margin-left:-20px;padding-left:17px;display:block}
.ln{color:#5c6370;display:inline-block;width:2.2em;text-align:right;margin-right:14px;user-select:none}
"""

def page(title, tag, body):
    return f"""<!doctype html><meta charset="utf-8"><style>{CSS}</style>
<div class="win"><div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span>
<span class="dot" style="background:#28c840"></span><span class="t">{html.escape(title)}</span><span class="tag">{html.escape(tag)}</span></div>
<pre>{body}</pre></div>"""

def shoot(name, doc, nlines):
    f = TMP / f"{name}.html"; f.write_text(doc, encoding="utf-8")
    height = 200 + int(nlines * 17 * 1.45 * 1.3)   # grosszuegig, wird danach zugeschnitten
    png = OUT / f"{name}.png"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                    f"--window-size=1400,{height}", f"--screenshot={png}", f.as_uri()], check=True, capture_output=True)
    from PIL import Image, ImageChops
    im = Image.open(png).convert("RGB")
    bg = Image.new("RGB", im.size, (15, 17, 21))
    box = ImageChops.difference(im, bg).point(lambda v: 255 if v > 12 else 0).getbbox()
    if box[3] >= im.height - 2:
        print("WARNUNG abgeschnitten:", name)
    im.crop((0, 0, im.width, min(im.height, box[3] + 48))).save(png, optimize=True)
    print(png.name, im.width, box[3] + 48)

def wrapped_lines(lines, width=118):
    return sum(max(1, -(-len(l) // width)) for l in lines)

for txt in sorted(SHOTS.glob("*.txt")):
    name = txt.stem
    title, rules = META.get(name, (name[3:].replace("_", " "), []))
    lines = txt.read_text(encoding="utf-8").rstrip("\n").split("\n")
    out = []
    for l in lines:
        e = html.escape(l)
        if l.startswith("$ #"):
            out.append(f'<span class="cmt">{e}</span>')
        elif l.startswith("$ "):
            out.append(f'<span class="cmd"><span class="p">$</span>{e[1:]}</span>')
        else:
            cls = next((c for rx, c in rules if re.search(rx, l)), None)
            out.append(f'<span class="{cls}">{e}</span>' if cls else e)
    body = "\n".join(out).replace("</span>\n", "</span>\n")
    # Block-Spans brauchen keinen zusaetzlichen Zeilenumbruch
    body = re.sub(r'(<span class="(?:ok|block|id)">[^\n]*</span>)\n', r"\1", body)
    shoot(name, page(f"{name[:2]} · {title}", TAG, body), wrapped_lines(lines))

# Compose-Datei mit Zeilennummern und markierten Kernzeilen
src = COMPOSE.read_text(encoding="utf-8").rstrip("\n").split("\n")
key = [r"include:", r"- path:", r"DB_URL:", r"- db-intern", r"- web-intern", r"WEB_BIND:-", r"Caddyfile:ro", r"read_only: true", r"image: postgres", r"POSTGRES_PASSWORD:", r'"127\.0\.0\.1:5432:5432"', r"postgres-data:/var", r"no-new-privileges", r"max-size", r"^  postgres-data:"]
out = []
for i, l in enumerate(src, 1):
    e = html.escape(l)
    if l.strip().startswith("#"):
        e = f'<span class="cmt">{e}</span>'
    row = f'<span class="ln">{i}</span>{e}'
    out.append(f'<span class="ok">{row}</span>' if any(re.search(k, l) for k in key) else row + "\n")
shoot("00_compose_yaml", page(COMPOSE_TITLE, "versioniert im Repository", "".join(out)), wrapped_lines(src, 110))

# Kompakter Ausschnitt fuer eine Folie: nur Zeilen ohne Kommentar, Zeilen 9-43
out = []
for i, l in enumerate(src, 1):
    if not any(a <= i <= b for a, b in RANGES) or l.strip().startswith("#"):
        continue
    e = html.escape(l.replace("POSTGRES_ADMIN_PASSWORD fehlt - in infra/postgres/.env setzen (siehe .env.example)", "Fehlermeldung"))
    row = f'<span class="ln">{i}</span>{e}'
    out.append(f'<span class="ok">{row}</span>' if any(re.search(k, l) for k in key) else row + "\n")
shoot("00b_compose_ausschnitt", page(COMPOSE_TITLE + " (Ausschnitt, ohne Kommentare)", "versioniert im Repository", "".join(out)), len(out))
