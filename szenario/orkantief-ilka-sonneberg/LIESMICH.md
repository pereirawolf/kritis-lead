# Szenario Orkantief „Ilka“ – Landkreis Sonneberg (FIKTIV)

Alle Dateien in diesem Ordner beschreiben eine **erfundene Lage**. Das Orkantief „Ilka“ hat es nicht gegeben. Keine Meldung stammt von den genannten Stellen. Betreiber tragen allgemeine Namen; Behörden und Orte sind nur als Raumbezug genannt und als Übungsrolle gekennzeichnet. Jede Datei, jede Stelle und jeder Sachverhalt trägt den Vermerk „FIKTIV“.

## Bezug zu KI-LEAD

Das Szenario ergänzt den fiktiven Datensatz Orkantief „Ilka“ aus [KI-LEAD](https://github.com/pereirawolf/ki-lead) (`profile/lead-beispiel/beispiele/orkantief-ilka`, gepinnter Stand in `kern/quelle.json`) um die Ebene darunter. Die Thüringer Ländermeldung dort enthält den Sachverhalt `DE-TH-20261014-P5VN` („Stromausfall im Landkreis Sonneberg nach Mastschäden“, Meldung vom 14.10.2026, 10:30 Uhr). Er stützt sich auf Betreiberangaben und eine Lagemeldung des Landkreises, die dort nur als Quellen genannt sind. Dieser Ordner liefert sie als eigene Meldungen:

| Quelle in der Thüringer Ilka-Meldung | Meldung in diesem Szenario |
|---|---|
| [Q3] Landratsamt Sonneberg, Krisenstab: Lagemeldung Nr. 4, Datenstand 14.10., 08:00 | `07_krisenstab_…_lagemeldung-nr-4.json` (LEAD-Meldung-v1, unverändertes Kernschema) |
| [Q4] Verteilnetzbetreiber Netzgebiet Südthüringen: Störungsübersicht und Wiederversorgungsprognose, Datenstand 08:00 | `06_netz_…_folgemeldung.json` |
| [Q5] Mobilfunknetzbetreiber B: Mitteilung zu Standortausfällen, Datenstand 07:00 | `03_mobilfunk_…_erstmeldung.json` |
| [Q6] Zentrale Leitstelle Sonneberg: Mitteilung zur Notrufabfrage | `05_leitstelle_…_erstmeldung.json` (Behörde mit Meldekopf) |
| über [Q3]: Zweckverband Trinkwasser, Notstrom 60 Stunden ab 13.10., 22:00 | `02_wasser_…_erstmeldung.json` |
| über [Q3]: zwei Pflegeheime, 146 Bewohnerinnen und Bewohner, Diesel bis 15.10. abends | `04_pflege_…_erstmeldung.json` |

Zahlen und Zeiten stimmen mit der Ilka-Meldung überein: Spitze rund 18.000 Anschlüsse (13.10., 22:30), um 08:00 noch rund 5.300, rund 9.800 Einwohner, 23 Mobilfunkstandorte ohne Strom und 17 ausgefallen, Wiederversorgung 16.10. abends. Die Meldungen nach 14.10., 10:30 Uhr schreiben die Lage über den Stand der Ilka-Meldung hinaus fort. Die Ilka-Dateien selbst bleiben unverändert.

Damit ist die Kette vollständig: **Betreiber → Landkreis → Land (Ilka, Thüringen) → Koordinierungsstelle (Ilka, Bund)**.

## Meldungen

| Nr. | Zeit | Stelle (Rolle) | Meldeart | Kern |
|---|---|---|---|---|
| 01 | 13.10. 22:45 | Netzbetreiber (Betreiber) | Erst | 18.000 Anschlüsse ohne Strom; Prognose offen bis 16.10. |
| 02 | 14.10. 06:30 | Zweckverband Trinkwasser (Betreiber) | Erst | Notstrom bis 16.10., 10:00; Bedarf 2.000 l Diesel |
| 03 | 14.10. 07:15 | Mobilfunkbetreiber B (Betreiber) | Erst | 17 von 23 Standorten ausgefallen; Bedarf Netzersatz |
| 04 | 14.10. 07:30 | Pflegeträger (Betreiber) | Erst | 146 Bewohner auf Notstrom; Diesel bis 15.10. abends |
| 05 | 14.10. 07:45 | Zentrale Leitstelle (Behörde) | Erst | Notruf aus vier Gemeinden eingeschränkt |
| 06 | 14.10. 08:10 | Netzbetreiber | Folge | noch 5.300 Anschlüsse; Wiederversorgung 16.10. abends |
| 07 | 14.10. 08:30 | Landratsamt, Krisenstab (Behörde) | Lagemeldung Nr. 4 | 9.800 Einwohner; Beurteilung „kritisch“; `bezug` auf 01–05 |
| 08 | 15.10. 09:00 | Mobilfunkbetreiber B | Folge | 14 Standorte über Netzersatzanlagen |
| 09 | 15.10. 11:00 | Zweckverband Trinkwasser | Folge | nachgetankt, Reichweite bis 17.10. |
| 10 | 15.10. 11:30 | Pflegeträger | Folge | nachgetankt, Reichweite bis 17.10. |
| 11 | 15.10. 17:00 | Netzbetreiber | Folge | 4.100 Anschlüsse; Prognose bestätigt |
| 12 | 15.10. 18:00 | Netzbetreiber | Korrektur | 4.300 statt 4.100 |
| 13 | 16.10. 21:30 | Netzbetreiber | Abschluss | alle Anschlüsse wieder versorgt |
| 14 | 17.10. 09:00 | Zweckverband Trinkwasser | Abschluss | Notstrombetrieb beendet |

Die gemeinsame Engpassressource Dieselkraftstoff für Pumpwerk, Pflegeheime und mobile Netzersatzanlagen ergibt sich erst aus den Abhängigkeiten mehrerer Betreibermeldungen; die Lagemeldung Nr. 4 des Krisenstabs benennt sie.

Die Radarwerte der Lagemeldung Nr. 4 sind illustrativ und nicht kalibriert. Betreibermeldungen lassen Beurteilung, Tendenz und Lagenradar leer.

## Verwendung

- `npm run pruefen -- szenario/orkantief-ilka-sonneberg`: Alle Meldungen sind gültig, die Ketten aus Erst-, Folge-, Korrektur- und Abschlussmeldung sind schlüssig.
- Die Meldungen sind zugleich die gültigen Konformitätsfälle (`konformitaet/faelle.json`); die Negativfälle sind aus ihnen abgeleitet.
- Lagebild in KI-LEAD mit dem Profilpaket `lead-kritis` und zusammen mit den Ilka-Meldungen: folgt mit Meilenstein M2.

Lizenz: CC BY 4.0, Namensnennung Heiko Pereira Wolf (LICENSE-CONTENT, Nr. 1 b).
