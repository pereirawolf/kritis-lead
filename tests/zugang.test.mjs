// Zugang „betriebsintern“ im Betreiberformular (KL-2026-W45-06, Entscheidungen vom 05.11.2026):
// Vorbelegung nur beim Quellenvorschlag, „betriebsintern“ zuerst in der Auswahl, leere Quelle „nicht angegeben“.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const lies = (p) => JSON.parse(readFileSync(fileURLToPath(new URL(`../${p}`, import.meta.url)), "utf-8"));
const url = pathToFileURL(fileURLToPath(new URL("../formular/betreibermeldung.html", import.meta.url))).href;

test("Kernschema am Pin kennt den Zugang „betriebsintern“", () => {
  const zugang = lies("kern/lead-meldung-v2/kern.schema.json").$defs.quelle.properties.zugang.enum;
  assert.ok(zugang.includes("betriebsintern"));
  assert.equal(lies("formate/lead-kritis-v2/beispiele/betreiber-minimal.json").quellen[0].zugang, "betriebsintern");
});

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

test("Formular: Quellenvorschlag betriebsintern, leere Quelle nicht angegeben, betriebsintern zuerst", { skip: grund || false }, async () => {
  const p = await (await browser.newContext({ offline: true })).newPage();
  await p.goto(url);
  await p.locator("#oeffnen").click();
  await p.locator("#beispiel").click();
  await p.locator('[data-fokus="schritt:quellen"]').click();
  const zugaenge = p.locator('[data-fokus^="/quellen/"][data-fokus$="/zugang"]');
  const vorher = await zugaenge.count();

  await p.locator('[data-fokus="aktion:quelle"]').click();
  await zugaenge.nth(vorher).waitFor();
  assert.equal(await zugaenge.nth(vorher).inputValue(), "betriebsintern");

  const optionen = await zugaenge.nth(vorher).locator("option").evaluateAll((os) => os.map((o) => o.value));
  assert.deepEqual(optionen.slice(0, 2), ["", "betriebsintern"]);

  await p.locator('[data-fokus="/quellen#neu"]').click();
  await zugaenge.nth(vorher + 1).waitFor();
  assert.equal(await zugaenge.nth(vorher + 1).inputValue(), "");
});
