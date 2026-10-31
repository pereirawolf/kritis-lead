// Vollständigkeit des Betreiberformulars: Für jedes Feld, das das Meldeprofil in einer Betreibermeldung zulässt, gibt es
// im Formular ein Eingabeelement. Sonst könnten Betreiber Angaben nicht machen, die KI-LEAD verarbeiten würde.
// Ausgenommen sind nur Felder, die das Formular selbst setzt oder die Betreibern nach den Rollenregeln verwehrt sind.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const lies = (p) => JSON.parse(readFileSync(fileURLToPath(new URL(`../${p}`, import.meta.url)), "utf-8"));
const schema = lies("profil/lead-kritis/meldung.schema.json");
const url = pathToFileURL(fileURLToPath(new URL("../formular/betreibermeldung.html", import.meta.url))).href;

/** Felder, die das Formular nicht zur Eingabe anbietet, mit Grund. Präfixe gelten für alle Unterfelder. */
export const AUSNAHMEN = {
  schema: "setzt das Formular (Profilschema)",
  _status: "setzt das Formular (final)",
  _entstehung: "setzt das Formular (manuell, Werkzeug und Version)",
  zeitzone: "setzt das Formular (Europe/Berlin)",
  "kritis.erweiterung": "setzt das Formular (Fassung der Erweiterung)",
  "kritis.rolle": "Betreiberformular: immer Betreiber",
  "kritis.datenart": "Demonstrator: nur synthetisch (angezeigt)",
  "kritis.vertraulichkeit.einstufung": "Demonstrator: keine Einstufung",
  "kritis.rechtsgrundlage_dieser_meldung": "Demonstrator: fiktive Übung, fester Text",
  "sachverhalte[].sofort.beurteilung": "Rollenregel R1: setzt die Behörde",
  "sachverhalte[].sofort.tendenz": "Rollenregel R1: setzt die Behörde",
  "sachverhalte[].sofort.lagenradar": "Rollenregel R1: setzt die Behörde",
  "sachverhalte[].betrieb.betreiber.name": "übernimmt das Formular aus der meldenden Stelle",
};

function aufloesen(k) {
  while (k?.$ref) k = schema.$defs[k.$ref.split("/").pop()];
  return k || {};
}
/** Blätter des Schemas als Pfade wie in der Darstellungsdatei: "sachverhalte[].betrieb.raum.ars[]". */
function blaetter(knoten, pfad, out = new Set()) {
  const k = aufloesen(knoten);
  const typen = [].concat(k.type || []);
  if (k.properties) for (const [n, s] of Object.entries(k.properties)) blaetter(s, pfad ? `${pfad}.${n}` : n, out);
  else if (typen.includes("array")) {
    const it = aufloesen(k.items);
    if (it.properties) blaetter(it, `${pfad}[]`, out);
    else out.add(`${pfad}[]`);
  } else out.add(pfad);
  return out;
}
const ausgenommen = (p) => Object.keys(AUSNAHMEN).some((a) => p === a || p.startsWith(`${a}.`) || p.startsWith(`${a}[]`));
const normal = (z) => z.split("/").filter(Boolean).reduce((a, k) => (/^\d+$/.test(k) ? `${a}[]` : a ? `${a}.${k}` : k), "");

let browser;
let grund = "";
try {
  const { chromium } = await import("playwright");
  browser = await chromium.launch();
} catch (e) {
  if (process.env.KRITIS_BROWSER_PFLICHT === "1") throw e;
  grund = `kein Browser für Playwright: ${e.message.split("\n")[0]}`;
}
after(async () => browser?.close());

test("jedes Feld des Meldeprofils für Betreiber hat im Formular ein Eingabeelement", { skip: grund || false }, async () => {
  const soll = [...blaetter(schema, "")].filter((p) => !ausgenommen(p)).sort();
  const p = await (await browser.newContext({ offline: true })).newPage();
  await p.goto(url);
  await p.locator("#beispiel").click();
  const gefunden = new Set();
  const sammle = async () => (await p.locator("#arbeitsbereich [data-pfad]").evaluateAll((es) => es.map((e) => e.dataset.pfad))).forEach((z) => gefunden.add(normal(z)));
  const schritte = await p.locator(".schritte button").count();
  // Bedingte Felder sichtbar machen: Folgemeldung (Bezug), Ursache, je Liste ein Eintrag
  await p.locator('[data-fokus="/kritis/meldeart=Folgemeldung"]').check({ force: true });
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  await p.locator('[data-fokus="schalter:ursache"]').check();
  for (let i = 0; i < schritte; i++) {
    await p.locator(".schritte button").nth(i).click();
    for (const k of await p.locator('#arbeitsbereich [data-fokus$="#neu"]').all()) {
      const f = await k.getAttribute("data-fokus");
      await p.locator(`[data-fokus="${f}"]`).click();
    }
    await sammle();
  }
  // Sektorangaben je Sektor mit eigenem Block
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  for (const sektor of aufloesen(schema.$defs.kritis_betrieb).properties.sektor.enum) {
    await p.selectOption('[data-fokus="/sachverhalte/0/betrieb/sektor"]', sektor);
    await sammle();
  }
  // Listen einfacher Werte: Mehrfachauswahl (ganze Liste) oder einzelne Einträge
  const fehlend = soll.filter((f) => !gefunden.has(f) && !(f.endsWith("[]") && gefunden.has(f.slice(0, -2))));
  assert.deepEqual(fehlend, [], `ohne Eingabeelement: ${fehlend.join(", ")}`);
  // Jede Ausnahme betrifft ein Feld, das es im Schema gibt
  for (const a of Object.keys(AUSNAHMEN)) assert.ok([...blaetter(schema, "")].some((f) => f === a || f.startsWith(`${a}.`) || f.startsWith(`${a}[]`)), `Ausnahme ohne Feld: ${a}`);
});
