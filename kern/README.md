# Kern

Dieser Ordner enthält die gepinnte, unveränderte Kopie des Meldungsschemas **LEAD-Meldung-v1** aus [KI-LEAD](https://github.com/pereirawolf/ki-lead). Aus ihr und der Erweiterung `lead-kritis` entsteht ab Meilenstein M1 das Profilschema von KRITIS-LEAD.

- `LEAD-Meldung-v1.schema.json`: Kopie von `profile/lead-beispiel/meldung.schema.json`
- `quelle.json`: Repository, Commit, Quellpfad und SHA-256 der Kopie

`npm test` prüft, dass die Kopie der Prüfsumme in `quelle.json` entspricht und die Schemakennung stimmt. Die Datei wird nie von Hand bearbeitet. Ein neuer Stand wird bewusst übernommen: Datei aus dem gewünschten KI-LEAD-Commit kopieren, `quelle.json` anpassen, Änderung in CHANGELOG.md eintragen.

Lizenz: wie in KI-LEAD CC BY 4.0 und zusätzlich CC0 1.0 (LICENSE-CONTENT, Nr. 3).
