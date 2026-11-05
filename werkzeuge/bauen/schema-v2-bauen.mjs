// Baut das Profilschema nach LEAD-Meldung-v2 für KRITIS-LEAD (formate/lead-kritis-v2/meldung.schema.json):
// Zusammenstellung mit dem Werkzeug von KI-LEAD am gepinnten Stand (src/kern/meldung-v2.js, stelleSchemaZusammen),
// dazu die Rollenregeln von KRITIS-LEAD. Kern und Modul lead-bevoelkerungsschutz kommen aus den gepinnten Kopien in kern/.
// Aufruf: KI_LEAD_DIR=<Klon von pereirawolf/ki-lead am Commit aus kern/quelle.json> node werkzeuge/bauen/schema-v2-bauen.mjs [--pruefen]
//   ohne KI_LEAD_DIR: ./ki-lead-pin (wie in der CI)
// --pruefen schreibt nichts und endet mit Fehler, wenn die eingecheckte Datei vom Bau abweicht.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const WURZEL = fileURLToPath(new URL("../../", import.meta.url));
const ORDNER = join(WURZEL, "formate/lead-kritis-v2");
export const ZIEL = "formate/lead-kritis-v2/meldung.schema.json";
const lies = (p) => JSON.parse(readFileSync(p, "utf-8"));

/** Verzeichnis des KI-LEAD-Klons; prüft, dass er auf dem gepinnten Commit steht, sofern er ein Git-Klon ist. */
export function kiLeadDir() {
  const dir = process.env.KI_LEAD_DIR || join(WURZEL, "ki-lead-pin");
  if (!existsSync(join(dir, "src/kern/meldung-v2.js")))
    throw new Error(`KI-LEAD nicht gefunden (${dir}): KI_LEAD_DIR auf einen Klon von pereirawolf/ki-lead am Commit aus kern/quelle.json setzen.`);
  const pin = lies(join(WURZEL, "kern/quelle.json")).commit;
  let kopf = null;
  try {
    kopf = execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf-8" }).trim();
  } catch {
    /* kein Git-Klon */
  }
  if (kopf && kopf !== pin) throw new Error(`KI-LEAD steht auf ${kopf.slice(0, 7)}, gepinnt ist ${pin.slice(0, 7)} (kern/quelle.json).`);
  return dir;
}

export async function baueSchemaV2(dir = kiLeadDir()) {
  const { stelleSchemaZusammen } = await import(pathToFileURL(join(dir, "src/kern/meldung-v2.js")).href);
  const z = lies(join(ORDNER, "zusammenstellung.json"));
  const s = stelleSchemaZusammen(z, (datei) => lies(join(ORDNER, datei)));
  const { regeln } = lies(join(ORDNER, "rollenregeln.json"));
  s.allOf = [...(s.allOf || []), ...regeln.map((r) => ({ $comment: `${r.regel}: ${r.beschreibung}`, ...r.schema }))];
  s.$comment = `${s.$comment} Rollenregeln: formate/lead-kritis-v2/rollenregeln.json (${regeln.map((r) => r.regel).join(", ")}); gebaut von werkzeuge/bauen/schema-v2-bauen.mjs.`;
  return s;
}

export const alsText = (schema) => JSON.stringify(schema, null, 2) + "\n";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = alsText(await baueSchemaV2());
  const ziel = join(WURZEL, ZIEL);
  if (process.argv.includes("--pruefen")) {
    if (!existsSync(ziel) || readFileSync(ziel, "utf-8") !== text) {
      console.error(`${ZIEL} weicht vom Bau ab: npm run bauen ausführen (mit KI_LEAD_DIR).`);
      process.exit(1);
    }
    console.log(`${ZIEL} entspricht dem Bau.`);
  } else {
    writeFileSync(ziel, text);
    console.log(`${ZIEL} geschrieben.`);
  }
}

