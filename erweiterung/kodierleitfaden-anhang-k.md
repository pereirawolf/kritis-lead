

---

## Anhang K: Betreibermeldungen (Ergänzung KRITIS-LEAD)

Ergänzung von KRITIS-LEAD zur Erweiterung `lead-kritis/0.1` · Fassung 0.1.0 vom 31.10.2026 · gilt zusammen mit dem Profilschema `LEAD-KRITIS-Meldung-v0.1`. Dieser Anhang ändert keine Regel des Kodierleitfadens; er legt fest, wie Angaben aus Betreibermeldungen in die Kodierung einer Behörde eingehen. Feldkatalog: docs/MELDEPROFIL.md im Repository KRITIS-LEAD.

### K.1 Rollen

- Eine Meldung mit `kritis.rolle` = „Betreiber“ ist eine **Betreibermeldung**. Sie trägt Angaben zum eigenen Betrieb im Block `betrieb` und lässt Beurteilung, Tendenz und alle Radarachsen leer; das Schema erzwingt das.
- Jede andere Meldung ist eine **Behördenmeldung**, auch ohne Meldekopf. Sie bewertet für ihren Referenzraum und enthält keinen Block `betrieb`.
- Eine Betreibermeldung ist eine Quelle der Kategorie B (Abschnitt 5), unabhängig von öffentlicher oder privater Trägerschaft. Die Meldung einer Leitstelle, eines Gesundheitsamts oder eines Krisenstabs ist A.
- Die betriebliche Eskalationsstufe (`ist.eskalationsstufe_betrieblich`: Störung, Notfall, Krise) ist Betreibersicht. Sie wird nie in eine Beurteilung übersetzt.

### K.2 Drei Zeitarten

| Angabe | Feld | Verwendung in der Kodierung |
|---|---|---|
| Istzustand zu einem Datenstand | `betrieb.ist` mit `stand` | Ist-Kodierung nach Grundregel 1; gilt zu t0 nur bei belegter Fortgeltung (SOP-LEAD A.3) |
| Prognose | `betrieb.prognose` | D5 nur bei `status` = „prognose“ mit Geber und Zielzustand (Abschnitt 3, D5); „keine_prognose_moeglich“ lässt D5 offen |
| Planwert aus der Vorsorge | `betrieb.bcm.planung` (MTA, RTO, Notbetriebsniveau) | nie D5 und nie eine Frist; ein überschrittener Planwert ist ein Befund für den Bewertungstext und ein Anlass für `Neubewertung bei:` |

Eine Reichweite (`ersatzverfahren[].reichweite_bis`) gilt nur mit ihrer Bedingung; eine Nennlaufzeit ist keine gesicherte Reichweite.

### K.3 Zahlen

- Jede Zahl trägt Einheit, Status (belegt, geschaetzt, unbekannt, nicht_zutreffend) und Datenstand. Anschlüsse, Nutzer, Einwohner und Bewohner sind verschiedene Einheiten; addiert wird nur nach SOP-LEAD A.3.
- D2 kodiert Personen. Eine Betreibermeldung liefert in der Regel Anschlüsse; die Zuordnung zu Einwohnern leistet die Behörde mit eigenen Daten. Fehlt sie, bleibt D2 offen.
- Ein Prozentwert gilt nur mit seiner `leistungsbasis`.

### K.4 Kennung und Bezug

- Betreiber und Behörde vergeben je eigene Sachverhaltskennungen. Eine Behörde legt einen eigenen Sachverhalt an und nennt die Kennungen der Betreibermeldungen in `bezug` (Abschnitt 8).
- Eine Folge-, Korrektur- oder Abschlussmeldung behält die Sachverhaltskennung und nennt in `kritis.bezug_meldung_id` die Meldung, auf die sie sich bezieht. Eine Korrekturmeldung ersetzt nur die Angaben, die sie berichtigt; der Zeitstrahl trägt dazu eine Zeile vom Typ „Berichtigung“.

### K.5 Zusammenführung

- Radarwerte gibt es in Betreibermeldungen nicht; jede Behörde kodiert für ihren Referenzraum neu.
- Widerspricht eine Betreiberangabe einer Behördenangabe, werden zuerst Datenstand, Raum, Aussagegegenstand und Zuständigkeit verglichen (Abschnitt 5). Erst danach gilt der Rang A vor B. Ungeklärte Differenzen bleiben mit beiden Quellen sichtbar.
- Die Abhängigkeiten mehrerer Betreiber (`betrieb.abhaengigkeiten`, `unterstuetzungsbedarf`) werden übereinandergelegt. Ein gemeinsamer Bedarf an derselben Ressource ist eine gemeinsame Engpassressource nach SOP-LEAD A.7.4.
- Eine ausbleibende Folgemeldung belegt weder das Ende noch das Fortdauern einer Störung.

### K.6 Vertraulichkeit

Der Demonstrator verarbeitet nur synthetische Daten (`kritis.datenart` = „synthetisch“) mit TLP:CLEAR. Reale Betriebsdaten, Kontaktdaten von Personen und eingestufte Inhalte gehören nicht in KRITIS-LEAD und nicht in eine öffentliche KI-LEAD-Instanz (SOP-LEAD A.3).
