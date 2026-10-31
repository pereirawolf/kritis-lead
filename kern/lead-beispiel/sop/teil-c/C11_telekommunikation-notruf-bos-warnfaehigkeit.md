<a id="c11"></a>

## C11. Baustein LEAD: Telekommunikation, Notruf, BOS-Kommunikation und Warnfähigkeit

```yaml
kennung: "C11"
typ: "Themenbaustein"
bausteintyp: "Themenbaustein unter bestehendem Dach"
lesegruppe: "Versorgung, Kommunikation und Logistik"
lageart: "Ausfall oder Störung von Telefonie, Daten, Notruf 110/112, Leitstellen, BOS-Funk, Warnmitteln oder amtlichen Informationsangeboten mit Schutzbezug"
art_zuordnung: ["KRITIS-Ausfall", "Cyberangriff / IT-Sicherheitsvorfall"]
art_hinweis: "„KRITIS-Ausfall“ bei belegtem Ausfall oder wesentlicher Einschränkung einer kritischen Dienstleistung; „Cyberangriff / IT-Sicherheitsvorfall“ bei belegtem Vorfall oder als Prüfhilfe zu B15 bei begründeter Vorsorgebefassung"
anschluss: "B12, B15"
zweck: "Getrennte Erfassung von Netzzugang, Notrufvermittlung, Leitstelle, BOS-Funk, Warnung und Informationsversorgung."
version: "1.2.2"
status: "Inhaltsgerüst – vor Verwendung Quellen, Fachzuständigkeit und organisationsspezifische Verfahren konkretisieren"
stand: "23.10.2026"
pflegeverantwortlich: "Herausgeber der Beispielfassung (bei Übernahme: fachlich zuständige Funktion eintragen)"
quellen_geprueft_am: "21.10.2026 – BBK „So werden Sie gewarnt“: gezielter Inhaltsabgleich (sichtbare, für den Zweck einschlägige Passagen; keine Vollprüfung der Unterseiten); übrige Ansprechstellen vor Erstverwendung prüfen (A.6)"
naechste_pruefung_faellig: "31.03.2027"
bisherige_kennung: "N02"
bisherige_ids: ["baustein-n02"]
```

### 1. Anwendungsbereich und Befassungsanlässe

**Umfasst / grenzt ab von:** Einschränkungen von 110/112, Telefonie und Datendiensten, Leitstellen, BOS-Funk und Warnmitteln (einschließlich technisch ausgefallener Warnmittel). 110/112, BOS-Kommunikation und öffentliche Warnung haben unterschiedliche Zuständigkeiten. D7 nach A.2 (Informationslage der Befassung einschließlich entscheidungsrelevanter Lücken zur gestörten Funktion); die Kommunikation mit der Bevölkerung gehört in den Folgentext und zu D6 (A.2, A.9.3). Ursache zusätzlich über B08, B15 oder B16.

**Öffentliche Informationsversorgung:** Ergänzend den Wegfall amtlicher Informationsangebote prüfen, soweit er einen konkreten Schutz-, Orientierungs- oder Hilfszugangsbezug hat, etwa wenn etablierte Informationsseiten während einer Gefahrenlage fehlen. Ein ausgefallener Behörden- oder Polizei-Webauftritt belegt keine Störung von 110/112, Leitstellen, BOS-Funk, MoWaS oder angeschlossenen Warnmultiplikatoren. Rein repräsentative Website-Ausfälle ohne solchen Funktionsbezug werden nicht zur Warnfähigkeits- oder KRITIS-Lage.

**Befassungsanlässe:** Bestätigter Ausfall eines Notruf- oder Leitstellenwegs · Störung von TK- oder BOS-Diensten oder Warnmitteln mit Schutzbezug · Wegfall amtlicher Informationsangebote mit Schutz- oder Hilfszugangsbezug.

**Zuordnung im Schema:** „KRITIS-Ausfall“ bei belegtem Ausfall oder wesentlicher Einschränkung einer kritischen Dienstleistung; „Cyberangriff / IT-Sicherheitsvorfall“ bei entsprechend belegtem Vorfall. Als Prüfhilfe zu B15 kann der Baustein auch bei begründeter Vorsorgebefassung dienen; die Ereignisart wird dadurch nicht um „KRITIS-Ausfall“ erweitert.

### 2. Erfassung: Prüffragen

**Funktions- und Ersatzwegeprofil:** Nur entscheidungsrelevante Funktionen getrennt prüfen: öffentliche Schutzinformation · Online-Verwaltungsdienst · Notrufannahme · Leitstellenbetrieb · BOS-Kommunikation · Warnauslösung · Warnübertragung. Je Funktion: betroffener Raum, Beginn, letzter bestätigter Status, Umfang, bestätigter Ersatzweg mit seiner technischen und organisatorischen Unabhängigkeit und seinen Grenzen, Wiederanlaufprognose. Ungeprüfte Funktionen ausdrücklich offenlassen, ohne lange Fehlanzeigen für alle Funktionen. Webseiten als Informationsquelle und als Online-Dienst unterscheiden. Die Erreichbarkeit eines Ersatzwegs folgt nicht aus seiner bloßen Existenz; ein Social-Media-Konto ist nicht ohne Prüfung gleichwertig. Für Menschen ohne digitalen Zugang oder mit Sprach- oder Wahrnehmungsbarrieren nach belegten Alternativen fragen (A.9.2). Kontaktdaten und Ersatznotrufwege nur nach R4.

| ID | Leitfrage | Quelle & Aktualität | Prüfen für | Hinweis/Stolperstelle |
|---|---|---|---|---|
| R1 | Welche Funktion ist seit wann in welchem Raum eingeschränkt: 110/112, Telefonie, Daten, Leitstelle, BOS-Funk oder Warnkanal? | Betreibermeldungen (A.3); Leitstellen; Lagemeldungen (A.3) | L; D1 | Teilstörung ≠ Totalausfall; Funktion einzeln benennen. |
| R2 | Welche Trägernetze und gemeinsamen Abhängigkeiten sind betroffen? | Betreibermeldungen (A.3); BNetzA (Telekommunikation) | R/I; D6 | Gemeinsame Abhängigkeiten (Strom, Transportnetz, IT-Dienstleister) belegen. |
| R3 | Sind Auslösung, Übertragung und tatsächliche Erreichbarkeit einer Warnung zu unterscheiden? | [BBK: So werden Sie gewarnt](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Warnung-in-Deutschland/So-werden-Sie-gewarnt/so-werden-sie-gewarnt_node.html); herausgebende Behörde | R/M | Ausgelöst ≠ übertragen ≠ wahrgenommen (A.9.3). |
| R4 | Welche amtlich kommunizierten Alternativen sind tatsächlich erreichbar und wie belastbar? | Lagemeldungen (A.3); zuständige Gefahrenabwehrbehörde | M | Ersatzkontakte nur mit bestätigter Erreichbarkeit und Zuständigkeit wiedergeben; keine ungeprüften Notrufalternativen veröffentlichen. |
| R5 | Welche Folgen bestehen für Rettung, häusliche Versorgung, Warnung und Lageübermittlung? | Lagemeldungen (A.3) | R; D6/D7 | Anrufversuche sind keine Zahl individuell betroffener Personen; aus fehlenden Anrufen folgt keine Schadensfreiheit. |
| R6 | Welche Entstörprognose und welche Reserven sind belegt? | Betreibermeldungen (A.3) | M/R; D5 | Akku- und Notstromreserven mit Reichweite nur nach Betreiberangabe. |

### 3. Auswertung: Prüfpunkte

- **D2:** nur mit belegter Personenzahl; Anrufversuche, Mobilfunkverträge oder Anschlüsse sind keine Personen.
- **D6:** Kernachse; Funktion der Gefahrenabwehr und Warnfähigkeit als Kopplungsobjekt.
- **D7:** nach A.2: gestörte Melde- und Lagewege der befassten Stellen (z. B. Leitstellen) sowie entscheidungsrelevante Lücken oder Widersprüche zu Umfang, Ersatzweg und Wiederanlauf der gestörten Funktion; ein technischer Kommunikationsausfall ist weder Voraussetzung noch für sich ein D7-Wert. Ausfälle der Kommunikation mit der Bevölkerung gehören in den Text und zu D6 (A.9.3).

**Offenlassen:** D2 ohne belegte Personengrundlage; D5 ohne Entstörprognose.

### 4. Darstellung

Nach B12, unter B15 nach dessen Darstellung; je Funktion (öffentliche Schutzinformation, Online-Verwaltungsdienst, Notruf, Leitstelle, BOS-Funk, Warnauslösung und -übertragung, Telefonie/Daten) Status, Ersatzweg und Prognose getrennt.

### 5. Ansprechstellen und Pflege

**Ansprechstellen (funktional):** Betroffene Telekommunikationsanbieter und Netzbetreiber zur eigenen Leistung (B) · BNetzA (Telekommunikation, Aufsicht) · Leitstellen und Träger des Rettungsdienstes bzw. der Polizei zu Notrufannahme und Leitstellenbetrieb (A) · für den BOS-Digitalfunk zuständige Stellen des Landes und BDBOS · Warnzentralen der Länder, BBK (MoWaS) und herausgebende Behörde zu Warnauslösung und -übertragung · zuständige Behörde zu amtlichen Informationsangeboten. Zuständigkeiten landes- und fallbezogen prüfen; keine Kontaktdaten in der Beispielfassung.

**Offene Punkte:** Zuständige Ansprechstellen für BOS-Funk und Leitstellen organisationsspezifisch festlegen. Ebenso festlegen, welche amtlichen Informationsangebote im Referenzraum für Schutzinformation und Hilfszugang erforderlich sind, welche Ersatzkanäle bestehen und über welche etablierten Melde- und Abstimmungswege der Funktionsstatus zu erfahren ist, ohne der Koordinierungsstelle Betriebs- oder Aufsichtsaufgaben zuzuschreiben.
