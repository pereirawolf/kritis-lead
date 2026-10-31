# KRITIS-LEAD – Erprobung als Planspiel

Fassung 1.0 vom 31.10.2026, gilt für KRITIS-LEAD 0.1.0 · Heiko Pereira Wolf · Änderungen am Ende unter „Änderungsverlauf“

Dieses Dokument beschreibt die Erprobung von KRITIS-LEAD: Ziel, Fragestellungen, Erfolgskriterien, Regeln für die Teilnahme, Rückmeldeweg und Auswertung. Ablauf und Unterlagen des Planspiels stehen in [erprobung/](../erprobung/README.md). Es ist keine Rechtsberatung.

---

## 1. Rahmen

- KRITIS-LEAD ist ein **privates Forschungsvorhaben** von Heiko Pereira Wolf. Herausgeber ist keine Behörde und keine Einrichtung. Die Erprobung ist keine dienstliche Maßnahme und keine Übung nach Bundes- oder Landesrecht.
- Die Teilnahme ist **freiwillig und unentgeltlich**. Es gibt keine Vergütung und keine Verpflichtung, Rückmeldungen zu geben.
- Wer im Rahmen einer Stelle oder eines Unternehmens teilnehmen möchte, klärt das dort selbst. Für KI-LEAD helfen dessen [Erprobungshinweise](https://github.com/pereirawolf/ki-lead/blob/main/docs/ERPROBUNG.md) und Vorlagen.
- Erprobt werden **feste Stände**: KRITIS-LEAD mit Git-Tag (ab `v0.1.0`) und KI-LEAD an dem Commit, den `kern/quelle.json` nennt. Ein Release mit DOI folgt erst nach der Auswertung.
- Das Planspiel simuliert **keinen Meldeweg**. Es ersetzt, verzögert oder übt keine Meldung nach § 32 BSIG, § 18 KRITISDachG, § 168 TKG, § 5d EnWG oder § 47 TrinkwV und begründet keine Meldepflicht.

## 2. Ziel und Fragestellungen

Ziel ist zu erfahren, ob Betreibermeldungen nach dem Profil `lead-kritis` ohne Umformatierung im selben Lagebild stehen können wie Behördenmeldungen, mit erkennbarer Herkunft, ohne dass betriebliche Angaben zu behördlicher Bewertung werden, und mit tragbarem Aufwand für Betreiber.

| Nr. | Fragestellung | Hinweise aus |
|---|---|---|
| F1 Interoperabilität | Laden alle Meldungen ohne Handarbeit in ein Lagebild, und urteilen zwei unabhängige Prüfwege gleich? | Trockenlauf, Ladeprotokoll, Prüfwerkzeug |
| F2 Rollentreue | Bleibt die Grenze zwischen Betreiberangabe und behördlicher Bewertung erhalten, und erkennen Teilnehmende die Herkunft jeder Angabe? | Negativfälle, Bogen Herkunft, Landesmeldungen |
| F3 Nutzen | Erkennt ein Lagezentrum aus den Betreiberangaben, was eine einzelne Meldung nicht zeigt, etwa eine gemeinsame Engpassressource? | Landesmeldungen, Kodiervergleich |
| F4 Aufwand | Ist das Formular ohne Einweisung bedienbar, und halten Betreiber den Pflichtkern für leistbar? | Selbstprotokoll, Befragung |

## 3. Erfolgskriterien

Die Zielwerte sind vor Beginn festgelegt. Sie können verfehlt werden: Ein Lagebild, das zwar lädt, aber keinen Erkenntnisgewinn bringt, beantwortet F3 negativ. Auch das ist ein verwertbares Ergebnis.

| Bereich | Kriterium | Zielwert | Messung | Trockenlauf |
|---|---|---|---|---|
| Nahtlosigkeit | Szenariomeldungen, die ohne Umformatierung in einem Lagebild stehen | 100 % | Ladeprotokoll KI-LEAD | ja |
| Prüfwege | gleiches Urteil Prüfwerkzeug und KI-LEAD je Konformitätsfall | 100 % | CI | ja |
| Rollentreue | Betreibermeldungen mit Bewertung angenommen | 0 | Negativfälle, Planspieldateien | ja |
| Herkunft | Teilnehmende ordnen jede Angabe im Lagebild richtig Betreiber oder Behörde zu | ≥ 95 % | Bogen Herkunft (20 Angaben) | Anzeige |
| Aufwand | Erstmeldung im Formular; Folgemeldung | Median ≤ 15 min; ≤ 10 min, P90 ausgewiesen | Selbstprotokoll | – |
| Datenqualität | schemagültig beim ersten Export | ≥ 90 % | Prüfwerkzeug, Selbstprotokoll | Formular |
| Zeitarten | Planwert, Prognose und Ist in entscheidungstragenden Aussagen verwechselt | 0 | Durchsicht der Landesmeldungen | – |
| Nutzen | Lagezentrum erkennt die gemeinsame Engpassressource Kraftstoff bis T1 16:00 | in jedem Lagezentrum | Landesmeldung, Kernaussage | Voraussetzung |
| Kodierung | Abweichung zweier Personen im selben Referenzraum | ≤ 1 Stufe in ≥ 80 % der Achsen; Abweichungen begründet | Bogen Kodiervergleich | – |
| Akzeptanz | Betreiber halten den Pflichtkern für leistbar | ≥ 2 von 3 | Befragung | – |

Die Spalte „Trockenlauf“ zeigt, was der maschinelle Durchlauf ohne Teilnehmende schon belegt: [erprobung/trockenlauf/ergebnis.md](../erprobung/trockenlauf/ergebnis.md), erzeugt mit `npm run trockenlauf` und in der CI nachgeprüft. „Anzeige“: Das Lagebild zeigt die Herkunft jeder Meldung richtig an; ob Menschen sie erkennen, misst erst das Planspiel. „Formular“: Jede Betreibermeldung des Szenarios lässt sich im Formular öffnen und unverändert gültig ausgeben. „Voraussetzung“: Der Kraftstoffbedarf steht in mehreren Betreibermeldungen.

## 4. Beteiligung und Ablauf

- **Teilnehmende:** 2–3 Landeslagezentren (je zwei Personen mit Grundkenntnis der LEAD-Systematik) und 2–3 Betreiber (je eine fachkundige Person aus Leitwarte oder Krisenstab; kein BCM vorausgesetzt, gewünscht ist ein Spektrum der BCM-Reife). Dazu die Spielleitung.
- **Ablauf:** Vorbereitung (eine Woche), Planspieltag T1 (ein halber bis ganzer Tag, verteilt, jede Stelle am eigenen Arbeitsplatz), Auswertung (zwei Wochen). Einzelheiten im [Drehbuch](../erprobung/DREHBUCH.md).
- **Mindestvoraussetzungen:** aktueller Browser; KI-LEAD über die veröffentlichte Adresse oder lokal; kein API-Schlüssel. Betreiber brauchen nur die Datei `betreibermeldung.html`.

## 5. Teilnahmehinweise

- **Nur fiktive Inhalte.** Keine Betriebsdaten, keine personenbezogenen Daten, keine eingestuften Inhalte (VS), keine internen Unterlagen einer Stelle oder eines Unternehmens, keine Inhalte aus Notfallplänen, Netzplänen oder Alarmierungslisten. Das gilt für Meldungen, Bögen und Rückmeldungen.
- **Spielzeit statt Uhrzeit.** Meldezeitpunkt und Datenstände sind Spielzeiten aus der Einspielung (13.–17.10.2026), nicht die Uhrzeit des Planspieltags.
- **Ergebnisse bleiben Übungsergebnisse.** Meldungen und Lagebilder aus dem Planspiel nicht für reale Lagen, Meldungen oder Entscheidungen verwenden.
- **Funktionen statt Namen.** Bögen und Meldungen tragen Funktionen und Kürzel, keine Namen.

## 6. Nutzungsbedingungen und Haftung

- Lizenzen: Code unter EUPL-1.2 ([LICENSE](../LICENSE)); Profilpaket, Szenario, Erprobungsunterlagen und Dokumentation unter CC BY 4.0, maschinenlesbare Dateien und Vorlagen zusätzlich unter CC0 1.0, mit den Ausnahmen in [LICENSE-CONTENT](../LICENSE-CONTENT). Diese Bedingungen schränken die Lizenzen nicht ein; sie regeln nur die Teilnahme.
- KRITIS-LEAD ist ein Forschungsdemonstrator in Entwicklung und wird **ohne Gewähr** bereitgestellt (EUPL-1.2, Art. 7). Die Haftung des Herausgebers ist ausgeschlossen, soweit das Gesetz es zulässt (EUPL-1.2, Art. 8); unberührt bleibt die Haftung für Vorsatz und grobe Fahrlässigkeit, für Schäden an Leben, Körper und Gesundheit und nach anderen zwingenden Vorschriften.
- Beiträge, die gegen Abschnitt 5 verstoßen, entfernt der Herausgeber.

## 7. Rückmeldeweg

Rückmeldungen gehen über [Issues im Repository](https://github.com/pereirawolf/kritis-lead/issues/new/choose). Issues sind öffentlich.

| Vorlage | Wofür |
|---|---|
| Befund aus der Erprobung | Beobachtung aus Planspiel oder Trockenlauf, zugeordnet zu F1–F4 |
| Fehler | Formular, Prüfwerkzeug, Profilpaket oder Seite tut etwas nicht oder falsch |
| Fachrückmeldung | Feld, Regel, Anhang K des Kodierleitfadens, Arbeitsanweisung, Szenario |

Sicherheitslücken nicht als Issue, sondern vertraulich nach [SECURITY.md](../SECURITY.md). Ausgefüllte Bögen und Meldungsdateien gehen an die Spielleitung, nicht in Issues; ins Repository kommen nur zusammengefasste Ergebnisse ohne Namen.

## 8. Auswertung

1. **Plan vor Beginn:** Ein Erprobungsplan nach [erprobung/plan-vorlage.md](../erprobung/plan-vorlage.md) legt Stände, Zeitraum, Teilnehmende (Zahl und Rolle, ohne Namen), Mindestbeteiligung und Ende der Sichtung fest. Änderungen nur als neue Planfassung.
2. **Messung:** nach [erprobung/boegen/auswertung.md](../erprobung/boegen/auswertung.md), je Kriterium mit Wert, Zielwert und Begründung.
3. **Ergebnis:** unter `erprobung/ergebnisse/`, je Fragestellung F1–F4: Befunde, Verbleib (umgesetzt, eingeplant, abgelehnt mit Grund), offene Punkte. Keine Namen, keine Rohdaten.
4. **Danach:** Entscheidung über Profil 0.x und Version 0.2; Release mit DOI. Ein Ergebnis ist keine fachliche Freigabe der Methode und keine Empfehlung für ein Landesmeldewesen.

## Änderungsverlauf

| Fassung | Datum | Änderung |
|---|---|---|
| 1.0 | 31.10.2026 | Erste Fassung (KRITIS-LEAD 0.1.0) |
