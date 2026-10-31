<a id="b12"></a>

## B12. SOP LEAD: KRITIS-Ausfall

```yaml
kennung: "B12"
typ: "Dach-SOP"
lesegruppe: "Katalog-Einstiege"
lageart: "KRITIS-Ausfall (sektorübergreifend oder in Sektoren ohne eigene SOP)"
art_vorschlag: ["KRITIS-Ausfall"]
zweck: "Reproduzierbare Erfassung von Ausfällen kritischer Versorgungsfunktionen in Sektoren ohne eigene SOP (z. B. Telekommunikation, Verkehr, Finanzwesen, Ernährung, Abwasser) und sektorübergreifender Kaskaden; Dach für die Bausteine C11 und C12 bis C15."
version: "2.1.0"
status: "Beispielfassung"
stand: "21.10.2026"
pflegeverantwortlich: "Herausgeber der Beispielfassung (bei Übernahme: fachlich zuständige Funktion eintragen)"
quellen_geprueft_am: "Rechercheeinstiege 26.09.2026 teilweise; Ergänzungen 19.10.2026 vor Erstverwendung prüfen (A.6)"
naechste_pruefung_faellig: "31.03.2027"
pruefausloeser: "Rückblick nach A.8.3; Änderung von Kodierleitfaden, Darstellungsdatei oder Schema; Änderung des KRITIS-Rechtsrahmens"
bisherige_kennung: "12"
bisherige_ids: ["sop-12"]
```

### 1. Anwendungsbereich und Befassungsanlässe

**Umfasst / grenzt ab von:** Ausfall oder wesentliche Einschränkung kritischer Dienstleistungen einschließlich mehrerer Sektoren. Für Strom, Gas und Trinkwasser gelten vorrangig B08–B10, für medizinisch-pflegerische Versorgung und Arzneimittel B11 mit C09/C10; B12 kommt hinzu, wenn eine weitere kritische Dienstleistung eigenständig betroffen ist oder eine sektorübergreifende Koordinationsfrage besteht, nicht allein wegen des KRITIS-Bezugs (A.1 Nr. 2, Funktionsdach). Ursachen zusätzlich über B15/B16. Kritische Dienstleistungen werden funktional geprüft, auch wenn der formale regulatorische Status eines Betreibers ungeklärt ist; der Rechtsstatus wird nicht selbst festgestellt, und eine gesetzliche Betreiberregistrierung ist kein Aufnahmekriterium. Vertiefung über Bausteine: Telekommunikation, Notruf, BOS-Kommunikation und Warnfähigkeit C11 · Kraftstoff und Wärme C12 · Verkehr und kritische Logistik C13 · Lebensmittel C14 · Abwasser, Sanitärhygiene und Entsorgung C15; Zahlungsverkehr bis zur Ausarbeitung eines Bausteins in dieser SOP. Beispiel dafür: großflächiger Ausfall von Mobilfunk und Notruf; bundesweite Störung des Zahlungsverkehrs. Beispiel dagegen: kurze Störung eines Dienstes mit Ausweichmöglichkeit.

**Befassungsanlässe:** Lagemeldung eines Landes · Betreiber- oder Aufsichtsmitteilung · Ausfall von Notrufnummern · Monitoring: Störungsmeldungen der Betreiber und VOST-Auswertung.

### 2. Erfassung: Prüffragen

**Funktionsprofil (vor der Detailrecherche):** Dienstleistung · benötigte Qualität bzw. Menge · betroffener Raum · Ausfallbeginn · tatsächlicher Leistungsgrad · zeitliche Tragfähigkeit von Ausweichlösungen · Wiederanlauf.

| ID | Leitfrage | Quelle & Aktualität | Prüfen für | Hinweis/Stolperstelle |
|---|---|---|---|---|
| R1 | Welche konkrete Dienstleistung fällt seit wann wo aus? | Betreibermeldungen (A.3); zuständige Aufsicht (z. B. BNetzA für Telekommunikation) | L; D1 | Sektorzugehörigkeit ist kein Funktionsausfall; Betreiberangaben zu Reichweite oft unvollständig. |
| R2 | Welche Menschen und Einrichtungen sind unmittelbar betroffen? | Lagemeldungen (A.3) | R; D2 | Kunden- bzw. Nutzerzahl ≠ direkt betroffene Bevölkerung (A.3 Zählregeln). |
| R3 | Welche Ersatzsysteme tragen mit welchen Grenzen? | Betreibermeldungen (A.3) | R/M; D5 | Redundanz nur bei nachgewiesener Nutzbarkeit annehmen; vorhanden, betriebsbereit und wirksam trennen (A.9.1). |
| R4 | Welche weiteren Dienste hängen davon ab? | Betreibermeldungen (A.3); [BBK KRITIS](https://www.bbk.bund.de/) für Sektorstruktur | R/I; D6 | Abhängigkeit ≠ eingetretener Folgeausfall; Kettenwirkungen mit Zeitverzug belegen. |
| R5 | Ist Notruf oder Warnung der Bevölkerung betroffen? | Leitstellen; Lagemeldungen (A.3) | R/M | Ausfälle der Bevölkerungskommunikation im Text und bei D6 darstellen (A.2 D7); Ersatzwege ausschließlich als lokal bestätigte, erreichbare Angebote wiedergeben; vertiefend C11. |
| R6 | Welche Ursachen- und Wiederherstellungsinformationen sind verlässlich? | Betreibermeldungen (A.3); BSI bei IT-Bezug | L/M; D7/D8 | Ursache offenlassen bis belegt; unklare Ursache verhindert nicht die Beschreibung gesicherter Folgen. |

### 3. Auswertung: Prüfpunkte

Alle acht Achsen nach Teil A.2 prüfen; hier besonders:

- **D1:** Räumlicher Impact der Auswirkungen, nicht Sektorgröße: bundesweiter Dienstausfall ist bundesweit, regional begrenzter Dienst nicht.
- **D3:** Betreiberverantwortung, Aufsicht und Gefahrenabwehr unterscheiden; bewertete Funktion nennen.
- **D6:** Kernachse: nach belegter Zahl und Kopplung betroffener Sektoren, nicht nach KRITIS-Eigenschaft oder regulatorischen Schwellen hochkodieren.

**Beurteilung/Tendenz:** Technisch wiederhergestellte Anlage und praktisch verfügbare Dienstleistung können auseinanderfallen. Kurze Ausfälle mit nachweislich nutzbarer Ausweichmöglichkeit sind meist geringfügig.

**Offenlassen:** D2 ohne belastbare Nutzerzahlen; D5 ohne Wiederherstellungsprognose.

### 4. Darstellung

| Meldungsbereich | Lageart-spezifische Leitfrage |
|---|---|
| Lage & Ereignis | Funktionsprofil: betroffener Sektor/Dienst, Raum, Leistungsgrad, Ursache (belegt/vorläufig), Zeitstand |
| Risiken & Auswirkungen | Folgeketten in andere Sektoren belegt vs. möglich |
| Maßnahmen & Handlungsempfehlungen | Bestätigte Ausweichwege (z. B. Notrufalternativen), Information der Bevölkerung |
| Abhängigkeiten & Interdependenzen | Sektorübergreifende Kopplung als Kern; Verweis auf Ursache-SOP, Sektor-SOP und Bausteine |

Übertrag, Abschlusscheck und Querschnittsprüfungen nach Teil A.4, A.5 und A.9.

### 5. Ansprechstellen und Pflege

**Ansprechstellen:** Betroffene Betreiber und Sektoraufsicht · BSI (IT-Bezug) · BBK (sektorübergreifende Grundlagen) · Lagezentren der Länder

**Offene Punkte:** Baustein Zahlungsverkehr bei Bedarf ausarbeiten. Rechtsrahmen (KRITIS-Dachgesetz, BSI-Gesetz in der Fassung der NIS-2-Umsetzung) fallbezogen nur als amtlich geprüfter Kontext verwenden; Pflichten und Schwellen daraus sind keine Radar- oder Aufnahmekriterien.
