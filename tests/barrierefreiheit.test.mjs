// Barrierefreiheit des Betreiberformulars (docs/BARRIEREFREIHEIT.md): axe-core über alle Schritte in zwei Ansichten,
// Bedienung mit der Tastatur (Fokus bleibt nach Auswahl, Schrittwechsel, Listen, Dialog, Sprung vom Befund zum Feld)
// und Verknüpfung der Fehlermeldungen. Ohne Chromium übersprungen, in der CI Pflicht (KRITIS_BROWSER_PFLICHT=1).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const axeQuelle = readFileSync(require.resolve("axe-core/axe.min.js"), "utf-8");
const url = pathToFileURL(fileURLToPath(new URL("../formular/betreibermeldung.html", import.meta.url))).href;
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

async function seite(opt = {}) {
  const kontext = await browser.newContext({ offline: true, ...opt });
  const p = await kontext.newPage();
  await p.goto(url);
  await p.locator(".schritte").waitFor();
  return { p, kontext };
}
const aktiv = (p) => p.evaluate(() => ({ tag: document.activeElement.tagName, id: document.activeElement.id, fokus: document.activeElement.dataset?.fokus || "", value: document.activeElement.value ?? "", checked: !!document.activeElement.checked }));

async function axe(p, wo) {
  if (!(await p.evaluate(() => !!window.axe))) await p.addScriptTag({ content: axeQuelle });
  const v = await p.evaluate(async (tags) => (await window.axe.run(document, { runOnly: tags })).violations.map((x) => `${x.id} (${x.impact}): ${x.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`), REGELN);
  return v.map((x) => `${wo}: ${x}`);
}

test("axe-core: keine Verstöße in allen Schritten, breit und hell sowie 390 px und dunkel", { skip: grund || false }, async () => {
  const befunde = [];
  for (const [ansicht, opt] of [
    ["breit, hell", { viewport: { width: 1280, height: 900 }, colorScheme: "light" }],
    ["390 px, dunkel", { viewport: { width: 390, height: 844 }, colorScheme: "dark" }],
  ]) {
    const { p, kontext } = await seite(opt);
    for (const zustand of ["leer", "Beispiel"]) {
      if (zustand === "Beispiel") await p.locator("#beispiel").click();
      const n = await p.locator(".schritte button").count();
      for (let i = 0; i < n; i++) {
        await p.locator(".schritte button").nth(i).click();
        befunde.push(...(await axe(p, `${ansicht}, ${zustand}, Schritt ${i + 1}`)));
      }
    }
    await p.locator("#neu").click();
    befunde.push(...(await axe(p, `${ansicht}, Rückfrage`)));
    await kontext.close();
  }
  assert.deepEqual(befunde, []);
});

test("Tastatur: Werkzeugleiste und Schrittleiste erreichbar, Schrittwechsel setzt den Fokus auf die Überschrift", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  const reihe = [];
  for (let i = 0; i < 6; i++) {
    await p.keyboard.press("Tab");
    reihe.push((await aktiv(p)).id || (await aktiv(p)).fokus);
  }
  assert.deepEqual(reihe, ["neu", "vormeldung-waehlen", "beispiel", "zur-pruefung", "schritt:meldung", "schritt:dienstleistung"]);
  await p.keyboard.press("Enter");
  assert.equal((await aktiv(p)).id, "schritt-titel");
  assert.match(await p.locator("#schritt-titel").textContent(), /^Schritt 2 von 6: Dienstleistung/);
  await kontext.close();
});

test("Tastatur: Fokus bleibt nach Auswahl von Option und Kontrollkästchen", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator('[data-fokus="/kritis/meldeart=Erstmeldung"]').focus();
  await p.keyboard.press("ArrowRight");
  let a = await aktiv(p);
  assert.equal(a.fokus, "/kritis/meldeart=Folgemeldung");
  assert.ok(a.checked);
  await p.locator('[data-fokus="/kritis/meldeanlass=Übung"]').focus();
  await p.keyboard.press("Space");
  a = await aktiv(p);
  assert.equal(a.fokus, "/kritis/meldeanlass=Übung");
  assert.ok(a.checked);
  await kontext.close();
});

test("Tastatur: Listen – neuer Eintrag erhält den Fokus, nach dem Entfernen „hinzufügen“", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator('[data-fokus="/kritis/empfaenger#neu"]').focus();
  await p.keyboard.press("Enter");
  assert.equal((await aktiv(p)).fokus, "/kritis/empfaenger/0");
  await p.keyboard.type("Krisenstab (Übungsrolle, FIKTIV)");
  await p.locator('[data-fokus="/kritis/empfaenger#entfernen0"]').focus();
  assert.equal(await p.locator('[data-fokus="/kritis/empfaenger#entfernen0"]').getAttribute("aria-label"), "Empfänger 1 entfernen");
  await p.keyboard.press("Enter");
  assert.equal((await aktiv(p)).fokus, "/kritis/empfaenger#neu");
  await kontext.close();
});

test("Rückfrage „Neue Meldung“: Fokus auf Abbrechen, Escape bricht ab, Fokus zurück", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator("#beispiel").click();
  await p.locator("#neu").focus();
  await p.keyboard.press("Enter");
  assert.equal((await aktiv(p)).id, "rueckfrage-abbrechen");
  await p.keyboard.press("Escape");
  assert.equal((await aktiv(p)).id, "neu");
  assert.match(await p.locator("#status").textContent(), /Zweckverband/, "Entwurf blieb erhalten");
  await p.keyboard.press("Enter");
  await p.locator("#rueckfrage-ok").click();
  await p.locator("#status", { hasText: "ohne Betreiber" }).waitFor({ timeout: 5000 });
  assert.equal((await aktiv(p)).id, "schritt-titel");
  await kontext.close();
});

test("Fehler sind mit dem Feld verknüpft; Befund führt zum Eingabeelement", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  const feld = p.locator('[data-fokus="/meldende_stelle"]');
  assert.equal(await feld.getAttribute("aria-invalid"), "true");
  const ids = (await feld.getAttribute("aria-describedby")).split(" ");
  assert.match(await p.locator(`#${ids[0]}`).textContent(), /Fehler: darf nicht leer sein/);
  assert.equal(await p.locator('[data-pfad="/kritis/meldeanlass"]').getAttribute("aria-describedby").then((d) => !!d), true);
  await p.locator("#zur-pruefung").click();
  await p.locator(".befund button", { hasText: "Sektor" }).first().click();
  const a = await aktiv(p);
  assert.equal(a.tag, "SELECT");
  assert.equal(a.fokus, "/sachverhalte/0/betrieb/sektor");
  await kontext.close();
});

test("Kennsatz einfügen: Fokus am Ende des Textfelds", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator("#beispiel").click();
  await p.locator('[data-fokus="schritt:lage"]').click();
  await p.locator('[data-fokus="kennsatz:Neubewertung bei:"]').click();
  const r = await p.evaluate(() => ({ fokus: document.activeElement.dataset.fokus, ende: document.activeElement.selectionStart === document.activeElement.value.length, kennsatz: document.activeElement.value.endsWith("\nNeubewertung bei: ") }));
  assert.deepEqual(r, { fokus: "/sachverhalte/0/sofort/bewertung_text", ende: true, kennsatz: true });
  await kontext.close();
});

test("Umbruch bei 320 px Breite: keine waagerechte Bildlaufleiste der Seite", { skip: grund || false }, async () => {
  const { p, kontext } = await seite({ viewport: { width: 320, height: 700 } });
  await p.locator("#beispiel").click();
  const n = await p.locator(".schritte button").count();
  for (let i = 0; i < n; i++) {
    await p.locator(".schritte button").nth(i).click();
    assert.ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= 320, `Schritt ${i + 1}`);
  }
  await kontext.close();
});
