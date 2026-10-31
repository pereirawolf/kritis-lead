# Kodierleitfaden LEAD – Lagenradar, Quellenkategorien und Zeitstrahl

Beispielfassung für KI-LEAD · Fassung 1.7.0 vom 30.10.2026 · abgeleitet aus der Arbeitsfassung v0.4 · gilt für die LEAD-Meldevorlage 1.2 (Schemakennung `LEAD-Meldung-v1`), die SOP-LEAD-Sammelmappe ab Fassung 3.20.0 (Beispielfassung) und die Arbeitsanweisung Erfassung ab Fassung 1.8.0 (gültiges Paket: Gültigkeitsstand in SOP-LEAD Teil A)

Dieser Leitfaden ist der einzige Ort für die Kodierregeln des Lagenradars (Grundregeln, Stufentexte, Achsenregeln D1–D8, Beurteilung und Tendenz), für die Quellenkategorien A/B/W/M/P mit Zuordnung und Priorität, für die Rangfolge bei Widersprüchen und für Form und Regeln von Zeitstrahl, Sachverhaltskennung und Bezug (Abschnitt 8). SOP-LEAD Teil A (A.2, A.3), die Darstellungsdatei und die Arbeitsanweisungen verweisen verbindlich darauf und wiederholen die Regeln nicht (SOP-LEAD A.10.2). Das Lagenradar ist veröffentlicht als: Pereira Wolf, H. (2026). Hybride Zwischenlagen im Bevölkerungsschutz. https://doi.org/10.5281/zenodo.18305827

**Rangfolge bei Widersprüchen** (einzige Fassung; SOP-LEAD Teil A und die Arbeitsanweisungen verweisen hierauf): (1) JSON-Schema der Meldung (Struktur, zulässige Werte, Leerwerte) und Stufentexte der Darstellungsdatei, (2) dieser Kodierleitfaden, (3) SOP-LEAD Teil A, (4) lageartspezifische Hinweise der einzelnen SOP und der einschlägigen Bausteine aus Teil C (Inhaltsgerüste nur als Prüfhinweise, Beispielfassungen bis zur Freigabe nachrangig, SOP-LEAD A.1 Nr. 7), (5) Arbeitsanweisung. Stellt jemand einen Widerspruch fest, wird er offen benannt und nicht stillschweigend aufgelöst.

---

## 1. Grundregeln

1. **Referenzraum und Zeitpunkt festlegen.** Vor der Kodierung werden der Referenzraum (in der Regel der deutsche Bevölkerungsschutz bzw. das meldende Land) und der Zeitpunkt t0 benannt. t0 ist der Meldezeitpunkt, nicht der Ereignisbeginn und nicht der Datenstand einer einzelnen Quelle. Kodiert wird der Ist-Zustand zu t0, auch wenn die Einschränkung vor t0 beendet wurde; Umfang und Dauer des beendeten Ereignisses stehen dann im Text und im Kennsatz `Abschluss im Lagebild:` (SOP-LEAD A.8.2).
2. **Alle acht Achsen einzeln prüfen.** Jede Achse wird für sich kodiert. Die in einer SOP hervorgehobenen Achsen sind Stolperstellen, keine Auswahl.
3. **Höhere Zahl = stärkere, bedeutsamere oder ungünstigere Ausprägung.** Die Bedeutung einer Stufe ergibt sich ausschließlich aus dem Stufentext (Abschnitt 2).
4. **Stufe 0 ist eine inhaltliche Aussage, kein Leerwert.** Sie braucht einen Beleg wie jede andere Stufe.
5. **Offen statt geschätzt.** Fehlt ein Bezugsgegenstand oder ein tragfähiger Beleg, bleibt die Achse offen: in der Eingabemaske „keine Angabe“, im JSON `null`. Ein selbst erfundener Code wie „U“ ist unzulässig. Offen ist eine Information, keine Lücke.
6. **Keine unbelegte Präzision.** Messwert, Schätzung, Bandbreite und bestätigte Mindestzahl werden gekennzeichnet. Maßgeblich ist die Stufe, deren Stufentext der Beleg vollständig trägt; trägt er die höhere Stufe nicht vollständig, gilt die niedrigere, und die Grenze wird im Bewertungstext benannt. Das ist keine Vorsichtsregel: Eine Stufe ist nicht deshalb richtig, weil sie niedriger ist. Bildet die Skala eine Achse nur unvollkommen ab, wird das im Bewertungstext erklärt, statt eine bequeme, aber sachlich falsche Stufe zu setzen. Liegt die gesamte tragfähige Bandbreite einer Schätzung innerhalb einer Stufe, ist diese Stufe mit Unsicherheitshinweis möglich. Schneidet die Bandbreite mehrere Stufen, bleibt die Achse offen und die Bandbreite steht im Text. **Mindestkodierung:** Eine bestätigte (gezählte oder amtlich gemeldete) Mindestzahl darf kodiert werden, wenn der Bewertungstext sie als Mindestwert kennzeichnet („D2 = 3 (Mindestwert): mindestens …“); sie wird nicht als vollständige Zahl dargestellt.
7. **Keine Zukunft im Ist-Wert – mit einer definierten Ausnahme.** Erwartete Entwicklungen gehören in „Risiken & Auswirkungen“ und in den Kennsatz `Neubewertung bei:`, nicht in die Radarwerte. Ausnahme ist D5: Es kodiert die zu t0 fachlich prognostizierte Restdauer bis zum benannten Zielzustand (Abschnitt 3, D5).
8. **Kein Gesamtscore.** Keine Summe, kein Mittelwert, keine Rangfolge zwischen Sachverhalten. Die Divergenz zwischen den Achsen ist der Erkenntnisgewinn.
9. **Begründungsmuster.** Jeder gesetzte Wert wird im Bewertungstext oder in den Analysefeldern so begründet:
   „D[n] = [Wert], weil [konkreter Indikator] laut [Q-Verweis, Datenstand] für [Raum/Zeitpunkt]; Abgrenzung zur Nachbarstufe: [Kriterium].“
   Nicht tragfähig: „vermutlich eher mittel“, „dürfte im oberen Bereich liegen“.
10. **Offene Achsen begründen.** Jede offene Achse erhält einen kurzen Grund („D5 offen: kein Zielzustand benannt“).

### Prüfreihenfolge je Achse

1. Gibt es für diese Achse einen **Bezugsgegenstand** im Referenzraum (eine Fläche, eine Personengruppe, eine steuernde Stelle, eine Unterstützungsleistung, einen Zielzustand, eine Kopplung, eine Lageinformation, eine beobachtete Veränderung)? – Nein: **offen**.
2. Gibt es einen **Beleg** zu diesem Gegenstand? – Nein: **offen**.
3. Welche **Stufe** trägt der Beleg nach dem Stufentext? – Trägt der Beleg die höhere Stufe nicht vollständig: die **niedrigere**; bei einer Schätzbandbreite über eine Stufengrenze: **offen**, außer bei einer bestätigten Mindestzahl (Mindestkodierung, Grundregel 6).
4. **Grenze zur Nachbarstufe** benennen.

---

## 2. Stufentexte (Referenz)

| Stufe | D1 Räumliche Auswirkung | D2 Personelle Direktbetroffenheit | D3 Verantwortungszurechnung | D4 Unterstützungsreichweite |
|---|---|---|---|---|
| 0 | punktuell/kleinflächig | unter 10 Personen | Betreiber | keine externe Hilfe |
| 1 | kommunal | 10–99 Personen | Kommune | örtlich |
| 2 | überörtlich (mehrere Kommunen/Kreis) | 100–999 Personen | Kreis/Bezirk | überörtlich |
| 3 | regional (mehrere Kreise/Region) | 1.000–9.999 Personen | Region/Regierungsbezirk | regional |
| 4 | landesweit | 10.000–99.999 Personen | Land | landesweit |
| 5 | bundesweit | 100.000–999.999 Personen | Bund | bundesweit |
| 6 | international | 1 Mio. oder mehr | International | international |

| Stufe | D5 Zeit bis Zielzustand | D6 KRITIS-Bezug | D7 Informationslage | D8 Dynamik |
|---|---|---|---|---|
| 0 | unter 6 Stunden | keine KRITIS-Bezüge | stabil/hoch verlässlich | stabil |
| 1 | 6–24 Stunden | peripher | leichte Verzögerungen | geringe Schwankungen |
| 2 | 1–3 Tage | sektoral begrenzt | relevante Lücken | einzelne Umschläge |
| 3 | 4–7 Tage | regional zentral | fragmentiert | wiederholte Phasenwechsel |
| 4 | 1–4 Wochen | sektorenübergreifend gekoppelt | stark eingeschränkt | hohe Planungsinstabilität |
| 5 | 1–3 Monate | multiple KRITIS-Sektoren | massiv eingeschränkt | sehr hohe Dynamik |
| 6 | mehr als 3 Monate | systemisch/überregional | nahezu ausgefallen | chaotisch |

---

## 3. Achsenregeln

### D1 Räumliche Auswirkung / Impact-Raum

- **Kodierfrage:** Wie weit reicht der belegte Wirkungsraum im Referenzraum zu t0?
- **Bezugsgegenstand:** Schadens-, Einsatz-, Versorgungs- oder Betroffenheitsraum.
- **Nicht:** Warngebiet, Prognoseraum, Summe früherer isolierter Fälle, Sitz der berichtenden Stelle.
- **Offen:** wenn nur ein potenzieller Raum beschrieben ist (z. B. Frühwarnung ohne Ereignis).

### D2 Personelle Direktbetroffenheit

- **Kodierfrage:** Wie viele Personen sind im Referenzraum zu t0 unmittelbar betroffen?
- **Direkt betroffen** sind Personen, deren Leben, Gesundheit, Unterkunft oder Grundversorgung durch das Ereignis selbst unmittelbar beeinträchtigt ist, etwa Verletzte, Erkrankte, Evakuierte oder Personen ohne Strom- oder Wasserversorgung. Nicht direkt betroffen sind Personen in einem Warngebiet ohne eingetretene Beeinträchtigung und mittelbar Betroffene, etwa durch Verkehrsbehinderungen. Evakuierte, Verlegte und in Schutzunterbringung Aufgenommene zählen, sobald die Maßnahme vollzogen ist; zum Verlassen Aufgeforderte ohne belegten Vollzug zählen nicht (SOP-LEAD A.3). Der Ausfall oder die Einschränkung von Verwaltungsleistungen allein ist keine Direktbetroffenheit; D2 nur, soweit dadurch Leben, Gesundheit, Unterkunft oder Grundversorgung belegt beeinträchtigt sind (z. B. ausgefallene Auszahlung existenzsichernder Leistungen). Einwohnerzahlen des Verwaltungsgebiets sind kein Ersatz.
- **Nullregel (vereinheitlicht):** Stufe 0 („unter 10 Personen“) ist zulässig, wenn **eine** der beiden Bedingungen belegt ist:
  - (a) eine belegte Zahl von 1 bis 9 direkt Betroffenen, oder
  - (b) ein Nullbefund aus einer aktiv laufenden, für den Sachverhalt einschlägigen Erhebung mit definierter Grundgesamtheit (Surveillance, Meldepflicht, Fallregister, Lagemeldung mit ausdrücklicher Fehlanzeige).
- **Offen:** wenn weder (a) noch (b) belegt ist, auch wenn eine Zahl von null plausibel erscheint. Unterschieden wird damit „belegte Kleinzahl oder belegte Null“ (0) von „keine beobachtbare Grundgesamtheit“ (offen).
- **Umrechnungen:** Anschlüsse, Haushalte oder Megawatt sind keine Personen. Eine Umrechnung ist nur mit offengelegtem Faktor, passendem Gebiet, Datum und Quelle zulässig; die Bandbreite wird angegeben und nach Grundregel 6 kodiert. Einwohnerzahlen sind Plausibilitätsbezug, keine allgemeine Obergrenze.
- **Auslandslagen:** Ausländische Fallzahlen werden nicht auf D2 übertragen. Für Deutschland gilt die deutsche Betroffenheit.


### D3 Verantwortungszurechnung / Zurechnungszentrum

- **Kodierfrage:** Welche Ebene steuert oder trägt die bewertete Funktion zu t0?
- **Bewertete Funktion benennen:** z. B. Betrieb, Gefahrenabwehr, Fachaufsicht, Ermittlung oder Regulierung. Bewertet wird die konkret betroffene Funktion einer Stelle oder Organisation, nicht ihre institutionelle Bezeichnung; die genannten Funktionen sind Beispiele, maßgeblich sind Aufgabenwahrnehmung, Zuständigkeit und tatsächliche Betroffenheit. D3 bezeichnet die ausgewählte Funktion, nicht automatisch die höchste beteiligte Staatsebene. Eine Quelleninstitution ist nicht automatisch das Zurechnungszentrum. Ändern sich Funktion oder Betrachtungsobjekt in einer Fortschreibung, wird das offengelegt.
- **Mit Akutereignis:** Kodiert wird die Ebene, die Bewältigung oder Koordination tatsächlich steuert (z. B. Kreis als untere Katastrophenschutzbehörde = 2; Land bei landesweiter Koordinierung = 4).
- **Ohne Akutereignis (Vorsorge-, Beobachtungs-, Frühwarnsachverhalt):** Eine **strukturelle Zurechnung** ist zulässig, wenn ein konkreter Gegenstand benennbar ist, nämlich eine bestimmte Fach-, Regulierungs- oder Vorsorgeaufgabe, und die zuständige Ebene belegt ist. Dann wird diese Ebene kodiert, und der Bewertungstext erhält die Kennzeichnung „D3 strukturell: [Aufgabe], [Stelle]“.
- **Offen:** wenn auch die strukturelle Zuständigkeit für einen konkreten Gegenstand nicht belegbar ist. Eine fiktive Bündelung bei der Koordinierungsstelle ist ausgeschlossen. Die Koordinierungsstelle ist keine Zurechnungsebene.
- **Vorsorge vor einem Akutereignis:** Belegte Vorsorgemaßnahmen einer Stelle vor dem Eintritt (z. B. Sandsackausgabe, Sperrung, öffentliche Warnung), über die öffentlich berichtet wird, gelten als beobachtbare Zurechnung. Kodiert wird die Ebene der vorsorgenden Stelle (z. B. Stadt oder Gemeinde = 1). Der Bewertungstext nennt Maßnahme und Stelle („D3 Vorsorge: [Maßnahme], [Stelle]“).
- **Nicht:** Zuständigkeitsprüfung im Rechtssinn. D3 beschreibt die beobachtbare Zurechnung.


### D4 Unterstützungsreichweite / Mobilisierung

- **Kodierfrage:** Aus welchem Raum stammt die für diese Befassung tatsächlich eingesetzte, ereignisbezogene externe Unterstützung zu t0?
- Maßgeblich ist der **Herkunftsraum**, nicht Menge, Wert oder Organisationsform. Grenzüberschreitend tatsächlich eingesetzte Hilfe ist „international“. Eine ereignisbezogene Sonderbeschaffung aus dem Ausland zählt nur, wenn sie als Unterstützungsleistung für diese Lage belegt und im Text begründet ist.
- **Herkunftsort:** Herkunftsort ist der Standort, von dem die eingesetzte Einheit oder Stelle herangeführt wurde, bei Unterstützung ohne Entsendung ihr Dienstort. Trägerebene, Rechtsform, Behördensitz und Zuständigkeitsraum der Organisation sind unerheblich; das gilt gleichermaßen für Feuerwehren, THW, Hilfsorganisationen, Bundeswehr, Polizeien, Fachstellen und Verwaltungshilfe anderer Gebietskörperschaften. Für jede eingesetzte Kraft bestimmt sich die Stufe nach dem kleinsten Gebietsrahmen, der ihren Herkunftsort und ihren Einsatzort umfasst; maßgeblich ist die höchste Stufe. Hilfe aus unmittelbar angrenzenden Kreisen oder kreisfreien Städten ist überörtlich (Stufe 2), auch über eine Landesgrenze hinweg; Hilfe über eine Staatsgrenze bleibt „international“. Leistungen eines vom Betroffenen regulär beauftragten Dienstleisters sind keine externe Unterstützung, es sei denn, sie werden ereignisbezogen von einer anderen Stelle vermittelt oder bereitgestellt. Die Ebene der unterstützenden Stelle ist keine Reichweite; sie erscheint im Text und, soweit diese Stelle Verantwortung übernimmt, in D3. Der Bewertungstext nennt Einheit, Herkunftsort und Leistung; ist der Herkunftsort nicht belegt, bleibt D4 offen.
- **Nicht:** Bereitschaft, Zusage, Anforderung ohne Einsatz, historische Unterstützung, reguläre Warenlieferungen, ausländischer Herstellungsort eines Geräts.
- D4 beschreibt die Herkunft, nicht, ob die Hilfe ausreicht (Bedarfsdeckung: SOP-LEAD A.9.1).
- **Stufe 0** („keine externe Hilfe“) nur mit Beleg, dass die Lage ohne externe Unterstützung bewältigt wird.

### D5 Zeit bis Zielzustand / Übergangsdauer

- **Kodierfrage:** Wie lange dauert es voraussichtlich ab t0, bis der benannte Zielzustand erreicht ist?
- D5 ist die zu t0 fachlich prognostizierte **Restdauer** und damit die definierte Ausnahme zur reinen Ist-Kodierung (Grundregel 7). Prognosegeber, Ausgabestand und Unsicherheit werden angegeben; bereits verstrichene Ereignisdauer zählt nicht.
- **Zielzustand ausdrücklich benennen** (z. B. Gefahrenabwehr beendet, Versorgung wiederhergestellt, Freigabe erteilt). Wetterende oder technische Wiederversorgung sind nicht automatisch der Zielzustand. Notbetrieb, Wiederherstellung der kritischen Dienstleistung und vollständige Folgenbeseitigung werden getrennt beschrieben; bei mehreren Zielzuständen wird der für D5 gewählte begründet.
- Grundlage ist eine belegte Prognose der zuständigen Stelle oder des Betreibers.
- **Erreichter Zielzustand:** Ist der benannte Zielzustand zu t0 bereits erreicht, gilt D5 = 0.
- **Mindestprognose:** Nennt der Prognosegeber nur eine Mindestdauer („mindestens bis …“), darf sie als Mindestwert kodiert und im Bewertungstext so gekennzeichnet werden (Grundregel 6); ist sie zu t0 abgelaufen und fehlt eine neue Prognose, bleibt D5 offen.
- **Offen:** ohne Zielzustand oder ohne belastbare Prognose, bei unbestimmten Trends.
- D5 ist **keine Dringlichkeitsskala**. Zeitkritischer Handlungsbedarf steht im Kennsatz `Handlungsrelevant bis:`.

### D6 KRITIS-Bezug / Interdependenzgrad

- **Kodierfrage:** Welche Kopplungen zu kritischen Infrastrukturen sind in der konkreten Lage zu t0 belegt?
- Kodiert wird nach **belegten Kopplungen**, nicht nach Sektorzugehörigkeit oder Listen denkbarer Folgen. Die KRITIS-Prüfung ist Pflicht bei jeder Meldung.
- **Wirkungskette:** Bei einer bewertungsrelevanten Folgekette im Feld „Abhängigkeiten & Interdependenzen“ die entscheidende Verbindung benennen: beeinträchtigte Funktion → Abhängigkeit → Bedingung → betroffener Bereich, mit Puffer und Reichweite (Notstrom, Vorräte, Speicher, Personal, Ausweichweg). Mögliche Folgeschritte als **Szenario** kennzeichnen. Sie ändern den Ist-Wert nicht.
- **Stufe 0** („keine KRITIS-Bezüge“) nur, wenn die Prüfung durchgeführt wurde und keine Kopplung ergab.
- **Abgrenzung 0/1:** Stufe 1 („peripher“) setzt eine belegte Kopplung voraus, durch die eine Leistung für Betroffene trotz vorhandener Ersatzwege tatsächlich verzögert oder eingeschränkt ist. Fällt nur ein einzelner Weg oder Dienst aus und trägt ein belegter Ersatzweg die Funktion vollständig, ist das keine bewertungsrelevante Kopplung (D6 = 0); Ausfall und Ersatzweg stehen im Text.
- D6 steigt nicht allein mit der vergangenen Ausfalldauer.
- Ausfälle der **Kommunikation mit der Bevölkerung** (Mobilfunk, Warnmittel) gehören als Kopplung hierher und in den Text, nicht zu D7.

### D7 Kommunikation / Informationslage

- **Kodierfrage:** Wie verfügbar, verlässlich, aktuell und widerspruchsfrei ist die **Lageinformation der Befassung** zu t0? Aktualität wird am Lageverlauf und am Entscheidungsfenster gemessen, nicht an einer festen Frist (SOP-LEAD A.3, Zeitbezug einer Zahl).
- **Festlegung:** D7 bewertet ausschließlich die Informationslage der befassten Stellen, also ob zuständige Stellen und Primärquellen zentrale Lagefragen beantworten. Die Kommunikationslage der Bevölkerung wird in „Risiken & Auswirkungen“ und bei D6 dargestellt.
- **Erhöhte Stufe**, wenn für zentrale Fragen keine recherchierbaren Primärquellen bestehen, zuständige Stellen widersprüchlich oder verzögert informieren, Meldewege gestört sind oder fachlich erhebliche Lücken bzw. Widersprüche zu Leistungsgrad, Integrität, Stoffidentität oder Wiederanlauf bestehen, soweit sie die Befassung tatsächlich betreffen. Ein technischer Kommunikationsausfall ist keine Voraussetzung. Fehlende Veröffentlichungen sind nicht automatisch ein Kommunikationsausfall; bleiben zentrale Bevölkerungsschutzfragen tatsächlich ungeklärt, wird die Lücke nach ihrer Entscheidungsrelevanz abgebildet.
- **Keine erhöhte Stufe** wegen eigener Recherchegrenzen in der verfügbaren Zeit oder wegen unterschiedlicher Bewertungen derselben Informationen (SOP-LEAD A.7.2).
- **Abweichende Vorhersagen:** Weichen Vorhersagen fachlich maßgeblicher Stellen voneinander ab (z. B. Wasserstandsmodelle zweier Dienste), werden sie zunächst nach Bezugsraum, Gültigkeitszeit, Methodik und Unsicherheit verglichen. Unterschiedliche Modelle allein legen keine feste Stufe fest; D7 richtet sich nach den gesamten relevanten Informationsdefiziten der Befassung und den Stufentexten. Übereinstimmende Vorhersagen rechtfertigen D7 = 0 nur, wenn die übrige zentrale Lageinformation ebenfalls aktuell und tragfähig ist.
- **Stufe 0** („stabil/hoch verlässlich“), wenn zuständige Stellen aktuell, konsistent und überprüfbar informieren.


### D8 Dynamik

- **Kodierfrage:** Wie stark hat sich die Lage im Referenzraum im zurückliegenden Beobachtungszeitraum tatsächlich verändert?
- Bewertet werden beobachtete Änderungen, nicht die Zahl eingehender Meldungen und nicht latente Folgerisiken.
- Ein belegt stabiler Verlauf ergibt D8 = 0, auch wenn die Versorgung angespannt ist; offen bleibt D8 nur bei unzureichender Beobachtungsbasis. Bedingte Kipprisiken gehören in „Risiken & Auswirkungen“ und in den Kennsatz `Neubewertung bei:`.
- Internationale Veränderungen bei Auslandslagen werden als Frühwarnindikator im Text ausgewiesen, nicht als deutsche Dynamik.
- D8 ist **nicht die Tendenz**. Eine Lage kann sehr dynamisch sein und sich zugleich entspannen.

---

## 4. Beurteilung und Tendenz

- **Beurteilung** (`sofort.beurteilung`, in der Meldevorlage beschriftet als „Bewertung“; `geringfügig` / `erheblich` / `kritisch`) wird eigenständig aus der belegten gegenwärtigen Relevanz für den Bevölkerungsschutz im Referenzraum abgeleitet, nicht aus dem höchsten Radarwert. Jede Stufe, auch „geringfügig“, braucht eine fachliche Begründung. Die Beurteilung berücksichtigt Unsicherheit und möglichen Handlungsbedarf eigenständig. Ist keine Stufe tragfähig: „keine Angabe“ (`""`).
- **Tendenz** (`Entspannung` / `Stabilisierung` / `Verschärfung`) wird mit ausdrücklich benanntem Bezugsraum und Zeitfenster begründet. Fehlende neue Erkenntnisse sind kein Beleg für Stabilisierung. Divergieren deutsche Lage und ausländischer Frühwarntreiber, wird das im Text erläutert, nicht in die Auswahl gezwungen.
- Der **Bewertungstext** beginnt mit der Kernaussage (SOP-LEAD A.4) und schließt mit den Kennsätzen, soweit sie vorliegen.

---

## 5. Quellenkategorien A/B/W/M/P

Jede Quelle im Feld **„Quellen & Referenzen“** erhält genau eine Kategorie. Die Buchstaben kennzeichnen die Herkunft bzw. Rolle der Quelle für die verwendete Aussage; ihre Reihenfolge ist die Quellenpriorität bei widersprüchlichen Angaben.

| Kategorie | Bedeutung | Beispiele |
|---|---|---|
| **A** | amtlich/zwischenstaatlich – Behörden und internationale Organisationen in ihrer hoheitlichen oder amtlichen Fachrolle | Bundes-, Landes- und Kommunalbehörden, Bundesoberbehörden, EU, WHO, ECDC; behördeninterne Lagemeldungen (z. B. Lagemeldung eines Landes, Lagebericht des GMLZ); authentische Behördenkonten in sozialen Medien |
| **B** | Betreiber – originäre Angaben zum eigenen Netz, Standort, System oder zur eigenen Dienstleistung und deren Betrieb, unabhängig von öffentlicher oder privater Trägerschaft | Netzbetreiber, Wasserversorger, Stadtwerke, Verkehrs- und Infrastrukturunternehmen, Krankenhausträger; Hilfsorganisation zu ihrer selbst betriebenen Einrichtung; authentische Betreiberkonten in sozialen Medien |
| **W** | wissenschaftlich – in fachwissenschaftlicher Rolle | Forschungseinrichtungen, begutachtete Fachpublikationen, wissenschaftliche Datensätze; Preprints mit Kennzeichnung „Preprint“ |
| **M** | Medien (bis zur Arbeitsfassung v0.3: „J“) | redaktionelle Berichte und journalistische Veröffentlichungen, Nachrichtenagenturen; auch Berichte mit Betreiber- oder Behördenzitat |
| **P** | sonstige private Quellen | Verbände, NGOs, persönliche Angaben, Unternehmen, soweit die konkrete Aussage keine Betreiberangabe ist; allgemeine Positionen von Hilfsorganisationen; Beiträge in sozialen Medien ungeklärter Identität |

**Quellenpriorität:** A > B > W > M > P. Bei Widersprüchen zu demselben Sachverhalt gilt die Priorität. Vor dem Vergleich werden Zeitstand, räumlicher Bezug, unmittelbare Sachkenntnis und fachliche Zuständigkeit geprüft. Eine begründete Abweichung wegen einschlägigerer oder aktuellerer Erkenntnisse wird ausdrücklich dokumentiert; beide Quellen werden genannt.

**Unterschiedliche Aussagegegenstände sind kein Widerspruch:** Eine Behörde bewertet etwa die Gefahrenlage, ein Netzbetreiber meldet den technischen Wiederherstellungsstand. Beide Aussagen stehen nebeneinander.

**Zuordnungsregeln:**

- Die konkrete Rolle entscheidet, nicht Eigentumsform, Veröffentlichungskanal, Dateiformat oder Bearbeitungsmodus. Eine kommunale Betreiber-Störungsmeldung ist B, eine behördliche Anordnung A.
- Eine Hilfsorganisation ist bei Angaben über ihre selbst betriebene Einrichtung B; eine allgemeine Verbandsposition bleibt P.
- Ein authentischer Behördenbeitrag in sozialen Medien bleibt A, ein Betreiberbeitrag B. Ungeklärte Identität und ungeklärter Aussagegehalt werden ausdrücklich vermerkt.
- Ein Medienbericht mit Betreiberzitat bleibt M; der Betreiber wird im Text als Ursprungsquelle genannt. Erst eine tatsächlich eingesehene Betreiberveröffentlichung erhält einen eigenen B-Eintrag.
- Bei gemischten Rollen werden die verwendete Aussage und ihre Herkunft gekennzeichnet. Mehrere Auszüge desselben Dokuments sind nicht voneinander unabhängig.
- **Sprachfassung:** Bei mehrsprachigen Seiten deutscher Stellen wird die deutsche Ausgangsfassung zitiert. Bei ausländischen Stellen sind die Originalfassung und eine amtliche englische Fassung desselben Herausgebers gleichrangig. Übersetzungen Dritter und automatische Übersetzungen sind keine eigene Quelle.
- Bestehende Quelleneinträge werden nicht automatisch umgestuft (etwa von P zu B), sondern einzeln geprüft.

**Ungeklärte Widersprüche** bleiben mit beiden Werten und Quellen sichtbar und werden nicht festgelegt.

**Zuordnungsbeispiele (fiktiv):**

| Aussage | Kategorie | Prüfhinweis |
|---|---|---|
| Stadtwerke: 80 Prozent der ausgefallenen Anschlüsse wieder versorgt | B | Zeitstand, Bezugsgebiet und Nenner prüfen; Anschlüsse nicht in Personen umetikettieren. |
| Gesundheitsamt: Abkochgebot gilt weiterhin | A | Geltungsbereich und aktuelle Fassung prüfen; die technische Reparatur hebt die Anordnung nicht auf. |
| Zeitung berichtet über denselben Stadtwerke-Stand | M | keine zweite unabhängige Bestätigung des Wiederherstellungsstands. |

**Aussagekompetenz:** Jede Quelle trägt Aussagen nur in ihrer Rolle: Eine Behörde ist primär für ihre Lageeinschätzung maßgeblich, ein Betreiber für den eigenen Betriebs- und Wiederherstellungsstand, eine Studie für ihre Daten, eine Hilfsorganisation für ihre eigenen Tätigkeiten.

**Unabhängigkeit:** Die Kategorie allein beweist keine Aussage. Mehrere Übernahmen oder Weiterverbreitungen derselben Ursprungsangabe sind keine unabhängigen Bestätigungen; unterschiedliche Kategorien sind kein Unabhängigkeitsnachweis. Die Kernaussage stützt sich nach Möglichkeit auf voneinander unabhängige Ursprungsquellen; ein einzelner zuständiger Primärbeleg kann tragfähig sein, wenn er die Aussage unmittelbar trägt. Fehlt eine unabhängige Bestätigung, wird das offen benannt.

**Bestätigungsgrad:** Kategorie (Herkunft) und Bestätigungsgrad sind getrennt; den Bestätigungsgrad zentraler Aussagen regelt SOP-LEAD A.3.

**Format im Feld „Quellen & Referenzen“** (ein Eintrag je Quelle, nummeriert in der Reihenfolge der ersten Nennung, Folgezeilen gehören zum vorherigen Eintrag):

```
[Q1] A – Herausgeber (TT.MM.JJJJ): Titel. Online abrufbar unter: URL [Zugriff: TT.MM.JJJJ]
[Q2] B – Netzbetreiber Y (09.10.2026): Störungsmeldung. Online abrufbar unter: https://… [Zugriff: 09.10.2026]. Datenstand: 09.10.2026, 12:00
[Q3] A – Lagezentrum Land X (09.10.2026): Lagemeldung Nr. 12 (behördenintern) [Zugriff: 09.10.2026]
[Q4] M – Redaktion Z (08.10.2026): Titel. Online abrufbar unter: https://… (Paywall) [Zugriff: 09.10.2026]
```

- Das Zugriffsdatum ist bei jeder Quelle anzugeben. Datenstand und Veröffentlichungsdatum werden getrennt geführt, soweit verfügbar.
- Eine Bezahlschranke wird mit „(Paywall)“ gekennzeichnet, eine unzugängliche Quelle mit „nicht ausgewertet“. Davon abhängige Aussagen gelten nicht als gesichert.
- Beigefügtes Material ohne URL wird mit Herausgeber, Datum, Titel und Dokumentstand und dem Zusatz „(Eingangsmaterial)“ geführt.
- **Verweise im Text:** `[Q1]`, `[Q2, Q4]` oder `[Q1–Q3]` in den Analysefeldern und im Bewertungstext. Das Quellenverzeichnis steht nicht mehr in „Lage & Ereignis“.
- Die App prüft automatisch: zitiert, aber nicht verzeichnet · verzeichnet, aber nicht zitiert · fehlende oder ungültige Kategorie · fehlendes Zugriffsdatum · doppelte Nummern · Quellenzeilen im Altformat.

---

## 6. Leerwerte und JSON

| Feld | Leerwert | Hinweis |
|---|---|---|
| `sofort.lagenradar.d1` … `d8` | `null` | nie `0`, nie Zeichenkette, nie „U“ |
| `sofort.beurteilung`, `sofort.tendenz` | `""` | Option „keine Angabe“ |
| Textfelder, Datumsfelder | `""` | Datum als `JJJJ-MM-TT`, Meldezeitpunkt als `JJJJ-MM-TTThh:mm`; `eintritt` und `meldezeitraum` nur bei belegter Uhrzeit als `JJJJ-MM-TTThh:mm` |
| `kennung` (Sachverhalt) | `""` | vergibt die App; die KI setzt für neue Sachverhalte Platzhalter `NEU-1`, `NEU-2` … (Abschnitt 8.1) |
| `bezug` (Sachverhalt) | `[]` oder Feld weglassen | nur Kennungen aus vorliegenden Meldungen (Abschnitt 8.2) |
| `zeitstrahl` | `""` oder Feld weglassen | eine Zeile je Ereignis mit Kenntniszeit (Abschnitt 8.3); die Kenntniszeit setzt die App |

Struktur und Werte prüft das JSON-Schema der Meldung (Datei `meldung.schema.json`).

---

## 7. Kurzbeispiele zur Abgrenzung (fiktiv)

| Situation | Kodierung | Begründung |
|---|---|---|
| Frühwarnung Weltraumwetter, kein Ereignis in Deutschland | D1 offen, D2 offen, D3 strukturell nur bei belegter Fachaufgabe, sonst offen | kein Wirkungsraum, keine Grundgesamtheit (D2-Bedingung b nicht erfüllt) |
| Drei bestätigte Erkrankte einer meldepflichtigen Krankheit in einem Kreis | D2 = 0 | belegte Kleinzahl (Bedingung a) |
| Meldepflichtige Krankheit, Surveillance meldet für Deutschland keine Fälle | D2 = 0 | belegter Nullbefund (Bedingung b) |
| Stromausfall, 12.000 Anschlüsse ohne Versorgung, kein Umrechnungsfaktor belegt | D2 offen | Anschlüsse ≠ Personen |
| Landesweit zusammengezogene Kräfte im Einsatz, Hilfe aus Nachbarstaat nur zugesagt | D4 = 4 | Zusage zählt nicht; maßgeblich ist die Herkunft der eingesetzten Kräfte |
| THW-Ortsverband aus dem Nachbarkreis im Einsatz | D4 = 2 | Standort der Einheit; Träger auf Bundesebene unerheblich |
| Feuerwehr aus dem angrenzenden Kreis jenseits der Landesgrenze | D4 = 2 | Nachbarschaftshilfe, nicht bundesweit |
| THW-Einheiten aus mehreren Ländern zusammengezogen | D4 = 5 | am weitesten herangeführte Kraft |
| Bundeswehr-Einheit vom Standort im selben Kreis | D4 = 2 | Standort, nicht Bundesebene |
| Landesfachstelle entsendet Kräfte aus einem anderen Regierungsbezirk zur Beratung einer Stadtverwaltung | D4 = 3 | Dienstort der entsandten Kräfte; Landesebene im Text |
| Netzbetreiber nennt widersprüchliche Wiederversorgungszeiten, Land meldet verzögert | D7 = 2 oder 3 nach Belegen | Informationslage der Befassung eingeschränkt |
| Mobilfunk im Schadensgebiet ausgefallen, Lagezentrum gut informiert | D7 niedrig, D6 erfasst TK-Kopplung | Bevölkerungskommunikation gehört zu D6 und Text |
| E-Mail einer Pflegeeinrichtung ausgefallen, Erreichbarkeit per Telefon und Fax belegt | D6 = 0 | Ersatzweg trägt die Funktion vollständig; Ausfall im Text |
| E-Mail einer Pflegeeinrichtung ausgefallen, Medikamentenbestellungen verzögern sich belegt | D6 = 1 | Leistung für Betroffene trotz Ersatzweg verzögert (peripher) |
| Sturmflut erwartet; Stadt gibt vor dem Scheitel Sandsäcke aus, Medien berichten darüber | D3 = 1 | Vorsorge vor dem Akutereignis ist beobachtbare Zurechnung (Kommune) |
| Wasserstandsvorhersagen zweier Dienste weichen deutlich voneinander ab | D7 nach Entscheidungsrelevanz, keine feste Stufe | zuerst Bezugsraum, Gültigkeitszeit, Methodik und Unsicherheit vergleichen; übereinstimmende Vorhersagen tragen D7 = 0 nur bei sonst aktueller und tragfähiger Lageinformation |
| Hochrechnung 800–1.400 Personen ohne Wasserversorgung (Haushalte × Faktor) | D2 offen; Bandbreite im Text | Bandbreite schneidet die Grenze zwischen Stufe 2 und 3 (Grundregel 6) |
| Mindestens 1.200 Evakuierte registriert, Zählung läuft | D2 = 3 (Mindestwert) | bestätigte Mindestzahl, im Text als Mindestwert gekennzeichnet |
| Ersatzteil eines ausländischen Herstellers über den regulären Großhandel geliefert | D4 nicht „international“ | reguläre Lieferung ist keine ereignisbezogene Mobilisierung |
| Gasversorgung angespannt, Lage seit zwei Wochen unverändert belegt | D8 = 0 | belegt stabiler Verlauf; Kipprisiken in Risiken und `Neubewertung bei:` |
| Abkochgebot vor t0 aufgehoben, Meldung im Nachlauf | D1, D2 offen; D5 = 0; D6 nach Kopplungen zu t0; D8 nach dem Meldezeitraum | Kodiert wird der Ist-Zustand zu t0 (Grundregel 1); Umfang und Dauer stehen in „Lage & Ereignis“ und im Kennsatz `Abschluss im Lagebild:` |
| Gesundheitsamt einer kreisfreien Stadt ordnet ein Abkochgebot an | D3 = 2 | bewertet wird die Funktion der unteren Gesundheitsbehörde (Kreisebene), nicht die Gebietskörperschaft; eine Gemeindeaufgabe derselben Stadt bleibt 1 |
| Betreiber erwartet Notbetrieb „mindestens bis Ende der Woche“ (vier Tage ab t0) | D5 = 3 (Mindestwert) | Mindestprognose nach D5; Kennzeichnung im Bewertungstext |
| Ausbruch im Ausland mit steigenden Fallzahlen; in Deutschland keine Fälle und keine eigene amtliche Beobachtung | D8 offen | keine deutsche Beobachtungsbasis; nicht D8 = 0. Die internationale Entwicklung steht als Frühwarnindikator im Text, nicht als deutsche Dynamik |

---

## 8. Zeitstrahl, Sachverhaltskennung und Bezug

Der Zeitstrahl gehört wie das Quellenverzeichnis zum Belegapparat der Meldung: Er zeigt je Sachverhalt, wann was eingetreten ist, und trägt Fortschreibung (SOP-LEAD A.8.1), Verdichtung (A.7.1) und Rückblick (A.8.3). Er bewertet nicht. Kennung und Bezug machen Sachverhalte über Ausgaben und Ebenen hinweg zuordenbar.

### 8.1 Sachverhaltskennung (`kennung`)

- **Form** `Präfix-JJJJMMTT-XXXX`, z. B. `DE-TH-20261014-K7QM`: Präfix nach der Herkunft der meldenden Stelle (Darstellungsdatei, `kennung.praefixe`; in diesem Profil nach ISO 3166: `DE` für den Bund, `DE-TH` für Thüringen usw.), Anlagedatum und vier Zeichen aus dem Base32-Alphabet nach Crockford (Ziffern und Großbuchstaben ohne I, L, O, U). Die Kennung ist ohne Register und ohne Zählerstand eindeutig, auch offline und über viele meldende Stellen.
- **Vergabe:** Die App vergibt die Kennung beim Anlegen eines Sachverhalts in der Maske und nach einem KI-Entwurf. Eine KI bildet keine Kennungen; sie setzt für neue Sachverhalte die Platzhalter `NEU-1`, `NEU-2` … und verwendet sie auch im Zeitstrahl und im Bezug.
- **Fortschreibung:** Die Kennung bleibt unverändert, solange Gegenstand, Raum und bewertete Funktion gleich bleiben (A.8.1). Bei geändertem Zuschnitt (Teilung, Zusammenführung) erhält der neue Sachverhalt eine neue Kennung und nennt die bisherige im Bezug.
- Eine Kennung einer anderen Stelle wird nie als eigene geführt.

### 8.2 Bezug (`bezug`)

- Liste der Kennungen der Sachverhalte aus Eingangs- und Vormeldungen, aus denen der Sachverhalt hervorgeht: bei der Verdichtung alle eingehenden Sachverhalte (A.7.1), bei einer Teilung die Kennung des Ausgangssachverhalts.
- Nur Kennungen, die in einer vorliegenden Meldung stehen. Ein neu erfasster Sachverhalt hat keinen Bezug.
- Der Bezug ersetzt nicht den Quellennachweis: Jede verwendete Eingangsmeldung bleibt ein eigener Eintrag im Quellenverzeichnis (Abschnitt 5).

### 8.3 Zeitstrahl (`zeitstrahl`)

**Form:** eine Zeile je Ereignis, `[Zn] JJJJ-MM-TT[Thh:mm] · Kennung · Typ – Kurztext [Qn] · aufgenommen JJJJ-MM-TTThh:mm`. Die Uhrzeit des Ereignisses steht nur, wenn sie belegt ist (wie bei `eintritt`, Abschnitt 6), als Wanduhrzeit der Profilzeitzone. Der Kurztext ist ein Satz mit höchstens etwa 160 Zeichen; Verweise wie in Abschnitt 5. Die **Kenntniszeit** am Ende („aufgenommen“) ist der Meldezeitpunkt der ersten Meldung der meldenden Stelle, in der die Zeile steht; sie setzt die App (Regel 2).

| Typ | Wann | Beleg |
|---|---|---|
| Ereignis | Eintritt, Ausweitung, Schadensereignis, Höchststand | `[Qn]` |
| Warnung | Ausgabe, Hoch- oder Herabstufung oder Aufhebung einer amtlichen Warnung | `[Qn]` |
| Maßnahme | angeordnete, begonnene oder beendete Maßnahme einer zuständigen Stelle (Status nach SOP-LEAD A.4) | `[Qn]` |
| Wendepunkt | belegte Änderung der Dynamik oder des Zuschnitts (z. B. Scheitel überschritten, Ursache bestätigt) | `[Qn]` |
| Wiederherstellung | erreichter Zielzustand oder belegte Teilwiederherstellung | `[Qn]` |
| Bewertung | Wechsel von Beurteilung oder Tendenz gegenüber der Vormeldung; setzt die App bei der Fortschreibung | ohne Verweis (eigene Meldung) |
| Berichtigung | Korrektur einer früheren Zeile, beginnt mit „zu [Zn]:“ | `[Qn]` |

**Regeln:**

1. **Nur Eingetretenes bis t0.** Erwartete Entwicklungen, Prognosen und Fristen stehen in „Risiken & Auswirkungen“ und in den Kennsätzen `Neubewertung bei:` und `Handlungsrelevant bis:`, nicht im Zeitstrahl (Grundregel 7). Eine zu t0 gültige Warnung steht mit ihrer Ausgabe, nicht mit ihrem Gültigkeitsende.
2. **Ereigniszeit und Kenntniszeit getrennt.** Der Zeitpunkt am Zeilenanfang ist der des Ereignisses. Ist nur der Zeitpunkt einer Meldung bekannt, sagt der Kurztext das („nach Meldung von … um …“). Die Kenntniszeit („aufgenommen“) zeigt, seit wann die Zeile im Lagebild der meldenden Stelle steht: Die App setzt den Meldezeitpunkt der Meldung, in der die Zeile zum ersten Mal erscheint, und lässt ihn bei jeder Fortschreibung unverändert; das gilt auch für Zeilen, die eine Verdichtung aus Eingängen übernimmt. Wann die Information erstmals irgendwo vorlag, zeigen Quelle, Zugriff und Datenstand im Quellenverzeichnis (bei Eingangsmeldungen deren Meldezeitpunkt). Zusammen beantworten sie die erste Frage des Rückblicks (A.8.3). Die Kenntniszeit liegt nicht vor dem Ereignis und nicht nach dem Meldezeitpunkt der Meldung.
3. **Auswahl:** Aufgenommen werden Ereignisse, die Bewertung, Tendenz oder eine Radarachse tragen oder verändern, nicht jede Einzelmeldung. Richtwert: zwölf Zeilen je Sachverhalt; darüber werden nur noch Wendepunkte neu aufgenommen, frühere Zeilen bleiben stehen.
4. **Reihenfolge:** chronologisch, bei gleichem Zeitpunkt nach Nummer; ein Tag ohne Uhrzeit steht vor den Uhrzeiten desselben Tags.
5. **Fortschreibung (A.8.1):** Frühere Zeilen bleiben wortgleich mit ihrer Nummer und ihrer Kenntniszeit; neue Zeilen erhalten die nächste freie Nummer und den neuen Meldezeitpunkt als Kenntniszeit. Eine Korrektur steht als neue Zeile vom Typ „Berichtigung“ („zu [Z3]: Eintritt 14.10.2026 05:30 statt 06:00 [Q7]“), nie als Änderung der früheren Zeile.
6. **Verdichtung (A.7.1):** Dasselbe Ereignis aus mehreren Eingängen steht einmal, mit der eigenen Kennung. Beleg ist die Eingangsmeldung (Kategorie nach der Rolle der meldenden Stelle, Abschnitt 5) oder die selbst geprüfte Originalquelle. Widersprüchliche Zeitangaben stehen mit beiden Stellen in einer Zeile nebeneinander und werden nicht gemittelt.
7. **Verhältnis zum Lagenradar:** Der Zeitstrahl trägt keine Radarwerte und ersetzt keine Begründung. D8 stützt sich nur auf vergleichbare Beobachtungen; die Zahl der Zeilen ist kein Maß für Dynamik. Für D5 zählt die seit dem Eintritt verstrichene Dauer nicht (Restdauer, Abschnitt 3); eine Zeile „Wiederherstellung“ belegt D5 = 0 nur, wenn sie den benannten Zielzustand betrifft.
8. **Prüfung durch die App:** Form der Zeile, gültiger Zeitpunkt, kein Zeitpunkt nach t0, Kenntniszeit (vorhanden, gültig, nicht vor dem Ereignis, nicht nach t0), vorhandene Kennung, zulässiger Typ, Quellenverweis (außer „Bewertung“), doppelte Nummern, Reihenfolge, Berichtigung mit Bezug auf eine Zeile und Richtwert. Verweise im Zeitstrahl zählen im Quellenverzeichnis als Zitate. Bei der Fortschreibung stellt die App veränderte oder fehlende Zeilen der Vormeldung wieder her, setzt die Kenntniszeit (ältere Zeilen ohne Angabe erhalten den Meldezeitpunkt der Vormeldung) und trägt Bewertungswechsel selbst ein.

**Beispiel** (fiktiv, Auszug aus der verdichteten Meldung im Datensatz Orkantief „Ilka“; [Q1] bis [Q6] sind dort die Eingangsmeldungen der Länder):

```
[Z1] 2026-10-13T12:00 · DE-20261014-7QKD · Warnung – DWD-Warnung vor Orkanböen für Eifel, Hunsrück und Westerwald bis 20:00 Uhr, nach Meldung Rheinland-Pfalz [Q1] · aufgenommen 2026-10-14T14:00
[Z5] 2026-10-13T22:30 · DE-20261014-7QKD · Ereignis – Höchststand im Landkreis Sonneberg mit rund 18.000 Anschlüssen ohne Strom nach Mastschäden an einer 20-kV-Leitung [Q5] · aufgenommen 2026-10-14T14:00
[Z7] 2026-10-14T05:00 · DE-20261014-7QKD · Wendepunkt – Oberharz: nachstürzende Bäume werfen die Wiederversorgung zurück, wieder rund 4.600 Haushaltsanschlüsse ohne Strom [Q4] · aufgenommen 2026-10-14T14:00
[Z8] 2026-10-14T06:00 · DE-20261014-7QKD · Wiederherstellung – Schnellfahrstrecke Köln–Rhein/Main wieder frei, Fernverkehr läuft schrittweise wieder an [Q3] · aufgenommen 2026-10-14T14:00
```

Der Sachverhalt `DE-20261014-7QKD` nennt im Bezug die sieben Sachverhalte der sechs Ländermeldungen (Thüringen meldet zwei).

---

## 9. Pflege

Achsenregeln, Quellenkategorien, die Rangfolge bei Widersprüchen und die Regeln zu Zeitstrahl, Kennung und Bezug werden nur in diesem Leitfaden fortgeschrieben (SOP-LEAD A.10.2: ein Ort, Verweise sonst), damit Mensch und KI nach derselben Fassung kodieren. SOP-LEAD Teil A und die Arbeitsanweisungen verweisen darauf; bei einer Änderung wird geprüft, ob ein Verweis anzupassen ist. Die Darstellungsdatei führt zusätzlich die Stufentexte und die Kategorienamen, weil die App sie anzeigt und auswertet; sie werden mit diesem Leitfaden geändert. Die App prüft beim Import eines Profils, ob die Stufentexte der Darstellungsdatei wortgleich im Kodierleitfaden stehen.

**Änderungsprotokoll:**

| Fassung | Datum | Änderung |
|---|---|---|
| 1.0 | 17.10.2026 | Beispielfassung, abgeleitet aus der Arbeitsfassung v0.4 |
| 1.0.1 | 17.10.2026 | Autorenname im Zitat des Lagenradars korrigiert |
| 1.1 | 17.10.2026 | D3: berichtete Vorsorge vor dem Akutereignis als Zurechnung (Ebene der vorsorgenden Stelle); D7: widersprüchliche Vorhersagen = 1, eindeutige Lage = 0; zwei Kurzbeispiele |
| 1.2 | 19.10.2026 | Quellenkategorie B (Betreiber), Priorität A > B > W > M > P, Zuordnungsregeln und neu gefasste Unabhängigkeitsregel (Abschnitt 5); Grundregel 6 „Keine unbelegte Präzision“ mit Mindestkodierung statt Untergrenzenregel; Grundregel 7 mit D5 als definierter Prognoseausnahme; D3 ausgewählte Funktion; D4 ohne reguläre Lieferungen; D7 ohne pauschale Vorhersageregel (ersetzt die Festlegung aus 1.1), mit fachlichen Lücken; D8 stabiler Verlauf = 0; vier neue Kurzbeispiele. Abgestimmt mit SOP-LEAD-Sammelmappe 2.0; Rangfolge mit Bausteinen aus Teil C; Belegregel bei zwei passenden Stufen; Zuordnungsbeispiele zu den Quellenkategorien; Bezug auf SOP-Sammelmappe und Arbeitsanweisung als Mindestfassung mit Verweis auf den Gültigkeitsstand |
| 1.2.1 | 20.10.2026 | Abschnitt 6: `eintritt` und `meldezeitraum` dürfen eine belegte Uhrzeit tragen (LEAD-Meldevorlage 1.1); Regeln sonst unverändert |
| 1.2.2 | 21.10.2026 | Kurzbeispiel D8 bei Auslandslagen ohne deutsche Beobachtungsbasis (offen, nicht 0); Regeln unverändert. Anlass: Testreihe der KI-Modelle vom 20.10.2026, in der D8 = 0 für eine Auslandslage gesetzt wurde |
| 1.3.0 | 23.10.2026 | Mitfortschreibung von SOP-LEAD Teil A (3.14.0–3.16.0) nach A.10.2: D2 zählt Evakuierte, Verlegte und in Schutzunterbringung Aufgenommene erst mit vollzogener Maßnahme; D3-Funktionsliste beispielhaft, bewertet wird die konkret betroffene Funktion; D6 steigt nicht allein mit der Ausfalldauer; Rangfolge nennt Beispielfassungen; Pflegeregel nennt Teil A. Anlass: Konsistenzprüfung KW 43 (KP-2026-W43-13, -33, -34, -38, -39) |
| 1.4.0 | 24.10.2026 | Grundregel 1: Ist-Kodierung auch nach Ende der Einschränkung vor t0 (ET-2026-W43-01); D5: erreichter Zielzustand = 0 (ET-2026-W43-01) und Mindestprognose als gekennzeichneter Mindestwert (ET-2026-W43-04); drei Kurzbeispiele, darunter D3 bei kreisfreien Städten nach wahrgenommener Funktion (ET-2026-W43-06). Mitfortschreibung von SOP-LEAD Teil A.2 (D5) nach A.10.2. Anlass: Erfassungstest KW 43 |
| 1.5.0 | 27.10.2026 | Einziger Ort für Achsenregeln, Quellenkategorien und Rangfolge (SOP-LEAD A.10.2 „ein Ort, Verweise sonst“): Einleitung, Rangfolge und Pflege (Abschnitt 8) entsprechend gefasst. Aus Teil A und der Arbeitsanweisung Erfassung übernommen, weil sie nur dort standen: Aussagekompetenz der Quellen, Format für Eingangsmaterial ohne URL, Beispiel Lagebericht des GMLZ, frühere Kennung „J“ für Medien (Abschnitt 5), Beurteilung mit Unsicherheit und Handlungsbedarf (Abschnitt 4), Erklärung bei unvollkommener Skala (Grundregel 6), Feld der Wirkungskette (D6). Bestätigungsgrad als Verweis auf A.3. Achsenregeln, Stufentexte und Quellenkategorien sonst unverändert. Anlass: technische Prüfung KW 44 (TP-2026-W44-32) Entscheidungen des Herausgebers vom 27.10.2026 zu TP-2026-W44-32: JSON-Schema in der Rangfolge (Rang 1 mit den Stufentexten); Dateiformat und Bearbeitungsmodus unerheblich für die Quellenkategorie; keine automatische Umstufung bestehender Einträge in allen Kategorien; Aktualität in der Kodierfrage von D7. Fassungstabelle aufsteigend sortiert (1.3.0 vor 1.4.0). |
| 1.6.0 | 29.10.2026 | Neuer Abschnitt 8 „Zeitstrahl, Sachverhaltskennung und Bezug“ (ZS-2026-W44-01 bis -05): Kennung `Präfix-JJJJMMTT-XXXX` mit Vergabe durch die App und Platzhaltern `NEU-n` für die KI, Bezug bei Verdichtung und Teilung, Zeitstrahl mit fester Zeilenform, sieben Typen und Kenntniszeit „aufgenommen“ (ZS-2026-W44-05), Regeln zu Ereignis- und Kenntniszeit, Auswahl (Richtwert zwölf Zeilen), Fortschreibung nur durch Anfügen und Berichtigung, Verdichtung und Verhältnis zu D5/D8. Abschnitt 6 mit Leerwerten der neuen Felder, Pflege jetzt Abschnitt 9, Titel und Einleitung ergänzt. Achsenregeln, Stufentexte und Quellenkategorien unverändert. Anlass: Entscheidung des Herausgebers vom 29.10.2026 |
| 1.7.0 | 30.10.2026 | D2: Ausfall von Verwaltungsleistungen allein ist keine Direktbetroffenheit (KP-2026-W44-02, allgemein statt nur B15); D4: Standortregel für den Herkunftsort mit Nachbarschaftshilfe, Stufe je Kraft und regulär beauftragten Dienstleistern, fünf Kurzbeispiele (KP-2026-W44-03); D6: Abgrenzung Stufe 0/1 nach Verzögerung trotz Ersatzweg, zwei Kurzbeispiele (OB-2026-W44-02); Abschnitt 4 „Beurteilung und Tendenz“ mit Begriffsbrücke zur Beschriftung „Bewertung“ (KP-2026-W44-04); Abschnitt 5: Sprachfassung zitierter Quellen (OB-2026-W44-03). Anlass: Sammelbefunddatei `ki-lead-befund_offen_2026-W44.json`, Entscheidungen des Herausgebers vom 26. und 30.10.2026 |
