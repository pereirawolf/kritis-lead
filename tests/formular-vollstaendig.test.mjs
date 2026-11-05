// Vollständigkeit des Betreiberformulars: Für jedes Feld, das LEAD-Meldung-v2 mit den Modulen von KRITIS-LEAD in einer
// Betreibermeldung zulässt, gibt es im Formular ein Eingabeelement. Sonst könnten Betreiber Angaben nicht machen, die
// KI-LEAD verarbeiten würde. Ausgenommen sind nur Felder, die das Formular selbst setzt oder die Betreibern nach den
// Rollenregeln verwehrt sind. Seit 0.4 gegen das zusammengestellte Schema (formate/lead-kritis-v2/meldung.schema.json).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SCHEMA, BEISPIEL } from "../werkzeuge/bauen/formular-bauen.mjs";

const lies = (p) => JSON.parse(readFileSync(fileURLToPath(new URL(`../${p}`, import.meta.url)), "utf-8"));
const schema = lies(SCHEMA);
const url = pathToFileURL(fileURLToPath(new URL("../formular/betreibermeldung.html", import.meta.url))).href;
const KOPF = "module.lead-kritis-meldung";
const BETRIEB = "sachverhalte[].module.lead-kritis-betrieb";

/** Felder, die das Formular nicht zur Eingabe anbietet, mit Grund. Präfixe gelten für alle Unterfelder. */
export const AUSNAHMEN = {
  schema: "setzt das Formular (LEAD-Meldung-v2)",
  fassung: "setzt das Formular (Formatfassung)",
  status: "setzt das Formular nach der Zeichnung (zur_freigabe, freigegeben)",
  "beziehungen[].art": "setzt das Formular nach der Meldeart",
  "absender.ebene": "Betreiberformular: immer Betreiber",
  "absender.gebiet.schluessel": "setzt das Formular aus dem Land (ISO 3166-2)",
  berichtsraum: "Raum steht beim Sachverhalt (raum); ein Berichtsraum gilt für Lagemeldungen mehrerer Sachverhalte",
  zeitzone: "setzt das Formular (Europe/Berlin)",
  fehlanzeige: "Rollenregel R1: Betreibermeldung mit mindestens einem Sachverhalt",
  entstehung: "setzt das Formular (manuell, Werkzeug und Version, Zeitpunkt der Ausgabe)",
  "freigabe.erfasst.funktion": "Funktionsbezeichnung steht im Namen (Funktion statt Name)",
  "freigabe.freigegeben.funktion": "Funktionsbezeichnung steht im Namen (Funktion statt Name)",
  "quellen[].id": "vergibt das Formular (Q1, Q2 …)",
  "sachverhalte[].bewertung": "Bewertung setzt die verarbeitende Stelle (KL-2026-W45-01)",
  "sachverhalte[].bezug[].meldung_id": "Bezug des Betreibers nur über die Kennung",
  "sachverhalte[].bezug[].art": "Verdichtung, Teilung und Zusammenführung von Sachverhalten nimmt die verarbeitende Stelle vor",
  "sachverhalte[].handlungsbedarf.massnahmen[].id": "vergibt das Formular (M1, M2 …)",
  "sachverhalte[].handlungsbedarf.fristen[].id": "vergibt das Formular (F1, F2 …)",
  "sachverhalte[].handlungsbedarf.fristen[].empfehlung": "Empfehlungen an Entscheidungsträger gibt die verarbeitende Stelle",
  "sachverhalte[].handlungsbedarf.empfehlungen": "Empfehlungen an Entscheidungsträger gibt die verarbeitende Stelle; Bedarf des Betriebs steht im Unterstützungsbedarf",
  "sachverhalte[].kennzahlen[].id": "vergibt das Formular (K1, K2 …)",
  "sachverhalte[].kennzahlen[].erhebung": "wählt die Person an der Zahl der Rolle (Erhebung, Modul kennzahlen)",
  "sachverhalte[].kennzahlen[].art": "setzt das Formular nach der Rolle (Bestand, kumuliert, Kapazität, Bedarf)",
  "sachverhalte[].kennzahlen[].raum": "Kennzahlen des Betreibers gelten für den Raum des Sachverhalts",
  "sachverhalte[].kennzahlen[].teilmenge_von": "Kennzahlen des Betreibers stehen je Rolle nebeneinander",
  "sachverhalte[].zeitstrahl[].id": "vergibt das Formular (Z1, Z2 …)",
  "sachverhalte[].zeitstrahl[].erstmals_gemeldet": "setzt das Formular (Meldezeitpunkt der ersten Meldung mit der Zeile)",
  "sachverhalte[].module.lead-bevoelkerungsschutz": "Rollenregel R1: Betreibermeldung ohne Modul lead-bevoelkerungsschutz",
  [`${KOPF}.fassung`]: "setzt das Formular (Fassung des Moduls)",
  [`${KOPF}.vertraulichkeit.einstufung`]: "Demonstrator: keine Einstufung",
  [`${KOPF}.rechtsgrundlage_dieser_meldung`]: "Demonstrator: fiktive Übung, fester Text",
  [`${BETRIEB}.fassung`]: "setzt das Formular (Fassung des Moduls)",
  [`${BETRIEB}.betreiber.name`]: "übernimmt das Formular aus der meldenden Stelle",
  "sachverhalte[].raum.gebiete[].name": "übernimmt das Formular aus dem Verzeichnis zum Regionalschlüssel",
};

function aufloesen(k) {
  while (k?.$ref) k = schema.$defs[k.$ref.split("/").pop()];
  return k || {};
}
/** Blätter des Schemas als Pfade wie in der Darstellungsdatei: "sachverhalte[].betrieb.raum.ars[]". */
function blaetter(knoten, pfad, out = new Set()) {
  const k = aufloesen(knoten);
  const typen = [].concat(k.type || []);
  if (k.properties) for (const [n, s] of Object.entries(k.properties)) blaetter(s, pfad ? `${pfad}.${n}` : n, out);
  else if (typen.includes("array")) {
    const it = aufloesen(k.items);
    if (it.properties) blaetter(it, `${pfad}[]`, out);
    else out.add(`${pfad}[]`);
  } else out.add(pfad);
  return out;
}
const ausgenommen = (p) => Object.keys(AUSNAHMEN).some((a) => p === a || p.startsWith(`${a}.`) || p.startsWith(`${a}[]`));
const normal = (z) => z.split("/").filter(Boolean).reduce((a, k) => (/^\d+$/.test(k) ? `${a}[]` : a ? `${a}.${k}` : k), "");

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

test("jedes Feld des Meldeprofils für Betreiber hat im Formular ein Eingabeelement", { skip: grund || false }, async () => {
  const soll = [...blaetter(schema, "")].filter((p) => !ausgenommen(p)).sort();
  const p = await (await browser.newContext({ offline: true })).newPage();
  await p.goto(url);
  await p.locator("#oeffnen").click();
  await p.locator("#beispiel").click();
  const gefunden = new Set();
  const sammle = async () => (await p.locator("#arbeitsbereich [data-pfad]").evaluateAll((es) => es.map((e) => e.dataset.pfad))).forEach((z) => gefunden.add(normal(z)));
  const schritte = await p.locator(".schritte button").count();
  // Wert, Einheit und Belege einer Zahl erscheinen nur bei „gezählt“ und „geschätzt“ (KL-UX-08); Bandbreite nur bei
  // „geschätzt“: alle Zahlen auf „geschätzt“
  const allesBelegt = async () => {
    for (;;) {
      const offen = p.locator('[data-fokus*="/kennzahlen/"][data-fokus$="=geschaetzt"]:not(:checked)');
      if (!(await offen.count())) return;
      await offen.first().evaluate((e) => e.click());
    }
  };
  // Bedingte Felder sichtbar machen: Folgemeldung (Bezug, Änderung zur Vormeldung) durch Fortschreiben des Beispiels,
  // Ursache, je Liste ein Eintrag
  await p.locator("#vormeldung").setInputFiles(fileURLToPath(new URL(`../${BEISPIEL}`, import.meta.url)));
  await p.locator("#status", { hasText: /^Folgemeldung/ }).waitFor();
  await p.locator('[data-fokus="schritt:ersatz"]').click();
  await p.locator('[data-fokus="schalter:ursache"]').check();
  // Abschluss erscheint bei der Abschlussmeldung: einmal sammeln
  await p.locator('[data-fokus="schritt:meldung"]').click();
  await p.locator('[data-fokus="/module/lead-kritis-meldung/meldeart=Abschlussmeldung"]').check({ force: true });
  await p.locator('[data-fokus="schritt:lage"]').click();
  await sammle();
  await p.locator('[data-fokus="schritt:meldung"]').click();
  await p.locator('[data-fokus="/module/lead-kritis-meldung/meldeart=Folgemeldung"]').check({ force: true });
  for (let i = 0; i < schritte; i++) {
    await p.locator(".schritte button").nth(i).click();
    for (const k of await p.locator('#arbeitsbereich [data-fokus$="#neu"]').all()) {
      const f = await k.getAttribute("data-fokus");
      await p.locator(`[data-fokus="${f}"]`).click();
    }
    await allesBelegt();
    await sammle();
  }
  // Quelle als Meldung einer anderen Stelle (Meldungs-ID); Zeitstrahlzeile als Berichtigung (berichtigte Zeile)
  await p.locator('[data-fokus="schritt:quellen"]').click();
  const q = (await p.locator('[data-fokus$="/zugang"]').count()) - 1;
  await p.selectOption(`[data-fokus="/quellen/${q}/zugang"]`, "eingangsmeldung");
  const z = (await p.locator('[data-fokus^="/sachverhalte/0/zeitstrahl/"][data-fokus$="/typ"]').count()) - 1;
  await p.selectOption(`[data-fokus="/sachverhalte/0/zeitstrahl/${z}/typ"]`, "Berichtigung");
  await sammle();
  // Sektorangaben je Sektor mit eigenem Block
  await p.locator('[data-fokus="schritt:dienstleistung"]').click();
  for (const sektor of schema.$defs.modul_lead_kritis_betrieb.properties.sektor.enum) {
    await p.selectOption('[data-fokus="/sachverhalte/0/module/lead-kritis-betrieb/sektor"]', sektor);
    await allesBelegt();
    await sammle();
  }
  // Listen einfacher Werte: Mehrfachauswahl (ganze Liste) oder einzelne Einträge
  const fehlend = soll.filter((f) => !gefunden.has(f) && !(f.endsWith("[]") && gefunden.has(f.slice(0, -2))));
  assert.deepEqual(fehlend, [], `ohne Eingabeelement: ${fehlend.join(", ")}`);
  // Jede Ausnahme betrifft ein Feld, das es im Schema gibt
  for (const a of Object.keys(AUSNAHMEN)) assert.ok([...blaetter(schema, "")].some((f) => f === a || f.startsWith(`${a}.`) || f.startsWith(`${a}[]`)), `Ausnahme ohne Feld: ${a}`);
});
