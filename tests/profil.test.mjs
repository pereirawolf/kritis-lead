// Prüft das Profilpaket: gebaute Dateien aktuell, Manifest stimmig zu Schema, Dateien und Szenario.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { erzeuge, SOP, BEISPIELE } from "../werkzeuge/bauen/profil-bauen.mjs";

const url = (p) => new URL(`../${p}`, import.meta.url);
const lies = (p) => readFileSync(url(p), "utf-8");
const manifest = JSON.parse(lies("profil/lead-kritis/profil.json"));

test("gebaute Dateien des Profilpakets entsprechen dem Bau", () => {
  for (const [p, t] of erzeuge()) assert.equal(lies(p), t, `${p}: npm run bauen ausführen`);
});

test("Manifest passt zu Schema, Migration und Dateien", () => {
  const schema = JSON.parse(lies("profil/lead-kritis/meldung.schema.json"));
  assert.equal(manifest.format, "lead-profil/1");
  assert.equal(manifest.meldung.schema_id, schema.properties.schema.const);
  assert.deepEqual(manifest.migrationen, [{ von: "LEAD-Meldung-v1", setze: { schema: manifest.meldung.schema_id }, hinweis: manifest.migrationen[0].hinweis }]);
  assert.deepEqual(manifest.sop.dateien, SOP);
  assert.deepEqual(manifest.beispiele.map((b) => b.ordner), BEISPIELE.map((b) => b.ordner));
  for (const p of [manifest.meldung.schema, manifest.meldung.ui, manifest.kodierleitfaden, manifest.kontakte, ...Object.values(manifest.anweisungen)])
    assert.ok(existsSync(url(`profil/lead-kritis/${p}`)), p);
});

test("Kontaktliste nennt jede meldende Stelle des Szenarios", () => {
  const kontakte = JSON.parse(lies("profil/lead-kritis/kontakte.json")).stellen.map((s) => s.name).sort();
  const stellen = [...new Set([...erzeuge()].filter(([p]) => p.includes("/sonneberg-verlauf/0") || p.includes("/sonneberg-verlauf/1")).map(([, t]) => JSON.parse(t).meldende_stelle))].sort();
  assert.deepEqual(kontakte, stellen);
});

test("Ergänzungen sind als KRITIS-LEAD gekennzeichnet", () => {
  assert.match(lies("profil/lead-kritis/kodierleitfaden.md"), /## Anhang K: Betreibermeldungen \(Ergänzung KRITIS-LEAD\)/);
  assert.match(lies("profil/lead-kritis/anweisung-erfassung.md"), /## Ergänzung KRITIS-LEAD/);
  assert.match(lies("profil/lead-kritis/anweisung-verdichtung.md"), /## Ergänzung KRITIS-LEAD/);
});
