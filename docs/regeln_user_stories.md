# Regeln für User Stories

Diese Regeln gelten für neue und überarbeitete User Stories im Maschinenverleih-Projekt. Sie orientieren sich am INVEST-Prinzip und am Aufbau in [User Stories](user_stories.md).

## Aufbau

Jede Story enthält:

1. **Überschrift:** eine kurze, eindeutige Tätigkeit mit erkennbarem Ergebnis.
2. **Nutzerziel:** „Als … möchte ich …, damit …“. Die Rolle beschreibt, wer den Nutzen hat und handelt – zum Beispiel Kunde, Anwendungsentwickler oder Fachinformatiker für Systemintegration (FiSi).
3. **Voraussetzung:** nur tatsächliche Abhängigkeiten, mit den GitHub-Issue-Nummern der nötigen Vorarbeiten. Keine Abhängigkeit eintragen, wenn die Arbeit unabhängig starten kann.
4. **Akzeptanzkriterien:** prüfbare Bedingungen, an denen Team und Auftraggeber erkennen können, ob die Story erfüllt ist.
5. **Projektzuordnung:** Lernfeld, Bündelungsfach, geschätzter Aufwand und passende Labels einschließlich Fachrichtung.

## Qualitätsregeln nach INVEST

- **Unabhängig:** Eine Story soll möglichst eigenständig umsetzbar sein. Notwendige Abhängigkeiten werden ausdrücklich benannt.
- **Verhandelbar:** Die Story beschreibt Ziel und Ergebnis, nicht unnötig jeden technischen Umsetzungsschritt. Verbindliche Projektvorgaben und bereits beschlossene Technologien müssen dennoch eingehalten werden.
- **Wertvoll:** Der Nutzen für eine klar benannte Rolle oder das Projekt ist im „damit“-Teil verständlich.
- **Schätzbar:** Umfang und Risiken sind klein genug, damit das Team den Aufwand einschätzen kann. Große Vorhaben werden in fachlich sinnvolle erste Schritte geteilt.
- **Klein:** Eine Story umfasst ein zusammenhängendes Ergebnis, das innerhalb eines passenden Arbeitsabschnitts fertiggestellt werden kann. Andere Rollen oder spätere Ausbaustufen werden nicht beiläufig hineingezogen.
- **Testbar:** Jedes Akzeptanzkriterium beschreibt ein beobachtbares Ergebnis und vermeidet unklare Aussagen wie „funktioniert gut“ oder „ist benutzerfreundlich“ ohne konkreten Nachweis.

## Rollen und Zuständigkeiten

- Die Rolle ist die Person oder Projektfunktion, die das Ergebnis umsetzt oder benötigt. Eine Story für Infrastrukturaufgaben kann beispielsweise „Als Fachinformatiker für Systemintegration (FiSi)“ verwenden; Anwendungsfunktionen ordnen sich der Anwendungsentwicklung (AE) zu.
- Die Fachrichtung wird zusätzlich über das passende Label (`fachrichtung-SI` oder `fachrichtung-AE`) kenntlich gemacht. Sie soll mit der Rolle und dem Lernfeld übereinstimmen.
- Eine Story darf nötige Zusammenarbeit beschreiben, aber nicht unklar vermischen, wer Infrastruktur bereitstellt und wer die Anwendung daran anbindet. Bei getrennten Verantwortlichkeiten sind getrennte Stories mit klarer Abhängigkeit anzulegen.

## Akzeptanzkriterien und Umfang

- Kriterien als kurze, nummerierte Prüfergebnisse in Checkbox-Form (`- [ ]`) formulieren.
- Mindestens ein Kriterium muss das erwartete Ergebnis praktisch nachweisen; bei Infrastruktur gehören dazu nach Möglichkeit ein reproduzierbarer Start und ein Verbindungstest.
- Sicherheits- und Betriebsanforderungen konkret benennen, etwa Zugriffsbeschränkung, persistente Daten oder sichere Ablage von Zugangsdaten.
- Nicht-Ziele ausdrücklich aufführen, wenn dadurch wichtige Grenzen klar werden. Bereits einer anderen Story zugeordnete Arbeiten – etwa Backup/Restore – nicht duplizieren.
- Akzeptanzkriterien dürfen keine Geheimnisse, Passwörter oder persönliche Zugangsdaten enthalten.

## Aufwand, Abhängigkeiten und GitHub

- Den Aufwand in der bestehenden T-Shirt-Skala mit passender Stundenangabe schätzen; neu hinzukommende Arbeit nicht ungeprüft einem bereits gefüllten Sprint zuordnen.
- Story-Nummer im Backlog und GitHub-Issue-Nummer unterscheiden. Die Zuordnung in der Mapping-Tabelle am Dateiende ergänzen und innerhalb von Texten GitHub-Issue-Nummern (`#123`) verwenden.
- GitHub-Issue-Titel, Beschreibung und Labels mit der Story im Backlog synchron halten. Status und Sprintzuordnung werden im Projektboard gepflegt, nicht aus der Reihenfolge im Markdown abgeleitet.
- Vor dem Anlegen prüfen, ob die Arbeit bereits von einer bestehenden Story abgedeckt wird. Eine vorhandene Story gezielt präzisieren statt eine doppelte Story hinzuzufügen.

## Kurzprüfung vor dem Einreichen

- Ist die Rolle klar und passt sie zu Aufgabe und Fachrichtung?
- Beschreibt die Story ein Ziel und dessen Nutzen?
- Sind echte Voraussetzungen verlinkt und sonstige Abhängigkeiten vermieden?
- Sind alle Kriterien konkret überprüfbar und der Umfang klein genug?
- Sind Aufwand, Lernfeld, Bündelungsfach und Labels eingetragen?
- Wurden Mapping, GitHub-Issue und gegebenenfalls Projektboard abgeglichen?
