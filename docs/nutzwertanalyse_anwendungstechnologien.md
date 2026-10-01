# Nutzwertanalyse: Frontend- und Backend-Technologien

**Stand:** 30.09.2026 · **Bezug:** User Story 5 „Lauffähiges Client-Server-Grundgerüst mit Datenbankanbindung aufsetzen“

## 1. Ziel und Annahmen

Der persönliche Lernerfolg ist ein wichtiges Ziel: Nach eigener Angabe wurden in der Firma bereits C# und HTML verwendet. C# wird deshalb nicht als ernsthafte Auswahloption gewertet; vorhandene Kenntnisse sollen nicht das Lernziel verdrängen.

Das Projekt verlangt einen Browser-Client und laut User Story 5 eine objektorientierte Server-Anwendung. Der Server soll über eine Datenbank-API auf die Datenbank zugreifen; der Client ruft den Server auf. Die konkrete Framework- und Anwendungsstruktur sind laut [app/README.md](../app/README.md) noch offen. Die Bewertungen vergleichen deshalb Programmiersprachen bzw. Laufzeitumgebungen und treffen **keine** Framework-Entscheidung.

## 2. Kriterien, Gewichte und Skala

Die Kriterien und Gewichte wurden vor der Punktevergabe festgelegt. Der persönliche Lerngewinn erhält bewusst ein hohes Gewicht, weil er ausdrücklich Teil des Auftrags ist. Frontend und Backend werden getrennt berechnet: Die Aufgaben und technischen Schnittstellen der beiden Bereiche sind verschieden.

| Kriterium | Gewicht | Bedeutung |
|---|---:|---|
| Persönlicher Lerngewinn | 30 % | Ermöglicht die Technologie einen deutlichen Kompetenzzuwachs statt vor allem bereits bekannte Fähigkeiten zu wiederholen? |
| Passung zur Rolle im Projekt | 25 % | Passt die Technologie zur Aufgabe eines Browser-Clients bzw. einer objektorientierten Server-Anwendung? |
| Schnittstellen für die jeweilige Rolle | 20 % | Unterstützt sie die Kommunikation des Frontends mit dem Server bzw. den Datenbankzugriff des Backends über eine Datenbank-API? |
| Bereitstellung und Betrieb | 15 % | Lässt sich die Anwendung grundsätzlich passend zum geplanten Client-Server-Betrieb und zum VPS bereitstellen? |
| Dokumentation und Ökosystem | 10 % | Gibt es zugängliche offizielle Dokumentation und ein relevantes Ökosystem? |
| **Summe je Teilanalyse** | **100 %** | |

Bewertet wird auf einer Skala von **1 bis 5**: 1 = ungeeignet, 2 = eher schwach, 3 = ausreichend, 4 = gut, 5 = sehr gut für die konkrete Projektlage. Die gewichtete Teilpunktzahl berechnet sich als **Gewicht in Prozent × Punkte ÷ 100**. Die Summe ergibt einen Nutzwert von 1 bis 5. Prozentwerte in der Ergebnisspalte zeigen den Nutzwert geteilt durch 5.

Die Punktwerte sind begründete Einschätzungen, keine gemessenen Leistungswerte. Bei der Bereitstellung werden keine Unterschiede behauptet, die ohne konkrete Frameworks, Container-Konfiguration und VPS-Tests noch nicht belegt sind.

## 3. Frontend-Bewertung

Verglichen werden TypeScript und JavaScript für den Browser. Beide können Browserfunktionen nutzen und mit dem Backend über HTTP kommunizieren. TypeScript benötigt einen Build-Schritt, der TypeScript in JavaScript übersetzt. C# mit Blazor wird entsprechend dem genannten Lernziel nicht in die Rangfolge aufgenommen.

| Kriterium | Gewicht | TypeScript | JavaScript |
|---|---:|---:|---:|
| Persönlicher Lerngewinn | 30 % | 5 → 1,50 | 4 → 1,20 |
| Passung zur Browser-Client-Rolle | 25 % | 5 → 1,25 | 5 → 1,25 |
| Kommunikation mit der Server-API | 20 % | 5 → 1,00 | 5 → 1,00 |
| Bereitstellung und Betrieb | 15 % | 4 → 0,60 | 4 → 0,60 |
| Dokumentation und Ökosystem | 10 % | 4 → 0,40 | 5 → 0,50 |
| **Gesamtnutzwert** | **100 %** | **4,75 / 5 (95 %)** | **4,55 / 5 (91 %)** |

**Bewertung:** TypeScript liegt knapp vorn. Für den geplanten Browser-Client passen beide Kandidaten. TypeScript erhält beim Lerngewinn den höheren Wert, weil es moderne Webentwicklung samt statischer Typisierung vermittelt und trotzdem JavaScript-Grundlagen erfordert. Der notwendige Build-Schritt ist ein kleiner Betriebsnachteil gegenüber reinem JavaScript; für den Client werden die fertigen Dateien anschließend vom Webserver ausgeliefert. JavaScript hat das größere und länger etablierte Browser-Ökosystem, daher dort ein Punkt mehr bei Dokumentation und Ökosystem. [TypeScript-Handbuch](https://www.typescriptlang.org/docs/) · [JavaScript Guide (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) · [Fetch API (WHATWG)](https://fetch.spec.whatwg.org/)

## 4. Backend-Bewertung

Verglichen werden Java, TypeScript auf Node.js und Python. Node.js ist eine JavaScript-Laufzeitumgebung für serverseitige Anwendungen; damit kann TypeScript nach dem Build sowohl im Client als auch auf dem Server eingesetzt werden. C# wird wie oben erläutert nicht als ernsthafte Auswahloption gewertet.

| Kriterium | Gewicht | Java | TypeScript/Node.js | Python |
|---|---:|---:|---:|---:|
| Persönlicher Lerngewinn | 30 % | 5 → 1,50 | 4 → 1,20 | 4 → 1,20 |
| Passung zur objektorientierten Server-Rolle | 25 % | 5 → 1,25 | 4 → 1,00 | 4 → 1,00 |
| Datenbank-API und Treiber | 20 % | 5 → 1,00 | 4 → 0,80 | 4 → 0,80 |
| Bereitstellung und Betrieb | 15 % | 4 → 0,60 | 4 → 0,60 | 4 → 0,60 |
| Dokumentation und Ökosystem | 10 % | 4 → 0,40 | 5 → 0,50 | 4 → 0,40 |
| **Gesamtnutzwert** | **100 %** | **4,75 / 5 (95 %)** | **4,10 / 5 (82 %)** | **4,00 / 5 (80 %)** |

**Bewertung:** Java erreicht den höchsten Nutzwert. Das passt zur expliziten Vorgabe einer objektorientierten Server-Anwendung und schafft einen deutlichen Lernschwerpunkt zusätzlich zum TypeScript-Frontend. JDBC ist die standardisierte Java-Schnittstelle für Datenbankzugriffe. Node.js und Python bieten ebenfalls Datenbanktreiber und API-Möglichkeiten; die Bewertung behauptet nicht, dass sie ungeeignet wären. Der Vorteil von Node.js liegt darin, TypeScript auch serverseitig einzusetzen. Python hat eine dokumentierte Datenbank-API-Spezifikation (DB-API), aber die endgültige Bibliothek wäre noch auszuwählen. [Java JDBC](https://docs.oracle.com/javase/tutorial/jdbc/) · [Node.js: Einführung](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) · [Python DB-API (PEP 249)](https://peps.python.org/pep-0249/) · [Python-Tutorial](https://docs.python.org/3/tutorial/)

| Teilbereich | Rang | Technologie | Nutzwert |
|---|---:|---|---:|
| Frontend | 1 | TypeScript | 4,75 / 5 |
| Frontend | 2 | JavaScript | 4,55 / 5 |
| Backend | 1 | Java | 4,75 / 5 |
| Backend | 2 | TypeScript/Node.js | 4,10 / 5 |
| Backend | 3 | Python | 4,00 / 5 |

## 5. Empfehlung und Einschränkungen

**Empfehlung: TypeScript im Frontend und Java im Backend**, vorläufig bis zur Abstimmung im Team. Die Kombination erreicht in beiden Teilanalysen jeweils **4,75 von 5 Punkten** und unterstützt den gewünschten Kompetenzaufbau. Java passt außerdem unmittelbar zur in User Story 5 verlangten objektorientierten Server-Anwendung.

Die Schnittstellen sollten klar getrennt bleiben: **Browser-Client → HTTP-API des Java-Servers → Datenbank-API/Treiber des Servers → Datenbank.** Der Browser erhält keine Datenbank-Zugangsdaten und verbindet sich nicht direkt mit der Datenbank. Die in der separaten [Nutzwertanalyse zum Datenbanksystem](nutzwertanalyse_datenbanksystem.md) ausgesprochene vorläufige PostgreSQL-Empfehlung ändert daran nichts; Java kann Datenbanken über JDBC anbinden. Datenbank oder Schema sollen nicht unbemerkt durch ein Tool erstellt werden. Falls Migrationen verwendet werden, müssen sie explizit und nachvollziehbar ausgeführt werden, damit die Vorgabe aus User Story 5 eingehalten wird.

Die Wahl von Java legt noch kein Backend-Framework fest. Ein Java-Webframework und ein Frontend-Framework bzw. Build-Werkzeug müssen in einem nächsten Schritt nach Lernaufwand, Teamkenntnissen und Bereitstellung geprüft werden. Ebenso müssen Containergröße, Startzeit und Ressourcenverbrauch auf dem konkreten Strato-VPS praktisch getestet werden; diese Werte sind hier nicht gemessen. Die Bewertung des Lerngewinns beruht auf der persönlichen Angabe zur Vorerfahrung und sollte bei abweichenden Erfahrungen weiterer Teammitglieder angepasst werden.

### Sensitivität: Was könnte die Empfehlung ändern?

- Wird ein einheitlicher TypeScript-Stack wichtiger als das Lernen einer zusätzlichen Sprache, steigt Node.js als Backend-Kandidat. Dann sollten Teammitglieder TypeScript-Backend und Java mit demselben kleinen API-Prototyp vergleichen.
- Falls sich herausstellt, dass Java-Framework, Treiber oder Betrieb auf dem VPS im Projektkontext unverhältnismäßig viel Aufwand erzeugen, sind die Betriebs- und Schnittstellenpunkte mit konkreten Prototypen neu zu bewerten.
- Wird der persönliche Lerngewinn geringer gewichtet und die vorhandene C#-Erfahrung als Teamvorteil priorisiert, kann eine .NET-Alternative erneut aufgenommen werden. Sie wurde hier nicht gegen den ausdrücklich genannten Wunsch gewertet, aus der Analyse keine Empfehlung für C# abzuleiten.
- Ein anderes Frontend-Framework oder Backend-Framework kann die konkrete Entwicklungs- und Bereitstellungserfahrung verändern, aber nicht die hier getrennt bewertete Grundentscheidung für TypeScript und Java automatisch ersetzen.

## 6. Nächste Schritte für die Teamabstimmung

1. Die Gewichte und Punkte mit dem Team bestätigen; insbesondere den Lerngewinn und die objektorientierte Serveranforderung gemeinsam einordnen.
2. TypeScript und Java als vorläufige Sprachwahl beschließen oder die Analyse bei abweichenden Teamzielen anpassen.
3. Frontend- und Backend-Framework getrennt auswählen und einen kleinen Prototyp erstellen: Der Client ruft einen Java-Endpunkt auf; der Java-Server liest und schreibt einen Beispieldatensatz über den Datenbanktreiber.
4. Sicherstellen, dass Zugangsdaten ausschließlich serverseitig genutzt werden und Setup bzw. Migrationen die Datenbank nicht stillschweigend erzeugen.
5. Den Prototyp containerisiert auf dem Strato-VPS testen und Architektur sowie endgültige Teamentscheidung dokumentieren.
