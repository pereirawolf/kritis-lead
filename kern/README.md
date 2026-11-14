# Kern

Dieser Ordner enthält gepinnte, unveränderte Kopien aus [KI-LEAD](https://github.com/pereirawolf/ki-lead), alle vom selben Commit; seit 0.3.7 auch die Design Tokens in `design/`:

- `LEAD-Meldung-v1.schema.json`: das Meldungsschema LEAD-Meldung-v1 (`profile/lead-beispiel/meldung.schema.json`); aus ihm und der Erweiterung `lead-kritis` entsteht das Profilschema von KRITIS-LEAD.
- `lead-meldung-v2/`: Kernschema von LEAD-Meldung-v2 (`formate/lead-meldung-v2/kern.schema.json`) und Modul `lead-bevoelkerungsschutz` (`formate/lead-meldung-v2/module/`); aus ihnen und den Modulen von KRITIS-LEAD entsteht das Schema in `formate/lead-kritis-v2/`.
- `lead-beispiel/`: Darstellungsdatei, Kodierleitfaden, Arbeitsanweisungen und SOP-Auszüge (Teil A, B01, B08, B10, B12, C11, C12) des Beispielprofils sowie der fiktive Datensatz Orkantief „Ilka“; aus ihnen baut `npm run bauen` das Profilpaket `profil/lead-kritis/`.
- `quelle.json`: Repository, Commit, Quellpfad und SHA-256 jeder Kopie.
- `design/`: Design Tokens des Grunddesigns der App-Familie (`lead-design.tokens.json`, `lead-farbschemata.tokens.json`) aus `design/` von KI-LEAD, Fassung 1.10 (Tokens seit 1.9 unverändert), mit eigener Herkunftsangabe `design/quelle.json` (seit 0.3.8 auf dem Commit, mit dem die Fassung kam, nicht zwingend dem der übrigen Kopien; die Fassung des Grunddesigns wechselt nur mit dem Abgleich in docs/design-abweichungen.md); aus ihnen setzt `werkzeuge/bauen/farben.mjs` die Farben von Formular und Seiten. Abgleich: [docs/design-abweichungen.md](../docs/design-abweichungen.md).

`npm test` prüft jede Kopie gegen ihre Prüfsumme. Die Dateien werden nie von Hand bearbeitet. Ob ein neuer Stand vorliegt, meldet wöchentlich der Workflow „Pin-Abstand zu KI-LEAD“ (`npm run pin-abstand`, auch in Gegenrichtung für die Einbettung der Module in KI-LEAD); er übernimmt nichts. Ein neuer Stand wird bewusst übernommen: Dateien aus dem gewünschten KI-LEAD-Commit kopieren, `quelle.json` anpassen, `npm run bauen` ausführen, Änderung in CHANGELOG.md eintragen.

Lizenz: wie in KI-LEAD; Meldungsschema CC BY 4.0 und zusätzlich CC0 1.0, alle übrigen Dateien CC BY 4.0, Namensnennung Heiko Pereira Wolf, KI-LEAD (LICENSE-CONTENT, Nr. 3).
