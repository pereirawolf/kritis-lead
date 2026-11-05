#!/usr/bin/env node
// Pin-Abstand zu KI-LEAD: meldet, ob die gepinnten Kopien noch dem aktuellen Stand von KI-LEAD entsprechen – in beide Richtungen.
//   1. kern/quelle.json: Ist jede Kopie aus KI-LEAD noch gleich der Datei auf main von KI-LEAD? Abweichungen sind ein Abstand.
//      kern/design/quelle.json: Die Design Tokens sind bewusst auf eine Fassung des Grunddesigns gepinnt (docs/design-abweichungen.md);
//      eine Abweichung ist ein Hinweis, kein Abstand.
//   2. Gegenrichtung: Bettet KI-LEAD die Module von KRITIS-LEAD (formate/lead-kritis-v2/module/) in der aktuellen Fassung ein
//      (formate/fremd/kritis-lead/herkunft.json)? Solange es die Einbettung nicht gibt, ist das ein Hinweis, kein Abstand.
// Das Werkzeug ändert nichts. Ein neuer Stand wird bewusst übernommen (kern/README.md) und in CHANGELOG.md eingetragen.
//
// Aufruf: node werkzeuge/pruefen/pin-abstand.mjs [--ki-lead-dir <Klon>] [--ref <Branch>]
//   ohne --ki-lead-dir: Dateien von raw.githubusercontent.com (öffentliches Repository pereirawolf/ki-lead, Vorgabe main)
// Ausgabe: Bericht als Markdown (auch in $GITHUB_STEP_SUMMARY); Exit-Code 1 bei Abstand, 2 bei Fehlern beim Abruf.
import { createHash } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const WURZEL = fileURLToPath(new URL("../../", import.meta.url));
export const MODULE = ["lead-kritis-meldung", "lead-kritis-betrieb"].map((n) => `formate/lead-kritis-v2/module/${n}.schema.json`);
export const HERKUNFT = "formate/fremd/kritis-lead/herkunft.json";
const PINS = [
  { datei: "kern/quelle.json", abstand: true },
  { datei: "kern/design/quelle.json", abstand: false },
];
const sha256 = (daten) => createHash("sha256").update(daten).digest("hex");
const kurz = (h) => (h ? h.slice(0, 12) : "–");

function argumente(argv) {
  const opt = { ref: "main" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--ki-lead-dir") opt.dir = argv[++i];
    else if (argv[i] === "--ref") opt.ref = argv[++i];
  }
  return opt;
}

/** Liefert den Inhalt einer Datei aus KI-LEAD als Buffer oder null, wenn es sie nicht gibt. */
function quelleKiLead(opt) {
  if (opt.dir)
    return async (pfad) => {
      try {
        return readFileSync(join(opt.dir, pfad));
      } catch {
        return null;
      }
    };
  return async (pfad) => {
    const url = `https://raw.githubusercontent.com/pereirawolf/ki-lead/${opt.ref}/${pfad}`;
    const antwort = await fetch(url);
    if (antwort.status === 404) return null;
    if (!antwort.ok) throw new Error(`Abruf fehlgeschlagen (${antwort.status}): ${url}`);
    return Buffer.from(await antwort.arrayBuffer());
  };
}

/** Einträge der Herkunftsangabe in KI-LEAD mit Quellpfad und Prüfsumme, gleich unter welchem Schlüssel sie stehen. */
function eintraege(herkunft) {
  return [...(herkunft.module || []), ...(herkunft.dateien || []), ...(herkunft.fassungen || [])].filter((e) => e && e.sha256);
}

export async function pinAbstand(opt = {}) {
  const wurzel = opt.wurzel || WURZEL;
  const lies = quelleKiLead({ ref: "main", ...opt });
  const wo = opt.dir ? "lokaler Klon" : opt.ref || "main";
  const befunde = [];
  const hinweise = [];
  const zeilen = [];

  // 1. Kopien aus KI-LEAD
  for (const { datei, abstand } of PINS) {
    const pin = JSON.parse(readFileSync(join(wurzel, datei), "utf8"));
    for (const d of pin.dateien) {
      const aktuell = await lies(d.quelle);
      const h = aktuell ? sha256(aktuell) : null;
      const gleich = h === d.sha256;
      const ergebnis = gleich ? "gleich" : abstand ? "**Abstand**" : "Hinweis";
      zeilen.push(`| ${d.ziel} | ${kurz(d.sha256)} (Commit ${pin.commit.slice(0, 7)}) | ${aktuell ? kurz(h) : "fehlt"} | ${ergebnis} |`);
      if (gleich) continue;
      if (abstand) befunde.push(`${d.ziel} entspricht nicht mehr ${d.quelle} in KI-LEAD (${wo}).`);
      else hinweise.push(`${d.ziel} ist auf Grunddesign ${pin.fassung} gepinnt und weicht von ${d.quelle} in KI-LEAD ab (${wo}); Wechsel der Fassung bewusst mit Abgleich in docs/design-abweichungen.md.`);
    }
  }

  // 2. Gegenrichtung: Einbettung der Module in KI-LEAD
  const roh = await lies(HERKUNFT);
  if (!roh) {
    hinweise.push(`KI-LEAD bettet die Module von KRITIS-LEAD noch nicht ein (${HERKUNFT} fehlt); kein Abstand.`);
    for (const m of MODULE) zeilen.push(`| KI-LEAD bettet ${m.split("/").pop()} ein | ${kurz(sha256(readFileSync(join(wurzel, m))))} | nicht eingebettet | Hinweis |`);
  } else {
    const liste = eintraege(JSON.parse(roh.toString("utf8")));
    for (const m of MODULE) {
      const h = sha256(readFileSync(join(wurzel, m)));
      const e = liste.find((x) => x.quelle === m);
      const gleich = e?.sha256 === h;
      zeilen.push(`| KI-LEAD bettet ${m.split("/").pop()} ein | ${kurz(h)} | ${e ? kurz(e.sha256) : "nicht eingebettet"} | ${gleich ? "gleich" : "**Abstand**"} |`);
      if (!gleich) befunde.push(`KI-LEAD bettet ${m} nicht in der aktuellen Fassung ein (${HERKUNFT}).`);
    }
  }

  const bericht = [
    "## Pin-Abstand zu KI-LEAD",
    "",
    "| Gegenstand | KRITIS-LEAD | KI-LEAD | Ergebnis |",
    "|---|---|---|---|",
    ...zeilen,
    "",
    befunde.length ? befunde.map((b) => `- ${b}`).join("\n") : "Kein Abstand.",
    ...(hinweise.length ? ["", ...hinweise.map((h) => `- Hinweis: ${h}`)] : []),
    "",
    befunde.length ? "Nichts wird automatisch übernommen. Neuen Stand bewusst pinnen (kern/README.md) und in CHANGELOG.md eintragen." : "",
  ].join("\n");
  return { befunde, hinweise, bericht };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const { befunde, bericht } = await pinAbstand(argumente(process.argv.slice(2)));
    process.stdout.write(`${bericht}\n`);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${bericht}\n`);
    process.exit(befunde.length ? 1 : 0);
  } catch (e) {
    process.stderr.write(`${e.message}\n`);
    process.exit(2);
  }
}
