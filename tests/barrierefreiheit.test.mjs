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
  for (let i = 0; i < 9; i++) {
    await p.keyboard.press("Tab");
    const a = await aktiv(p);
    reihe.push(a.id || a.fokus || a.tag);
  }
  // zuerst die Seitennavigation im Kopf (KL-UX-13), dann Werkzeugleiste und Schrittleiste
  assert.deepEqual(reihe, ["A", "A", "A", "neu", "vormeldung-waehlen", "beispiel", "zur-pruefung", "schritt:meldung", "schritt:dienstleistung"]);
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

test("Fehler sind mit dem Feld verknüpft; fehlende Pflichtangaben erst nach Bearbeiten oder Prüfschritt; Befund führt zum Eingabeelement", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  const feld = p.locator('[data-fokus="/meldende_stelle"]');
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
  assert.equal(await p.locator('[data-pfad="/kritis/meldeanlass"] .feld-meldung').count(), 0);
  // KL-UX-03: Punkt an der Schrittnummer, Zahl im zugänglichen Namen
  assert.match(await p.locator('[data-fokus="schritt:meldung"]').textContent(), /1 Feld mit Befund/);
  // nach dem Prüfschritt alle
  await p.locator("#zur-pruefung").click();
  await p.locator('[data-fokus="schritt:meldung"]').click();
  assert.equal(await p.locator('[data-pfad="/kritis/meldeanlass"]').getAttribute("aria-describedby").then((d) => !!d), true);
  await p.locator("#zur-pruefung").click();
  await p.locator(".befund button", { hasText: "Sektor" }).first().click();
  const a = await aktiv(p);
  assert.equal(a.tag, "SELECT");
  assert.equal(a.fokus, "/sachverhalte/0/betrieb/sektor");
  await kontext.close();
});

test("Prüfergebnis: je Feld ein Befund, nach Schritten, mit Abschnitt und ohne rohe Pfade (KL-UX-05)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator("#zur-pruefung").click();
  const texte = await p.locator(".befund").allTextContents();
  assert.ok(texte.length > 5);
  assert.equal(new Set(texte).size, texte.length, "keine Doppelungen");
  assert.ok(texte.every((t) => !t.startsWith("/")), `rohe Pfade: ${texte.filter((t) => t.startsWith("/")).join("; ")}`);
  assert.ok(texte.includes("Istzustand › Datenstand: Pflichtangabe fehlt."), texte.join("; "));
  assert.ok((await p.locator(".befund-schritt h4").allTextContents()).includes("Schritt 1: Meldung und Betreiber"));
  assert.equal(await p.locator("#ausgeben").isDisabled(), true);
  assert.equal(await p.locator("#ausgeben").evaluate((e) => e.classList.contains("primaer")), false);
  await kontext.close();
});

test("Listen: geladene Meldung mit mehreren Einträgen eingeklappt, Kopfzeile, Sprung öffnet das Element (KL-UX-04)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  await p.locator("#beispiel").click();
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  const kopf = p.locator('[data-element="/sachverhalte/0/betrieb/abhaengigkeiten/0"]');
  assert.match(await kopf.locator(".element-titel").textContent(), /^Abhängigkeit 1 · Stromverteilung/);
  assert.equal(await kopf.locator(".element-inhalt").isHidden(), true);
  assert.equal(await p.locator('[data-element="/sachverhalte/0/betrieb/ersatzverfahren/0"] .element-inhalt').isVisible(), true, "einzelner Eintrag offen");
  await p.locator('[data-fokus="/sachverhalte/0/betrieb/abhaengigkeiten#umschalten0"]').click();
  assert.equal(await kopf.locator(".element-inhalt").isVisible(), true);
  assert.equal((await aktiv(p)).fokus, "/sachverhalte/0/betrieb/abhaengigkeiten#umschalten0");
  assert.equal(await p.locator('[data-fokus="/sachverhalte/0/betrieb/abhaengigkeiten#umschalten0"]').getAttribute("aria-expanded"), "true");
  // Befund in einem eingeklappten Element: Sprung aus Schritt 6 öffnet es (Entwurf ändern und neu laden)
  await p.evaluate(() => {
    const k = "kritis-lead-betreiberformular-entwurf";
    const m = JSON.parse(localStorage.getItem(k));
    m.sachverhalte[0].betrieb.abhaengigkeiten[1].dienstleistung = "";
    localStorage.setItem(k, JSON.stringify(m));
  });
  await p.reload();
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  const zweite = p.locator('[data-element="/sachverhalte/0/betrieb/abhaengigkeiten/1"]');
  assert.equal(await zweite.locator(".element-inhalt").isHidden(), true);
  assert.match(await zweite.locator(".element-befund").textContent(), /1 Feld mit Befund/);
  await p.locator('[data-fokus="schritt:pruefen"]').click();
  await p.locator(".befund button", { hasText: "Abhängigkeit 2 › Dienstleistung" }).click();
  assert.equal(await zweite.locator(".element-inhalt").isVisible(), true);
  assert.equal((await aktiv(p)).fokus, "/sachverhalte/0/betrieb/abhaengigkeiten/1/dienstleistung");
  await kontext.close();
});

test("Messwert, Quelle, Vormeldung und Kennzeichnung (KL-UX-08 bis 11)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  // Wert nur bei „belegt“ und „geschätzt“
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  const wert = '[data-fokus="/sachverhalte/0/betrieb/ist/betroffene/anschluesse/wert"]';
  assert.equal(await p.locator(wert).count(), 0);
  await p.locator('[data-fokus="/sachverhalte/0/betrieb/ist/betroffene/anschluesse/status=belegt"]').check({ force: true });
  assert.equal(await p.locator(wert).count(), 1);
  // Erklärung der Status nur einmal je Schritt
  assert.equal(await p.locator("text=belegt = gezählt oder gemessen").count(), 1);
  // Langer Hinweis: erster Satz und „mehr“; Bildschirmleser erhalten den ganzen Text (KL-UX-12)
  const mehr = p.locator(".hinweis-mehr").first();
  assert.equal(await mehr.getAttribute("aria-expanded"), "false");
  assert.match(await mehr.getAttribute("aria-label"), /^mehr: Hinweis zu /);
  const ganz = await mehr.evaluate((b) => b.parentElement.querySelector(".sr").textContent);
  const sichtbar = await mehr.evaluate((b) => b.parentElement.querySelector("[aria-hidden]").textContent);
  assert.ok(sichtbar.length < ganz.length && ganz.startsWith(sichtbar));
  await mehr.click();
  assert.equal(await p.locator(".hinweis-mehr").first().getAttribute("aria-expanded"), "true");
  // Quelle als Auswahl
  assert.equal(await p.locator('[data-fokus="/sachverhalte/0/betrieb/ist/betroffene/anschluesse/quelle"]').evaluate((e) => e.tagName), "SELECT");
  // Folgemeldung ohne Vormeldung: Angebot an der Auswahl
  await p.locator('[data-fokus="schritt:meldung"]').click();
  assert.equal(await p.locator('[data-fokus="aktion:vormeldung"]').count(), 0);
  await p.locator('[data-fokus="/kritis/meldeart=Abschlussmeldung"]').check({ force: true });
  assert.equal(await p.locator('[data-fokus="aktion:vormeldung"]').count(), 1);
  // Kennzeichnung in Schritt 6 als eine Zeile
  assert.equal(await p.locator('[data-fokus="/kritis/meldung_id"]').count(), 0);
  await p.locator('[data-fokus="schritt:pruefen"]').click();
  assert.match(await p.locator(".kennzeichnung summary").textContent(), /^Kennzeichnung: TLP:CLEAR · synthetisch · Meldungs-ID /);
  await kontext.close();
});

test("Auswahl zurücknehmen mit „keine Angabe“; Einheit bei „nicht zutreffend“ weder sichtbar noch Pflicht (0.3.2)", { skip: grund || false }, async () => {
  const { p, kontext } = await seite();
  const entwurf = () => p.evaluate(() => JSON.parse(localStorage.getItem("kritis-lead-betreiberformular-entwurf")));
  // optionales Optionsfeld: zurücknehmen auf den Leerwert des Schemas
  const traeger = "/sachverhalte/0/betrieb/betreiber/traegerschaft";
  assert.equal(await p.locator(`[data-fokus="${traeger}="]`).isChecked(), true);
  await p.locator(`[data-fokus="${traeger}=privat"]`).check({ force: true });
  assert.equal((await entwurf()).sachverhalte[0].betrieb.betreiber.traegerschaft, "privat");
  await p.locator(`[data-fokus="${traeger}="]`).check({ force: true });
  assert.equal((await entwurf()).sachverhalte[0].betrieb.betreiber.traegerschaft, "");
  // Pflichtfelder bieten „keine Angabe“ nicht an
  assert.equal(await p.locator('[data-fokus="/kritis/meldeart="]').count(), 0);
  // optionaler Messwert in den Sektorangaben
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  await p.selectOption('[data-fokus="/sachverhalte/0/betrieb/sektor"]', { label: (await p.locator('[data-fokus="/sachverhalte/0/betrieb/sektor"] option', { hasText: "Gesundheit" }).first().textContent()).trim() });
  const vb = "/sachverhalte/0/betrieb/sektor_angaben/gesundheit/verlegungsbedarf";
  assert.equal(await p.locator(`[data-fokus="${vb}/status="]`).isChecked(), true, "ohne Status: keine Angabe");
  assert.equal(await p.locator(`[data-fokus="${vb}/einheit"]`).count(), 0, "ohne Status nur die Auswahl");
  await p.locator(`[data-fokus="${vb}/status=nicht_zutreffend"]`).check({ force: true });
  assert.equal(await p.locator(`[data-fokus="${vb}/einheit"]`).count(), 0, "keine Einheit bei nicht zutreffend");
  await p.locator(`[data-fokus="${vb}/status=belegt"]`).check({ force: true });
  assert.equal(await p.locator(`[data-fokus="${vb}/einheit"]`).count(), 1);
  await p.locator(`[data-fokus="${vb}/status="]`).check({ force: true });
  assert.equal((await entwurf()).sachverhalte[0].betrieb.sektor_angaben?.gesundheit?.verlegungsbedarf, undefined, "Messwert entfällt");
  // „nicht zutreffend“ ohne Einheit erzeugt im Prüfschritt keinen Befund zur Einheit
  await p.locator(`[data-fokus="${vb}/status=nicht_zutreffend"]`).check({ force: true });
  const pe = "/sachverhalte/0/betrieb/ist/betroffene/personen";
  await p.locator(`[data-fokus="${pe}/status=nicht_zutreffend"]`).check({ force: true });
  assert.equal(await p.locator(`[data-fokus="${pe}/einheit"]`).count(), 0);
  assert.equal(await p.locator(`[data-fokus="${pe}/status="]`).count(), 0, "Pflicht-Messwert ohne „keine Angabe“");
  await p.evaluate(() => {
    const k = "kritis-lead-betreiberformular-entwurf";
    const m = JSON.parse(localStorage.getItem(k));
    m.sachverhalte[0].betrieb.ist.betroffene.personen.einheit = "";
    localStorage.setItem(k, JSON.stringify(m));
  });
  await p.reload();
  await p.locator("#zur-pruefung").click();
  const befunde = (await p.locator(".befund").allTextContents()).join("; ");
  assert.doesNotMatch(befunde, /Einheit/);
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

test("Umbruch bei 320 und 390 px Breite: keine waagerechte Bildlaufleiste der Seite, leer und mit Beispiel (KL-UX-01)", { skip: grund || false }, async () => {
  for (const breite of [320, 390]) {
    const { p, kontext } = await seite({ viewport: { width: breite, height: 700 } });
    for (const zustand of ["leer", "Beispiel"]) {
      if (zustand === "Beispiel") await p.locator("#beispiel").click();
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
