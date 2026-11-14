# Szenario Orkantief „Ilka“ – Landkreis Sonneberg nach LEAD-Meldung-v2 (FIKTIV)

Alle Dateien in diesem Ordner beschreiben eine **erfundene Lage**. Das Orkantief „Ilka“ hat es nicht gegeben. Keine Meldung stammt von den genannten Stellen. Betreiber tragen allgemeine Namen; Behörden und Orte sind nur als Raumbezug genannt und als Übungsrolle gekennzeichnet. Jede Datei, jede Stelle und jeder Sachverhalt trägt den Vermerk „FIKTIV“.

Die Meldungen sind die einmalig überführten Fassungen des Szenarios aus [`szenario/orkantief-ilka-sonneberg/`](../../../../szenario/orkantief-ilka-sonneberg/LIESMICH.md) (`LEAD-KRITIS-Meldung-v0.2` bzw. `LEAD-Meldung-v1`) nach `LEAD-Meldung-v2` mit den Modulen von KRITIS-LEAD. Erzeugt mit `werkzeuge/migration/v2-ueberfuehren.mjs`; was die Überführung nur abgeleitet hat, steht je Meldung in `entstehung.migration.hinweise`. Bis zur Umstellung von Formular und Profilpaket bleiben die Ausgangsdateien maßgeblich, die CI prüft, dass die Überführung zu ihnen passt.

## Kette

**Betreiber → Landkreis (Lagemeldung Nr. 4, `DE-TH-SON-20261014-R4WP`) → Land (Ilka, Thüringen, `DE-TH-20261014-P5VN`) → Koordinierungsstelle (Ilka, Bund).** Meldungen von unten verweisen nicht auf Sachverhalte von oben; die Lagemeldung Nr. 4 ordnet die Eingänge über `bezug` zu (Art „verdichtung“, mit der verwendeten Fassung), wie der Austauschvertrag von KI-LEAD (Abschnitt 9) es vorsieht. In KI-LEAD schreibt die Kreismeldung von 10:00 Uhr im Landesprofil Thüringen (`profile/lead-thueringen/beispiele/orkantief-ilka/`) denselben Sachverhalt `DE-TH-SON-20261014-R4WP` fort.

| Nr. | Zeit | Stelle (Ebene) | Meldeart | Sachverhalt |
|---|---|---|---|---|
| 01 | 13.10. 22:45 | Netzbetreiber (Betreiber) | Erst | `KRITIS-NETZSUED-20261013-N4ST7Q` |
| 02 | 14.10. 06:30 | Zweckverband Trinkwasser (Betreiber) | Erst | `KRITIS-ZVTN-20261014-W2ZV3M` |
| 03 | 14.10. 07:15 | Mobilfunkbetreiber B (Betreiber) | Erst | `KRITIS-MOBILB-20261014-M7FB9X` |
| 04 | 14.10. 07:30 | Pflegeträger (Betreiber) | Erst | `KRITIS-PFLEGEOL-20261014-P8HM4D` |
| 05 | 14.10. 07:45 | Zentrale Leitstelle (Kreis) | Erst | `DE-TH-SON-20261014-G5RS6T` |
| 06 | 14.10. 08:10 | Netzbetreiber | Folge | `KRITIS-NETZSUED-20261013-N4ST7Q` |
| 07 | 14.10. 08:30 | Landratsamt, Krisenstab (Kreis) | Lagemeldung Nr. 4 | `DE-TH-SON-20261014-R4WP`, `bezug` auf 06, 03, 02, 04, 05 |
| 08 | 15.10. 09:00 | Mobilfunkbetreiber B | Folge | `KRITIS-MOBILB-20261014-M7FB9X` |
| 09 | 15.10. 11:00 | Zweckverband Trinkwasser | Folge | `KRITIS-ZVTN-20261014-W2ZV3M` |
| 10 | 15.10. 11:30 | Pflegeträger | Folge | `KRITIS-PFLEGEOL-20261014-P8HM4D` |
| 11 | 15.10. 17:00 | Netzbetreiber | Folge | `KRITIS-NETZSUED-20261013-N4ST7Q` |
| 12 | 15.10. 18:00 | Netzbetreiber | Korrektur (`berichtigung_von` 11) | `KRITIS-NETZSUED-20261013-N4ST7Q` |
| 13 | 16.10. 21:30 | Netzbetreiber | Abschluss | `KRITIS-NETZSUED-20261013-N4ST7Q` |
| 14 | 17.10. 09:00 | Zweckverband Trinkwasser | Abschluss | `KRITIS-ZVTN-20261014-W2ZV3M` |

Betreibermeldungen tragen keine Bewertung und kein Lagenradar; ihre betriebliche Einschätzung, Folgemeldeanlässe, Änderung zur Vormeldung und Abschluss stehen im Modul `lead-kritis-betrieb`. Die Radarwerte der Lagemeldung Nr. 4 sind illustrativ und nicht kalibriert.

## Verwendung

- `npm run pruefen -- formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg`: alle Meldungen gültig, Ketten aus Erst-, Folge-, Korrektur- und Abschlussmeldung schlüssig.
- Die Meldungen sind zugleich die gültigen Konformitätsfälle nach v2 (`formate/lead-kritis-v2/konformitaet/faelle.json`); die Negativ-, Plausibilitäts- und Identitätsfälle sind aus ihnen abgeleitet.

Lizenz: CC BY 4.0, Namensnennung Heiko Pereira Wolf (LICENSE-CONTENT, Nr. 1 b).
