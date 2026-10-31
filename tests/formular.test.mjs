// Betreiberformular im Browser: lädt ohne Fehler und ohne Netz, gibt das Beispiel unverändert und gültig aus,
// schreibt eine Vormeldung zu einer gültigen Folgemeldung fort und führt von einem Befund zum Feld.
// Ohne installierten Chromium (npx playwright install chromium) wird der Test übersprungen.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { baueFormular, ZIEL, BEISPIEL } from "../werkzeuge/bauen/formular-bauen.mjs";
import { pruefeMeldung, pruefeSatz } from "../werkzeuge/pruefen/pruefen.mjs";

const pfad = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const beispiel = JSON.parse(readFileSync(pfad(BEISPIEL), "utf-8"));
const ablage = mkdtempSync(join(tmpdir(), "kritis-formular-"));

let browser;
let grund = "";
try {
  const { chromium } = await import("playwright");
  browser = await chromium.launch();
} catch (e) {
  // In der CI (KRITIS_BROWSER_PFLICHT=1) ist ein fehlender Browser ein Fehler, lokal ein Grund zum Überspringen
  if (process.env.KRITIS_BROWSER_PFLICHT === "1") throw e;
  grund = `kein Browser für Playwright: ${e.message.split("\n")[0]}`;
}
after(async () => browser?.close());

test("Formulardatei ist aktuell gebaut", async () => {
  assert.equal(readFileSync(pfad(ZIEL), "utf-8"), await baueFormular(), "npm run bauen ausführen");
});

async function neueSeite() {
  const kontext = await browser.newContext({ acceptDownloads: true, offline: true });
  const seite = await kontext.newPage();
  const fehler = [];
  seite.on("pageerror", (e) => fehler.push(`pageerror: ${e.message}`));
  seite.on("console", (m) => m.type() === "error" && fehler.push(`console: ${m.text()}`));
  seite.on("request", (r) => !r.url().startsWith("file:") && !r.url().startsWith("data:") && !r.url().startsWith("blob:") && fehler.push(`Anfrage: ${r.url()}`));
  seite.on("dialog", (d) => d.accept());
  await seite.goto(pathToFileURL(pfad(ZIEL)).href);
  await seite.locator(".schritte").waitFor();
  return { seite, kontext, fehler };
}

async function ausgeben(seite, name) {
  await seite.getByRole("button", { name: "Prüfen", exact: true }).click();
  const [download] = await Promise.all([seite.waitForEvent("download"), seite.locator("#ausgeben").click()]);
  const ziel = join(ablage, name);
  await download.saveAs(ziel);
  return { daten: JSON.parse(readFileSync(ziel, "utf-8")), datei: ziel, vorschlag: download.suggestedFilename() };
}

test("Formular im Browser", { skip: grund || false }, async (t) => {
  const { seite, kontext, fehler } = await neueSeite();

  await t.test("leere Erstmeldung: Fehler gezählt, Ausgabe gesperrt", async () => {
    await seite.getByRole("button", { name: "Prüfen", exact: true }).click();
    assert.ok((await seite.locator(".befund").count()) > 5);
    assert.equal(await seite.locator("#ausgeben").isDisabled(), true);
    assert.match(await seite.locator("#status").textContent(), /Erstmeldung/);
  });

  await t.test("Befund führt zum Feld", async () => {
    await seite.locator(".befund button", { hasText: "Betreiber (meldende Stelle)" }).first().click();
    assert.equal(await seite.locator("#schritt-titel").textContent(), "Meldung und Betreiber");
    const feld = seite.locator('[data-pfad="/meldende_stelle"]');
    assert.ok(await feld.evaluate((e) => e.classList.contains("feld-fehler")));
    assert.ok(await feld.locator("input").evaluate((e) => e === document.activeElement));
  });

  let erst;
  await t.test("Beispiel wird unverändert und gültig ausgegeben", async () => {
    await seite.locator("#beispiel").click();
    await seite.getByRole("button", { name: "Prüfen", exact: true }).click();
    if ((await seite.locator(".ergebnis-ok").count()) !== 1) assert.fail(await seite.locator(".befunde").textContent());
    erst = await ausgeben(seite, "erst.json");
    assert.deepEqual(erst.daten, beispiel);
    assert.match(erst.vorschlag, /^2026-10-14T06-30_KRITIS-Meldung_Zweckverband-Trinkwasser-Neuhaus-am-Rennweg_Erstmeldung_FIKTIV\.json$/);
    const r = pruefeMeldung(erst.daten);
    assert.equal(r.gueltig, true, JSON.stringify(r.befunde));
  });

  await t.test("Vormeldung fortschreiben ergibt gültige Folgemeldung", async () => {
    await seite.locator("#vormeldung").setInputFiles(erst.datei);
    await seite.locator("#status", { hasText: /^Folgemeldung/ }).waitFor({ timeout: 5000 });
    await seite.getByRole("button", { name: /Lage und Einschätzung/ }).click();
    const feld = seite.getByLabel("Betriebliche Einschätzung mit Kennsätzen");
    await feld.fill(`${await feld.inputValue()}Notstrom am Pumpwerk läuft stabil.`);
    const folge = await ausgeben(seite, "folge.json");
    const k = folge.daten.kritis;
    assert.equal(k.meldeart, "Folgemeldung");
    assert.equal(k.bezug_meldung_id, beispiel.kritis.meldung_id);
    assert.notEqual(k.meldung_id, beispiel.kritis.meldung_id);
    assert.equal(folge.daten.sachverhalte[0].kennung, beispiel.sachverhalte[0].kennung);
    const r = pruefeMeldung(folge.daten);
    assert.equal(r.gueltig, true, JSON.stringify(r.befunde));
    assert.deepEqual(r.befunde.filter((b) => b.stufe === "fehler"), []);
    const satz = pruefeSatz([
      { name: "erst.json", daten: erst.daten },
      { name: "folge.json", daten: folge.daten },
    ]);
    assert.deepEqual(satz.filter((b) => b.stufe === "fehler"), [], JSON.stringify(satz));
  });

  await t.test("Entwurf übersteht das Neuladen", async () => {
    await seite.reload();
    await seite.locator(".schritte").waitFor();
    assert.match(await seite.locator("#status").textContent(), /^Folgemeldung · Zweckverband/);
  });

  await t.test("keine Skriptfehler, keine Netzanfragen", () => assert.deepEqual(fehler, []));
  await kontext.close();
});
