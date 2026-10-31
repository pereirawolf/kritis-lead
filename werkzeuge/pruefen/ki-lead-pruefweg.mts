// Zweiter Prüfweg: prüft alle Konformitätsfälle mit dem Schemaprüfer von KI-LEAD am gepinnten Stand.
// Aufruf (über tests/ki-lead-pruefweg.test.mjs): KI_LEAD_DIR=<Klon von pereirawolf/ki-lead> node --import tsx werkzeuge/pruefen/ki-lead-pruefweg.mts
// Ausgabe: JSON mit Schemabefund und Urteil je Fall.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = process.env.KI_LEAD_DIR;
if (!dir) throw new Error("KI_LEAD_DIR fehlt");
const { pruefeRoh, schemaFehler } = await import(pathToFileURL(join(dir, "src/kern/validierung.ts")).href);

const lies = (p: string) => JSON.parse(readFileSync(p, "utf-8"));
const schema = lies("profil/lead-kritis/meldung.schema.json");
const migriere = (o: any) => (o?.schema === "LEAD-Meldung-v1" ? { ...o, schema: "LEAD-KRITIS-Meldung-v0.1" } : o);

const faelle = lies("konformitaet/faelle.json").faelle.map((f: any) => {
  const fehler = pruefeRoh(schema, migriere(lies(f.datei)));
  return { datei: f.datei, gueltig: fehler.length === 0, fehler: fehler.slice(0, 5) };
});

const ilkaOrdner = join(dir, "profile/lead-beispiel/beispiele/orkantief-ilka");
const ilka = readdirSync(ilkaOrdner)
  .filter((n) => n.endsWith(".json"))
  .map((n) => ({ datei: n, gueltig: pruefeRoh(schema, migriere(lies(join(ilkaOrdner, n)))).length === 0 }));

process.stdout.write(JSON.stringify({ schemaFehler: schemaFehler(schema), faelle, ilka }));
