// Fachgespraech-Praesentation Lasse Fischer – Gruppe 8
const pptxgen = require("pptxgenjs");
const path = require("path");
const { applyTheme } = require("C:/Users/fisch/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/local-agent-mode-sessions/skills-plugin/19490504-fab3-4d22-a29c-84d7d53698dd/729e02ab-944e-420b-ac52-ad0c6f851626/skills/pptx/scripts/apply_theme.js");

const REPO = "C:/Users/fisch/Documents/berufsschule/Abschlussprojekt_Berufsschule_Gruppe_8";
const IMG = (p) => path.join(REPO, "docs/praesentation", p);
const OUT = path.join(REPO, "docs/praesentation/Fachgespraech_Lasse_Fischer_2026-11-26.pptx");

const THEME = {
  name: "Gruppe 8 Betrieb",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1A1D23", lt1: "FFFFFF", dk2: "11141A", lt2: "D7DAE0",
    accent1: "4ADE80", accent2: "7FD1FF", accent3: "FB7C5A",
    accent4: "FACC15", accent5: "8B93A1", accent6: "262B34",
    hlink: "7FD1FF", folHlink: "8FB0FF",
  },
};
const BG = "0F1115";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.author = "Lasse Fischer";
pres.title = "Vom Commit auf den Server – Fachgespräch Gruppe 8";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

const FOOT = "Lasse Fischer · FiSi · Gruppe 8 · Fachgespräch 26.11.2026";

pres.defineSlideMaster({
  title: "TITEL",
  background: { color: BG },
  objects: [],
});
pres.defineSlideMaster({
  title: "INHALT",
  background: { color: BG },
  margin: [0.5, 0.5, 0.6, 0.5],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 12.3, h: 0.8,
        fontSize: 30, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: 0.5, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 12.3, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent5, align: "right" },
});
pres.defineSlideMaster({
  title: "ABSCHNITT",
  background: { color: BG },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.9, y: 2.8, w: 11.5, h: 1.2,
        fontSize: 40, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.9, y: 4.0, w: 11.5, h: 0.8,
        fontSize: 18, color: C.accent5, valign: "top", margin: 0 }, text: "" } },
  ],
});

// ---------- Hilfen ----------
function fit(ratio, box) { // ratio = w/h; box {x,y,w,h} -> zentriert eingepasst
  let w = box.w, h = w / ratio;
  if (h > box.h) { h = box.h; w = h * ratio; }
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}
function img(slide, file, ratio, box, alt, align = "center") {
  const r = fit(ratio, box);
  if (align === "top") r.y = box.y;
  if (align === "left") r.x = box.x;
  slide.addImage({ path: IMG(file), ...r, altText: alt, objectName: "Bild " + file });
  return r;
}
function card(slide, x, y, w, h, name) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12,
    fill: { color: C.accent6 }, line: { color: C.accent6 }, objectName: name });
}
function badge(slide, x, y, label, color) { // Kreis mit Nummer (Motiv)
  slide.addShape(pres.shapes.OVAL, { x, y, w: 0.42, h: 0.42, fill: { color: BG }, line: { color, width: 2 }, objectName: "Marke " + label });
  slide.addText(label, { x, y, w: 0.42, h: 0.42, fontSize: 14, bold: true, color, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
// Punktliste mit Marke: items [{head, text, color}]
function points(slide, x, y, w, items, gap = 1.05, headSize = 16, textSize = 14) {
  items.forEach((it, i) => {
    const yy = y + i * gap;
    badge(slide, x, yy + 0.02, String(i + 1), it.color || C.accent1);
    slide.addText([
      { text: it.head, options: { bold: true, color: C.background1, fontSize: headSize, breakLine: true } },
      { text: it.text, options: { color: C.background2, fontSize: textSize } },
    ], { x: x + 0.6, y: yy, w: w - 0.6, h: gap - 0.1, valign: "top", margin: 0, isTextBox: true, paraSpaceAfter: 2 });
  });
}
function chip(slide, x, y, text, color, w) {
  const ww = w || (0.25 + text.length * 0.095);
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: ww, h: 0.36, rectRadius: 0.18,
    fill: { color: BG }, line: { color, width: 1.25 }, objectName: "Chip " + text });
  slide.addText(text, { x, y, w: ww, h: 0.36, fontSize: 12, color, align: "center", valign: "middle", margin: 0, isTextBox: true });
  return ww;
}
function content(title, section) {
  const s = pres.addSlide({ masterName: "INHALT", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  return s;
}

// =====================================================================
pres.addSection({ title: "Vortrag" });

// 1 Titel ------------------------------------------------------------
{
  const s = pres.addSlide({ masterName: "TITEL", sectionTitle: "Vortrag" });
  s.addText("FACHGESPRÄCH · ABSCHLUSSPROJEKT GRUPPE 8", { x: 0.7, y: 1.2, w: 6.2, h: 0.4, fontSize: 13, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("Vom Commit auf den Server", { x: 0.7, y: 1.7, w: 6.3, h: 1.6, fontSize: 40, bold: true, color: C.background1, valign: "top", margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
  s.addText("Den Maschinenverleih automatisch geprüft, getrennt und verschlüsselt betreiben", { x: 0.7, y: 3.55, w: 5.9, h: 0.9, fontSize: 18, color: C.background2, valign: "top", margin: 0, isTextBox: true });
  chip(s, 0.7, 4.7, "https://bbk-it-08.de", C.accent2, 2.6);
  s.addText([
    { text: "Lasse Fischer", options: { bold: true, color: C.background1, breakLine: true } },
    { text: "Fachinformatiker Systemintegration · 26.11.2026", options: { color: C.accent5 } },
  ], { x: 0.7, y: 5.6, w: 6, h: 0.8, fontSize: 15, margin: 0, isTextBox: true });
  const kv = [["3", "Container"], ["2", "getrennte Netze"], ["1", "Eingang, nur HTTPS"], ["0", "manuelle Schritte pro Update"]];
  card(s, 7.4, 1.2, 5.4, 5.2, "Kennzahlen");
  kv.forEach(([n, t], i) => {
    const y = 1.5 + i * 1.2;
    s.addText(n, { x: 7.8, y, w: 1.2, h: 1.0, fontSize: 48, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(t, { x: 9.1, y, w: 3.5, h: 1.0, fontSize: 18, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addNotes(
`ZEIT: ca. 20 Sekunden.

SAGEN:
"Ich zeige heute, wie unsere Anwendung vom Commit eines Entwicklers bis auf den Server kommt – automatisch geprüft, mit getrennten Netzen und nur über HTTPS. Die App läuft live unter bbk-it-08.de."

HINTERGRUND:
- Meine Rolle: Systemintegration – Betrieb, Sicherheit und Automatisierung der Anwendung.
- Bezug zu den Stories: #14 PostgreSQL, #34 Container-Laufzeit, #28 CI, #18 TLS, Grundlage für #8 Reverse Proxy.`);
}

// 2a Mein Auftrag --------------------------------------------------------
{
  const s = content("Mein Auftrag: die Anwendung sicher und automatisch betreiben", "Vortrag");
  const tiles = [
    ["Server-Grundschutz", "Persönliche SSH-Konten, Firewall, fail2ban, automatische Updates", "#2 · #3 · Thema in Review #1"],
    ["Container-Laufzeit", "Docker aus offizieller Paketquelle, mehrere Dienste per Compose", "#34"],
    ["Datenbank bereitstellen", "PostgreSQL im Container: versioniert, persistent, nicht öffentlich", "#14"],
    ["Reverse Proxy und TLS", "Ein Eingang, getrennte Netze, HTTPS mit Let's Encrypt", "#8 · #18"],
    ["CI-Pipeline", "Jede Änderung automatisch bauen, testen und prüfen", "#28"],
    ["Automatisches Deployment", "Server rollt nur geprüfte Stände aus, Rollback bei Fehlern", "Erweiterung"],
  ];
  tiles.forEach(([h, t, tag], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 4.15, y = 1.45 + row * 2.6, w = 3.95, hh = 2.4;
    card(s, x, y, w, hh, "Aufgabe " + (i + 1));
    badge(s, x + 0.3, y + 0.3, String(i + 1), C.accent1);
    s.addText(h, { x: x + 0.85, y: y + 0.27, w: w - 1.05, h: 0.5, fontSize: 18, bold: true, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.3, y: y + 0.95, w: w - 0.6, h: 0.95, fontSize: 15, color: C.background2, valign: "top", margin: 0, isTextBox: true });
    s.addText(tag, { x: x + 0.3, y: y + 1.9, w: w - 0.6, h: 0.35, fontSize: 12, color: C.accent2, margin: 0, isTextBox: true });
  });
  s.addNotes(
`ZEIT: ca. 25 Sekunden.

SAGEN:
"Meine Aufgabe als Fachinformatiker für Systemintegration ist der Betrieb: den Server absichern, die Container-Umgebung bereitstellen, die Datenbank betreiben, die Anwendung über einen gesicherten Eingang erreichbar machen und dafür sorgen, dass Änderungen automatisch geprüft und ausgerollt werden. Punkt 1 habe ich im letzten Review gezeigt, heute liegt der Schwerpunkt auf den Punkten 3 bis 6."

FÜR RÜCKFRAGEN:
- Server-Grundschutz (#2, #3) war Thema im Review #1 (ufw, fail2ban, unattended-upgrades, SSH nur mit Schlüssel).
- Fragen zum Anwendungscode selbst gehören zur Anwendungsentwicklung. Antwort: "Das ist nicht mein Teil – ich betreibe die Anwendung als Black Box und kann erklären, wie sie gebaut, geprüft, ausgerollt und abgesichert wird."`);
}

// 2 Review #1 -> umgesetzt ---------------------------------------------
{
  const s = content("Feedback aus Review #1 – und was daraus wurde", "Vortrag");
  const rows = [
    ["Folien zu dünn: Konfigurationen und Logs zeigen", "Jede Folie mit echter Konfiguration oder echtem Server-Protokoll", "Folien 5–9"],
    ["Empfehlung: vollautomatische Deploy-Pipeline", "CI und automatisches Deployment laufen seit 25.11. auf dem VPS", "Folien 7–8"],
    ["Empfehlung: Zusammenarbeit mit KI zeigen", "Kontrolle in Schichten: was die KI darf und was nicht", "Folie 10"],
  ];
  s.addText("REVIEW #1", { x: 0.5, y: 1.45, w: 5.2, h: 0.35, fontSize: 13, bold: true, color: C.accent3, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("HEUTE", { x: 6.55, y: 1.45, w: 5.0, h: 0.35, fontSize: 13, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  rows.forEach(([fb, done, ref], i) => {
    const y = 1.95 + i * 1.32;
    card(s, 0.5, y, 5.45, 1.12, "Feedback " + (i + 1));
    card(s, 6.55, y, 6.28, 1.12, "Umsetzung " + (i + 1));
    s.addText(fb, { x: 0.8, y, w: 4.9, h: 1.12, fontSize: 16, color: C.background2, valign: "middle", margin: 0, isTextBox: true });
    s.addText("→", { x: 5.95, y, w: 0.6, h: 1.12, fontSize: 26, bold: true, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText([
      { text: done, options: { color: C.background1, fontSize: 16, breakLine: true } },
      { text: ref, options: { color: C.accent2, fontSize: 12 } },
    ], { x: 6.85, y, w: 5.8, h: 1.12, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText([
    { text: "Bereits in Review #1 gezeigt: ", options: { bold: true, color: C.accent5 } },
    { text: "Server-Grundschutz (SSH-Schlüssel, ufw, fail2ban, automatische Updates). Heute baut alles darauf auf.", options: { color: C.background2 } },
  ], { x: 0.5, y: 6.0, w: 12.3, h: 0.6, fontSize: 14, valign: "middle", margin: 0, isTextBox: true });
  s.addNotes(
`ZEIT: ca. 30 Sekunden.

SAGEN:
"Im letzten Review war der Inhalt gut, die Präsentation aber zu dünn – Sie wollten Konfigurationen und Logs sehen. Außerdem haben Sie zwei Schwerpunkte empfohlen: eine vollautomatische Deploy-Pipeline und die Zusammenarbeit mit KI. Genau das habe ich umgesetzt. Den Server-Grundschutz habe ich letztes Mal gezeigt – heute baut alles darauf auf."

HINTERGRUND REVIEW #1:
- Bewertung: Inhalt Note 1 (Fragen gut beantwortet), Präsentation Note 5 (zu wenig Einblick, 3–5 Stichpunkte je Folie).
- Gewünscht: Konfigurationen und Logs an Beispielen erklären, mehr Fachinhalt, auf den Folien präsentieren statt daneben reden.
- Deshalb heute: auf jeder Inhaltsfolie echtes Material – darauf zeigen und es erklären.

PROBEFRAGEN AUS DER VORBEREITUNG ZU REVIEW #1 (können wieder kommen):
- Warum umgeht Docker die ufw-Regeln? → Backup-Folie "Warum Docker die ufw-Regeln umgeht".
- Warum ein Volume? → Folie Datenbank.
- Warum fail2ban UND ufw? → ufw begrenzt, welche Ports überhaupt erreichbar sind; fail2ban sperrt IPs, die an einem offenen Port (SSH) wiederholt falsche Anmeldungen versuchen. Zwei Schichten, unterschiedliche Aufgaben.
- Warum war der Neustart nach dem Kernel-Update nötig? → unattended-upgrades installiert den neuen Kernel, aktiv wird er erst nach einem Neustart (laufender Kernel ≠ installierter Kernel; /var/run/reboot-required).`);
}

// 3 Architektur -------------------------------------------------------
{
  const s = content("Architektur: ein Eingang, zwei getrennte Netze", "Vortrag");
  img(s, "vps_deployment/37_architektur_betrieb.png", 2.06, { x: 0.35, y: 1.35, w: 8.6, h: 5.4 }, "Architektur: Browser, Caddy, Backend, PostgreSQL in zwei Netzen");
  points(s, 9.2, 1.75, 3.7, [
    { head: "Ein Eingang", text: "Nur der Webserver (Caddy) hat Ports nach außen: 80 und 443", color: C.accent1 },
    { head: "Netztrennung", text: "Webserver erreicht das Backend, aber nie die Datenbank", color: C.accent2 },
    { head: "Gehärtete Container", text: "Backend ohne Root, Dateisystem schreibgeschützt", color: C.accent4 },
  ], 1.55);
  s.addNotes(
`ZEIT: ca. 40 Sekunden.

SAGEN:
"Auf dem Server laufen drei Container. Der Browser spricht nur mit Caddy, unserem Webserver und Reverse Proxy. Caddy liefert die Oberfläche aus und leitet alles unter /api an den Anwendungs-Container weiter. Nur dieser darf mit der Datenbank sprechen – dafür gibt es zwei getrennte Docker-Netze."

FACHBEGRIFFE:
- Reverse Proxy: nimmt Anfragen von außen an und leitet sie an interne Dienste weiter. Vorteil: ein Eingang, ein Zertifikat, Sicherheits-Header zentral.
- Docker-Netz: virtuelles Netzwerk; Container in verschiedenen Netzen sehen sich nicht (nicht einmal per DNS-Name).

WENN GEFRAGT "Warum Caddy und nicht nginx?":
- Caddy holt TLS-Zertifikate automatisch und erneuert sie; Konfiguration ist kurz und lesbar. nginx bräuchte zusätzlich certbot. Traefik konfiguriert man über Container-Labels – für uns unübersichtlicher.

WENN GEFRAGT "Warum ein Eingang?":
- Frontend und API unter derselben Adresse → kein CORS nötig, Cookies und CSRF-Schutz funktionieren ohne Sonderregeln, nur ein offener Dienst.`);
}

// 4 Datenbank ----------------------------------------------------------
{
  const s = content("Datenbank im Container: versioniert, persistent, nicht öffentlich", "Vortrag");
  img(s, "story10/00b_compose_ausschnitt.png", 1.90, { x: 0.35, y: 1.35, w: 6.4, h: 3.6 }, "Ausschnitt infra/postgres/compose.yaml", "top");
  img(s, "story10/04_persistenz.png", 1.72, { x: 6.75, y: 1.35, w: 6.25, h: 3.75 }, "Nachweis Persistenz: neue Container-ID, Daten noch vorhanden", "top");
  const facts = [
    ["postgres:17.11", "feste Version statt latest"],
    ["Volume", "Daten überleben das Neuerstellen"],
    ["127.0.0.1:5432", "nur lokal, Zugriff per SSH-Tunnel"],
    ["${…:?}", "ohne Passwort kein Start"],
  ];
  facts.forEach(([h, t], i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 5.35, 2.95, 1.35, "Fakt " + h);
    s.addText(h, { x: x + 0.2, y: 5.45, w: 2.6, h: 0.5, fontSize: 18, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, fontFace: "Consolas" });
    s.addText(t, { x: x + 0.2, y: 5.95, w: 2.6, h: 0.65, fontSize: 14, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes(
`ZEIT: ca. 40 Sekunden. (Story 10 / Issue #14)

SAGEN:
"Die Datenbank ist PostgreSQL im Container. Links die Konfiguration: feste Version, ein benanntes Volume für die Daten und der Port nur auf 127.0.0.1. Rechts der Nachweis: Ich habe eine Testzeile geschrieben, den Container gelöscht und neu erstellt – neue Container-ID, aber die Daten sind noch da."

FACHBEGRIFFE:
- Volume: Speicherbereich außerhalb des Containers. Container sind wegwerfbar, das Volume bleibt. "docker compose down" lässt es stehen, erst "down -v" löscht es.
- Feste Image-Version: "latest" kann sich unbemerkt ändern; bei einem Sprung von 17 auf 18 startet PostgreSQL mit alten Daten nicht mehr.
- \${POSTGRES_ADMIN_PASSWORD:?Meldung}: Compose bricht mit dieser Meldung ab, wenn die Variable fehlt (Nachweis im Backup-Teil).

WENN GEFRAGT "Warum 127.0.0.1 und nicht einfach ufw?":
- Docker schreibt eigene iptables-Regeln (DNAT) und umgeht damit ufw. "5432:5432" wäre trotz "ufw deny" offen. Siehe Backup-Folie.

WENN GEFRAGT "Wie kommt ein Entwickler an die Datenbank?":
- SSH-Tunnel: ssh -L 5433:127.0.0.1:5432 → verschlüsselt, nutzt vorhandene SSH-Schlüssel, kein offener DB-Port.

WENN GEFRAGT "Wie wird das Schema angelegt?":
- Nicht automatisch beim Containerstart. Die SQL-Dateien kommen aus dem Repository; das Deploy-Skript spielt jede genau einmal ein, mit der Anwendungsrolle als Eigentümerin, und protokolliert sie in der Tabelle deploy_schema_history. (Inhalt der SQL-Dateien = Anwendungsentwicklung, nicht mein Teil.)`);
}

// 5 Netztrennung & Haertung -------------------------------------------
{
  const s = content("Nachweis: Netztrennung und gehärtete Container", "Vortrag");
  const a = img(s, "app_stack/24_netztrennung.png", 2.85, { x: 0.35, y: 1.3, w: 8.7, h: 3.05 }, "Webserver erreicht Backend, aber nicht die Datenbank", "top");
  img(s, "app_stack/25_container_haertung.png", 3.56, { x: 0.35, y: a.y + a.h + 0.15, w: 8.7, h: 2.45 }, "Backend als UID 1000, Dateisystem schreibgeschützt", "top");
  points(s, 9.3, 1.6, 3.6, [
    { head: "bad address 'postgres'", text: "Der Webserver kennt die Datenbank nicht einmal per Name", color: C.accent3 },
    { head: "uid=1000", text: "Backend läuft ohne Root-Rechte", color: C.accent1 },
    { head: "Read-only file system", text: "Ein Angreifer könnte keine Dateien im Container ablegen", color: C.accent3 },
  ], 1.55, 15, 14);
  s.addNotes(
`ZEIT: ca. 30 Sekunden.

SAGEN:
"Das ist nicht nur Konfiguration, sondern geprüft: Aus dem Webserver-Container komme ich ans Backend, aber nicht an die Datenbank – der Name 'postgres' ist dort nicht einmal bekannt. Das Backend läuft als normaler Benutzer und kann nicht in sein eigenes Dateisystem schreiben."

WENN GEFRAGT "Was bringt das?" (Defense in Depth):
- Wird der Webserver durch eine Lücke übernommen, hat der Angreifer keinen Weg zur Datenbank.
- Ohne Root und mit read-only kann Schadcode im Container kaum Dauerhaftes anrichten.
- no-new-privileges: Prozesse können sich nachträglich keine Rechte verschaffen (z. B. über setuid).

WENN GEFRAGT "Warum braucht das Backend /tmp?":
- Die Anwendung legt temporäre Dateien an. Dafür gibt es ein tmpfs (im RAM, verschwindet beim Neustart).`);
}

// 6 CI ------------------------------------------------------------------
{
  const s = content("CI: jede Änderung wird automatisch geprüft", "Vortrag");
  img(s, "vps_deployment/35_github_actions.png", 1.6, { x: 0.35, y: 1.3, w: 7.9, h: 5.5 }, "GitHub Actions: drei Prüfungen grün", "top");
  points(s, 8.65, 1.5, 4.2, [
    { head: "Anwendung bauen und testen", text: "vorhandene Tests laufen bei jedem Push automatisch", color: C.accent1 },
    { head: "Container-Images bauen", text: "schlägt der Bau fehl, wird nichts ausgerollt", color: C.accent1 },
    { head: "Konfiguration prüfen", text: "Caddyfile, Compose-Dateien, Shell-Skripte (shellcheck)", color: C.accent1 },
  ], 1.2, 16, 14);
  card(s, 8.65, 5.2, 4.2, 1.25, "Karte erster Lauf");
  s.addText([
    { text: "Erster Lauf: rot", options: { bold: true, color: C.accent3, fontSize: 16, breakLine: true } },
    { text: "shellcheck fand einen echten Fehler in meinem Skript (cd ohne Fehlerbehandlung)", options: { color: C.background2, fontSize: 14 } },
  ], { x: 8.9, y: 5.3, w: 3.8, h: 1.05, valign: "top", margin: 0, isTextBox: true });
  s.addNotes(
`ZEIT: ca. 30 Sekunden. (Story 27 / Issue #28)

SAGEN:
"Bei jedem Push startet GitHub Actions automatisch die Prüfungen: Die Anwendung wird gebaut und getestet, die Container-Images werden gebaut und meine Konfiguration wird geprüft. Schon der erste Lauf war rot – die Pipeline hat einen echten Fehler in einem meiner Skripte gefunden. Genau dafür ist sie da."

MEIN TEIL: die Pipeline selbst (.github/workflows/ci.yml). Sie führt aus, was im Repository liegt, und prüft zusätzlich Container, Konfiguration und Skripte. Die Testfälle selbst gehören zur Anwendungsentwicklung.

FACHBEGRIFFE:
- CI (Continuous Integration): Änderungen werden automatisch gebaut und getestet, bevor sie zusammengeführt werden.
- Workflow-Datei: .github/workflows/ci.yml, versioniert im Repository.
- shellcheck: statische Analyse für Shell-Skripte; findet typische Fehlerquellen.

WENN GEFRAGT "Was passiert bei rotem Ergebnis?":
- Der Server rollt diesen Commit nicht aus (siehe nächste Folie). Zusätzlich kann der Repo-Besitzer Branch Protection aktivieren, dann ist ein Merge mit roter CI gesperrt.

WENN GEFRAGT "Wo liegen Geheimnisse?":
- Die CI braucht keine Geheimnisse; sie testet nur. Passwörter liegen ausschließlich auf dem Server (.env, Rechte 600).`);
}

// 7 Deployment ---------------------------------------------------------
{
  const s = content("Automatisches Deployment: der Server holt sich geprüfte Updates", "Vortrag");
  const steps = [
    ["Push nach main", "Entwickler"],
    ["CI grün?", "GitHub Actions"],
    ["Timer prüft", "alle 2 Minuten"],
    ["SQL, Build, Tests", "auf dem Server"],
    ["Health-Check", "sonst Rollback"],
  ];
  const bw = 2.25, gap = 0.27, y0 = 1.4;
  steps.forEach(([h, t], i) => {
    const x = 0.5 + i * (bw + gap);
    card(s, x, y0, bw, 1.1, "Schritt " + (i + 1));
    s.addText([
      { text: h, options: { bold: true, color: C.background1, fontSize: 16, breakLine: true } },
      { text: t, options: { color: C.accent5, fontSize: 12 } },
    ], { x: x + 0.15, y: y0 + 0.12, w: bw - 0.3, h: 0.86, align: "center", valign: "middle", margin: 0, isTextBox: true });
    if (i < steps.length - 1) s.addText("›", { x: x + bw - 0.02, y: y0 + 0.3, w: gap + 0.04, h: 0.5, fontSize: 26, bold: true, color: C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  img(s, "vps_deployment/30_auto_deploy.png", 2.85, { x: 0.9, y: 2.75, w: 11.5, h: 4.05 }, "Protokoll: Server wartet auf grüne CI und rollt dann selbst aus", "top");
  s.addNotes(
`ZEIT: ca. 50 Sekunden – das ist der Kern.

SAGEN:
"Der Server holt sich Updates selbst. Ein systemd-Timer schaut alle zwei Minuten nach, ob es auf GitHub einen neuen Commit gibt. Er rollt ihn nur aus, wenn alle drei CI-Prüfungen für genau diesen Commit grün sind. Unten das echte Protokoll vom Server: Um 20:52 war die CI noch nicht fertig – der Server hat gewartet. Zwei Minuten später war sie grün, und er hat selbst ausgerollt. Wenn beim Ausrollen etwas schiefgeht, springt er automatisch auf die vorherige Version zurück."

WARUM PULL STATT PUSH? (wichtigste Entscheidung)
- Push (GitHub verbindet sich per SSH zum Server) bräuchte einen Server-Schlüssel als GitHub-Secret. Wird GitHub/das Konto kompromittiert, ist der Server offen.
- Pull: Der Server liest nur aus dem öffentlichen Repository. Kein Geheimnis verlässt den Server, GitHub hat keinen Zugang.

ABLAUF IM DETAIL (infra/deploy/auto-update.sh):
1. git fetch → neuer Commit?
2. CI-Status über die GitHub-API (check-runs) – alle drei "success"?
3. Neue SQL-Dateien einspielen, jede genau einmal (Tabelle deploy_schema_history)
4. docker compose up --build --wait → Images neu bauen (Tests laufen erneut), Healthchecks abwarten
5. Prüfung web → backend → datenbank; bei Fehler: git checkout auf alten Commit, neu starten, Commit als "failed" merken

WENN GEFRAGT "Wer darf das?":
- Eigener Systembenutzer ohne Login-Shell und ohne sudo; systemd-Härtung: ProtectSystem=strict, NoNewPrivileges.
- Grenze: Mitglied der Gruppe docker = praktisch root. Verbesserung: Rootless Docker (Story #4).

WENN GEFRAGT "Was ist mit Datenbankänderungen beim Rollback?":
- SQL wird nicht zurückgedreht. Regel: Änderungen müssen abwärtskompatibel sein; vorher Backup (Story #26 offen).`);
}

// 8 Live und sicher ----------------------------------------------------
{
  const s = content("Live unter bbk-it-08.de: nur verschlüsselt erreichbar", "Vortrag");
  const a = img(s, "vps_deployment/33_von_aussen.png", 2.48, { x: 0.35, y: 1.3, w: 8.6, h: 3.6 }, "Test von außen: HTTP leitet um, HTTPS gültig, interne Ports zu", "top");
  img(s, "vps_deployment/34_zertifikat.png", 5.71, { x: 0.35, y: a.y + a.h + 0.15, w: 8.6, h: 1.6 }, "Zertifikat von Let's Encrypt", "top");
  points(s, 9.3, 1.6, 3.6, [
    { head: "HTTP → HTTPS", text: "Port 80 nur für Zertifikat und Umleitung (308)", color: C.accent1 },
    { head: "Let's Encrypt", text: "Caddy holt und erneuert das Zertifikat selbst", color: C.accent1 },
    { head: "5432 und 8080 zu", text: "Datenbank und Backend von außen nicht erreichbar", color: C.accent3 },
  ], 1.55, 15, 14);
  s.addNotes(
`ZEIT: ca. 30 Sekunden. (Issue #18)

SAGEN:
"Das ist ein Test von außen über das Internet: HTTP wird auf HTTPS umgeleitet, das Zertifikat ist gültig und kommt automatisch von Let's Encrypt. Datenbank- und Backend-Port sind von außen zu."

HINTERGRUND / GESCHICHTE:
- Erster Entwurf lief über reines HTTP auf Port 80. Auf meine Nachfrage "ist das sicher?" war die Antwort: nein – Passwörter und Session-Cookie wären im Klartext übertragen worden. Deshalb HTTPS, COOKIE_SECURE=true und HSTS.
- Domain bbk-it-08.de: DNS bei Strato; ich habe sie über die Rückwärtsauflösung der Server-IP (mail.bbk-it-08.de) wiedergefunden.

FACHBEGRIFFE:
- ACME / HTTP-01: Let's Encrypt prüft, ob wir die Domain kontrollieren, indem es eine Datei über Port 80 abruft. Deshalb bleibt Port 80 offen.
- HSTS: Browser merkt sich, die Seite nur noch per HTTPS aufzurufen.
- 308: dauerhafte Umleitung, Methode bleibt erhalten.

WENN GEFRAGT "Warum ist trotzdem eine ufw-Regel für 80/443 drin?":
- Dokumentation der gewollten Freigabe. Die tatsächliche Freigabe steuert bei Docker die Zeile ports: in der Compose-Datei.`);
}

// 8b Zusammenarbeit mit KI ------------------------------------------------
{
  const s = content("Zusammenarbeit mit KI: Kontrolle in Schichten", "Vortrag");
  const head = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent6 } } });
  const cell = (t, color) => ({ text: t, options: { color: color || C.background2 } });
  const ok = (t) => cell(t, C.accent1), open = (t) => cell(t, C.accent4);
  const rows = [
    [head("Schicht"), head("Umsetzung im Projekt"), head("Kann die KI das umgehen?"), head("Status")],
    [cell("Berechtigungen"), cell("KI arbeitet ohne sudo-Passwort; Root-Schritte führe ich selbst aus"), cell("nein"), ok("umgesetzt")],
    [cell("Automatische Prüfung"), cell("Server rollt nur Commits mit grüner CI aus"), cell("nein"), ok("umgesetzt")],
    [cell("Nachvollziehbarkeit"), cell("KI-Commits mit „Co-Authored-By“ gekennzeichnet"), cell("ja – Regel, keine Sperre"), ok("umgesetzt")],
    [cell("Mensch prüft"), cell("Test auf dem echten Server, Sicherheitsfragen stellen"), cell("–"), ok("umgesetzt")],
    [cell("Repository-Regeln"), cell("Branch Protection: Merge nur mit Review und grüner CI"), cell("nein"), open("offen")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.45, w: 12.3, colW: [2.4, 5.3, 2.8, 1.8], fontSize: 15, fontFace: THEME.bodyFontFace,
    border: { type: "solid", pt: 0.75, color: "3A404C" }, fill: { color: BG }, rowH: 0.6, valign: "middle", margin: [0.06, 0.12, 0.06, 0.12] });
  card(s, 0.5, 5.35, 12.3, 1.25, "Karte Beleg");
  s.addText([
    { text: "Beleg: ", options: { bold: true, color: C.accent1 } },
    { text: "Zwei Fehler der KI-Skripte habe ich auf dem Server entdeckt (404, Permission denied). Meine Frage „Ist die Portfreigabe sicher?“ führte zu HTTPS. Die CI hat einen weiteren Fehler automatisch gefunden.", options: { color: C.background1 } },
  ], { x: 0.8, y: 5.35, w: 11.8, h: 1.25, fontSize: 15, valign: "middle", margin: 0, isTextBox: true });
  s.addNotes(
`ZEIT: ca. 40 Sekunden. (Empfehlung aus Review #1)

SAGEN:
"Skripte und Konfigurationen habe ich mit KI erstellt. Entscheidend ist, wie das kontrolliert wird: Die KI hat keine Root-Rechte auf dem Server – alles mit sudo mache ich selbst. Auf den Server kommt nur, was die CI geprüft hat. Jede KI-Änderung ist im Git-Verlauf gekennzeichnet. Und ich teste auf dem echten System: Zwei Fehler habe ich dort selbst gefunden, und meine Sicherheitsfrage hat die unverschlüsselte Variante verhindert. Offen ist noch Branch Protection – die kann nur der Repository-Besitzer aktivieren."

KERNGEDANKE:
- Regeln in einer Anweisung an die KI sind nur Bitten. Durchgesetzt wird es durch technische Schichten (Rechte, CI, Repository-Regeln) und durch den Menschen (Defense in Depth).
- Leitsatz: "Die KI hat keinen Schlüssel zum Server. Ausgerollt wird nur, was die Pipeline geprüft hat."

WENN GEFRAGT "Prompt Injection?":
- Anweisungen in Logs, Webseiten oder Issues sind für die KI nur Daten. Schutz: Die KI hat keine Produktionsrechte, und alles läuft über CI und Review.

WENN GEFRAGT "Woher weißt du, dass der Code sicher ist?":
- CI-Prüfungen, Tests von außen (Ports, TLS, Header), eigene Prüfung auf dem Server, Sicherheitsfragen gestellt; Grenzen offen benannt (Branch Protection, Rootless Docker).`);
}

// 9 Probleme & Lessons Learned -----------------------------------------
{
  const s = content("Probleme und Lessons Learned", "Vortrag");
  const cards = [
    ["404 beim Download", "install.sh lag noch nicht auf main, nur im Feature-Branch", "Befehle vor der Weitergabe selbst ausprobieren"],
    ["Permission denied", "Git unter Windows speichert das Ausführungsrecht nicht; Test mit „bash skript.sh“ verdeckte das", "So testen, wie das Zielsystem aufruft"],
    ["HTTP unverschlüsselt", "Login über Port 80 hätte Passwörter im Klartext übertragen", "„Funktioniert“ ist nicht „sicher“ – nachfragen"],
  ];
  cards.forEach(([p, u, l], i) => {
    const x = 0.5 + i * 4.15, w = 3.95;
    card(s, x, 1.4, w, 3.75, "Problem " + (i + 1));
    badge(s, x + 0.3, 1.65, String(i + 1), C.accent3);
    s.addText(p, { x: x + 0.85, y: 1.62, w: w - 1.05, h: 0.5, fontSize: 18, bold: true, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
    s.addText([
      { text: "Ursache", options: { bold: true, color: C.accent3, fontSize: 13, breakLine: true } },
      { text: u, options: { color: C.background2, fontSize: 14 } },
    ], { x: x + 0.3, y: 2.35, w: w - 0.6, h: 1.3, valign: "top", margin: 0, isTextBox: true });
    s.addText([
      { text: "Gelernt", options: { bold: true, color: C.accent1, fontSize: 13, breakLine: true } },
      { text: l, options: { color: C.background1, fontSize: 15 } },
    ], { x: x + 0.3, y: 3.75, w: w - 0.6, h: 1.25, valign: "top", margin: 0, isTextBox: true });
  });
  s.addText([
    { text: "Fazit: ", options: { bold: true, color: C.accent2 } },
    { text: "So testen, wie es auf dem Server läuft, und Sicherheit aktiv hinterfragen – das gilt für eigenen und KI-erzeugten Code.", options: { color: C.background2 } },
  ], { x: 0.5, y: 5.45, w: 12.3, h: 0.8, fontSize: 15, valign: "middle", margin: 0, isTextBox: true });
  s.addNotes(
`ZEIT: ca. 40 Sekunden.

SAGEN:
"Es lief nicht alles glatt. Erstens: Der Download-Link zeigte auf main, die Datei lag aber noch im Feature-Branch. Zweitens: Git unter Windows speichert nicht, dass ein Skript ausführbar ist – im Test hatte ich es mit 'bash' gestartet und das nicht bemerkt. Drittens habe ich gefragt, ob die offene Portfreigabe sicher ist – sie war es nicht, deshalb läuft jetzt alles über HTTPS. Mein Fazit: Ich teste so, wie das Zielsystem es aufruft, und ich hinterfrage, ob etwas sicher ist, nicht nur ob es läuft."

HINTERGRUND:
- Fix für Ausführungsrecht: git update-index --chmod=+x (Dateimodus 100755); zusätzlich ruft systemd das Skript über /bin/bash auf.
- Danach das komplette install.sh als root in WSL (Ubuntu 24.04, gleiche Version wie der VPS) getestet – dabei noch einen Timer-Fehler gefunden (Requires=docker.service existiert unter Docker Desktop nicht).

WENN GEFRAGT "Wie gehst du mit KI-generiertem Code um?":
- Jede Änderung über Git und Pull Request nachvollziehbar (Commit-Trailer Co-Authored-By).
- CI prüft automatisch, ich prüfe auf dem echten System und frage nach Sicherheit.
- Die KI hat keinen Zugang zum Server mit Root-Rechten (sudo braucht mein Passwort).`);
}

// 10 Fazit --------------------------------------------------------------
{
  const s = content("Ergebnis und nächste Schritte", "Vortrag");
  const stats = [
    ["≈ 2 Min", "vom grünen Commit bis live"],
    ["0", "manuelle Schritte pro Update"],
    ["3", "Prüfungen vor jedem Rollout"],
  ];
  stats.forEach(([n, t], i) => {
    const y = 1.45 + i * 1.75;
    card(s, 0.5, y, 5.6, 1.55, "Kennzahl " + n);
    s.addText(n, { x: 0.8, y: y + 0.1, w: 2.3, h: 1.35, fontSize: 48, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(t, { x: 3.1, y: y + 0.1, w: 2.85, h: 1.35, fontSize: 17, color: C.background1, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addText("Nächste Schritte", { x: 6.7, y: 1.45, w: 6, h: 0.5, fontSize: 20, bold: true, color: C.background1, margin: 0, isTextBox: true });
  points(s, 6.7, 2.15, 6.1, [
    { head: "Merge nach main + Branch Protection", text: "Server folgt dann main; Merge nur mit grüner CI und Review", color: C.accent2 },
    { head: "Backup und Wiederherstellung (#26)", text: "Vor jedem Deployment sichern, Wiederherstellung messen", color: C.accent2 },
    { head: "Monitoring und Alarm (#27)", text: "Bei Fehlern benachrichtigen statt nur protokollieren", color: C.accent2 },
    { head: "Rootless Docker (#4)", text: "Deploy-Benutzer ohne root-gleiche Rechte", color: C.accent2 },
  ], 1.12, 16, 14);
  s.addNotes(
`ZEIT: ca. 20 Sekunden.

SAGEN:
"Ergebnis: Von einem grünen Commit bis zur Live-Version vergehen etwa zwei Minuten, ohne dass jemand eingreift, und es kommt nur geprüfter Code auf den Server. Als Nächstes stehen der Merge nach main mit Branch Protection, Backups vor jedem Deployment, Monitoring und Rootless Docker an. Danke – ich freue mich auf Fragen."

WENN GEFRAGT "Was ist die größte Schwachstelle?":
- Wer nach main mergen darf, bringt Code auf den Server (bei grüner CI). Deshalb: Branch Protection mit Pflicht-Review und 2-Faktor-Anmeldung für alle GitHub-Konten.
- Der Deploy-Benutzer ist über die Gruppe docker praktisch root. Zusätzlich ist das Konto bbk-it in der Gruppe docker – das kläre ich noch.`);
}

// =====================================================================
pres.addSection({ title: "Backup für das Fachgespräch" });
{
  const s = pres.addSlide({ masterName: "ABSCHNITT", sectionTitle: "Backup für das Fachgespräch" });
  s.addText("Backup für das Fachgespräch", { placeholder: "title" });
  s.addText("Hintergründe, Entscheidungen und mögliche Fragen", { placeholder: "body" });
  s.addNotes("Nur bei Bedarf zeigen. Ab hier Material für Rückfragen.");
}

// B1 Docker umgeht ufw --------------------------------------------------
{
  const s = content("Warum Docker die ufw-Regeln umgeht", "Backup für das Fachgespräch");
  // Ablaufdiagramm aus Formen
  const box = (x, y, w, h, t, sub, color, name) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: C.accent6 }, line: { color, width: 1.5 }, objectName: name });
    s.addText([
      { text: t, options: { bold: true, color: C.background1, fontSize: 15, breakLine: !!sub } },
      ...(sub ? [{ text: sub, options: { color: C.background2, fontSize: 12 } }] : []),
    ], { x: x + 0.1, y, w: w - 0.2, h, align: "center", valign: "middle", margin: 0, isTextBox: true });
  };
  const arrow = (x1, y1, x2, y2, color) => s.addShape(pres.shapes.LINE, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width: 2, endArrowType: "triangle" }, objectName: "Pfeil" });
  box(0.5, 2.3, 2.2, 1.0, "Paket an :5432", "aus dem Internet", C.accent5, "Paket");
  box(3.2, 2.3, 2.8, 1.0, "nat PREROUTING", "Docker: DNAT auf Container-IP", C.accent4, "DNAT");
  box(6.6, 1.4, 2.6, 1.0, "INPUT-Kette", "hier filtert ufw", C.accent5, "INPUT");
  box(6.6, 3.2, 2.6, 1.0, "FORWARD-Kette", "Docker-Regeln", C.accent3, "FORWARD");
  box(9.9, 3.2, 2.6, 1.0, "Container", "trotz „ufw deny 5432“", C.accent3, "Container");
  arrow(2.7, 2.8, 3.2, 2.8, C.accent5);
  arrow(6.0, 2.65, 6.6, 1.95, C.accent5);
  arrow(6.0, 2.95, 6.6, 3.7, C.accent3);
  arrow(9.2, 3.7, 9.9, 3.7, C.accent3);
  s.addText("wird nie erreicht", { x: 6.6, y: 2.45, w: 2.6, h: 0.35, fontSize: 12, italic: true, color: C.accent5, align: "center", margin: 0, isTextBox: true });
  img(s, "story10/05_port.png", 4.07, { x: 0.5, y: 4.6, w: 7.6, h: 1.9 }, "Port 5432 lauscht nur auf 127.0.0.1", "left");
  s.addText([
    { text: "Lösung: ", options: { bold: true, color: C.accent1 } },
    { text: "Ports gezielt binden. Datenbank nur an 127.0.0.1, öffentlich nur der Webserver.", options: { color: C.background1 } },
  ], { x: 8.4, y: 4.75, w: 4.4, h: 1.6, fontSize: 15, valign: "top", margin: 0, isTextBox: true });
  s.addNotes(
`ERKLÄRUNG:
ufw ist eine Oberfläche für iptables und filtert in der INPUT-Kette – also Pakete, die an den Host selbst gehen.
Docker trägt für jeden veröffentlichten Port eine DNAT-Regel in die nat-Tabelle (Kette PREROUTING → DOCKER) ein. Das Paket wird schon vor der Filterung auf die interne Container-IP umgeschrieben. Damit ist es kein Paket "an den Host" mehr, sondern wird weitergeleitet und läuft durch die FORWARD-Kette, wo Dockers eigene Regeln es durchlassen. Die ufw-Regeln in INPUT sieht es nie.

FOLGE: "ports: - 5432:5432" (= 0.0.0.0) wäre aus dem Internet erreichbar, obwohl "ufw deny 5432" gesetzt ist.

NACHWEIS: ss -tln zeigt 127.0.0.1:5432; nmap/TCP-Test von außen: keine Verbindung.`);
}

// B2 Entscheidungen -----------------------------------------------------
{
  const s = content("Entscheidungen und Alternativen", "Backup für das Fachgespräch");
  const head = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent6 } } });
  const cell = (t, strong) => ({ text: t, options: { color: strong ? C.accent1 : C.background2, bold: !!strong } });
  const rows = [
    [head("Thema"), head("Entscheidung"), head("Begründung"), head("Alternative")],
    [cell("Reverse Proxy"), cell("Caddy", 1), cell("Automatisches TLS, kurze Konfiguration"), cell("nginx + certbot, Traefik")],
    [cell("Deployment"), cell("Pull durch den Server", 1), cell("Kein Server-Schlüssel bei GitHub"), cell("Push per SSH aus GitHub Actions")],
    [cell("Images bauen"), cell("Auf dem Server", 1), cell("Keine Registry und keine Registry-Zugangsdaten"), cell("Bauen in CI, ghcr.io")],
    [cell("DB-Änderungen"), cell("Nummerierte SQL-Dateien", 1), cell("Jede genau einmal, protokolliert"), cell("Flyway/Liquibase im Backend")],
    [cell("Domain / TLS"), cell("bbk-it-08.de, Let's Encrypt", 1), cell("Kostenlos, erneuert sich selbst"), cell("Gekauftes Zertifikat")],
    [cell("Rechte"), cell("Systembenutzer ohne Login", 1), cell("Kein persönliches Konto, kein sudo"), cell("Rootless Docker (#4)")],
  ];
  s.addTable(rows, { x: 0.5, y: 1.45, w: 12.3, colW: [2.2, 3.1, 4.0, 3.0], fontSize: 14, fontFace: THEME.bodyFontFace,
    border: { type: "solid", pt: 0.75, color: "3A404C" }, fill: { color: BG }, rowH: 0.62, valign: "middle", margin: [0.06, 0.12, 0.06, 0.12] });
  s.addNotes(
`Regel für jedes Werkzeug: Was löst es? Was wäre die Alternative? Was passiert bei Ausfall?

- Caddy fällt aus → Anwendung nicht erreichbar; restart: unless-stopped startet ihn neu; Zertifikate liegen im Volume caddy-data.
- GitHub nicht erreichbar → Server rollt nichts aus, die laufende Version bleibt aktiv.
- CI rot → Commit wird nicht ausgerollt und als "failed" gemerkt.
- Let's Encrypt nicht erreichbar → vorhandenes Zertifikat bleibt 90 Tage gültig; Caddy erneuert ab etwa 30 Tagen vor Ablauf.`);
}

// B3 Ohne Passwort / Tests im Build -------------------------------------
{
  const s = content("Weitere Nachweise", "Backup für das Fachgespräch");
  const a = img(s, "story10/02_ohne_passwort.png", 2.37, { x: 0.35, y: 1.3, w: 6.3, h: 3.2 }, "Ohne Passwort bricht der Start ab", "top");
  img(s, "story10/09_secrets_git.png", 3.16, { x: 0.35, y: a.y + a.h + 0.2, w: 6.3, h: 2.0 }, "Zugangsdaten nicht im Repository", "top");
  img(s, "vps_deployment/31_timer.png", 3.16, { x: 6.85, y: 1.3, w: 6.15, h: 2.2 }, "systemd-Timer und Systembenutzer", "top");
  img(s, "app_stack/23_proxy_routing.png", 3.16, { x: 6.85, y: 3.7, w: 6.15, h: 2.2 }, "Routing über den Proxy und Sicherheits-Header", "top");
  s.addNotes(
`- Links oben: Ohne .env bricht docker compose vor dem Start ab, es wird kein Container erstellt (Exit-Code 1).
- Links unten: Die echte .env ist von Git ausgeschlossen, nur die leere Vorlage .env.example ist versioniert.
- Rechts oben: Timer und Dienst auf dem VPS, eigener Benutzer mit /usr/sbin/nologin, ProtectSystem=strict.
- Rechts unten: /api geht ans Backend, Sicherheits-Header kommen vom Proxy.`);
}

// B4 Pruefungsfragen ----------------------------------------------------
{
  const s = content("Mögliche Fragen – kurze Antworten", "Backup für das Fachgespräch");
  const qa = [
    ["Snapshot statt Backup?", "Snapshot liegt meist auf demselben Speicher. Backup = getrennte Kopie (3-2-1-Regel)."],
    ["Was ist Idempotenz?", "Mehrfaches Ausführen ergibt denselben Zustand – install.sh überschreibt keine Passwörter."],
    ["Woher kommt das Zertifikat?", "Let's Encrypt über ACME HTTP-01 auf Port 80, Caddy erneuert selbst."],
    ["Wie sicher ist KI-Code?", "Review, CI-Tests, Test auf dem echten System, KI ohne Server-Rechte."],
    ["Was passiert bei Fehlern?", "Rollback auf den vorherigen Commit, Fehler im Protokoll, Commit wird gemerkt."],
    ["Wie kommt man an die Datenbank?", "Nur per SSH-Tunnel: Port 5432 hängt an 127.0.0.1, nie öffentlich."],
  ];
  qa.forEach(([q, a], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 6.2, y = 1.45 + row * 1.6;
    card(s, x, y, 6.0, 1.4, "Frage " + (i + 1));
    s.addText([
      { text: q, options: { bold: true, color: C.accent2, fontSize: 16, breakLine: true } },
      { text: a, options: { color: C.background1, fontSize: 14 } },
    ], { x: x + 0.25, y: y + 0.12, w: 5.5, h: 1.16, valign: "top", margin: 0, isTextBox: true, paraSpaceAfter: 4 });
  });
  s.addNotes(
`Ausführlichere Antworten stehen in docs/praesentation/fachgespraech_spickzettel.md.

SSH-Tunnel: ssh -N -L 5433:127.0.0.1:5432 <konto>@<server> – verschlüsselt, nutzt die vorhandenen SSH-Schlüssel, kein zusätzlicher offener Port.`);
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("geschrieben:", OUT);
})();
