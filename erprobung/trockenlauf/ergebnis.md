# Trockenlauf Orkantief „Ilka“, Landkreis Sonneberg

Erzeugt mit `npm run trockenlauf` (KRITIS-LEAD 0.2.0, Profil kritis-lead.lagezentrum 0.3.0, KI-LEAD 0.6.14 @ `57d14ce`). Die Datei wird nicht von Hand bearbeitet; die CI prüft, dass sie zum Stand passt. Alle Daten sind fiktiv.

Der Trockenlauf spielt das Szenario ohne Teilnehmende durch: Er misst die Erfolgskriterien der Erprobung ([docs/ERPROBUNG.md](../../docs/ERPROBUNG.md), Abschnitt 3), die sich maschinell messen lassen, und zeigt, dass Formular, Prüfwerkzeug, Profilpaket und KI-LEAD zusammen funktionieren. Die übrigen Kriterien misst erst das Planspiel ([Drehbuch](../DREHBUCH.md)).

**Ergebnis: alle maschinell messbaren Kriterien erfüllt.**

## Kriterien

| Bereich | Kriterium | Zielwert | Trockenlauf | erfüllt |
| --- | --- | --- | --- | --- |
| Nahtlosigkeit | Meldungen ohne Umformatierung im Lagebild (Verlauf: Szenario und Ilka) | 100 % | 21 von 21 | ja |
| Prüfwege | gleiches Urteil Prüfwerkzeug und KI-LEAD je Konformitätsfall | 100 % | 40 von 40 | ja |
| Rollentreue | Betreibermeldungen mit Bewertung angenommen (Negativfälle R1; Szenario) | 0 | 0 von 3 Negativfällen; 0 von 12 Szenariomeldungen mit Bewertung | ja |
| Herkunft | Herkunft im Lagebild richtig angezeigt (Betreiber (B) / Behörde (A)); Zuordnung durch Teilnehmende nur im Planspiel | 100 % (Planspiel: ≥ 95 %) | 21 von 21 | ja |
| Datenqualität | Szenariomeldungen im Formular geöffnet, durch alle Schritte geführt, unverändert und gültig ausgegeben | 100 % (Planspiel: ≥ 90 % beim ersten Export) | 12 von 12 | ja |
| Plausibilität und Identität | Szenario ohne Schema-, Plausibilitäts- und Identitätsfehler | 0 Fehler | 0 Fehler, 0 Warnungen je Meldung; Satz: 0 Fehler | ja |
| Nutzen (Voraussetzung) | Kraftstoff als Unterstützungsbedarf in mehreren Betreibermeldungen bis 14.10., 10:30 (Erkennen durch die Lagezentren nur im Planspiel) | ≥ 2 Meldungen | 3 (Zweckverband Trinkwasser Neuhaus am Rennweg; Mobilfunknetzbetreiber B; Pflegeträger Oberland) | ja |

Erst im Planspiel messbar:

| Bereich | Kriterium | Zielwert | Messung |
| --- | --- | --- | --- |
| Aufwand | Erstmeldung im Formular; Folgemeldung | Median ≤ 15 min; ≤ 10 min, P90 ausgewiesen | Selbstprotokoll |
| Zeitarten | Planwert, Prognose und Ist in entscheidungstragenden Aussagen verwechselt | 0 | Durchsicht der Landesmeldungen |
| Nutzen | Lagezentrum erkennt die gemeinsame Engpassressource Kraftstoff bis T1 16:00 | in jedem Lagezentrum | Landesmeldung, Kernaussage |
| Kodierung | Abweichung zweier Personen im selben Referenzraum | ≤ 1 Stufe in ≥ 80 % der Achsen | Kodiervergleich |
| Akzeptanz | Betreiber halten den Pflichtkern für leistbar | ≥ 2 von 3 | Befragung |

## 1. Betreiberformular

Jede Betreibermeldung wird als Entwurf geöffnet, Schritt für Schritt angezeigt, geprüft und als JSON ausgegeben.

| Meldung | Meldeart | Befunde im Formular | unverändert | gültig |
| --- | --- | --- | --- | --- |
| `01_netz_2026-10-13T22-45_erstmeldung.json` | Erstmeldung | 0 | ja | ja |
| `02_wasser_2026-10-14T06-30_erstmeldung.json` | Erstmeldung | 0 | ja | ja |
| `03_mobilfunk_2026-10-14T07-15_erstmeldung.json` | Erstmeldung | 0 | ja | ja |
| `04_pflege_2026-10-14T07-30_erstmeldung.json` | Erstmeldung | 0 | ja | ja |
| `06_netz_2026-10-14T08-10_folgemeldung.json` | Folgemeldung | 0 | ja | ja |
| `08_mobilfunk_2026-10-15T09-00_folgemeldung.json` | Folgemeldung | 0 | ja | ja |
| `09_wasser_2026-10-15T11-00_folgemeldung.json` | Folgemeldung | 0 | ja | ja |
| `10_pflege_2026-10-15T11-30_folgemeldung.json` | Folgemeldung | 0 | ja | ja |
| `11_netz_2026-10-15T17-00_folgemeldung.json` | Folgemeldung | 0 | ja | ja |
| `12_netz_2026-10-15T18-00_korrekturmeldung.json` | Korrekturmeldung | 0 | ja | ja |
| `13_netz_2026-10-16T21-30_abschlussmeldung.json` | Abschlussmeldung | 0 | ja | ja |
| `14_wasser_2026-10-17T09-00_abschlussmeldung.json` | Abschlussmeldung | 0 | ja | ja |

## 2. Prüfwerkzeug

| Meldung | Rolle | gültig | Fehler | Warnungen |
| --- | --- | --- | --- | --- |
| `01_netz_2026-10-13T22-45_erstmeldung.json` | Betreiber | ja | 0 | 0 |
| `02_wasser_2026-10-14T06-30_erstmeldung.json` | Betreiber | ja | 0 | 0 |
| `03_mobilfunk_2026-10-14T07-15_erstmeldung.json` | Betreiber | ja | 0 | 0 |
| `04_pflege_2026-10-14T07-30_erstmeldung.json` | Betreiber | ja | 0 | 0 |
| `05_leitstelle_2026-10-14T07-45_erstmeldung.json` | Behörde | ja | 0 | 0 |
| `06_netz_2026-10-14T08-10_folgemeldung.json` | Betreiber | ja | 0 | 0 |
| `07_krisenstab_2026-10-14T08-30_lagemeldung-nr-4.json` | Behörde | ja | 0 | 0 |
| `08_mobilfunk_2026-10-15T09-00_folgemeldung.json` | Betreiber | ja | 0 | 0 |
| `09_wasser_2026-10-15T11-00_folgemeldung.json` | Betreiber | ja | 0 | 0 |
| `10_pflege_2026-10-15T11-30_folgemeldung.json` | Betreiber | ja | 0 | 0 |
| `11_netz_2026-10-15T17-00_folgemeldung.json` | Betreiber | ja | 0 | 0 |
| `12_netz_2026-10-15T18-00_korrekturmeldung.json` | Betreiber | ja | 0 | 0 |
| `13_netz_2026-10-16T21-30_abschlussmeldung.json` | Betreiber | ja | 0 | 0 |
| `14_wasser_2026-10-17T09-00_abschlussmeldung.json` | Betreiber | ja | 0 | 0 |

Nachrichtenidentität über alle 14 Meldungen (I1 bis I5): 0 Fehler, 0 Warnungen.

## 3. Zweiter Prüfweg

Der Schemaprüfer von KI-LEAD urteilt über 40 Konformitätsfälle; in 40 Fällen gleich wie das Prüfwerkzeug. Fehler beim Übernehmen des Schemas in den Prüfer: keine. Behördenmeldungen des Ilka-Datensatzes von KI-LEAD nach Migration gültig: 7 von 7.

## 4. Lagebild in KI-LEAD

Profilpaket geladen: ja, Fehler und Warnungen: 0; als .leadprofil mit gleicher Prüfsumme: ja.

| Beispiel | Meldungen | davon Betreiber | ohne Umformatierung | Herkunft richtig | Sachverhalte | Kennungsbefunde außer Fortschreibung | JSON in der Rohtabelle |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `beispiele/sonneberg-stand-14-10` | 14 | 5 | 14 | 14 | 15 | 0 | 0 |
| `beispiele/sonneberg-verlauf` | 21 | 12 | 21 | 21 | 22 | 0 | 0 |
