<a id="c12"></a>

## C12. Baustein LEAD: Kraftstoff- und Wärmeversorgung

```yaml
kennung: "C12"
typ: "Themenbaustein"
bausteintyp: "Themenbaustein unter bestehendem Dach"
lesegruppe: "Versorgung, Kommunikation und Logistik"
lageart: "Gefährdung oder Störung der Kraftstoffversorgung (Einsatz, Notstrom, kritische Mobilität) und der Wärmeversorgung unabhängig von der Ursache; Gasversorgung selbst B09"
art_zuordnung: ["KRITIS-Ausfall", "Gasversorgungsengpass", "Stromausfall / Blackout", "Sonstiges"]
art_hinweis: "„KRITIS-Ausfall“ bei belegtem Ausfall oder wesentlicher Einschränkung kritischer Dienstleistungen; „Gasversorgungsengpass“ nur bei Gasbezug; „Stromausfall / Blackout“ nur bei tatsächlich eingetretenem Stromausfall; „Sonstiges“ nur begründet, wenn kein vorhandenes Dach passt"
anschluss: "B08, B09, B12, B17; C09, C13, C16, C17 nach konkretem Bezug"
zweck: "Mangelprodukt, Wirkungsraum, Engpass der Versorgungskette und rechtzeitig wirksame Deckung kritischer Funktionen erfassen; Maßstab ist der Zeitpunkt bis zum Ausfall einer kritischen Funktion."
version: "1.2.0"
status: "Beispielfassung – vor Verwendung organisationsspezifisch konkretisieren und fachlich prüfen"
stand: "22.10.2026"
pflegeverantwortlich: "Herausgeber der Beispielfassung (bei Übernahme: fachlich zuständige Funktion eintragen)"
quellen_geprueft_am: "20.10.2026 – BBK PiB 18, ErdölBevG § 12, EnSiG §§ 1, 3, 4, MinÖlAV § 14, WiSiG § 2, MinÖlBewV § 11; keine Prüfung organisationsspezifischer Melde- und Anforderungswege"
naechste_pruefung_faellig: "31.03.2027"
pruefausloeser: "Änderung von ErdölBevG, EnSiG, MinÖlAV, WiSiG oder MinÖlBewV; Freigabe der Erdölreserve oder Energiesicherungsmaßnahme im Anwendungsfall; Rückblick nach A.8.3; Änderung von Kodierleitfaden, Darstellungsdatei oder Schema"
bisherige_kennung: "N05"
bisherige_ids: ["baustein-n05"]
```

### 1. Anwendungsbereich und Befassungsanlässe

**Umfasst / grenzt ab von:** Gefährdung oder Unterbrechung der Kraftstoffversorgung für Rettung, Einsatz, Notstrom, kritische Mobilität und andere lebenswichtige zivile Funktionen; Ausfall oder unzureichende Leistung von Fernwärme oder anderer Wärmeversorgung. Mangelprodukt und räumliche Ausdehnung feststellen; Mengenmangel, Raffinerie- oder Tanklagerausfall, fehlende Transportkapazität, Strom- oder IT-Ausfall an Tankstellen und kurzfristige Nachfragespitze unterscheiden. Die Versorgung kann gefährdet sein, obwohl rechnerisch ausreichend Kraftstoff im Land lagert. Entscheidungsmaßstab ist insbesondere der Zeitpunkt bis zum Ausfall einer kritischen Funktion. Keine eigene Zuteilungs-, Vorrang- oder Rechtsanwendungsentscheidung und keine technische Wiederanfahranweisung.

**Befassungsanlässe:** Belegte Versorgungsunterbrechung oder drohender Nachschubabriss mit Schutzbezug · bedrohte Rettungs- oder kritische Notstromversorgung · Ausfall von Raffinerie, Tanklager, Transport, Tankstellenstrom oder -IT mit belegten Folgen · Nachfragespitze mit belegten Versorgungsfolgen · Ausfall der Wärmeversorgung · verteidigungsbezogene zivile Versorgungsfolgen (C17).

**Zuordnung im Schema:** „KRITIS-Ausfall“ bei belegtem Ausfall oder wesentlicher Einschränkung kritischer Dienstleistungen; „Gasversorgungsengpass“ nur bei Gasbezug; „Stromausfall / Blackout“ nur bei eingetretenem Stromausfall (eine bedrohte Nachbetankung ist keiner); „Sonstiges“ begründet, wenn kein vorhandenes Dach passt.

### 2. Erfassung: Prüffragen

**Prüfreihenfolge:** Produkt und Wirkungsraum (R7) → Engpass in der Kette (R7, R3) → betroffene Funktion und Bedarf (R1) → wirksame Deckung und Restlücke (R2, R4) → Zeit bis zum Funktionsausfall gegen früheste wirksame Nachversorgung (R8, R6) → Ersatz- und staatliche Maßnahmen (R9, R10). Ist eine akute Gefährdung bereits bekannt, wird sie sofort nach A.7.3 weitergegeben; die übrige Erfassung läuft danach weiter. Mehrere Engpässe können zusammenwirken; eine ungeklärte Ursache bleibt offen und verhindert nicht die Darstellung belegter Folgen. Für den eigenen Abgabe- und Wiederherstellungsstand ist der Betreiber meist die unmittelbarste Quelle (B, A.3).

| ID | Leitfrage | Quelle & Aktualität | Prüfen für | Hinweis/Stolperstelle |
|---|---|---|---|---|
| R1 | Welche kritische Funktion benötigt welches Produkt (Spezifikation) in welchem Zeitraum, und welcher Mindestbetrieb ist bestätigt? | Lagemeldungen (A.3); Betreibermeldungen (A.3) (Bedarfsträger) | R/I; D6 | Bedarf je Funktion, nicht pauschal je Region. Diesel, Ottokraftstoff, Heizöl und andere Brennstoffe getrennt; Mengen mit Einheit und Zeitraum; Austauschbarkeit nur nach Betreiberangabe. |
| R2 | Welche Bestände sind am relevanten Ort physisch nutzbar und tatsächlich abgabefähig? | Betreibermeldungen (A.3) (Lager, Tankstellen, Anlagen) mit Standzeit | R/M; D5 | Gesamtbestand ≠ nutzbarer Bestand ≠ freie Menge ≠ rechtzeitig beim Empfänger. Rohöl ist kein nutzbarer Kraftstoff. |
| R3 | Funktioniert die Kette vom Lager bis zur Nutzung: Energie für Pumpen und Sicherheitsfunktionen, IT, Berechtigung und Abrechnung, Personal, Zufahrt, Transport, Entladung? | Betreibermeldungen (A.3); Lagemeldungen (A.3); [BBK: Treibstoffversorgung bei Stromausfall](https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/PiB/PiB-18-treibstoffversorgung-stromausfall.pdf?__blob=publicationFile&v=14) (Hintergrund) | R/I; D6 | Ohne wirksame Energieversorgung der Abgabe- und Sicherheitsfunktionen ist die reguläre Abgabe nicht gesichert. Ersatzbetrieb zählt nur, wenn der Betreiber ihn als wirksam bestätigt; ein vorhandenes Aggregat allein genügt nicht. Zufahrt und Transport nach C13. |
| R4 | Welche Mengen und Leistungen sind bereits gebunden, welcher Bedarf bleibt je Produkt, Funktion und Zeitfenster ungedeckt? | Lagemeldungen (A.3); Betreibermeldungen (A.3) | M | Bedarfsdeckung nach A.9.1; keine eigene Priorisierung. Wirtschaftliche Reservierung, behördliche Zuweisung und gewünschte Priorität unterscheiden. Vorräte, Tankwagen, Personal und Aggregate nicht doppelt zählen (A.7.4). |
| R5 | Welche Wärmeleistung erreicht betroffene Einrichtungen und Haushalte tatsächlich, und wann droht eine kritische Beeinträchtigung? | Betreibermeldungen (A.3) (Fernwärme, Stadtwerke); zuständige Gesundheits- und Betreuungsstellen | R; D2/D6 | Erzeugung, Netz und Pumpen, Stromabhängigkeit, Brennstoff- bzw. Speicherreichweite und Witterung prüfen. Haushalte oder Leistung nicht ungeprüft in Personen umrechnen. Ersatzwärme und Wärmeschutzorte nur bei belegtem Betrieb (A.9.2); C09/C16. |
| R6 | Wann wird Nachversorgung tatsächlich nutzbar, und wann ist die sichere Wiederherstellung des benannten Zielzustands zu erwarten? | Betreibermeldungen (A.3); zuständige Fachbehörde; Prognosegeber, Ausgabezeit, Unsicherheit | M; D5 | Anfrage, Bestellung, Zusage, Abfahrt, Ankunft und wirksame Versorgung unterscheiden. Wiederinbetriebnahme nur nach Betreiber- bzw. Fachangabe. |
| R7 | Welches Produkt ist knapp, in welchem tatsächlichen Versorgungsraum, und wo liegt der Engpass? | Betreibermeldungen (A.3); Lagemeldungen (A.3); Wirtschafts- und Energieverwaltung; gleiche Bezugszeiten | L/R; D1/D7 | Mengenmangel, Raffinerie- oder Tanklagerausfall, Transport, Strom, IT/Abrechnung und Nachfragespitze getrennt; bestätigt, vermutet oder offen. Ein Raffinerieausfall belegt noch keinen Mangel beim Verbraucher; der Standort einer Anlage ist nicht der Wirkungsraum. |
| R8 | Wie lange trägt der bestätigte Mindestbetrieb unter aktueller Last, wann fällt welche Funktion aus, und trifft wirksame Nachversorgung vorher ein? | Betreibermeldungen (A.3) (Funktionsverantwortliche); zuständige Fach- bzw. Führungsstelle | R/M; D6 | Restreichweite gegen früheste wirksame Nachversorgung einschließlich Transport, Umschlag und Inbetriebnahme. Unsichere Angaben als Bandbreite, fehlende offenlassen; keine Zeit erfinden. Droht der Ausfall vor der Nachversorgung: Kennsatz `Handlungsrelevant bis:` und Weitergabe nach A.7.3, auch ohne bundesweite Knappheit und bei ungeklärtem Rechtsstatus. |
| R9 | Welche Ersatzbeschaffungen und Entlastungen sind geprüft, zugesagt oder wirksam, und warum schließen sie die Lücke nicht rechtzeitig? | Betreibermeldungen (A.3) (Beschaffung); Wirtschafts- und Energieverwaltung; Zeitpunkt und Ergebnis | M | Lieferantenwechsel, andere Lager und Wege, Transport, bestätigte Verbrauchsminderung. Eine erfolglose Anfrage belegt kein Marktversagen; eine Zusage mit Ankunft nach dem Funktionsausfall ist keine Deckung. Akute Gefahr nicht erst nach Prüfung aller Optionen melden. |
| R10 | Welche staatlichen Maßnahmen sind im Fall bestätigt (Entscheidung, Produkt, Gebiet, Zeitraum, zuständige Stelle), und was ist nur Prüfbedarf? | Zuständige Behörde mit Fundstelle der Entscheidung; Wirtschafts- und Energieverwaltung von Bund und Land | M; D3 | Getrennt erfassen: Freigabe der Erdölreserve (§ 12 ErdölBevG, Rechtsverordnung; auch für lokale Krisensituationen, Verkauf zu Marktpreisen), Maßnahmen nach EnSiG und MinÖlAV, verteidigungsbezogene Bewirtschaftung (WiSiG, MinÖlBewV) und örtliche Gefahrenabwehr. Vorrat ist keine Freigabe, Freigabe keine Lieferung. Keine Anwendung aus der Schwere der Lage ableiten. |
| R11 | Bestehen bestätigte verteidigungsbezogene zivile Versorgungsfolgen oder zusätzliche Bindungen gemeinsamer Ressourcen? | Lagemeldungen (A.3) (zuständige zivile Stellen); Betreibermeldungen (A.3) | R/M; D6 | C17 ergänzen. Zivile Mindestversorgung und zusätzliche Beanspruchung getrennt; dieselbe Menge, derselbe Tankwagen oder dasselbe Personal nur einmal (A.7.4). Keine pauschale Vorrangregel; konkurrierende Bedarfe an die zuständige Stelle. |

**Prüfpfade nach Lage** (kombinierbar, keine Eskalationsstufen):

| Lage | Schwerpunkt | Stolperstelle |
|---|---|---|
| Tankstellen ohne Strom, Lager gefüllt | R3, R2, R8 | Volle Lager sind keine Versorgung; ein bestätigter Ersatzbetrieb zählt mit seiner tatsächlichen Abgabeleistung. |
| Regionale Dieselknappheit trotz Ersatzbeschaffung | R7, R1, R4, R9, R6, R8 | Bestellung oder Zusage zählt erst mit rechtzeitiger, nutzbarer Ankunft. |
| Bundesweit länger anhaltender Mengenausfall | R7, R1, R4, R9, R10 | Nationale Aussage und örtliche Wirkung getrennt; keine Reservefreigabe oder Maßnahme ohne Beleg behaupten. |
| Rettung oder kritische Notstromversorgung unmittelbar bedroht | R8 zuerst, dann R1, R3, R6 | Örtliche Gefahr auch bei ausreichender nationaler Bilanz; Weitergabe nach A.7.3 vor Abschluss der Erfassung. |
| Verteidigungsbezogene Versorgungslage | R11, R10, R4 mit C17 | Lagebezeichnung aktiviert keine Befugnisse; Doppelbindung ausweisen. |

### 3. Auswertung: Prüfpunkte

Teil A und der Kodierleitfaden gelten. Produkt, Ursache, Preis, Bundesbeteiligung oder Verteidigungsbezug erhöhen keinen Achsenwert für sich.

- **D1:** Belegter Wirkungsraum im Referenzraum; nationale Mengenprognose und Standort eines Tanklagers allein sind kein Wirkungsraum.
- **D2:** Belegt betroffene Personen; Anlagen, Fahrzeuge, Anschlüsse oder Haushalte nicht ungeprüft gleichsetzen. Bedrohte Personen als Risiko im Text.
- **D3:** Bewertete Funktion nennen (Betrieb, Beschaffung, Gefahrenabwehr, Versorgungssteuerung); Beteiligung von Bundesstellen allein setzt keinen Wert.
- **D4:** Nur tatsächlich eingesetzte ereignisbezogene externe Unterstützung; reguläre Ersatzbeschaffung, Import oder zugesagte Hilfe zählen nicht.
- **D5:** Belegte Restdauer bis zum benannten Zielzustand (z. B. Nachversorgung gesichert, Wärme wiederhergestellt). Die Restreichweite eines Tanks ist kein D5-Wert; die zeitkritische Frist steht im Kennsatz `Handlungsrelevant bis:` (R8).
- **D6:** Kraftstoff ist Puffer vieler KRITIS-Funktionen; Wirkungskette mit abhängiger Funktion, Puffer und Reichweite (A.2). Eine Dieselknappheit belegt keinen eingetretenen Stromausfall.
- **D7:** Entscheidungsrelevante Lücken zu Produkt, nutzbarem Bestand, Reichweite, Abgabe oder Ankunft; eine unbekannte Ursache allein ist keine Lücke dieser Art.
- **D8:** Beobachtete Änderung von Leistung, Mengen oder Lücke im Vergleichszeitraum; eine stabile Knappheit ist keine hohe Dynamik, eine prognostizierte Erschöpfung gehört in Risiken und `Neubewertung bei:`.

**Offenlassen:** D2 ohne belegten Personenkreis; D5 ohne Liefer- oder Wiederinbetriebnahmeprognose; Mengen und Reichweiten ohne Beleg. Unbekannt ist nicht null; zugesagte Versorgung ist nicht wirksam.

### 4. Darstellung

Nach der Dach-SOP in den vorhandenen Feldern:

- **Lage & Ereignis:** Mangelprodukt, Versorgungsraum, Engpass (bestätigt, vermutet, offen), betroffene Funktion mit bestätigtem Mindestbetrieb.
- **Risiken & Auswirkungen / Abhängigkeiten:** Bedarf, nutzbarer Bestand, Abgabe- und Transportleistung und Restlücke je Produkt und Zeitfenster getrennt; Restreichweite gegen früheste wirksame Nachversorgung mit Prognosegeber und Unsicherheit.
- **Maßnahmen & Handlungsempfehlungen:** wirksame, zugesagte und geprüfte Maßnahmen mit Anwendungsstand und zuständiger Stelle; offene Entscheidung.
- **Bewertung:** Kennsätze nach Teil A. `Handlungsrelevant bis:` mit betroffener Funktion, wenn der Ausfall vor der Nachversorgung droht; `Neubewertung bei:` etwa geänderter Restreichweite, verpasstem Liefertermin, bestätigtem Ersatzbetrieb oder neuer behördlicher Entscheidung.

### 5. Ansprechstellen und Pflege

**Ansprechstellen (funktional):** Betreiber und Bedarfsträger (Mindestbetrieb, Reichweite, Wiederherstellung) · Lieferanten, Tanklager, Tankstellen, Transporteure (Produkt, Abgabe, Ankunft) · Wirtschafts- und Energieverwaltung von Bund und Land (Versorgungsmaßnahmen, Freigabe der Erdölreserve) · Gefahrenabwehr und Katastrophenschutz, Rettungsdienst und Gesundheitsbehörden bei akuter Gefährdung · Stelle der zivilen Verteidigung bei verteidigungsbezogenen Folgen (C17). Die Lastverteilung der BNetzA bei Strom und Gas ist keine Kraftstoffzuteilung. Melde- und Anforderungswege organisationsspezifisch hinterlegen, nicht aus einer Websuche übernehmen.

**Fachgrundlagen** (A.6; sie bestätigen kein aktuelles Ereignis und werden im Quellenverzeichnis der Meldung nur geführt, wenn eine Aussage darauf beruht):

- BBK: [Treibstoffversorgung bei Stromausfall](https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/PiB/PiB-18-treibstoffversorgung-stromausfall.pdf?__blob=publicationFile&v=14) (Praxis im Bevölkerungsschutz, Band 18); zur Notstromreserve [Nationale Reserve Blackout](https://www.bbk.bund.de/DE/Das-BBK/Zivile-Verteidigung/ZS-Notstrom/zs-notstrom.html) (Aggregate, keine Kraftstofflieferung)
- [§ 12 ErdölBevG](https://www.gesetze-im-internet.de/erd_lbevg_2012/__12.html) (Freigabe der Vorräte)
- EnSiG: [§ 1](https://www.gesetze-im-internet.de/ensig_1975/__1.html), [§ 3](https://www.gesetze-im-internet.de/ensig_1975/__3.html), [§ 4](https://www.gesetze-im-internet.de/ensig_1975/__4.html)
- [§ 14 MinÖlAV](https://www.gesetze-im-internet.de/min_lav/__14.html) (Anwendung an Notmaßnahmen der Internationalen Energieagentur und eine Verordnung nach EnSiG gebunden; keine allgemeine Dringlichkeitsschwelle)
- [§ 2 WiSiG](https://www.gesetze-im-internet.de/wisig_1965/__2.html), [§ 11 MinÖlBewV](https://www.gesetze-im-internet.de/min_lbewv_1988/__11.html) (Anwendung nach Art. 80a GG und Bestimmung durch Rechtsverordnung)

**Offene Punkte:** Landes- und organisationsspezifische Zuständigkeiten, Anforderungswege und Betreibervereinbarungen ergänzen. Erprobung an Kontrastfällen: Tankstellen ohne Netzstrom mit und ohne bestätigten Ersatzbetrieb · regionale Diesellücke mit zugesagter, aber zu später Lieferung · bundesweiter Mengenausfall ohne mitgeteilte Reservefreigabe · Rettungswache mit drohendem Betriebsausfall bei ausreichender nationaler Bilanz · verteidigungsbezogener Zusatzbedarf mit doppelt zugesagtem Tankwagen · Ausfall nur der Abrechnungs-IT · Nachfragespitze mit Wartezeiten · Fernwärmeausfall mit Brennstoff, aber gestörten Pumpen bei einer Pflegeeinrichtung.
