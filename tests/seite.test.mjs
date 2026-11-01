// Seiten auf GitHub Pages (npm run seite): gemeinsame Navigation mit Startseite, Betreiberformular und Schnittstelle,
// Inhaltsverzeichnis der Seite „Schnittstelle“ und kein waagerechtes Scrollen der Seite bei 390 px (seit 0.3.1, KL-UX-13
// und KL-UX-01). Baut Profilpaket und Seite in dist/. Ohne Chromium übersprungen, in der CI Pflicht.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

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

test("Seiten: Navigation, Inhaltsverzeichnis, kein waagerechtes Scrollen bei 390 px", { skip: grund || false }, async () => {
  for (const w of ["werkzeuge/bauen/profil-zip.mjs", "werkzeuge/bauen/seite-bauen.mjs"]) execFileSync(process.execPath, [pfad(w)], { stdio: "ignore" });
  for (const [datei, aktiv] of [
    ["index.html", "Start"],
    ["schnittstelle.html", "Schnittstelle"],
    ["betreibermeldung.html", "Betreiberformular"],
  ]) {
    for (const breite of [390, 1280]) {
      const kontext = await browser.newContext({ offline: true, viewport: { width: breite, height: 800 } });
      const p = await kontext.newPage();
      await p.goto(pathToFileURL(pfad(`dist/seite/${datei}`)).href);
      assert.deepEqual(await p.locator(".kopf-nav a").allTextContents(), ["Start", "Betreiberformular", "Schnittstelle"], datei);
      assert.equal(await p.locator('.kopf-nav a[aria-current="page"]').textContent(), aktiv, datei);
      assert.equal(await p.locator(".chip-status").count(), 0, `${datei}: kein Chip in der Kopfleiste`);
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
