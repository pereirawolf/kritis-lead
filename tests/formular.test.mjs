// Betreiberformular im Browser (LEAD-Meldung-v2, seit 0.4): lädt ohne Fehler und ohne Netz, gibt das Beispiel bis auf
// den Herkunftsnachweis unverändert und gültig aus, erfasst eine Erstmeldung von Grund auf, schreibt eine Vormeldung zu
// einer gültigen Folgemeldung fort und führt von einem Befund zum Feld.
// Ohne installierten Chromium (npx playwright install chromium) wird der Test übersprungen.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { baueFormular, ZIEL, BEISPIEL } from "../werkzeuge/bauen/formular-bauen.mjs";
import { pruefeMeldung, pruefeSatz } from "../werkzeuge/pruefen/v2/pruefen.mjs";

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
  await seite.locator('[data-fokus="schritt:pruefen"]').click();
  const [download] = await Promise.all([seite.waitForEvent("download"), seite.locator("#ausgeben").click()]);
  const ziel = join(ablage, name);
  await download.saveAs(ziel);
  return { daten: JSON.parse(readFileSync(ziel, "utf-8")), datei: ziel, vorschlag: download.suggestedFilename() };
}

test("Formular im Browser", { skip: grund || false }, async (t) => {
  const { seite, kontext, fehler } = await neueSeite();

  await t.test("leere Erstmeldung: Fehler gezählt, Ausgabe gesperrt", async () => {
    await seite.locator('[data-fokus="schritt:pruefen"]').click();
    assert.ok((await seite.locator(".befund").count()) > 5);
    assert.equal(await seite.locator("#ausgeben").isDisabled(), true);
    assert.match(await seite.locator("#status").textContent(), /Erstmeldung/);
  });

  await t.test("Befund führt zum Feld", async () => {
    await seite.locator(".befund button", { hasText: "Betreiber (meldende Stelle)" }).first().click();
    assert.equal(await seite.locator("#schritt-titel").textContent(), "Schritt 1 von 6: Meldung und Betreiber");
    const feld = seite.locator('[data-pfad="/absender/stelle"]');
    assert.ok(await feld.evaluate((e) => e.classList.contains("feld-fehler")));
    assert.ok(await feld.locator("input").evaluate((e) => e === document.activeElement));
  });

  await t.test("Kürzel bildet die Kennung; ungültiges Kürzel ist ein Befund", async () => {
    const kuerzel = seite.getByLabel("Kürzel des Betreibers");
    await kuerzel.fill("netz süd");
    await seite.locator('[data-fokus="schritt:pruefen"]').click();
    assert.match(await seite.locator(".befunde").first().textContent(), /Kürzel des Betreibers/);
    await seite.locator('[data-fokus="schritt:meldung"]').click();
    await seite.getByLabel("Kürzel des Betreibers").fill("NETZ-SUED");
    await seite.locator('[data-fokus="schritt:lage"]').click();
    assert.match(await seite.locator(".lesewert").textContent(), /^KRITIS-NETZ-SUED-\d{8}-[0-9A-HJKMNP-TV-Z]{6}$/);
  });

  await t.test("Erstmeldung von Grund auf erfasst ist gültig", async () => {
    const f = (z) => seite.locator(`[data-fokus="${z}"]`);
    const b = "/sachverhalte/0/module/lead-kritis-betrieb";
    await seite.locator('[data-fokus="schritt:meldung"]').click();
    await f("/absender/stelle").fill("Netzbetreiber Süd (FIKTIV)");
    await f("/absender/gebiet/name").selectOption("Thüringen");
    await f("/module/lead-kritis-meldung/meldeanlass=eingetretene Einschränkung").check({ force: true });
    await seite.locator('[data-fokus="schritt:dienstleistung"]').click();
    await f(`${b}/sektor`).selectOption("Energie");
    await f(`${b}/kritische_dienstleistung`).fill("Stromverteilung");
    await f(`${b}/ist/stand`).fill("2026-10-13T22:30");
    await f(`${b}/ist/leistungsgrad=ausgefallen`).check({ force: true });
    await f("/sachverhalte/0/eintritt/zeit").fill("2026-10-13T21:50");
    await seite.locator('[data-fokus="schritt:quellen"]').click();
    await f("aktion:quelle").click();
    await seite.locator('[data-fokus="schritt:dienstleistung"]').click();
    await f(`${b}/kennzahlen/betroffene_anschluesse=gezaehlt`).check({ force: true });
    await f("/sachverhalte/0/kennzahlen/0/wert").fill("1200");
    await seite.locator('[data-fokus="schritt:lage"]').click();
    await f("/sachverhalte/0/bezeichnung").fill("FIKTIV – Stromausfall Netzgebiet Süd");
    await f("/sachverhalte/0/analyse/lage_ereignis").fill("FIKTIV – 1.200 Anschlüsse ohne Strom seit 13.10., 21:50 Uhr [Q1].");
    const neu = await ausgeben(seite, "neu.json");
    const r = pruefeMeldung(neu.daten);
    assert.equal(r.gueltig, true, JSON.stringify(r.befunde));
    const sv = neu.daten.sachverhalte[0];
    // Datum der Kennung: Anlagedatum, also der Tag der ersten Meldung (Kodierleitfaden)
    assert.match(sv.kennung, new RegExp(`^KRITIS-NETZ-SUED-${neu.daten.meldezeitpunkt.slice(0, 10).replaceAll("-", "")}-[0-9A-HJKMNP-TV-Z]{6}$`));
    assert.deepEqual(sv.eintritt, { zeit: "2026-10-13T21:50+02:00", genauigkeit: "belegt" });
    assert.equal(sv.module["lead-kritis-betrieb"].kennzahlen.betroffene_anschluesse, "K1");
    assert.equal(sv.kennzahlen[0].wert, 1200);
    assert.equal(sv.kennzahlen[0].datenstand, "2026-10-13T22:30+02:00");
    assert.equal(neu.daten.absender.gebiet.schluessel, "DE-TH");
    assert.equal(neu.daten.status, "zur_freigabe");
    assert.equal(neu.daten.beziehungen, undefined);
    assert.equal(sv.bewertung, undefined);
  });

  let erst;
  await t.test("Beispiel wird bis auf den Herkunftsnachweis unverändert und gültig ausgegeben", async () => {
    await seite.locator("#oeffnen").click();
    await seite.locator("#beispiel").click();
    // Entwurf schon bearbeitet: Rückfrage bestätigen
    await seite.locator("#rueckfrage-ok").click();
    await seite.locator(".kasten", { hasText: "Beispiel geladen" }).waitFor();
    await seite.locator('[data-fokus="schritt:pruefen"]').click();
    if ((await seite.locator(".ergebnis-ok").count()) !== 1) assert.fail(await seite.locator(".befunde").first().textContent());
    erst = await ausgeben(seite, "erst.json");
    const { entstehung, ...rest } = erst.daten;
    const { entstehung: _e, ...soll } = beispiel;
    assert.deepEqual(rest, soll);
    assert.equal(entstehung.verfahren, "manuell");
    assert.equal(entstehung.werkzeug.name, "KRITIS-LEAD, Betreiberformular");
    assert.match(entstehung.erstellt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    assert.match(erst.vorschlag, /^2026-10-14T06-30_KRITIS-Meldung_Zweckverband-Trinkwasser-Neuhaus-am-Rennweg_Erstmeldung_FIKTIV\.json$/);
    const r = pruefeMeldung(erst.daten);
    assert.equal(r.gueltig, true, JSON.stringify(r.befunde));
  });

  await t.test("Vormeldung fortschreiben ergibt gültige Folgemeldung", async () => {
    await seite.locator("#vormeldung").setInputFiles(erst.datei);
    await seite.locator("#status", { hasText: /^Folgemeldung/ }).waitFor({ timeout: 5000 });
    await seite.getByRole("button", { name: /Lage und Einschätzung/ }).first().click();
    await seite.getByLabel("Änderung zur Vormeldung").fill("Notstrom am Pumpwerk läuft stabil; Nachbetankung bestätigt.");
    const folge = await ausgeben(seite, "folge.json");
    const k = folge.daten.module["lead-kritis-meldung"];
    assert.equal(k.meldeart, "Folgemeldung");
    assert.deepEqual(folge.daten.beziehungen, [{ art: "fortschreibung_von", meldung_id: beispiel.meldung_id }]);
    assert.notEqual(folge.daten.meldung_id, beispiel.meldung_id);
    assert.equal(folge.daten.status, "zur_freigabe");
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
