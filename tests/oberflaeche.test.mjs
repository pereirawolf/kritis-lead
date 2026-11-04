// Oberfläche des Betreiberformulars nach der zweiten UX-Prüfung (0.3.4, KL-UX-14 bis KL-UX-30): Rückfrage beim Beispiel,
// Rückgängig nach dem Entfernen, Hinweis zur letzten Aktion, Schritt 6 mit Zusammenfassung und Folgemeldung, Namen zum
// Regionalschlüssel, Übernehmen von Eintritt und Ort, Quellen und Zeitstrahl als Liste, Haken in der Schrittleiste,
// schmale Ansicht. Ohne Chromium übersprungen, in der CI Pflicht (KRITIS_BROWSER_PFLICHT=1).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { zeilen, quelleLesen, quelleSchreiben, zeileLesen, zeileSchreiben } from "../formular/quelle/textlisten.mjs";
import { BEISPIEL, kreise } from "../werkzeuge/bauen/formular-bauen.mjs";

const pfad = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const url = pathToFileURL(pfad("formular/betreibermeldung.html")).href;
const beispielDaten = JSON.parse(readFileSync(pfad(BEISPIEL), "utf-8"));
const SPEICHER = "kritis-lead-betreiberformular-entwurf";

test("Quellenverzeichnis und Zeitstrahl: jede Zeile aus Szenario und Konformitätsfällen wird zerlegt und unverändert zusammengesetzt (KL-UX-27)", () => {
  let n = 0;
  for (const ordner of ["szenario/orkantief-ilka-sonneberg", "konformitaet/negativ"]) {
    for (const datei of readdirSync(pfad(ordner)).filter((d) => d.endsWith(".json"))) {
      const m = JSON.parse(readFileSync(pfad(`${ordner}/${datei}`), "utf-8"));
      for (const [text, lesen, schreiben] of [[m.quellen, quelleLesen, quelleSchreiben], [m.zeitstrahl, zeileLesen, zeileSchreiben]]) {
        for (const z of zeilen(text)) {
          const e = lesen(z);
          assert.equal(e.frei, undefined, `${datei}: nicht zerlegt: ${z}`);
          assert.equal(schreiben(e), z, datei);
          n++;
        }
      }
    }
  }
  assert.ok(n > 50);
  // Eine Zeile, die nicht der Form folgt, bleibt unverändert
  const frei = "[Q3]  Eintrag ohne Form";
  assert.equal(quelleSchreiben(quelleLesen(frei)), frei);
  assert.equal(quelleLesen(frei).nr, 3);
});

test("Thüringer Regionalschlüssel: nur Schlüssel und Namen, vollständig und zu den Kreisen passend (KL-UX-29)", () => {
  const t = JSON.parse(readFileSync(pfad("formular/daten/thueringen-regionen.json"), "utf-8"));
  assert.deepEqual(Object.keys(t).sort(), ["abruf", "gemeinden", "hinweis", "kreise", "quelle", "stand", "url", "verbaende"]);
  for (const [k, laenge] of [["kreise", 5], ["verbaende", 9], ["gemeinden", 12]]) {
    for (const [ars, name] of Object.entries(t[k])) {
      assert.match(ars, new RegExp(`^16\\d{${laenge - 2}}$`), `${k}: ${ars}`);
      assert.ok(typeof name === "string" && name && !/@|https?:|\d{4,}/.test(name), `${k}: ${ars} ${name}`);
    }
  }
  assert.ok(Object.keys(t.gemeinden).length > 500);
  for (const ars of Object.keys(t.gemeinden)) {
    assert.ok(t.verbaende[ars.slice(0, 9)], `Gemeinde ${ars} ohne Gemeindeverband`);
    assert.ok(t.kreise[ars.slice(0, 5)], `Gemeinde ${ars} ohne Kreis`);
  }
});

test("Thüringer Kreise im Formular aus dem Verzeichnis des Landesamts, nicht aus dem Kreisverzeichnis von 2018 (KL-UX-29)", () => {
  const t = JSON.parse(readFileSync(pfad("formular/daten/thueringen-regionen.json"), "utf-8"));
  const k = kreise();
  assert.deepEqual(Object.keys(k).filter((a) => a.startsWith("16")), Object.keys(t.kreise).sort());
  assert.equal(k["16056"], undefined, "Eisenach gehört seit 01.07.2021 zum Wartburgkreis");
  assert.equal(k["16051"], "Erfurt (kreisfreie Stadt)");
  assert.equal(k["16063"], "Wartburgkreis");
  assert.equal(k["16071"], "Landkreis Weimarer Land");
  assert.equal(k["16072"], "Landkreis Sonneberg");
  assert.equal(k["09462"], "Bayreuth (kreisfreie Stadt)");
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

async function seite(opt = {}) {
  const kontext = await browser.newContext({ offline: true, acceptDownloads: true, ...opt });
  const p = await kontext.newPage();
  const fehler = [];
  p.on("pageerror", (e) => fehler.push(e.message));
  await p.goto(url);
  await p.locator(".schritte").waitFor();
  return { p, kontext, fehler };
}
const entwurf = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k)), SPEICHER);
const aktiv = (p) => p.evaluate(() => document.activeElement.dataset?.fokus || document.activeElement.id || "");
async function beispiel(p) {
  await p.locator("#oeffnen").click();
  await p.locator("#beispiel").click();
}

test("Meldung öffnen, Rückfrage beim Beispiel und Hinweis zur letzten Aktion (KL-UX-15, -17, -30)", { skip: grund || false }, async () => {
  const { p, kontext, fehler } = await seite();
  // Einführung, solange der Entwurf unberührt ist; Aufklappliste mit Escape schließen
  assert.equal(await p.locator(".einfuehrung").isVisible(), true);
  await p.locator("#oeffnen").click();
  assert.equal(await p.locator("#oeffnen").getAttribute("aria-expanded"), "true");
  assert.equal(await aktiv(p), "vormeldung-waehlen");
  await p.keyboard.press("Escape");
  assert.equal(await p.locator("#oeffnen-liste").isHidden(), true);
  assert.equal(await aktiv(p), "oeffnen");
  // unberührt: Beispiel ohne Rückfrage, Hinweis unter der Werkzeugleiste, Einführung entfällt
  await beispiel(p);
  assert.equal(await p.locator("#rueckfrage[open]").count(), 0);
  assert.match(await p.locator("#meldungen").textContent(), /^Beispiel geladen/);
  assert.equal(await p.locator(".einfuehrung").isHidden(), true);
  // Schrittwechsel beendet den Hinweis
  await p.locator('[data-fokus="schritt:lage"]').click();
  assert.equal(await p.locator("#meldungen").textContent(), "");
  // berührt: Rückfrage; Abbrechen behält den Entwurf, Fokus zurück auf „Meldung öffnen“
  await p.locator('[data-fokus="/sachverhalte/0/bezeichnung"]').fill("FIKTIV – geändert");
  await beispiel(p);
  assert.equal(await p.locator("#rueckfrage[open]").count(), 1);
  assert.equal(await p.locator("#rueckfrage-titel").textContent(), "Beispiel laden?");
  await p.keyboard.press("Escape");
  // das close-Ereignis des Dialogs folgt asynchron
  await p.waitForFunction(() => document.activeElement.id === "oeffnen", null, { timeout: 5000 });
  assert.equal((await entwurf(p)).sachverhalte[0].bezeichnung, "FIKTIV – geändert");
  await beispiel(p);
  await p.locator("#rueckfrage-ok").click();
  await p.locator("#meldungen", { hasText: "Beispiel geladen" }).waitFor({ timeout: 5000 });
  assert.equal((await entwurf(p)).sachverhalte[0].bezeichnung, beispielDaten.sachverhalte[0].bezeichnung);
  assert.deepEqual(fehler, []);
  await kontext.close();
});

test("Entfernen mit Rückgängig, an derselben Stelle (KL-UX-16)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await beispiel(p);
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  const liste = "/sachverhalte/0/betrieb/abhaengigkeiten";
  const vorher = (await entwurf(p)).sachverhalte[0].betrieb.abhaengigkeiten;
  await p.locator(`[data-fokus="${liste}#entfernen1"]`).click();
  assert.equal((await entwurf(p)).sachverhalte[0].betrieb.abhaengigkeiten.length, vorher.length - 1);
  assert.match(await p.locator(".rueckgaengig").textContent(), /^Abhängigkeit 2 entfernt\./);
  assert.equal(await aktiv(p), `${liste}#rueckgaengig`);
  await p.keyboard.press("Enter");
  assert.deepEqual((await entwurf(p)).sachverhalte[0].betrieb.abhaengigkeiten, vorher);
  assert.equal(await p.locator(".rueckgaengig").count(), 0);
  // eine weitere Änderung beendet das Angebot
  await p.locator(`[data-fokus="${liste}#entfernen0"]`).click();
  await p.locator('[data-fokus="/sachverhalte/0/betrieb/prognose/begruendung"]').fill("geändert");
  assert.equal(await p.locator(".rueckgaengig").count(), 0);
  await kontext.close();
});

test("Schritt 2 bis 4: Name zum Regionalschlüssel, Bestätigungsgrad beim Istzustand, BCM eingeklappt, Eintritt und Ort übernehmen (KL-UX-26, -28, -29)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await beispiel(p);
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  const ars = p.locator('[data-fokus="/sachverhalte/0/betrieb/raum/ars/0"]');
  const name = p.locator(`#${(await ars.getAttribute("aria-describedby")).split(" ")[0]}`);
  assert.equal(await name.textContent(), "Landkreis Sonneberg (Thüringen)");
  await ars.fill("16051");
  assert.equal(await name.textContent(), "Erfurt (kreisfreie Stadt) (Thüringen)");
  await ars.fill("160720040");
  assert.match(await name.textContent(), /^Gemeindeverband in Landkreis Sonneberg/, "unbekannter Verband: allgemeiner Name");
  // Thüringen bis auf Gemeinde aus dem Verzeichnis des Landesamts
  await ars.fill("160725051");
  assert.equal(await name.textContent(), "Erfüllende Gemeinde Neuhaus am Rennweg, Stadt · Landkreis Sonneberg (Thüringen)");
  await ars.fill("160725051006");
  assert.equal(await name.textContent(), "Goldisthal · Landkreis Sonneberg (Thüringen)");
  await ars.fill("091620000000");
  assert.equal(await name.textContent(), "Gemeinde in München (kreisfreie Stadt) (Bayern)");
  await ars.fill("16072");
  assert.equal(await p.locator('[data-pfad="/sachverhalte/0/betrieb/bestaetigungsgrad"]').count(), 1);
  // BCM bei geladener Meldung eingeklappt, Felder im Dokument
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  assert.equal(await p.locator("#bcm-inhalt").isHidden(), true);
  assert.match(await p.locator(".bcm-kopf").textContent(), /Reaktiv-BCMS/);
  await p.locator('[data-fokus="schalter:bcm-umschalten"]').click();
  assert.equal(await p.locator("#bcm-inhalt").isVisible(), true);
  // Eintritt und Ort: leer → Übernehmen aus Schritt 1 und 2
  await p.evaluate((k) => {
    const m = JSON.parse(localStorage.getItem(k));
    m.sachverhalte[0].eintritt = "";
    m.sachverhalte[0].ort = "";
    m.sachverhalte[0].betrieb.ist.beginn = "2026-10-13T22:00";
    localStorage.setItem(k, JSON.stringify(m));
  }, SPEICHER);
  await p.reload();
  await p.locator('[data-fokus="schritt:lage"]').click();
  await p.locator('[data-fokus="aktion:eintritt"]').click();
  await p.locator('[data-fokus="aktion:ort"]').click();
  const sv = (await entwurf(p)).sachverhalte[0];
  assert.equal(sv.eintritt, "2026-10-13T22:00");
  assert.equal(sv.ort, `Thüringen; Landkreis Sonneberg (${sv.betrieb.raum.beschreibung})`);
  assert.equal(await p.locator('[data-fokus="aktion:ort"]').count(), 0);
  await kontext.close();
});

test("Quellen und Zeitstrahl als Liste: Bearbeiten ändert nur die eigene Zeile, „Als Text bearbeiten“ (KL-UX-27)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await beispiel(p);
  await p.locator('[data-fokus="schritt:quellen"]').click();
  await p.locator('[data-fokus="/zeitstrahl#neu"]').click();
  assert.equal(await aktiv(p), "/zeitstrahl/1/zeit");
  await p.locator('[data-fokus="/zeitstrahl/1/text"]').fill("Nachbetankung 2.000 l");
  const m = await entwurf(p);
  const z = m.zeitstrahl.split("\n");
  assert.equal(z[0], beispielDaten.zeitstrahl);
  assert.equal(z[1], `[Z2] ${m.meldezeitpunkt} · ${m.sachverhalte[0].kennung} · Ereignis – Nachbetankung 2.000 l [Q1] · aufgenommen ${m.meldezeitpunkt}`);
  await p.locator('[data-fokus="/quellen/0/herausgeber"]').fill("Zweckverband (FIKTIV)");
  assert.match((await entwurf(p)).quellen, /^\[Q1\] B – Zweckverband \(FIKTIV\) \(14\.10\.2026\): Leitwarte/);
  await p.locator('[data-fokus="/quellen#ansicht"]').click();
  assert.equal(await p.locator('textarea[data-fokus="/quellen"]').count(), 1);
  await kontext.close();
});

test("Schritt 6: Prüfergebnis vor Zusammenfassung und Freigabe, „Wie Erfassung“, nach der Ausgabe Folgemeldung (KL-UX-18 bis -21)", { skip: grund || false }, async () => {
  const { p, kontext, fehler } = await seite();
  await beispiel(p);
  await p.locator('[data-fokus="schritt:pruefen"]').click();
  assert.deepEqual(await p.locator(".schritt-inhalt h3").allTextContents(), ["Prüfergebnis", "Zusammenfassung", "Freigabe"]);
  assert.match(await p.locator(".zusammenfassung").textContent(), /Notstromaggregat Pumpwerk · eingesetzt · trägt 100 % · Reichweite bis 16\.10\., 10:00/);
  assert.equal(await p.locator('[data-fokus^="aktion:wie-erfassung"]').count(), 2);
  await p.locator('[data-fokus="/freigabe/versand/name"]').fill("Bereitschaft (FIKTIV)");
  await p.locator('[data-fokus="aktion:wie-erfassung-versand"]').click();
  assert.deepEqual((await entwurf(p)).freigabe.versand, beispielDaten.freigabe.versand);
  const [download] = await Promise.all([p.waitForEvent("download"), p.locator("#ausgeben").click()]);
  assert.match(download.suggestedFilename(), /_Erstmeldung_FIKTIV\.json$/);
  assert.match(await p.locator(".nach-ausgabe").textContent(), /Die Datei auf dem mit der Behörde vereinbarten Meldeweg übermitteln/);
  assert.equal(await aktiv(p), "aktion:folgemeldung");
  await p.keyboard.press("Enter");
  const m = await entwurf(p);
  assert.equal(m.kritis.meldeart, "Folgemeldung");
  assert.equal(m.kritis.bezug_meldung_id, beispielDaten.kritis.meldung_id);
  assert.match(await p.locator("#schritt-titel").textContent(), /^Schritt 1 von 6/);
  assert.deepEqual(fehler, []);
  await kontext.close();
});

test("Schrittleiste: Haken für besuchte Schritte ohne offene Angabe (KL-UX-29)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  assert.equal(await p.locator(".schritt.fertig").count(), 0);
  await beispiel(p);
  assert.equal(await p.locator(".schritt.fertig").count(), 6);
  assert.match(await p.locator('[data-fokus="schritt:lage"]').textContent(), /, vollständig$/);
  await p.locator('[data-fokus="schritt:lage"]').click();
  await p.locator('[data-fokus="/sachverhalte/0/bezeichnung"]').fill("");
  await p.keyboard.press("Tab");
  assert.equal(await p.locator('[data-fokus="schritt:lage"]').evaluate((e) => e.classList.contains("fertig")), false);
  assert.equal(await p.locator('[data-fokus="schritt:pruefen"]').evaluate((e) => e.classList.contains("fertig")), false);
  await kontext.close();
});

test("Schmale Ansicht: „Weiter: <Titel>“ am unteren Rand, Segmente untereinander (KL-UX-22, -30; LD-B02 seit 0.3.5)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite({ viewport: { width: 390, height: 844 } });
  const weiter = p.locator('[data-fokus="nav:weiter"]');
  assert.equal(await p.getByRole("button", { name: "Weiter: Dienstleistung und Istzustand" }).count(), 1, "Ziel im sichtbaren und zugänglichen Namen");
  assert.ok(await weiter.isVisible());
  const unten = await weiter.evaluate((e) => Math.round(window.innerHeight - e.getBoundingClientRect().bottom));
  assert.ok(unten >= 0 && unten < 30, `Abstand zum unteren Rand: ${unten}`);
  assert.equal(await p.locator('[data-pfad="/kritis/meldeart"] .segmente').evaluate((e) => getComputedStyle(e).flexDirection), "column");
  await kontext.close();
});
