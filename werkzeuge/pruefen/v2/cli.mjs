// Aufruf: npm run pruefen:v2 -- <datei.json|ordner> [...]
// Prüft jede Meldung nach LEAD-Meldung-v2 gegen Schema und Rollenregeln von KRITIS-LEAD, bei gültigem Schema auf Plausibilität,
// und den ganzen Satz auf Nachrichtenidentität. Exitcode 1, sobald ein Befund der Stufe „fehler“ vorliegt.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pruefeMeldung, pruefeSatz } from "./pruefen.mjs";

const dateien = (p) => (statSync(p).isDirectory() ? readdirSync(p).sort().flatMap((n) => dateien(join(p, n))) : p.endsWith(".json") ? [p] : []);
const ziele = process.argv.slice(2);
if (!ziele.length) {
  console.error("Aufruf: npm run pruefen:v2 -- <datei.json|ordner> [...]");
  process.exit(2);
}
let fehler = 0;
const satz = [];
for (const d of ziele.flatMap(dateien)) {
  const name = relative(process.cwd(), d);
  let obj;
  try {
    obj = JSON.parse(readFileSync(d, "utf-8"));
  } catch (e) {
    console.log(`✗ ${name}: kein gültiges JSON (${e.message})`);
    fehler++;
    continue;
  }
  const e = pruefeMeldung(obj);
  const schlecht = !e.gueltig || e.befunde.some((b) => b.stufe === "fehler");
  console.log(`${schlecht ? "✗" : "✓"} ${name} (${e.rolle})`);
  for (const b of e.befunde) console.log(`    ${b.stufe === "warnung" ? "!" : "✗"} ${b.regel} ${b.pfad}: ${b.text}`);
  if (schlecht) fehler++;
  satz.push({ name, daten: obj });
}
for (const b of pruefeSatz(satz)) {
  console.log(`${b.stufe === "fehler" ? "✗" : b.stufe === "warnung" ? "!" : "i"} ${b.regel}: ${b.text} (${b.dateien.join(", ")})`);
  if (b.stufe === "fehler") fehler++;
}
console.log(fehler ? `${fehler} Fehler.` : "Keine Fehler.");
process.exit(fehler ? 1 : 0);
