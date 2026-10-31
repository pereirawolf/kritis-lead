// Baut die abgeleiteten Dateien des Profilpakets profil/lead-kritis aus den gepinnten Dateien von KI-LEAD (kern/lead-beispiel)
// und den Ergänzungen von KRITIS-LEAD (erweiterung/). Handgeschrieben bleiben profil.json, kontakte.json, README.md und CHANGELOG.md.
// Aufruf: node werkzeuge/bauen/profil-bauen.mjs [--pruefen]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const json = (p) => JSON.parse(lies(p));
const K = "kern/lead-beispiel";
const P = "profil/lead-kritis";
export const SOP = [
  "sop/A_Gemeinsame-Regeln.md",
  "sop/teil-b/B01_unwetter-sturm.md",
  "sop/teil-b/B08_stromausfall-blackout.md",
  "sop/teil-b/B10_trinkwasserversorgung.md",
  "sop/teil-b/B12_kritis-ausfall.md",
  "sop/teil-c/C11_telekommunikation-notruf-bos-warnfaehigkeit.md",
  "sop/teil-c/C12_kraftstoff-waerme.md",
];
/** Zwei Beispiele: Stand zum Zeitpunkt der Thüringer Ilka-Meldung (14.10.2026, 10:30) und der ganze Verlauf. */
export const BEISPIELE = [
  { ordner: "beispiele/sonneberg-stand-14-10", bis: "2026-10-14T10:30" },
  { ordner: "beispiele/sonneberg-verlauf", bis: "9999" },
];
const meldezeitpunkt = (text) => JSON.parse(text).meldezeitpunkt || "";

function baueUi() {
  const ui = json(`${K}/meldung.ui.json`);
  const erg = json("erweiterung/lead-kritis.ui.json");
  ui.titel = erg.titel;
  const i = ui.schritte.findIndex((s) => s.id === erg.schritt_nach);
  if (i < 0) throw new Error(`Schritt ${erg.schritt_nach} fehlt in der Darstellungsdatei`);
  ui.schritte.splice(i + 1, 0, ...erg.schritte);
  for (const [k, v] of Object.entries(erg.felder)) {
    if (k in ui.felder) throw new Error(`Feld ${k} gibt es in der Darstellungsdatei schon`);
    ui.felder[k] = v;
  }
  Object.assign(ui.rollen, erg.rollen);
  Object.assign(ui.lagebild, erg.lagebild);
  return JSON.stringify(ui, null, 2) + "\n";
}

export function erzeuge() {
  const d = new Map();
  d.set(`${P}/meldung.ui.json`, baueUi());
  d.set(`${P}/kodierleitfaden.md`, lies(`${K}/kodierleitfaden.md`).replace(/\s*$/, "\n") + lies("erweiterung/kodierleitfaden-anhang-k.md"));
  d.set(`${P}/anweisung-erfassung.md`, lies(`${K}/anweisung-erfassung.md`).replace(/\s*$/, "\n") + lies("erweiterung/anweisung-zusatz-erfassung.md"));
  d.set(`${P}/anweisung-verdichtung.md`, lies(`${K}/anweisung-verdichtung.md`).replace(/\s*$/, "\n") + lies("erweiterung/anweisung-zusatz-verdichtung.md"));
  d.set(`${P}/anweisung-kurzfassung.md`, lies(`${K}/anweisung-kurzfassung.md`));
  for (const s of SOP) d.set(`${P}/${s}`, lies(`${K}/${s}`));
  // Beispiele: Meldungen des Szenarios bis zum jeweiligen Stand und der unveränderte Ilka-Datensatz aus KI-LEAD
  const szenario = readdirSync(pfad("szenario/orkantief-ilka-sonneberg")).filter((n) => n.endsWith(".json")).sort();
  const ilka = readdirSync(pfad(`${K}/beispiele/orkantief-ilka`)).filter((n) => n.endsWith(".json")).sort();
  for (const b of BEISPIELE) {
    for (const n of szenario) {
      const t = lies(`szenario/orkantief-ilka-sonneberg/${n}`);
      if (meldezeitpunkt(t) <= b.bis) d.set(`${P}/${b.ordner}/${n}`, t);
    }
    for (const n of ilka) d.set(`${P}/${b.ordner}/ilka/${n}`, lies(`${K}/beispiele/orkantief-ilka/${n}`));
  }
  return d;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const d = erzeuge();
  if (process.argv.includes("--pruefen")) {
    const ab = [...d].filter(([p, t]) => !existsSync(pfad(p)) || readFileSync(pfad(p), "utf-8") !== t).map(([p]) => p);
    if (ab.length) {
      console.error(`Abweichend vom Bau: ${ab.join(", ")}. npm run bauen ausführen.`);
      process.exit(1);
    }
    console.log(`${d.size} Dateien des Profilpakets entsprechen dem Bau.`);
  } else {
    for (const o of ["sop", "beispiele"]) rmSync(pfad(`${P}/${o}`), { recursive: true, force: true });
    for (const [p, t] of d) {
      mkdirSync(pfad(p.split("/").slice(0, -1).join("/")), { recursive: true });
      writeFileSync(pfad(p), t);
    }
    console.log(`${d.size} Dateien des Profilpakets geschrieben.`);
  }
}
