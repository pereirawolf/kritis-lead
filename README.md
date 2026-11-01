# KRITIS-LEAD

Forschungsdemonstrator für die Einbindung von Meldungen der Betreiber Kritischer Infrastrukturen (KRITIS) in ein gemeinsames Lagebild nach der LEAD-Systematik (Lageerfassung, -auswertung und -darstellung). Betreibermeldungen und Lagemeldungen von Behörden stehen im selben Lagebild; die Herkunft jeder Meldung bleibt erkennbar, und Betreiber liefern Angaben zum eigenen Betrieb, keine behördliche Bewertung.

KRITIS-LEAD ist das Schwesterprojekt zu [KI-LEAD](https://github.com/pereirawolf/ki-lead). Es erweitert das dortige Meldungsschema LEAD-Meldung-v1 um Angaben von Betreibern und nutzt KI-LEAD als Anwendung für Lagebild und Verdichtung.

**Stand:** 0.3.2: Erprobungsstand (Meilenstein M4) mit barrierefreiem Formular, dessen Bedienung der Oberfläche von KI-LEAD folgt, das sich aus dem Meldeprofil aufbaut, BCM-Begriffen nach BSI-Standard 200-4 und einer Beschreibung des Zielformats für Schnittstellen aus BCM-Systemen. Betreiber erfassen ihre Meldungen im Offline-Formular ([docs/BETREIBER-ANLEITUNG.md](docs/BETREIBER-ANLEITUNG.md), Barrierefreiheit: [docs/BARRIEREFREIHEIT.md](docs/BARRIEREFREIHEIT.md)); mit dem Profilpaket `lead-kritis` stehen sie in KI-LEAD ohne Umformatierung neben den Behördenmeldungen, mit Herkunft und Filter ([docs/LAGEBILD.md](docs/LAGEBILD.md)). Der Trockenlauf mit dem ganzen Szenario Orkantief „Ilka“ im Landkreis Sonneberg erfüllt alle maschinell messbaren Kriterien ([erprobung/trockenlauf/ergebnis.md](erprobung/trockenlauf/ergebnis.md)); Drehbuch und Bögen für das Planspiel liegen in [erprobung/](erprobung/README.md), Rahmen und Kriterien in [docs/ERPROBUNG.md](docs/ERPROBUNG.md). Meldeprofil und Feldkatalog: [docs/MELDEPROFIL.md](docs/MELDEPROFIL.md). Wer Meldungen aus einem BCM-System heraus erzeugen will, findet das Zielformat menschen- und maschinenlesbar beschrieben: Anleitung in [docs/SCHNITTSTELLE.md](docs/SCHNITTSTELLE.md), aus dem Schema erzeugte Feldreferenz, Feldverzeichnis und Minimalbeispiel in [schnittstelle/](schnittstelle/FELDREFERENZ.md), beides auch auf der [Seite „Schnittstelle“](https://pereirawolf.github.io/kritis-lead/schnittstelle.html).

**Ausprobieren:** [Startseite mit Formular, Profilpaket, Szenario und Schnittstelle](https://pereirawolf.github.io/kritis-lead/) (GitHub Pages) oder die Anhänge des jeweiligen [Releases](https://github.com/pereirawolf/kritis-lead/releases).

## Abgrenzung

KRITIS-LEAD ist ein privates Forschungsvorhaben von Heiko Pereira Wolf ([ORCID 0009-0004-0014-7616](https://orcid.org/0009-0004-0014-7616)). Es ist kein Produkt und keine Spezifikation einer Behörde oder Einrichtung und unabhängig von dienstlichen Vorhaben gleichen oder ähnlichen Namens. Es veranschaulicht eine Methode; es ist kein Meldeweg, begründet keine Meldepflichten und ersetzt keine Meldung nach Bundes- oder Landesrecht.

Alle Meldungen, Stellen, Betreiber, Zahlen und Ereignisse im Repository sind **fiktiv**. Reale Kreisnamen und Gebietsschlüssel dienen nur als Raumbezug des Beispiels Thüringen und sind entsprechend gekennzeichnet.

Bitte nur synthetische Inhalte verwenden: keine Betriebsdaten, keine personenbezogenen und keine eingestuften Daten.

## Idee

Ein Betreiber meldet, was nur er belastbar weiß: Leistungsgrad der eigenen Dienstleistung, Ersatzverfahren mit Reichweite, Prognose der Wiederherstellung und Unterstützungsbedarf, jeweils mit Datenstand. Beurteilung, Tendenz und Lagenradar bleiben leer; sie kodiert jede Behörde für ihren eigenen Referenzraum. Technisch übernimmt das Profil `lead-kritis` das Kernschema LEAD-Meldung-v1 unverändert und ergänzt optional einen Meldekopf `kritis` und je Sachverhalt einen Block `betrieb`. Behördenmeldungen nach LEAD-Meldung-v1 bleiben damit gültig und laufen ohne Umformatierung in dasselbe Lagebild.

## Bestandteile

| Ordner | Inhalt | Stand |
|---|---|---|
| `kern/` | gepinnte Kopien aus KI-LEAD (Kernschema, Darstellung, Kodierleitfaden, Arbeitsanweisungen, SOP-Auszug, Ilka-Datensatz) mit Herkunft und Prüfsumme | vorhanden |
| `erweiterung/` | Erweiterung `lead-kritis` (Meldekopf, Betreiberangaben, Rollenregeln), Ergänzungen zu Darstellung, Kodierleitfaden (Anhang K) und Arbeitsanweisungen | vorhanden (M1, M2) |
| `profil/lead-kritis/` | Profilpaket für KI-LEAD (Schema, Darstellung, Kodierleitfaden mit Anhang K, Arbeitsanweisungen, SOP-Auszug, Beispiele) | vorhanden (M2) |
| `werkzeuge/` | Bau von Schema, Konformitätsfällen, Profilpaket, Formular, Erprobungsunterlagen, Seite und Release-Anhängen; Prüfung von Schema, Rollen, Nachrichtenidentität und Plausibilität; Trockenlauf | vorhanden (M1–M4) |
| `formular/` | Betreiberformular `betreibermeldung.html`: eine Offline-HTML-Datei in der Optik von KI-LEAD, ohne KI, sendet nichts; Anleitung in [docs/BETREIBER-ANLEITUNG.md](docs/BETREIBER-ANLEITUNG.md) | vorhanden (M3) |
| `schnittstelle/` | Beschreibung des Zielformats für Schnittstellen, aus dem Schema erzeugt: Feldreferenz, Feldverzeichnis (JSON, CSV), Minimalbeispiel; Anleitung in [docs/SCHNITTSTELLE.md](docs/SCHNITTSTELLE.md) | vorhanden (0.3.0) |
| `szenario/` | synthetisches Szenario Orkantief „Ilka“ im Landkreis Sonneberg: 14 Betreiber- und Behördenmeldungen unter dem Ilka-Datensatz von KI-LEAD | vorhanden (M1, M2) |
| `konformitaet/` | Erwartungen, Negativfälle je Regel, Plausibilitätsfälle, Sätze zur Nachrichtenidentität | vorhanden (M1, M3) |
| `erprobung/` | Drehbuch, Einspielungen, Bögen, Vorlage für den Erprobungsplan, Lösungen für die Spielleitung, Ergebnis des Trockenlaufs | vorhanden (M4) |

## Fahrplan

| Meilenstein | Inhalt | Stand |
|---|---|---|
| M0 | Grundgerüst: Abgrenzung, Lizenzen, gepinntes Kernschema, Prüfung in GitHub Actions | 0.0.1 |
| M1 | Meldeprofil v0.1: Erweiterung, Rollenregeln, gebautes Schema, Konformitätsfälle, Prüfwerkzeug | 0.0.2 |
| M2 | Lagebild: Profilpaket für KI-LEAD, Ladeprobe, Lagebild aus Szenario und Ilka-Datensatz | 0.0.3, 0.0.5 |
| M3 | Betreibererfassung: Offline-Formular, Anleitung, Plausibilitätsprüfung | 0.0.4 |
| M4 | Erprobungsstand: Trockenlauf mit dem ganzen Szenario, Erprobungsunterlagen, Release v0.1.0 mit Git-Tag | 0.1.0 |
| – | Erprobung als Planspiel und Auswertung; Entscheidung über v0.2 und Release mit DOI | geplant |

## Entwicklung

Voraussetzung ist Node.js 22.

```
npm ci                                   # Entwicklungswerkzeuge (Ajv, tsx) nach package-lock.json
npm run pruefen -- <datei.json|ordner>   # Meldungen prüfen: Schema, Rollenregeln, Plausibilität, Nachrichtenidentität
npm run bauen                            # Profilschema, Konformitätsfälle, Profilpaket, Schnittstellenbeschreibung, Betreiberformular und Erprobungsunterlagen neu erzeugen
npm run profil:zip                       # dist/lead-kritis.leadprofil für den Import in KI-LEAD
npm run seite                            # dist/seite/ für GitHub Pages (nach profil:zip)
npm run release                          # dist/release/: Anhänge eines Releases (nach profil:zip)
KI_LEAD_DIR=<Klon> npm run trockenlauf   # Trockenlauf mit dem ganzen Szenario; schreibt erprobung/trockenlauf/
npx playwright install chromium          # einmalig, für den Browsertest des Formulars
npm test                                 # Kernschema, Lizenzhinweise, Bau, Metaschema, Konformitätsfälle, Formular im Browser
KI_LEAD_DIR=<Klon> npm test              # zusätzlich zweiter Prüfweg und Ladeprobe mit dem Code von KI-LEAD am gepinnten Commit (dort vorher npm ci)
```

Laufzeitabhängigkeiten gibt es nicht; Ajv, tsx, esbuild, marked, Playwright (MIT bzw. Apache-2.0), axe-core (MPL-2.0) und JSZip (MIT oder GPL-3.0) dienen nur der Entwicklung, Prüfung, dem Bau und dem Packen. Das Formular enthält den mit Ajv erzeugten Prüfcode (MIT) und die Schrift Atkinson Hyperlegible (SIL Open Font License 1.1, [formular/SCHRIFT-OFL.txt](formular/SCHRIFT-OFL.txt)).

GitHub Pages (wie in KI-LEAD): Unter Settings → Pages als Source „GitHub Actions“ wählen und die Repository-Variable `PAGES_AKTIV` auf `true` setzen; dann veröffentlicht jeder Stand von `main` Startseite, Formular, Profilpaket und Szenario. Ohne diese Einstellung läuft nur die Prüfung.

Gebaute Dateien nachziehen: Ändert ein Pull Request Quellen gebauter Dateien – etwa Erweiterung oder Rollenregeln und damit Schema und Feldreferenz –, erzeugt der Workflow „Bau nachziehen“ (`.github/workflows/bau-nachziehen.yml`) sie mit `npm run bauen` neu, schreibt sie als Commit in den Zweig des Pull Requests und stößt die Prüfung für diesen Stand an; wer nur über die GitHub-Webseite arbeitet, muss nichts lokal bauen. Was sich nicht erzeugen lässt, meldet die Prüfung, etwa wenn [docs/SCHNITTSTELLE.md](docs/SCHNITTSTELLE.md) ein Feld nennt, das es nicht mehr gibt. Für Pull Requests aus Forks zeigt nur die Prüfung die Abweichung.

Releases: Nach dem Zusammenführen auf `main` unter „Releases → Draft a new release“ einen Tag `v<Version aus package.json>` auf den Stand setzen und veröffentlichen; GitHub Actions hängt Profilpaket, Formular und Erprobungsunterlagen an (`.github/workflows/release.yml`).

Beiträge in einem eigenen Zweig sammeln und als Pull Request gegen `main` vorlegen. Änderungen werden im selben Commit in [CHANGELOG.md](CHANGELOG.md) eingetragen.

## Lizenz

© 2026 Heiko Pereira Wolf. Licensed under the EUPL-1.2, soweit [LICENSE-CONTENT](LICENSE-CONTENT) nichts anderes bestimmt.

- **Code** (Quelltext, Tests, Skripte, Build- und Projektdateien): [EUPL-1.2](LICENSE)
- **Inhalte** (Dokumentation, Arbeitsanweisungen, Darstellungsdateien, Szenario, README, CHANGELOG): [CC BY 4.0](LICENSE-CONTENT), Namensnennung: Heiko Pereira Wolf
- **Maschinenlesbare Dateien** (Meldungsschemata, Erweiterung, Manifeste, Kontaktlisten, Konformitätsfälle, Feldverzeichnis und Minimalbeispiel des Zielformats) und **Vorlagen**: zusätzlich [CC0 1.0](LICENSE-CC0), damit Fachverfahren und Stellen sie ohne Namensnennung übernehmen können
- Aus KI-LEAD übernommene Stufentexte des Lagenradars: allein CC BY 4.0, Namensnennung Heiko Pereira Wolf, KI-LEAD

## Zitiervorschlag

Pereira Wolf, H. (2026). *KRITIS-LEAD: Forschungsdemonstrator für KRITIS-Betreibermeldungen im LEAD-Lagebild* [Software]. https://github.com/pereirawolf/kritis-lead

Die Zitierangaben stehen maschinenlesbar in [CITATION.cff](CITATION.cff).
