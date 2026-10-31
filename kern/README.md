# Kern

Dieser Ordner enthält gepinnte, unveränderte Kopien aus [KI-LEAD](https://github.com/pereirawolf/ki-lead), alle vom selben Commit:

- `LEAD-Meldung-v1.schema.json`: das Meldungsschema LEAD-Meldung-v1 (`profile/lead-beispiel/meldung.schema.json`); aus ihm und der Erweiterung `lead-kritis` entsteht das Profilschema von KRITIS-LEAD.
- `lead-beispiel/`: Darstellungsdatei, Kodierleitfaden, Arbeitsanweisungen und SOP-Auszüge (Teil A, B01, B08, B10, B12, C11, C12) des Beispielprofils sowie der fiktive Datensatz Orkantief „Ilka“; aus ihnen baut `npm run bauen` das Profilpaket `profil/lead-kritis/`.
- `quelle.json`: Repository, Commit, Quellpfad und SHA-256 jeder Kopie.

`npm test` prüft jede Kopie gegen ihre Prüfsumme. Die Dateien werden nie von Hand bearbeitet. Ein neuer Stand wird bewusst übernommen: Dateien aus dem gewünschten KI-LEAD-Commit kopieren, `quelle.json` anpassen, `npm run bauen` ausführen, Änderung in CHANGELOG.md eintragen.

Lizenz: wie in KI-LEAD; Meldungsschema CC BY 4.0 und zusätzlich CC0 1.0, alle übrigen Dateien CC BY 4.0, Namensnennung Heiko Pereira Wolf, KI-LEAD (LICENSE-CONTENT, Nr. 3).
