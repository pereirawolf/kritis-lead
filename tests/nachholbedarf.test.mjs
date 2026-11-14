// Nachholbedarf aus dem Abgleich mit dem Grunddesign (seit 0.3.7, docs/design-abweichungen.md): sichere Bereiche (LD-R06),
// mitlaufende Schrittleiste (LD-A03), Fokus und Sprungziel nach einem Schrittwechsel (LD-A07), Reihenfolge im Feld
// (LD-E01), Kästen mit Randstreifen (LD-M01) und Umbrüche (LD-Z04). Referenz ist jeweils die Umsetzung in KI-LEAD.
// Browserteile ohne Chromium übersprungen, in der CI Pflicht.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const url = pathToFileURL(pfad("formular/betreibermeldung.html")).href;
const stil = lies("formular/quelle/stil.css");

/** Regel eines Selektors aus dem Stylesheet (erste Fundstelle, ohne verschachtelte Blöcke) */
const regel = (css, selektor) => css.match(new RegExp(`(?:^|\\n)${selektor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]*)\\}`))?.[1] ?? "";

test("LD-R06: Kopfleiste und Inhalt berücksichtigen die sicheren Bereiche oben, links und rechts; viewport-fit=cover", () => {
  const kopf = regel(stil, ".kopf");
  for (const seite of ["top", "left", "right"]) assert.match(kopf, new RegExp(`env\\(safe-area-inset-${seite}\\)`), `.kopf: ${seite}`);
  const inhalt = regel(stil, ".inhalt");
  for (const seite of ["left", "right"]) assert.match(inhalt, new RegExp(`env\\(safe-area-inset-${seite}\\)`), `.inhalt: ${seite}`);
  assert.match(regel(stil, ".fuss"), /env\(safe-area-inset-bottom\)/);
  // Ohne viewport-fit=cover liefert env(safe-area-inset-*) auf Geräten mit Aussparung 0
  for (const datei of ["formular/quelle/vorlage.html", "werkzeuge/bauen/seite-bauen.mjs", "formular/betreibermeldung.html"]) {
    assert.match(lies(datei), /<meta name="viewport" content="[^"]*viewport-fit=cover/, datei);
  }
});

test("LD-Z04: Umbrüche nur bei 860, 640 und 480 px, auch auf den Seiten", () => {
  const breiten = (css) => [...new Set([...css.matchAll(/@media \((?:max|min)-width: (\d+)px\)/g)].map((m) => Number(m[1])))].sort((a, b) => b - a);
  assert.deepEqual(breiten(stil), [860, 640, 480]);
  // Seite „Schnittstelle“: Inhaltsverzeichnis ab dem Umbruch „breit“ (861 px = über 860 px), bis 0.3.6 ab 1000 px
  assert.deepEqual(breiten(lies("werkzeuge/bauen/seite-bauen.mjs")), [861]);
  assert.match(lies("werkzeuge/bauen/seite-bauen.mjs"), /matchMedia\("\(min-width: 861px\)"\)/);
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

async function seite(viewport = { width: 1280, height: 600 }) {
  const kontext = await browser.newContext({ offline: true, viewport });
  const p = await kontext.newPage();
  await p.goto(url);
  await p.locator(".schritte").waitFor();
  return { p, kontext };
}
/** Abstand der Oberkante eines Elements von der Unterkante des Kopfbereichs (negativ: verdeckt) */
const abstandZumKopf = (p, sel) =>
  p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top - document.querySelector(".kopfbereich").getBoundingClientRect().bottom, sel);
const ansEnde = (p) => p.evaluate(() => (window.scrollTo(0, document.documentElement.scrollHeight), window.scrollY));
const fokus = (p) => p.evaluate(() => ({ id: document.activeElement?.id, fokus: document.activeElement?.dataset?.fokus }));
/** Farbe einer CSS-Variablen als rgb(), wie getComputedStyle sie liefert */
const farbe = (p, n) =>
  p.evaluate((x) => {
    const d = document.createElement("i");
    d.style.color = `var(--${x})`;
    document.body.append(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  }, n);

test("LD-A03: Schrittleiste läuft auf breiten Bildschirmen unter dem Kopfbereich mit", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  const weg = await ansEnde(p);
  assert.ok(weg > 300, `Schritt reicht über das Fenster hinaus (${weg} px)`);
  await p.waitForTimeout(300); // Kopfbereich wird nach dem Scrollen schmaler (LD-R04)
  const abstand = await abstandZumKopf(p, ".schritte ol");
  assert.ok(abstand >= 0 && abstand < 24, `Liste ${abstand.toFixed(1)} px unter dem Kopfbereich`);
  assert.ok(await p.locator('.schritte [aria-current="step"]').isVisible());
  await kontext.close();
});

test("LD-A07: „Weiter“ zeigt den Anfang des neuen Schritts mit Fokus auf der Überschrift; die Schrittleiste behält den Fokus", { skip: grund || false }, async () => {
  for (const viewport of [{ width: 1280, height: 600 }, { width: 390, height: 780 }]) {
    const { p, kontext } = await seite(viewport);
    await p.locator('[data-fokus="schritt:dienstleistung"]').click();
    assert.ok((await ansEnde(p)) > 300);
    await p.locator('[data-fokus="nav:weiter"]').click();
    assert.equal((await fokus(p)).id, "schritt-titel", `${viewport.width} px: Fokus auf der neuen Überschrift`);
    assert.match(await p.locator("#schritt-titel").textContent(), /^Schritt 3 von 6/);
    const abstand = await abstandZumKopf(p, "#arbeitsbereich");
    assert.ok(abstand >= 0 && abstand < 40, `${viewport.width} px: Arbeitsbereich ${abstand.toFixed(1)} px unter dem Kopfbereich`);
    assert.ok(await p.locator("#schritt-titel").isVisible());

    // Schrittleiste: Der Knopf behält den Fokus; steht der Anfang schon oben im Bild, bleibt die Ansicht stehen
    const vorher = await p.evaluate(() => window.scrollY);
    await p.locator('[data-fokus="schritt:lage"]').click();
    assert.equal((await fokus(p)).fokus, "schritt:lage", `${viewport.width} px: Fokus bleibt in der Schrittleiste`);
    assert.equal(await p.evaluate(() => window.scrollY), vorher, `${viewport.width} px: keine Bewegung ohne Bedarf`);

    // Vom Ende eines langen Schritts aus: Anfang des neuen Schritts ins Bild, Fokus weiter in der Schrittleiste
    await p.locator('[data-fokus="schritt:dienstleistung"]').click();
    await ansEnde(p);
    await p.locator('[data-fokus="schritt:meldung"]').click();
    assert.equal((await fokus(p)).fokus, "schritt:meldung");
    const neu = await abstandZumKopf(p, "#arbeitsbereich");
    assert.ok(neu >= -1 && neu < 40, `${viewport.width} px: Anfang des Schritts im Bild (${neu.toFixed(1)} px)`);
    await kontext.close();
  }
});

test("LD-E01: Fehlertext direkt hinter der Eingabe, vor Rückmeldungen wie dem Namen zum Regionalschlüssel", { skip: grund || false }, async () => {
  const { p, kontext } = await seite({ width: 1280, height: 900 });
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  await p.locator('[data-fokus$="raum/gebiete#neu"]').click();
  const eingabe = p.locator('[data-fokus$="raum/gebiete/0/schluessel"]');
  await eingabe.fill("x");
  await eingabe.press("Tab");
  // Beschriftung, Eingabe, Fehlertext, Rückmeldung (Name zum Schlüssel); bis 0.3.6 stand der Fehlertext am Ende
  const reihe = await p.locator('[data-pfad$="raum/gebiete/0/schluessel"]').evaluate((f) => [...f.children].map((c) => `${c.tagName.toLowerCase()}.${c.classList[0] ?? ""}`));
  assert.deepEqual(reihe, ["label.feld-label", "input.", "p.feld-meldung", "p.hinweis"]);
  // Allgemein: Nach dem Besuch des Prüfschritts steht jeder Fehlertext unmittelbar hinter seiner Eingabe
  await p.locator('[data-fokus="schritt:pruefen"]').click();
  for (const s of ["meldung", "dienstleistung", "ersatz", "lage", "quellen"]) {
    await p.locator(`[data-fokus="schritt:${s}"]`).click();
    const falsch = await p.evaluate(() =>
      [...document.querySelectorAll("#arbeitsbereich .feld-meldung")].filter((m) => {
        const feld = m.parentElement;
        if (!feld.querySelector(":scope > [data-feld-eingabe]")) return false; // Felder ohne eigene Eingabe (Kontrollkästchen)
        return !m.previousElementSibling?.hasAttribute("data-feld-eingabe");
      }).length,
    );
    assert.equal(falsch, 0, `Schritt ${s}`);
  }
  await kontext.close();
});

test("LD-M01: Information im Kasten mit Randstreifen in der Aktionsfarbe, „Datei nicht lesbar“ als Fehler mit Rolle alert", { skip: grund || false }, async () => {
  const { p, kontext } = await seite({ width: 1280, height: 900 });
  await p.locator("#oeffnen").click();
  await p.locator("#beispiel").click();
  const info = p.locator("#meldungen .kasten");
  assert.match(await info.getAttribute("class"), /\bkasten-info\b/);
  assert.equal(await info.getAttribute("role"), null);
  let s = await info.evaluate((e) => ({ farbe: getComputedStyle(e).borderLeftColor, breite: getComputedStyle(e).borderLeftWidth }));
  assert.equal(s.farbe, await farbe(p, "amt"));
  assert.equal(s.breite, "5px");

  await p.locator("#vormeldung").setInputFiles({ name: "kaputt.json", mimeType: "application/json", buffer: Buffer.from("{ kein JSON") });
  const fehler = p.locator('#meldungen .kasten[role="alert"]');
  await fehler.waitFor();
  assert.match(await fehler.textContent(), /^Datei nicht lesbar: /);
  assert.match(await fehler.getAttribute("class"), /\bkasten-fehler\b/);
  s = await fehler.evaluate((e) => ({ farbe: getComputedStyle(e).borderLeftColor, breite: getComputedStyle(e).borderLeftWidth }));
  assert.equal(s.farbe, await farbe(p, "kritisch"));
  assert.equal(s.breite, "5px");

  // Eine gültige JSON-Datei, die keine Betreibermeldung nach v2 ist, wird ebenfalls als Fehler abgewiesen
  await p.locator("#vormeldung").setInputFiles({ name: "fremd.json", mimeType: "application/json", buffer: Buffer.from("{}") });
  await p.locator('#meldungen .kasten-fehler[role="alert"]', { hasText: "Fortschreiben geht nur" }).waitFor();
  await kontext.close();
});
