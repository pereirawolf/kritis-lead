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
// „Beispiel laden“ liegt seit 0.3.4 hinter „Meldung öffnen“ (KL-UX-30); bei berührtem Entwurf mit Rückfrage (KL-UX-15)
async function beispiel(p) {
  await p.locator("#oeffnen").click();
  await p.locator("#beispiel").click();
  if (await p.locator("#rueckfrage[open]").count()) await p.locator("#rueckfrage-ok").click();
}
const zurPruefung = (p) => p.locator('[data-fokus="schritt:pruefen"]').click();
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
      if (zustand === "Beispiel") await beispiel(p);
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
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press("Tab");
    const a = await aktiv(p);
    reihe.push(a.id || a.fokus || a.tag);
  }
  // zuerst die Seitennavigation im Kopf (KL-UX-13) mit „Einstellungen“ am Ende (seit 0.3.6), dann Werkzeugleiste (seit
  // 0.3.4 „Meldung öffnen“ und „Neue Meldung“, KL-UX-30) und Schrittleiste
  assert.deepEqual(reihe, ["A", "A", "A", "einstellungen-oeffnen", "oeffnen", "neu", "schritt:meldung", "schritt:dienstleistung"]);
  await p.keyboard.press("Enter");
  assert.equal((await aktiv(p)).id, "schritt-titel");
  assert.match(await p.locator("#schritt-titel").textContent(), /^Schritt 2 von 6: Dienstleistung/);
  await kontext.close();
});

test("Tastatur: Fokus bleibt nach Auswahl von Option und Kontrollkästchen", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator('[data-fokus="/module/lead-kritis-meldung/meldeart=Erstmeldung"]').focus();
  await p.keyboard.press("ArrowRight");
  let a = await aktiv(p);
  assert.equal(a.fokus, "/module/lead-kritis-meldung/meldeart=Folgemeldung");
  assert.ok(a.checked);
  await p.locator('[data-fokus="/module/lead-kritis-meldung/meldeanlass=Übung"]').focus();
  await p.keyboard.press("Space");
  a = await aktiv(p);
  assert.equal(a.fokus, "/module/lead-kritis-meldung/meldeanlass=Übung");
  assert.ok(a.checked);
  await kontext.close();
});

test("Tastatur: Listen – neuer Eintrag erhält den Fokus, nach dem Entfernen „Rückgängig“, danach „hinzufügen“", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator('[data-fokus="/module/lead-kritis-meldung/empfaenger#neu"]').focus();
  await p.keyboard.press("Enter");
  assert.equal((await aktiv(p)).fokus, "/module/lead-kritis-meldung/empfaenger/0");
  await p.keyboard.type("Krisenstab (Übungsrolle, FIKTIV)");
  await p.locator('[data-fokus="/module/lead-kritis-meldung/empfaenger#entfernen0"]').focus();
  assert.equal(await p.locator('[data-fokus="/module/lead-kritis-meldung/empfaenger#entfernen0"]').getAttribute("aria-label"), "Empfänger 1 entfernen");
  await p.keyboard.press("Enter");
  // seit 0.3.4 (KL-UX-16) liegt der Fokus auf „Rückgängig“; nach dem Wiederherstellen auf „hinzufügen“
  assert.equal((await aktiv(p)).fokus, "/module/lead-kritis-meldung/empfaenger#rueckgaengig");
  await p.keyboard.press("Enter");
  assert.equal((await aktiv(p)).fokus, "/module/lead-kritis-meldung/empfaenger#neu");
  assert.equal(await p.locator('[data-fokus="/module/lead-kritis-meldung/empfaenger/0"]').inputValue(), "Krisenstab (Übungsrolle, FIKTIV)");
  await kontext.close();
});

test("Rückfrage „Neue Meldung“: Fokus auf Abbrechen, Escape bricht ab, Fokus zurück", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await beispiel(p);
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

test("Fehler sind mit dem Feld verknüpft; fehlende Pflichtangaben erst nach Bearbeiten oder Prüfschritt; Befund führt zum Eingabeelement", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  const feld = p.locator('[data-fokus="/absender/stelle"]');
  // KL-UX-02: eine neue Meldung zeigt keine fehlenden Pflichtangaben an den Feldern …
  assert.equal(await feld.getAttribute("aria-invalid"), null);
  assert.equal(await p.locator(".feld-meldung").count(), 0);
  assert.equal(await p.locator(".schritt-befund:not([hidden])").count(), 0);
  // … erst nach Bearbeiten und Verlassen
  await feld.fill("x");
  await p.keyboard.press("Tab");
  await feld.fill("");
  await p.keyboard.press("Tab");
  assert.equal(await feld.getAttribute("aria-invalid"), "true");
  const ids = (await feld.getAttribute("aria-describedby")).split(" ");
  assert.match(await p.locator(`#${ids[0]}`).textContent(), /^Fehler: Pflichtangabe fehlt\.$/);
  assert.equal(await p.locator('[data-pfad="/module/lead-kritis-meldung/meldeanlass"] .feld-meldung').count(), 0);
  // KL-UX-03: Punkt an der Schrittnummer, Zahl im zugänglichen Namen
  assert.match(await p.locator('[data-fokus="schritt:meldung"]').textContent(), /1 Feld mit Befund/);
  // nach dem Prüfschritt alle
  await zurPruefung(p);
  await p.locator('[data-fokus="schritt:meldung"]').click();
  assert.equal(await p.locator('[data-pfad="/module/lead-kritis-meldung/meldeanlass"]').getAttribute("aria-describedby").then((d) => !!d), true);
  await zurPruefung(p);
  await p.locator(".befund button", { hasText: "Sektor" }).first().click();
  const a = await aktiv(p);
  assert.equal(a.tag, "SELECT");
  assert.equal(a.fokus, "/sachverhalte/0/module/lead-kritis-betrieb/sektor");
  await kontext.close();
});

test("Prüfergebnis: je Feld ein Befund, nach Schritten, mit Abschnitt und ohne rohe Pfade (KL-UX-05)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await zurPruefung(p);
  const texte = await p.locator(".befund").allTextContents();
  assert.ok(texte.length > 5);
  assert.equal(new Set(texte).size, texte.length, "keine Doppelungen");
  assert.ok(texte.every((t) => !t.startsWith("/")), `rohe Pfade: ${texte.filter((t) => t.startsWith("/")).join("; ")}`);
  assert.ok(texte.includes("Istzustand › Datenstand: Pflichtangabe fehlt."), texte.join("; "));
  // KL-UX-14: leere Datenstände, die den des Istzustands übernehmen, zählen nicht eigens
  assert.ok(!texte.some((t) => /^(Anschlüsse|Personen|Prognose Wiederanlauf) › Datenstand/.test(t)), texte.join("; "));
  assert.match(await p.locator("#status").textContent(), /· 11 Angaben offen$/);
  assert.ok((await p.locator(".befund-schritt h4").allTextContents()).includes("Schritt 1: Meldung und Betreiber"));
  assert.equal(await p.locator("#ausgeben").isDisabled(), true);
  assert.equal(await p.locator("#ausgeben").evaluate((e) => e.classList.contains("primaer")), false);
  await kontext.close();
});

test("Listen: geladene Meldung mit mehreren Einträgen eingeklappt, Kopfzeile, Sprung öffnet das Element (KL-UX-04)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await beispiel(p);
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  const kopf = p.locator('[data-element="/sachverhalte/0/module/lead-kritis-betrieb/abhaengigkeiten/0"]');
  assert.match(await kopf.locator(".element-titel").textContent(), /^Abhängigkeit 1 · Stromverteilung/);
  assert.equal(await kopf.locator(".element-inhalt").isHidden(), true);
  assert.equal(await p.locator('[data-element="/sachverhalte/0/module/lead-kritis-betrieb/ersatzverfahren/0"] .element-inhalt').isVisible(), true, "einzelner Eintrag offen");
  await p.locator('[data-fokus="/sachverhalte/0/module/lead-kritis-betrieb/abhaengigkeiten#umschalten0"]').click();
  assert.equal(await kopf.locator(".element-inhalt").isVisible(), true);
  assert.equal((await aktiv(p)).fokus, "/sachverhalte/0/module/lead-kritis-betrieb/abhaengigkeiten#umschalten0");
  assert.equal(await p.locator('[data-fokus="/sachverhalte/0/module/lead-kritis-betrieb/abhaengigkeiten#umschalten0"]').getAttribute("aria-expanded"), "true");
  // Befund in einem eingeklappten Element: Sprung aus Schritt 6 öffnet es (Entwurf ändern und neu laden)
  await p.evaluate(() => {
    const k = "kritis-lead-betreiberformular-entwurf-v2";
    const m = JSON.parse(localStorage.getItem(k));
    m.sachverhalte[0].module["lead-kritis-betrieb"].abhaengigkeiten[1].dienstleistung = "";
    localStorage.setItem(k, JSON.stringify(m));
  });
  await p.reload();
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  const zweite = p.locator('[data-element="/sachverhalte/0/module/lead-kritis-betrieb/abhaengigkeiten/1"]');
  assert.equal(await zweite.locator(".element-inhalt").isHidden(), true);
  assert.match(await zweite.locator(".element-befund").textContent(), /1 Feld mit Befund/);
  await p.locator('[data-fokus="schritt:pruefen"]').click();
  await p.locator(".befund button", { hasText: "Abhängigkeit 2 › Dienstleistung" }).click();
  assert.equal(await zweite.locator(".element-inhalt").isVisible(), true);
  assert.equal((await aktiv(p)).fokus, "/sachverhalte/0/module/lead-kritis-betrieb/abhaengigkeiten/1/dienstleistung");
  await kontext.close();
});

test("Zahl, Belege, Vormeldung und Kennzeichnung (KL-UX-08 bis 11)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  // Wert nur bei „gezählt“ und „geschätzt“; die Zahl steht als Kennzahl des Sachverhalts, das Modul verweist auf sie
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  const wert = '[data-fokus="/sachverhalte/0/kennzahlen/0/wert"]';
  assert.equal(await p.locator(wert).count(), 0);
  await p.locator('[data-fokus="/sachverhalte/0/module/lead-kritis-betrieb/kennzahlen/betroffene_anschluesse=gezaehlt"]').check({ force: true });
  assert.equal(await p.locator(wert).count(), 1);
  // Erklärung der Erhebung nur einmal je Schritt
  assert.equal(await p.locator("text=gezählt = gezählt oder gemessen").count(), 1);
  // Langer Hinweis: erster Satz und „mehr“; Bildschirmleser erhalten den ganzen Text (KL-UX-12)
  const mehr = p.locator(".hinweis-mehr").first();
  assert.equal(await mehr.getAttribute("aria-expanded"), "false");
  assert.match(await mehr.getAttribute("aria-label"), /^mehr: Hinweis zu /);
  const ganz = await mehr.evaluate((b) => b.parentElement.querySelector(".sr").textContent);
  const sichtbar = await mehr.evaluate((b) => b.parentElement.querySelector("[aria-hidden]").textContent);
  assert.ok(sichtbar.length < ganz.length && ganz.startsWith(sichtbar));
  await mehr.click();
  assert.equal(await p.locator(".hinweis-mehr").first().getAttribute("aria-expanded"), "true");
  // Belege: ohne Quellenverzeichnis ein Hinweis, mit Quellen Kontrollkästchen je Quelle
  assert.match(await p.locator('[data-pfad="/sachverhalte/0/kennzahlen/0/quellen"]').textContent(), /noch keine Quelle/);
  await p.locator('[data-fokus="schritt:quellen"]').click();
  await p.locator('[data-fokus="aktion:quelle"]').click();
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  assert.equal(await p.locator('[data-fokus="/sachverhalte/0/kennzahlen/0/quellen=Q1"]').getAttribute("type"), "checkbox");
  // Folgemeldung ohne Vormeldung: Angebot an der Auswahl
  await p.locator('[data-fokus="schritt:meldung"]').click();
  assert.equal(await p.locator('[data-fokus="aktion:vormeldung"]').count(), 0);
  await p.locator('[data-fokus="/module/lead-kritis-meldung/meldeart=Abschlussmeldung"]').check({ force: true });
  assert.equal(await p.locator('[data-fokus="aktion:vormeldung"]').count(), 1);
  // Kennzeichnung in Schritt 6 als eine Zeile
  assert.equal(await p.locator('[data-fokus="/meldung_id"]').count(), 0);
  await p.locator('[data-fokus="schritt:pruefen"]').click();
  assert.match(await p.locator(".kennzeichnung summary").textContent(), /^Kennzeichnung: TLP:CLEAR · synthetisch · Meldungs-ID /);
  await kontext.close();
});

test("Auswahl zurücknehmen mit „keine Angabe“; optionale Zahl entfällt ganz (0.3.2, seit 0.4 mit Kennzahlen)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  const entwurf = () => p.evaluate(() => JSON.parse(localStorage.getItem("kritis-lead-betreiberformular-entwurf-v2")));
  const betrieb = async () => (await entwurf()).sachverhalte[0].module["lead-kritis-betrieb"];
  // optionales Optionsfeld: zurücknehmen, die Angabe entfällt (LEAD-Meldung-v2: Feld fehlt = nicht erhoben)
  const traeger = "/sachverhalte/0/module/lead-kritis-betrieb/betreiber/traegerschaft";
  assert.equal(await p.locator(`[data-fokus="${traeger}="]`).isChecked(), true);
  await p.locator(`[data-fokus="${traeger}=privat"]`).check({ force: true });
  assert.equal((await betrieb()).betreiber.traegerschaft, "privat");
  await p.locator(`[data-fokus="${traeger}="]`).check({ force: true });
  assert.equal((await betrieb()).betreiber.traegerschaft, undefined);
  // Pflichtfelder bieten „keine Angabe“ nicht an
  assert.equal(await p.locator('[data-fokus="/module/lead-kritis-meldung/meldeart="]').count(), 0);
  // optionale Zahl des Sektors
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  await p.selectOption('[data-fokus="/sachverhalte/0/module/lead-kritis-betrieb/sektor"]', "Gesundheitswesen");
  const vb = "/sachverhalte/0/module/lead-kritis-betrieb/kennzahlen/verlegungsbedarf";
  assert.equal(await p.locator(`[data-fokus="${vb}="]`).isChecked(), true, "ohne Erhebung: keine Angabe");
  assert.equal(await p.locator('[data-fokus^="/sachverhalte/0/kennzahlen/"][data-fokus$="/einheit"]').count(), 0, "ohne Erhebung nur die Auswahl");
  await p.locator(`[data-fokus="${vb}=nicht_zutreffend"]`).check({ force: true });
  assert.equal(await p.locator('[data-fokus^="/sachverhalte/0/kennzahlen/"][data-fokus$="/einheit"]').count(), 0, "keine Einheit bei nicht zutreffend");
  assert.equal((await betrieb()).kennzahlen.verlegungsbedarf, "nicht_zutreffend");
  await p.locator(`[data-fokus="${vb}=gezaehlt"]`).check({ force: true });
  assert.equal(await p.locator('[data-fokus^="/sachverhalte/0/kennzahlen/"][data-fokus$="/einheit"]').count(), 1);
  await p.locator(`[data-fokus="${vb}="]`).check({ force: true });
  const m = await entwurf();
  assert.equal(m.sachverhalte[0].module["lead-kritis-betrieb"].kennzahlen.verlegungsbedarf, undefined, "Verweis entfällt");
  assert.deepEqual(m.sachverhalte[0].kennzahlen, [], "Kennzahl entfällt");
  // Pflichtzahl ohne „keine Angabe“
  assert.equal(await p.locator('[data-fokus="/sachverhalte/0/module/lead-kritis-betrieb/kennzahlen/betroffene_personen="]').count(), 0);
  await kontext.close();
});

test("Umbruch bei 320 und 390 px Breite: keine waagerechte Bildlaufleiste der Seite, leer und mit Beispiel (KL-UX-01)", { skip: grund || false }, async () => {
  for (const breite of [320, 390]) {
    const { p, kontext } = await seite({ viewport: { width: breite, height: 700 } });
    for (const zustand of ["leer", "Beispiel"]) {
      if (zustand === "Beispiel") await beispiel(p);
      const n = await p.locator(".schritte button").count();
      for (let i = 0; i < n; i++) {
        await p.locator(".schritte button").nth(i).click();
        assert.ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= breite, `${breite} px, ${zustand}, Schritt ${i + 1}`);
        // der aktive Schritt steht im Bild der Leiste: ganz, wenn er hineinpasst, sonst mit seinem Anfang
        const sichtbar = await p.evaluate(() => {
          const ol = document.querySelector(".schritte ol").getBoundingClientRect();
          const a = document.querySelector("[aria-current=step]").getBoundingClientRect();
          return a.left >= ol.left - 1 && (a.right <= ol.right + 1 || a.width > ol.width - 40);
        });
        assert.ok(sichtbar, `${breite} px, ${zustand}: Schritt ${i + 1} im Bild`);
      }
    }
    await kontext.close();
  }
});
