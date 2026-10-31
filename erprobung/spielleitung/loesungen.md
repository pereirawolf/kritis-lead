# Musterlösungen für die Spielleitung

Nicht an Teilnehmende ausgeben, bevor ihre Ergebnisse abgegeben sind.

## Einspielungen

Die Musterlösung jeder Einspielung ist die Szenariodatei. Abweichungen in Formulierung, Meldungs-ID und Bezug sind erwartet; geprüft werden Struktur (`npm run pruefen`), Zeitarten und die Trennung von Angabe und Bewertung.

| Nr. | Einspielung | Musterlösung |
| --- | --- | --- |
| 01 | [01_netz_erstmeldung](../einspielungen/01_netz_erstmeldung.md) | [`01_netz_2026-10-13T22-45_erstmeldung.json`](../../szenario/orkantief-ilka-sonneberg/01_netz_2026-10-13T22-45_erstmeldung.json) |
| 02 | [02_wasser_erstmeldung](../einspielungen/02_wasser_erstmeldung.md) | [`02_wasser_2026-10-14T06-30_erstmeldung.json`](../../szenario/orkantief-ilka-sonneberg/02_wasser_2026-10-14T06-30_erstmeldung.json) |
| 03 | [03_mobilfunk_erstmeldung](../einspielungen/03_mobilfunk_erstmeldung.md) | [`03_mobilfunk_2026-10-14T07-15_erstmeldung.json`](../../szenario/orkantief-ilka-sonneberg/03_mobilfunk_2026-10-14T07-15_erstmeldung.json) |
| 04 | [04_pflege_erstmeldung](../einspielungen/04_pflege_erstmeldung.md) | [`04_pflege_2026-10-14T07-30_erstmeldung.json`](../../szenario/orkantief-ilka-sonneberg/04_pflege_2026-10-14T07-30_erstmeldung.json) |
| 06 | [06_netz_folgemeldung](../einspielungen/06_netz_folgemeldung.md) | [`06_netz_2026-10-14T08-10_folgemeldung.json`](../../szenario/orkantief-ilka-sonneberg/06_netz_2026-10-14T08-10_folgemeldung.json) |
| 08 | [08_mobilfunk_folgemeldung](../einspielungen/08_mobilfunk_folgemeldung.md) | [`08_mobilfunk_2026-10-15T09-00_folgemeldung.json`](../../szenario/orkantief-ilka-sonneberg/08_mobilfunk_2026-10-15T09-00_folgemeldung.json) |
| 09 | [09_wasser_folgemeldung](../einspielungen/09_wasser_folgemeldung.md) | [`09_wasser_2026-10-15T11-00_folgemeldung.json`](../../szenario/orkantief-ilka-sonneberg/09_wasser_2026-10-15T11-00_folgemeldung.json) |
| 10 | [10_pflege_folgemeldung](../einspielungen/10_pflege_folgemeldung.md) | [`10_pflege_2026-10-15T11-30_folgemeldung.json`](../../szenario/orkantief-ilka-sonneberg/10_pflege_2026-10-15T11-30_folgemeldung.json) |
| 11 | [11_netz_folgemeldung](../einspielungen/11_netz_folgemeldung.md) | [`11_netz_2026-10-15T17-00_folgemeldung.json`](../../szenario/orkantief-ilka-sonneberg/11_netz_2026-10-15T17-00_folgemeldung.json) |
| 12 | [12_netz_korrekturmeldung](../einspielungen/12_netz_korrekturmeldung.md) | [`12_netz_2026-10-15T18-00_korrekturmeldung.json`](../../szenario/orkantief-ilka-sonneberg/12_netz_2026-10-15T18-00_korrekturmeldung.json) |
| 13 | [13_netz_abschlussmeldung](../einspielungen/13_netz_abschlussmeldung.md) | [`13_netz_2026-10-16T21-30_abschlussmeldung.json`](../../szenario/orkantief-ilka-sonneberg/13_netz_2026-10-16T21-30_abschlussmeldung.json) |
| 14 | [14_wasser_abschlussmeldung](../einspielungen/14_wasser_abschlussmeldung.md) | [`14_wasser_2026-10-17T09-00_abschlussmeldung.json`](../../szenario/orkantief-ilka-sonneberg/14_wasser_2026-10-17T09-00_abschlussmeldung.json) |

## Landesmeldung

Musterlösung ist der Sachverhalt `DE-TH-20261014-P5VN` der Thüringer Ilka-Meldung (`kern/lead-beispiel/beispiele/orkantief-ilka/LEAD-Meldung_TH_2026-10-14T10-30_FIKTIV_Orkantief-Ilka.json`). Kernaussage für das Kriterium Nutzen: Mehrere Notstrompuffer (Trinkwasser, Mobilfunk, Pflege) enden vor der Wiederversorgung; Kraftstoff ist die gemeinsame Engpassressource.

## Bogen Herkunft

| Nr. | Herkunft | Datei |
| --- | --- | --- |
| 1 | Behörde | `LEAD-Meldung_TH_2026-10-14T10-30_FIKTIV_Orkantief-Ilka.json` |
| 2 | Betreiber | `02_wasser_2026-10-14T06-30_erstmeldung.json` |
| 3 | Betreiber | `02_wasser_2026-10-14T06-30_erstmeldung.json` |
| 4 | Betreiber | `01_netz_2026-10-13T22-45_erstmeldung.json` |
| 5 | Betreiber | `06_netz_2026-10-14T08-10_folgemeldung.json` |
| 6 | Behörde | `LEAD-Meldung_Bund_Koordinierungsstelle_2026-10-14T14-00_FIKTIV_Orkantief-Ilka.json` |
| 7 | Behörde | `LEAD-Meldung_NW_2026-10-14T10-00_FIKTIV_Orkantief-Ilka.json` |
| 8 | Behörde | `LEAD-Meldung_NI_2026-10-14T09-45_FIKTIV_Orkantief-Ilka.json` |
| 9 | Behörde | `05_leitstelle_2026-10-14T07-45_erstmeldung.json` |
| 10 | Betreiber | `03_mobilfunk_2026-10-14T07-15_erstmeldung.json` |
| 11 | Behörde | `07_krisenstab_2026-10-14T08-30_lagemeldung-nr-4.json` |
| 12 | Behörde | `LEAD-Meldung_RP_2026-10-14T09-30_FIKTIV_Orkantief-Ilka.json` |
| 13 | Betreiber | `04_pflege_2026-10-14T07-30_erstmeldung.json` |
| 14 | Betreiber | `03_mobilfunk_2026-10-14T07-15_erstmeldung.json` |
| 15 | Betreiber | `04_pflege_2026-10-14T07-30_erstmeldung.json` |
| 16 | Behörde | `LEAD-Meldung_TH_2026-10-14T10-30_FIKTIV_Orkantief-Ilka.json` |
| 17 | Betreiber | `01_netz_2026-10-13T22-45_erstmeldung.json` |
| 18 | Betreiber | `06_netz_2026-10-14T08-10_folgemeldung.json` |
| 19 | Behörde | `LEAD-Meldung_ST_2026-10-14T11-00_FIKTIV_Orkantief-Ilka.json` |
| 20 | Behörde | `LEAD-Meldung_HE_2026-10-14T10-15_FIKTIV_Orkantief-Ilka.json` |

Verteilung: 10 Betreiber, 10 Behörde.

---
KRITIS-LEAD · Forschungsdemonstrator · alle Angaben fiktiv · CC BY 4.0 · erzeugt mit `node werkzeuge/bauen/erprobung-bauen.mjs`, nicht von Hand bearbeiten
