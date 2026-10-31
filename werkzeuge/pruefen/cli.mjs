// Aufruf: npm run pruefen -- <datei.json|ordner> [...]
// Prüft jede Meldung gegen Schema und Rollenregeln und den ganzen Satz auf Nachrichtenidentität.
// Exitcode 1, sobald ein Befund der Stufe „fehler“ vorliegt.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pruefeMeldung, pruefeSatz, migriere } from "./pruefen.mjs";

function dateien(p) {
  if (statSync(p).isDirectory()) return readdirSync(p).sort().flatMap((n) => dateien(join(p, n)));
  return p.endsWith(".json") ? [p] : [];
}

const ziele = process.argv.slice(2);
if (!ziele.length) {
  console.error("Aufruf: npm run pruefen -- <datei.json|ordner> [...]");
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
  const zusatz = `${e.rolle}${e.migriert ? ", aus LEAD-Meldung-v1 übernommen" : ""}`;
  console.log(`${e.gueltig ? "✓" : "✗"} ${name} (${zusatz})`);
  for (const b of e.befunde) console.log(`    ${b.regel} ${b.pfad}: ${b.text}`);
  if (!e.gueltig) fehler++;
  satz.push({ name, daten: migriere(obj).daten });
}
for (const b of pruefeSatz(satz)) {
  console.log(`${b.stufe === "fehler" ? "✗" : b.stufe === "warnung" ? "!" : "i"} ${b.regel}: ${b.text} (${b.dateien.join(", ")})`);
  if (b.stufe === "fehler") fehler++;
}
console.log(fehler ? `${fehler} Fehler.` : "Keine Fehler.");
process.exit(fehler ? 1 : 0);
