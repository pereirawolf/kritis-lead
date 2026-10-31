// Prüfwerkzeug KRITIS-LEAD: Schema und Rollen (Ajv als Referenzprüfer) sowie Nachrichtenidentität über einen Satz von Meldungen.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { SCHEMA_ID, KERN_ID, ZIEL } from "../bauen/schema-bauen.mjs";
import { pruefePlausibilitaet } from "./plausibilitaet.mjs";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

export function ladeSchema() {
  return JSON.parse(readFileSync(pfad(ZIEL), "utf-8"));
}

let pruefer;
function holePruefer(schema) {
  if (!pruefer) {
    const ajv = new Ajv2020({ allErrors: true, strict: false, verbose: true });
    pruefer = { schema, validate: ajv.compile(schema), regeln: regelKarte(schema) };
  }
  return pruefer;
}

/** Wie die Migrationsregel im Profilmanifest: Behördenmeldungen nach LEAD-Meldung-v1 werden ohne Inhaltsänderung übernommen. */
export function migriere(obj) {
  if (obj && typeof obj === "object" && obj.schema === KERN_ID) return { daten: { ...obj, schema: SCHEMA_ID }, migriert: true };
  return { daten: obj, migriert: false };
}

/** Ordnet jedem Teilschema der Rollenregeln (oberstes allOf) die Kennung seiner Regel zu. */
function regelKarte(schema) {
  const karte = new Map();
  const merke = (s, regel) => {
    if (!s || typeof s !== "object") return;
    if (!Array.isArray(s)) karte.set(s, regel);
    for (const v of Object.values(s)) merke(v, regel);
  };
  for (const r of schema.allOf || []) {
    const k = /^([A-Z]\d+-[a-z-]+):/.exec(r.$comment || "");
    merke(r, k ? k[1] : "K-final");
  }
  return karte;
}

/** Prüft eine einzelne Meldung (bereits geparst). */
export function pruefeMeldung(obj) {
  const schema = ladeSchema();
  const { validate, regeln } = holePruefer(schema);
  const { daten, migriert } = migriere(obj);
  const gueltig = validate(daten);
  const befunde = (validate.errors || [])
    // „if“-Fehler sind nur Folgemeldungen eines then/else-Fehlers
    .filter((f) => f.keyword !== "if")
    .map((f) => ({ stufe: "fehler", regel: regeln.get(f.parentSchema) || "Schema", pfad: f.instancePath || "/", text: f.message, keyword: f.keyword }));
  const rolle = daten?.kritis?.rolle || "Behörde";
  // Plausibilität nur bei schemagültigen Meldungen; „gueltig“ bleibt das Urteil des Schemas
  const plausibel = gueltig ? pruefePlausibilitaet(daten) : [];
  return { gueltig: Boolean(gueltig), migriert, rolle, befunde: [...befunde, ...plausibel] };
}

const kanonisch = (v) =>
  Array.isArray(v)
    ? `[${v.map(kanonisch).join(",")}]`
    : v && typeof v === "object"
      ? `{${Object.keys(v)
          .sort()
          .map((k) => `${JSON.stringify(k)}:${kanonisch(v[k])}`)
          .join(",")}}`
      : JSON.stringify(v);

/** Prüft die Nachrichtenidentität über einen Satz von Meldungen [{name, daten}]. */
export function pruefeSatz(meldungen) {
  const befunde = [];
  const nachId = new Map();
  for (const m of meldungen) {
    const id = m.daten?.kritis?.meldung_id;
    if (!id) continue;
    const vorhanden = nachId.get(id);
    if (!vorhanden) {
      nachId.set(id, m);
    } else if (kanonisch(vorhanden.daten) === kanonisch(m.daten)) {
      befunde.push({ stufe: "hinweis", regel: "I1-identitaet", dateien: [vorhanden.name, m.name], text: `gleiche Meldung ${id} mehrfach; wird einmal geführt` });
    } else {
      befunde.push({ stufe: "fehler", regel: "I1-identitaet", dateien: [vorhanden.name, m.name], text: `Konflikt: gleiche meldung_id ${id}, anderer Inhalt` });
    }
  }
  for (const m of meldungen) {
    const k = m.daten?.kritis;
    if (!k?.bezug_meldung_id) continue;
    const ziel = nachId.get(k.bezug_meldung_id);
    if (!ziel) {
      befunde.push({ stufe: "hinweis", regel: "I2-bezug", dateien: [m.name], text: `Bezug ${k.bezug_meldung_id} ist im Satz nicht enthalten` });
      continue;
    }
    if (ziel === m) {
      befunde.push({ stufe: "fehler", regel: "I2-bezug", dateien: [m.name], text: "Meldung bezieht sich auf sich selbst" });
      continue;
    }
    if ((ziel.daten.meldende_stelle || "") !== (m.daten.meldende_stelle || "")) {
      befunde.push({ stufe: "warnung", regel: "I3-bezug-stelle", dateien: [ziel.name, m.name], text: "Bezug auf die Meldung einer anderen Stelle" });
    }
    if ((ziel.daten.meldezeitpunkt || "") > (m.daten.meldezeitpunkt || "")) {
      befunde.push({ stufe: "warnung", regel: "I4-bezug-zeit", dateien: [ziel.name, m.name], text: "bezogene Meldung ist jünger als die beziehende" });
    }
    const alte = new Set((ziel.daten.sachverhalte || []).map((s) => s.kennung).filter(Boolean));
    const neue = (m.daten.sachverhalte || []).map((s) => s.kennung).filter(Boolean);
    if (alte.size && !neue.some((x) => alte.has(x))) {
      befunde.push({ stufe: "warnung", regel: "I5-bezug-kennung", dateien: [ziel.name, m.name], text: "keine Sachverhaltskennung der bezogenen Meldung fortgeschrieben" });
    }
  }
  return befunde;
}
