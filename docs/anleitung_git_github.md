# Git & GitHub – Anleitung für unser Team

Diese Anleitung erklärt Git und GitHub für Einsteiger und ist auf unser Projekt zugeschnitten.
Bei Fragen zuerst hier nachschauen. Bei Problemen: **Ruhe bewahren, nichts löschen, erst `git status` ausführen.**

## 1. Die wichtigsten Begriffe

| Begriff | Bedeutung |
|---|---|
| **Repository (Repo)** | Der Projektordner inklusive der gesamten Versionshistorie |
| **Commit** | Ein gespeicherter Stand mit Beschreibung ("Speicherpunkt") |
| **Branch** | Eine eigene Arbeitslinie, damit man sich nicht gegenseitig stört. `main` ist der Hauptzweig |
| **Remote / origin** | Die Kopie des Repos auf GitHub |
| **Push** | Eigene Commits zu GitHub hochladen |
| **Pull** | Neue Änderungen von GitHub herunterladen |
| **Clone** | Ein Repo das erste Mal auf den eigenen Rechner holen |
| **Pull Request (PR)** | Anfrage auf GitHub: "Bitte meinen Branch in `main` übernehmen" |
| **Merge** | Zwei Branches zusammenführen |
| **Merge-Konflikt** | Beide haben dieselbe Stelle geändert, Git weiß nicht, welche Version gilt |

## 2. Einmalige Einrichtung

```bash
git config --global user.name "Dein Name"
git config --global user.email "deine@mail.de"
git clone https://github.com/24it1schumacher/Abschlussprojekt_Berufsschule_Gruppe_8.git
```

Anmeldung bei GitHub läuft beim ersten `push` über ein Browserfenster.

## 3. Der tägliche Ablauf (Standard-Workflow)

**Goldene Regel: Nie direkt auf `main` arbeiten. Immer eigener Branch + Pull Request.**

1. **Aktuellen Stand holen**
   ```bash
   git checkout main
   git pull
   ```
2. **Neuen Branch anlegen** (Name: `feature/kurze-beschreibung` oder `fix/...`)
   ```bash
   git checkout -b feature/login-seite
   ```
3. **Arbeiten**, dann prüfen, was sich geändert hat:
   ```bash
   git status
   git diff
   ```
4. **Änderungen sammeln und speichern (Commit)**
   ```bash
   git add datei1.py datei2.py     # oder: git add .  (alles)
   git commit -m "Login-Seite hinzugefügt"
   ```
5. **Hochladen**
   ```bash
   git push -u origin feature/login-seite
   ```
   (Beim ersten Push eines Branches mit `-u`, danach reicht `git push`.)
6. **Pull Request auf GitHub erstellen**: Im Repo auf den gelben Hinweis "Compare & pull request" klicken, Beschreibung schreiben, den Kollegen als Reviewer eintragen.
7. **Kollege prüft** und klickt "Merge pull request".
8. **Aufräumen**
   ```bash
   git checkout main
   git pull
   git branch -d feature/login-seite
   ```

## 4. Gute Commit-Nachrichten

- Kurz, aussagekräftig, in einer Sprache (bei uns: Deutsch).
- Beschreibt **was** geändert wurde: "Ausleihformular validiert Eingaben" statt "Änderungen" oder "asdf".
- Lieber mehrere kleine Commits als ein riesiger.

## 5. Häufige Probleme und Lösungen

### "Ich weiß nicht, wo ich gerade stehe"
```bash
git status          # Branch, geänderte Dateien
git branch          # alle lokalen Branches (* = aktueller)
git log --oneline   # letzte Commits
```

### `git push` wird abgelehnt ("rejected", "non-fast-forward")
Auf GitHub gibt es neue Commits, die du noch nicht hast.
```bash
git pull
git push
```

### Merge-Konflikt
Git markiert die Stelle in der Datei so:
```
<<<<<<< HEAD
deine Version
=======
Version des Kollegen
>>>>>>> origin/main
```
1. Datei öffnen, entscheiden, was bleiben soll, die Markierungen (`<<<<<<<`, `=======`, `>>>>>>>`) komplett löschen.
2. Dann:
   ```bash
   git add datei.py
   git commit
   ```
3. Unsicher? **Kollegen anrufen** und die Stelle gemeinsam ansehen. Abbrechen geht mit `git merge --abort`.

### Ich habe auf `main` gearbeitet, wollte aber einen Branch
(Noch **nicht** committet:)
```bash
git checkout -b feature/mein-branch
```
Die Änderungen wandern einfach mit. Danach normal committen.

### Ich will Änderungen an einer Datei verwerfen (noch nicht committet)
```bash
git restore datei.py
```
**Achtung: Die Änderungen sind danach unwiderruflich weg.**

### Ich habe Dateien versehentlich mit `git add` hinzugefügt
```bash
git restore --staged datei.py
```

### Letzte Commit-Nachricht war falsch (noch nicht gepusht)
```bash
git commit --amend -m "Neue Nachricht"
```

### Ich will kurz den Branch wechseln, habe aber unfertige Änderungen
```bash
git stash          # Änderungen zwischenlagern
git checkout anderer-branch
# ... später zurück ...
git stash pop      # Änderungen zurückholen
```

### Ich habe ein Passwort / einen Schlüssel committet
Sofort Kollegen informieren und das Passwort ändern. Es reicht **nicht**, die Datei nur zu löschen, da die Historie sie enthält.
Vorbeugen: Geheimnisse gehören in eine `.env`-Datei, die in `.gitignore` steht.

## 6. Dinge, die ihr NICHT tun solltet

- `git push --force` (überschreibt Arbeit anderer)
- `git reset --hard` ohne zu wissen, was verloren geht
- Direkt auf `main` committen
- Passwörter, Schlüssel, `.env`-Dateien einchecken
- Große Binärdateien oder `node_modules`/`venv`-Ordner einchecken

## 7. Zusammenarbeit im Team

- **Vor dem Arbeiten immer `git pull`** auf `main`, bevor ein neuer Branch angelegt wird.
- Absprechen, wer welche Dateien/Aufgabe bearbeitet, das vermeidet Konflikte. Ordnerstruktur: `app/` (Anwendung), `docs/` (Dokumentation), `infra/` (Server/Infrastruktur), `tools/` (Hilfsskripte).
- Aufgaben als **GitHub Issues** anlegen (Reiter "Issues") und im Commit oder PR mit `#Nummer` verlinken. Mit "Closes #12" in der PR-Beschreibung wird das Issue beim Merge automatisch geschlossen.
- Pull Requests gegenseitig prüfen (Reiter "Files changed", Kommentare direkt an Zeilen).

## 8. Spickzettel

| Ich will … | Befehl |
|---|---|
| Stand ansehen | `git status` |
| Änderungen im Detail sehen | `git diff` |
| Neuesten Stand holen | `git pull` |
| Neuen Branch anlegen und wechseln | `git checkout -b name` |
| Branch wechseln | `git checkout name` |
| Dateien vormerken | `git add datei` |
| Speichern | `git commit -m "Text"` |
| Hochladen | `git push` |
| Verlauf ansehen | `git log --oneline` |
| Alle Branches zeigen | `git branch -a` |

## 9. Weiterführende Hilfe

- **Erst selbst versuchen:** `git status` lesen, die Fehlermeldung in Ruhe lesen (Git sagt meist, was zu tun ist), diese Anleitung und die offizielle Doku durchsuchen. Auch `git help <befehl>` (z. B. `git help push`) erklärt jeden Befehl.
- Danach den Kollegen fragen.
- Zuletzt Claude Code fragen. Die Datei `CLAUDE.md` weist Claude an, zu erklären und euch die Befehle selbst tippen zu lassen, damit ihr es lernt.
- Offizielles Buch (Deutsch, kostenlos): https://git-scm.com/book/de/v2
- GitHub-Hilfe: https://docs.github.com/de
