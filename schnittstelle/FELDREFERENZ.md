# Feldreferenz LEAD-Meldung-v2

> Erzeugt von `werkzeuge/bauen/schnittstelle-bauen.mjs` aus dem Schema und der Darstellungsdatei; nicht von Hand bearbeiten. Maßgeblich ist das JSON-Schema [formate/lead-kritis-v2/meldung.schema.json](../formate/lead-kritis-v2/meldung.schema.json). Anleitung für Schnittstellen: [docs/SCHNITTSTELLE.md](../docs/SCHNITTSTELLE.md).

Schemakennung `LEAD-Meldung-v2` (Feld `schema`, Formatfassung im Feld `fassung`), JSON Schema Draft 2020-12. Beschrieben ist die Betreibermeldung: 300 Felder, davon 115 aus den Modulen `lead-kritis-meldung` und `lead-kritis-betrieb` (mit ᴹ gekennzeichnet), die übrigen aus dem Kern von LEAD-Meldung-v2. Das Modul `lead-bevoelkerungsschutz` steht im Schema für Behördenmeldungen und ist Betreibern verwehrt (Rollenregel R1). Pfade nennen Listenelemente mit `[]`; „Pflicht“ heißt: Das Feld muss im übergeordneten Objekt stehen. Was nur unter einer Bedingung gilt, steht unter „Bedingte Regeln“. Objekte nehmen keine Felder auf, die hier nicht stehen; ein Feld, das fehlt, gilt als nicht erhoben, `null` als unbekannt.

## Meldung

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `schema` |  | Text | ja | immer `"LEAD-Meldung-v2"` |  |
| `fassung` |  | Text | ja | Muster `^2\.[0-9]+$` | Formatfassung innerhalb der Hauptversion 2; gleiche Hauptversion ist ohne Umbau lesbar. |
| `meldung_id` |  | Text | ja | UUID in Kleinbuchstaben, empfohlen Version 7 | Kennung dieser Meldungsfassung. Eine freigegebene Fassung bleibt unverändert; jede Fortschreibung oder Berichtigung erhält eine neue meldung_id. |
| `beziehungen` |  | Liste aus Objekt | nein |  | fortschreibung_von: Vormeldung derselben Stelle (neuer Stand); berichtigung_von: ersetzte Fassung desselben Stands. |
| `beziehungen[].art` |  | Text | ja | `"fortschreibung_von"`, `"berichtigung_von"` |  |
| `beziehungen[].meldung_id` |  | Text | ja | UUID in Kleinbuchstaben, empfohlen Version 7 | UUID in Kleinbuchstaben (empfohlen Version 7, zeitlich sortierbar). |
| `status` |  | Text | ja | `"entwurf"`, `"zur_freigabe"`, `"freigegeben"`, `"zurueckgezogen"` |  |
| `absender` |  | Objekt | ja | keine weiteren Felder |  |
| `absender.stelle` |  | Text | ja |  | Meldende Stelle. |
| `absender.stelle_id` |  | Text | nein |  | Optionale stabile Stellenkennung. |
| `absender.ebene` |  | Text | ja | `"Bund"`, `"Land"`, `"Kreis"`, `"Gemeinde"`, `"Einsatzstelle"`, `"Betreiber"`, `"Sonstige"` |  |
| `absender.gebiet` |  | Objekt | ja | Baustein Gebiet | Gebiet mit Name und optionalem amtlichem Schlüssel. Nicht jeder Wirkungsraum folgt Verwaltungsgrenzen; dafür steht die Beschreibung im Raum. |
| `berichtsraum` |  | Objekt | nein | Baustein Raum |  |
| `meldezeitpunkt` |  | Text oder null | ja | Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z) oder null | t0 der Meldung. |
| `zeitzone` | Zeitzone | Text | ja | Muster `^[A-Za-z_]+(/[A-Za-z0-9_+-]+)*$` | IANA-Zeitzone für Kalendertage und Anzeige, z. B. Europe/Berlin. |
| `meldezeitraum` |  | Objekt | ja | keine weiteren Felder |  |
| `meldezeitraum.von` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `meldezeitraum.bis` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `quellen` |  | Liste aus Objekt | ja |  |  |
| `sachverhalte` |  | Liste aus Objekt | ja |  |  |
| `fehlanzeige` |  | Objekt | nein | keine weiteren Felder | Ausdrückliche Fehlanzeige: im geprüften Umfang und Zeitraum kein meldepflichtiger Sachverhalt. |
| `fehlanzeige.umfang` |  | Text | ja |  | Geprüfter Raum und geprüfte Funktionen. |
| `fehlanzeige.zeitraum` |  | Objekt | ja | keine weiteren Felder |  |
| `fehlanzeige.zeitraum.von` |  | Text | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz | Kalendertag (JJJJ-MM-TT, Tag in der Zeitzone der Meldung) oder Zeitpunkt mit UTC-Versatz. Eine Uhrzeit steht nur, wenn sie belegt ist. |
| `fehlanzeige.zeitraum.bis` |  | Text | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz | Kalendertag (JJJJ-MM-TT, Tag in der Zeitzone der Meldung) oder Zeitpunkt mit UTC-Versatz. Eine Uhrzeit steht nur, wenn sie belegt ist. |
| `fehlanzeige.erklaerung` |  | Text | ja |  |  |
| `module` |  | Objekt | nein |  | Fachmodule für Angaben, die für die ganze Meldung gelten (etwa Meldeanlass, Vertraulichkeit, Empfänger), Schlüssel = Modulkennung. Optional; Regeln wie bei den Modulen je Sachverhalt. |
| `freigabe` |  | Objekt | ja | keine weiteren Felder |  |
| `freigabe.erfasst` |  | Objekt | nein | Baustein Zeichnung | Zeichnung. Ein Name oder Handzeichen ist kein technischer Authentizitätsnachweis. |
| `freigabe.freigegeben` |  | Objekt | nein | Baustein Zeichnung | Zeichnung. Ein Name oder Handzeichen ist kein technischer Authentizitätsnachweis. |
| `entstehung` |  | Objekt | ja | keine weiteren Felder | Herkunftsnachweis; keine Freigabe. Bleibt bei weiterer Bearbeitung erhalten (KI-Kennzeichnung). |

## `quellen[]`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `id` |  | Text | ja | Quellen-ID Q1, Q2 … |  |
| `kategorie` |  | Text | ja | `"A"`, `"B"`, `"W"`, `"M"`, `"P"` | Quellenkategorie nach dem Kodierleitfaden des Profils (Rolle der Quelle für die verwendete Aussage); das Profil legt die zulässigen Buchstaben fest. |
| `herausgeber` |  | Text | ja |  |  |
| `titel` |  | Text | ja |  |  |
| `veroeffentlicht` |  | Text oder null | nein | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `url` |  | Text | nein | Muster `^https?://\S+$` |  |
| `zugriff` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder null | Tag des Abrufs bzw. der Einsicht. |
| `datenstand` |  | Text oder null | nein | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null | Stand der Angaben in der Quelle, getrennt vom Veröffentlichungsdatum. |
| `zugang` |  | Text oder null | ja | `"oeffentlich"`, `"paywall"`, `"behoerdenintern"`, `"eingangsmaterial"`, `"eingangsmeldung"`, `"nicht_ausgewertet"`, `null` | Tatsächlicher Zugang: öffentlich, hinter Bezahlschranke, behördenintern, beigefügtes Material, Meldung einer anderen Stelle, nicht ausgewertet (davon abhängige Aussagen gelten nicht als gesichert); null = nicht angegeben. |
| `meldung_id` |  | Text | nein | UUID in Kleinbuchstaben, empfohlen Version 7 | Bei Eingangsmeldungen: meldung_id der verwendeten Meldungsfassung. |
| `ursprung` |  | Liste aus Text | nein | Quellen-ID Q1, Q2 …; ohne Wiederholung | Ursprungsquelle(n), wenn diese Quelle eine Angabe nur weiterverbreitet (z. B. Medienbericht mit Betreiberzitat). Weiterverbreitungen sind keine unabhängige Bestätigung. |
| `anmerkung` |  | Text | nein |  |  |

## `sachverhalte[]`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `kennung` |  | Text | ja | Sachverhaltskennung Präfix-JJJJMMTT-Zufall, im Entwurf auch leer | Kennung, im Entwurf auch leer oder Platzhalter NEU-n eines KI-Entwurfs; ab „zur_freigabe“ nur eine vergebene Kennung. |
| `bezug` |  | Liste aus Objekt | nein |  |  |
| `bezug[].kennung` |  | Text | ja | Sachverhaltskennung Präfix-JJJJMMTT-Zufall | Sachverhaltskennung „Präfix-JJJJMMTT-Zufall“ (Kodierleitfaden Abschnitt 8.1). Zufallsteil 4 bis 8 Zeichen nach Crockford-Base32; neu vergebene Kennungen erhalten 6 Zeichen. |
| `bezug[].meldung_id` |  | Text | nein | UUID in Kleinbuchstaben, empfohlen Version 7 | Meldungsfassung, aus der die Kennung stammt; macht den damals gemeinten Stand eindeutig. |
| `bezug[].art` |  | Text | nein | `"verdichtung"`, `"teilung"`, `"zusammenfuehrung"` |  |
| `bezeichnung` |  | Text | ja |  |  |
| `eintritt` |  | Objekt | ja | keine weiteren Felder |  |
| `eintritt.zeit` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `eintritt.genauigkeit` |  | Text | ja | `"belegt"`, `"ungefaehr"`, `"unbekannt"` | belegt: Beginn durch Quelle belegt; ungefaehr: nur eingrenzbar (Erläuterung in Lage & Ereignis); unbekannt: zeit ist null. |
| `bekannt_seit` |  | Text oder null | nein | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null | Wann der Sachverhalt erstmals bekannt wurde (nicht der Beginn). |
| `raum` |  | Objekt | ja | Baustein Raum |  |
| `analyse` |  | Objekt | ja | keine weiteren Felder | Lesbare Analysetexte mit Belegverweisen [Qn]. Maßnahmen und Empfehlungen stehen im Handlungsbedarf. |
| `analyse.lage_ereignis` |  | Text | ja |  |  |
| `analyse.risiken_auswirkungen` |  | Text | ja |  |  |
| `analyse.abhaengigkeiten_interdependenzen` |  | Text | ja |  |  |
| `bewertung` |  | Objekt | nein | keine weiteren Felder | Pflicht außer bei absender.ebene „Betreiber“: Dort setzt die verarbeitende Stelle die Bewertung in ihrem eigenen Sachverhalt; fehlt der Block, ist keine Bewertung erhoben (KL-2026-W45-01). |
| `bewertung.kernaussage` |  | Text | ja |  | Was bedeutet der Sachverhalt für den Bevölkerungsschutz, was verändert sich, welche Prüf- oder Abstimmungsfrage folgt daraus (SOP-LEAD A.4). |
| `bewertung.referenzraum` |  | Text | ja |  | Raum, für den bewertet und kodiert wird. |
| `bewertung.beurteilung` |  | Objekt | ja | keine weiteren Felder |  |
| `bewertung.beurteilung.stufe` |  | Text oder null | ja | `"geringfügig"`, `"erheblich"`, `"kritisch"`, `null` | null = keine Angabe (keine Stufe tragfähig). |
| `bewertung.beurteilung.begruendung` |  | Text | ja |  | Belegte gegenwärtige Relevanz im Referenzraum; nicht aus dem höchsten Radarwert abgeleitet. |
| `bewertung.tendenz` |  | Objekt | ja | keine weiteren Felder |  |
| `bewertung.tendenz.richtung` |  | Text oder null | ja | `"Entspannung"`, `"Stabilisierung"`, `"Verschärfung"`, `null` |  |
| `bewertung.tendenz.bezug` |  | Text | ja |  | Bezugsraum und Zeitfenster der Tendenz, z. B. „Land, 14.10. 05:30 bis 08:30“. |
| `bewertung.tendenz.begruendung` |  | Text | ja |  |  |
| `bewertung.erlaeuterung` |  | Text | nein |  | Achsendivergenzen, offene Achsen, Einordnung. |
| `bewertung.aenderung_zur_vormeldung` |  | Text | nein |  | Bei Fortschreibung: wesentliche Änderung zur letzten Bewertung (A.8.1). |
| `bewertung.neubewertung_bei` |  | Liste aus Objekt | ja |  |  |
| `bewertung.neubewertung_bei[].indikator` |  | Text | ja |  | Beobachtbares Kriterium, gegebenenfalls mit Schwelle. |
| `bewertung.neubewertung_bei[].stand` |  | Text | nein | `"neu"`, `"veraendert"`, `"unveraendert"`, `"nicht_ueberpruefbar"` | Fortschreibung nach SOP-LEAD A.8.1. |
| `bewertung.abweichende_bewertungen` |  | Liste aus Objekt | nein |  |  |
| `bewertung.abweichende_bewertungen[].stelle` |  | Text | ja |  |  |
| `bewertung.abweichende_bewertungen[].stufe` |  | Text oder null | ja | `"geringfügig"`, `"erheblich"`, `"kritisch"`, `null` |  |
| `bewertung.abweichende_bewertungen[].grund` |  | Text | ja |  | Tragender Grund der anderen Stelle. |
| `bewertung.abweichende_bewertungen[].ursache` |  | Text | nein |  | Bezugsraum, Datenstand, Zielzustand oder Maßstab. |
| `bewertung.abweichende_bewertungen[].klaerend` |  | Text | nein |  | Information, die die Differenz klären könnte. |
| `bewertung.abweichende_bewertungen[].quellen` |  | Liste aus Text | ja | Quellen-ID Q1, Q2 …; ohne Wiederholung | Verweise auf Einträge im Quellenverzeichnis (id). |
| `bewertung.erkenntnislage` |  | Objekt | nein | keine weiteren Felder |  |
| `bewertung.erkenntnislage.luecken` |  | Liste aus Text | ja |  |  |
| `bewertung.erkenntnislage.widersprueche` |  | Liste aus Objekt | ja |  |  |
| `bewertung.erkenntnislage.widersprueche[].gegenstand` |  | Text | ja |  |  |
| `bewertung.erkenntnislage.widersprueche[].beschreibung` |  | Text | ja |  | Beide Angaben mit Stelle; nicht aufgelöst. |
| `bewertung.erkenntnislage.widersprueche[].quellen` |  | Liste aus Text | ja | Quellen-ID Q1, Q2 …; ohne Wiederholung | Verweise auf Einträge im Quellenverzeichnis (id). |
| `bewertung.abschluss` |  | Objekt | nein | keine weiteren Felder | Letzte Nennung im Lagebild (A.8.2). |
| `bewertung.abschluss.ende` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `bewertung.abschluss.offene_punkte` |  | Text | ja |  | Offen bleibende Punkte oder „nichts“. |
| `bewertung.abschluss.nachsorge` |  | Text | ja |  | Stelle, bei der die Nachsorge liegt. |
| `handlungsbedarf` |  | Objekt | ja | keine weiteren Felder |  |
| `handlungsbedarf.massnahmen` |  | Liste aus Objekt | ja |  |  |
| `handlungsbedarf.massnahmen[].id` |  | Text | ja | Maßnahmen-ID M1, M2 … |  |
| `handlungsbedarf.massnahmen[].gegenstand` |  | Text | ja |  |  |
| `handlungsbedarf.massnahmen[].stelle` |  | Text | ja |  | Verantwortliche Stelle. |
| `handlungsbedarf.massnahmen[].status` |  | Text | ja | `"geplant"`, `"angefordert"`, `"angeordnet"`, `"begonnen"`, `"umgesetzt"`, `"wirksam"`, `"beendet"` | SOP-LEAD A.4; „wirksam“ nur mit Wirkungsbeleg. |
| `handlungsbedarf.massnahmen[].stand` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `handlungsbedarf.massnahmen[].quellen` |  | Liste aus Text | ja | Quellen-ID Q1, Q2 …; ohne Wiederholung | Verweise auf Einträge im Quellenverzeichnis (id). |
| `handlungsbedarf.empfehlungen` |  | Liste aus Objekt | ja |  |  |
| `handlungsbedarf.empfehlungen[].id` |  | Text | ja | Empfehlungs-ID E1, E2 … |  |
| `handlungsbedarf.empfehlungen[].adressat` |  | Text | ja |  |  |
| `handlungsbedarf.empfehlungen[].auftrag` |  | Text | ja |  | Was geprüft oder entschieden werden soll. |
| `handlungsbedarf.empfehlungen[].anlass` |  | Text | nein |  | Anlass und belegte Lücke. |
| `handlungsbedarf.empfehlungen[].termin` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `handlungsbedarf.empfehlungen[].bedingung` |  | Text | nein |  | Ohne belegten Termin: Bedingung oder nächster Prüfanlass. |
| `handlungsbedarf.empfehlungen[].quellen` |  | Liste aus Text | ja | Quellen-ID Q1, Q2 …; ohne Wiederholung | Verweise auf Einträge im Quellenverzeichnis (id). |
| `handlungsbedarf.fristen` |  | Liste aus Objekt | ja |  |  |
| `handlungsbedarf.fristen[].id` |  | Text | ja | Fristen-ID F1, F2 … |  |
| `handlungsbedarf.fristen[].bis` |  | Text | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz | Kalendertag (JJJJ-MM-TT, Tag in der Zeitzone der Meldung) oder Zeitpunkt mit UTC-Versatz. Eine Uhrzeit steht nur, wenn sie belegt ist. |
| `handlungsbedarf.fristen[].aufgabe` |  | Text | ja |  |  |
| `handlungsbedarf.fristen[].adressat` |  | Text | ja |  |  |
| `handlungsbedarf.fristen[].bedingung` |  | Text | nein |  |  |
| `handlungsbedarf.fristen[].grundlage` |  | Text | ja |  | Woraus die Frist folgt; eigene Wiedervorlagefristen als solche kennzeichnen. |
| `handlungsbedarf.fristen[].empfehlung` |  | Text | nein | Empfehlungs-ID E1, E2 … |  |
| `handlungsbedarf.fristen[].quellen` |  | Liste aus Text | ja | Quellen-ID Q1, Q2 …; ohne Wiederholung | Verweise auf Einträge im Quellenverzeichnis (id). |
| `handlungsbedarf.erlaeuterung` |  | Text | nein |  | Einordnung in Worten; Status, Adressaten und Termine stehen nur in den Listen. |
| `kennzahlen` |  | Liste aus Objekt | nein |  |  |
| `kennzahlen[].id` |  | Text | ja | Kennzahl-ID K1, K2 … |  |
| `kennzahlen[].gegenstand` |  | Text | ja |  | z. B. „ohne Stromversorgung“, „evakuiert“, „freie Betten Intensiv“. |
| `kennzahlen[].einheit` |  | Text | ja |  | Personen, Haushalte, Anschlüsse, Betten … – Einheiten nicht ineinander umetikettieren. |
| `kennzahlen[].art` |  | Text | ja | `"bestand"`, `"kumuliert"`, `"kapazitaet"`, `"bedarf"` |  |
| `kennzahlen[].wert` |  | Zahl oder null | ja |  | Zahl oder null (unbekannt); 0 nur als belegter Nullwert. |
| `kennzahlen[].bandbreite` |  | Objekt | nein | keine weiteren Felder |  |
| `kennzahlen[].bandbreite.von` |  | Zahl | ja |  |  |
| `kennzahlen[].bandbreite.bis` |  | Zahl | ja |  |  |
| `kennzahlen[].mindestwert` |  | Wahrheitswert | ja |  | Bestätigte Mindestzahl, nicht die vollständige Zahl. |
| `kennzahlen[].erhebung` |  | Text | ja | `"gezaehlt"`, `"amtlich_gemeldet"`, `"geschaetzt"`, `"hochgerechnet"`, `"prognostiziert"` |  |
| `kennzahlen[].raum` |  | Text | nein |  |  |
| `kennzahlen[].datenstand` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `kennzahlen[].teilmenge_von` |  | Text | nein | Kennzahl-ID K1, K2 … |  |
| `kennzahlen[].quellen` |  | Liste aus Text | ja | Quellen-ID Q1, Q2 …; ohne Wiederholung | Verweise auf Einträge im Quellenverzeichnis (id). |
| `zeitstrahl` |  | Liste aus Objekt | nein |  |  |
| `zeitstrahl[].id` |  | Text | ja | Zeilen-ID Z1, Z2 … |  |
| `zeitstrahl[].zeit` |  | Text | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz | Ereigniszeit (nicht Kenntniszeit). |
| `zeitstrahl[].typ` |  | Text | ja | `"Ereignis"`, `"Warnung"`, `"Maßnahme"`, `"Wendepunkt"`, `"Wiederherstellung"`, `"Bewertung"`, `"Berichtigung"` |  |
| `zeitstrahl[].text` |  | Text | ja |  | Ein Satz, höchstens etwa 160 Zeichen, ohne Quellenverweis. |
| `zeitstrahl[].quellen` |  | Liste aus Text | ja | Quellen-ID Q1, Q2 …; ohne Wiederholung | Verweise auf Einträge im Quellenverzeichnis (id). |
| `zeitstrahl[].erstmals_gemeldet` |  | Text oder null | ja | Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z) oder null | Meldezeitpunkt der ersten eigenen Meldung, die die Zeile enthält; setzt die App. Sagt nichts darüber, wann die Information erstmals irgendwo vorlag. |
| `zeitstrahl[].berichtigt` |  | Text | nein | Zeilen-ID Z1, Z2 … | Bei Typ „Berichtigung“: die berichtigte Zeile. |
| `module` |  | Objekt | ja |  | Fachmodule je Sachverhalt, Schlüssel = Modulkennung. Bekannte Module legt die Zusammenstellung des Profils fest; unbekannte bleiben erhalten und gelten als ungeprüft. |
| `module.lead-kritis-betrieb` ᴹ | Betreiberangaben (nur Betreibermeldung) | Objekt | nein | keine weiteren Felder | Fachmodul von KRITIS-LEAD je Sachverhalt einer Betreibermeldung: Betreiber, Sektor, kritische Dienstleistung, Istzustand, Ersatzverfahren, Prognose, Unterstützungsbedarf, BCM-Angaben, Abhängigkeiten sowie die betriebliche Einschätzung mit Folgemeldeanlässen, Änderung zur Vormeldung und Abschluss (die Bewertung nach LEAD setzt die verarbeitende Stelle). Steht unter sachverhalte[].module.lead-kritis-betrieb. Nicht im Modul, weil der Kern sie trägt: betroffener Raum (raum, Regionalschlüssel in raum.gebiete[].schluessel), Ausfallbeginn (eintritt), Zahlen (kennzahlen; das Modul verweist unter kennzahlen auf sie), Belege (quellen). Nachfolger des Blocks betrieb der Erweiterung lead-kritis/0.2. |

## `module`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `lead-kritis-meldung` ᴹ | Meldekopf KRITIS (optional für Behörden) | Objekt | nein | keine weiteren Felder | Meldungsmodul von KRITIS-LEAD für Angaben, die für die ganze Meldung eines KRITIS-Betreibers gelten: Stellung im Meldeverlauf, Anlass, Datenart, Vertraulichkeit, Empfänger, parallele Pflichtmeldungen. Steht unter module.lead-kritis-meldung auf oberster Ebene (LEAD-MELDUNG-V2.md, Abschnitt 7). Meldungskennung, Bezug auf die Vormeldung, Herkunftsebene und Zeitzone tragen die Kernfelder meldung_id, beziehungen, absender.ebene und zeitzone. Nachfolger des Meldekopfs kritis der Erweiterung lead-kritis/0.2. |

## `entstehung`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `verfahren` |  | Text | ja | `"manuell"`, `"KI-Entwurf"` |  |
| `erstellt` |  | Text oder null | nein | Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z) oder null |  |
| `werkzeug` |  | Objekt | nein | keine weiteren Felder |  |
| `werkzeug.name` |  | Text | ja |  |  |
| `werkzeug.version` |  | Text | nein |  |  |
| `profil` |  | Objekt | nein | keine weiteren Felder |  |
| `profil.id` |  | Text | ja |  |  |
| `profil.version` |  | Text | nein |  |  |
| `regelwerk` |  | Objekt | nein | keine weiteren Felder |  |
| `regelwerk.sop` |  | Liste aus Objekt | nein |  |  |
| `regelwerk.sop[].kennung` |  | Text | ja |  | z. B. B01, C12 |
| `regelwerk.sop[].fassung` |  | Text | nein |  |  |
| `regelwerk.sop[].bezeichnung` |  | Text | nein |  |  |
| `regelwerk.sammelmappe` |  | Text | nein |  |  |
| `regelwerk.kodierleitfaden` |  | Text | nein |  |  |
| `regelwerk.arbeitsanweisung` |  | Text | nein |  |  |
| `modelle` |  | Liste aus Objekt | nein |  |  |
| `modelle[].stufe` |  | Text | nein |  | z. B. S1, S2, Verdichtung |
| `modelle[].anbieter` |  | Text | nein |  |  |
| `modelle[].modell` |  | Text | ja |  |  |
| `lauf_id` |  | Text | nein |  |  |
| `anmerkung` |  | Text | nein |  |  |
| `migration` |  | Objekt | nein | keine weiteren Felder |  |
| `migration.von` |  | Text | ja |  | Schemakennung der Ausgangsmeldung. |
| `migration.am` |  | Text | ja | Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z) | Zeitpunkt nach RFC 3339 mit UTC-Versatz, Minuten genügen: JJJJ-MM-TTThh:mm+01:00 oder …Z. |
| `migration.werkzeug` |  | Text | nein |  |  |
| `migration.hinweise` |  | Liste aus Text | ja |  |  |

## Betreiberangaben (nur Betreibermeldung): `sachverhalte[].module.lead-kritis-betrieb`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `fassung` ᴹ |  | Text | ja | immer `"0.3"` |  |
| `betreiber` ᴹ | Betreiber | Objekt | ja | keine weiteren Felder |  |
| `betreiber.name` ᴹ | Name | Text | ja | Text, nicht leer |  |
| `betreiber.traegerschaft` ᴹ | Trägerschaft | Text | nein | `"öffentlich"`, `"privat"`, `"gemischt"` |  |
| `sektor` ᴹ | Sektor (§ 4 Abs. 1 KRITISDachG) | Text | ja | `"Energie"`, `"Transport und Verkehr"`, `"Finanzwesen"`, `"Leistungen der Sozialversicherung sowie Grundsicherung für Arbeitsuchende"`, `"Gesundheitswesen"`, `"Wasser"`, `"Ernährung"`, `"Informationstechnik und Telekommunikation"`, `"Weltraum"`, `"Siedlungsabfallentsorgung"` | Sektor nach § 4 Abs. 1 KRITISDachG; sagt nichts über eine Einstufung als kritische Anlage. |
| `kritische_dienstleistung` ᴹ | Kritische Dienstleistung | Text | ja | Text, nicht leer | Funktionsprofil nach SOP B12: betroffene Dienstleistung. |
| `anlage` ᴹ | Anlage | Objekt | nein | keine weiteren Felder |  |
| `anlage.bezeichnung` ᴹ | Bezeichnung | Text | nein |  |  |
| `anlage.kennung_betreiber` ᴹ | Kennung des Betreibers | Text | nein |  |  |
| `anteil_gebiet_prozent` ᴹ | Anteil am Gebiet (%) | Zahl oder null | nein | 0 bis 100 | Anteil des Versorgungsgebiets am Raum des Sachverhalts in Prozent; null = unbekannt. |
| `ist` ᴹ | Istzustand | Objekt | ja | keine weiteren Felder |  |
| `ist.stand` ᴹ | Datenstand | Text | ja | Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z) | Datenstand des Istzustands. |
| `ist.leistungsgrad` ᴹ | Leistungsgrad | Text | ja | `"voll"`, `"eingeschraenkt"`, `"notbetrieb"`, `"ausgefallen"`, `"unbekannt"` |  |
| `ist.leistungsgrad_prozent` ᴹ | Leistungsgrad (%) | Zahl oder null | nein | 0 bis 100 |  |
| `ist.leistungsbasis` ᴹ | Bezug des Prozentwerts | Text | nein |  | Bezugsgröße des Leistungsgrads in Prozent; Pflicht, wenn leistungsgrad_prozent eine Zahl ist. |
| `ist.einrichtungen` ᴹ | Einrichtungen mit besonderem Bedarf | Liste aus Text | nein | Text, nicht leer | Betroffene Einrichtungen mit besonderem Bedarf. |
| `ist.eskalationsstufe_betrieblich` ᴹ | Aktuelle betriebliche Einstufung | Text | nein | `"keine"`, `"Störung"`, `"Notfall"`, `"Krise"`, `"ungeklärt"` |  |
| `kennzahlen` ᴹ | Zahlen | Objekt | ja | keine weiteren Felder | Verweise auf Kennzahlen des Sachverhalts (sachverhalte[].kennzahlen[].id) je Rolle; „nicht_zutreffend“, wo die Größe für diese Dienstleistung nicht einschlägig ist; null, wo sie unbekannt ist (dann ohne Kennzahl). Personen werden nie als gezählt aus Anschlüssen abgeleitet. |
| `kennzahlen.betroffene_anschluesse` ᴹ | Anschlüsse | Text oder null | ja | Kennzahl-ID K1, K2 … oder null |  |
| `kennzahlen.betroffene_personen` ᴹ | Personen | Text oder null | ja | Kennzahl-ID K1, K2 … oder null |  |
| `kennzahlen.wiederversorgte_anschluesse` ᴹ | Wiederversorgte Anschlüsse | Text oder null | nein | Kennzahl-ID K1, K2 … oder null |  |
| `kennzahlen.standorte_ausgefallen` ᴹ | Ausgefallene Standorte | Text oder null | nein | Kennzahl-ID K1, K2 … oder null |  |
| `kennzahlen.standorte_netzersatz` ᴹ | Standorte mit Netzersatz | Text oder null | nein | Kennzahl-ID K1, K2 … oder null |  |
| `kennzahlen.betreibbare_betten` ᴹ | Betreibbare Betten | Text oder null | nein | Kennzahl-ID K1, K2 … oder null |  |
| `kennzahlen.verlegungsbedarf` ᴹ | Verlegungsbedarf | Text oder null | nein | Kennzahl-ID K1, K2 … oder null |  |
| `kennzahlen_hinweise` ᴹ | Hinweise zu den Zahlen | Objekt | nein | keine weiteren Felder | Erläuterung je Rolle einer Kennzahl, etwa warum eine Größe unbekannt ist oder wie sie abgegrenzt ist; Schlüssel wie unter kennzahlen. |
| `kennzahlen_hinweise.betroffene_anschluesse` ᴹ |  | Text | nein | Text, nicht leer |  |
| `kennzahlen_hinweise.betroffene_personen` ᴹ |  | Text | nein | Text, nicht leer |  |
| `kennzahlen_hinweise.wiederversorgte_anschluesse` ᴹ |  | Text | nein | Text, nicht leer |  |
| `kennzahlen_hinweise.standorte_ausgefallen` ᴹ |  | Text | nein | Text, nicht leer |  |
| `kennzahlen_hinweise.standorte_netzersatz` ᴹ |  | Text | nein | Text, nicht leer |  |
| `kennzahlen_hinweise.betreibbare_betten` ᴹ |  | Text | nein | Text, nicht leer |  |
| `kennzahlen_hinweise.verlegungsbedarf` ᴹ |  | Text | nein | Text, nicht leer |  |
| `ersatzverfahren` ᴹ | Ersatzverfahren | Liste aus Objekt | ja |  |  |
| `ersatzverfahren[].art` ᴹ | Art | Text | ja | Text, nicht leer |  |
| `ersatzverfahren[].status` ᴹ | Status | Text | ja | `"vorhanden"`, `"betriebsbereit"`, `"eingesetzt"`, `"wirksam"`, `"nicht_vorhanden"`, `"unbekannt"` |  |
| `ersatzverfahren[].traegt_leistungsgrad_prozent` ᴹ | Getragener Leistungsgrad (%) | Zahl oder null | nein | 0 bis 100 |  |
| `ersatzverfahren[].reichweite_bis` ᴹ | Reichweite bis | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null | Bis wann das Ersatzverfahren trägt; null = unbekannt. |
| `ersatzverfahren[].bedingung` ᴹ | Bedingung der Reichweite | Text | ja |  |  |
| `ersatzverfahren[].stand` ᴹ | Datenstand | Text | ja | Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z) | Zeitpunkt mit UTC-Versatz, wie im Kernschema von LEAD-Meldung-v2. |
| `prognose` ᴹ | Prognose Wiederanlauf | Objekt | ja | keine weiteren Felder |  |
| `prognose.stand` ᴹ | Datenstand | Text | ja | Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z) | Zeitpunkt mit UTC-Versatz, wie im Kernschema von LEAD-Meldung-v2. |
| `prognose.status` ᴹ | Status | Text | ja | `"prognose"`, `"keine_prognose_moeglich"`, `"zielzustand_erreicht"` |  |
| `prognose.geber` ᴹ | Prognosegeber | Text | nein |  |  |
| `prognose.zielzustand` ᴹ | Zielzustand | Text | nein |  |  |
| `prognose.fruehestens` ᴹ | frühestens | Text oder null | nein | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `prognose.spaetestens` ᴹ | spätestens | Text oder null | nein | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `prognose.unsicherheit` ᴹ | Unsicherheit | Text | nein | `"niedrig"`, `"mittel"`, `"hoch"` |  |
| `prognose.begruendung` ᴹ | Begründung | Text | nein |  |  |
| `bcm` ᴹ | BCM (optional) | Objekt | nein | keine weiteren Felder |  |
| `bcm.umsetzungsstand` ᴹ | BCMS-Umsetzungsstand | Text | nein | `"kein formalisiertes BCMS"`, `"Reaktiv-BCMS"`, `"Aufbau-BCMS"`, `"Standard-BCMS"`, `"anderes BCMS"` |  |
| `bcm.notfallplaene` ᴹ | Notfallpläne | Text | nein | `"vorhanden"`, `"nicht vorhanden"` |  |
| `bcm.standardbezug` ᴹ | Standardbezug | Text | nein | `"BSI-Standard 200-4"`, `"ISO 22301"`, `"BSI-Standard 200-4 und ISO 22301"`, `"anderer"` |  |
| `bcm.zertifizierung` ᴹ | Zertifizierung | Text | nein | `"zertifiziert"`, `"nicht zertifiziert"` |  |
| `bcm.planung` ᴹ | Planwerte aus der Vorsorge | Objekt | nein | keine weiteren Felder | Planwerte nach BSI-Standard 200-4; mit einem Planwert oder Notbetriebsniveau sind Bezug (Geschäftsprozess oder Ressource) und Begriffsgrundlage Pflicht. |
| `bcm.planung.bezug` ᴹ | Geschäftsprozess oder Ressource | Text | nein |  | Geschäftsprozess oder Ressource, auf die sich die Planwerte beziehen. |
| `bcm.planung.grundlage` ᴹ | Begriffsgrundlage | Text | nein | `"BSI-Standard 200-4"`, `"BSI-Standard 100-4"`, `"ISO 22301"`, `"eigene Festlegung"` |  |
| `bcm.planung.mtpd_stunden` ᴹ | Maximal tolerierbare Ausfallzeit (MTPD/MTA), Stunden | Zahl oder null | nein | 0 bis … |  |
| `bcm.planung.rto_stunden` ᴹ | Geforderte Wiederanlaufzeit (RTO/WAZ), Stunden | Zahl oder null | nein | 0 bis … |  |
| `bcm.planung.notbetriebsniveau` ᴹ | Erforderliches Notbetriebsniveau (MBCO) | Objekt | nein | keine weiteren Felder |  |
| `bcm.planung.notbetriebsniveau.beschreibung` ᴹ | Beschreibung | Text | nein |  |  |
| `bcm.planung.notbetriebsniveau.prozent` ᴹ | Prozent (optional) | Zahl oder null | nein | 0 bis 100 |  |
| `bcm.planung.notbetriebsniveau.bezugsgroesse` ᴹ | Bezugsgröße | Text | nein |  |  |
| `bcm.planung.quellen` ᴹ | Belege | Liste aus Text | nein | Quellen-ID Q1, Q2 …; ohne Wiederholung | Belege im Quellenverzeichnis der Meldung. |
| `bcm.planung.stand` ᴹ | Stand des Dokuments | Text oder null | nein | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |
| `abhaengigkeiten` ᴹ | Abhängigkeiten | Liste aus Objekt | nein |  |  |
| `abhaengigkeiten[].dienstleistung` ᴹ | Dienstleistung | Text | ja | Text, nicht leer |  |
| `abhaengigkeiten[].richtung` ᴹ | Richtung | Text | ja | `"eingehend"`, `"ausgehend"` |  |
| `abhaengigkeiten[].zustand` ᴹ | Zustand | Text | ja | `"verfuegbar"`, `"beeintraechtigt"`, `"ausgefallen"`, `"unbekannt"` |  |
| `abhaengigkeiten[].puffer` ᴹ | Puffer | Text | nein |  |  |
| `abhaengigkeiten[].betroffene_stelle` ᴹ | Betroffene Stelle | Text | nein |  |  |
| `unterstuetzungsbedarf` ᴹ | Unterstützungsbedarf | Liste aus Objekt | ja |  |  |
| `unterstuetzungsbedarf[].leistung` ᴹ | Leistung | Text | ja | Text, nicht leer |  |
| `unterstuetzungsbedarf[].menge` ᴹ | Menge | Text | nein |  |  |
| `unterstuetzungsbedarf[].bis` ᴹ | benötigt bis | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null | Bis wann die Leistung benötigt wird; null = ohne Termin. |
| `unterstuetzungsbedarf[].adressat` ᴹ | Adressat | Text | ja |  |  |
| `unterstuetzungsbedarf[].status` ᴹ | Status | Text | ja | `"geplant"`, `"angefordert"`, `"zugesagt"`, `"gedeckt"`, `"entfallen"` |  |
| `ursache` ᴹ | Ursache (vorläufig) | Objekt | nein | keine weiteren Felder |  |
| `ursache.kurz` ᴹ | Kurzbeschreibung | Text | ja |  |  |
| `ursache.status` ᴹ | Status | Text | ja | `"vorläufig"`, `"bestätigt"`, `"unbekannt"` |  |
| `bestaetigungsgrad` ᴹ | Bestätigungsgrad | Text | ja | `"bestätigt"`, `"vorläufige Eigenangabe"`, `"indirekt berichtet"`, `"widersprüchlich"` |  |
| `einschaetzung` ᴹ | Betriebliche Einschätzung | Text | nein | Text, nicht leer | Kurze betriebliche Einschätzung der Lage in einem Satz; keine Beurteilung, Tendenz oder Kodierung nach LEAD. |
| `folgemeldung_bei` ᴹ | Folgemeldung bei | Liste aus Text | nein | Text, nicht leer | Ereignisse, bei denen der Betreiber eine Folgemeldung abgibt (bisher Kennsatz „Neubewertung bei:“). |
| `aenderung_zur_vormeldung` ᴹ | Änderung zur Vormeldung | Text | nein | Text, nicht leer | Wesentliche Änderung gegenüber der Vormeldung; bei Folge- und Korrekturmeldungen erwartet (Plausibilitätsregel P6). |
| `abschluss` ᴹ | Abschluss | Objekt | nein | keine weiteren Felder | Abschluss aus Sicht des Betreibers; bei Abschlussmeldungen erwartet (Plausibilitätsregel P7). Das Ende als Zeitpunkt steht im Zeitstrahl, der Zielzustand in der Prognose. |
| `abschluss.ergebnis` ᴹ | Ergebnis | Text | ja | Text, nicht leer | Was erreicht oder beendet ist. |
| `abschluss.offene_punkte` ᴹ | Offene Punkte | Text | nein |  | Offen bleibende Punkte oder „nichts“. |
| `abschluss.nachsorge` ᴹ | Nachsorge | Text | nein |  | Nachsorge beim Betreiber. |
| `sektor_angaben` ᴹ | Sektorangaben (optional) | Objekt | nein | keine weiteren Felder | Qualitative Angaben je Sektor; Zahlen stehen als Kennzahlen im Kern (kennzahlen). |
| `sektor_angaben.energie` ᴹ | Energie | Objekt | nein | keine weiteren Felder |  |
| `sektor_angaben.energie.netzebene` ᴹ | Netzebene | Text | nein | `"Höchstspannung"`, `"Hochspannung"`, `"Mittelspannung"`, `"Niederspannung"` |  |
| `sektor_angaben.wasser` ᴹ | Wasser | Objekt | nein | keine weiteren Felder |  |
| `sektor_angaben.wasser.druckzonen_betroffen` ᴹ | Betroffene Druckzonen | ganze Zahl oder null | nein | 0 bis … |  |
| `sektor_angaben.wasser.abkochgebot` ᴹ | Abkochgebot | Text | nein | `"nein"`, `"wahrscheinlich"`, `"angeordnet"`, `"aufgehoben"` |  |
| `sektor_angaben.telekommunikation` ᴹ | Telekommunikation | Objekt | nein | keine weiteren Felder |  |
| `sektor_angaben.telekommunikation.notruf` ᴹ | Notruf | Text | nein | `"erreichbar"`, `"eingeschraenkt"`, `"nicht erreichbar"`, `"unbekannt"` |  |

## Meldekopf KRITIS (optional für Behörden): `module.lead-kritis-meldung`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `fassung` ᴹ |  | Text | ja | immer `"0.3"` |  |
| `meldeart` ᴹ | Meldeart | Text | ja | `"Erstmeldung"`, `"Folgemeldung"`, `"Korrekturmeldung"`, `"Abschlussmeldung"` | Stellung im Meldeverlauf. Folge- und Abschlussmeldung nennen die Vormeldung in beziehungen (fortschreibung_von), die Korrekturmeldung die berichtigte Fassung (berichtigung_von); eine Erstmeldung hat keine beziehungen (Rollenregel R3-bezug). |
| `meldeanlass` ᴹ | Meldeanlass | Liste aus Text | ja | `"drohende Beeinträchtigung"`, `"eingetretene Einschränkung"`, `"wesentliche Änderung"`, `"verkürzte Reichweite eines Ersatzverfahrens"`, `"neuer Unterstützungsbedarf"`, `"Zielzustand erreicht"`, `"Übung"`; mindestens ein Eintrag; ohne Wiederholung |  |
| `datenart` ᴹ | Datenart | Text | ja | immer `"synthetisch"` | Schutz gegen Echtdaten im Forschungsdemonstrator. |
| `vertraulichkeit` ᴹ | Vertraulichkeit | Objekt | ja | keine weiteren Felder |  |
| `vertraulichkeit.tlp` ᴹ | TLP | Text | ja | immer `"CLEAR"` | Kennzeichnung nach TLP 2.0; im Demonstrator nur CLEAR. |
| `vertraulichkeit.einstufung` ᴹ | Einstufung | Text | nein | immer leer | Staatliche Einstufung, getrennt von TLP; im Demonstrator leer. |
| `vertraulichkeit.hinweis` ᴹ | Hinweis | Text | nein |  |  |
| `empfaenger` ᴹ | Empfänger | Liste aus Text | ja | Text, nicht leer | Vorgesehene Empfänger der Meldung. |
| `gemeldet_an` ᴹ | Parallele Pflichtmeldungen (nur dokumentiert) | Liste aus Objekt | ja |  | Parallele Pflichtmeldungen, nur dokumentiert; leere Liste = keine dokumentiert. |
| `gemeldet_an[].stelle` ᴹ | Stelle | Text | ja | Text, nicht leer |  |
| `gemeldet_an[].rechtsgrundlage` ᴹ | Rechtsgrundlage | Text | ja |  |  |
| `gemeldet_an[].status` ᴹ | Status | Text | ja | `"erfolgt"`, `"geplant"`, `"nicht_erforderlich"`, `"unbekannt"` |  |
| `gemeldet_an[].zeitpunkt` ᴹ | Zeitpunkt | Text oder null | nein | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null | Zeitpunkt der Meldung; null = unbekannt. |
| `gemeldet_an[].kennzeichen` ᴹ | Kennzeichen | Text | nein |  |  |
| `rechtsgrundlage_dieser_meldung` ᴹ | Grundlage dieser Meldung | Text | nein |  | Grundlage dieses Beitrags; im Demonstrator „Fiktive Übung …“. |
| `kontaktstelle` ᴹ | Kontaktstelle (Funktionsadresse) | Text | nein |  | Funktionsadresse, keine Person. |

## Bausteine

Teilschemata, die an mehreren Stellen vorkommen. Die Pfade unten gelten relativ zur jeweiligen Stelle.

### Gebiet (`$defs/gebiet`)

Vorkommen: `absender.gebiet`.

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `name` |  | Text | ja |  | Bezeichnung des Gebiets, z. B. „Thüringen“, „Landkreis Sonneberg“. |
| `schluessel` |  | Text | nein | Muster `^([A-Z]{2}(-[A-Z0-9]{1,3})?\|[0-9]{2,12})$` | Optionaler Schlüssel: ISO 3166-1/-2 (DE, DE-TH) oder amtlicher Gemeinde- bzw. Regionalschlüssel (Ziffern). |

### Raum (`$defs/raum`)

Vorkommen: `berichtsraum`, `sachverhalte[].raum`.

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `beschreibung` |  | Text | ja |  | Freitext, z. B. Ortsteile, Netzgebiet, Flussabschnitt. |
| `gebiete` |  | Liste aus Objekt | ja |  |  |
| `gebiete[].name` |  | Text | ja |  | Bezeichnung des Gebiets, z. B. „Thüringen“, „Landkreis Sonneberg“. |
| `gebiete[].schluessel` |  | Text | nein | Muster `^([A-Z]{2}(-[A-Z0-9]{1,3})?\|[0-9]{2,12})$` | Optionaler Schlüssel: ISO 3166-1/-2 (DE, DE-TH) oder amtlicher Gemeinde- bzw. Regionalschlüssel (Ziffern). |

### Zeichnung (`$defs/zeichnung`)

Vorkommen: `freigabe.erfasst`, `freigabe.freigegeben`.

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `name` |  | Text | ja |  | Name oder Funktionsbezeichnung. |
| `funktion` |  | Text | nein |  |  |
| `hz` |  | Text | nein |  | Handzeichen. |
| `zeitpunkt` |  | Text oder null | ja | Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz oder null |  |

## Bedingte Regeln

Regeln, die von Werten anderer Felder abhängen. „Kern“ bezeichnet Regeln aus dem Kern von LEAD-Meldung-v2; die Kennungen R1 bis R3 sind die Rollenregeln von KRITIS-LEAD, die Prüfwerkzeug und Konformitätsfälle verwenden.

- **Kern** (Meldung) Bewertung je Sachverhalt ist Pflicht, außer bei Meldungen von Betreibern (KL-2026-W45-01, LEAD-MELDUNG-V2.md Abschnitt 3). Außer wenn `absender.ebene` = „Betreiber“: `sachverhalte[].bewertung`: Pflicht.
- **Kern** (Meldung) Wenn `fehlanzeige` vorhanden: `sachverhalte`: keine Einträge.
- **Kern** (Meldung) Wenn `status` ist „zur_freigabe“ oder „freigegeben“: `absender.stelle`: ein Text, nicht leer; `absender.gebiet.name`: ein Text, nicht leer; `meldezeitpunkt`: Form Zeitpunkt JJJJ-MM-TTThh:mm mit UTC-Versatz (+01:00, +02:00 oder Z); `sachverhalte[]`: entspricht `$defs/sachverhalt_vollstaendig`; `(Meldung)`: eine der Varianten: (`sachverhalte`: mindestens ein Eintrag; `quellen`: mindestens ein Eintrag) oder (`fehlanzeige`: Pflicht).
- **Kern** (Meldung) Wenn `status` = „freigegeben“: `freigabe.freigegeben`: Pflicht; `freigabe.freigegeben.name`: ein Text, nicht leer; `freigabe.freigegeben.zeitpunkt`: Form Kalendertag JJJJ-MM-TT oder Zeitpunkt mit UTC-Versatz.
- **R1-betreiber** (Meldung) Betreibermeldung (absender.ebene „Betreiber“): Meldungsmodul lead-kritis-meldung; mindestens ein Sachverhalt, jeder mit Modul lead-kritis-betrieb, ohne Modul lead-bevoelkerungsschutz und mit einer Kennung KRITIS-<Kürzel>-JJJJMMTT-<Zufall> (im Entwurf auch leer); ist eine Bewertung angegeben, bleiben Beurteilungsstufe und Tendenzrichtung null. Wenn `absender.ebene` = „Betreiber“: `module`: Pflicht; `module.lead-kritis-meldung`: Pflicht; `sachverhalte`: mindestens ein Eintrag; `sachverhalte[].module`: Pflicht; `sachverhalte[].kennung`: ein Text, entspricht `^$|^KRITIS-[A-Z0-9]{1,8}(-[A-Z0-9]{1,8}){0,2}-[0-9]{8}-[0-9A-HJKMNP-TV-Z]{4,8}$`; `sachverhalte[].module.lead-kritis-betrieb`: Pflicht; `sachverhalte[].module.lead-bevoelkerungsschutz`: nicht zulässig; `sachverhalte[].bewertung.beurteilung.stufe`: null; `sachverhalte[].bewertung.tendenz.richtung`: null.
- **R2-behoerde** (Meldung) Behördenmeldung (jede andere Ebene): kein Modul lead-kritis-betrieb; Betreiberangaben werden über bezug auf die Kennung des Betreiber-Sachverhalts verknüpft (Zuordnung von oben). Außer wenn `absender.ebene` = „Betreiber“: `sachverhalte[].module.lead-kritis-betrieb`: nicht zulässig.
- **R3-bezug** (Meldung) Folge- und Abschlussmeldung nennen in beziehungen die Vormeldung (fortschreibung_von), die Korrekturmeldung die berichtigte Fassung (berichtigung_von); eine Erstmeldung hat keine beziehungen. Wenn `module.lead-kritis-meldung.meldeart` ist „Folgemeldung“ oder „Abschlussmeldung“: `beziehungen`: Pflicht, mindestens ein Eintrag mit `art` = „fortschreibung_von“. Wenn `module.lead-kritis-meldung.meldeart` ist „Korrekturmeldung“: `beziehungen`: Pflicht, mindestens ein Eintrag mit `art` = „berichtigung_von“. Wenn `module.lead-kritis-meldung.meldeart` ist „Erstmeldung“: `beziehungen`: keine Einträge.
- (`sachverhalte[].eintritt`) Wenn `sachverhalte[].eintritt.genauigkeit` = „unbekannt“: `sachverhalte[].eintritt.zeit`: null.
- (`sachverhalte[].eintritt`) Wenn `sachverhalte[].eintritt.genauigkeit` ist „belegt“ oder „ungefaehr“: `sachverhalte[].eintritt.zeit`: ein Text.
- (`sachverhalte[].zeitstrahl[]`) Wenn `sachverhalte[].zeitstrahl[].typ` = „Berichtigung“: `sachverhalte[].zeitstrahl[].berichtigt`: Pflicht.
- (`sachverhalte[].zeitstrahl[]`) Wenn `sachverhalte[].zeitstrahl[].typ` ≠ „Bewertung“: `sachverhalte[].zeitstrahl[].quellen`: mindestens ein Eintrag.
- (`sachverhalte[].module.lead-kritis-betrieb.ist`) Wenn `sachverhalte[].module.lead-kritis-betrieb.ist.leistungsgrad_prozent` ist eine Zahl: `sachverhalte[].module.lead-kritis-betrieb.ist.leistungsbasis`: Pflicht, nicht leer.
- (`sachverhalte[].module.lead-kritis-betrieb.prognose`) Wenn `sachverhalte[].module.lead-kritis-betrieb.prognose.status` = „prognose“: `sachverhalte[].module.lead-kritis-betrieb.prognose` `geber`, `zielzustand`: Pflicht, nicht leer.
- (`sachverhalte[].module.lead-kritis-betrieb.prognose`) Wenn `sachverhalte[].module.lead-kritis-betrieb.prognose.status` = „keine_prognose_moeglich“: `sachverhalte[].module.lead-kritis-betrieb.prognose`: Schemafragment `{"not":{"anyOf":[{"required":["fruehestens"]},{"required":["spaetestens"]}]}}`.
- (`sachverhalte[].module.lead-kritis-betrieb.bcm.planung`) Wenn (`sachverhalte[].module.lead-kritis-betrieb.bcm.planung.mtpd_stunden` ist eine Zahl oder `sachverhalte[].module.lead-kritis-betrieb.bcm.planung.rto_stunden` ist eine Zahl oder `sachverhalte[].module.lead-kritis-betrieb.bcm.planung.notbetriebsniveau.beschreibung` nicht leer): `sachverhalte[].module.lead-kritis-betrieb.bcm.planung.bezug`: Pflicht, nicht leer; `sachverhalte[].module.lead-kritis-betrieb.bcm.planung.grundlage`: Pflicht.
- (`sachverhalte[].module.lead-kritis-betrieb.bcm.planung.notbetriebsniveau`) Wenn `sachverhalte[].module.lead-kritis-betrieb.bcm.planung.notbetriebsniveau.prozent` ist eine Zahl: `sachverhalte[].module.lead-kritis-betrieb.bcm.planung.notbetriebsniveau.bezugsgroesse`: Pflicht, nicht leer.

## Sachverhaltskennung

Ein Betreiber kennzeichnet seine Sachverhalte mit `KRITIS-<Kürzel>-JJJJMMTT-<Zufall>` (Rollenregel R1; Darstellungsdatei, `kennung`): Kürzel des Betreibers nach dem Muster `^[A-Z0-9]{1,8}(-[A-Z0-9]{1,8}){0,2}$`, einmal gewählt und beibehalten; Anlagedatum; sechs Zeichen aus dem Base32-Alphabet nach Crockford (Ziffern und Großbuchstaben ohne I, L, O, U). Beispiel: `KRITIS-ZVTN-20261014-W2ZV3M`.

## Maschinenlesbare Fassungen

- [formate/lead-kritis-v2/meldung.schema.json](../formate/lead-kritis-v2/meldung.schema.json): JSON-Schema, maßgeblich für die Prüfung
- [felder.json](felder.json): Feldverzeichnis (Format `kritis-lead-feldverzeichnis/1`), jedes Feld mit vollem Pfad, Bausteine aufgeklappt, Regeln in Worten
- [felder.csv](felder.csv): dasselbe als Tabelle (UTF-8, Semikolon) als Ausgangspunkt einer Zuordnungstabelle
- [beispiel-minimal.json](beispiel-minimal.json): kleinste gültige Betreibermeldung (13 Felder auf oberster Ebene), abgeleitet aus [01_netz_2026-10-13T22-45_erstmeldung.json](../formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg/01_netz_2026-10-13T22-45_erstmeldung.json)
