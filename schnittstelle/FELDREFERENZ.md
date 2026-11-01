# Feldreferenz LEAD-KRITIS-Meldung-v0.2

> Erzeugt von `werkzeuge/bauen/schnittstelle-bauen.mjs` aus dem Profilschema und der Darstellungsdatei; nicht von Hand bearbeiten. Maßgeblich ist das JSON-Schema [profil/lead-kritis/meldung.schema.json](../profil/lead-kritis/meldung.schema.json). Anleitung für Schnittstellen: [docs/SCHNITTSTELLE.md](../docs/SCHNITTSTELLE.md).

Schemakennung `LEAD-KRITIS-Meldung-v0.2` (Feld `schema`), JSON Schema Draft 2020-12. 205 Felder, davon 150 aus der Erweiterung `lead-kritis` (mit ᴱ gekennzeichnet), die übrigen aus dem Kernschema LEAD-Meldung-v1. Pfade nennen Listenelemente mit `[]`; „Pflicht“ heißt: Das Feld muss im übergeordneten Objekt stehen. Was nur unter einer Bedingung gilt, steht unter „Bedingte Regeln“. Objekte nehmen keine Felder auf, die hier nicht stehen.

## Meldung

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `schema` |  | Text | ja | immer `"LEAD-KRITIS-Meldung-v0.2"` |  |
| `_status` |  | Text | ja | `"Entwurf"`, `"final"` |  |
| `_entstehung` |  | Objekt | nein | keine weiteren Felder |  |
| `_entstehung.verfahren` |  | Text | ja | `"manuell"`, `"KI-Entwurf"` |  |
| `_entstehung.werkzeug` |  | Text | nein |  |  |
| `_entstehung.modell` |  | Text | nein |  |  |
| `_entstehung.sop` |  | Liste aus Text | nein |  |  |
| `_entstehung.kodierleitfaden` |  | Text | nein |  |  |
| `_entstehung.erstellt` |  | Text | nein |  |  |
| `zeitzone` ᴱ | Zeitzone | Text | nein | Zeitzone nach IANA, z. B. Europe/Berlin | Zeitzone nach IANA, in der alle Wanduhrzeiten der Meldung gelten, z. B. Europe/Berlin. Pflicht, sobald die Meldung einen Meldekopf kritis trägt. |
| `kritis` ᴱ | Meldekopf KRITIS (optional für Behörden) | Objekt | nein | keine weiteren Felder | Meldekopf der Erweiterung lead-kritis: Rolle, Meldeart, Anlass, Nachrichtenidentität, Vertraulichkeit, Empfänger und parallele Pflichtmeldungen. |
| `land` | Auswahl Land/Bund | Text | ja | leer, `"Bund"`, `"Baden-Württemberg"`, `"Bayern"`, `"Berlin"`, `"Brandenburg"`, `"Bremen"`, `"Hamburg"`, `"Hessen"`, `"Mecklenburg-Vorpommern"`, `"Niedersachsen"`, `"Nordrhein-Westfalen"`, `"Rheinland-Pfalz"`, `"Saarland"`, `"Sachsen"`, `"Sachsen-Anhalt"`, `"Schleswig-Holstein"`, `"Thüringen"` |  |
| `meldende_stelle` | Name der meldenden Stelle | Text | ja |  |  |
| `meldezeitpunkt` | Meldezeitpunkt | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm oder leer |  |
| `meldezeitraum` | Meldezeitraum (optional) | Objekt | ja | keine weiteren Felder |  |
| `meldezeitraum.von` | von | Text | ja | Datum JJJJ-MM-TT oder Wanduhrzeit JJJJ-MM-TTThh:mm oder leer | Tag (JJJJ-MM-TT) oder Tag mit Uhrzeit (JJJJ-MM-TTThh:mm, Wanduhrzeit der Profilzeitzone); leer, wenn unbekannt. Seit LEAD-Meldevorlage 1.1. |
| `meldezeitraum.bis` | bis | Text | ja | Datum JJJJ-MM-TT oder Wanduhrzeit JJJJ-MM-TTThh:mm oder leer | Tag (JJJJ-MM-TT) oder Tag mit Uhrzeit (JJJJ-MM-TTThh:mm, Wanduhrzeit der Profilzeitzone); leer, wenn unbekannt. Seit LEAD-Meldevorlage 1.1. |
| `quellen` | Quellen & Referenzen | Text | ja |  |  |
| `zeitstrahl` | Zeitstrahl | Text | nein |  | Zeitstrahl je Sachverhalt, eine Zeile je eingetretenem, belegtem Ereignis bis zum Meldezeitpunkt: „[Zn] JJJJ-MM-TT[Thh:mm] · Kennung · Typ – Kurztext [Qn] · aufgenommen JJJJ-MM-TTThh:mm“ (Kenntniszeit: Meldezeitpunkt der ersten Meldung mit der Zeile, setzt die App). Typen und Regeln: Darstellungsdatei („zeitstrahl“) und Kodierleitfaden Abschnitt 8. Optional, seit LEAD-Meldevorlage 1.2. |
| `sachverhalte` | Ereignisse/Sachverhalte | Liste aus Objekt | ja |  |  |
| `freigabe` | Freigabe & Versand | Objekt | ja | keine weiteren Felder |  |
| `freigabe.erfassung` | Erfassung | Objekt | ja | Baustein Zeichnung |  |
| `freigabe.freigabe` | Freigabe | Objekt | ja | Baustein Zeichnung |  |
| `freigabe.versand` | Versand | Objekt | ja | Baustein Zeichnung |  |

## Meldekopf KRITIS (optional für Behörden): `kritis`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `erweiterung` ᴱ | Fassung der Erweiterung | Text | ja | immer `"lead-kritis/0.2"` |  |
| `rolle` ᴱ | Rolle der meldenden Stelle | Text | ja | `"Betreiber"`, `"Behörde"` | Herkunftsrolle der meldenden Stelle. Betreiber liefern Angaben zum eigenen Betrieb ohne Beurteilung, Tendenz und Lagenradar; Behörden bewerten für ihren Referenzraum. Fehlt der Meldekopf, gilt die Meldung als Behördenmeldung. |
| `meldeart` ᴱ | Meldeart | Text | ja | `"Erstmeldung"`, `"Folgemeldung"`, `"Korrekturmeldung"`, `"Abschlussmeldung"` |  |
| `meldeanlass` ᴱ | Meldeanlass | Liste aus Text | ja | `"drohende Beeinträchtigung"`, `"eingetretene Einschränkung"`, `"wesentliche Änderung"`, `"verkürzte Reichweite eines Ersatzverfahrens"`, `"neuer Unterstützungsbedarf"`, `"Zielzustand erreicht"`, `"Übung"`; mindestens ein Eintrag; ohne Wiederholung |  |
| `meldung_id` ᴱ | Meldungs-ID | Text | ja | URN-UUID urn:uuid:… in Kleinbuchstaben | Kennung dieser Nachricht (URN-UUID, Kleinbuchstaben); jede Meldung, auch jede Folge- und Korrekturmeldung, erhält eine neue. |
| `bezug_meldung_id` ᴱ | Bezug auf Meldung | Text | nein | URN-UUID urn:uuid:… in Kleinbuchstaben oder leer | meldung_id der Meldung, die fortgeschrieben, berichtigt oder abgeschlossen wird; bei einer Erstmeldung leer. |
| `datenart` ᴱ | Datenart | Text | ja | immer `"synthetisch"` | Der Demonstrator verarbeitet ausschließlich synthetische Daten. |
| `vertraulichkeit` ᴱ | Vertraulichkeit | Objekt | ja | keine weiteren Felder |  |
| `vertraulichkeit.tlp` ᴱ | TLP | Text | ja | immer `"CLEAR"` | Kennzeichnung nach TLP 2.0. Im Demonstrator nur CLEAR; nichtöffentliche Inhalte sind ausgeschlossen. |
| `vertraulichkeit.einstufung` ᴱ | Einstufung | Text | nein | immer leer |  |
| `vertraulichkeit.hinweis` ᴱ | Hinweis | Text | nein |  |  |
| `empfaenger` ᴱ | Empfänger | Liste aus Text | ja | Text, nicht leer |  |
| `gemeldet_an` ᴱ | Parallele Pflichtmeldungen (nur dokumentiert) | Liste aus Objekt | ja |  | Parallele Meldungen nach Bundes- oder Landesrecht; nur dokumentiert, nicht ersetzt. Leere Liste: keine dokumentiert. |
| `gemeldet_an[].stelle` ᴱ | Stelle | Text | ja | Text, nicht leer |  |
| `gemeldet_an[].rechtsgrundlage` ᴱ | Rechtsgrundlage | Text | ja |  |  |
| `gemeldet_an[].status` ᴱ | Status | Text | ja | `"erfolgt"`, `"geplant"`, `"nicht_erforderlich"`, `"unbekannt"` |  |
| `gemeldet_an[].zeitpunkt` ᴱ | Zeitpunkt | Text | nein | Wanduhrzeit JJJJ-MM-TTThh:mm oder leer |  |
| `gemeldet_an[].kennzeichen` ᴱ | Kennzeichen | Text | nein |  |  |
| `rechtsgrundlage_dieser_meldung` ᴱ | Grundlage dieser Meldung | Text | nein |  |  |
| `kontaktstelle` ᴱ | Kontaktstelle (Funktionsadresse) | Text | nein |  |  |

## Ereignisse/Sachverhalte: `sachverhalte[]`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `eintritt` | Eintritt (falls zutreffend) | Text | ja | Datum JJJJ-MM-TT oder Wanduhrzeit JJJJ-MM-TTThh:mm oder leer | Tag (JJJJ-MM-TT) oder Tag mit Uhrzeit (JJJJ-MM-TTThh:mm, Wanduhrzeit der Profilzeitzone); leer, wenn unbekannt. Seit LEAD-Meldevorlage 1.1. |
| `art` | Art | Liste aus Text | ja | `"Unwetter / Sturm"`, `"Hochwasser / Überschwemmung"`, `"Waldbrand"`, `"Erdbeben"`, `"Extremhitze / Dürre"`, `"Wintersturm / Schnee / Eis"`, `"Industrieunfall / Chemieunfall"`, `"Stromausfall / Blackout"`, `"Gasversorgungsengpass"`, `"Trinkwasserversorgung"`, `"Gesundheitliche Lage / Epidemie"`, `"KRITIS-Ausfall"`, `"Migrationslage"`, `"Sicherheitslage"`, `"Cyberangriff / IT-Sicherheitsvorfall"`, `"Sabotage / Anschlag / Terrorismus"`, `"Sonstiges"`; ohne Wiederholung |  |
| `ort` | Ort | Text | ja |  |  |
| `bezeichnung` | Bezeichnung | Text | ja |  |  |
| `analyse` | Analysebereich | Objekt | ja | keine weiteren Felder |  |
| `analyse.lage_ereignis` | Lage & Ereignis | Text | ja |  |  |
| `analyse.risiken_auswirkungen` | Risiken & Auswirkungen | Text | ja |  |  |
| `analyse.massnahmen_empfehlungen` | Maßnahmen & Handlungsempfehlungen | Text | ja |  |  |
| `analyse.abhaengigkeiten_interdependenzen` | Abhängigkeiten & Interdependenzen | Text | ja |  |  |
| `sofort` | Sofortbereich | Objekt | ja | keine weiteren Felder |  |
| `sofort.beurteilung` | Bewertung | Text | ja | leer, `"geringfügig"`, `"erheblich"`, `"kritisch"` |  |
| `sofort.tendenz` | Tendenz | Text | ja | leer, `"Entspannung"`, `"Stabilisierung"`, `"Verschärfung"` |  |
| `sofort.bewertung_text` | Bewertung & Tendenz | Text | ja |  |  |
| `sofort.lagenradar` | Lagenradar | Objekt | ja | keine weiteren Felder |  |
| `sofort.lagenradar.d1` | D1 Räumliche Auswirkung / Impact-Raum | ganze Zahl oder null | ja | 0 bis 6 |  |
| `sofort.lagenradar.d2` | D2 Personelle Direktbetroffenheit | ganze Zahl oder null | ja | 0 bis 6 |  |
| `sofort.lagenradar.d3` | D3 Verantwortungszurechnung / Zurechnungszentrum | ganze Zahl oder null | ja | 0 bis 6 |  |
| `sofort.lagenradar.d4` | D4 Unterstützungsreichweite / Mobilisierung | ganze Zahl oder null | ja | 0 bis 6 |  |
| `sofort.lagenradar.d5` | D5 Zeit bis Zielzustand / Übergangsdauer | ganze Zahl oder null | ja | 0 bis 6 |  |
| `sofort.lagenradar.d6` | D6 KRITIS-Bezug / Interdependenzgrad | ganze Zahl oder null | ja | 0 bis 6 |  |
| `sofort.lagenradar.d7` | D7 Kommunikation / Informationslage | ganze Zahl oder null | ja | 0 bis 6 |  |
| `sofort.lagenradar.d8` | D8 Dynamik | ganze Zahl oder null | ja | 0 bis 6 |  |
| `kennung` | Kennung | Text | nein | Sachverhaltskennung Präfix-JJJJMMTT-XXXX oder leer | Sachverhaltskennung „Präfix-JJJJMMTT-XXXX“ (Herkunft, Anlagedatum, vier Zeichen nach Crockford-Base32), z. B. „DE-TH-20261014-K7QM“; leer, solange keine vergeben ist. Vergibt die App; bleibt bei der Fortschreibung gleich. Seit LEAD-Meldevorlage 1.2. |
| `bezug` | Bezug (Kennungen) | Liste aus Text | nein | Sachverhaltskennung Präfix-JJJJMMTT-XXXX; ohne Wiederholung | Kennungen der Sachverhalte aus Eingangs- oder Vormeldungen, aus denen dieser Sachverhalt hervorgeht (Verdichtung, Teilung). Optional, seit LEAD-Meldevorlage 1.2. |
| `betrieb` ᴱ | Betreiberangaben (nur Betreibermeldung) | Objekt | nein | keine weiteren Felder | Angaben des Betreibers zum eigenen Betrieb je Sachverhalt (Funktionsprofil nach SOP B12). Nur in Betreibermeldungen. |

## Betreiberangaben (nur Betreibermeldung): `sachverhalte[].betrieb`

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `betreiber` ᴱ | Betreiber | Objekt | ja | keine weiteren Felder |  |
| `betreiber.name` ᴱ | Name | Text | ja | Text, nicht leer |  |
| `betreiber.traegerschaft` ᴱ | Trägerschaft | Text | nein | leer, `"öffentlich"`, `"privat"`, `"gemischt"` |  |
| `sektor` ᴱ | Sektor (§ 4 Abs. 1 KRITISDachG) | Text | ja | `"Energie"`, `"Transport und Verkehr"`, `"Finanzwesen"`, `"Leistungen der Sozialversicherung sowie Grundsicherung für Arbeitsuchende"`, `"Gesundheitswesen"`, `"Wasser"`, `"Ernährung"`, `"Informationstechnik und Telekommunikation"`, `"Weltraum"`, `"Siedlungsabfallentsorgung"` | Sektoren nach § 4 Abs. 1 KRITISDachG. Die Zuordnung ist funktional und sagt nichts über eine Einstufung als kritische Anlage. |
| `kritische_dienstleistung` ᴱ | Kritische Dienstleistung | Text | ja | Text, nicht leer |  |
| `anlage` ᴱ | Anlage | Objekt | nein | keine weiteren Felder |  |
| `anlage.bezeichnung` ᴱ | Bezeichnung | Text | nein |  |  |
| `anlage.kennung_betreiber` ᴱ | Kennung des Betreibers | Text | nein |  |  |
| `raum` ᴱ | Betroffener Raum | Objekt | ja | keine weiteren Felder |  |
| `raum.ars` ᴱ | Regionalschlüssel (ARS) | Liste aus Text | ja | Muster `^\d{2}(\d{1}\|\d{3}\|\d{5}\|\d{7}\|\d{10})?$`; mindestens ein Eintrag; ohne Wiederholung | Amtlicher Regionalschlüssel, gekürzt auf Land (2), Regierungsbezirk (3), Kreis (5), Gemeindeverband (9) oder Gemeinde (12 Stellen). |
| `raum.beschreibung` ᴱ | Beschreibung des Versorgungsgebiets | Text | ja | Text, nicht leer |  |
| `raum.anteil_gebiet_prozent` ᴱ | Anteil am Gebiet (%) | Zahl oder null | nein | 0 bis 100 |  |
| `ist` ᴱ | Istzustand | Objekt | ja | keine weiteren Felder |  |
| `ist.stand` ᴱ | Datenstand | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm | Wanduhrzeit JJJJ-MM-TTThh:mm in der Zeitzone der Meldung. |
| `ist.leistungsgrad` ᴱ | Leistungsgrad | Text | ja | `"voll"`, `"eingeschraenkt"`, `"notbetrieb"`, `"ausgefallen"`, `"unbekannt"` |  |
| `ist.leistungsgrad_prozent` ᴱ | Leistungsgrad (%) | Zahl oder null | nein | 0 bis 100 |  |
| `ist.leistungsbasis` ᴱ | Bezug des Prozentwerts | Text | nein |  | Worauf sich der Prozentwert bezieht, z. B. Fördermenge gegenüber der Referenzmenge unter gleichen Bedingungen. |
| `ist.beginn` ᴱ | Ausfallbeginn | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm oder leer |  |
| `ist.betroffene` ᴱ | Betroffene (getrennt nach Einheit) | Objekt | ja | keine weiteren Felder |  |
| `ist.betroffene.anschluesse` ᴱ | Anschlüsse | Objekt | ja | Baustein Messwert |  |
| `ist.betroffene.personen` ᴱ | Personen | Objekt | ja | Baustein Messwert |  |
| `ist.betroffene.einrichtungen` ᴱ | Einrichtungen mit besonderem Bedarf | Liste aus Text | nein | Text, nicht leer |  |
| `ist.eskalationsstufe_betrieblich` ᴱ | Aktuelle betriebliche Einstufung | Text | nein | leer, `"keine"`, `"Störung"`, `"Notfall"`, `"Krise"`, `"ungeklärt"` | Betriebliche Einstufung nach eigenem BCM; wird nie in eine LEAD-Beurteilung übersetzt. |
| `ersatzverfahren` ᴱ | Ersatzverfahren | Liste aus Objekt | ja |  |  |
| `ersatzverfahren[].art` ᴱ | Art | Text | ja | Text, nicht leer |  |
| `ersatzverfahren[].status` ᴱ | Status | Text | ja | `"vorhanden"`, `"betriebsbereit"`, `"eingesetzt"`, `"wirksam"`, `"nicht_vorhanden"`, `"unbekannt"` |  |
| `ersatzverfahren[].traegt_leistungsgrad_prozent` ᴱ | Getragener Leistungsgrad (%) | Zahl oder null | nein | 0 bis 100 |  |
| `ersatzverfahren[].reichweite_bis` ᴱ | Reichweite bis | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm oder leer |  |
| `ersatzverfahren[].bedingung` ᴱ | Bedingung der Reichweite | Text | ja |  |  |
| `ersatzverfahren[].stand` ᴱ | Datenstand | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm | Wanduhrzeit JJJJ-MM-TTThh:mm in der Zeitzone der Meldung. |
| `prognose` ᴱ | Prognose Wiederanlauf | Objekt | ja | keine weiteren Felder |  |
| `prognose.stand` ᴱ | Datenstand | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm | Wanduhrzeit JJJJ-MM-TTThh:mm in der Zeitzone der Meldung. |
| `prognose.status` ᴱ | Status | Text | ja | `"prognose"`, `"keine_prognose_moeglich"`, `"zielzustand_erreicht"` |  |
| `prognose.geber` ᴱ | Prognosegeber | Text | nein |  |  |
| `prognose.zielzustand` ᴱ | Zielzustand | Text | nein |  |  |
| `prognose.fruehestens` ᴱ | frühestens | Text | nein | Wanduhrzeit JJJJ-MM-TTThh:mm oder leer |  |
| `prognose.spaetestens` ᴱ | spätestens | Text | nein | Wanduhrzeit JJJJ-MM-TTThh:mm oder leer |  |
| `prognose.unsicherheit` ᴱ | Unsicherheit | Text | nein | leer, `"niedrig"`, `"mittel"`, `"hoch"` |  |
| `prognose.begruendung` ᴱ | Begründung | Text | nein |  |  |
| `bcm` ᴱ | BCM (optional) | Objekt | nein | keine weiteren Felder | Angaben aus dem betrieblichen Kontinuitätsmanagement (BCM), Begriffe nach BSI-Standard 200-4 (2023). Selbstauskunft des Betreibers; kein Prüfkriterium und kein Wahrheitsindikator. |
| `bcm.umsetzungsstand` ᴱ | BCMS-Umsetzungsstand | Text | nein | leer, `"kein formalisiertes BCMS"`, `"Reaktiv-BCMS"`, `"Aufbau-BCMS"`, `"Standard-BCMS"`, `"anderes BCMS"` | BCMS-Stufe nach BSI-Standard 200-4, S. 42–44: Reaktiv-BCMS (ausgewählte zeitkritische Prozesse mit vorhandenen Mitteln), Aufbau-BCMS (vollständige Methodik, schrittweise erweiterter Umfang), Standard-BCMS (alle Prozesse im Geltungsbereich). |
| `bcm.notfallplaene` ᴱ | Notfallpläne | Text | nein | leer, `"vorhanden"`, `"nicht vorhanden"` | Getrennt vom Umsetzungsstand erfasst. |
| `bcm.standardbezug` ᴱ | Standardbezug | Text | nein | leer, `"BSI-Standard 200-4"`, `"ISO 22301"`, `"BSI-Standard 200-4 und ISO 22301"`, `"anderer"` | Woran sich das BCM orientiert; belegt weder vollständige Umsetzung noch Zertifizierung. |
| `bcm.zertifizierung` ᴱ | Zertifizierung | Text | nein | leer, `"zertifiziert"`, `"nicht zertifiziert"` |  |
| `bcm.planung` ᴱ | Planwerte aus der Vorsorge | Objekt | nein | keine weiteren Felder | Planwerte aus der Vorsorge für einen benannten Geschäftsprozess oder eine Ressource. Keine Zusage und keine Prognose. Die Zeitanker folgen aus der Begriffsbestimmung: MTPD ab Ausfallbeginn des Geschäftsprozesses, RTO ab Ausrufen des Notfalls bis zum Erreichen des Notbetriebsniveaus (BSI-Standard 200-4, S. 159). |
| `bcm.planung.bezug` ᴱ | Geschäftsprozess oder Ressource | Text | nein |  | Geschäftsprozess oder Ressource, für den bzw. die die Planwerte gelten; organisationsweite Sammelwerte sind mehrdeutig. |
| `bcm.planung.grundlage` ᴱ | Begriffsgrundlage | Text | nein | leer, `"BSI-Standard 200-4"`, `"BSI-Standard 100-4"`, `"ISO 22301"`, `"eigene Festlegung"` | Begriffsgrundlage der Planwerte. Eine Wiederanlaufzeit (WAZ) nach BSI-Standard 100-4 schließt Erkennung und Reaktion ein und ist nicht unverändert eine RTO nach 200-4. |
| `bcm.planung.mtpd_stunden` ᴱ | Maximal tolerierbare Ausfallzeit (MTPD/MTA), Stunden | Zahl oder null | nein | 0 bis … | Maximal tolerierbare Ausfallzeit (MTPD, deutsch MTA) in Stunden: ab Ausfallbeginn des Geschäftsprozesses bis zur Grenze nicht tolerierbarer Auswirkungen (BSI-Standard 200-4, S. 159). |
| `bcm.planung.rto_stunden` ᴱ | Geforderte Wiederanlaufzeit (RTO/WAZ), Stunden | Zahl oder null | nein | 0 bis … | Geforderte Wiederanlaufzeit (RTO, deutsch WAZ) in Stunden: ab Ausrufen des Notfalls bis zum Erreichen des Notbetriebsniveaus; muss kleiner sein als die MTPD (BSI-Standard 200-4, S. 159). |
| `bcm.planung.notbetriebsniveau` ᴱ | Erforderliches Notbetriebsniveau (MBCO) | Objekt | nein | keine weiteren Felder | Erforderliches Notbetriebsniveau (MBCO): festgelegte Leistungsfähigkeit des Geschäftsprozesses im Notbetrieb (BSI-Standard 200-4, S. 160, 183). |
| `bcm.planung.notbetriebsniveau.beschreibung` ᴱ | Beschreibung | Text | nein |  |  |
| `bcm.planung.notbetriebsniveau.prozent` ᴱ | Prozent (optional) | Zahl oder null | nein | 0 bis 100 |  |
| `bcm.planung.notbetriebsniveau.bezugsgroesse` ᴱ | Bezugsgröße | Text | nein |  | Bezugsgröße des Prozentwerts, etwa Fördermenge je Stunde gegenüber dem Normalbetrieb. |
| `bcm.planung.quelle` ᴱ | Dokument (nur Bezeichnung) | Text | nein |  | Dokument, aus dem die Planwerte stammen (nur Bezeichnung). |
| `bcm.planung.stand` ᴱ | Stand des Dokuments | Text | nein | Datum JJJJ-MM-TT oder leer |  |
| `abhaengigkeiten` ᴱ | Abhängigkeiten | Liste aus Objekt | nein |  |  |
| `abhaengigkeiten[].dienstleistung` ᴱ | Dienstleistung | Text | ja | Text, nicht leer |  |
| `abhaengigkeiten[].richtung` ᴱ | Richtung | Text | ja | `"eingehend"`, `"ausgehend"` |  |
| `abhaengigkeiten[].zustand` ᴱ | Zustand | Text | ja | `"verfuegbar"`, `"beeintraechtigt"`, `"ausgefallen"`, `"unbekannt"` |  |
| `abhaengigkeiten[].puffer` ᴱ | Puffer | Text | nein |  |  |
| `abhaengigkeiten[].betroffene_stelle` ᴱ | Betroffene Stelle | Text | nein |  |  |
| `unterstuetzungsbedarf` ᴱ | Unterstützungsbedarf | Liste aus Objekt | ja |  |  |
| `unterstuetzungsbedarf[].leistung` ᴱ | Leistung | Text | ja | Text, nicht leer |  |
| `unterstuetzungsbedarf[].menge` ᴱ | Menge | Text | nein |  |  |
| `unterstuetzungsbedarf[].bis` ᴱ | benötigt bis | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm oder leer |  |
| `unterstuetzungsbedarf[].adressat` ᴱ | Adressat | Text | ja |  |  |
| `unterstuetzungsbedarf[].status` ᴱ | Status | Text | ja | `"geplant"`, `"angefordert"`, `"zugesagt"`, `"gedeckt"`, `"entfallen"` |  |
| `ursache` ᴱ | Ursache (vorläufig) | Objekt | nein | keine weiteren Felder |  |
| `ursache.kurz` ᴱ | Kurzbeschreibung | Text | ja |  |  |
| `ursache.status` ᴱ | Status | Text | ja | `"vorläufig"`, `"bestätigt"`, `"unbekannt"` |  |
| `bestaetigungsgrad` ᴱ | Bestätigungsgrad | Text | ja | `"bestätigt"`, `"vorläufige Eigenangabe"`, `"indirekt berichtet"`, `"widersprüchlich"` |  |
| `sektor_angaben` ᴱ | Sektorangaben (optional) | Objekt | nein | keine weiteren Felder | Optionale sektorspezifische Angaben für die Sektoren des Testszenarios; nie Pflicht. |
| `sektor_angaben.energie` ᴱ | Energie | Objekt | nein | keine weiteren Felder |  |
| `sektor_angaben.energie.netzebene` ᴱ | Netzebene | Text | nein | leer, `"Höchstspannung"`, `"Hochspannung"`, `"Mittelspannung"`, `"Niederspannung"` |  |
| `sektor_angaben.energie.wiederversorgte_anschluesse` ᴱ | Wiederversorgte Anschlüsse | Objekt | nein | Baustein Messwert |  |
| `sektor_angaben.wasser` ᴱ | Wasser | Objekt | nein | keine weiteren Felder |  |
| `sektor_angaben.wasser.druckzonen_betroffen` ᴱ | Betroffene Druckzonen | ganze Zahl oder null | nein | 0 bis … |  |
| `sektor_angaben.wasser.abkochgebot` ᴱ | Abkochgebot | Text | nein | leer, `"nein"`, `"wahrscheinlich"`, `"angeordnet"`, `"aufgehoben"` |  |
| `sektor_angaben.telekommunikation` ᴱ | Telekommunikation | Objekt | nein | keine weiteren Felder |  |
| `sektor_angaben.telekommunikation.standorte_ausgefallen` ᴱ | Ausgefallene Standorte | Objekt | nein | Baustein Messwert |  |
| `sektor_angaben.telekommunikation.standorte_netzersatz` ᴱ | Standorte mit Netzersatz | Objekt | nein | Baustein Messwert |  |
| `sektor_angaben.telekommunikation.notruf` ᴱ | Notruf | Text | nein | leer, `"erreichbar"`, `"eingeschraenkt"`, `"nicht erreichbar"`, `"unbekannt"` |  |
| `sektor_angaben.gesundheit` ᴱ | Gesundheit | Objekt | nein | keine weiteren Felder |  |
| `sektor_angaben.gesundheit.betreibbare_betten` ᴱ | Betreibbare Betten | Objekt | nein | Baustein Messwert |  |
| `sektor_angaben.gesundheit.verlegungsbedarf` ᴱ | Verlegungsbedarf | Objekt | nein | Baustein Messwert |  |

## Bausteine

Teilschemata, die an mehreren Stellen vorkommen. Die Pfade unten gelten relativ zur jeweiligen Stelle.

### Messwert (`$defs/kritis_messwert`)

Vorkommen: `sachverhalte[].betrieb.ist.betroffene.anschluesse`, `sachverhalte[].betrieb.ist.betroffene.personen`, `sachverhalte[].betrieb.sektor_angaben.energie.wiederversorgte_anschluesse`, `sachverhalte[].betrieb.sektor_angaben.telekommunikation.standorte_ausgefallen`, `sachverhalte[].betrieb.sektor_angaben.telekommunikation.standorte_netzersatz`, `sachverhalte[].betrieb.sektor_angaben.gesundheit.betreibbare_betten`, `sachverhalte[].betrieb.sektor_angaben.gesundheit.verlegungsbedarf`.

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `wert` ᴱ | Wert | Zahl oder null | ja |  |  |
| `einheit` ᴱ | Einheit | Text | nein | Text, nicht leer |  |
| `status` ᴱ | Status des Werts | Text | ja | `"belegt"`, `"geschaetzt"`, `"unbekannt"`, `"nicht_zutreffend"` | belegt = gezählt oder gemessen; geschaetzt = hochgerechnet; unbekannt = geprüft, nicht feststellbar; nicht_zutreffend = für diese Dienstleistung nicht einschlägig. |
| `stand` ᴱ | Datenstand | Text | ja | Wanduhrzeit JJJJ-MM-TTThh:mm | Wanduhrzeit JJJJ-MM-TTThh:mm in der Zeitzone der Meldung. |
| `quelle` ᴱ | Quelle | Text | nein |  |  |
| `hinweis` ᴱ | Hinweis | Text | nein |  |  |

### Zeichnung (`$defs/zeichnung`)

Vorkommen: `freigabe.erfassung`, `freigabe.freigabe`, `freigabe.versand`.

| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |
|---|---|---|---|---|---|
| `name` | Name | Text | ja |  |  |
| `datum` | Datum | Text | ja | Datum JJJJ-MM-TT oder leer |  |
| `hz` | Handzeichen | Text | ja |  |  |

## Bedingte Regeln

Regeln, die von Werten anderer Felder abhängen. Die Kennungen R1 bis R4 sind die Rollenregeln der Erweiterung; Prüfwerkzeug und Konformitätsfälle verwenden sie.

- **K-final** (Meldung) Wenn `_status` = „final“: `land`: nicht leer; `meldende_stelle`: nicht leer; `meldezeitpunkt`: nicht leer; `sachverhalte`: mindestens ein Eintrag; `sachverhalte[].bezeichnung`: nicht leer.
- **R1-betreiber** (Meldung) Betreibermeldung: Zeitzone ist Pflicht; jeder Sachverhalt trägt eine Kennung und den Block betrieb; Beurteilung und Tendenz bleiben leer, alle Radarachsen null. Wenn `kritis.rolle` = „Betreiber“: `zeitzone`: Pflicht; `sachverhalte`: mindestens ein Eintrag; `sachverhalte[].kennung`: Pflicht, nicht leer; `sachverhalte[].betrieb`: Pflicht; `sachverhalte[].sofort` `beurteilung`, `tendenz`: leer; `sachverhalte[].sofort.lagenradar` `d1`, `d2`, `d3`, `d4`, `d5`, `d6`, `d7`, `d8`: null.
- **R2-behoerde** (Meldung) Behördenmeldung (Meldekopf mit Rolle Behörde oder ohne Meldekopf): kein Block betrieb; Betreiberangaben werden über bezug auf die Kennung der Betreibermeldung verknüpft. Außer wenn `kritis.rolle` = „Betreiber“: `sachverhalte[].betrieb`: nicht zulässig.
- **R3-bezug** (Meldung) Folge-, Korrektur- und Abschlussmeldungen nennen die meldung_id der Meldung, auf die sie sich beziehen; eine Erstmeldung hat keinen Bezug. Wenn `kritis.meldeart` ist „Folgemeldung“ oder „Korrekturmeldung“ oder „Abschlussmeldung“: `kritis.bezug_meldung_id`: Pflicht, nicht leer. Sonst: `kritis.bezug_meldung_id`: leer.
- **R4-zeitzone** (Meldung) Jede Meldung mit Meldekopf kritis nennt die Zeitzone ihrer Wanduhrzeiten. Wenn `kritis` vorhanden: `zeitzone`: Pflicht.
- (`sachverhalte[].betrieb.ist`) Wenn `sachverhalte[].betrieb.ist.leistungsgrad_prozent` ist eine Zahl: `sachverhalte[].betrieb.ist.leistungsbasis`: Pflicht, nicht leer.
- (jeder Messwert) Wenn `status` ist „belegt“ oder „geschaetzt“: `wert`: eine Zahl. Sonst: `wert`: null.
- (jeder Messwert) Wenn `status` ist „belegt“ oder „geschaetzt“ oder „unbekannt“: `einheit`: Pflicht.
- (`sachverhalte[].betrieb.prognose`) Wenn `sachverhalte[].betrieb.prognose.status` = „prognose“: `sachverhalte[].betrieb.prognose` `geber`, `zielzustand`: Pflicht, nicht leer.
- (`sachverhalte[].betrieb.prognose`) Wenn `sachverhalte[].betrieb.prognose.status` = „keine_prognose_moeglich“: `sachverhalte[].betrieb.prognose` `fruehestens`, `spaetestens`: leer.
- (`sachverhalte[].betrieb.bcm.planung`) Wenn (`sachverhalte[].betrieb.bcm.planung.mtpd_stunden` ist eine Zahl oder `sachverhalte[].betrieb.bcm.planung.rto_stunden` ist eine Zahl oder `sachverhalte[].betrieb.bcm.planung.notbetriebsniveau.beschreibung` nicht leer): `sachverhalte[].betrieb.bcm.planung` `bezug`, `grundlage`: Pflicht, nicht leer.
- (`sachverhalte[].betrieb.bcm.planung.notbetriebsniveau`) Wenn `sachverhalte[].betrieb.bcm.planung.notbetriebsniveau.prozent` ist eine Zahl: `sachverhalte[].betrieb.bcm.planung.notbetriebsniveau.bezugsgroesse`: Pflicht, nicht leer.

## Präfixe der Sachverhaltskennung

Aus der Darstellungsdatei (`kennung.praefixe`); ohne Land: `DE`.

| Land | Präfix |
|---|---|
| Bund | `DE` |
| Baden-Württemberg | `DE-BW` |
| Bayern | `DE-BY` |
| Berlin | `DE-BE` |
| Brandenburg | `DE-BB` |
| Bremen | `DE-HB` |
| Hamburg | `DE-HH` |
| Hessen | `DE-HE` |
| Mecklenburg-Vorpommern | `DE-MV` |
| Niedersachsen | `DE-NI` |
| Nordrhein-Westfalen | `DE-NW` |
| Rheinland-Pfalz | `DE-RP` |
| Saarland | `DE-SL` |
| Sachsen | `DE-SN` |
| Sachsen-Anhalt | `DE-ST` |
| Schleswig-Holstein | `DE-SH` |
| Thüringen | `DE-TH` |

## Maschinenlesbare Fassungen

- [profil/lead-kritis/meldung.schema.json](../profil/lead-kritis/meldung.schema.json): JSON-Schema, maßgeblich für die Prüfung
- [felder.json](felder.json): Feldverzeichnis (Format `kritis-lead-feldverzeichnis/1`), jedes Feld mit vollem Pfad, Bausteine aufgeklappt, Regeln in Worten
- [felder.csv](felder.csv): dasselbe als Tabelle (UTF-8, Semikolon) als Ausgangspunkt einer Zuordnungstabelle
- [beispiel-minimal.json](beispiel-minimal.json): kleinste gültige Betreibermeldung (11 Felder auf oberster Ebene), abgeleitet aus [01_netz_2026-10-13T22-45_erstmeldung.json](../szenario/orkantief-ilka-sonneberg/01_netz_2026-10-13T22-45_erstmeldung.json)
