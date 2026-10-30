// Prüft die gepinnte Kopie des Kernschemas gegen ihre Herkunftsangabe.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url));
const quelle = JSON.parse(lies("kern/quelle.json"));

test("quelle.json nennt Repository, vollständigen Commit und Dateien", () => {
  assert.equal(quelle.repository, "https://github.com/pereirawolf/ki-lead");
  assert.match(quelle.commit, /^[0-9a-f]{40}$/);
  assert.ok(Array.isArray(quelle.dateien) && quelle.dateien.length > 0);
});

for (const datei of quelle.dateien) {
  test(`${datei.ziel} entspricht der Prüfsumme in quelle.json`, () => {
    const hash = createHash("sha256").update(lies(datei.ziel)).digest("hex");
    assert.equal(hash, datei.sha256, "Kopie verändert: Pin bewusst wechseln und quelle.json anpassen");
  });

  test(`${datei.ziel} trägt die Schemakennung ${datei.schema_id}`, () => {
    const schema = JSON.parse(lies(datei.ziel));
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(schema.properties?.schema?.const, datei.schema_id);
  });
}
