# Profilpaket `lead-kritis` (Beispiel)

Profilpaket von KRITIS-LEAD für [KI-LEAD](https://github.com/pereirawolf/ki-lead) im Format `lead-profil/1`: ein fiktives Lagezentrum eines Landes, das Lagemeldungen von Behörden und Meldungen von KRITIS-Betreibern in einem Lagebild zusammenführt. Forschungsdemonstrator; nur synthetische Daten.

## Bestandteile

| Datei | Herkunft |
|---|---|
| `profil.json`, `kontakte.json`, `README.md`, `CHANGELOG.md` | von Hand, KRITIS-LEAD |
| `meldung.schema.json` | gebaut: LEAD-Meldung-v1 aus KI-LEAD + Erweiterung `lead-kritis/0.1` + Rollenregeln |
| `meldung.ui.json` | gebaut: Darstellungsdatei des KI-LEAD-Beispielprofils + Schritt „Meldekopf KRITIS“ und Felder der Betreiberangaben |
| `kodierleitfaden.md` | gebaut: Kodierleitfaden 1.7.0 aus KI-LEAD + Anhang K (Betreibermeldungen) |
| `anweisung-erfassung.md`, `anweisung-verdichtung.md` | gebaut: Arbeitsanweisungen aus KI-LEAD + Ergänzung KRITIS-LEAD |
| `anweisung-kurzfassung.md`, `sop/` | unverändert aus KI-LEAD (SOP-Auszug: Teil A, B01, B08, B10, B12, C11, C12) |
| `beispiele/orkantief-ilka-sonneberg/` | Szenario von KRITIS-LEAD; im Unterordner `ilka/` der unveränderte Ilka-Datensatz aus KI-LEAD |

Gebaute Dateien nicht von Hand bearbeiten; `npm run bauen` erzeugt sie aus `kern/` und `erweiterung/` neu. Die Herkunft der Dateien aus KI-LEAD (Commit, Prüfsumme) steht in `kern/quelle.json`.

## Verwendung in KI-LEAD

1. `npm run profil:zip` erzeugt `dist/lead-kritis.leadprofil`; die Datei liegt auch jedem Release bei.
2. In KI-LEAD unter „Profile“ die Datei importieren und das Profil aktivieren.
3. Unter „Auswertung“ „Beispiel laden“ wählen: 21 Meldungen von Betreibern, Leitstelle, Krisenstab, Ländern und Koordinierungsstelle stehen in einem Lagebild. Behördenmeldungen nach LEAD-Meldung-v1 übernimmt das Profil über eine Migrationsregel ohne Inhaltsänderung.

Die Rolle `herkunft` in `meldung.ui.json` (`kritis.rolle`) wertet KI-LEAD erst aus, wenn [Issue #114](https://github.com/pereirawolf/ki-lead/issues/114) umgesetzt ist; bis dahin ist die Herkunft an der meldenden Stelle und der Quellenkategorie erkennbar.

Lizenz: CC BY 4.0, Namensnennung Heiko Pereira Wolf (KRITIS-LEAD, KI-LEAD); Schema, Manifest und Kontaktliste zusätzlich CC0 1.0 (LICENSE-CONTENT).
