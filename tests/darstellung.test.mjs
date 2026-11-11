// Einstellungen → Darstellung (seit 0.3.6): Wahl des Farbschemas wie in KI-LEAD für Betreiberformular, Startseite und
// Seite „Schnittstelle“. Ganzer Katalog mit unveränderten Kennungen und Werten (LD-F02), Kontraste aller wählbaren
// Schemata (LD-F03), Knopf am Ende der Navigation (LD-N01), Dialog mit Tastatur, Speichern, Vorrang vor den
// Systemeinstellungen, „Automatisch“ ohne Speichern (LD-F05) und axe-core. Ohne Chromium übersprungen, in der CI Pflicht.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { KENNUNGEN, KATALOG, farbCss, kontrastFehler, profilFarbschema, schemaWerte, schemata, waehlbar } from "../werkzeuge/bauen/farben.mjs";
import { SCHLUESSEL, WAHL, automatischRegel } from "../werkzeuge/bauen/darstellung.mjs";

const require = createRequire(import.meta.url);
const axeQuelle = readFileSync(require.resolve("axe-core/axe.min.js"), "utf-8");
const pfad = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const url = pathToFileURL(pfad("formular/betreibermeldung.html")).href;
const farbschema = profilFarbschema();
const REGELN = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

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

const variable = (p, n) => p.evaluate((x) => getComputedStyle(document.documentElement).getPropertyValue(`--${x}`).trim().toUpperCase(), n);

test("Wählbar sind „Automatisch“, der ganze Katalog und „Farben des Profils“; jedes Schema erreicht seine Kontraste (LD-F02, LD-F03)", () => {
  assert.equal(KENNUNGEN.length, 22);
  assert.deepEqual(WAHL, ["automatisch", ...KENNUNGEN, "profil"]);
  const css = farbCss(farbschema);
  for (const [id, w] of waehlbar(farbschema)) {
    assert.deepEqual(kontrastFehler(w), [], id);
    assert.ok(css.includes(`[data-farbschema="${id}"] {`), id);
  }
  // Werte unverändert aus dem Katalog
  for (const id of KENNUNGEN) assert.equal(schemaWerte(id).werte.flaeche, KATALOG[id].flaeche.$value.toUpperCase(), id);
  assert.match(automatischRegel(farbschema), /^Folgt der Einstellung des Geräts: hell → Bevölkerungsschutz · BBK \(Farbschema des Profils\), dunkel → Neutral · Night Mode/);
  // Die feste Wahl steht nach den Regeln für die Systemeinstellungen und geht ihnen damit vor
  assert.ok(css.lastIndexOf("prefers-contrast: more") < css.indexOf("[data-farbschema="));
});

async function seite(adresse, opt = {}) {
  const kontext = await browser.newContext({ offline: true, viewport: { width: 1280, height: 900 }, ...opt });
  const p = await kontext.newPage();
  const fehler = [];
  p.on("pageerror", (e) => fehler.push(e.message));
  await p.goto(adresse);
  return { p, kontext, fehler };
}

test("Betreiberformular: „Einstellungen“ öffnet „Darstellung“; Wahl gilt sofort, bleibt nach Neuladen, Escape gibt den Fokus zurück", { skip: grund || false }, async () => {
  const { p, kontext, fehler } = await seite(url);
  const knopf = p.locator(".hauptnav #einstellungen-oeffnen");
  assert.ok(await knopf.isVisible());
  assert.equal(await p.locator(".hauptnav > :last-child").getAttribute("id"), "einstellungen-oeffnen", "am Ende der Navigation (LD-N01)");
  assert.equal(await p.evaluate(() => document.documentElement.hasAttribute("data-farbschema")), false);
  assert.equal(await variable(p, "amt"), schemata(farbschema).hell.werte.amt, "ohne Wahl das Profilschema");

  await knopf.click();
  assert.ok(await p.locator("#einstellungen[open]").isVisible());
  assert.equal(await p.evaluate(() => document.activeElement.id), "farbschema");
  assert.equal(await p.locator("#farbschema option").count(), 24);
  assert.deepEqual(await p.locator("#farbschema optgroup").evaluateAll((g) => g.map((x) => x.label)), ["Neutral", "Kontrast (Text mindestens 7:1)", "Bund", "Bundesländer", "Profil"]);
  assert.equal(await p.locator("#farbschema").inputValue(), "automatisch");
  assert.ok(await p.locator("#farbschema-automatisch").isVisible());
  assert.match(await p.locator("#farbschema-verwendet").textContent(), /Automatisch: Bevölkerungsschutz · BBK \(Farbschema des Profils\) \(Systemeinstellung hell\)/);
  assert.equal(await p.evaluate((k) => localStorage.getItem(k), SCHLUESSEL), null, "„Automatisch“ speichert nichts");

  await p.selectOption("#farbschema", "de-th");
  const th = schemaWerte("de-th").werte;
  assert.equal(await variable(p, "amt"), th.amt);
  assert.equal(await variable(p, "kritisch"), th.kritisch);
  assert.equal(await p.locator("#farbschema-automatisch").isHidden(), true);
  assert.match(await p.locator("#farbschema-verwendet").textContent(), /Verwendet: Thüringen\./);
  assert.deepEqual(JSON.parse(await p.evaluate((k) => localStorage.getItem(k), SCHLUESSEL)), { version: 1, auswahl: "de-th" });

  await p.keyboard.press("Escape");
  assert.equal(await p.locator("#einstellungen[open]").count(), 0);
  assert.equal(await p.evaluate(() => document.activeElement.id), "einstellungen-oeffnen");

  await p.reload();
  await p.locator(".schritte").waitFor();
  assert.equal(await p.evaluate(() => document.documentElement.dataset.farbschema), "de-th");
  assert.equal(await variable(p, "amt"), th.amt);

  // „Farben des Profils“ und zurück zu „Automatisch“: Eintrag entfernt, Systemeinstellung gilt wieder
  await knopf.click();
  await p.selectOption("#farbschema", "profil");
  assert.match(await p.locator("#farbschema-verwendet").textContent(), /Verwendet: Bevölkerungsschutz · BBK \(Farbschema des Profils\)\./);
  await p.selectOption("#farbschema", "automatisch");
  assert.equal(await p.evaluate((k) => localStorage.getItem(k), SCHLUESSEL), null);
  assert.equal(await p.evaluate(() => document.documentElement.hasAttribute("data-farbschema")), false);
  await p.locator("#einstellungen-schliessen").click();
  assert.equal(await p.evaluate(() => document.activeElement.id), "einstellungen-oeffnen");
  assert.deepEqual(fehler, []);
  await kontext.close();
});

test("Feste Wahl geht dunkel und „mehr Kontrast“ des Systems vor; „Automatisch“ folgt ihnen (LD-F05)", { skip: grund || false }, async () => {
  const s = schemata(farbschema);
  const { p, kontext } = await seite(url, { colorScheme: "dark", contrast: "more" });
  assert.equal(await variable(p, "papier"), s["kontrast-dunkel"].werte.papier);
  await p.locator("#einstellungen-oeffnen").click();
  assert.match(await p.locator("#farbschema-verwendet").textContent(), /Automatisch: Kontrast · Dunkel \(Systemeinstellung „mehr Kontrast“\)/);
  await p.selectOption("#farbschema", "neutral-hell");
  assert.equal(await variable(p, "papier"), schemaWerte("neutral-hell").werte.papier);
  assert.equal(await p.evaluate(() => getComputedStyle(document.documentElement).colorScheme), "light");
  await kontext.close();
  // Eine gespeicherte, aber unbekannte Wahl wird ignoriert
  const { p: q, kontext: k2 } = await seite(url);
  await q.evaluate((k) => localStorage.setItem(k, JSON.stringify({ version: 1, auswahl: "x\"]{}" })), SCHLUESSEL);
  await q.reload();
  assert.equal(await q.evaluate(() => document.documentElement.hasAttribute("data-farbschema")), false);
  await k2.close();
});

test("Ohne JavaScript kein Knopf „Einstellungen“; die Farben folgen dann den Systemeinstellungen (LD-F06)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite(url, { javaScriptEnabled: false });
  assert.equal(await p.locator("#einstellungen-oeffnen").isHidden(), true);
  assert.equal(await variable(p, "amt"), schemata(farbschema).hell.werte.amt);
  await kontext.close();
});

test("axe-core: Dialog „Einstellungen“ ohne Verstöße, breit und hell sowie 390 px und dunkel", { skip: grund || false }, async () => {
  const befunde = [];
  for (const [ansicht, opt] of [
    ["breit, hell", { colorScheme: "light" }],
    ["390 px, dunkel", { viewport: { width: 390, height: 844 }, colorScheme: "dark" }],
  ]) {
    for (const wahl of ["automatisch", "kontrast-hell", "de-sn"]) {
      const { p, kontext } = await seite(url, opt);
      await p.locator("#einstellungen-oeffnen").click();
      await p.selectOption("#farbschema", wahl);
      await p.addScriptTag({ content: axeQuelle });
      const v = await p.evaluate(async (tags) => (await window.axe.run(document, { runOnly: tags })).violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`), REGELN);
      befunde.push(...v.map((x) => `${ansicht}, ${wahl}: ${x}`));
      assert.ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= (opt.viewport?.width ?? 1280), `${ansicht}: kein waagerechtes Scrollen`);
      await kontext.close();
    }
  }
  assert.deepEqual(befunde, []);
});

test("Startseite und Seite „Schnittstelle“: derselbe Knopf und Dialog, Wahl gilt seitenübergreifend", { skip: grund || false }, async () => {
  for (const w of ["werkzeuge/bauen/profil-zip.mjs", "werkzeuge/bauen/seite-bauen.mjs"]) execFileSync(process.execPath, [pfad(w)], { stdio: "ignore" });
  const kontext = await browser.newContext({ offline: true, viewport: { width: 1280, height: 900 } });
  const p = await kontext.newPage();
  await p.goto(pathToFileURL(pfad("dist/seite/index.html")).href);
  await p.locator("#einstellungen-oeffnen").click();
  await p.selectOption("#farbschema", "bund");
  for (const datei of ["schnittstelle.html", "betreibermeldung.html"]) {
    await p.goto(pathToFileURL(pfad(`dist/seite/${datei}`)).href);
    assert.equal(await p.evaluate(() => document.documentElement.dataset.farbschema), "bund", datei);
    assert.equal(await variable(p, "amt"), schemaWerte("bund").werte.amt, datei);
    assert.ok(await p.locator(".hauptnav #einstellungen-oeffnen").isVisible(), datei);
  }
  await kontext.close();
});
