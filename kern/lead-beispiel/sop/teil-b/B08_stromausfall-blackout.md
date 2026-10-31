<a id="b08"></a>

## B08. SOP LEAD: Stromausfall / Blackout

```yaml
kennung: "B08"
typ: "Dach-SOP"
lesegruppe: "Katalog-Einstiege"
lageart: "Stromausfall / Blackout (großflächiger oder langandauernder Netzausfall)"
art_vorschlag: ["Stromausfall / Blackout"]
zweck: "Reproduzierbare Erfassung großflächiger oder langandauernder Stromausfälle, ihrer Ersatzversorgung und ihrer zeitverzögerten Kaskadeneffekte."
version: "2.2.0"
status: "Beispielfassung"
stand: "23.10.2026"
pflegeverantwortlich: "Herausgeber der Beispielfassung (bei Übernahme: fachlich zuständige Funktion eintragen)"
quellen_geprueft_am: "22.10.2026 – Art. 18 VO (EU) 2017/1485 und § 13 EnWG am Normtext gelesen; Rechercheeinstiege 26.09.2026 teilweise, Ergänzungen 19.10.2026 vor Erstverwendung prüfen (A.6)"
naechste_pruefung_faellig: "31.03.2027"
pruefausloeser: "Änderung von § 13 EnWG, des EnSiG oder der EU-Netzkodizes (VO (EU) 2017/1485, 2017/2196); Rückblick nach A.8.3; Änderung von Kodierleitfaden, Darstellungsdatei oder Schema"
bisherige_kennung: "08"
bisherige_ids: ["sop-08"]
```

### 1. Anwendungsbereich und Befassungsanlässe

**Umfasst / grenzt ab von:** Stromausfälle, die nach Dauer, Fläche oder Folgewirkung über kurze örtliche Störungen hinausgehen, bis zur Systemstörung. Die Ursache wird bei belegtem Zusammenhang zusätzlich über die passende SOP geprüft, z. B. B06 (Winterwetter), B15 (IT-Sicherheitsvorfall), B16 (behördlich benannter Vorsatz) oder C03 (fachlich belegter Weltraumwetterbezug; Gleichzeitigkeit allein belegt keine Ursache). Eine angekündigte Lastabschaltung oder eine Warnung vor Gefährdung der Systemsicherheit ist vom bereits wirksamen Ausfall zu trennen; sie kann eine frühe Befassung nach A.1 Nr. 1 begründen. Beispiel dafür: mehrtägiger Ausfall nach Mastbruch (Münsterland 2005). Beispiel dagegen: Störung, die in wenigen Stunden ohne Folgeausfälle behoben ist; Strompreise allein belegen keinen Ausfall.

**Befassungsanlässe:** Störungsmeldung eines Netzbetreibers · Warnung eines Übertragungsnetzbetreibers vor Gefährdung der Systemsicherheit oder angekündigte Lastabschaltung · Lagemeldung eines Landes bzw. landesrechtlich festgestellte herausgehobene Lage (A.9.4) · BNetzA-Mitteilung · Monitoring: Störungsmeldungen der Netzbetreiber und VOST-Auswertung.

### 2. Erfassung: Prüffragen

**Systemzustand und rechtlicher Prüfpfad.** Zwei Fachgrundlagen (A.6) strukturieren die Erfassung; sie bestimmen keinen Radarwert. (1) Der Systemzustand des Übertragungsnetzes nach Art. 18 der Verordnung (EU) 2017/1485 wird vom Übertragungsnetzbetreiber festgestellt; er gilt für die Regelzone und sagt nichts über einen örtlichen Ausfall im Verteilnetz aus. (2) Drei Ebenen getrennt belegen, analog B09 und C12: netz- und marktbezogene Maßnahmen des Übertragungsnetzbetreibers (§ 13 Abs. 1 EnWG) · Anpassungsmaßnahmen einschließlich Lastabschaltung, wenn diese nicht ausreichen (§ 13 Abs. 2 EnWG) · hoheitliche Maßnahmen nach dem Energiesicherungsgesetz, über deren Erforderlichkeit der Übertragungsnetzbetreiber die Regulierungsbehörde unterrichtet (§ 13 Abs. 8 EnWG). Eine kontrollierte Abschaltung ist eine Maßnahme (M) mit Beginn, Gebiet und Zielgruppe; ein unkontrollierter Ausfall ist Wirkung. Im Meldungstext immer mit Fachgrundlage und feststellender Stelle schreiben, z. B. „Notzustand (Art. 18 VO (EU) 2017/1485) laut Übertragungsnetzbetreiber“.

| Systemzustand (Art. 18 VO (EU) 2017/1485) | Feststellende Stelle und Voraussetzung | Abgrenzung für die Befassung |
|---|---|---|
| Normalzustand (Abs. 1) | Übertragungsnetzbetreiber; Voraussetzung: Spannung, Leistungsflüsse und Frequenz innerhalb der betrieblichen Sicherheitsgrenzen; Reserven reichen für die Ausfallvarianten-Liste | Ein örtlicher Verteilnetzausfall kann bei Normalzustand des Übertragungsnetzes bestehen; der Systemzustand entwarnt den Referenzraum nicht. |
| Gefährdeter Zustand (Abs. 2) | Übertragungsnetzbetreiber; Voraussetzung: Sicherheitsgrenzen eingehalten, aber Reserven länger als 30 Minuten um mehr als 20 % reduziert, Frequenzabweichung über die Auslösezeit hinaus oder ein Ausfall der Liste führt trotz Entlastung zur Grenzverletzung | Frühe Befassung nach A.1 Nr. 1 möglich; ohne belegten Ausfall bleiben D1 und D2 offen. Angekündigte Lastabschaltung ist Maßnahme, nicht Wirkung. |
| Notzustand (Abs. 3) | Übertragungsnetzbetreiber; Voraussetzung: Sicherheitsgrenze verletzt, Frequenz außerhalb der Kriterien, Maßnahme des Systemschutzplans aktiviert oder Betriebsmittel länger als 30 Minuten ausgefallen | Welche Maßnahme des Systemschutzplans greift (z. B. Lastabwurf) und wo sie wirkt, mit Betreiberangabe belegen; Zustand gilt für die Regelzone, nicht je Ort. |
| Blackout-Zustand (Abs. 4) | Übertragungsnetzbetreiber; Voraussetzung: Mehr als 50 % der Last in der Regelzone ausgefallen oder mindestens drei Minuten Spannungslosigkeit in der Regelzone mit Aktivierung der Netzwiederaufbaupläne | Belegter Ausfall je Netzbereich (R1) bleibt die Grundlage für D1; der Systemzustand ersetzt keine Störungs- und Wiederaufbaumeldung. |
| Netzwiederaufbau-Zustand (Abs. 5) | Übertragungsnetzbetreiber hat Maßnahmen seines Netzwiederaufbauplans begonnen | Wiederaufbau ≠ Wiederversorgung ≠ Folgenbeseitigung (R7, D5); Teilwiederversorgung je Netzbereich mit Stand angeben. |

Die Systemzustände dieser Tabelle sind keine Ereignisarten, Radarstufen oder SOP-Kennungen; ein Zustandswechsel ist nur dann Dynamik (D8), wenn er im zurückliegenden Beobachtungszeitraum beobachtet wurde.

**Gleichlautender Begriff „Kaskade“.** In Netzbetrieb und Netzkodizes bezeichnet „Kaskade“ die gestufte Weitergabe von Anpassungsmaßnahmen vom Übertragungs- an die Verteilnetzbetreiber; in dieser Mappe bezeichnet „Kaskade“ ohne Zusatz Folgewirkungen im Sinne der Wirkungskette (A.2, D6; A.10.1). In der Meldung die Bedeutung kenntlich machen.

| ID | Leitfrage | Quelle & Aktualität | Prüfen für | Hinweis/Stolperstelle |
|---|---|---|---|---|
| R1 | Welche Netzbereiche sind seit wann ohne Versorgung; welcher Systemzustand des Übertragungsnetzes ist festgestellt, und welche Maßnahmenebene nach § 13 EnWG ist belegt? | Betreibermeldungen (A.3) (Übertragungs-/Verteilnetz); BNetzA | L; D1/D3 | Nachlaufende Informationen verändern D1/D5; Stand angeben. Systemzustand nach der Tabelle oben und Maßnahmenebene nach dem Prüfpfad oben (§ 13 EnWG), jeweils mit Quelle und Stand; kontrollierte Abschaltung von unkontrolliertem Ausfall trennen. |
| R2 | Wie viele Personen sind direkt betroffen? | Lagemeldungen (A.3); Netzbetreiber | R; D2 | Anschlüsse/Haushalte ≠ Personen; MW-Angaben ≠ Personen; Umrechnung nur nach A.3 Zählregeln. Die Zahl „versorgter Personen“ aus dem KRITIS-Recht ist eine Betreiberangabe (B) zur Anlage, kein Betroffenennachweis. |
| R3 | Welche kritischen Dienste sind bereits eingeschränkt? | Lagemeldungen (A.3); Wasserversorger, TK-Anbieter, Kliniken | R/I; D6 | Folgen setzen zeitverzögert ein (Notstrom-, Wasser-, Akkureserven). |
| R4 | Trägt die bewertungsentscheidende Ersatzversorgung die benötigte Funktion, und wie lange? | Betreibermeldungen (A.3); Kliniken, Wasserversorger; [BBK Stromausfall](https://www.bbk.bund.de/DE/Themen/Kritische-Infrastrukturen/KRITIS-Gefahrenlagen/Stromausfall/stromausfall_node.html) (Hintergrund) | R/M; D5/D6 | Unter realer Last? Angeschlossen und in Betrieb? Wer betreibt und wartet sie? Wie lange reicht verfügbarer Kraftstoff, und kann rechtzeitig nachversorgt werden (C12)? Vorhanden, betriebsbereit, eingesetzt und wirksam getrennt halten; Nennlaufzeit ist keine gesicherte Reichweite; keine pauschalen 24-/72-Stunden-Annahmen. |
| R5 | Welche Mobilisierung und Warnung bestehen? | [Warnportal des Bundes](https://warnung.bund.de/) und herausgebende Behörde; anlassbezogen; GMLZ, THW | M; D4 | Herkunft der eingesetzten Aggregate/Kräfte für D4 maßgeblich; Bedarfsdeckung nach A.9.1. |
| R6 | Welche Netz- und Systemeinordnung ist hilfreich? | [SMARD](https://www.smard.de/); ENTSO-E-Transparenzplattform; BNetzA | L/R | Markt- und Frequenzdaten ersetzen keine Störungs- und Wiederaufbaumeldung und keine Feststellung des Systemzustands durch den Übertragungsnetzbetreiber. |
| R7 | Wie ist der Stand von Netzwiederaufbau und Wiederzuschaltung, welche Anlaufstellen für die Bevölkerung sind betriebsfähig? | Betreibermeldungen (A.3); Lagemeldungen (A.3) | L/M; D5 | Teilwiederversorgung ≠ Folgenbeseitigung; Anlaufstellen nur bei belegtem Betrieb nennen. |

### 3. Auswertung: Prüfpunkte

Alle acht Achsen nach Teil A.2 prüfen; hier besonders:

- **D2:** Personen nur mit Quelle oder offengelegter Umrechnung; sonst offen.
- **D3:** Bewertete Funktion nennen (Netzbetrieb und Systemverantwortung, hoheitliche Maßnahme nach EnSiG, zivile Schutz- und Versorgungsfolge). Systemzustand, Maßnahmenebene nach § 13 EnWG und Beteiligung der BNetzA bestimmen D3 nicht automatisch.
- **D5:** Technische Wiederversorgung ist nicht Folgenbeseitigung (Wasser, Telekommunikation, Verkehr) – Zielzustand benennen.
- **D6:** Mit zunehmender Dauer kann der Kopplungsgrad steigen (Reserven erschöpft); D6 wird aber nicht allein aus der vergangenen Ausfalldauer erhöht – jedes Glied der Kette belegen.

**Beurteilung/Tendenz:** Dauer und Folgekette tragen die Beurteilung, nicht die Ausfallleistung: ein kurzer flächiger Ausfall ohne Folgen kann geringfügig, ein lokaler mehrtägiger erheblich sein. Teilwiederversorgung bei erschöpften Reserven ist nur begrenzte Entspannung.

**Offenlassen:** D2 ohne Personengrundlage; D5 ohne Betreiberprognose; fehlende Statusmeldungen nicht als Ende des Ausfalls lesen.

### 4. Darstellung

| Meldungsbereich | Lageart-spezifische Leitfrage |
|---|---|
| Lage & Ereignis | Raum, Anschlüsse/Personen, Ursache (belegt/vorläufig), Wiederversorgungsstand mit Zeitachse |
| Risiken & Auswirkungen | Kaskade mit Zeitverzug; Menschen mit besonderen Bedarfen (Heimbeatmung, Pflege) – belegt vs. mit Dauer erwartbar |
| Maßnahmen & Handlungsempfehlungen | Betriebsfähigkeit der Notstromversorgung kritischer Einrichtungen, Kraftstoffnachschub, Anlaufstellen, länderübergreifender Lageabgleich |
| Abhängigkeiten & Interdependenzen | Folgekette Strom → Wasser/Abwasser/TK/Gesundheit/Verkehr; Ursache-SOP benennen |

Übertrag, Abschlusscheck und Querschnittsprüfungen nach Teil A.4, A.5 und A.9.

### 5. Ansprechstellen und Pflege

**Ansprechstellen:** Übertragungs- und Verteilnetzbetreiber · BNetzA · Lagezentren der Länder · GMLZ · THW · BSI bei IT-Bezug

**Fachgrundlagen** (A.6; sie bestätigen kein aktuelles Ereignis und werden im Quellenverzeichnis der Meldung nur geführt, wenn eine Aussage darauf beruht):

- Verordnung (EU) 2017/1485 (Leitlinie für den Übertragungsnetzbetrieb), [Art. 18 Systemzustände](https://gesetze.legal/eu/vo_eu_2017_1485/18) – trägt die Tabelle der Systemzustände; Verordnung (EU) 2017/2196 (Netzkodex über den Notzustand und den Netzwiederaufbau) ist Kontext, Fundstelle vor Verwendung prüfen (A.6). Amtliche Fundstelle ist EUR-Lex (CELEX 32017R1485, 32017R2196); der genannte Link ist ein Rechercheeinstieg.
- Energiewirtschaftsgesetz, [§ 13 Systemverantwortung der Betreiber von Übertragungsnetzen](https://www.gesetze-im-internet.de/enwg_2005/__13.html) (Abs. 1, 2, 4, 7, 8) – trägt den rechtlichen Prüfpfad; hoheitliche Maßnahmen nach dem Energiesicherungsgesetz wie in C12.

**Offene Punkte:** Belegte Lagenradar-Profile früherer Stromausfälle mit reproduzierbarer Kodierung als Kalibrierbeispiele außerhalb dieser SOP zusammenstellen (A.10.3). Kontrastfälle für die Systemzustandstabelle: gefährdeter Zustand mit angekündigter Lastabschaltung ohne Ausfall · örtlicher Verteilnetzausfall bei Normalzustand · Netzwiederaufbau bei fortbestehendem Ausfall einzelner Netzbereiche.
