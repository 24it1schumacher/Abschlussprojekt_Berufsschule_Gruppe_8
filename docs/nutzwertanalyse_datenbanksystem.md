# Nutzwertanalyse: Auswahl eines Datenbanksystems

**Stand:** 30.09.2026 · **Bezug:** User Story 9 „Datenbanksystem kriteriengeleitet auswählen“; Vorbereitung auf Story 10 „Datenbank-Server produktiv bereitstellen“

## 1. Ziel und Rahmenbedingungen

Verglichen werden PostgreSQL, MariaDB und MySQL. Gesucht ist ein relationales Datenbanksystem für die Maschinenverleih-Anwendung. Der spätere Server ist ein Strato-VPS; die Bereitstellung soll containerisiert und reproduzierbar erfolgen. Die Anwendung muss die Datenbank ausschließlich über eine Datenbank-API ansprechen. Ein ORM oder ein anderes Werkzeug, das die Datenbank bzw. ihr Schema stillschweigend anlegt, ist nicht die vorgesehene Schnittstelle.

Die konkrete Client- und Servertechnologie ist laut [app/README.md](../app/README.md) noch nicht festgelegt. Deshalb bewertet diese Analyse die grundsätzliche Verfügbarkeit üblicher Datenbanktreiber, nicht die Kompatibilität mit einem bereits ausgewählten Framework. Die Punktwerte sind eine begründete Vorbewertung und kein Leistungsvergleich unter Last. Die Entscheidung ist **vorläufig** und muss nach Festlegung des Anwendungs-Stacks im Team bestätigt werden.

## 2. Kriterien und Gewichtung

Die Kriterien und Gewichte wurden vor der Punktevergabe festgelegt. Die Gewichte spiegeln die konkrete Projektlage wider: reproduzierbarer Betrieb auf einem einzelnen VPS, relationale Geschäftsdaten und eine später tatsächlich ausführbare Sicherungs- und Wiederherstellungsstrategie zählen besonders.

| Kriterium | Gewicht | Begründung für das Projekt |
|---|---:|---|
| Lizenzkosten | 10 % | Für ein Schulprojekt ist eine kostenlose, selbst betriebene Community-Ausgabe wichtig. Gemeint sind Lizenzkosten, nicht Hosting-, Arbeits- oder Supportkosten. |
| Eignung für relationale Geschäftsdaten | 20 % | Kunden, Maschinen, Reservierungen und Aufträge benötigen verlässliche Beziehungen und prüfbare Datenregeln. |
| Datenbank-API und Client-Treiber | 15 % | Die Anwendung soll über eine Datenbank-API zugreifen; die konkrete Programmiersprache ist noch offen. |
| Containerbetrieb und reproduzierbare Bereitstellung | 15 % | Story 10 verlangt einen containerisierten, per IaC reproduzierbar bereitgestellten Datenbankserver auf dem VPS. |
| Backup und Wiederherstellung | 15 % | Story 10 verlangt automatisierte Backups und einen erfolgreich getesteten Restore. |
| Skalierbarkeit und Replikation | 10 % | Der Start erfolgt auf einem einzelnen VPS; spätere Erweiterungsmöglichkeiten sind dennoch relevant. |
| Dokumentation und Community/Support | 15 % | Das Team benötigt zugängliche technische Dokumentation und Hilfe bei Einrichtung und Betrieb. |
| **Summe** | **100 %** | |

### Punkteskala und Berechnung

Jedes System erhält pro Kriterium eine Punktzahl von **1 bis 5**: 1 = unzureichend, 2 = eingeschränkt, 3 = ausreichend, 4 = gut, 5 = sehr gut für die hier betrachtete Projektlage. Bei clientabhängigen oder noch nicht praktisch erprobten Aspekten werden die Werte bewusst nicht als gesicherte Projekterfahrung ausgegeben.

Der gewichtete Beitrag eines Kriteriums lautet: **Gewicht in Prozent × Punkte ÷ 100**. Die Summe der Beiträge ist der Gesamtnutzwert auf einer Skala von 1 bis 5. Die jeweilige Prozentzahl in Klammern ist der Gesamtnutzwert geteilt durch 5.

## 3. Vergleich und Punktebewertung

In jeder Produktspalte steht **Punkte → gewichteter Beitrag**. Die Beiträge sind auf zwei Nachkommastellen gerundet; die Summen wurden mit den ungerundeten Werten berechnet.

| Kriterium | Gewicht | PostgreSQL | MariaDB | MySQL |
|---|---:|---:|---:|---:|
| Lizenzkosten | 10 % | 5 → 0,50 | 5 → 0,50 | 5 → 0,50 |
| Eignung für relationale Geschäftsdaten | 20 % | 5 → 1,00 | 4 → 0,80 | 4 → 0,80 |
| Datenbank-API und Client-Treiber | 15 % | 4 → 0,60 | 4 → 0,60 | 4 → 0,60 |
| Containerbetrieb und reproduzierbare Bereitstellung | 15 % | 5 → 0,75 | 5 → 0,75 | 5 → 0,75 |
| Backup und Wiederherstellung | 15 % | 4 → 0,60 | 4 → 0,60 | 4 → 0,60 |
| Skalierbarkeit und Replikation | 10 % | 4 → 0,40 | 4 → 0,40 | 4 → 0,40 |
| Dokumentation und Community/Support | 15 % | 4 → 0,60 | 4 → 0,60 | 4 → 0,60 |
| **Gewichtete Summe / Gesamtnutzwert** | **100 %** | **4,45 / 5 (89 %)** | **4,25 / 5 (85 %)** | **4,25 / 5 (85 %)** |

### Begründung der Bewertungen

- **Lizenzkosten (alle 5):** PostgreSQL steht unter der PostgreSQL License. MariaDB Server wird unter GPLv2 verteilt. Bei MySQL bezieht sich die Bewertung auf die Community-Ausgabe und nicht auf kostenpflichtige kommerzielle Angebote. Bei allen drei Produkten bedeutet „kostenlos“ nicht, dass Betrieb, Pflege und Sicherungen keinen Aufwand verursachen. [PostgreSQL-Lizenz](https://www.postgresql.org/about/licence/) · [MariaDB-Lizenz-FAQ](https://mariadb.com/docs/general-resources/community/community/faq/licensing-questions/licensing-faq) · [MySQL-Lizenzinformationen](https://www.mysql.com/about/legal/licensing/)
- **Relationale Geschäftsdaten (PostgreSQL 5, MariaDB/MySQL 4):** Alle drei sind etablierte relationale Systeme. User Story 1 verlangt, bei Reservierungen die Verfügbarkeit einer Maschine im gewählten Zeitraum sicherzustellen. PostgreSQL bietet Zeitbereichstypen und Ausschlussbedingungen, mit denen sich überlappende Zeiträume für dieselbe Maschine direkt auf Datenbankebene zurückweisen lassen (für Gleichheit auf einer Maschinen-ID kann etwa die Erweiterung `btree_gist` nötig sein). Das passt besonders gut, falls das Team diese Regel zusätzlich durch die Datenbank absichern will. MariaDB und MySQL bleiben für die Anwendung geeignet; die konkrete Absicherung derselben Regel müsste dort mit dem gewählten Schema und Transaktionsverfahren geprüft werden. Der Punktunterschied ist somit eine Projektannahme, keine allgemeine Rangfolge relationaler Systeme. [PostgreSQL-Zeitbereichstypen und Ausschlussbedingungen](https://www.postgresql.org/docs/current/rangetypes.html#RANGETYPES-CONSTRAINT) · [PostgreSQL-Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) · [MariaDB-Constraints](https://mariadb.com/docs/server/reference/sql-statements/data-definition/constraint) · [MySQL-Fremdschlüssel](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html) · [MySQL-CHECK-Constraints](https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html)
- **Datenbank-API und Client-Treiber (alle 4):** Für alle drei Produkte gibt es dokumentierte Schnittstellen bzw. Connectoren, beispielsweise PostgreSQL libpq, MariaDB Connectors und MySQL Connectors. Die Bewertung ist bei allen gleich, weil noch kein konkreter Stack feststeht. Ein passender Treiber allein belegt noch nicht, dass ein später ausgewähltes Framework, ORM oder Migrationstool wie gewünscht arbeitet. [PostgreSQL libpq](https://www.postgresql.org/docs/current/libpq.html) · [MariaDB Connectors](https://mariadb.com/docs/connectors) · [MySQL Connectors](https://dev.mysql.com/doc/connectors/en/)
- **Containerbetrieb (alle 5):** Für alle drei Systeme gibt es offizielle Docker-Images. Damit ist ein reproduzierbarer Containerbetrieb grundsätzlich möglich; erforderlich bleiben eine festgelegte Image-Version, persistente Datenspeicherung, sichere Konfiguration und ein getesteter Aktualisierungs- und Wiederherstellungsablauf. Ein Container-Image ist der Serverbetrieb, nicht die Datenbank-API der Anwendung. [PostgreSQL-Image](https://hub.docker.com/_/postgres) · [MariaDB-Image](https://hub.docker.com/_/mariadb) · [MySQL-Image](https://hub.docker.com/_/mysql)
- **Backup und Wiederherstellung (alle 4):** Es gibt für alle Produkte offizielle Dokumentation zu Sicherung und Wiederherstellung. PostgreSQL beschreibt SQL-Dumps, Dateisystem-Backups und kontinuierliche Archivierung. MariaDB dokumentiert mit `mariadb-backup` physische Sicherungen einschließlich Restore-Verfahren; MySQL dokumentiert mehrere Backup-Methoden. Die gleiche Punktzahl bedeutet, dass die Verfügbarkeit geeigneter Verfahren allein keine Auswahl entscheidet: Entscheidend sind die spätere Konfiguration, externe Aufbewahrung und ein erfolgreicher Restore-Test gemäß Story 10. [PostgreSQL Backup und Restore](https://www.postgresql.org/docs/current/backup.html) · [MariaDB Backup und Restore](https://mariadb.com/docs/server/server-usage/backup-and-restore/mariadb-backup) · [MySQL Backup-Methoden](https://dev.mysql.com/doc/refman/8.4/en/backup-methods.html)
- **Skalierbarkeit und Replikation (alle 4):** Die Systeme bieten dokumentierte Replikations- bzw. Hochverfügbarkeitsmöglichkeiten. Für das derzeit geplante Einzelserverprojekt ist keine verteilte Datenbankarchitektur belegt oder erforderlich; alle drei gelten daher als gut erweiterbar, aber nicht als auf diesem Projekt praktisch erprobt. [PostgreSQL Hochverfügbarkeit und Replikation](https://www.postgresql.org/docs/current/high-availability.html) · [MariaDB Replikation](https://mariadb.com/docs/server/ha-and-performance/standard-replication) · [MySQL Replikation](https://dev.mysql.com/doc/refman/8.4/en/replication.html)
- **Dokumentation und Community/Support (alle 4):** Für alle drei Produkte besteht umfangreiche offizielle Dokumentation und ein etabliertes Nutzer- und Supportumfeld. Ohne Erfahrung des konkreten Teams lässt sich kein belastbarer Vorteil für ein Produkt ansetzen; kommerzieller Herstellersupport ist nicht mit kostenlosem Community-Support gleichzusetzen.

## 4. Empfehlung und Einschränkungen

**Vorläufige Empfehlung: PostgreSQL.** PostgreSQL erreicht mit **4,45 von 5 Punkten** den höchsten Nutzwert. Ausschlaggebend ist die in dieser Analyse höher bewertete Eignung für das relationale Modell der Anwendung. Bei Lizenzkosten, Containerbetrieb, Treiberverfügbarkeit, Sicherungsverfahren und Skalierbarkeit ergibt sich aus den vorliegenden Projektinformationen kein belastbarer Unterschied. Der knappe Vorsprung ist daher keine Aussage, PostgreSQL sei technisch in jeder Hinsicht überlegen.

Die Empfehlung ist **keine endgültige Teamentscheidung**: User Story 9 verlangt eine Abstimmung im Team. Insbesondere der noch nicht festgelegte Client-Stack kann die Treiber- und Werkzeugauswahl beeinflussen. Auch tatsächlicher Ressourcenbedarf, Datenvolumen und Betriebskenntnisse wurden nicht gemessen. Die Punktwerte sind eine transparente Vorauswahl auf Basis der aktuellen Anforderungen und der verlinkten Herstellerdokumentation, keine unabhängige Leistungs- oder Kostenmessung.

### Sensitivität: Was könnte die Entscheidung ändern?

- Wird ein Client-Stack gewählt, für den das Team mit einem anderen System deutlich bessere Treiber-, Framework- oder Betriebskenntnisse hat, sollte das Kriterium „Datenbank-API und Client-Treiber“ neu bewertet werden. Bei 15 % Gewicht verändert ein Punkt den Gesamtnutzwert um 0,15; ein Unterschied von zwei Punkten zwischen Systemen könnte den aktuellen Vorsprung von PostgreSQL (0,20) bereits umkehren.
- Wird die zusätzliche Datenbankabsicherung überlappender Reservierungszeiträume nicht benötigt oder für alle Kandidaten gleich gut umgesetzt, sind die Punkte für relationale Eignung neu zu bewerten. Werden die Bewertungen zwischen PostgreSQL und einem Mitbewerber gleichgesetzt, schrumpft der Abstand um 0,20 Punkte auf null. Das Ergebnis wäre dann ein Gleichstand; Teamkenntnisse und ein Test mit dem tatsächlichen Anwendungs-Stack sollten entscheiden.
- Neue Anforderungen an Hochverfügbarkeit, Last, Erweiterungen oder spezielle Datenbankfunktionen können Kriterien und Gewichte ändern. Dann ist die Analyse mit den konkreten Anforderungen neu durchzuführen, statt die vorhandene Rangfolge unverändert zu übernehmen.

## 5. Nächste Schritte für die Teamabstimmung

1. Den vorgesehenen Client- und Server-Stack festlegen und für PostgreSQL sowie bei begründetem Teamwunsch einen Mitbewerber die Treiber- und Migrationsunterstützung praktisch prüfen.
2. Die Kriterien, Gewichte und insbesondere die Bewertungen „relationale Eignung“ und „Client-Treiber“ gemeinsam bestätigen oder begründet anpassen; die endgültige Wahl im Team beschließen.
3. Die beschlossene Wahl als Architecture Decision Record oder in dieser Dokumentation verbindlich festhalten.
4. Für die gewählte Datenbank in Story 10 einen versionierten Container- und IaC-Aufbau mit persistentem Speicher, eingeschränktem Netzwerkzugriff und sicher verwalteten Zugangsdaten erstellen. Die Anwendung soll sich über den vorgesehenen Datenbanktreiber bzw. das Datenbankprotokoll verbinden; Schema und Datenbank werden nicht implizit von einem Tool erzeugt. Anschließend automatisches Backup und Wiederherstellung praktisch testen und dokumentieren.
