// Seiten auf GitHub Pages (npm run seite): gemeinsame Navigation mit Startseite, Betreiberformular und Schnittstelle,
// Inhaltsverzeichnis der Seite „Schnittstelle“ und kein waagerechtes Scrollen der Seite bei 390 px (seit 0.3.1, KL-UX-13
// und KL-UX-01); seit 0.3.7 Aufbau der Startseite, Schriftgrößen (LD-T02), Datumsformat (LD-T04), Szenario als ZIP und
// axe-core auf der Startseite (LD-Z01). Baut Profilpaket und Seite in dist/. Ohne Chromium übersprungen, in der CI Pflicht.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import JSZip from "jszip";
import { fusszeile, VERWEISE } from "../werkzeuge/bauen/fusszeile.mjs";

const pfad = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
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
const { version } = JSON.parse(readFileSync(pfad("package.json"), "utf-8"));
const axeQuelle = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf-8");
const REGELN = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const bauen = () => {
  for (const w of ["werkzeuge/bauen/profil-zip.mjs", "werkzeuge/bauen/seite-bauen.mjs"]) execFileSync(process.execPath, [pfad(w)], { stdio: "ignore" });
};

test("Fußzeile: Ziel „Datenschutz“ liegt im Repository", () => {
  const ziel = VERWEISE.datenschutz.replace("https://github.com/pereirawolf/kritis-lead/blob/main/", "");
  assert.ok(existsSync(pfad(ziel)), ziel);
});

test("Seiten: Navigation, Inhaltsverzeichnis, kein waagerechtes Scrollen bei 390 px", { skip: grund || false }, async () => {
  bauen();
  for (const [datei, aktiv, titel] of [
    ["index.html", "Start", "KRITIS-LEAD"],
    ["schnittstelle.html", "Schnittstelle", "Schnittstelle – KRITIS-LEAD"],
    ["betreibermeldung.html", "Betreiberformular", "Betreiberformular – KRITIS-LEAD"],
  ]) {
    for (const breite of [390, 1280]) {
      const kontext = await browser.newContext({ offline: true, viewport: { width: breite, height: 800 } });
      const p = await kontext.newPage();
      await p.goto(pathToFileURL(pfad(`dist/seite/${datei}`)).href);
      assert.deepEqual(await p.locator(".hauptnav a").allTextContents(), ["Start", "Betreiberformular", "Schnittstelle"], datei);
      assert.equal(await p.locator('.hauptnav a[aria-current="page"]').textContent(), aktiv, datei);
      assert.equal(await p.locator(".chip-status").count(), 0, `${datei}: kein Chip in der Kopfleiste`);
      // Grunddesign 1.8 (seit 0.3.7): Titel „<Seite> – KRITIS-LEAD“, Startseite nur der Name (LD-N07); Zusatz auf allen
      // Seiten gleich, ohne Version, unter 860 px ausgeblendet (LD-R02); Navigation links neben dem Namen, 44 px (LD-N08)
      assert.equal(await p.title(), titel, datei);
      assert.equal(await p.locator(".marke-zusatz").textContent(), "Betreibermeldungen im LEAD-Lagebild", datei);
      assert.equal(await p.locator(".marke-zusatz").isVisible(), breite > 860, `${datei}: Zusatz bei ${breite} px`);
      for (const h of await p.locator(".hauptnav .nav").evaluateAll((es) => es.filter((e) => !e.hidden).map((e) => e.getBoundingClientRect().height)))
        assert.ok(h >= 44, `${datei}: Eintrag der Navigation ${h} px hoch`);
      const marke = await p.locator(".marke").boundingBox();
      const nav = await p.locator(".hauptnav").boundingBox();
      if (breite > 640) assert.ok(nav.x > marke.x + marke.width && nav.x - (marke.x + marke.width) < 40, `${datei}: Navigation direkt neben dem Namen`);
      else assert.ok(nav.y >= marke.y + marke.height, `${datei}: Navigation in eigener Zeile unter 640 px (LD-N05)`);
      // Fußzeile wie in KI-LEAD (seit 0.3.3): auf allen Seiten gleich, mit Version und drei Verweisen in eigenem Fenster
      const fuss = p.locator("footer.fuss");
      assert.equal(await fuss.innerHTML(), fusszeile(version), `${datei}: Fußzeile`);
      assert.ok((await fuss.textContent()).startsWith(`KRITIS-LEAD ${version}. `), datei);
      assert.deepEqual(await fuss.locator("a").allTextContents(), ["Lizenzen", "Impressum", "Datenschutz"], datei);
      for (const a of await fuss.locator("a").all()) {
        assert.equal(await a.getAttribute("target"), "_blank", datei);
        assert.equal(await a.getAttribute("rel"), "noopener noreferrer", datei);
      }
      assert.ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= breite, `${datei}, ${breite} px`);
      if (datei === "schnittstelle.html") {
        assert.equal(await p.locator("#seiteninhalt").evaluate((d) => d.open), breite >= 1000, "Inhaltsverzeichnis offen nur auf breiten Bildschirmen");
        const ziele = await p.locator("#seiteninhalt a").evaluateAll((as) => as.map((a) => a.getAttribute("href").slice(1)));
        assert.ok(ziele.length > 15);
        for (const id of ziele) assert.equal(await p.locator(`[id="${id}"]`).count(), 1, `Sprungziel #${id}`);
      }
      await kontext.close();
    }
  }
});

test("Startseite: Szenario als ZIP mit allen Meldungen, KI-LEAD-tauglich (seit 0.3.7)", async () => {
  bauen();
  const zip = await JSZip.loadAsync(readFileSync(pfad("dist/seite/szenario-orkantief-ilka-sonneberg.zip")));
  const json = Object.keys(zip.files).filter((n) => n.endsWith(".json"));
  assert.equal(json.length, 14);
  assert.ok(json.every((n) => n.startsWith("orkantief-ilka-sonneberg/")), "ein Oberordner");
  for (const n of json) assert.equal(await zip.file(n).async("string"), readFileSync(pfad(`szenario/${n}`), "utf-8"), n);
});

test("Startseite: Seitenkopf, drei Einstiege, Szenario, Schriftgrößen und Datumsformat (seit 0.3.7)", { skip: grund || false }, async () => {
  bauen();
  const kontext = await browser.newContext({ offline: true, viewport: { width: 1280, height: 900 } });
  const p = await kontext.newPage();
  await p.goto(pathToFileURL(pfad("dist/seite/index.html")).href);
  // Überschrift und Kennsatz, keine Wiederholung des Produktnamens als h1 (LD-A01, LD-A02)
  assert.equal(await p.locator("h1").count(), 1);
  assert.notEqual((await p.locator("h1").textContent()).trim(), "KRITIS-LEAD");
  assert.match(await p.locator(".kennsatz").textContent(), / nach LEAD-Systematik$/);
  // h1 1,6 rem, h2 1,35 rem (LD-T02)
  const groesse = (sel) => p.locator(sel).first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize) / parseFloat(getComputedStyle(document.documentElement).fontSize));
  assert.equal(await groesse("h1"), 1.6);
  assert.equal(await groesse("h2"), 1.35);
  assert.equal(await groesse("#szenario"), 1.35);
  // drei Einstiege mit je einem Knopf; die Downloads des Zielformats stehen nur auf der Seite „Schnittstelle“
  assert.deepEqual(await p.locator(".einstieg h2").allTextContents(), ["Meldung erfassen", "Aus dem BCM-System melden", "Im Lagebild ansehen"]);
  assert.deepEqual(await p.locator(".einstieg a.knopf").evaluateAll((as) => as.map((a) => a.getAttribute("href"))), ["betreibermeldung.html", "schnittstelle.html", "lead-kritis.leadprofil"]);
  assert.equal(await p.locator('a[href^="schnittstelle/"]').count(), 0);
  // Szenario: ZIP, Tabelle zugeklappt, Zeitpunkte deutsch (LD-T04), jede Meldung einzeln herunterladbar
  assert.equal(await p.locator('a[href="szenario-orkantief-ilka-sonneberg.zip"][download]').count(), 1);
  assert.equal(await p.locator("details.meldungen").evaluate((d) => d.open), false);
  const zeiten = await p.locator(".meldungen tbody td:first-child").allTextContents();
  assert.equal(zeiten.length, 14);
  for (const z of zeiten) assert.match(z, /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2} Uhr$/);
  assert.equal(zeiten[0], "13.10.2026, 22:45 Uhr");
  assert.equal(await p.locator('.meldungen a[href^="szenario/"][download]').count(), 14);
  assert.ok(await p.locator('[id="szenario"]').count(), "Sprungziel der Seite „Schnittstelle“");
  await kontext.close();
});

test("axe-core: Startseite ohne Verstöße, breit und hell sowie 390 px und dunkel (LD-Z01, seit 0.3.7)", { skip: grund || false }, async () => {
  bauen();
  const befunde = [];
  for (const [ansicht, opt] of [
    ["breit, hell", { viewport: { width: 1280, height: 900 }, colorScheme: "light" }],
    ["390 px, dunkel", { viewport: { width: 390, height: 844 }, colorScheme: "dark" }],
  ]) {
    const kontext = await browser.newContext({ offline: true, ...opt });
    const p = await kontext.newPage();
    await p.goto(pathToFileURL(pfad("dist/seite/index.html")).href);
    for (const zustand of ["zugeklappt", "aufgeklappt"]) {
      if (zustand === "aufgeklappt") await p.locator(".meldungen summary").click();
      if (!(await p.evaluate(() => !!window.axe))) await p.addScriptTag({ content: axeQuelle });
      const v = await p.evaluate(async (tags) => (await window.axe.run(document, { runOnly: tags })).violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`), REGELN);
      befunde.push(...v.map((x) => `${ansicht}, ${zustand}: ${x}`));
    }
    assert.ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= opt.viewport.width, `${ansicht}: kein waagerechtes Scrollen`);
    await kontext.close();
  }
  assert.deepEqual(befunde, []);
});
