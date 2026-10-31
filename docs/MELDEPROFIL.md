# Meldeprofil LEAD-KRITIS-Meldung v0.1

Das Profilschema `LEAD-KRITIS-Meldung-v0.1` übernimmt das Kernschema **LEAD-Meldung-v1** aus [KI-LEAD](https://github.com/pereirawolf/ki-lead) unverändert (gepinnt in `kern/`) und ergänzt die Erweiterung **lead-kritis/0.1**:

- `zeitzone` und der Meldekopf `kritis` auf Meldungsebene,
- der Block `betrieb` je Sachverhalt,
- vier Rollenregeln.

Gebaut wird es mit `npm run bauen` nach `profil/lead-kritis/meldung.schema.json`. Die Quellen stehen in `erweiterung/lead-kritis.defs.json` und `erweiterung/rollenregeln.json`; die gebaute Datei wird nicht von Hand bearbeitet.

Das Schema prüft Struktur, zulässige Werte und Rollen. Ob eine Angabe sachlich stimmt, prüft es nicht.

## Zwei Meldungsarten, ein Schema

| | Betreibermeldung | Behördenmeldung |
|---|---|---|
| Schemakennung | `LEAD-KRITIS-Meldung-v0.1` | `LEAD-KRITIS-Meldung-v0.1` oder unverändert `LEAD-Meldung-v1` |
| Meldekopf `kritis` | Pflicht, `rolle` = Betreiber | optional, `rolle` = Behörde |
| Block `betrieb` je Sachverhalt | Pflicht | nicht zulässig; Bezug über `bezug` auf die Kennung der Betreibermeldung |
| Beurteilung, Tendenz, Lagenradar | leer bzw. `null` | für den eigenen Referenzraum |
| Quellenkategorie im Lagebild | B | A |

Eine Meldung nach `LEAD-Meldung-v1` wird vor der Prüfung nur in ihrer Schemakennung umgestellt (wie die Migrationsregel des Profilpakets in KI-LEAD); ihr Inhalt bleibt unverändert und ist gültig, weil die Erweiterung nur optionale Felder hinzufügt.

## Rollenregeln

| Regel | Inhalt |
|---|---|
| R1-betreiber | Betreibermeldung: `zeitzone` Pflicht; jeder Sachverhalt mit `kennung` und `betrieb`; `beurteilung` und `tendenz` leer, alle Radarachsen `null` |
| R2-behoerde | ohne Meldekopf oder mit Rolle Behörde: kein `betrieb` |
| R3-bezug | Folge-, Korrektur- und Abschlussmeldung nennen `bezug_meldung_id`; eine Erstmeldung lässt sie leer |
| R4-zeitzone | jede Meldung mit Meldekopf nennt die Zeitzone |

## Leerwerte

| Zustand | Bedeutung | Ausdruck |
|---|---|---|
| fehlend | nicht erhoben | Feld fehlt; bei Pflichtfeldern ein Fehler |
| unbekannt | geprüft, nicht feststellbar | Messwert: `wert: null`, `status: "unbekannt"`; Text oder Auswahl: `""` |
| nicht zutreffend | für diese Dienstleistung nicht einschlägig | Messwert: `wert: null`, `status: "nicht_zutreffend"` |
| geschätzt | hochgerechnet, nicht gezählt | Messwert mit Zahl, `status: "geschaetzt"`, Methode in `hinweis` |

Zeiten sind Wanduhrzeiten `JJJJ-MM-TTThh:mm` in der Zeitzone der Meldung, wie im Kernschema.

## Feldkatalog: Meldekopf `kritis`

| Feld | Pflicht | Zweck | Werte |
|---|---|---|---|
| `erweiterung` | ja | Fassung der Erweiterung | `lead-kritis/0.1` |
| `rolle` | ja | Herkunftsrolle der meldenden Stelle | Betreiber, Behörde |
| `meldeart` | ja | Stellung im Meldeverlauf | Erstmeldung, Folgemeldung, Korrekturmeldung, Abschlussmeldung |
| `meldeanlass` | ja | Anlass, mehrfach möglich | drohende Beeinträchtigung, eingetretene Einschränkung, wesentliche Änderung, verkürzte Reichweite eines Ersatzverfahrens, neuer Unterstützungsbedarf, Zielzustand erreicht, Übung |
| `meldung_id` | ja | Identität dieser Nachricht; jede Meldung erhält eine neue | `urn:uuid:…` (Kleinbuchstaben) |
| `bezug_meldung_id` | nach R3 | Meldung, die fortgeschrieben, berichtigt oder abgeschlossen wird | `urn:uuid:…` oder leer |
| `datenart` | ja | Schutz gegen Echtdaten im Demonstrator | `synthetisch` |
| `vertraulichkeit.tlp` | ja | Kennzeichnung nach TLP 2.0 | im Demonstrator nur `CLEAR` |
| `vertraulichkeit.einstufung` | nein | staatliche Einstufung, getrennt von TLP | im Demonstrator leer |
| `empfaenger` | ja | vorgesehene Empfänger | Texte |
| `gemeldet_an` | ja | parallele Pflichtmeldungen, nur dokumentiert | Stelle, Rechtsgrundlage, Status (erfolgt, geplant, nicht_erforderlich, unbekannt), Zeitpunkt, Kennzeichen; leere Liste = keine dokumentiert |
| `rechtsgrundlage_dieser_meldung` | nein | Grundlage des Beitrags | im Demonstrator „Fiktive Übung …“ |
| `kontaktstelle` | nein | Funktionsadresse, keine Person | Text |

## Feldkatalog: Block `betrieb` je Sachverhalt

| Feld | Pflicht | Zweck | Einheit, Werte, Regel |
|---|---|---|---|
| `betreiber.name`, `.traegerschaft` | Name | wer meldet | öffentlich, privat, gemischt |
| `sektor` | ja | Einordnung nach § 4 Abs. 1 KRITISDachG | zehn Sektoren; sagt nichts über eine Einstufung als kritische Anlage |
| `kritische_dienstleistung` | ja | Funktionsprofil SOP B12: Dienstleistung | Text |
| `anlage` | nein | betroffene Anlage | Bezeichnung, Kennung des Betreibers |
| `raum.ars` | ja | betroffener Raum | Regionalschlüssel, 2, 3, 5, 9 oder 12 Stellen |
| `raum.beschreibung`, `.anteil_gebiet_prozent` | Beschreibung | Versorgungsgebiet folgt keinen Verwaltungsgrenzen | Prozent 0–100 oder `null` |
| `ist.stand` | ja | Datenstand des Istzustands | Wanduhrzeit |
| `ist.leistungsgrad` | ja | tatsächlicher Leistungsgrad | voll, eingeschraenkt, notbetrieb, ausgefallen, unbekannt |
| `ist.leistungsgrad_prozent`, `.leistungsbasis` | nein | Leistungsgrad als Zahl | Prozent; mit Zahl ist `leistungsbasis` Pflicht |
| `ist.beginn` | ja | Ausfallbeginn | Wanduhrzeit oder leer |
| `ist.betroffene.anschluesse`, `.personen` | ja | Betroffene getrennt nach Einheit | Messwert; Personen nie als „belegt“ aus Anschlüssen |
| `ist.betroffene.einrichtungen` | nein | Einrichtungen mit besonderem Bedarf | Texte |
| `ist.eskalationsstufe_betrieblich` | nein | betriebliche Einstufung | Störung, Notfall, Krise; nie eine LEAD-Beurteilung |
| `ersatzverfahren[]` | ja (Liste) | Tragfähigkeit von Ausweichlösungen | Status (vorhanden, betriebsbereit, eingesetzt, wirksam, nicht_vorhanden, unbekannt), getragener Leistungsgrad, `reichweite_bis`, `bedingung`, `stand`; eine Nennlaufzeit ist keine Reichweite |
| `prognose` | ja | Wiederanlauf | Status (prognose, keine_prognose_moeglich, zielzustand_erreicht); bei „prognose“ Geber und Zielzustand Pflicht; frühestens, spätestens, Unsicherheit, Begründung |
| `bcm.reifegrad` | nein | Selbstauskunft | kein Prüfkriterium |
| `bcm.planung` | nein | Planwerte aus der Vorsorge | MTA, RTO (Stunden), Notbetriebsniveau (Prozent); jeder Planwert mit Zeitanker und Zielzustand; keine Zusage, keine Prognose |
| `abhaengigkeiten[]` | nein | eingehende und ausgehende Kopplungen | Dienstleistung, Richtung, Zustand, Puffer, betroffene Stelle |
| `unterstuetzungsbedarf[]` | ja (Liste) | externer Bedarf | Leistung, Menge, bis, Adressat, Status (geplant, angefordert, zugesagt, gedeckt, entfallen) |
| `ursache` | nein | vorläufige Ursache | Kurztext, Status (vorläufig, bestätigt, unbekannt) |
| `bestaetigungsgrad` | ja | Belastbarkeit der Angaben | bestätigt, vorläufige Eigenangabe, indirekt berichtet, widersprüchlich |
| `sektor_angaben` | nein | Angaben für die Szenariosektoren | energie, wasser, telekommunikation, gesundheit; nie Pflicht |

Messwert: `wert` (Zahl oder `null`), `einheit`, `status` (belegt, geschaetzt, unbekannt, nicht_zutreffend), `stand`, `quelle`, `hinweis`. Bei „belegt“ und „geschaetzt“ ist `wert` eine Zahl, sonst `null`.

Übermittelt werden Kenngrößen, keine Pläne: keine Inhalte aus Business-Impact-Analysen, Notfallplänen, Netzplänen oder Alarmierungslisten.

## Prüfung

```
npm run pruefen -- <datei.json|ordner>   # Schema, Rollenregeln, Nachrichtenidentität
npm run bauen                            # Schema und abgeleitete Konformitätsfälle neu erzeugen
npm test                                 # Bau, Metaschema, Schlüsselwörter, Konformitätsfälle
KI_LEAD_DIR=<Klon von ki-lead> npm test  # zusätzlich der zweite Prüfweg mit dem Prüfer von KI-LEAD
```

Zwei Prüfwege urteilen über dieselben Fälle: Ajv als Referenzprüfer und der Schemaprüfer von KI-LEAD am gepinnten Commit. Das Schema nutzt nur Schlüsselwörter, die der KI-LEAD-Prüfer auswertet, und kein `format`.

Über einen Satz von Meldungen prüft das Werkzeug die Nachrichtenidentität:

- **I1:** gleiche `meldung_id` mit gleichem Inhalt wird einmal geführt; mit anderem Inhalt ist es ein Konflikt.
- **I2:** ein Bezug, der im Satz fehlt, ist ein Hinweis.
- **I3, I4, I5:** Warnungen bei einem Bezug auf eine andere Stelle, auf eine jüngere Meldung oder ohne fortgeschriebene Sachverhaltskennung.

## Konformitätsfälle

`konformitaet/faelle.json` nennt für jede Datei die Erwartung, bei ungültigen Fällen auch Regel und Pfad. Gültige Fälle sind die von Hand geschriebenen Meldungen des Szenarios Orkantief „Ilka“ im Landkreis Sonneberg ([szenario/orkantief-ilka-sonneberg](../szenario/orkantief-ilka-sonneberg/LIESMICH.md)); das ganze Szenario ist zugleich ein Satz für die Nachrichtenidentität. Die Negativfälle (`konformitaet/negativ/`) und weiteren Sätze (`konformitaet/identitaet/`) erzeugt `werkzeuge/bauen/faelle-erzeugen.mjs` aus Szenariomeldungen. Alle Fälle sind fiktiv; reale Kreisnamen und Schlüssel dienen nur als Raumbezug.
