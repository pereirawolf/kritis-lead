# KRITIS-LEAD nach LEAD-Meldung-v2

Dieser Ordner enthält das Meldungsformat von KRITIS-LEAD nach [LEAD-Meldung-v2](https://github.com/pereirawolf/ki-lead/blob/main/docs/LEAD-MELDUNG-V2.md) (Formatfassung 2.0, Entwurf). Er ersetzt schrittweise das Profilschema `LEAD-KRITIS-Meldung-v0.2` (Erweiterung `lead-kritis/0.2` auf `LEAD-Meldung-v1`). Bis zur Umstellung des Profilpakets `profil/lead-kritis` (Meilenstein M4, nach der Umstellung der Profile in KI-LEAD) gelten dort weiter v0.2 und v1; Betreibermeldungen nach v2 liest KI-LEAD seit 0.7.0 als Eingang.

| Datei | Inhalt |
|---|---|
| `module/lead-kritis-meldung.schema.json` | Meldungsmodul `lead-kritis-meldung` 0.3 unter `module` der Meldung: Meldeart, Meldeanlass, Datenart, Vertraulichkeit, Empfänger, parallele Pflichtmeldungen |
| `module/lead-kritis-betrieb.schema.json` | Fachmodul `lead-kritis-betrieb` 0.3 unter `sachverhalte[].module`: Betreiber, Sektor, kritische Dienstleistung, Istzustand, Verweise auf Kennzahlen, Ersatzverfahren, Prognose, Unterstützungsbedarf, BCM, Abhängigkeiten, Ursache, Bestätigungsgrad |
| `zusammenstellung.json` | Zusammenstellung (`lead-meldung-v2-zusammenstellung/1`): Kern und Modul `lead-bevoelkerungsschutz` aus den gepinnten Kopien in `kern/lead-meldung-v2/`, dazu die beiden Module |
| `rollenregeln.json` | Rollenregeln R1-betreiber, R2-behoerde, R3-bezug |
| `meldung.schema.json` | gebautes Schema, nicht von Hand bearbeiten |
| `beispiele/betreiber-minimal.json` | kleinste gültige Betreibermeldung (FIKTIV) |

Die Modulschemata liegen hier (Hoheit des Fachprojekts); KI-LEAD bettet sie als Kopie mit Herkunft und Prüfsumme ein (`formate/fremd/kritis-lead/` in KI-LEAD). Ob die Einbettung aktuell ist, meldet der Pin-Wächter (`npm run pin-abstand`).

## Bau

`npm run bauen` erzeugt `meldung.schema.json` mit dem Werkzeug von KI-LEAD am gepinnten Stand (`src/kern/meldung-v2.js`, Funktion `stelleSchemaZusammen`) und hängt die Rollenregeln an. Dafür muss ein Klon von KI-LEAD am Commit aus `kern/quelle.json` unter `ki-lead-pin/` liegen oder `KI_LEAD_DIR` auf ihn zeigen; die CI holt ihn selbst. `tests/lead-meldung-v2.test.mjs` prüft, dass das Schema aktuell ist und der Prüfer von KI-LEAD wie Ajv urteilt.

## Abbildung des Datenmodells K2

| bisher (lead-kritis/0.2) | LEAD-Meldung-v2 |
|---|---|
| `kritis.meldung_id` (`urn:uuid:…`) | `meldung_id` (UUID in Kleinbuchstaben, ohne `urn:uuid:`) |
| `kritis.bezug_meldung_id` | `beziehungen[{art, meldung_id}]`: Folge- und Abschlussmeldung `fortschreibung_von`, Korrekturmeldung `berichtigung_von` |
| `kritis.rolle` | `absender.ebene` („Betreiber“; Behörden mit ihrer Ebene) |
| übrige Angaben in `kritis` | Meldungsmodul `lead-kritis-meldung` |
| `zeitzone` | Kernfeld `zeitzone` |
| Block `betrieb` | Modul `lead-kritis-betrieb`, ohne die Angaben, die der Kern trägt: |
| `betrieb.raum.ars`, `.beschreibung` | `raum.gebiete[].schluessel`, `raum.beschreibung`; `anteil_gebiet_prozent` bleibt im Modul |
| `betrieb.ist.beginn` | `eintritt {zeit, genauigkeit}` |
| Messwerte (`ist.betroffene.anschluesse`, `.personen`, Sektor-Messwerte) | `kennzahlen[]` des Sachverhalts; das Modul verweist unter `kennzahlen` je Rolle auf die ID, `"nicht_zutreffend"` oder `null` (unbekannt, ohne Kennzahl) |
| `quelle` an Messwerten, BCM-Planung | Quellenverzeichnis `quellen[]`, Verweise als IDs |
| Wanduhrzeiten | Zeitpunkte mit UTC-Versatz, Kalendertage, `null` für unbekannt |
| `""` in Auswahlfeldern | Feld fehlt (nicht angegeben) |
| `sofort` (Beurteilung, Tendenz, Radar leer) | kein Block `bewertung` (seit KI-LEAD 0.7.8, KL-2026-W45-01); kein Modul `lead-bevoelkerungsschutz` |

## Rollenregeln

| Regel | Inhalt |
|---|---|
| R1-betreiber | `absender.ebene` „Betreiber“: Meldungsmodul `lead-kritis-meldung`; mindestens ein Sachverhalt, jeder mit Modul `lead-kritis-betrieb`, ohne Modul `lead-bevoelkerungsschutz`; Kennung `KRITIS-<Kürzel>-JJJJMMTT-<Zufall>` (Kürzel 1 bis 3 Segmente aus A–Z und 0–9, je höchstens 8 Zeichen; Zufallsteil Crockford-Base32, neu vergeben 6 Zeichen; im Entwurf auch leer); eine angegebene Bewertung ohne Beurteilungsstufe und Tendenzrichtung |
| R2-behoerde | jede andere Ebene: kein Modul `lead-kritis-betrieb`; Bezug auf Betreiber-Sachverhalte über `bezug` (Zuordnung von oben) |
| R3-bezug | Folge- und Abschlussmeldung mit `fortschreibung_von`, Korrekturmeldung mit `berichtigung_von`, Erstmeldung ohne `beziehungen` |

R4-zeitzone der Erweiterung 0.2 entfällt: Der Kern verlangt die Zeitzone in jeder Meldung.
