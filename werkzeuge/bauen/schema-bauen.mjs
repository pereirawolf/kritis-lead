// Baut das Profilschema LEAD-KRITIS-Meldung-v0.2 aus dem gepinnten Kernschema,
// der Erweiterung lead-kritis und den Rollenregeln.
// Aufruf: node werkzeuge/bauen/schema-bauen.mjs [--pruefen]
// --pruefen schreibt nichts und endet mit Fehler, wenn die eingecheckte Datei vom Bau abweicht.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const SCHEMA_ID = "LEAD-KRITIS-Meldung-v0.2";
export const KERN_ID = "LEAD-Meldung-v1";
export const ZIEL = "profil/lead-kritis/meldung.schema.json";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => JSON.parse(readFileSync(pfad(p), "utf-8"));

export function baueSchema() {
  const kern = lies("kern/LEAD-Meldung-v1.schema.json");
  const erw = lies("erweiterung/lead-kritis.defs.json");
  const regeln = lies("erweiterung/rollenregeln.json").regeln;
  const s = structuredClone(kern);

  if (s.properties?.schema?.const !== KERN_ID) throw new Error(`Kernschema trägt nicht die Kennung ${KERN_ID}`);
  s.$id = `${SCHEMA_ID}.schema.json`;
  s.title = "LEAD-KRITIS-Meldung – JSON-Schema v0.2";
  s.description =
    `Profilschema von KRITIS-LEAD (Schemakennung ${SCHEMA_ID}): ${KERN_ID} unverändert, ergänzt um die Erweiterung ${erw.erweiterung} ` +
    "(optional zeitzone und Meldekopf kritis, je Sachverhalt der Block betrieb) und Rollenregeln. Behördenmeldungen nach " +
    `${KERN_ID} sind nach Umstellung der Schemakennung gültig. Gebaut von werkzeuge/bauen/schema-bauen.mjs; nicht von Hand bearbeiten. ` +
    "Prüft Struktur, zulässige Werte und Rollen; inhaltliche Richtigkeit prüft das Schema nicht.";

  // Meldungsebene: Kennung umstellen, Erweiterungsfelder hinter _entstehung einfügen
  const props = {};
  for (const [k, v] of Object.entries(s.properties)) {
    props[k] = k === "schema" ? { const: SCHEMA_ID } : v;
    if (k === "_entstehung") Object.assign(props, erw.oben);
  }
  for (const k of Object.keys(erw.oben)) if (!(k in props)) props[k] = erw.oben[k];
  s.properties = props;

  // Sachverhaltsebene
  const sv = s.$defs?.sachverhalt;
  if (!sv?.properties) throw new Error("Kernschema ohne $defs.sachverhalt");
  for (const [k, v] of Object.entries(erw.sachverhalt)) {
    if (k in sv.properties) throw new Error(`Feld ${k} gibt es im Kernschema schon`);
    sv.properties[k] = v;
  }

  // Teilschemata und Rollenregeln
  for (const [k, v] of Object.entries(erw.$defs)) {
    if (k in s.$defs) throw new Error(`$defs.${k} gibt es im Kernschema schon`);
    s.$defs[k] = v;
  }
  s.allOf = [...(s.allOf || []), ...regeln.map((r) => ({ $comment: `${r.regel}: ${r.beschreibung}`, ...r.schema }))];
  return s;
}

export const alsText = (schema) => JSON.stringify(schema, null, 2) + "\n";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = alsText(baueSchema());
  if (process.argv.includes("--pruefen")) {
    const alt = readFileSync(pfad(ZIEL), "utf-8");
    if (alt !== text) {
      console.error(`${ZIEL} weicht vom Bau ab: npm run bauen ausführen.`);
      process.exit(1);
    }
    console.log(`${ZIEL} entspricht dem Bau.`);
  } else {
    writeFileSync(pfad(ZIEL), text);
    console.log(`${ZIEL} geschrieben.`);
  }
}
