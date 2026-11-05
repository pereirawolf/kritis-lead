// Prüfwerkzeug KRITIS-LEAD für LEAD-Meldung-v2: Schema mit Rollenregeln (Ajv als Referenzprüfer, Schema aus
// formate/lead-kritis-v2/), Plausibilität und Nachrichtenidentität über einen Satz von Meldungen.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { ZIEL } from "../../bauen/schema-v2-bauen.mjs";
import { pruefePlausibilitaet } from "./plausibilitaet.mjs";

const pfad = (p) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));
export const ladeSchema = () => JSON.parse(readFileSync(pfad(ZIEL), "utf-8"));

let pruefer;
function holePruefer() {
  if (!pruefer) {
    const schema = ladeSchema();
    const ajv = new Ajv2020({ allErrors: true, strict: false, verbose: true });
    pruefer = { validate: ajv.compile(schema), regeln: regelKarte(schema) };
  }
  return pruefer;
}

/** Ordnet jedem Teilschema der Rollenregeln (oberstes allOf mit Kennung im $comment) seine Regel zu, sonst „Schema“. */
function regelKarte(schema) {
  const karte = new Map();
  const merke = (s, regel) => {
    if (!s || typeof s !== "object") return;
    if (!Array.isArray(s)) karte.set(s, regel);
    for (const v of Object.values(s)) merke(v, regel);
  };
  for (const r of schema.allOf || []) {
    const k = /^(R\d+-[a-z-]+):/.exec(r.$comment || "");
    if (k) merke(r, k[1]);
  }
  return karte;
}

/** Prüft eine einzelne Meldung (bereits geparst). */
export function pruefeMeldung(daten) {
  const { validate, regeln } = holePruefer();
  const gueltig = validate(daten);
  const befunde = (validate.errors || [])
    .filter((f) => f.keyword !== "if")
    .map((f) => ({ stufe: "fehler", regel: regeln.get(f.parentSchema) || "Schema", pfad: f.instancePath || "/", text: f.message, keyword: f.keyword }));
  const rolle = daten?.absender?.ebene === "Betreiber" ? "Betreiber" : "Behörde";
  const plausibel = gueltig ? pruefePlausibilitaet(daten) : [];
  return { gueltig: Boolean(gueltig), rolle, befunde: [...befunde, ...plausibel] };
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

/** Prüft die Nachrichtenidentität über einen Satz von Meldungen [{name, daten}] (meldung_id, beziehungen). */
export function pruefeSatz(meldungen) {
  const befunde = [];
  const nachId = new Map();
  for (const m of meldungen) {
    const id = m.daten?.meldung_id;
    if (!id) continue;
    const vorhanden = nachId.get(id);
    if (!vorhanden) nachId.set(id, m);
    else if (kanonisch(vorhanden.daten) === kanonisch(m.daten))
      befunde.push({ stufe: "hinweis", regel: "I1-identitaet", dateien: [vorhanden.name, m.name], text: `gleiche Meldung ${id} mehrfach; wird einmal geführt` });
    else befunde.push({ stufe: "fehler", regel: "I1-identitaet", dateien: [vorhanden.name, m.name], text: `Konflikt: gleiche meldung_id ${id}, anderer Inhalt` });
  }
  for (const m of meldungen) {
    for (const b of m.daten?.beziehungen || []) {
      const ziel = nachId.get(b.meldung_id);
      if (!ziel) {
        befunde.push({ stufe: "hinweis", regel: "I2-bezug", dateien: [m.name], text: `Bezug ${b.meldung_id} ist im Satz nicht enthalten` });
        continue;
      }
      if (ziel === m) {
        befunde.push({ stufe: "fehler", regel: "I2-bezug", dateien: [m.name], text: "Meldung bezieht sich auf sich selbst" });
        continue;
      }
      if ((ziel.daten.absender?.stelle || "") !== (m.daten.absender?.stelle || ""))
        befunde.push({ stufe: "warnung", regel: "I3-bezug-stelle", dateien: [ziel.name, m.name], text: "Bezug auf die Meldung einer anderen Stelle" });
      if (Date.parse(ziel.daten.meldezeitpunkt) > Date.parse(m.daten.meldezeitpunkt))
        befunde.push({ stufe: "warnung", regel: "I4-bezug-zeit", dateien: [ziel.name, m.name], text: "bezogene Meldung ist jünger als die beziehende" });
      const alte = new Set((ziel.daten.sachverhalte || []).map((s) => s.kennung).filter(Boolean));
      const neue = (m.daten.sachverhalte || []).map((s) => s.kennung).filter(Boolean);
      if (alte.size && !neue.some((x) => alte.has(x)))
        befunde.push({ stufe: "warnung", regel: "I5-bezug-kennung", dateien: [ziel.name, m.name], text: "keine Sachverhaltskennung der bezogenen Meldung fortgeschrieben" });
    }
  }
  return befunde;
}
