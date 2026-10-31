// Baut die Beschreibung des Zielformats für Schnittstellen (etwa aus einem BCM-System) aus dem Profilschema:
//   schnittstelle/FELDREFERENZ.md       Feldreferenz zum Lesen (Felder, Typen, Pflicht, Werte, bedingte Regeln)
//   schnittstelle/felder.json           Feldverzeichnis maschinenlesbar, jedes Feld mit vollem Pfad
//   schnittstelle/felder.csv            dasselbe als Tabelle (UTF-8, Semikolon) für Zuordnungstabellen
//   schnittstelle/beispiel-minimal.json kleinste gültige Betreibermeldung, abgeleitet aus der ersten Szenariomeldung
// Maßgeblich bleibt das JSON-Schema; alle Dateien hier werden daraus abgeleitet und nicht von Hand bearbeitet.
// Schema und Darstellungsdatei werden aus ihren Quellen gebaut (wie npm run bauen), nicht aus den eingecheckten Dateien gelesen.
// Aufruf: node werkzeuge/bauen/schnittstelle-bauen.mjs [--pruefen]
// --pruefen schreibt nichts und endet mit Fehler, wenn eine eingecheckte Datei vom Bau abweicht.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { baueSchema, SCHEMA_ID, ZIEL as SCHEMA_DATEI } from "./schema-bauen.mjs";
import { erzeuge as erzeugeProfil } from "./profil-bauen.mjs";
import { pruefePlausibilitaet } from "../pruefen/plausibilitaet.mjs";

export const ORDNER = "schnittstelle";
export const DATEIEN = {
  referenz: `${ORDNER}/FELDREFERENZ.md`,
  felder: `${ORDNER}/felder.json`,
  csv: `${ORDNER}/felder.csv`,
  minimal: `${ORDNER}/beispiel-minimal.json`,
};
export const FORMAT_FELDVERZEICHNIS = "kritis-lead-feldverzeichnis/1";
const BASIS_BEISPIEL = "szenario/orkantief-ilka-sonneberg/01_netz_2026-10-13T22-45_erstmeldung.json";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");

/** Lesbare Formate zu Teilschemata; ein Muster, das auf eines davon passt, erhält dessen Namen (auch mit „oder leer“). */
const FORMATE = {
  kritis_wanduhr: "Wanduhrzeit JJJJ-MM-TTThh:mm",
  kritis_wanduhrOderLeer: "Wanduhrzeit JJJJ-MM-TTThh:mm oder leer",
  kritis_uuid: "URN-UUID urn:uuid:… in Kleinbuchstaben",
  kritis_text: "Text, nicht leer",
  kritis_zeitzone: "Zeitzone nach IANA, z. B. Europe/Berlin",
  datumOderLeer: "Datum JJJJ-MM-TT oder leer",
  datumOptionalZeitOderLeer: "Datum JJJJ-MM-TT oder Wanduhrzeit JJJJ-MM-TTThh:mm oder leer",
  kennung: "Sachverhaltskennung Präfix-JJJJMMTT-XXXX",
};
/** Namen für Bausteine (Teilschemata für Objekte, die an mehreren Stellen vorkommen). */
const BAUSTEINE = { kritis_messwert: "Messwert", zeichnung: "Zeichnung" };
const TYPEN = { string: "Text", number: "Zahl", integer: "ganze Zahl", boolean: "Wahrheitswert", null: "null", object: "Objekt", array: "Liste" };

const jsTyp = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "number" ? (Number.isInteger(v) ? "integer" : "number") : typeof v);

// ---------------------------------------------------------------------------------------------------------------
// Modell: Felder und Regeln aus dem Schema

function aufloesen(schema, roh, ort) {
  if (!roh?.$ref) return { k: roh || {}, def: null, ort };
  const def = roh.$ref.replace("#/$defs/", "");
  if (!schema.$defs?.[def]) throw new Error(`Verweis ${roh.$ref} ins Leere`);
  const { $ref, ...rest } = roh;
  return { k: { ...schema.$defs[def], ...rest }, def, ort: `#/$defs/${def}` };
}

function typenVon(k) {
  if (k.type) return [].concat(k.type);
  if ("const" in k) return [jsTyp(k.const)];
  if (k.enum) return [...new Set(k.enum.map(jsTyp))];
  if (k.properties) return ["object"];
  if (k.items) return ["array"];
  return [];
}

function musterKarte(schema) {
  const karte = new Map();
  for (const [name, text] of Object.entries(FORMATE)) {
    const m = schema.$defs?.[name]?.pattern;
    if (m) karte.set(m, text);
  }
  return karte;
}

function formatVon(k, def, muster) {
  if (def && FORMATE[def]) return FORMATE[def];
  if (!k.pattern) return null;
  if (muster.has(k.pattern)) return muster.get(k.pattern);
  if (k.pattern.startsWith("^$|")) {
    const rest = k.pattern.slice(3);
    const basis = muster.get(rest) ?? muster.get(rest.endsWith("$") ? rest : `${rest}$`);
    if (basis) return basis.endsWith(" oder leer") ? basis : `${basis} oder leer`;
  }
  if (k.pattern === "\\S") return "Text, nicht leer";
  return null;
}

function ohneLeer(o) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && !v.length)));
}

/** Beschreibt ein Teilschema (Feld oder Element einer Liste) ohne Kinder. */
function eigenschaften(k, def, muster) {
  const e = {
    typ: typenVon(k),
    konstante: "const" in k ? k.const : undefined,
    werte: k.enum,
    format: formatVon(k, def, muster),
    muster: k.pattern,
    minimum: k.minimum,
    maximum: k.maximum,
    min_laenge: k.minLength,
    min_eintraege: k.minItems,
    eindeutig: k.uniqueItems || undefined,
  };
  return e;
}

/**
 * Läuft durch das Schema und liefert alle Felder mit vollem Pfad (Listenelemente als „[]“) sowie alle bedingten Regeln
 * (if/then/else, not) mit dem Ort, an dem sie gelten. Bausteine werden voll aufgeklappt; zeile.baustein nennt das Teilschema.
 */
export function modell(schema, ui = null, kernSchema = null) {
  const muster = musterKarte(schema);
  const kernPfade = kernSchema ? new Set(modell(kernSchema).felder.map((f) => f.pfad)) : null;
  const felder = [];
  const regeln = new Map();
  const vorkommen = new Map();

  const merkeRegeln = (k, pfadHier, ort, def) => {
    (k.allOf || []).forEach((r, i) => {
      const o = `${ort}/allOf/${i}`;
      if (regeln.has(o)) return;
      const kennung = /^([A-Z]\d+-[a-z-]+):\s*/.exec(r.$comment || "");
      // Wie im Prüfwerkzeug: Regeln im obersten allOf ohne eigene Kennung heißen K-final (Pflichtfelder einer finalen Meldung)
      const baustein = def && BAUSTEINE[def] ? def : null;
      regeln.set(o, {
        kennung: kennung ? kennung[1] : ort === "#" ? "K-final" : null,
        pfad: baustein ? undefined : pfadHier,
        baustein,
        beschreibung: kennung ? r.$comment.slice(kennung[0].length) : r.$comment || null,
        schema: r,
      });
    });
  };

  const besuche = (roh, p, ortRoh, pflicht, zeigen) => {
    const { k, def, ort } = aufloesen(schema, roh, ortRoh);
    if (def && typenVon(k).includes("object")) vorkommen.set(def, (vorkommen.get(def) || 0) + 1);
    if (zeigen) {
      const zeile = { pfad: p, pflicht, ...eigenschaften(k, def, muster), beschreibung: k.description, baustein: def && k.properties ? def : undefined };
      if (k.properties && k.additionalProperties === false) zeile.weitere_felder = false;
      if (k.items) {
        const it = aufloesen(schema, k.items, `${ort}/items`);
        if (!it.k.properties) {
          const e = eigenschaften(it.k, it.def, muster);
          zeile.element = ohneLeer({ typ: e.typ, konstante: e.konstante, werte: e.werte, format: e.format, muster: e.muster, minimum: e.minimum, maximum: e.maximum });
          if (!zeile.beschreibung && it.k.description) zeile.beschreibung = it.k.description;
        } else zeile.element = { typ: ["object"] };
      }
      felder.push(zeile);
    }
    merkeRegeln(k, p, ort, def);
    if (k.properties)
      for (const [n, v] of Object.entries(k.properties)) besuche(v, p ? `${p}.${n}` : n, `${ort}/properties/${n}`, (k.required || []).includes(n), true);
    if (k.items) {
      const it = aufloesen(schema, k.items, `${ort}/items`);
      if (it.k.properties) besuche(k.items, `${p}[]`, `${ort}/items`, false, false);
    }
  };
  besuche(schema, "", "#", false, false);

  // Bezeichnungen aus der Darstellungsdatei (Felder mit „*“ als Platzhalter für einen Pfadabschnitt, Achsen des Lagenradars)
  if (ui) {
    const genau = ui.felder || {};
    const platzhalter = Object.entries(genau)
      .filter(([s]) => s.includes("*"))
      .map(([s, v]) => [new RegExp(`^${s.replace(/[.[\]]/g, "\\$&").replace(/\*/g, "[^.]+")}$`), v]);
    const achsen = new Map((ui.radare?.lagenradar?.achsen || []).map((a) => [`sachverhalte[].sofort.lagenradar.${a.key}`, a.label]));
    for (const f of felder) {
      const v = genau[f.pfad] || platzhalter.find(([re]) => re.test(f.pfad))?.[1];
      f.bezeichnung = v?.label || achsen.get(f.pfad);
    }
  }
  for (const f of felder) f.herkunft = !kernPfade ? undefined : kernPfade.has(f.pfad) ? "LEAD-Meldung-v1" : "lead-kritis";
  // Bausteine: Objekt-Teilschemata, die an mehreren Stellen vorkommen
  const bausteine = [...vorkommen].filter(([, n]) => n > 1).map(([d]) => d);
  for (const f of felder) if (f.baustein && !bausteine.includes(f.baustein)) delete f.baustein;

  return {
    felder: felder.map((f) =>
      ohneLeer({
        pfad: f.pfad,
        bezeichnung: f.bezeichnung,
        herkunft: f.herkunft,
        typ: f.typ,
        pflicht: f.pflicht,
        konstante: f.konstante,
        werte: f.werte,
        format: f.format,
        muster: f.muster,
        minimum: f.minimum,
        maximum: f.maximum,
        min_laenge: f.min_laenge,
        min_eintraege: f.min_eintraege,
        eindeutig: f.eindeutig,
        element: f.element,
        weitere_felder: f.weitere_felder,
        baustein: f.baustein,
        beschreibung: f.beschreibung,
      }),
    ),
    regeln: [...regeln.values()],
    bausteine,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Bedingte Regeln in Worten. Unbekannte Schlüsselwörter erscheinen als Schemafragment, damit nichts verloren geht.

const code = (t) => `\`${t}\``;
const wert = (v) => (v === "" ? "leer" : v === null ? "null" : typeof v === "string" ? `„${v}“` : JSON.stringify(v));
const typWort = (t) => [].concat(t).map((x) => ({ number: "eine Zahl", integer: "eine ganze Zahl", string: "ein Text", null: "null", object: "ein Objekt", array: "eine Liste", boolean: "ein Wahrheitswert" })[x] || x).join(" oder ");
const unter = (basis, n) => (basis ? `${basis}.${n}` : n);
const fragment = (s) => `Schemafragment ${code(JSON.stringify(s))}`;

function bedingung(s, basis) {
  const teile = [];
  const props = s.properties || {};
  for (const [n, sub] of Object.entries(props)) {
    const p = unter(basis, n);
    if ("const" in sub) teile.push(`${code(p)} = ${wert(sub.const)}`);
    else if (sub.enum) teile.push(`${code(p)} ist ${sub.enum.map(wert).join(" oder ")}`);
    else if (sub.type) teile.push(`${code(p)} ist ${typWort(sub.type)}`);
    else if (sub.pattern === "\\S") teile.push(`${code(p)} nicht leer`);
    else if (sub.properties || sub.required) teile.push(...bedingung(sub, p));
    else teile.push(`${code(p)}: ${fragment(sub)}`);
  }
  for (const n of s.required || []) if (!(n in props)) teile.push(`${code(unter(basis, n))} vorhanden`);
  if (s.anyOf) teile.push(`(${s.anyOf.map((a) => bedingung(a, basis).join(" und ")).join(" oder ")})`);
  for (const k of Object.keys(s)) if (!["properties", "required", "anyOf", "$comment"].includes(k)) teile.push(fragment({ [k]: s[k] }));
  return teile;
}

function wirkungen(s, basis, liste = []) {
  const eintrag = (p) => {
    let e = liste.find((x) => x.pfad === p);
    if (!e) liste.push((e = { pfad: p, angaben: [] }));
    return e;
  };
  const props = s.properties || {};
  for (const n of s.required || []) eintrag(unter(basis, n)).angaben.push("Pflicht");
  for (const [n, sub] of Object.entries(props)) {
    const p = unter(basis, n);
    for (const [k, v] of Object.entries(sub)) {
      if (k === "properties" || k === "required" || k === "not") continue;
      const a = eintrag(p).angaben;
      if (k === "const") a.push(v === "" ? "leer" : `= ${wert(v)}`);
      else if (k === "enum") a.push(`einer der Werte ${v.map(wert).join(", ")}`);
      else if (k === "type") a.push(v === "null" ? "null" : `${typWort(v)}`);
      else if ((k === "pattern" && v === "\\S") || (k === "minLength" && v === 1)) a.push("nicht leer");
      else if (k === "pattern") a.push(`entspricht ${code(v)}`);
      else if (k === "minItems") a.push(v === 1 ? "mindestens ein Eintrag" : `mindestens ${v} Einträge`);
      else if (k === "items") wirkungen(v, `${p}[]`, liste);
      else a.push(fragment({ [k]: v }));
    }
    if (sub.properties || sub.required) wirkungen({ properties: sub.properties, required: sub.required }, p, liste);
    if (sub.not) {
      if ("const" in sub.not && Object.keys(sub.not).length === 1) eintrag(p).angaben.push(sub.not.const === "" ? "nicht leer" : `≠ ${wert(sub.not.const)}`);
      else if (sub.not.required && Object.keys(sub.not).length === 1) for (const m of sub.not.required) eintrag(unter(p, m)).angaben.push("nicht zulässig");
      else eintrag(p).angaben.push(fragment({ not: sub.not }));
    }
  }
  if (s.not) {
    if (s.not.required && Object.keys(s.not).length === 1) for (const m of s.not.required) eintrag(unter(basis, m)).angaben.push("nicht zulässig");
    else eintrag(basis || "(Meldung)").angaben.push(fragment({ not: s.not }));
  }
  for (const k of Object.keys(s)) if (!["properties", "required", "not", "$comment"].includes(k)) eintrag(basis || "(Meldung)").angaben.push(fragment({ [k]: s[k] }));
  return liste;
}

/** Fasst Geschwisterfelder mit gleichen Angaben zusammen: `a.b` d1, d2, …: null */
function wirkungText(liste) {
  const gefiltert = liste.filter((e) => e.angaben.length);
  const gruppen = [];
  for (const e of gefiltert) {
    const text = [...new Set(e.angaben)].join(", ");
    const i = e.pfad.lastIndexOf(".");
    const eltern = i > 0 ? e.pfad.slice(0, i) : "";
    const name = e.pfad.slice(i + 1);
    const letzte = gruppen.at(-1);
    if (letzte && letzte.eltern === eltern && letzte.text === text && eltern) letzte.namen.push(name);
    else gruppen.push({ eltern, namen: [name], text, pfad: e.pfad });
  }
  return gruppen
    .map((g) => (g.namen.length > 1 ? `${code(g.eltern)} ${g.namen.map(code).join(", ")}: ${g.text}` : `${code(g.pfad)}: ${g.text}`))
    .join("; ");
}

export function regelInWorten(r) {
  const s = r.schema;
  const basis = r.baustein ? "" : r.pfad;
  const teile = {};
  if (s.if) {
    const b = bedingung(s.if, basis);
    teile.wenn = b.length ? b.join(" und ") : "immer";
    if (s.then) teile.dann = wirkungText(wirkungen(s.then, basis));
    if (s.else) teile.sonst = wirkungText(wirkungen(s.else, basis));
  } else {
    const { $comment, ...rest } = s;
    teile.immer = wirkungText(wirkungen(rest, basis));
  }
  return teile;
}

// ---------------------------------------------------------------------------------------------------------------
// Minimalbeispiel: aus der ersten Szenariomeldung jedes Feld entfernen, ohne das die Meldung gültig bleibt
// und keine neuen Plausibilitätsbefunde erhält.

export function minimalbeispiel(schema, meldung) {
  const ajv = new Ajv2020({ allErrors: false, strict: false });
  const gueltig = ajv.compile(schema);
  const befunde = (m) => new Set(pruefePlausibilitaet(m).map((b) => `${b.regel}|${b.pfad}|${b.stufe}`));
  const start = structuredClone(meldung);
  if (!gueltig(start)) throw new Error(`${BASIS_BEISPIEL} ist nicht gültig: ${ajv.errorsText(gueltig.errors)}`);
  const vorher = befunde(start);
  const passt = (m) => gueltig(m) && [...befunde(m)].every((b) => vorher.has(b));
  const kuerze = (eltern) => {
    for (const n of Object.keys(eltern)) {
      const v = eltern[n];
      delete eltern[n];
      if (passt(start)) continue;
      eltern[n] = v;
      if (Array.isArray(v)) v.forEach((x) => x && typeof x === "object" && kuerze(x));
      else if (v && typeof v === "object") kuerze(v);
    }
  };
  // Reihenfolge der Schlüssel erhalten: kuerze entfernt und setzt wieder ein; danach nach Vorlage ordnen
  kuerze(start);
  const ordne = (vorlage, ziel) => {
    if (Array.isArray(ziel)) return ziel.map((x, i) => ordne(vorlage[i], x));
    if (!ziel || typeof ziel !== "object") return ziel;
    return Object.fromEntries(Object.keys(vorlage).filter((k) => k in ziel).map((k) => [k, ordne(vorlage[k], ziel[k])]));
  };
  return ordne(meldung, start);
}

// ---------------------------------------------------------------------------------------------------------------
// Ausgaben

const zelle = (t) => String(t ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const typText = (f) => {
  const t = (f.typ || []).map((x) => TYPEN[x] || x);
  if (f.element) return `Liste aus ${(f.element.typ || []).map((x) => TYPEN[x] || x).join(" oder ") || "Werten"}`;
  return t.join(" oder ");
};
function werteText(f, md = true) {
  const c = md ? code : (t) => t;
  const t = [];
  const quelle = f.element || f;
  if ("konstante" in quelle) t.push(`immer ${quelle.konstante === "" ? "leer" : md ? c(JSON.stringify(quelle.konstante)) : String(quelle.konstante)}`);
  if (quelle.werte) t.push(quelle.werte.map((w) => (w === "" ? "leer" : md ? c(JSON.stringify(w)) : String(w))).join(md ? ", " : " | "));
  if (quelle.format) t.push(quelle.format);
  else if (quelle.muster) t.push(`Muster ${c(quelle.muster)}`);
  if (quelle.minimum !== undefined || quelle.maximum !== undefined) t.push(`${quelle.minimum ?? "…"} bis ${quelle.maximum ?? "…"}`);
  if (f.min_laenge) t.push("nicht leer");
  if (f.min_eintraege) t.push(f.min_eintraege === 1 ? "mindestens ein Eintrag" : `mindestens ${f.min_eintraege} Einträge`);
  if (f.eindeutig) t.push("ohne Wiederholung");
  if (f.weitere_felder === false && !f.baustein) t.push("keine weiteren Felder");
  return t.join("; ");
}

function tabelle(felder, basis, bausteinName) {
  const kopf = "| Feld | Bezeichnung | Typ | Pflicht | Werte, Format | Erläuterung |\n|---|---|---|---|---|---|";
  const zeilen = felder.map((f) => {
    const rel = basis && f.pfad.startsWith(`${basis}.`) ? f.pfad.slice(basis.length + 1) : f.pfad;
    const werte = f.baustein ? `Baustein ${bausteinName(f.baustein)}` : werteText(f);
    const teil = f.herkunft === "lead-kritis" ? " ᴱ" : "";
    return `| ${code(rel)}${teil} | ${zelle(f.bezeichnung)} | ${zelle(typText(f))} | ${f.pflicht ? "ja" : "nein"} | ${zelle(werte)} | ${zelle(f.beschreibung)} |`;
  });
  return `${kopf}\n${zeilen.join("\n")}`;
}

function referenzMarkdown(m, schema, ui, minimal) {
  const name = (d) => BAUSTEINE[d] || d;
  // Felder unterhalb eines Bausteins nur einmal im Abschnitt „Bausteine“
  const verdeckt = (f) => m.felder.some((g) => g.baustein && f.pfad.startsWith(`${g.pfad}.`));
  const sichtbar = m.felder.filter((f) => !verdeckt(f));
  const anzahlE = m.felder.filter((f) => f.herkunft === "lead-kritis").length;

  // Abschnitte: Meldung (oberste Ebene und kleine Blöcke), große Blöcke der obersten Ebene, Erweiterungsblöcke in Kernobjekten
  const kinder = (p) => sichtbar.filter((f) => f.pfad.startsWith(`${p}.`) || f.pfad.startsWith(`${p}[].`));
  const wurzeln = sichtbar.filter((f) => !f.pfad.includes("."));
  const gross = wurzeln.filter((f) => kinder(f.pfad).length > 8).map((f) => f.pfad);
  const eingebettet = sichtbar
    .filter((f) => f.herkunft === "lead-kritis" && f.typ?.includes("object") && !f.baustein)
    .filter((f) => {
      const eltern = sichtbar.find((g) => f.pfad.startsWith(`${g.pfad}.`) || f.pfad.startsWith(`${g.pfad}[].`));
      return eltern && eltern.herkunft !== "lead-kritis" && kinder(f.pfad).length > 8;
    })
    .map((f) => f.pfad);
  const abschnitt = (f) => {
    const e = eingebettet.find((p) => f.pfad === p || f.pfad.startsWith(`${p}.`));
    if (e && f.pfad !== e) return e;
    const g = gross.find((p) => f.pfad.startsWith(`${p}.`) || f.pfad.startsWith(`${p}[].`));
    return g || "";
  };
  const gruppen = new Map([["", []], ...gross.map((p) => [p, []]), ...eingebettet.map((p) => [p, []])]);
  for (const f of sichtbar) gruppen.get(abschnitt(f)).push(f);
  const basisVon = (p) => (sichtbar.find((f) => f.pfad === p)?.typ?.includes("array") ? `${p}[]` : p);

  const out = [];
  out.push(`# Feldreferenz ${SCHEMA_ID}`);
  out.push("");
  out.push(
    "> Erzeugt von `werkzeuge/bauen/schnittstelle-bauen.mjs` aus dem Profilschema und der Darstellungsdatei; nicht von Hand bearbeiten. " +
      `Maßgeblich ist das JSON-Schema [${SCHEMA_DATEI}](../${SCHEMA_DATEI}). Anleitung für Schnittstellen: [docs/SCHNITTSTELLE.md](../docs/SCHNITTSTELLE.md).`,
  );
  out.push("");
  out.push(
    `Schemakennung \`${SCHEMA_ID}\` (Feld \`schema\`), JSON Schema Draft 2020-12. ${m.felder.length} Felder, davon ${anzahlE} aus der Erweiterung ` +
      "`lead-kritis` (mit ᴱ gekennzeichnet), die übrigen aus dem Kernschema LEAD-Meldung-v1. Pfade nennen Listenelemente mit `[]`; " +
      "„Pflicht“ heißt: Das Feld muss im übergeordneten Objekt stehen. Was nur unter einer Bedingung gilt, steht unter „Bedingte Regeln“. " +
      "Objekte nehmen keine Felder auf, die hier nicht stehen.",
  );
  for (const [p, felder] of gruppen) {
    if (!felder.length) continue;
    out.push("");
    if (!p) out.push("## Meldung");
    else {
      const f = sichtbar.find((x) => x.pfad === p);
      out.push(`## ${f?.bezeichnung ? `${f.bezeichnung}: ` : ""}\`${basisVon(p)}\``);
    }
    out.push("");
    out.push(tabelle(felder, p ? basisVon(p) : "", name));
  }
  if (m.bausteine.length) {
    out.push("", "## Bausteine", "");
    out.push("Teilschemata, die an mehreren Stellen vorkommen. Die Pfade unten gelten relativ zur jeweiligen Stelle.");
    for (const d of m.bausteine) {
      const erste = m.felder.find((f) => f.baustein === d);
      const stellen = m.felder.filter((f) => f.baustein === d).map((f) => code(f.pfad));
      out.push("", `### ${name(d)} (\`$defs/${d}\`)`, "");
      out.push(`Vorkommen: ${stellen.join(", ")}.`, "");
      const teil = m.felder.filter((f) => f.pfad.startsWith(`${erste.pfad}.`) && !m.felder.some((g) => g !== erste && g.baustein && g.pfad.startsWith(`${erste.pfad}.`) && f.pfad.startsWith(`${g.pfad}.`)));
      out.push(tabelle(teil, erste.pfad, name));
    }
  }
  out.push("", "## Bedingte Regeln", "");
  out.push("Regeln, die von Werten anderer Felder abhängen. Die Kennungen R1 bis R4 sind die Rollenregeln der Erweiterung; Prüfwerkzeug und Konformitätsfälle verwenden sie.");
  out.push("");
  for (const r of m.regeln) {
    const t = regelInWorten(r);
    const kopf = r.kennung;
    const ort = r.baustein ? `jeder ${name(r.baustein)}` : r.pfad ? code(r.pfad) : "Meldung";
    const satz = [];
    if (r.beschreibung) satz.push(r.beschreibung.replace(/\s*$/, ""));
    if (t.wenn && t.dann) satz.push(`Wenn ${t.wenn}: ${t.dann}.${t.sonst ? ` Sonst: ${t.sonst}.` : ""}`);
    else if (t.wenn && t.sonst) satz.push(`Außer wenn ${t.wenn}: ${t.sonst}.`);
    if (t.immer) satz.push(`Immer: ${t.immer}.`);
    out.push(`- ${kopf ? `**${kopf}** ` : ""}(${ort}) ${satz.join(" ")}`);
  }
  const praefixe = ui?.kennung?.praefixe;
  if (praefixe) {
    out.push("", "## Präfixe der Sachverhaltskennung", "");
    out.push(`Aus der Darstellungsdatei (\`kennung.praefixe\`); ohne Land: \`${ui.kennung.standard || "DE"}\`.`, "");
    out.push("| Land | Präfix |\n|---|---|");
    for (const [l, p] of Object.entries(praefixe)) out.push(`| ${l} | \`${p}\` |`);
  }
  out.push("", "## Maschinenlesbare Fassungen", "");
  out.push(`- [${SCHEMA_DATEI}](../${SCHEMA_DATEI}): JSON-Schema, maßgeblich für die Prüfung`);
  out.push(`- [felder.json](felder.json): Feldverzeichnis (Format \`${FORMAT_FELDVERZEICHNIS}\`), jedes Feld mit vollem Pfad, Bausteine aufgeklappt, Regeln in Worten`);
  out.push("- [felder.csv](felder.csv): dasselbe als Tabelle (UTF-8, Semikolon) als Ausgangspunkt einer Zuordnungstabelle");
  out.push(`- [beispiel-minimal.json](beispiel-minimal.json): kleinste gültige Betreibermeldung (${Object.keys(minimal).length} Felder auf oberster Ebene), abgeleitet aus [${BASIS_BEISPIEL.split("/").pop()}](../${BASIS_BEISPIEL})`);
  return out.join("\n") + "\n";
}

function feldverzeichnis(m) {
  return {
    format: FORMAT_FELDVERZEICHNIS,
    schema: SCHEMA_ID,
    hinweis:
      `Abgeleitet aus ${SCHEMA_DATEI} durch werkzeuge/bauen/schnittstelle-bauen.mjs; nicht von Hand bearbeiten. Maßgeblich ist das JSON-Schema. ` +
      "pfad nennt Listenelemente mit []; pflicht gilt im übergeordneten Objekt; bedingte Anforderungen stehen unter regeln.",
    felder: m.felder,
    bausteine: m.bausteine.map((d) => ({ name: d, bezeichnung: BAUSTEINE[d] || d, vorkommen: m.felder.filter((f) => f.baustein === d).map((f) => f.pfad) })),
    regeln: m.regeln.map((r) => ohneLeer({ kennung: r.kennung, pfad: r.pfad, baustein: r.baustein, beschreibung: r.beschreibung, ...regelInWorten(r) })),
  };
}

function csv(m) {
  const feld = (v) => {
    const t = String(v ?? "");
    return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const kopf = ["Pfad", "Bezeichnung", "Herkunft", "Typ", "Pflicht", "Werte, Format", "Baustein", "Erläuterung"];
  const zeilen = m.felder.map((f) => [f.pfad, f.bezeichnung, f.herkunft, typText(f), f.pflicht ? "ja" : "nein", werteText(f, false), f.baustein ? BAUSTEINE[f.baustein] || f.baustein : "", f.beschreibung].map(feld).join(";"));
  return "﻿" + [kopf.join(";"), ...zeilen].join("\r\n") + "\r\n";
}

export function erzeuge() {
  const schema = baueSchema();
  const ui = JSON.parse(erzeugeProfil().get("profil/lead-kritis/meldung.ui.json"));
  const kern = JSON.parse(lies("kern/LEAD-Meldung-v1.schema.json"));
  const m = modell(schema, ui, kern);
  const minimal = minimalbeispiel(schema, JSON.parse(lies(BASIS_BEISPIEL)));
  const d = new Map();
  d.set(DATEIEN.referenz, referenzMarkdown(m, schema, ui, minimal));
  d.set(DATEIEN.felder, JSON.stringify(feldverzeichnis(m), null, 2) + "\n");
  d.set(DATEIEN.csv, csv(m));
  d.set(DATEIEN.minimal, JSON.stringify(minimal, null, 2) + "\n");
  return d;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const d = erzeuge();
  if (process.argv.includes("--pruefen")) {
    const ab = [...d].filter(([p, t]) => !existsSync(pfad(p)) || readFileSync(pfad(p), "utf-8") !== t).map(([p]) => p);
    if (ab.length) {
      console.error(`Beschreibung des Zielformats weicht vom Schema ab: ${ab.join(", ")}. npm run bauen ausführen (im Pull Request erledigt das der Workflow „Bau nachziehen“).`);
      process.exit(1);
    }
    console.log(`${d.size} Dateien der Schnittstellenbeschreibung entsprechen dem Schema.`);
  } else {
    mkdirSync(pfad(ORDNER), { recursive: true });
    for (const [p, t] of d) writeFileSync(pfad(p), t);
    console.log(`${d.size} Dateien der Schnittstellenbeschreibung geschrieben (${ORDNER}/).`);
  }
}
