// Zweiter Prüfweg nach LEAD-Meldung-v2 (seit M4): prüft alle Konformitätsfälle aus formate/lead-kritis-v2/konformitaet/
// mit dem Schemaprüfer von KI-LEAD am gepinnten Stand und überführt den Ilka-Datensatz von KI-LEAD mit migriereV1, wie die
// App es beim Einlesen tut; die Überführung muss gegen das Schema von KRITIS-LEAD gültig sein.
// Aufruf (über den Trockenlauf): KI_LEAD_DIR=<Klon von pereirawolf/ki-lead> node --import tsx werkzeuge/pruefen/ki-lead-pruefweg-v2.mts
// Ausgabe: JSON mit Schemabefund, Urteil je Fall und je überführter Ilka-Meldung.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = process.env.KI_LEAD_DIR;
if (!dir) throw new Error("KI_LEAD_DIR fehlt");
const { pruefeRoh, schemaFehler } = await import(pathToFileURL(join(dir, "src/kern/validierung.ts")).href);
const { migriereV1 } = await import(pathToFileURL(join(dir, "src/kern/meldung-v2.js")).href);

const lies = (p: string) => JSON.parse(readFileSync(p, "utf-8"));
const schema = lies("formate/lead-kritis-v2/meldung.schema.json");

const faelle = lies("formate/lead-kritis-v2/konformitaet/faelle.json").faelle.map((f: any) => {
  const fehler = pruefeRoh(schema, lies(f.datei));
  return { datei: f.datei, gueltig: fehler.length === 0, fehler: fehler.slice(0, 5) };
});

// Ilka-Datensatz in der gepinnten Kopie (kern/), überführt wie beim Einlesen in der App; feste ID und Zeit für ein prüfbares Ergebnis
const ILKA = "kern/lead-beispiel/beispiele/orkantief-ilka";
const ilka = readdirSync(ILKA)
  .filter((n) => n.endsWith(".json"))
  .sort()
  .map((n, i) => {
    const { meldung } = migriereV1(lies(join(ILKA, n)), {
      zeitzone: "Europe/Berlin",
      meldungId: () => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      jetzt: () => new Date("2026-11-14T12:00:00+01:00"),
    });
    return { datei: n, gueltig: pruefeRoh(schema, meldung).length === 0 };
  });

process.stdout.write(JSON.stringify({ schemaFehler: schemaFehler(schema), faelle, ilka }));
