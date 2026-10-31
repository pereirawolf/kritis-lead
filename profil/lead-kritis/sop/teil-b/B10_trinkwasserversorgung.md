<a id="b10"></a>

## B10. SOP LEAD: Trinkwasserversorgung

```yaml
kennung: "B10"
typ: "Dach-SOP"
lesegruppe: "Katalog-Einstiege"
lageart: "Trinkwasserversorgung (Unterbrechung, Mengeneinschränkung, Qualitätsproblem)"
art_vorschlag: ["Trinkwasserversorgung"]
zweck: "Reproduzierbare Erfassung von Unterbrechungen, Mengeneinschränkungen und Qualitätsproblemen der öffentlichen Trinkwasserversorgung (KRITIS-Sektor Wasser, Branche öffentliche Wasserversorgung) einschließlich der tatsächlich wirksamen Ersatzversorgung."
version: "2.2.0"
status: "Beispielfassung"
stand: "24.10.2026"
pflegeverantwortlich: "Herausgeber der Beispielfassung (bei Übernahme: fachlich zuständige Funktion eintragen)"
quellen_geprueft_am: "Rechercheeinstiege 26.09.2026 teilweise; Ergänzungen 19.10.2026 vor Erstverwendung prüfen (A.6)"
naechste_pruefung_faellig: "31.03.2027"
pruefausloeser: "Rückblick nach A.8.3; Änderung von Kodierleitfaden, Darstellungsdatei oder Schema; Änderung der fachlichen Empfehlungen des UBA; Änderung der Trinkwasserverordnung oder des Wassersicherstellungsgesetzes"
bisherige_kennung: "10"
bisherige_ids: ["sop-10"]
```

### 1. Anwendungsbereich und Befassungsanlässe

**Umfasst / grenzt ab von:** Versorgungsunterbrechungen, Abkochgebote, Nutzungsverbote und Verbrauchsbeschränkungen bei Gewinnung, Aufbereitung und Verteilung. Ursache bei belegtem Zusammenhang zusätzlich über die passende SOP (B05, B02, B08, B07, B15 oder B16); aus dem Trinkwasserproblem allein wird keine Ursachenart abgeleitet. Abwasser-, Sanitär- und Entsorgungsfolgen: Baustein C15. Beispiel dafür: Abkochgebot für mehrere Gemeinden nach Verkeimung. Beispiel dagegen: Rohrbruch mit kurzer Unterbrechung weniger Haushalte; niedriger Flusspegel ohne Trinkwasserfolgen.

**Befassungsanlässe:** Abkochgebot oder Nutzungsverbot · Versorgungsunterbrechung · Lagemeldung eines Landes · Monitoring: Warnungen und Allgemeinverfügungen zur Trinkwasserversorgung.

### 2. Erfassung: Prüffragen

| ID | Leitfrage | Quelle & Aktualität | Prüfen für | Hinweis/Stolperstelle |
|---|---|---|---|---|
| R1 | Welche Zone und welche Art der Einschränkung sind bestätigt? | Betreibermeldungen (Wasserversorger), Gesundheitsamt; [Warnportal des Bundes](https://warnung.bund.de/) und herausgebende Behörde; anlassbezogen | L; D1 | Versorgungsgebiet, betroffene Zone und Warngebiet trennen; Abkochgebot, Trink-/Nutzungsverbot und Mengenbeschränkung nicht austauschen und mit genauer amtlicher Anweisung erhalten. |
| R2 | Welche Ursache und welche Mess- bzw. Mengengrundlage liegen vor? | Wasserversorger, Gesundheitsamt, Wasserbehörde | L/R | Einzelprobe ≠ Bewertung des Gesundheitsamts; Laborbefunde haben Zeitverzug; vermutete Ursache kennzeichnen. |
| R3 | Welche Personen und Einrichtungen sind direkt betroffen? | Wasserversorger, Gesundheitsamt | R; D2 | Einwohnerzahl des Gebiets ist Plausibilitätsbezug (A.3 Zählregeln); Zähler/Anschlüsse nicht unbelegt in Personen umrechnen. |
| R4 | Welche Ersatzversorgung ist tatsächlich versorgungswirksam? | Lagemeldungen (A.3); THW, Hilfsorganisationen; Trinkwassernotbrunnen (BBK) | M; D4 | Benötigte und tatsächlich bereitgestellte Menge, zulässiger Verwendungszweck, gesicherte Qualität, Verteilpunkte, Transport und Zugänglichkeit beschreiben; bereitgestellte Menge ist erst nach erreichbarer und geeigneter Abgabe versorgungswirksam (A.9.1). Trinkwassernotbrunnen nicht allein aus ihrer Existenz als betriebsbereite Versorgung werten. Herkunft eingesetzter Ersatzversorgung bleibt für D4 maßgeblich. |
| R5 | Welche Reparatur- und Freigabeschritte sind bekannt? | Wasserversorger, Gesundheitsamt | M/R; D5 | Technische Reparatur beendet das Qualitätsproblem nicht; Freigabe erst durch Gesundheitsamt. |
| R6 | Welche fachlichen Anforderungen erklären die Bewertung? | [UBA Trinkwasser](https://www.umweltbundesamt.de/themen/wasser/trinkwasser); [UBA-Empfehlungen zu Maßnahmen bei Abweichungen der Trinkwasserbeschaffenheit (2026)](https://www.umweltbundesamt.de/system/files/document/260417_UBA_Empfehlungen_%C2%A7%C2%A762-68_nach_Freigabe_final_clean.pdf); Fachgrundlage | R/I | Grundlagenwissen ersetzt keinen örtlichen Befund; Abkochen nicht als allgemeine Lösung für jede Verunreinigung darstellen. |
| R7 | Welche Einrichtungen (Pflege, Kliniken, Dialyse) und welche Löschwasserversorgung sind betroffen? | Gesundheitsamt; Lagemeldungen (A.3); Feuerwehr | R/I; D6 | Bedarf von Einrichtungen und Löschwasser getrennt prüfen; Abwasser- und Hygienefolgen mitprüfen (C15). |

### 3. Auswertung: Prüfpunkte

Alle acht Achsen nach Teil A.2 prüfen; hier besonders:

- **D3:** Versorger trägt die technische Behebung (Stufe 0 möglich), Gesundheitsamt/Kommune die Gefahrenabwehr – bewertete Funktion nennen.
- **D5:** Technische Wiederherstellung und hygienische Freigabe unterscheiden.
- **D6:** Trinkwasser ist Kern-KRITIS, D6 misst aber die konkrete Kopplung (Kliniken, Pflege, Lebensmittel, Abwasser, Strom für Pumpen, Löschwasser).
- **D8:** D8 = 0 bei ausreichend belegtem stabilem Verlauf; offen nur bei unzureichender Beobachtungsbasis (A.2).

**Beurteilung/Tendenz:** Eine technische Reparatur ist noch keine hygienische Freigabe. Nachgewiesene Verbesserungen – etwa wirksame Ersatzversorgung, geringerer Einschränkungsraum oder wiederhergestellter Druck – können eine begründete Teilentspannung darstellen; verbleibende Verbote werden ausdrücklich erhalten. Vollständige Entspannung und Abschluss werden erst anhand des gewählten Zielzustands beurteilt.

**Offenlassen:** D2 ohne belastbaren Versorgungsbezug; D5 ohne Freigabeperspektive; D8 nur bei unzureichender Beobachtungsbasis.

### 4. Darstellung

| Meldungsbereich | Lageart-spezifische Leitfrage |
|---|---|
| Lage & Ereignis | Art der Einschränkung mit amtlichem Wortlaut, Raum, Ursache (belegt/vermutet), Zeitstand |
| Risiken & Auswirkungen | Gesundheitliche Risiken nach Fachbewertung; Versorgung von Einrichtungen und Menschen mit besonderen Bedarfen |
| Maßnahmen & Handlungsempfehlungen | Ersatzversorgung mit Menge, Verteilpunkten und Status; Information der Bevölkerung; Aufhebungskriterien |
| Abhängigkeiten & Interdependenzen | Kopplung zu Strom, Abwasser, Lebensmittel, Gesundheit, Löschwasser |

Übertrag, Abschlusscheck und Querschnittsprüfungen nach Teil A.4, A.5 und A.9.

**Übergreifender Erkenntniswert:** Knapp festhalten, ob dasselbe Versorgungsgebiet wiederholt eingeschränkt war und ob die Ursache nach der Freigabe benannt ist. Eine offene Ursache hält eine abgeschlossene Befassung nicht offen (A.8.1); sie gehört in `Neubewertung bei:` bzw. `Abschluss im Lagebild:`.

### 5. Ansprechstellen und Pflege

**Ansprechstellen:** Wasserversorger · Gesundheitsämter · Wasserbehörden der Länder · BBK (Trinkwassernotversorgung) · UBA (Fachgrundlagen)

**Fachgrundlagen** (A.6; sie bestätigen kein aktuelles Ereignis und werden im Quellenverzeichnis der Meldung nur geführt, wenn eine Aussage darauf beruht):

- UBA: Empfehlungen zu Maßnahmen bei Abweichungen der Trinkwasserbeschaffenheit (Vollzugsempfehlung für Gesundheitsämter zu den §§ 62–68 TrinkwV, Fassung 2026; Link in R6, Quellenregister S019) – trägt R6; sie ist eine fachliche Empfehlung, keine Rechtsnorm, und ersetzt keine Anordnung des Gesundheitsamts.
- Trinkwasserverordnung (TrinkwV): Maßnahmen bei Nichteinhaltung und Information der Verbraucher; Fundstelle vor Verwendung am Normtext prüfen (A.6).
- Wassersicherstellungsgesetz (WasSiG): Maßnahmenrahmen der zivilen Verteidigung (C17); in dieser Fassung ohne Fundstelle, vor Verwendung am Normtext prüfen (A.6).

**Offene Punkte:** Abgrenzung zwischen B10 und Baustein C15 an einem Übungsfall prüfen. Fundstellen für TrinkwV und WasSiG mit Registereintrag aufnehmen (A.6).
