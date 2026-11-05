// Urteil des Prüfers von KI-LEAD (src/kern/validierung.ts) über Meldungen nach LEAD-Meldung-v2 gegen das Schema von KRITIS-LEAD.
// Aufruf (über tests/lead-meldung-v2.test.mjs): KI_LEAD_DIR=<Klon von pereirawolf/ki-lead> node --import tsx werkzeuge/pruefen/ki-lead-urteil-v2.mts <fälle.json>
// Eingabe: JSON-Liste von Meldungen. Ausgabe: JSON mit Schemabefund und Urteil je Meldung.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = process.env.KI_LEAD_DIR;
if (!dir) throw new Error("KI_LEAD_DIR fehlt");
const { pruefeRoh, schemaFehler } = await import(pathToFileURL(join(dir, "src/kern/validierung.ts")).href);

const schema = JSON.parse(readFileSync("formate/lead-kritis-v2/meldung.schema.json", "utf-8"));
const faelle = JSON.parse(readFileSync(process.argv[2], "utf-8"));
const urteile = faelle.map((m: unknown) => {
  const fehler = pruefeRoh(schema, m);
  return { gueltig: fehler.length === 0, fehler: fehler.slice(0, 3) };
});
process.stdout.write(JSON.stringify({ schemaFehler: schemaFehler(schema), urteile }));
