# Meldeprofil KRITIS-LEAD nach LEAD-Meldung-v2

KRITIS-LEAD meldet nach **LEAD-Meldung-v2** (Formatfassung 2.0, Entwurf) aus [KI-LEAD](https://github.com/pereirawolf/ki-lead): Kernschema und Modul `lead-bevoelkerungsschutz` unverändert (gepinnt in `kern/lead-meldung-v2/`), dazu zwei Module von KRITIS-LEAD:

- das **Meldungsmodul** `lead-kritis-meldung` 0.3 unter `module` der Meldung (Meldeart, Meldeanlass, Vertraulichkeit, Empfänger, parallele Pflichtmeldungen),
- das **Fachmodul** `lead-kritis-betrieb` 0.3 unter `sachverhalte[].module` (Betreiberangaben je Sachverhalt),
- drei Rollenregeln.

Das Schema setzt `npm run bauen` mit dem Werkzeug von KI-LEAD aus der Zusammenstellung zusammen ([formate/lead-kritis-v2/](../formate/lead-kritis-v2/README.md)); die gebaute Datei `formate/lead-kritis-v2/meldung.schema.json` wird nicht von Hand bearbeitet. Nach diesem Schema arbeiten Betreiberformular, Schnittstellenbeschreibung, Prüfwerkzeug und Erprobungsunterlagen. Das Profilpaket `profil/lead-kritis` folgt bis zum Abschluss von Meilenstein M4 noch dem Profilschema `LEAD-KRITIS-Meldung-v0.2`.

Das Schema prüft Struktur, zulässige Werte und Rollen. Ob eine Angabe sachlich stimmt, prüft es nicht.

## Zwei Meldungsarten, ein Schema

| | Betreibermeldung | Behördenmeldung |
|---|---|---|
| Schemakennung | `LEAD-Meldung-v2` | `LEAD-Meldung-v2` |
| `absender.ebene` | Betreiber | jede andere Ebene des Kerns (Bund, Land, Kreis, Gemeinde, Einsatzstelle, Sonstige) |
| Meldungsmodul `lead-kritis-meldung` | Pflicht | optional |
| Modul `lead-kritis-betrieb` je Sachverhalt | Pflicht | nicht zulässig; Bezug über `bezug` auf die Kennung des Betreiber-Sachverhalts |
| Bewertung (`bewertung`), Modul `lead-bevoelkerungsschutz` (Ereignisarten, Lagenradar) | keine Beurteilungsstufe, keine Tendenzrichtung, kein Lagenradar; der Block `bewertung` entfällt in der Regel | für den eigenen Referenzraum |
| Sachverhaltskennung | `KRITIS-<Kürzel>-JJJJMMTT-<Zufall>` | nach Kodierleitfaden, etwa `DE-TH-…` |
| Quellenkategorie im Lagebild | B | A |

## Rollenregeln

| Regel | Inhalt |
|---|---|
| R1-betreiber | `absender.ebene` „Betreiber“: Meldungsmodul `lead-kritis-meldung`; mindestens ein Sachverhalt, jeder mit Modul `lead-kritis-betrieb` und ohne Modul `lead-bevoelkerungsschutz`; Kennung mit Präfix `KRITIS-` (Kürzel 1 bis 3 Segmente aus A–Z und 0–9, je höchstens 8 Zeichen; Zufallsteil Crockford-Base32, neu vergeben 6 Zeichen; im Entwurf auch leer); eine angegebene Bewertung ohne Beurteilungsstufe und Tendenzrichtung |
| R2-behoerde | jede andere Ebene: kein Modul `lead-kritis-betrieb` |
| R3-bezug | Folge- und Abschlussmeldung mit `beziehungen` `fortschreibung_von`, Korrekturmeldung mit `berichtigung_von`, Erstmeldung ohne `beziehungen` |

## Leerwerte, Zeiten, Zahlen

Wie im Kern von LEAD-Meldung-v2 ([LEAD-MELDUNG-V2.md](https://github.com/pereirawolf/ki-lead/blob/main/docs/LEAD-MELDUNG-V2.md), Abschnitt 1):

| Zustand | Ausdruck |
|---|---|
| nicht angegeben | Feld fehlt; bei Pflichtfeldern ein Fehler |
| unbekannt | `null`, wo das Schema es zulässt; bei Zahlen des Moduls Verweis `null` ohne Kennzahl |
| nicht zutreffend | bei Zahlen des Moduls `"nicht_zutreffend"` |
| geschätzt | Kennzahl mit `erhebung` „geschaetzt“ oder „hochgerechnet“ |

Zeitpunkte tragen den UTC-Versatz (`2026-10-14T06:30+02:00`), Kalendertage stehen als `JJJJ-MM-TT` und gelten in der `zeitzone` der Meldung. Zahlen stehen als Kennzahlen im Kern (`sachverhalte[].kennzahlen[]` mit Gegenstand, Einheit, Art, Wert, Erhebung und Datenstand); das Modul verweist je Rolle auf ihre ID.

## Feldkatalog: Meldungsmodul `lead-kritis-meldung`

Der Feldkatalog erläutert Zweck und Regeln der Felder. Die vollständige, aus dem Schema erzeugte Liste aller Felder mit Typen und zulässigen Werten steht in [schnittstelle/FELDREFERENZ.md](../schnittstelle/FELDREFERENZ.md); wie ein BCM-System Meldungen in diesem Format erzeugt, beschreibt [SCHNITTSTELLE.md](SCHNITTSTELLE.md). Identität, Absender, Meldezeitpunkt, Zeitzone, Quellen und Freigabe stehen im Kern.

| Feld | Pflicht | Zweck | Werte |
|---|---|---|---|
| `fassung` | ja | Fassung des Moduls | `0.3` |
| `meldeart` | ja | Stellung im Meldeverlauf | Erstmeldung, Folgemeldung, Korrekturmeldung, Abschlussmeldung; die Vormeldung nennen `beziehungen` im Kern (R3) |
| `meldeanlass` | ja | Anlass, mehrfach möglich | drohende Beeinträchtigung, eingetretene Einschränkung, wesentliche Änderung, verkürzte Reichweite eines Ersatzverfahrens, neuer Unterstützungsbedarf, Zielzustand erreicht, Übung |
| `datenart` | ja | Schutz gegen Echtdaten im Demonstrator | `synthetisch` |
| `vertraulichkeit.tlp` | ja | Kennzeichnung nach TLP 2.0 | im Demonstrator nur `CLEAR` |
| `vertraulichkeit.einstufung`, `.hinweis` | nein | staatliche Einstufung getrennt von TLP; Hinweis | im Demonstrator ohne Einstufung |
| `empfaenger` | ja | vorgesehene Empfänger | Texte |
| `gemeldet_an` | ja | parallele Pflichtmeldungen, nur dokumentiert | Stelle, Rechtsgrundlage, Status (erfolgt, geplant, nicht_erforderlich, unbekannt), Zeitpunkt, Kennzeichen; leere Liste = keine dokumentiert |
| `rechtsgrundlage_dieser_meldung` | nein | Grundlage des Beitrags | im Demonstrator „Fiktive Übung …“ |
| `kontaktstelle` | nein | Funktionsadresse, keine Person | Text |

## Feldkatalog: Modul `lead-kritis-betrieb` je Sachverhalt

Raum (`raum.beschreibung`, `raum.gebiete[]`), Eintritt (`eintritt {zeit, genauigkeit}`), Lage (`analyse`), Maßnahmen und Fristen (`handlungsbedarf`), Kennzahlen und Zeitstrahl stehen im Kern des Sachverhalts.

| Feld | Pflicht | Zweck | Einheit, Werte, Regel |
|---|---|---|---|
| `fassung` | ja | Fassung des Moduls | `0.3` |
| `betreiber.name`, `.traegerschaft` | Name | wer meldet | öffentlich, privat, gemischt |
| `sektor` | ja | Einordnung nach § 4 Abs. 1 KRITISDachG | zehn Sektoren; sagt nichts über eine Einstufung als kritische Anlage |
| `kritische_dienstleistung` | ja | Funktionsprofil SOP B12: Dienstleistung | Text |
| `anlage` | nein | betroffene Anlage | Bezeichnung, Kennung des Betreibers |
| `anteil_gebiet_prozent` | nein | Versorgungsgebiet folgt keinen Verwaltungsgrenzen | Prozent 0–100 oder `null` |
| `ist.stand` | ja | Datenstand des Istzustands | Zeitpunkt |
| `ist.leistungsgrad` | ja | tatsächlicher Leistungsgrad | voll, eingeschraenkt, notbetrieb, ausgefallen, unbekannt |
| `ist.leistungsgrad_prozent`, `.leistungsbasis` | nein | Leistungsgrad als Zahl | Prozent; mit Zahl ist `leistungsbasis` Pflicht |
| `ist.einrichtungen` | nein | Einrichtungen mit besonderem Bedarf | Texte |
| `ist.eskalationsstufe_betrieblich` | nein | aktuelle betriebliche Einstufung | keine, Störung, Notfall, Krise, ungeklärt; Stufen nach BSI-Standard 200-4 (S. 20–21): Beherrschbarkeit, Zeitkritikalität und Eignung der Pläne, keine Stunden- oder Prozentgrenzen; nie eine LEAD-Beurteilung |
| `kennzahlen` | ja | Verweise je Rolle auf `sachverhalte[].kennzahlen[].id` | Pflicht: `betroffene_anschluesse`, `betroffene_personen`; optional wiederversorgte Anschlüsse, ausgefallene Standorte, Standorte mit Netzersatz, betreibbare Betten, Verlegungsbedarf. Wert: ID, `"nicht_zutreffend"` oder `null` (unbekannt). Personen nie als gezählt aus Anschlüssen |
| `kennzahlen_hinweise` | nein | Erläuterung je Rolle | Text, etwa warum eine Größe unbekannt ist |
| `ersatzverfahren[]` | ja (Liste) | Tragfähigkeit von Ausweichlösungen | Status (vorhanden, betriebsbereit, eingesetzt, wirksam, nicht_vorhanden, unbekannt), getragener Leistungsgrad, `reichweite_bis`, `bedingung`, `stand`; eine Nennlaufzeit ist keine Reichweite |
| `prognose` | ja | Wiederanlauf | Status (prognose, keine_prognose_moeglich, zielzustand_erreicht); bei „prognose“ Geber und Zielzustand Pflicht; frühestens, spätestens, Unsicherheit, Begründung |
| `bcm.umsetzungsstand` | nein | BCMS-Stufe (Selbstauskunft) | kein formalisiertes BCMS, Reaktiv-, Aufbau-, Standard-BCMS, anderes BCMS (BSI-Standard 200-4, S. 42–44); kein Prüfkriterium |
| `bcm.notfallplaene`, `.standardbezug`, `.zertifizierung` | nein | getrennt erfasst | Notfallpläne vorhanden oder nicht; Orientierung an BSI-Standard 200-4 und/oder ISO 22301; Zertifizierung |
| `bcm.planung` | nein | Planwerte aus der Vorsorge für einen benannten Geschäftsprozess oder eine Ressource (`bezug`) | `mtpd_stunden`: maximal tolerierbare Ausfallzeit, ab Ausfallbeginn; `rto_stunden`: geforderte Wiederanlaufzeit, ab Ausrufen des Notfalls bis zum Notbetriebsniveau; `notbetriebsniveau` (MBCO): Beschreibung, optional Prozent mit Bezugsgröße; `grundlage` (200-4, 100-4, ISO 22301, eigene Festlegung); Belege als Quellen-IDs, Stand des Dokuments; mit einem Planwert sind `bezug` und `grundlage` Pflicht; keine Zusage, keine Prognose |
| `abhaengigkeiten[]` | nein | eingehende und ausgehende Kopplungen | Dienstleistung, Richtung, Zustand, Puffer, betroffene Stelle |
| `unterstuetzungsbedarf[]` | ja (Liste) | externer Bedarf | Leistung, Menge, bis, Adressat, Status (geplant, angefordert, zugesagt, gedeckt, entfallen) |
| `ursache` | nein | vorläufige Ursache | Kurztext, Status (vorläufig, bestätigt, unbekannt) |
| `bestaetigungsgrad` | ja | Belastbarkeit der Angaben | bestätigt, vorläufige Eigenangabe, indirekt berichtet, widersprüchlich |
| `einschaetzung` | nein | betriebliche Einschätzung in einem Satz | keine Beurteilung, Tendenz oder Kodierung |
| `folgemeldung_bei` | nein | Anlässe für die nächste Meldung | Texte (bisher Kennsatz „Neubewertung bei:“) |
| `aenderung_zur_vormeldung` | nein | wesentliche Änderung gegenüber der Vormeldung | bei Folge- und Korrekturmeldungen erwartet (P6) |
| `abschluss` | nein | Abschluss aus Sicht des Betreibers | Ergebnis, offene Punkte, Nachsorge; bei Abschlussmeldungen erwartet (P7) |
| `sektor_angaben` | nein | qualitative Angaben für die Szenariosektoren | energie (Netzebene), wasser (betroffene Druckzonen, Abkochgebot), telekommunikation (Notruf); nie Pflicht |

Übermittelt werden Kenngrößen, keine Pläne: keine Inhalte aus Business-Impact-Analysen, Notfallplänen, Netzplänen oder Alarmierungslisten.

BCM-Begriffe nach BSI-Standard 200-4 (BSI, 2023, S. 159–160): Die RTO muss kleiner sein als die MTPD, abzüglich der Reaktionszeit bis zum Ausrufen des Notfalls; die Zeitanker beider Werte unterscheiden sich. Eine Wiederanlaufzeit (WAZ) nach dem Vorgänger BSI-Standard 100-4 schließt Erkennung und Reaktion ein (BSI, 2008, S. 40–41) und wird deshalb nicht unverändert als RTO übernommen; `grundlage` hält fest, nach welchem Standard ein Wert festgelegt ist. Das Wiederanlaufniveau aus 100-4 heißt in 200-4 Notbetriebsniveau.

## Prüfung

```
npm run pruefen -- <datei.json|ordner>   # Schema, Rollenregeln, Plausibilität, Nachrichtenidentität
npm run bauen                            # Schema und abgeleitete Dateien neu erzeugen
npm test                                 # Bau, Metaschema, Schlüsselwörter, Konformitätsfälle
KI_LEAD_DIR=<Klon von ki-lead> npm test  # zusätzlich der zweite Prüfweg mit dem Prüfer von KI-LEAD
```

`npm run pruefen:v2` ist gleichbedeutend und bleibt für Schnittstellen und Anleitungen erhalten, die es nennen.

Zwei Prüfwege urteilen über dieselben Fälle: Ajv als Referenzprüfer und der Schemaprüfer von KI-LEAD am gepinnten Commit, dazu die Referenzprüfung von KI-LEAD (Prüfebene 2). Das Schema nutzt nur Schlüsselwörter, die der KI-LEAD-Prüfer auswertet, und kein `format`.

Bei schemagültigen Meldungen prüft das Werkzeug die Plausibilität P1 bis P11 (`werkzeuge/pruefen/v2/plausibilitaet.mjs`, dasselbe Modul im Betreiberformular), über einen Satz von Meldungen die Nachrichtenidentität I1 bis I5 über `meldung_id` und `beziehungen`. Die Regeln stehen in [formate/lead-kritis-v2/README.md](../formate/lead-kritis-v2/README.md).

## Konformitätsfälle

[formate/lead-kritis-v2/konformitaet/faelle.json](../formate/lead-kritis-v2/konformitaet/faelle.json) nennt für jede Datei die Erwartung, bei ungültigen Fällen auch Regel und Pfad. Gültige Fälle sind die Meldungen des Szenarios Orkantief „Ilka“ im Landkreis Sonneberg ([LIESMICH](../formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg/LIESMICH.md)); das ganze Szenario ist zugleich ein Satz für die Nachrichtenidentität. Negativfälle, Plausibilitätsfälle und weitere Sätze erzeugt `werkzeuge/bauen/faelle-v2-erzeugen.mjs` aus Szenariomeldungen. Alle Fälle sind fiktiv; reale Kreisnamen und Schlüssel dienen nur als Raumbezug.

## Quellen

Bundesamt für Sicherheit in der Informationstechnik (2008): BSI-Standard 100-4 Notfallmanagement, Version 1.0. Online abrufbar unter: https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Publikationen/ITGrundschutzstandards/BSI-Standard_1004.pdf [Zugriff: 31.10.2026]

Bundesamt für Sicherheit in der Informationstechnik (2023): BSI-Standard 200-4 Business Continuity Management. Online abrufbar unter: https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Grundschutz/BSI_Standards/standard_200_4.pdf [Zugriff: 31.10.2026]
