// Farben von Betreiberformular und Seiten aus dem Grunddesign der App-Familie (seit 0.3.5, Regeln LD-F01 bis LD-F06):
// Farbrollen aus dem Katalog der Farbschemata, Signalfarben nach hell, dunkel und Kontrast, beides aus den gepinnten
// Tokens in kern/design/ (KI-LEAD, Grunddesign Fassung 1.0). Welches Schema gilt, bestimmt das Profil lead-kritis
// (farbschema.basis, einzelne Rollen in farbschema.farben). Das Stylesheet formular/quelle/stil.css setzt keine
// Farbwerte mehr, nur Farbrollen.
//
// Ohne Wahl unter „Einstellungen → Darstellung“ wählt der Browser nach den Systemeinstellungen („Automatisch“): hell das
// Schema des Profils (oder „Neutral · Hell“, wenn es dunkel ist), dunkel „Neutral · Night Mode“ (oder das Profilschema,
// wenn es dunkel ist), bei „mehr Kontrast“ „Kontrast · Hell“ bzw. „Kontrast · Dunkel“. Das gilt auch ohne JavaScript.
// Seit 0.3.6 lässt sich dort wie in KI-LEAD jedes Schema des Katalogs oder „Farben des Profils“ fest wählen; dafür
// enthält das CSS je Schema einen Block [data-farbschema="<Kennung>"] (werkzeuge/bauen/darstellung.mjs setzt das Attribut).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const json = (p) => JSON.parse(readFileSync(pfad(p), "utf-8"));
const ERW = "de.pereirawolf.lead-design";
const HEX = /^#[0-9A-Fa-f]{6}$/;

export const TOKENS = json("kern/design/lead-design.tokens.json");
export const KATALOG = json("kern/design/lead-farbschemata.tokens.json");

/** Namen der Farbrollen und Signalfarben in der Reihenfolge der Tokens */
export const ROLLEN = Object.keys(TOKENS.farbrolle).filter((k) => !k.startsWith("$"));
export const SIGNALE = Object.keys(TOKENS.signal).filter((k) => !k.startsWith("$"));

/** Kontrastpaare wie in KI-LEAD (src/darstellung/thema.ts, KONTRASTPAARE): Vordergrund, Hintergrund, Mindestwert */
export const KONTRASTPAARE = [
  ["tinte", "flaeche", 4.5],
  ["tinte", "papier", 4.5],
  ["tinte-leise", "flaeche", 4.5],
  ["tinte-leise", "papier", 4.5],
  ["link", "flaeche", 4.5],
  ["link", "papier", 4.5],
  ["auf-amt", "amt", 4.5],
  ["auf-amt-hover", "amt-tief", 4.5],
  ["auswahl-text", "amt-zart", 4.5],
  ["amt-tief", "amt-zart", 4.5],
  ["amt-tief", "flaeche", 4.5],
  ["eingabe-rand", "flaeche", 3],
  ["auswahl-rand", "flaeche", 3],
  ["fokus", "flaeche", 3],
  ["fokus", "papier", 3],
  ["header-text", "header-hintergrund", 4.5],
  ["lese-farbe", "lese-flaeche", 4.5],
  ["kritisch", "flaeche", 4.5],
  ["erheblich", "flaeche", 4.5],
  ["gering", "flaeche", 4.5],
  ["ok", "flaeche", 4.5],
  ["auf-erheblich", "erheblich", 4.5],
];

const kanal = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const leuchtdichte = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * kanal((n >> 16) & 255) + 0.7152 * kanal((n >> 8) & 255) + 0.0722 * kanal(n & 255);
};
/** Kontrastverhältnis nach WCAG 2.x */
export function kontrast(a, b) {
  const [h, d] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
  return (h + 0.05) / (d + 0.05);
}

const info = (id) => {
  const s = KATALOG[id];
  if (!s || id.startsWith("$")) throw new Error(`Farbschema „${id}“ steht nicht im Katalog des Grunddesigns`);
  return s.$extensions[ERW];
};

/** Bandverlauf aus gleich breiten Streifen, wie bandVerlauf in KI-LEAD; ohne Bandfarben „none“ */
export function bandVerlauf(band) {
  const farben = band.filter((f) => HEX.test(f));
  if (!farben.length) return "none";
  const p = (i) => `${((i * 100) / farben.length).toFixed(2)}%`;
  return `linear-gradient(90deg, ${farben.map((f, i) => `${f} ${p(i)} ${p(i + 1)}`).join(", ")})`;
}

const teil = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
const farbAbstand = (a, b) => Math.max(...[0, 1, 2].map((i) => Math.abs(teil(a, i) - teil(b, i))));
const mischen = (a, b, anteil) =>
  "#" + [0, 1, 2].map((i) => Math.round(teil(a, i) * anteil + teil(b, i) * (1 - anteil)).toString(16).padStart(2, "0")).join("").toUpperCase();

/** Hebt eine Bandfarbe, die wie Kopf oder Seitengrund aussieht (meist Weiß), durch leichte Tönung ab, wie bandAbheben in KI-LEAD */
function bandAbheben(t, band) {
  const kopf = t["header-hintergrund"] ?? t.flaeche;
  const grund = [kopf, t.papier];
  if (!band.some((f) => HEX.test(f) && grund.some((g) => farbAbstand(f, g) <= 16))) return t;
  const kopfAnteil = kopf === t.papier ? 0.06 : 0.07;
  return { ...t, "header-hintergrund": mischen(t.amt, kopf, kopfAnteil), papier: mischen(t.amt, t.papier, 0.06) };
}

/**
 * Werte eines Farbschemas: alle Farbrollen (mit Profilfarben, falls angegeben), die Signalfarben seiner Stufe
 * (hell, dunkel, kontrast-hell, kontrast-dunkel) und das Band.
 */
export function schemaWerte(id, farben = {}) {
  const { modus, signal, band } = info(id);
  const s = KATALOG[id];
  let rollen = Object.fromEntries(ROLLEN.map((r) => [r, (farben[r] ?? s[r].$value).toUpperCase()]));
  const bandFarben = Object.keys(farben).some((r) => r.startsWith("marke-akzent-")) ? [1, 2, 3].map((i) => rollen[`marke-akzent-${i}`]) : band;
  rollen = bandAbheben(rollen, bandFarben);
  const signale = Object.fromEntries(
    SIGNALE.map((n) => {
      const t = TOKENS.signal[n];
      return [n, (signal === "hell" ? t.$value : t.$extensions[ERW].modi[signal]).toUpperCase()];
    }),
  );
  return { id, modus, kontrastziel: info(id).kontrastziel, werte: { ...rollen, ...signale }, band: bandVerlauf(bandFarben) };
}

/** Prüft die Kontrastpaare eines Schemas (Text auf das Ziel des Schemas angehoben); leer heißt erfüllt */
export function kontrastFehler({ id, werte, kontrastziel }) {
  return KONTRASTPAARE.flatMap(([v, h, grund]) => {
    const min = grund >= 4.5 ? Math.max(grund, kontrastziel) : grund;
    const k = kontrast(werte[v], werte[h]);
    return k < min ? [`${id}: „${v}“ auf „${h}“ ${k.toFixed(2)}:1, mindestens ${min}:1`] : [];
  });
}

/** Kennungen aller Schemata des Katalogs in seiner Reihenfolge (Neutral, Kontrast, Bund, Länder) */
export const KENNUNGEN = Object.keys(KATALOG).filter((k) => !k.startsWith("$"));

/** Name, Gruppe und Modus eines Schemas des Katalogs */
export const eintrag = (id) => ({ id, name: KATALOG[id].$description, ...info(id) });

/** Auswahl „Automatisch (wie Gerät)“ und „Farben des Profils“ unter „Einstellungen → Darstellung“ (seit 0.3.6), wie in KI-LEAD */
export const AUTOMATISCH = "automatisch";
export const PROFIL = "profil";

/** Anzeigename des Profilschemas wie in KI-LEAD (ausProfil in src/darstellung/thema.ts) */
export const profilName = (farbschema) => farbschema.name?.trim() || (farbschema.farben && Object.keys(farbschema.farben).length ? `Profilfarben (Basis: ${eintrag(farbschema.basis).name})` : eintrag(farbschema.basis).name);

/** Die vier Schemata, zwischen denen der Browser wählt, für ein Farbschema aus dem Profil */
export function schemata(farbschema) {
  if (!farbschema?.basis) throw new Error("Das Profil lead-kritis nennt kein farbschema.basis (Grunddesign LD-F01)");
  const unbekannt = Object.keys(farbschema.farben ?? {}).filter((r) => !ROLLEN.includes(r) || !HEX.test(farbschema.farben[r]));
  if (unbekannt.length) throw new Error(`farbschema.farben: unbekannte Rolle oder kein #RRGGBB: ${unbekannt.join(", ")}`);
  const profil = schemaWerte(farbschema.basis, farbschema.farben);
  return {
    hell: profil.modus === "hell" ? profil : schemaWerte("neutral-hell"),
    dunkel: profil.modus === "dunkel" ? profil : schemaWerte("neutral-dunkel"),
    "kontrast-hell": schemaWerte("kontrast-hell"),
    "kontrast-dunkel": schemaWerte("kontrast-dunkel"),
  };
}

const block = ({ id, modus, werte, band }, titel = KATALOG[id].$description) =>
  [`/* ${titel} */`, ...Object.entries(werte).map(([k, v]) => `--${k}: ${v};`), `--band: ${band};`, `color-scheme: ${modus === "dunkel" ? "dark" : "light"};`]
    .map((z) => `  ${z}`)
    .join("\n");

/**
 * Alle Schemata, die unter „Einstellungen → Darstellung“ fest wählbar sind: jedes Schema des Katalogs und unter
 * „profil“ das Farbschema des Profils mit seinen Rollen (LD-F02: ganzer Katalog, Kennungen und Werte unverändert).
 */
export function waehlbar(farbschema) {
  schemata(farbschema);
  return [...KENNUNGEN.map((id) => [id, schemaWerte(id)]), [PROFIL, schemaWerte(farbschema.basis, farbschema.farben)]];
}

/**
 * CSS mit den Farbrollen für das Farbschema des Profils. Wirft, wenn ein Schema die Kontraste verfehlt: Ein Profil
 * mit unlesbaren Farben wird nicht gebaut (LD-F03).
 */
export function farbCss(farbschema) {
  const s = schemata(farbschema);
  const wahl = waehlbar(farbschema);
  const fehler = [...Object.values(s), ...wahl.map(([, w]) => w)].flatMap(kontrastFehler);
  if (fehler.length) throw new Error(`Kontraste verfehlt (Grunddesign LD-F03):\n${[...new Set(fehler)].join("\n")}`);
  return [
    `/* Farben aus dem Grunddesign der App-Familie, Fassung ${JSON.parse(readFileSync(pfad("kern/design/quelle.json"), "utf-8")).fassung}; Farbschema des Profils: ${farbschema.basis}. Erzeugt mit werkzeuge/bauen/farben.mjs, nicht von Hand ändern. */`,
    `:root {\n${block(s.hell)}\n}`,
    `@media (prefers-color-scheme: dark) {\n:root {\n${block(s.dunkel)}\n}\n}`,
    `@media (prefers-contrast: more) {\n:root {\n${block(s["kontrast-hell"])}\n}\n}`,
    `@media (prefers-contrast: more) and (prefers-color-scheme: dark) {\n:root {\n${block(s["kontrast-dunkel"])}\n}\n}`,
    // Feste Wahl unter „Einstellungen → Darstellung“ (seit 0.3.6): geht den Systemeinstellungen vor, wie in KI-LEAD;
    // erzwungene Farben des Systems gehen weiter allem vor. Ohne Elementnamen, damit auch die Vorschau im Dialog sie nutzt.
    ...wahl.map(([id, w]) => `[data-farbschema="${id}"] {\n${block(w, id === PROFIL ? `Farben des Profils: ${profilName(farbschema)}` : undefined)}\n}`),
  ].join("\n");
}

/** Farbschema aus dem Profilmanifest */
export const profilFarbschema = () => json("profil/lead-kritis/profil.json").farbschema;
