<a id="b01"></a>

## B01. SOP LEAD: Unwetter / Sturm

```yaml
kennung: "B01"
typ: "Dach-SOP"
lesegruppe: "Katalog-Einstiege"
lageart: "Unwetter / Sturm (Sturm, Orkan, Gewitter, Starkregen, Hagel, Tornado)"
art_vorschlag: ["Unwetter / Sturm"]
zweck: "Reproduzierbare Erfassung und Bewertung meteorologischer Unwetterlagen mit Schadens-, Versorgungs- und Betroffenenbezug für den deutschen Bevölkerungsschutz, einschließlich begründeter früher Befassung (A.1 Nr. 1)."
version: "2.2.0"
status: "Beispielfassung"
stand: "26.10.2026"
pflegeverantwortlich: "Herausgeber der Beispielfassung (bei Übernahme: fachlich zuständige Funktion eintragen)"
quellen_geprueft_am: "21.10.2026 – fachliche Teilprüfung und einzelquellenbezogener Abgleich; offene Nachprüfungen siehe A.6/Quellenregister"
naechste_pruefung_faellig: "31.03.2027"
pruefausloeser: "Rückblick nach A.8.3; Änderung von Kodierleitfaden, Darstellungsdatei oder Schema; Änderung der DWD-Warnprodukte"
bisherige_kennung: "01"
bisherige_ids: ["sop-01"]
```

### 1. Anwendungsbereich und Befassungsanlässe

**Umfasst / grenzt ab von:** Sturm/Orkan, Gewitter, Starkregen, Hagel und Tornados einschließlich ihrer Folgen (Baum-, Leitungs-, Verkehrsschäden). Winterliche Lagen mit B06. **Abgrenzung zu B02:** Starkregen ohne konkrete Überflutungswirkung bleibt B01. Sobald eine Überflutung von Siedlungs- oder Verkehrsflächen belegt oder fachlich konkret prognostiziert ist, wird zusätzlich B02 (Recherchepfad Sturzflut) herangezogen – nicht erst nach eingetretener Überflutung. Wetterphase und Wirkung getrennt darstellen; denselben Schaden nicht doppelt zählen. Beispiel dafür: Orkan mit flächigen Baumwürfen, Bahnsperrungen und regionalen Stromausfällen; ebenso eine belastbare Unwetterwarnung mit absehbaren kritischen Auswirkungen vor Schadenseintritt (A.1 Nr. 1). Beispiel ohne übergreifenden Befassungsbedarf: örtlich begrenzte Warnung ohne erkennbaren zusätzlichen Vorbereitungs-, Abstimmungs- oder Versorgungsbedarf im Betrachtungszeitraum; örtliches Ereignis ohne überörtliche Folgen.

**Befassungsanlässe:** DWD-Unwetterwarnung bzw. Warnlagebericht mit absehbarer Wirkung · bestätigte Schadenshäufung oder landesrechtlich festgestellte herausgehobene Lage (A.9.4) · länderübergreifende Folgen in Verkehr/Energie · Anfrage eines Landes · Monitoring: DWD-Warnlage und Lagemeldungen der Länder.

**Übergang zu B06 und Folgen.** Bei winterlichen Phänomenen B06 heranziehen; bei Wind plus Schnee/Eis beide Prüfperspektiven nutzen, aber nur einen gemeinsamen Sachverhalt führen, soweit Gegenstand und Prüfauftrag gleich bleiben. Einen Folgesachverhalt nur nach A.8.1 abtrennen. Überflutungswirkung B02, Hang-/Bauwerksversagen C02, kritische Verkehrsfolge C13 und Schutzunterbringung C16 nur bei konkretem Bezug vertiefen. Zugänglichkeit und wirksame Vorbereitungszeit für gefährdete Einrichtungen mit zuständiger Stelle prüfen; aus einer Warnung allein entstehen keine Betroffenen- oder Ausfallzahlen.

### 2. Erfassung: Prüffragen

**Warn- und Beobachtungsprofil.** Produktart (Vorabinformation, Warnung, Warnlagebericht oder Mess-/Radarbeobachtung), herausgebende Stelle, Ausgabe-/Änderungszeit, Gültigkeitsbeginn/-ende, Phänomen, Warnraum und räumlich-zeitliche Unsicherheit festhalten. Eine neuere Fassung kann eine ältere ersetzen; Warnungen desselben Phänomens nicht addieren. Vorabinformation und konkrete Warnung getrennt nennen. Ein Punkt ohne gemeldeten Schaden oder außerhalb eines Warnpolygons ist kein erhobener Nullbefund. Mengen und Schwellen immer mit Dauer und Einheit übernehmen; DWD-Warnkriterien sind meteorologische Kriterien und keine LEAD-Radargrenzen. Wird ein Produkt nur im Suchindex gesehen, bleiben Zugriff und Gültigkeit ungeprüft (A.6).

| ID | Leitfrage | Quelle & Aktualität | Prüfen für | Hinweis/Stolperstelle |
|---|---|---|---|---|
| R1 | Welches Phänomen trifft welchen Raum und Zeitraum? | [DWD-Warnlagebericht](https://www.wettergefahren.de/warnungen/warnsituation/warnlagebericht.html) (bundesweit, mit Länderberichten) und Warnungen des [DWD](https://www.dwd.de/); laufend; Ausgabe, nächste Ausgabe und Gültigkeit prüfen | L/R; D1/D8 | Warngebiet ist kein bestätigtes Schadensgebiet. An der Küste Wind und Wasserstand trennen; Sturmflut nach B02/R2 ([BSH-Wasserstandsvorhersage](https://wasserstand.bsh.de/)). |
| R2 | Welche Schäden, Sperrungen und Verletzten sind bestätigt? | Lagemeldungen (A.3) | L/R; D1/D2 | Einsatzstellen ≠ Betroffene; Meldungen desselben Schadens nicht addieren; Länder melden in unterschiedlichem Rhythmus. |
| R3 | Welche Strom-, Verkehrs- und Telekommunikationsdienste sind beeinträchtigt? | Betreibermeldungen (A.3); DB-, Autobahn-, Flughafenmeldungen | R/I; D6 | Vorsorgliche Sperrung ≠ Schaden; frühe „keine größeren Störungen“ nicht als final werten. |
| R4 | Welche Warnungen und Schutzmaßnahmen gelten? | [Warnportal des Bundes](https://warnung.bund.de/) und herausgebende Behörde; anlassbezogen | M | Teilentwarnung ist keine Gesamtentwarnung; Warnlage nach A.9.3. |
| R5 | Welche Hilfe ist tatsächlich angefordert oder eingesetzt? | Lagemeldungen (A.3) | M; D4 | Bereitschaft, Anforderung und Einsatz trennen. |
| R6 | Was ist über Folgewetter und Wiederherstellung bekannt? | [DWD-Warnlagebericht](https://www.wettergefahren.de/warnungen/warnsituation/warnlagebericht.html) und Warnungen des [DWD](https://www.dwd.de/); Betreibermeldungen (A.3) | R/M; D5/D8 | Aufräum- und Reparaturdauer beim Betreiber belegen, nicht aus Wetterende ableiten. |
| R7 | Sind Freiluftveranstaltungen, Campingplätze oder andere exponierte Gruppen im Warngebiet? | Lagemeldungen (A.3); zuständige Ordnungsbehörde; anlassbezogen | R/M | Warnvorlauf, Erreichbarkeit und tatsächliche Schutzmöglichkeit erfassen (A.9.2); Absage ist Vorsorge, keine Betroffenheit. |

### 3. Auswertung: Prüfpunkte

Alle acht Achsen nach Teil A.2 prüfen; hier besonders:

- **Vor Schadenseintritt:** zeitliche Überlagerung, wiederholte Belastung derselben Räume, Erreichbarkeit kritischer Einrichtungen und verfügbare Vorbereitungszeit prüfen; Ist-Achsen ohne Wirkungsnachweis offen lassen (A.1 Nr. 1).
- **D1:** Warnraum und belegter Wirkungsraum unterscheiden; nach Schadens- bzw. Einsatzraum kodieren.
- **D5:** Wetterende ist kein Zielzustand; Aufräumen und Wiederherstellung dauern oft Tage – Zielzustand benennen.
- **D8:** Nachlassender Wind bei fortbestehenden Ausfällen ist keine Stabilisierung der Gesamtlage; prüfen, was sich stabilisiert.

**Beurteilung/Tendenz:** Die DWD-Warnstufe ist keine Beurteilung. Abklingender Wind bedeutet bei fortdauernden Versorgungsstörungen noch keine Entspannung aller Folgen; nachgewiesene Teilverbesserungen können eine begründete Teilentspannung tragen (A.4).

**Offenlassen:** D1 und D2 bei reiner Vorwarnung; D2 ohne belastbare Personenzahl; D5 ohne benannten Zielzustand und Wiederherstellungsprognose.

### 4. Darstellung

| Meldungsbereich | Lageart-spezifische Leitfrage |
|---|---|
| Lage & Ereignis | Wetterphase, belegte Schäden und Schwerpunkträume mit Zeitstand; bei Vorwarnung Warnung, Prognose und Vorbereitungsfenster getrennt |
| Risiken & Auswirkungen | Folgegefahren für Versorgung, Zugänglichkeit und Menschen mit besonderen Bedarfen (Kliniken, Pflege, exponierte Gruppen) – belegt vs. Prognose |
| Maßnahmen & Handlungsempfehlungen | Geltende Warn-/Sperrmaßnahmen mit Status, länderübergreifende Hilfe, offene Informationsbedarfe |
| Abhängigkeiten & Interdependenzen | Wechselwirkung Verkehr – Strom – Kommunikation; belegte von möglichen Kopplungen trennen |

Übertrag, Abschlusscheck und Querschnittsprüfungen nach Teil A.4, A.5 und A.9.

### 5. Ansprechstellen und Pflege

**Ansprechstellen:** DWD (Wetterprognose) · BSH (Küste: Wasserstand und Sturmflut, B02) · Lagezentren der Länder · Betreiber (Wiederherstellungsstatus) · GMLZ

**Offene Punkte:** Kriterien für „absehbare kritische Auswirkungen“ vor Schadenseintritt an Übungs- und Rückblickfällen kalibrieren (A.10.3).
