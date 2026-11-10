// Grunddesign der App-Familie (seit 0.3.5): gepinnte Tokens, Farben aus dem Farbschema des Profils mit Kontrastprüfung
// (LD-F01 bis LD-F06), neutrale Ansprache (LD-T03), Kennsatz (LD-A01), Blätterknöpfe mit Ziel (LD-A05, LD-B02),
// Zielgrößen und Fokus an Chips und Segmenten (LD-B01, LD-Z02), erzwungene Farben und mehr Kontrast (LD-R03, LD-F05).
// Abgleich und offene Punkte: docs/design-abweichungen.md. Browserteile ohne Chromium übersprungen, in der CI Pflicht.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { KATALOG, ROLLEN, SIGNALE, farbCss, kontrastFehler, schemata } from "../werkzeuge/bauen/farben.mjs";

const pfad = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const url = pathToFileURL(pfad("formular/betreibermeldung.html")).href;
const quelle = JSON.parse(lies("kern/design/quelle.json"));
const profil = JSON.parse(lies("profil/lead-kritis/profil.json"));

test("kern/design/quelle.json: Repository, Commit, Fassung; Kopien unverändert", () => {
  assert.equal(quelle.repository, "https://github.com/pereirawolf/ki-lead");
  assert.match(quelle.commit, /^[0-9a-f]{40}$/);
  assert.match(quelle.fassung, /^\d+\.\d+$/);
  for (const d of quelle.dateien) {
    const hash = createHash("sha256").update(readFileSync(pfad(d.ziel))).digest("hex");
    assert.equal(hash, d.sha256, `${d.ziel} verändert: Fassung bewusst wechseln und quelle.json anpassen`);
  }
});

test("Bezugsfassung ist überall dieselbe: README, docs/design-abweichungen.md und kern/design/ verweisen auf denselben Commit", () => {
  for (const datei of ["README.md", "docs/design-abweichungen.md"]) {
    const t = lies(datei);
    assert.ok(t.includes(`pereirawolf/ki-lead/blob/${quelle.commit}/design/README.md`), `${datei}: Permalink auf ${quelle.commit}`);
    assert.ok(!/pereirawolf\/ki-lead\/blob\/main\/design\//.test(t), `${datei}: kein Verweis auf main`);
  }
});

test("Farbschema aus dem Profil (LD-F01): Basis aus dem Katalog, alle vier Schemata erreichen ihre Kontraste (LD-F03)", () => {
  assert.ok(profil.farbschema?.basis, "profil.json nennt farbschema.basis");
  assert.ok(KATALOG[profil.farbschema.basis], "Basis steht im Katalog (LD-F02)");
  const s = schemata(profil.farbschema);
  assert.deepEqual(Object.keys(s), ["hell", "dunkel", "kontrast-hell", "kontrast-dunkel"]);
  assert.equal(s.hell.id, profil.farbschema.basis);
  for (const x of Object.values(s)) assert.deepEqual(kontrastFehler(x), [], x.id);
  // Ein Schema mit unlesbarer Profilfarbe wird nicht gebaut
  assert.throws(() => farbCss({ basis: "bevoelkerungsschutz", farben: { tinte: "#DDDDDD" } }), /Kontraste verfehlt/);
  assert.throws(() => farbCss({ basis: "gibt-es-nicht" }), /nicht im Katalog/);
});

test("Stylesheet setzt keine Farbwerte (LD-F06); Signalfarben heißen wie im Grunddesign (LD-F04)", () => {
  const stil = lies("formular/quelle/stil.css");
  assert.deepEqual(stil.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [], []);
  assert.doesNotMatch(stil, /--(fehler|warnung)\b/);
  const css = farbCss(profil.farbschema);
  for (const n of [...ROLLEN, ...SIGNALE, "band"]) assert.match(css, new RegExp(`--${n}: `), n);
  for (const m of ["prefers-color-scheme: dark", "prefers-contrast: more"]) assert.ok(css.includes(m), m);
  // Formular und Startseite tragen dieselben Farben
  assert.ok(lies("formular/betreibermeldung.html").includes(css));
});

test("Oberfläche spricht neutral an, ohne „Sie“ (LD-T03)", () => {
  for (const datei of ["formular/quelle/vorlage.html", "formular/quelle/formular.mjs", "werkzeuge/bauen/seite-bauen.mjs", "werkzeuge/bauen/fusszeile.mjs", "werkzeuge/bauen/darstellung.mjs", "formular/quelle/darstellung.mjs"]) {
    const ohneKommentare = lies(datei).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    assert.deepEqual(ohneKommentare.match(/\b(Sie|Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres|Ihnen|du|dein\w*)\b/g) ?? [], [], datei);
  }
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
  const kontext = await browser.newContext({ offline: true, ...opt });
  const p = await kontext.newPage();
  await p.goto(url);
  await p.locator(".schritte").waitFor();
  return { p, kontext };
}
const variable = (p, n) => p.evaluate((x) => getComputedStyle(document.documentElement).getPropertyValue(`--${x}`).trim(), n);

test("Kennsatz dauerhaft (LD-A01, LD-A02); Blätterknöpfe „Zurück: <Titel>“ leise und „Weiter: <Titel>“ als Hauptknopf (LD-A05, LD-B02)", { skip: grund || false }, async () => {
  for (const breite of [1280, 390]) {
    const { p, kontext } = await seite({ viewport: { width: breite, height: 900 } });
    await p.locator('[data-fokus="schritt:ersatz"]').click();
    const zurueck = p.getByRole("button", { name: "Zurück: Dienstleistung und Istzustand" });
    const weiter = p.getByRole("button", { name: "Weiter: Lage und Einschätzung" });
    assert.equal(await zurueck.count(), 1, `${breite} px: Zurück mit Ziel`);
    assert.equal(await weiter.count(), 1, `${breite} px: Weiter mit Ziel`);
    assert.match(await zurueck.getAttribute("class"), /\bleise\b/);
    assert.match(await weiter.getAttribute("class"), /\bprimaer\b/);
    assert.ok(await weiter.isVisible() && (await zurueck.isVisible()), `${breite} px: sichtbar`);
    // Kennsatz bleibt, auch wenn die Einführung bei begonnenem Entwurf entfällt (KL-UX-30)
    await p.locator('[data-fokus="schritt:meldung"]').click();
    await p.locator('#arbeitsbereich input[type="text"]:not([readonly])').first().fill("Betreiber X (FIKTIV)");
    await p.keyboard.press("Tab");
    await p.reload();
    await p.locator(".schritte").waitFor();
    assert.equal(await p.locator(".kennsatz").textContent(), "Erfassung einer Betreibermeldung nach LEAD-Systematik");
    assert.ok(await p.locator(".kennsatz").isVisible());
    assert.equal(await p.locator(".einfuehrung").isHidden(), true);
    const breiter = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(breiter, false, `${breite} px: kein waagerechtes Scrollen`);
    await kontext.close();
  }
});

test("Chips bei grober Zeigereingabe 44 px (LD-B01); Fokus an Chips und Segmenten in „fokus“ mit zweitem Ring (LD-Z02)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  assert.equal(await p.evaluate(() => matchMedia("(pointer: coarse)").matches), true);
  const hoehe = await p.locator(".chip").first().evaluate((e) => e.getBoundingClientRect().height);
  assert.ok(hoehe >= 44, `Chip ${hoehe} px`);
  await kontext.close();

  const { p: q, kontext: k2 } = await seite({ viewport: { width: 1280, height: 900 } });
  const fokus = await variable(q, "fokus");
  const rgb = await q.evaluate((f) => { const d = document.createElement("i"); d.style.color = f; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, fokus);
  for (const sel of [".chip", ".segment"]) {
    await q.locator(`${sel} input`).first().focus();
    await q.keyboard.press("Shift+Tab");
    await q.keyboard.press("Tab");
    const s = await q.locator(sel).filter({ has: q.locator("input:focus-visible") }).first().evaluate((e) => {
      const c = getComputedStyle(e);
      return { farbe: c.outlineColor, breite: c.outlineWidth, ring: c.boxShadow };
    });
    assert.equal(s.farbe, rgb, `${sel}: Ring in „fokus“`);
    assert.equal(s.breite, "3px", sel);
    assert.match(s.ring, /2px/, `${sel}: zweiter Ring`);
  }
  await k2.close();
});

test("Mehr Kontrast ergibt das Kontrastschema, erzwungene Farben kein Band (LD-F05, LD-R03)", { skip: grund || false }, async () => {
  const s = schemata(profil.farbschema);
  for (const [opt, erwartet] of [
    [{ colorScheme: "light" }, s.hell],
    [{ colorScheme: "dark" }, s.dunkel],
    [{ colorScheme: "light", contrast: "more" }, s["kontrast-hell"]],
    [{ colorScheme: "dark", contrast: "more" }, s["kontrast-dunkel"]],
  ]) {
    const { p, kontext } = await seite(opt);
    assert.equal((await variable(p, "papier")).toUpperCase(), erwartet.werte.papier, JSON.stringify(opt));
    assert.equal((await variable(p, "kritisch")).toUpperCase(), erwartet.werte.kritisch, JSON.stringify(opt));
    await kontext.close();
  }
  const { p, kontext } = await seite({ forcedColors: "active" });
  assert.equal(await p.locator(".kopf").evaluate((e) => getComputedStyle(e).borderImageSource), "none");
  await kontext.close();
});

// Hinweisband und Kopfbereich nach Grunddesign 1.6 (LD-R01, LD-R04; Entscheidung des Herausgebers vom 10.11.2026)
const WORTLAUT = "Forschungsdemonstrator · Nur fiktive oder offen zugängliche Inhalte verwenden – keine personenbezogenen und keine eingestuften Daten.";

test("Hinweisband: einheitlicher Wortlaut der App-Familie im Kopfbereich; Zusätze von KRITIS-LEAD außerhalb des Bands (LD-R04)", async () => {
  const { HINWEIS_KENNUNG, HINWEIS_TRENNER, HINWEIS_TEXT, hinweisband } = await import("../werkzeuge/bauen/hinweisband.mjs");
  assert.equal(`${HINWEIS_KENNUNG}${HINWEIS_TRENNER}${HINWEIS_TEXT}`.replace(/ /g, " "), WORTLAUT);
  assert.equal(HINWEIS_TRENNER, " · ", "gleicher, geschützter Abstand um den Mittelpunkt");
  const formular = lies("formular/betreibermeldung.html");
  assert.ok(formular.includes(`<header class="kopfbereich">`), "Kopfbereich im Formular");
  assert.ok(formular.includes(hinweisband()), "Band im Formular");
  assert.equal((formular.match(/class="hinweisband"/g) ?? []).length, 1);
  assert.ok(!formular.includes("Nur fiktive Daten."), "alter Wortlaut entfallen");
  // „sendet nichts“ in der Fußzeile, „keine Meldepflicht“ in Schritt 1, im Druck und auf der Startseite
  assert.match(lies("werkzeuge/bauen/fusszeile.mjs"), /das Betreiberformular sendet nichts/);
  assert.match(lies("formular/quelle/formular.mjs"), /Das Formular ist kein Meldeweg: Es ersetzt keine gesetzliche Meldung und begründet keine Meldepflicht\./);
  assert.match(lies("formular/quelle/formular.mjs"), /class: "nur-druck" }, "KRITIS-LEAD ist kein Meldeweg/);
  assert.match(lies("werkzeuge/bauen/seite-bauen.mjs"), /<p>Privates Forschungsvorhaben zur Veranschaulichung einer Methode: kein Meldeweg, keine Meldepflicht/);
  // Fläche in der tiefen Aktionsfarbe, keine Signalfarbe (LD-F04)
  const stil = lies("formular/quelle/stil.css");
  const regel = stil.match(/\n\.hinweisband \{([^}]*)\}/)?.[1] ?? "";
  assert.match(regel, /background: var\(--amt-tief\);/);
  assert.match(regel, /color: var\(--auf-amt-hover\);/);
  for (const s of SIGNALE) assert.ok(!regel.includes(`--${s})`), s);
  assert.match(stil, /\n\.kopfbereich \{ position: sticky; top: 0;/);
  assert.match(stil, /\.schritte ol \{[^}]*top: calc\(var\(--kopf-hoehe/);
});

test("Kopfbereich läuft mit, Band nach dem Scrollen einzeilig, kein Umbruch nach der Kennung (LD-R01, LD-R04)", { skip: grund || false }, async () => {
  for (const breite of [390, 1280]) {
    const { p, kontext } = await seite({ viewport: { width: breite, height: 800 } });
    const band = p.getByRole("note");
    assert.equal((await band.textContent()).replace(/ /g, " ").replace(" · . ", " · "), WORTLAUT);
    const zeilen = await band.evaluate((b) => {
      const k = b.querySelector("strong").getClientRects();
      const text = [...b.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      const r = document.createRange();
      r.setStart(text, 0);
      r.setEnd(text, 3);
      return { kennung: Math.round(k[k.length - 1].top), text: Math.round(r.getClientRects()[0].top) };
    });
    assert.equal(zeilen.text, zeilen.kennung, `${breite} px: kein Umbruch nach der Kennung`);
    const tief = await p.evaluate(() => { const d = document.createElement("i"); d.style.color = "var(--amt-tief)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    assert.equal(await band.evaluate((b) => getComputedStyle(b).backgroundColor), tief, `${breite} px: tiefe Aktionsfarbe`);
    const voll = (await band.boundingBox()).height;
    // Inhalt verlängern, damit sich weit genug scrollen lässt
    await p.locator('[data-fokus="schritt:ersatz"]').click();
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForFunction(() => document.querySelector(".kopfbereich").classList.contains("kompakt"));
    await p.waitForTimeout(300);
    const eng = (await band.boundingBox()).height;
    assert.ok(eng < 28 && eng <= voll, `${breite} px: einzeilig (${eng} px, voll ${voll} px)`);
    const kopf = await p.locator(".kopfbereich").boundingBox();
    assert.equal(kopf.y, 0, `${breite} px: Kopfbereich oben`);
    assert.ok(await p.locator(".kopf").isVisible(), `${breite} px: Kopfleiste sichtbar`);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForFunction(() => !document.querySelector(".kopfbereich").classList.contains("kompakt"));
    await kontext.close();
  }
});
