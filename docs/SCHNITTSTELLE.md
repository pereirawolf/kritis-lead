# Schnittstelle: Betreibermeldungen aus einem BCM-System erzeugen

Diese Anleitung gehört zum Forschungsdemonstrator KRITIS-LEAD. Sie richtet sich an Betreiber Kritischer Infrastrukturen, die eine Betreibermeldung nicht im [Betreiberformular](../formular/betreibermeldung.html) erfassen, sondern aus ihrem System für das Business Continuity Management (BCM) oder ihrem Notfall- und Krisenmanagement heraus erzeugen wollen. Das Ergebnis ist dieselbe JSON-Datei, die auch das Formular ausgibt; KI-LEAD lädt sie mit dem Profilpaket `lead-kritis` ohne Umformatierung in das Lagebild.

Der Demonstrator ist kein Meldeweg. Er nimmt keine Meldungen entgegen, begründet keine Meldepflicht und ersetzt keine Meldung nach Bundes- oder Landesrecht. **Nur fiktive Daten verwenden** – das Schema lässt ohnehin nur synthetische Daten mit TLP:CLEAR zu.

## Das Zielformat

Eine Meldung ist eine JSON-Datei in UTF-8. Beschrieben ist das Format dreifach, alles aus derselben Quelle:

| Fassung | Datei | Zweck |
|---|---|---|
| JSON-Schema (Draft 2020-12) | [meldung.schema.json](../profil/lead-kritis/meldung.schema.json) | maßgeblich; damit prüft die Schnittstelle ihre Ausgabe |
| Feldreferenz | [FELDREFERENZ.md](../schnittstelle/FELDREFERENZ.md) | zum Lesen: jedes Feld mit Typ, Pflicht, zulässigen Werten, Format und den bedingten Regeln |
| Feldverzeichnis | [felder.json](../schnittstelle/felder.json), [felder.csv](../schnittstelle/felder.csv) | maschinenlesbar: jedes Feld mit vollem Pfad; die CSV-Datei ist ein Ausgangspunkt für die Zuordnungstabelle |
| Beispiele | [beispiel-minimal.json](../schnittstelle/beispiel-minimal.json), [Szenario Orkantief „Ilka“](../szenario/orkantief-ilka-sonneberg/LIESMICH.md) | kleinste gültige Betreibermeldung; vollständige Erst-, Folge-, Korrektur- und Abschlussmeldungen |

Feldreferenz, Feldverzeichnis und Minimalbeispiel werden aus dem Schema erzeugt. Ändert sich das Schema, erzeugt ein Pull Request sie neu, und die Prüfung in GitHub Actions schlägt fehl, solange sie nicht zum Schema passen. Was dort steht, gilt deshalb für genau die Schemakennung, die im Kopf der Feldreferenz genannt ist.

## Aufbau einer Meldung

Eine Betreibermeldung besteht aus

- dem **Kern** nach LEAD-Meldung-v1, den auch Behörden verwenden: `land`, `meldende_stelle`, `meldezeitpunkt`, `meldezeitraum`, `quellen`, `zeitstrahl`, `freigabe` und die Liste `sachverhalte` mit Analysefeldern und Sofortbereich;
- dem **Meldekopf** `kritis`: Rolle, Meldeart, Meldeanlass, Kennung der Nachricht, Vertraulichkeit, Empfänger und parallele Pflichtmeldungen;
- je Sachverhalt dem Block **`betrieb`**: Angaben zum eigenen Betrieb mit Datenstand.

Im Folgenden steht `betrieb.` kurz für `sachverhalte[].betrieb.`; `[]` bezeichnet ein Element einer Liste.

## Schritt 1: Feste Werte setzen

Einige Felder haben je Schemakennung genau einen zulässigen Wert; die Feldreferenz nennt ihn mit „immer“. Dazu gehören `schema`, `kritis.erweiterung`, `kritis.datenart` und `kritis.vertraulichkeit.tlp`. Für eine Betreibermeldung gilt außerdem `kritis.rolle` = „Betreiber“, und `_status` steht auf „final“, sobald die Meldung abgegeben wird. Die Schnittstelle liest diese Werte am besten aus dem Schema, statt sie fest einzutragen; dann fällt eine neue Fassung beim Prüfen sofort auf.

## Schritt 2: Daten des BCM-Systems zuordnen

Die Tabelle nennt typische Objekte eines BCM-Systems und die Zielfelder. Wie das eigene System sie nennt, legt die Zuordnungstabelle fest; [felder.csv](../schnittstelle/felder.csv) enthält alle Zielfelder mit Bezeichnung und zulässigen Werten.

| Im BCM-System | Zielfeld | Hinweis |
|---|---|---|
| Organisation, Betreibergesellschaft | `meldende_stelle`, `betrieb.betreiber.name`, `betrieb.betreiber.traegerschaft` | |
| Geschäftsprozess, Produkt oder Dienstleistung | `betrieb.kritische_dienstleistung`, `betrieb.sektor` | Sektor nach § 4 Abs. 1 KRITISDachG |
| Standort, Anlage, Asset | `betrieb.anlage.bezeichnung`, `betrieb.anlage.kennung_betreiber` | |
| Versorgungsgebiet | `betrieb.raum.ars`, `betrieb.raum.beschreibung` | Amtlicher Regionalschlüssel nur als Raumbezug |
| Vorfall, Notfall | `sachverhalte[].kennung`, `sachverhalte[].bezeichnung`, `sachverhalte[].eintritt`, `sachverhalte[].art` | eine Kennung je Vorfall, siehe Schritt 3 |
| Notfallstatus, Eskalationsstufe | `betrieb.ist.eskalationsstufe_betrieblich` | eigene Stufen auf die Werte der Feldreferenz abbilden |
| aktuelle Leistung, Kapazität | `betrieb.ist.leistungsgrad`, `betrieb.ist.leistungsgrad_prozent`, `betrieb.ist.leistungsbasis` | ein Prozentwert braucht seine Bezugsgröße |
| Beginn der Störung | `betrieb.ist.beginn` | |
| betroffene Kunden, Anschlüsse, Personen | `betrieb.ist.betroffene.anschluesse`, `betrieb.ist.betroffene.personen` | als Messwert, siehe Schritt 5 |
| Notbetrieb, Ausweich- und Ersatzlösungen | `betrieb.ersatzverfahren` | Reichweite nur mit Bedingung |
| Prognose des Wiederanlaufs | `betrieb.prognose` | Prognose zum Datenstand, keine Zusage |
| Ergebnisse der Business-Impact-Analyse: MTPD, RTO, Notbetriebsniveau | `betrieb.bcm.planung` | je benanntem Geschäftsprozess (`betrieb.bcm.planung.bezug`) mit Begriffsgrundlage (`betrieb.bcm.planung.grundlage`) |
| BCMS-Stufe, Standardbezug, Zertifizierung | `betrieb.bcm.umsetzungsstand`, `betrieb.bcm.standardbezug`, `betrieb.bcm.zertifizierung`, `betrieb.bcm.notfallplaene` | Selbstauskunft |
| Abhängigkeiten von Lieferanten und Ressourcen | `betrieb.abhaengigkeiten` | eingehend und ausgehend |
| Anforderungen externer Unterstützung | `betrieb.unterstuetzungsbedarf` | |
| Ursache | `betrieb.ursache` | vorläufig oder bestätigt |
| Meldungen an Aufsichtsbehörden | `kritis.gemeldet_an` | nur dokumentiert; diese Meldung ersetzt sie nicht |
| Lagebericht, Ereignisprotokoll | `sachverhalte[].analyse`, `quellen`, `zeitstrahl` | Belege im Text mit [Q1], [Q2] … |
| eigene Einschätzung der Lage für die Dienstleistung | `sachverhalte[].sofort.bewertung_text` | als Text |
| Freigabeprozess | `freigabe` | Funktionen statt Namen |

Übermittelt werden Kenngrößen, keine Pläne: keine Inhalte aus Business-Impact-Analysen, Notfallplänen, Netzplänen oder Alarmierungslisten. Planwerte (MTPD, RTO, Notbetriebsniveau) sind Werte aus der Vorsorge für einen Geschäftsprozess, keine Prognose und keine Zusage; die Begriffe folgen BSI-Standard 200-4 (BSI, 2023). Werte nach BSI-Standard 100-4 werden als solche gekennzeichnet, weil eine Wiederanlaufzeit dort Erkennung und Reaktion einschließt.

Im Sofortbereich bleiben `sachverhalte[].sofort.beurteilung` und `sachverhalte[].sofort.tendenz` in einer Betreibermeldung leer und alle Achsen von `sachverhalte[].sofort.lagenradar` stehen auf `null` (Rollenregel R1). Die Felder gehören zum gemeinsamen Kern und müssen deshalb vorhanden sein.

## Schritt 3: Kennungen und Meldeverlauf führen

Zwei Kennungen mit verschiedenen Aufgaben:

- **`kritis.meldung_id`** kennzeichnet die Nachricht. Jede Meldung erhält eine neue URN-UUID in Kleinbuchstaben, etwa mit `crypto.randomUUID()` in JavaScript oder `uuid.uuid4()` in Python, jeweils mit dem Präfix `urn:uuid:`. Dieselbe ID mit anderem Inhalt gilt als Konflikt.
- **`sachverhalte[].kennung`** kennzeichnet den Vorfall über alle Meldungen hinweg. Die Schnittstelle vergibt sie bei der ersten Meldung zu einem Vorfall und speichert sie im BCM-System; Folge-, Korrektur- und Abschlussmeldungen tragen dieselbe Kennung. Form und Präfix je Land: Feldreferenz, Abschnitt „Präfixe der Sachverhaltskennung“.

Der Meldeverlauf steht in `kritis.meldeart`. Eine Erstmeldung lässt `kritis.bezug_meldung_id` leer; jede weitere Meldung nennt dort die `kritis.meldung_id` der Meldung, die sie fortschreibt, berichtigt oder abschließt (Rollenregel R3). In `sachverhalte[].sofort.bewertung_text` beginnt bei Folge- und Korrekturmeldungen eine Zeile mit „Änderung zur Vormeldung:“ (Plausibilitätsregel P6), bei Abschlussmeldungen mit „Abschluss im Lagebild:“; eine Abschlussmeldung setzt außerdem `betrieb.prognose.status` auf „zielzustand_erreicht“ (P7).

## Schritt 4: Zeiten umrechnen

Alle Zeiten sind Wanduhrzeiten `JJJJ-MM-TTThh:mm` ohne Sekunden und ohne Zeitzonenangabe; die Zeitzone steht einmal in `zeitzone` (nach IANA, etwa `Europe/Berlin`). Speichert das BCM-System Zeitpunkte in UTC oder mit Versatz, rechnet die Schnittstelle sie in die Zeitzone der Meldung um und schneidet Sekunden ab. Eine Zeit mit Versatz wie `+02:00` ist ungültig. In der Stunde der Rückstellung auf Normalzeit ist eine Wanduhrzeit mehrdeutig; das Format unterscheidet die beiden Stunden nicht.

Drei Zeitarten bleiben getrennt: der Datenstand des Istzustands (`stand` in jedem Block), die Prognose zum Datenstand und die Planwerte aus der Vorsorge. Kein Datenstand liegt nach `meldezeitpunkt`.

## Schritt 5: Messwerte und Leerwerte

Zählbare Angaben sind Messwerte mit `wert`, `einheit`, `status`, `stand` und optional `quelle` und `hinweis`. Der Status unterscheidet gezählte (`belegt`), hochgerechnete (`geschaetzt`), nicht feststellbare (`unbekannt`) und nicht einschlägige (`nicht_zutreffend`) Werte; bei den letzten beiden ist `wert` = `null`. Personen werden nie als „belegt“ aus Anschlüssen hochgerechnet.

Für alle übrigen Felder gilt: Ein Pflichtfeld fehlt nie. Ist eine Angabe geprüft, aber nicht feststellbar, steht ein leerer Text oder der Wert „unbekannt“, wo die Feldreferenz ihn vorsieht. Optionale Felder ohne Angabe lässt die Schnittstelle weg. Felder, die die Feldreferenz nicht nennt, sind nicht zulässig; eigene Zusatzfelder des BCM-Systems gehören nicht in die Meldung.

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

Das Schema prüft Struktur, zulässige Werte und Rollen, nicht die sachliche Richtigkeit. Weitere Regeln prüft das Werkzeug des Repositorys (`npm run pruefen -- <datei.json|ordner>`): Plausibilität P1 bis P10, etwa Prognosefenster, Reichweite mit Bedingung und Datenstände vor dem Meldezeitpunkt, und über einen Satz von Meldungen die Nachrichtenidentität I1 bis I5. Die Regeln beschreibt [MELDEPROFIL.md](MELDEPROFIL.md); das Modul `werkzeuge/pruefen/plausibilitaet.mjs` hat keine Abhängigkeiten und lässt sich in eine eigene Schnittstelle übernehmen.

## Schritt 7: Mit den Konformitätsfällen testen

[konformitaet/faelle.json](../konformitaet/faelle.json) nennt für jede Datei, ob sie gültig ist, und bei ungültigen Fällen Regel und Pfad. Eine Schnittstelle besteht, wenn

1. ihre Ausgabe für die Lagen des Szenarios gültig ist und ohne Fehler durch `npm run pruefen` läuft,
2. ihr Prüfschritt alle Negativfälle aus `konformitaet/negativ/` zurückweist und
3. ein Satz aus Erst-, Folge- und Abschlussmeldung zum selben Vorfall die Nachrichtenidentität wahrt (gleiche Sachverhaltskennung, neue Meldungs-ID, Bezug auf die Vormeldung).

Das Szenario Orkantief „Ilka“ im Landkreis Sonneberg eignet sich als Testdatensatz: Die Lagekarten in [erprobung/einspielungen/](../erprobung/einspielungen/README.md) beschreiben die Lage ohne fertige Meldung.

## Wenn sich das Format ändert

Jede Fassung hat eine eigene Schemakennung im Feld `schema`; eine Meldung mit veralteter Kennung ist ungültig. Änderungen stehen im [Änderungsverlauf](../CHANGELOG.md). Eine Schnittstelle, die das Schema aus dieser Quelle bezieht und ihre Ausgabe damit prüft, bemerkt eine neue Fassung beim nächsten Lauf; die Zuordnungstabelle lässt sich mit einem Abgleich der neuen [felder.csv](../schnittstelle/felder.csv) nachführen.

## Quellen

Bundesamt für Sicherheit in der Informationstechnik (2023): BSI-Standard 200-4 Business Continuity Management. Online abrufbar unter: https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Grundschutz/BSI_Standards/standard_200_4.pdf [Zugriff: 31.10.2026]
