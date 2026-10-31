# Anleitung für die Spielleitung

Ergänzt das [Drehbuch](../DREHBUCH.md). Die Spielleitung braucht einen Klon von KRITIS-LEAD am Tag des Planspiels mit Node.js 22 und `npm ci`.

## Vorbereitung

1. **Stände festhalten.** KRITIS-LEAD am Tag (`git checkout v0.1.0`); KI-LEAD am Commit aus `kern/quelle.json`. Trockenlauf ausführen und grün sehen: `KI_LEAD_DIR=<Klon von KI-LEAD> npm run trockenlauf`.
2. **Funktionsadresse** für den Eingang der Dateien einrichten (Postfach oder Ablage), keine persönliche Adresse.
3. **Unterlagen versenden:** an Betreiber `betreibermeldung.html`, [Anleitung](../../docs/BETREIBER-ANLEITUNG.md), [Selbstprotokoll](../boegen/selbstprotokoll.md); an Lagezentren die Adresse von KI-LEAD, `lead-kritis.leadprofil`, [Drehbuch](../DREHBUCH.md), Abschnitt 4. Alles liegt in der Release-Datei `kritis-lead-erprobung-<Version>.zip`. Einspielungen erst am Planspieltag ausgeben.
4. **Erprobungsplan** nach [plan-vorlage.md](../plan-vorlage.md) ablegen.

## Am Planspieltag

1. Einspielungen zur Realzeit ausgeben ([Übersicht](../einspielungen/README.md)). Für Rollen ohne Teilnehmende die Szenariodatei in den Eingang legen und im Protokoll vermerken.
2. Eingehende Dateien je Phase in einen Ordner legen, Dateinamen unverändert lassen, und prüfen:

   ```
   npm run pruefen -- eingang/phase-1
   ```

   Fehler meldet die Spielleitung nicht zurück: Gemessen wird der erste Export. Ungültige Dateien kommen trotzdem in den Meldungssatz; KI-LEAD zeigt dann Schemabefunde, das ist Teil des Befunds.
3. **Meldungssatz um 12:00 Uhr:** Dateien der Betreiber zu 01–06, dazu aus dem Repository `szenario/orkantief-ilka-sonneberg/05_…` und `07_…` und die sieben Dateien aus `kern/lead-beispiel/beispiele/orkantief-ilka/`. Als ZIP an die Lagezentren.
4. Um 16:00 Uhr Landesmeldungen (JSON und PDF aus KI-LEAD) und Bögen entgegennehmen; erst danach [Lösungen](loesungen.md) zeigen.

## Auswertung

- Messung nach [boegen/auswertung.md](../boegen/auswertung.md). Für Nahtlosigkeit den Meldungssatz in KI-LEAD laden und die Zahl der Meldungen ohne Schemabefund und ohne Vermerk „fremd“ zählen.
- Befunde als Issues mit der Vorlage „Befund aus der Erprobung“, ohne Namen und ohne Dateien der Teilnehmenden.
- Ergebnis unter `erprobung/ergebnisse/` als Pull Request. Rohdaten (Dateien, Bögen) nach dem im Plan festgelegten Datum löschen.

---
KRITIS-LEAD · Forschungsdemonstrator · CC BY 4.0
