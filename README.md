# KRITIS-LEAD

Forschungsdemonstrator für die Einbindung von Meldungen der Betreiber Kritischer Infrastrukturen (KRITIS) in ein gemeinsames Lagebild nach der LEAD-Systematik (Lageerfassung, -auswertung und -darstellung). Betreibermeldungen und Lagemeldungen von Behörden stehen im selben Lagebild; die Herkunft jeder Meldung bleibt erkennbar, und Betreiber liefern Angaben zum eigenen Betrieb, keine behördliche Bewertung.

KRITIS-LEAD ist das Schwesterprojekt zu [KI-LEAD](https://github.com/pereirawolf/ki-lead). Es erweitert das dortige Meldungsschema LEAD-Meldung-v1 um Angaben von Betreibern und nutzt KI-LEAD als Anwendung für Lagebild und Verdichtung.

**Stand:** Meilenstein M2 (Lagebild): Profilpaket `lead-kritis` für KI-LEAD mit dem Szenario Orkantief „Ilka“ im Landkreis Sonneberg als Beispiel; Betreiber- und Behördenmeldungen stehen ohne Umformatierung in einem Lagebild ([docs/LAGEBILD.md](docs/LAGEBILD.md)). Meldeprofil und Feldkatalog: [docs/MELDEPROFIL.md](docs/MELDEPROFIL.md). Betreiberformular folgt; siehe [Fahrplan](#fahrplan).

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
| `werkzeuge/` | Bau von Schema und Konformitätsfällen; Prüfung von Schema, Rollen und Nachrichtenidentität | vorhanden (M1); Plausibilität geplant (M3) |
| `formular/` | Betreiberformular als Offline-HTML-Datei, ohne KI | geplant (M3) |
| `szenario/` | synthetisches Szenario Orkantief „Ilka“ im Landkreis Sonneberg: 14 Betreiber- und Behördenmeldungen unter dem Ilka-Datensatz von KI-LEAD | vorhanden (M1, M2) |
| `konformitaet/` | Erwartungen, Negativfälle je Regel, Sätze zur Nachrichtenidentität | vorhanden (M1) |

## Fahrplan

| Meilenstein | Inhalt |
|---|---|
| M0 | Grundgerüst: Abgrenzung, Lizenzen, gepinntes Kernschema, Prüfung in GitHub Actions |
| M1 | Meldeprofil v0.1: Erweiterung, Rollenregeln, gebautes Schema, Konformitätsfälle, Prüfwerkzeug |
| M2 | Lagebild: Profilpaket für KI-LEAD, Ladeprobe, Lagebild aus Szenario und Ilka-Datensatz |
| M3 | Betreibererfassung: Offline-Formular, Anleitung, Plausibilitätsprüfung |
| M4 | Erprobungsstand v0.1.0 mit Git-Tag |

## Entwicklung

Voraussetzung ist Node.js 22.

```
npm ci                                   # Entwicklungswerkzeuge (Ajv, tsx) nach package-lock.json
npm run pruefen -- <datei.json|ordner>   # Meldungen prüfen: Schema, Rollenregeln, Nachrichtenidentität
npm run bauen                            # Profilschema, Konformitätsfälle und Profilpaket neu erzeugen
npm run profil:zip                       # dist/lead-kritis.leadprofil für den Import in KI-LEAD
npm test                                 # Kernschema, Lizenzhinweise, Bau, Metaschema, Konformitätsfälle
KI_LEAD_DIR=<Klon> npm test              # zusätzlich zweiter Prüfweg und Ladeprobe mit dem Code von KI-LEAD am gepinnten Commit (dort vorher npm ci)
```

Laufzeitabhängigkeiten gibt es nicht; Ajv, tsx (beide MIT) und JSZip (MIT oder GPL-3.0) dienen nur der Entwicklung, Prüfung und dem Packen.

Beiträge in einem eigenen Zweig sammeln und als Pull Request gegen `main` vorlegen. Änderungen werden im selben Commit in [CHANGELOG.md](CHANGELOG.md) eingetragen.

## Lizenz

© 2026 Heiko Pereira Wolf. Licensed under the EUPL-1.2, soweit [LICENSE-CONTENT](LICENSE-CONTENT) nichts anderes bestimmt.

- **Code** (Quelltext, Tests, Skripte, Build- und Projektdateien): [EUPL-1.2](LICENSE)
- **Inhalte** (Dokumentation, Arbeitsanweisungen, Darstellungsdateien, Szenario, README, CHANGELOG): [CC BY 4.0](LICENSE-CONTENT), Namensnennung: Heiko Pereira Wolf
- **Maschinenlesbare Dateien** (Meldungsschemata, Erweiterung, Manifeste, Kontaktlisten, Konformitätsfälle) und **Vorlagen**: zusätzlich [CC0 1.0](LICENSE-CC0), damit Fachverfahren und Stellen sie ohne Namensnennung übernehmen können
- Aus KI-LEAD übernommene Stufentexte des Lagenradars: allein CC BY 4.0, Namensnennung Heiko Pereira Wolf, KI-LEAD

## Zitiervorschlag

Pereira Wolf, H. (2026). *KRITIS-LEAD: Forschungsdemonstrator für KRITIS-Betreibermeldungen im LEAD-Lagebild* [Software]. https://github.com/pereirawolf/kritis-lead

Die Zitierangaben stehen maschinenlesbar in [CITATION.cff](CITATION.cff).
