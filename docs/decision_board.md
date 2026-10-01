# Decision Board – Maschinenverleih-Anwendung

**Stand:** 01.10.2026

**Zweck:** Dieses Board hält technische Entscheidungen, vorläufige Empfehlungen und noch offene Abstimmungen des Teams an einem Ort fest. Ein Beschluss dokumentiert die hier genannte Entscheidung und entscheidende Person; eine noch ausstehende Teamabstimmung wird ausdrücklich als offen vermerkt.

## Status

| Status | Bedeutung |
|---|---|
| **Offen** | Es gibt noch keine ausreichende Grundlage oder Empfehlung. |
| **Empfehlung** | Eine Analyse schlägt eine Option vor; die Teamentscheidung steht noch aus. |
| **Beschlossen** | Die Option ist als Projektentscheidung festgelegt; Datum und entscheidende Person sind eingetragen. Eine ggf. nötige Teamabstimmung wird separat vermerkt. |
| **Vorgabe** | Die Projektanforderung steht bereits fest; die konkrete Umsetzung kann trotzdem noch offen sein. |
| **Zur Prüfung** | Eine neue Anforderung oder Erfahrung kann eine bestehende Entscheidung ändern. |

## Entscheidungen und Abstimmungen

| ID | Thema | Status | Auswahl / Empfehlung | Begründung und Quelle | Noch zu tun | Beschlussdatum / Bestätigung |
|---|---|---|---|---|---|---|
| DB-01 | Datenbanksystem | **Beschlossen** | PostgreSQL | Höchster Nutzwert der Analyse (4,45/5). Die Bewertung berücksichtigt die relationalen Anforderungen; Kosten sind kein Kriterium. Treiber und Framework-Kompatibilität werden bei der konkreten Umsetzung geprüft. Siehe [Nutzwertanalyse Datenbanksystem](nutzwertanalyse_datenbanksystem.md) und User Story 9 / Issue #13. | Treiber mit dem gewählten Java-Framework praktisch prüfen und die Datenbank gemäß User Story 10 bereitstellen. | 01.10.2026 – vom Nutzer festgelegt; Teamabstimmung noch zu protokollieren |
| DB-02 | Frontend-Sprache | **Beschlossen** | TypeScript | Passt zum Browser-Client und unterstützt den gewünschten Lernerfolg; die Nutzwertanalyse bewertet TypeScript mit 4,75/5. Siehe [Nutzwertanalyse Anwendungstechnologien](nutzwertanalyse_anwendungstechnologien.md) und User Story 5 / Issue #9. | Frontend-Framework bzw. Build-Werkzeug auswählen; Teamabstimmung noch protokollieren. | 01.10.2026 – vom Nutzer festgelegt; Teamabstimmung noch zu protokollieren |
| DB-03 | Backend-Sprache | **Beschlossen** | Java | Passt zur geforderten objektorientierten Server-Anwendung und dem gewünschten Lernerfolg; die Nutzwertanalyse bewertet Java mit 4,75/5. Siehe [Nutzwertanalyse Anwendungstechnologien](nutzwertanalyse_anwendungstechnologien.md) und User Story 5 / Issue #9. | Java-Webframework auswählen; Teamabstimmung noch protokollieren. | 01.10.2026 – vom Nutzer festgelegt; Teamabstimmung noch zu protokollieren |
| DB-04 | Frontend- und Backend-Frameworks | **Offen** | Noch nicht festgelegt | Die Sprachwahl bestimmt nicht automatisch ein Framework. Lernaufwand, Teamkenntnisse, API-Entwicklung und Bereitstellung müssen mit konkreten Kandidaten verglichen werden. | Kandidaten festlegen und einen kleinen Client-Server-Prototyp bewerten. | — |
| DB-05 | Zugriff auf die Datenbank | **Vorgabe** | Browser-Client → HTTP-API des Servers → Datenbank-API des Servers | Der Browser darf keine Datenbank-Zugangsdaten erhalten und sich nicht direkt mit der Datenbank verbinden. Die Datenbank bzw. ihr Schema darf nicht ungefragt durch ein Tool erzeugt werden. Siehe User Story 5 / Issue #9 sowie die beiden Nutzwertanalysen. | Bei Framework-, ORM- und Migrationstool-Auswahl prüfen, dass Datenbankzugriff und Schemaänderungen explizit bleiben. | Projektanforderung |
| DB-06 | Datenbankbereitstellung | **Vorgabe** | Containerisierte, reproduzierbare Bereitstellung auf dem Strato-VPS | User Story 10 verlangt eine versionierte Bereitstellung mit persistentem Speicher und kontrolliertem Zugriff. Das konkrete Compose-/IaC-Setup ist noch nicht festgelegt. Siehe User Story 10 / Issue #14. | Nach der Datenbankauswahl Image-Version, Speicherung, Netzwerkzugriff und Zugangsdaten festlegen und Verbindung praktisch testen. | Projektanforderung |
| DB-07 | Mailserver-System | **Offen** | Noch zu vergleichen | User Story 11 verlangt einen Kriterienvergleich von Mailcow, docker-mailserver und Stalwart; die Auswahl ist noch nicht dokumentiert. Siehe User Story 11 / Issue #15. | Nutzwertanalyse erstellen, Ressourcenbedarf mit dem VPS abgleichen und Auswahl im Team bestätigen. | — |

## Beschlüsse dokumentieren

Wenn eine Empfehlung oder offene Auswahl beschlossen wird:

1. Status auf **Beschlossen** setzen.
2. Die bestätigte Option und eine kurze Begründung in der Tabelle ergänzen.
3. Datum und entscheidende Person bzw. bestätigendes Team in der Spalte „Beschlussdatum / Bestätigung“ eintragen.
4. Falls ein Beschluss eine Nutzwertanalyse verändert, auch die Analyse aktualisieren.
