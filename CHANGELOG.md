# Änderungsverlauf

Alle Änderungen an KRITIS-LEAD stehen hier, die jüngste oben. Fassungen folgen Semantic Versioning; bis zum Erprobungsstand v0.1.0 bleibt die Hauptversion 0.

## 0.0.3 – Lagebild (Meilenstein M2)

- Profilpaket `profil/lead-kritis` (Profil 0.1.0) für KI-LEAD: Manifest mit Migrationsregel für LEAD-Meldung-v1, Darstellung mit Schritt „Meldekopf KRITIS“ und Feldern der Betreiberangaben, Kodierleitfaden 1.7.0 mit Anhang K (Betreibermeldungen), Arbeitsanweisungen Erfassung und Verdichtung mit Ergänzung KRITIS-LEAD, SOP-Auszug (A, B01, B08, B10, B12, C11, C12), Kontaktliste der Szenario-Stellen, zwei Beispiele (Stand 14.10., 10:30 und Verlauf) mit dem unveränderten Ilka-Datensatz.
- Weitere Dateien aus KI-LEAD @ ca02e0d2 gepinnt (`kern/lead-beispiel/`, Prüfsummen in `kern/quelle.json`); `npm run bauen` erzeugt daraus die abgeleiteten Profildateien.
- `npm run profil:zip` packt `dist/lead-kritis.leadprofil`; GitHub Actions legt die Datei als Artefakt ab.
- Ladeprobe mit dem Code von KI-LEAD (Profilloader, Lagebild, Redaktionscheck, ZIP-Import): Profil lädt ohne Befund, alle 14 bzw. 21 Meldungen stehen ohne Schemabefund im Lagebild, keine Doppelvergabe und kein Bezug ins Leere.
- [docs/LAGEBILD.md](docs/LAGEBILD.md): Ablauf in KI-LEAD, Kette Betreiber → Landkreis → Land → Bund, Betreibermeldungen als Eingang einer Verdichtung.

## 0.0.2 – Meldeprofil v0.1 (Meilenstein M1)

- Erweiterung `lead-kritis/0.1` (`erweiterung/lead-kritis.defs.json`): optional `zeitzone` und Meldekopf `kritis` (Rolle, Meldeart, Anlass, `meldung_id`, `bezug_meldung_id`, `datenart` = synthetisch, TLP nur CLEAR, Empfänger, parallele Pflichtmeldungen), je Sachverhalt der Block `betrieb` (Funktionsprofil nach SOP B12, Istzustand mit Messwerten, Ersatzverfahren, Prognose, BCM-Planwerte mit Zeitanker, Abhängigkeiten, Unterstützungsbedarf, Sektorangaben).
- Rollenregeln R1 bis R4 (`erweiterung/rollenregeln.json`): Betreiber ohne Beurteilung, Tendenz und Radarwerte; Behörden ohne `betrieb`; Bezug je Meldeart; Zeitzone.
- Profilschema `LEAD-KRITIS-Meldung-v0.1` gebaut aus dem gepinnten Kernschema (`profil/lead-kritis/meldung.schema.json`, `npm run bauen`); Behördenmeldungen nach LEAD-Meldung-v1 bleiben nach Umstellung der Schemakennung gültig.
- Prüfwerkzeug `npm run pruefen`: Schema und Rollenregeln mit Ajv, Nachrichtenidentität über einen Satz (Regeln I1 bis I5).
- Szenario Orkantief „Ilka“ im Landkreis Sonneberg (`szenario/orkantief-ilka-sonneberg`): 14 fiktive Meldungen von Netzbetreiber, Trinkwasser-Zweckverband, Mobilfunkbetreiber, Pflegeträger, Leitstelle und Krisenstab, deckungsgleich mit dem Sachverhalt `DE-TH-20261014-P5VN` der Thüringer Ilka-Meldung in KI-LEAD; Erst-, Folge-, Korrektur- und Abschlussmeldungen.
- Konformitätsfälle: die 14 Szenariomeldungen als gültige Fälle, 24 daraus abgeleitete ungültige Meldungen und 4 Sätze zur Nachrichtenidentität mit Erwartung in `konformitaet/faelle.json`.
- Zweiter Prüfweg: Der Schemaprüfer von KI-LEAD am gepinnten Commit urteilt in der CI über alle Fälle; die Behördenmeldungen des fiktiven Datensatzes Orkantief „Ilka“ aus KI-LEAD sind gültig.
- Feldkatalog [docs/MELDEPROFIL.md](docs/MELDEPROFIL.md); Entwicklungswerkzeuge Ajv und tsx (MIT).

## 0.0.1 – Grundgerüst (Meilenstein M0)

- README mit Idee, Abgrenzung, Bestandteilen, Fahrplan, Lizenz und Zitiervorschlag.
- Lizenzen wie in KI-LEAD: Code EUPL-1.2 (`LICENSE`), Inhalte CC BY 4.0 und maschinenlesbare Dateien zusätzlich CC0 1.0 (`LICENSE-CONTENT`, `LICENSE-CC0`); `CITATION.cff`.
- Kernschema LEAD-Meldung-v1 gepinnt: unveränderte Kopie aus KI-LEAD, Commit `ca02e0d26227b8081653d876bf5530c784138d2a` (App 0.6.12, Beispielprofil 1.34.0), mit Herkunft und SHA-256 in `kern/quelle.json`.
- Prüfungen mit `node --test` ohne Abhängigkeiten: Prüfsumme und Schemakennung des Kernschemas, Lizenz- und Abgrenzungshinweise; GitHub Actions führt sie bei Pull Requests und Änderungen an `main` aus.
