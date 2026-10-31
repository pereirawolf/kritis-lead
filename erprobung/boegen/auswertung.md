# Bogen Auswertung (Spielleitung)

Je Kriterium aus [docs/ERPROBUNG.md](../../docs/ERPROBUNG.md), Abschnitt 3, ein Wert mit Grundlage. Ein verfehlter Zielwert wird begründet, nicht nachträglich angepasst.

| Bereich | Zielwert | Grundlage | Wert | erfüllt | Begründung, Befund-Issue |
| --- | --- | --- | --- | --- | --- |
| Nahtlosigkeit | 100 % | Meldungssatz in KI-LEAD geladen: Meldungen ohne Schemabefund und nicht „fremd“ / alle |  |  |  |
| Prüfwege | 100 % | CI am Tag des Planspiels; zusätzlich `npm run pruefen` über die Dateien der Betreiber |  |  |  |
| Rollentreue | 0 | Dateien der Betreiber mit Beurteilung, Tendenz oder Radarwert (Prüfwerkzeug, Regel R1) |  |  |  |
| Herkunft | ≥ 95 % | Bögen Herkunft: richtige Zuordnungen / (Personen × 20); Lösung in `spielleitung/loesungen.md` |  |  |  |
| Aufwand Erstmeldung | Median ≤ 15 min | Selbstprotokolle, Erstmeldungen; P90 ausweisen |  |  |  |
| Aufwand Folgemeldung | Median ≤ 10 min | Selbstprotokolle, Folge-, Korrektur- und Abschlussmeldungen; P90 ausweisen |  |  |  |
| Datenqualität | ≥ 90 % | Selbstprotokolle „erster Export gültig“, gegengeprüft mit `npm run pruefen` |  |  |  |
| Zeitarten | 0 | Landesmeldungen: Planwert, Prognose oder Ist in Kernaussage, Beurteilung oder Maßnahmen verwechselt |  |  |  |
| Nutzen | jedes Lagezentrum | Landesmeldung nennt Kraftstoff als gemeinsame Engpassressource |  |  |  |
| Kodierung | ≤ 1 Stufe in ≥ 80 % der Achsen | Bögen Kodiervergleich, je Lagezentrum |  |  |  |
| Akzeptanz | ≥ 2 von 3 Betreibern | Befragung B1 ≥ 4 |  |  |  |

Zusätzlich je Fragestellung F1–F4: Befunde (Issue-Nummern), Verbleib (umgesetzt, eingeplant, abgelehnt mit Grund), offene Punkte.

---
KRITIS-LEAD · Bogen · CC BY 4.0, zusätzlich CC0 1.0
