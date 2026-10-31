# Anleitung für Betreiber: Meldung mit dem Betreiberformular

Diese Anleitung gehört zum Forschungsdemonstrator KRITIS-LEAD. Das Formular veranschaulicht, wie ein Betreiber Kritischer Infrastruktur eine Lage aus Sicht des eigenen Betriebs so meldet, dass sie ohne Umformatierung im selben LEAD-Lagebild steht wie die Lagemeldungen der Behörden. Es ist kein Meldeweg: Es sendet nichts, begründet keine Meldepflicht und ersetzt keine Meldung nach Bundes- oder Landesrecht. **Nur fiktive Daten eingeben** – keine Betriebsdaten, keine personenbezogenen und keine eingestuften Angaben.

## Öffnen

- **Datei:** `formular/betreibermeldung.html` herunterladen und im Browser öffnen (Doppelklick genügt). Die Datei enthält alles, was sie braucht – Schema, Prüfregeln, Schrift – und lädt nichts nach.
- **Web:** Ist GitHub Pages für das Repository eingeschaltet, liegt dieselbe Datei unter `…/betreibermeldung.html`.

Der Entwurf bleibt im Browser dieses Geräts gespeichert, bis „Neue Meldung“ ihn verwirft. Bei gemeinsam genutzten Geräten den Entwurf nach der Ausgabe verwerfen.

## Was ein Betreiber meldet – und was nicht

Ein Betreiber meldet, was nur er belastbar weiß: den tatsächlichen Leistungsgrad der eigenen Dienstleistung, laufende Ersatzverfahren mit Reichweite, eine Prognose der Wiederherstellung und den Bedarf an Unterstützung, jeweils mit Datenstand. **Beurteilung, Tendenz und Lagenradar bleiben leer**; sie setzt jede Behörde für ihren eigenen Referenzraum. Das Formular bietet diese Felder deshalb gar nicht an. Die eigene Einschätzung gehört als Text in „Betriebliche Einschätzung“ und beginnt am besten mit „Betriebliche Einschätzung des Betreibers, keine LEAD-Beurteilung:“.

## Die sechs Schritte

1. **Meldung und Betreiber.** Meldeart, Meldeanlass, Meldezeitpunkt und Betreiber (fiktiver Name). Das Land bestimmt das Präfix der Sachverhaltskennung, die das Formular vergibt. Parallele Pflichtmeldungen, etwa an das BSI oder die Bundesnetzagentur, werden nur dokumentiert; diese Meldung ersetzt sie nicht.
2. **Dienstleistung und Istzustand.** Sektor nach § 4 Abs. 1 KRITISDachG, kritische Dienstleistung, betroffener Raum mit Amtlichem Regionalschlüssel, Ausfallbeginn, Leistungsgrad und die aktuelle betriebliche Einstufung (Störung, Notfall, Krise nach BSI-Standard 200-4). Je nach Sektor kommen Sektorangaben hinzu, etwa wiederversorgte Anschlüsse oder ausgefallene Standorte; das Formular zeigt sie, sobald der Sektor gewählt ist. Betroffene Anschlüsse und Personen als Messwert: **belegt** (gezählt oder gemessen), **geschätzt** (hochgerechnet), **unbekannt** (geprüft, nicht feststellbar) oder **nicht zutreffend**. Personen nie als „belegt“ aus Anschlüssen hochrechnen.
3. **Ersatz, Prognose und Bedarf.** Drei Zeitarten getrennt halten: Istzustand, Prognose zum Datenstand und Planwerte aus der Vorsorge (BCM). Eine Reichweite braucht ihre Bedingung („ohne Nachbetankung“). Planwerte nach BSI-Standard 200-4 gelten für einen benannten Geschäftsprozess: die maximal tolerierbare Ausfallzeit (MTPD) ab Ausfallbeginn, die geforderte Wiederanlaufzeit (RTO) ab Ausrufen des Notfalls bis zum Notbetriebsniveau; die RTO ist kleiner als die MTPD. Planwerte sind keine Zusage. Werte nach BSI-Standard 100-4 als solche kennzeichnen („Begriffsgrundlage“). Keine Inhalte aus Notfallplänen, Netzplänen oder Alarmierungslisten.
4. **Lage und Einschätzung.** Der Sachverhalt in den vier Analysefeldern; Belege mit [Q1], [Q2] … Die Knöpfe fügen Kennsätze ein: „Neubewertung bei:“, „Handlungsrelevant bis:“, „Änderung zur Vormeldung:“, „Abschluss im Lagebild:“.
5. **Quellen und Zeitstrahl.** Je Quelle eine Zeile, Betriebsangaben als Kategorie B. Der Zeitstrahl nimmt je eingetretenem Ereignis eine Zeile auf.
6. **Freigabe, Prüfen und Ausgabe.** Freigabe mit Funktionen statt Personen. „Prüfen“ zeigt Fehler (rot) und Warnungen (gelb); ein Klick auf einen Befund führt zum Feld. Ausgegeben wird erst ohne Fehler; Warnungen hindern nicht.

## Prüfung

Das Formular prüft mit demselben Schema (`LEAD-KRITIS-Meldung-v0.2`) und denselben Plausibilitätsregeln P1 bis P10 wie das Prüfwerkzeug (`npm run pruefen`), also etwa Prognosefenster in der richtigen Reihenfolge, Reichweite mit Bedingung, Datenstand nicht nach dem Meldezeitpunkt, Quellenverweise mit Eintrag, „Änderung zur Vormeldung:“ in jeder Folge- und Korrekturmeldung. Geprüft werden Struktur und Stimmigkeit, nicht die sachliche Richtigkeit.

## Fortschreiben

„Vormeldung fortschreiben“ lädt die zuletzt ausgegebene Datei und legt daraus eine **Folgemeldung** an: neue Meldungs-ID, Bezug auf die Vormeldung, gleiche Sachverhaltskennung. Für eine Korrektur- oder Abschlussmeldung danach im ersten Schritt die Meldeart umstellen. Den Kennsatz „Änderung zur Vormeldung:“ ergänzen und alle Datenstände aktualisieren.

## Ausgabe und Weg ins Lagebild

Die Ausgabe ist eine JSON-Datei, benannt nach Meldezeitpunkt, Betreiber und Meldeart. In KI-LEAD mit dem Profilpaket `lead-kritis` (`dist/lead-kritis.leadprofil` bzw. Artefakt der GitHub Actions) lässt sie sich wie jede Lagemeldung laden; sie erscheint im selben Lagebild, als Betreibermeldung erkennbar (siehe [LAGEBILD.md](LAGEBILD.md)). Felder im Einzelnen: [MELDEPROFIL.md](MELDEPROFIL.md).

## Bedienung ohne Maus

Alle Bedienelemente sind mit der Tabulatortaste erreichbar; Optionen wählen Sie mit den Pfeiltasten, Kontrollkästchen mit der Leertaste. Nach einem Schrittwechsel steht der Fokus auf der Überschrift des Schritts. Einzelheiten und bekannte Lücken: [BARRIEREFREIHEIT.md](BARRIEREFREIHEIT.md).

## Grenzen des Demonstrators

- Ein Sachverhalt je Meldung; weitere Sachverhalte lassen sich in der JSON-Datei ergänzen und mit `npm run pruefen` prüfen.
- Sektorangaben gibt es für Energie, Wasser, Telekommunikation und Gesundheitswesen; für die übrigen Sektoren gilt der gemeinsame Kern. Neue Sektorangaben im Meldeprofil erscheinen ohne Programmänderung im Formular.
- Die Schrittfolge entspricht dem Funktionsprofil nach SOP B12, nicht einem behördlichen Meldevordruck.
