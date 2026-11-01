// Prüft das gebaute Profilschema: Bau aktuell, metaschemagültig, nur Schlüsselwörter, die der Prüfer von KI-LEAD auswertet.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { baueSchema, alsText, ZIEL, SCHEMA_ID } from "../werkzeuge/bauen/schema-bauen.mjs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf-8");
const schema = JSON.parse(lies(ZIEL));

// Positivliste des Prüfers von KI-LEAD, Stand 57d14ce (src/kern/validierung.ts, UNTERSTUETZT; seit ca02e0d2 unverändert)
const UNTERSTUETZT = new Set(
  ("$schema $id $ref $defs definitions $comment title description default examples deprecated readOnly writeOnly format type const enum " +
    "pattern minLength maxLength minimum maximum exclusiveMinimum exclusiveMaximum multipleOf items prefixItems minItems maxItems uniqueItems " +
    "contains required properties additionalProperties patternProperties minProperties maxProperties propertyNames allOf anyOf oneOf not if then else dependentRequired").split(" "),
);

function schluesselwoerter(s, out = new Set()) {
  if (!s || typeof s !== "object" || Array.isArray(s)) return out;
  for (const [k, v] of Object.entries(s)) {
    out.add(k);
    if (["properties", "$defs", "patternProperties"].includes(k)) for (const t of Object.values(v)) schluesselwoerter(t, out);
    else if (["items", "not", "if", "then", "else", "additionalProperties", "contains", "propertyNames"].includes(k)) schluesselwoerter(v, out);
    else if (["allOf", "anyOf", "oneOf", "prefixItems"].includes(k)) for (const t of v) schluesselwoerter(t, out);
  }
  return out;
}

test("eingecheckte Schemadatei entspricht dem Bau", () => {
  assert.equal(lies(ZIEL), alsText(baueSchema()), "npm run bauen ausführen");
});

test("Schema trägt die Kennung und ist gültig nach Draft 2020-12", () => {
  assert.equal(schema.properties.schema.const, SCHEMA_ID);
  const ajv = new Ajv2020({ strict: false });
  assert.ok(ajv.validateSchema(schema), JSON.stringify(ajv.errors));
});

test("Schema nutzt nur Schlüsselwörter des KI-LEAD-Prüfers und kein format", () => {
  const benutzt = schluesselwoerter(schema);
  const fremd = [...benutzt].filter((k) => !UNTERSTUETZT.has(k));
  assert.deepEqual(fremd, []);
  assert.ok(!benutzt.has("format"), "format wird in KI-LEAD nicht geprüft; pattern verwenden");
});

test("Positivliste entspricht dem gepinnten KI-LEAD-Stand", { skip: !process.env.KI_LEAD_DIR && "KI_LEAD_DIR nicht gesetzt" }, () => {
  const quelle = readFileSync(join(process.env.KI_LEAD_DIR, "src/kern/validierung.ts"), "utf-8");
  const block = /const UNTERSTUETZT = new Set\(\[([\s\S]*?)\]\)/.exec(quelle)?.[1] ?? "";
  const dort = new Set([...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  assert.deepEqual([...dort].sort(), [...UNTERSTUETZT].sort());
});

test("Erweiterung lässt Kernfelder unverändert", () => {
  const kern = JSON.parse(lies("kern/LEAD-Meldung-v1.schema.json"));
  for (const [k, v] of Object.entries(kern.properties)) if (k !== "schema") assert.deepEqual(schema.properties[k], v, k);
  for (const [k, v] of Object.entries(kern.$defs.sachverhalt.properties)) assert.deepEqual(schema.$defs.sachverhalt.properties[k], v, k);
  assert.deepEqual(schema.required, kern.required);
});

test("Messwert: Einheit Pflicht außer bei „nicht zutreffend“ (seit Profil 0.3.2)", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const pruefe = ajv.compile({ ...schema.$defs.kritis_messwert, $defs: schema.$defs });
  const stand = "2026-10-14T06:00";
  assert.equal(pruefe({ wert: null, status: "nicht_zutreffend", stand }), true, "nicht zutreffend ohne Einheit");
  assert.equal(pruefe({ wert: null, einheit: "Personen", status: "nicht_zutreffend", stand }), true, "nicht zutreffend mit Einheit");
  for (const [status, w] of [["belegt", 3], ["geschaetzt", 3], ["unbekannt", null]]) assert.equal(pruefe({ wert: w, status, stand }), false, `${status} ohne Einheit`);
});
