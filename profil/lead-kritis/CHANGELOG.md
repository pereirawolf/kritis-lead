# Änderungsverlauf Profil `lead-kritis`

## 0.3.8 – 14.11.2026

- Grundlage KI-LEAD @ d94ec0e (App 0.8.2, Beispielprofil 1.44.0, mit den Änderungen von 1.43.0) statt 80ec9bb; der Zwischenstand 167bc55 (KRITIS-LEAD 0.3.7) ließ das Profil unverändert, deshalb gibt es keine Profilversion 0.3.7. Kodierleitfaden 1.14.0: in Abschnitt 6 neu der Unterabschnitt „Kennzahlen aus Kennzahlen-Bausteinen“ mit sieben Regeln (unverändert übernehmen; keine Summen über Einheit, Art, Datenstand oder sich überschneidende Räume; Mindestwert und Teilmenge; übergeordnete Erhebung mit Meldequote je Raum; Ausschnitt kennzeichnen; Zählort; Beleg, keine Kodierung), Einleitung und Pflege (Abschnitt 9) entsprechend. Arbeitsanweisung Erfassung 1.12.0 (in 4.3 Absatz zu Kennzahlen-Bausteinen und der Rechenhilfe der App, Beispielwert `_entstehung.kodierleitfaden`) und Arbeitsanweisung Verdichtung 2.4.0 („Material und Rollen“: Kennzahlen-Bausteine sind Material, keine Eingangsmeldungen), jeweils mit unveränderter Ergänzung von KRITIS-LEAD. SOP-LEAD Teil A mit Sammelmappe 3.23.7 (Verweis in A.3 „Teilmenge, Summe, Hochrechnung“ auf Abschnitt 6 des Kodierleitfadens, Gültigkeitsstand). Achsenregeln, Stufentexte, Quellenkategorien, Anhang K, Schema `LEAD-KRITIS-Meldung-v0.2`, Darstellung, Arbeitsanweisung Kurzfassung, übrige SOP-Auszüge und Beispiele unverändert. Betreibermeldungen tragen keine Kennzahlen-Bausteine; der neue Abschnitt betrifft das Profil erst, wenn das Lagezentrum Material aus Thessa oder KSNV übernimmt. Das Modul `lead-baustein` für LEAD-Meldung-v2 kommt mit M4.

## 0.3.6 – 11.11.2026

- Grundlage KI-LEAD @ 80ec9bb (App 0.7.17, Beispielprofil 1.42.2) statt 7b026ed: Schrittnamen der Darstellung „Ereignisse und Sachverhalte“, „Quellen und Referenzen“, „Prüfen und Exportieren“ (Grunddesign 1.7, LD-T05; Feldnamen unverändert), Kodierleitfaden 1.12.1 (Grundlage der Tendenz in Abschnitt 4, Kurzbeispiel zur Nullregel (b) von D2 in Abschnitt 7), Arbeitsanweisung Erfassung 1.11.4, SOP-LEAD Teil A mit Sammelmappe 3.23.5. Schema `LEAD-KRITIS-Meldung-v0.2`, Ergänzungen von KRITIS-LEAD und Beispiele unverändert.

## 0.3.5 – 05.11.2026

- Grundlage KI-LEAD @ 7b026ed (App 0.7.13, Beispielprofil 1.41.0) statt 9907f64: Kodierleitfaden 1.11.0 (Abschnitt 8.1: Kennungen der Betreiber mit Präfix `KRITIS-`, KL-2026-W45-05), Arbeitsanweisung Erfassung 1.11.2, SOP-LEAD Teil A mit Sammelmappe 3.23.2. Schema `LEAD-KRITIS-Meldung-v0.2`, Darstellung, Ergänzungen von KRITIS-LEAD und Beispiele unverändert.

## 0.3.4 – 05.11.2026

- Grundlage KI-LEAD @ 9907f64 (App 0.7.11, Beispielprofil 1.39.0) statt 57d14ce: Darstellungsdatei mit den Hilfetexten des Beispielprofils (Analysebereich, Bewertung und Tendenz), Kodierleitfaden 1.10.0, Arbeitsanweisungen Erfassung und Verdichtung, SOP-LEAD Teil A, B08, B10 und C11 in der jeweils aktuellen Fassung. Schema `LEAD-KRITIS-Meldung-v0.2`, Ergänzungen von KRITIS-LEAD und Beispiele unverändert.

## 0.3.3 – 04.11.2026

- Manifest: `farbschema` mit `basis` „bevoelkerungsschutz“ (Bevölkerungsschutz · BBK) aus dem gemeinsamen Katalog. KI-LEAD zeigt diese Farben, wenn unter „Einstellungen → Darstellung“ „Farben des aktiven Profils“ gewählt ist; das Betreiberformular und die Seiten von KRITIS-LEAD übernehmen sie beim Bau (Grunddesign der App-Familie, LD-F01). Schema, Darstellung und Beispiele unverändert.

## 0.3.2 – 01.11.2026

- Schema `LEAD-KRITIS-Meldung-v0.2`, Baustein Messwert (`kritis_messwert`): `einheit` ist nur noch Pflicht, wenn `status` „belegt“, „geschaetzt“ oder „unbekannt“ ist; bei „nicht_zutreffend“ darf sie fehlen. Die Regel wird nur gelockert: Jede bisher gültige Meldung bleibt gültig, die Schemakennung bleibt. Neuer Konformitätsfall `messwert-ohne-einheit`. Darstellung unverändert.

## 0.3.1 – 31.10.2026

- Beispiele: Die betriebliche Einschätzung in den Betreibermeldungen beginnt nicht mehr mit „Betriebliche Einschätzung des Betreibers, keine LEAD-Beurteilung:“; die Herkunft ist über `kritis.rolle` erkennbar. Schema und Darstellung unverändert.

## 0.3.0 – 31.10.2026

- Schema `LEAD-KRITIS-Meldung-v0.2` (Erweiterung `lead-kritis/0.2`): BCM-Angaben nach BSI-Standard 200-4. `bcm.umsetzungsstand` (kein formalisiertes BCMS, Reaktiv-, Aufbau-, Standard-BCMS, anderes BCMS) ersetzt `reifegrad`; Notfallpläne, Standardbezug und Zertifizierung getrennt. Planwerte je Geschäftsprozess oder Ressource (`planung.bezug`) mit Begriffsgrundlage: `mtpd_stunden` (ab Ausfallbeginn) statt `mta_stunden`, `rto_stunden` ab Ausrufen des Notfalls, `notbetriebsniveau` (MBCO) als Beschreibung mit optionalem Prozentwert und Bezugsgröße statt `notbetriebsniveau_prozent`; `zeitanker` und `zielzustand` entfallen, weil die Begriffsbestimmung sie festlegt. Betriebliche Einstufung um „keine“ und „ungeklärt“ ergänzt.
- Darstellung: Beschriftungen und Hinweise der BCM-Felder und der betrieblichen Einstufung nach BSI-Standard 200-4; Kodierleitfaden, Anhang K 0.2.0.
- Ältere Dateien nach `LEAD-KRITIS-Meldung-v0.1` werden nicht übernommen (noch keine Erprobung).

## 0.2.0 – 31.10.2026

- Herkunft im Lagebild: `rollen.herkunft_standard` = „Behörde“ und `rollen.herkunft_kategorie` (Betreiber → B, Behörde → A) neben `rollen.herkunft` = `kritis.rolle` (Profilformat 1.25, KI-LEAD 0.6.13). Behördenmeldungen ohne Meldekopf stehen damit unter „Behörde (A)“ statt „keine Angabe“ (Issue #5, P1).
- Beschriftungen der Darstellungsdatei: alle Felder unter `kritis` und `betrieb` mit `label`, die wiederkehrenden Messwerte über Muster mit „*“; Datenstände der Messwerte mit `widget` „datumzeit“, Stand der BCM-Planwerte mit „datum“; Einrichtungen mit besonderem Bedarf als Liste mit Elementname (Issue #5, P2).
- Grundlage KI-LEAD @ 57d14ce (App 0.6.14, Beispielprofil 1.34.0); die übernommenen Dateien sind gegenüber ca02e0d2 unverändert (Issue #5, P3).

## 0.1.0 – 31.10.2026

- Erste Fassung: Schema `LEAD-KRITIS-Meldung-v0.1` (Erweiterung `lead-kritis/0.1`), Migration für LEAD-Meldung-v1, Darstellung mit Schritt „Meldekopf KRITIS“, Kodierleitfaden 1.7.0 mit Anhang K 0.1.0, Arbeitsanweisungen mit Ergänzung KRITIS-LEAD, SOP-Auszug und Beispiel Orkantief „Ilka“ im Landkreis Sonneberg; Grundlage KI-LEAD @ ca02e0d2 (Beispielprofil 1.34.0).
