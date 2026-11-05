# Schnittstelle: Betreibermeldungen aus einem BCM-System erzeugen

Diese Anleitung gehört zum Forschungsdemonstrator KRITIS-LEAD. Sie richtet sich an Betreiber Kritischer Infrastrukturen, die eine Betreibermeldung nicht im [Betreiberformular](../formular/betreibermeldung.html) erfassen, sondern aus ihrem System für das Business Continuity Management (BCM) oder ihrem Notfall- und Krisenmanagement heraus erzeugen wollen. Das Ergebnis ist dieselbe JSON-Datei, die auch das Formular ausgibt: eine Meldung nach LEAD-Meldung-v2 mit den Modulen von KRITIS-LEAD.

Der Demonstrator ist kein Meldeweg. Er nimmt keine Meldungen entgegen, begründet keine Meldepflicht und ersetzt keine Meldung nach Bundes- oder Landesrecht. **Nur fiktive Daten verwenden** – das Schema lässt ohnehin nur synthetische Daten mit TLP:CLEAR zu.

## Das Zielformat

Eine Meldung ist eine JSON-Datei in UTF-8. Beschrieben ist das Format dreifach, alles aus derselben Quelle:

| Fassung | Datei | Zweck |
|---|---|---|
| JSON-Schema (Draft 2020-12) | [meldung.schema.json](../formate/lead-kritis-v2/meldung.schema.json) | maßgeblich; damit prüft die Schnittstelle ihre Ausgabe |
| Feldreferenz | [FELDREFERENZ.md](../schnittstelle/FELDREFERENZ.md) | zum Lesen: jedes Feld mit Typ, Pflicht, zulässigen Werten, Format und den bedingten Regeln |
| Feldverzeichnis | [felder.json](../schnittstelle/felder.json), [felder.csv](../schnittstelle/felder.csv) | maschinenlesbar: jedes Feld mit vollem Pfad; die CSV-Datei ist ein Ausgangspunkt für die Zuordnungstabelle |
| Beispiele | [beispiel-minimal.json](../schnittstelle/beispiel-minimal.json), [Szenario Orkantief „Ilka“](../formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg/LIESMICH.md) | kleinste gültige Betreibermeldung; vollständige Erst-, Folge-, Korrektur- und Abschlussmeldungen |

Das Schema setzt KRITIS-LEAD mit dem Werkzeug von KI-LEAD aus dem Kernschema von LEAD-Meldung-v2 und den eigenen Modulen zusammen ([formate/lead-kritis-v2/](../formate/lead-kritis-v2/README.md)). Feldreferenz, Feldverzeichnis und Minimalbeispiel werden aus dem Schema erzeugt. Ändert sich das Schema, erzeugt ein Pull Request sie neu, und die Prüfung in GitHub Actions schlägt fehl, solange sie nicht zum Schema passen.

## Aufbau einer Meldung

Eine Betreibermeldung besteht aus

- dem **Kern** nach LEAD-Meldung-v2, den auch Behörden verwenden: `absender`, `meldezeitpunkt`, `zeitzone`, `meldezeitraum`, `quellen`, `freigabe`, `entstehung` und die Liste `sachverhalte` mit Kennung, Eintritt, Raum, Analyse, Handlungsbedarf, Kennzahlen und Zeitstrahl;
- dem **Meldungsmodul** `module.lead-kritis-meldung`: Meldeart, Meldeanlass, Vertraulichkeit, Empfänger und parallele Pflichtmeldungen;
- je Sachverhalt dem **Fachmodul** `sachverhalte[].module.lead-kritis-betrieb`: Angaben zum eigenen Betrieb mit Datenstand.

Im Folgenden steht `kopf.` kurz für `module.lead-kritis-meldung.` und `betrieb.` kurz für `sachverhalte[].module.lead-kritis-betrieb.`; `[]` bezeichnet ein Element einer Liste. Eine Betreibermeldung trägt `absender.ebene` = „Betreiber“ und mindestens einen Sachverhalt. Die Bewertung (`sachverhalte[].bewertung`) und das Modul `lead-bevoelkerungsschutz` bleiben weg; beides setzt die verarbeitende Stelle in ihrem eigenen Sachverhalt (Rollenregel R1).

## Schritt 1: Feste Werte setzen

Einige Felder haben genau einen zulässigen Wert; die Feldreferenz nennt ihn mit „immer“. Dazu gehören `schema`, `kopf.fassung`, `betrieb.fassung`, `kopf.datenart` und `kopf.vertraulichkeit.tlp`; `fassung` nennt die Formatfassung innerhalb der Hauptversion 2. Für eine Betreibermeldung gilt außerdem `absender.ebene` = „Betreiber“. `status` steht auf „zur_freigabe“, wenn die Meldung zur Freigabe vorgelegt wird, und auf „freigegeben“, sobald `freigabe.freigegeben` mit Name oder Funktion und Zeitpunkt eingetragen ist. Die Schnittstelle liest diese Werte am besten aus dem Schema, statt sie fest einzutragen; dann fällt eine neue Fassung beim Prüfen sofort auf.

## Schritt 2: Daten des BCM-Systems zuordnen

Die Tabelle nennt typische Objekte eines BCM-Systems und die Zielfelder. Wie das eigene System sie nennt, legt die Zuordnungstabelle fest; [felder.csv](../schnittstelle/felder.csv) enthält alle Zielfelder mit Bezeichnung und zulässigen Werten.

| Im BCM-System | Zielfeld | Hinweis |
|---|---|---|
| Organisation, Betreibergesellschaft | `absender.stelle`, `absender.gebiet`, `betrieb.betreiber.name`, `betrieb.betreiber.traegerschaft` | Land als Gebiet mit Schlüssel nach ISO 3166-2, etwa `DE-TH` |
| Geschäftsprozess, Produkt oder Dienstleistung | `betrieb.kritische_dienstleistung`, `betrieb.sektor` | Sektor nach § 4 Abs. 1 KRITISDachG |
| Standort, Anlage, Asset | `betrieb.anlage.bezeichnung`, `betrieb.anlage.kennung_betreiber` | |
| Versorgungsgebiet | `sachverhalte[].raum.beschreibung`, `sachverhalte[].raum.gebiete` | Gebiete mit amtlichem Regionalschlüssel nur als Raumbezug |
| Vorfall, Notfall | `sachverhalte[].kennung`, `sachverhalte[].bezeichnung` | eine Kennung je Vorfall, siehe Schritt 3 |
| Beginn der Störung | `sachverhalte[].eintritt` | Zeit mit Genauigkeit „belegt“ oder „ungefaehr“; ohne Einschränkung oder ohne bekannten Beginn `null` mit „unbekannt“ |
| Notfallstatus, Eskalationsstufe | `betrieb.ist.eskalationsstufe_betrieblich` | eigene Stufen auf die Werte der Feldreferenz abbilden |
| aktuelle Leistung, Kapazität | `betrieb.ist.leistungsgrad`, `betrieb.ist.leistungsgrad_prozent`, `betrieb.ist.leistungsbasis` | ein Prozentwert braucht seine Bezugsgröße |
| betroffene Kunden, Anschlüsse, Personen | `sachverhalte[].kennzahlen`, `betrieb.kennzahlen` | als Kennzahl, siehe Schritt 5 |
| Notbetrieb, Ausweich- und Ersatzlösungen | `betrieb.ersatzverfahren` | Reichweite nur mit Bedingung |
| eigene Maßnahmen | `sachverhalte[].handlungsbedarf.massnahmen` | Status nach der Feldreferenz; „wirksam“ nur mit Beleg |
| Prognose des Wiederanlaufs | `betrieb.prognose` | Prognose zum Datenstand, keine Zusage |
| Ergebnisse der Business-Impact-Analyse: MTPD, RTO, Notbetriebsniveau | `betrieb.bcm.planung` | je benanntem Geschäftsprozess (`betrieb.bcm.planung.bezug`) mit Begriffsgrundlage (`betrieb.bcm.planung.grundlage`) |
| BCMS-Stufe, Standardbezug, Zertifizierung | `betrieb.bcm.umsetzungsstand`, `betrieb.bcm.standardbezug`, `betrieb.bcm.zertifizierung`, `betrieb.bcm.notfallplaene` | Selbstauskunft |
| Abhängigkeiten von Lieferanten und Ressourcen | `betrieb.abhaengigkeiten` | eingehend und ausgehend |
| Anforderungen externer Unterstützung | `betrieb.unterstuetzungsbedarf` | |
| Termine, bis zu denen etwas geschehen muss | `sachverhalte[].handlungsbedarf.fristen` | mit Adressat, Bedingung und Grundlage |
| Ursache | `betrieb.ursache` | vorläufig oder bestätigt |
| Meldungen an Aufsichtsbehörden | `kopf.gemeldet_an` | nur dokumentiert; diese Meldung ersetzt sie nicht |
| Lagebericht, Ereignisprotokoll | `sachverhalte[].analyse`, `quellen`, `sachverhalte[].zeitstrahl` | Belege im Text mit [Q1], [Q2] …, in den Listen als Quellen-IDs |
| eigene Einschätzung der Lage für die Dienstleistung | `betrieb.einschaetzung`, `betrieb.folgemeldung_bei` | in einem Satz; Anlässe für die nächste Meldung als Liste |
| Freigabeprozess | `freigabe` | Funktionen statt Namen |

Übermittelt werden Kenngrößen, keine Pläne: keine Inhalte aus Business-Impact-Analysen, Notfallplänen, Netzplänen oder Alarmierungslisten. Planwerte (MTPD, RTO, Notbetriebsniveau) sind Werte aus der Vorsorge für einen Geschäftsprozess, keine Prognose und keine Zusage; die Begriffe folgen BSI-Standard 200-4 (BSI, 2023). Werte nach BSI-Standard 100-4 werden als solche gekennzeichnet, weil eine Wiederanlaufzeit dort Erkennung und Reaktion einschließt.

## Schritt 3: Kennungen und Meldeverlauf führen

Zwei Kennungen mit verschiedenen Aufgaben:

- **`meldung_id`** kennzeichnet die Nachricht. Jede Meldung erhält eine neue UUID in Kleinbuchstaben, empfohlen Version 7 (zeitlich sortierbar). Dieselbe ID mit anderem Inhalt gilt als Konflikt.
- **`sachverhalte[].kennung`** kennzeichnet den Vorfall über alle Meldungen hinweg, in der Form `KRITIS-<Kürzel>-JJJJMMTT-<Zufall>`: Kürzel des Betreibers (selbst gewählt, einmal festgelegt), Anlagedatum und sechs Zeichen aus dem Base32-Alphabet nach Crockford. Die Schnittstelle vergibt sie bei der ersten Meldung zu einem Vorfall und speichert sie im BCM-System; Folge-, Korrektur- und Abschlussmeldungen tragen dieselbe Kennung. Einzelheiten: Feldreferenz, Abschnitt „Sachverhaltskennung“.

Der Meldeverlauf steht in `kopf.meldeart`. Eine Erstmeldung hat keine `beziehungen`; Folge- und Abschlussmeldung nennen dort mit `art` = „fortschreibung_von“ die `meldung_id` der Vormeldung, eine Korrekturmeldung mit „berichtigung_von“ die berichtigte Fassung (Rollenregel R3). Folge- und Korrekturmeldungen beschreiben in `betrieb.aenderung_zur_vormeldung`, was sich geändert hat (Plausibilitätsregel P6); eine Abschlussmeldung füllt `betrieb.abschluss` und setzt `betrieb.prognose.status` auf „zielzustand_erreicht“ (P7). Zeitstrahlzeilen früherer Meldungen bleiben stehen; `sachverhalte[].zeitstrahl[].erstmals_gemeldet` nennt den Meldezeitpunkt der ersten eigenen Meldung mit der Zeile.

## Schritt 4: Zeiten

Zeitpunkte stehen nach RFC 3339 mit UTC-Versatz, Minuten genügen: `2026-10-14T06:30+02:00` oder `…Z`. Wo die Feldreferenz „Kalendertag oder Zeitpunkt“ nennt, genügt ein Tag `JJJJ-MM-TT`, wenn keine Uhrzeit belegt ist. `zeitzone` (nach IANA, etwa `Europe/Berlin`) nennt die Zeitzone, in der die Meldung Tage und Anzeigen versteht; der Versatz jedes Zeitpunkts folgt ihr, also `+01:00` in der Normalzeit und `+02:00` in der Sommerzeit. Speichert das BCM-System Zeitpunkte in UTC, kann die Schnittstelle sie mit `Z` übernehmen.

Drei Zeitarten bleiben getrennt: der Datenstand des Istzustands (`betrieb.ist.stand` und `stand` bzw. `datenstand` in den übrigen Angaben), die Prognose zum Datenstand und die Planwerte aus der Vorsorge. Kein Datenstand liegt nach `meldezeitpunkt`.

## Schritt 5: Zahlen und Leerwerte

Zählbare Angaben stehen als Kennzahlen des Sachverhalts in `sachverhalte[].kennzahlen` mit `id` (K1, K2 …), `gegenstand`, `einheit`, `art`, `wert`, `mindestwert`, `erhebung`, `datenstand` und `quellen`. Das Modul verweist je Rolle darauf: `betrieb.kennzahlen.betroffene_anschluesse` = „K1“ etwa. Steht dort `null`, ist die Größe geprüft, aber unbekannt; „nicht_zutreffend“ heißt, sie ist für diese Dienstleistung nicht einschlägig. `betroffene_anschluesse` und `betroffene_personen` sind Pflicht, weitere Rollen gelten je Sektor. Personen werden nie als gezählt aus Anschlüssen hochgerechnet; eine Hochrechnung trägt `erhebung` = „hochgerechnet“ oder „geschaetzt“. Eine Erläuterung je Rolle steht in `betrieb.kennzahlen_hinweise`.

Für alle übrigen Felder gilt nach LEAD-Meldung-v2: Ein Feld, das fehlt, ist nicht erhoben; `null` heißt geprüft, aber unbekannt, wo die Feldreferenz es zulässt. Ein leerer Text ist nur im Entwurf zulässig. Optionale Felder ohne Angabe lässt die Schnittstelle weg. Felder, die die Feldreferenz nicht nennt, sind nicht zulässig; eigene Zusatzfelder des BCM-Systems gehören nicht in die Meldung.

## Schritt 6: Ausgabe prüfen

Die Schnittstelle prüft jede Datei gegen das Schema, bevor sie sie weitergibt. Das Schema nutzt nur Standard-Schlüsselwörter und kein `format`; jeder Prüfer für JSON Schema Draft 2020-12 genügt.

JavaScript mit [Ajv](https://ajv.js.org/):

```js
import Ajv2020 from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";

const schema = JSON.parse(readFileSync("meldung.schema.json", "utf-8"));
const pruefe = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
const meldung = JSON.parse(readFileSync("meldung.json", "utf-8"));
if (!pruefe(meldung)) console.error(pruefe.errors);
```

Python mit [jsonschema](https://python-jsonschema.readthedocs.io/):

```python
import json
from jsonschema import Draft202012Validator

schema = json.load(open("meldung.schema.json", encoding="utf-8"))
meldung = json.load(open("meldung.json", encoding="utf-8"))
for fehler in Draft202012Validator(schema).iter_errors(meldung):
    print("/".join(map(str, fehler.path)), fehler.message)
```

Das Schema prüft Struktur, zulässige Werte und Rollen, nicht die sachliche Richtigkeit. Weitere Regeln prüft das Werkzeug des Repositorys (`npm run pruefen:v2 -- <datei.json|ordner>`): Plausibilität P1 bis P11, etwa Prognosefenster, Reichweite mit Bedingung, Datenstände vor dem Meldezeitpunkt und Verweise auf vorhandene Kennzahlen, und über einen Satz von Meldungen die Nachrichtenidentität I1 bis I5. Die Regeln stehen in [formate/lead-kritis-v2/README.md](../formate/lead-kritis-v2/README.md); das Modul `werkzeuge/pruefen/v2/plausibilitaet.mjs` hat keine Abhängigkeiten und lässt sich in eine eigene Schnittstelle übernehmen.

## Schritt 7: Mit den Konformitätsfällen testen

[formate/lead-kritis-v2/konformitaet/faelle.json](../formate/lead-kritis-v2/konformitaet/faelle.json) nennt für jede Datei, ob sie gültig ist, und bei ungültigen Fällen Regel und Pfad. Eine Schnittstelle besteht, wenn

1. ihre Ausgabe für die Lagen des Szenarios gültig ist und ohne Fehler durch `npm run pruefen:v2` läuft,
2. ihr Prüfschritt alle Negativfälle aus `formate/lead-kritis-v2/konformitaet/negativ/` zurückweist und
3. ein Satz aus Erst-, Folge- und Abschlussmeldung zum selben Vorfall die Nachrichtenidentität wahrt (gleiche Sachverhaltskennung, neue Meldungs-ID, Bezug auf die Vormeldung).

Das Szenario Orkantief „Ilka“ im Landkreis Sonneberg eignet sich als Testdatensatz: Die Lagekarten in [erprobung/einspielungen/](../erprobung/einspielungen/README.md) beschreiben die Lage ohne fertige Meldung.

## Wenn sich das Format ändert

Die Hauptversion steht in der Schemakennung (`schema`), die Formatfassung in `fassung`, die Fassung jedes Moduls in dessen Feld `fassung`. Eine Meldung derselben Hauptversion bleibt ohne Umbau lesbar. Änderungen stehen im [Änderungsverlauf](../CHANGELOG.md). Eine Schnittstelle, die das Schema aus dieser Quelle bezieht und ihre Ausgabe damit prüft, bemerkt eine neue Fassung beim nächsten Lauf; die Zuordnungstabelle lässt sich mit einem Abgleich der neuen [felder.csv](../schnittstelle/felder.csv) nachführen.

## Quellen

Bundesamt für Sicherheit in der Informationstechnik (2023): BSI-Standard 200-4 Business Continuity Management. Online abrufbar unter: https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Grundschutz/BSI_Standards/standard_200_4.pdf [Zugriff: 31.10.2026]
