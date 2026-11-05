// Umstellung auf LEAD-Meldung-v2 (Meilenstein M1): Module lead-kritis-meldung und lead-kritis-betrieb 0.3, Zusammenstellung,
// Rollenregeln R1 bis R3, gebautes Schema in formate/lead-kritis-v2/. Ajv urteilt immer; ist KI_LEAD_DIR gesetzt, prüft der Test
// zusätzlich, dass das Schema dem Bau mit dem Werkzeug von KI-LEAD entspricht und der Prüfer von KI-LEAD gleich urteilt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const WURZEL = fileURLToPath(new URL("..", import.meta.url));
const lies = (p) => JSON.parse(readFileSync(join(WURZEL, p), "utf-8"));
const kopie = (x) => structuredClone(x);
const dir = process.env.KI_LEAD_DIR;
const ORDNER = "formate/lead-kritis-v2";
const schema = lies(`${ORDNER}/meldung.schema.json`);
const pruefe = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
const BETREIBER = lies(`${ORDNER}/beispiele/betreiber-minimal.json`);

// Behördenmeldung aus dem Beispiel: Ebene Kreis, eigene Kennung, Bewertung, ohne Betreibermodule
function behoerde() {
  const m = kopie(BETREIBER);
  m.absender = { stelle: "Landratsamt Sonneberg, Krisenstab (Übungsrolle, FIKTIV)", ebene: "Kreis", gebiet: { name: "Landkreis Sonneberg", schluessel: "16072" } };
  delete m.module;
  const sv = m.sachverhalte[0];
  sv.kennung = "DE-TH-SON-20261013-R4WPQ2";
  delete sv.module["lead-kritis-betrieb"];
  sv.bewertung = {
    kernaussage: "Stromausfall im Teilnetz oberhalb Neuhaus am Rennweg; Dauer offen.",
    referenzraum: "Landkreis Sonneberg",
    beurteilung: { stufe: "erheblich", begruendung: "Rund 18.000 Anschlüsse ohne Versorgung [Q1]." },
    tendenz: { richtung: null, bezug: "", begruendung: "" },
    neubewertung_bei: [],
  };
  sv.bezug = [{ kennung: "KRITIS-VNSUED-20261013-N4STQ7" }];
  return m;
}

// Fälle: [Name, Meldung, erwartet gültig]
const faelle = [];
const fall = (name, aendern, gueltig, basis = BETREIBER) => {
  const m = kopie(typeof basis === "function" ? basis() : basis);
  aendern(m);
  faelle.push([name, m, gueltig]);
};
const sv0 = (m) => m.sachverhalte[0];
const betrieb = (m) => sv0(m).module["lead-kritis-betrieb"];
const kopf = (m) => m.module["lead-kritis-meldung"];

fall("Betreibermeldung, Minimalbeispiel", () => {}, true);
fall("Betreibermeldung im Entwurf mit leerer Kennung", (m) => ((m.status = "entwurf"), (sv0(m).kennung = "")), true);
fall("R1: Betreibermeldung ohne Meldungsmodul", (m) => delete m.module, false);
fall("R1: Betreiber-Sachverhalt ohne Modul lead-kritis-betrieb", (m) => delete sv0(m).module["lead-kritis-betrieb"], false);
fall("R1: Betreibermeldung ohne Sachverhalt", (m) => (m.sachverhalte = []), false);
const achse = { stufe: null, status: "offen", offen_grund: "kein_beleg", begruendung: "Keine Angabe.", quellen: [] };
const BEVS = { fassung: "1.0", ereignisarten: ["Stromausfall / Blackout"], lagenradar: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`d${n}`, achse])) };
fall("R1: Betreiber-Sachverhalt mit Modul lead-bevoelkerungsschutz", (m) => (sv0(m).module["lead-bevoelkerungsschutz"] = kopie(BEVS)), false);
fall("Kontrolle: dasselbe Modul lead-bevoelkerungsschutz in einer Behördenmeldung", (m) => (sv0(m).module["lead-bevoelkerungsschutz"] = kopie(BEVS)), true, behoerde);
fall("R1: Betreiber-Kennung ohne Präfix KRITIS-", (m) => (sv0(m).kennung = "DE-TH-20261013-N4STQ7"), false);
fall("R1: Betreiber-Kennung mit vier Kürzelsegmenten", (m) => (sv0(m).kennung = "KRITIS-A-B-C-D-20261013-N4STQ7"), false);
fall("R1: Betreiber-Kennung mit Umlaut", (m) => (sv0(m).kennung = "KRITIS-SÜD-20261013-N4STQ7"), false);
fall("R1: Betreiber-Kennung mit drei Kürzelsegmenten", (m) => (sv0(m).kennung = "KRITIS-VN-SUED-TH-20261013-N4STQ7"), true);
fall("Kern: leere Kennung erst ab „zur_freigabe“ ungültig", (m) => (sv0(m).kennung = ""), false);
const bewertung = (stufe, richtung) => ({
  kernaussage: "Ausfall im Teilnetz.",
  referenzraum: "Netzgebiet Südthüringen",
  beurteilung: { stufe, begruendung: stufe ? "Begründung." : "" },
  tendenz: { richtung, bezug: "", begruendung: "" },
  neubewertung_bei: [],
});
fall("R1: Betreiber mit Bewertung ohne Stufe und Richtung", (m) => (sv0(m).bewertung = bewertung(null, null)), true);
fall("R1: Betreiber mit Beurteilungsstufe", (m) => (sv0(m).bewertung = bewertung("erheblich", null)), false);
fall("R1: Betreiber mit Tendenzrichtung", (m) => (sv0(m).bewertung = bewertung(null, "Verschärfung")), false);
fall("Behördenmeldung mit Bezug auf die Betreiberkennung", () => {}, true, behoerde);
fall("R2: Behörden-Sachverhalt mit Modul lead-kritis-betrieb", (m) => (sv0(m).module["lead-kritis-betrieb"] = betrieb(BETREIBER)), false, behoerde);
fall("Kern: Behörden-Sachverhalt ohne Bewertung", (m) => delete sv0(m).bewertung, false, behoerde);
fall("Behördenmeldung mit Meldungsmodul (zulässig)", (m) => (m.module = kopie(BETREIBER.module)), true, behoerde);
const VOR = "019a1e2c-1f40-7a00-8000-000000000100";
fall("R3: Folgemeldung ohne beziehungen", (m) => (kopf(m).meldeart = "Folgemeldung"), false);
fall("R3: Folgemeldung mit fortschreibung_von", (m) => ((kopf(m).meldeart = "Folgemeldung"), (m.beziehungen = [{ art: "fortschreibung_von", meldung_id: VOR }])), true);
fall("R3: Abschlussmeldung mit fortschreibung_von", (m) => ((kopf(m).meldeart = "Abschlussmeldung"), (m.beziehungen = [{ art: "fortschreibung_von", meldung_id: VOR }])), true);
fall("R3: Korrekturmeldung nur mit fortschreibung_von", (m) => ((kopf(m).meldeart = "Korrekturmeldung"), (m.beziehungen = [{ art: "fortschreibung_von", meldung_id: VOR }])), false);
fall("R3: Korrekturmeldung mit berichtigung_von", (m) => ((kopf(m).meldeart = "Korrekturmeldung"), (m.beziehungen = [{ art: "berichtigung_von", meldung_id: VOR }])), true);
fall("R3: Erstmeldung mit beziehungen", (m) => (m.beziehungen = [{ art: "fortschreibung_von", meldung_id: VOR }]), false);
fall("Meldungsmodul: TLP außer CLEAR", (m) => (kopf(m).vertraulichkeit.tlp = "AMBER"), false);
fall("Meldungsmodul: Datenart nicht synthetisch", (m) => (kopf(m).datenart = "echt"), false);
fall("Meldungsmodul: andere Fassung", (m) => (kopf(m).fassung = "0.2"), false);
fall("Modul betrieb: Kennzahl unbekannt (null)", (m) => (betrieb(m).kennzahlen.betroffene_anschluesse = null), true);
fall("Modul betrieb: Kennzahl nicht zutreffend", (m) => (betrieb(m).kennzahlen.betroffene_personen = "nicht_zutreffend"), true);
fall("Modul betrieb: Verweis ohne Kennzahlform", (m) => (betrieb(m).kennzahlen.betroffene_anschluesse = "Anschlüsse"), false);
fall("Modul betrieb: Leistungsgrad in Prozent ohne Bezugsgröße", (m) => (betrieb(m).ist.leistungsgrad_prozent = 60), false);
fall("Modul betrieb: Leistungsgrad in Prozent mit Bezugsgröße", (m) => Object.assign(betrieb(m).ist, { leistungsgrad_prozent: 60, leistungsbasis: "versorgte Anschlüsse" }), true);
fall("Modul betrieb: Raum gehört in den Kern", (m) => (betrieb(m).raum = { ars: ["16072"], beschreibung: "x" }), false);
fall("Modul betrieb: Wanduhrzeit ohne Versatz", (m) => (betrieb(m).ist.stand = "2026-10-13T22:30"), false);

for (const [name, m, gueltig] of faelle)
  test(`Ajv: ${name} → ${gueltig ? "gültig" : "ungültig"}`, () => {
    assert.equal(pruefe(m), gueltig, JSON.stringify(pruefe.errors?.slice(0, 3)));
  });

test("Module sind Schemata nach Draft 2020-12 mit Fassung 0.3", () => {
  const ajv = new Ajv2020({ strict: false });
  for (const name of ["lead-kritis-meldung", "lead-kritis-betrieb"]) {
    const m = lies(`${ORDNER}/module/${name}.schema.json`);
    assert.ok(ajv.validateSchema(m), `${name}: ${JSON.stringify(ajv.errors)}`);
    assert.equal(m.properties.fassung.const, "0.3", name);
    assert.ok(m.required.includes("fassung"), name);
  }
});

test("Zusammenstellung bindet die gepinnten Kopien und beide Module ein", () => {
  const z = lies(`${ORDNER}/zusammenstellung.json`);
  assert.equal(z.format, "lead-meldung-v2-zusammenstellung/1");
  assert.equal(join(ORDNER, z.kern), "kern/lead-meldung-v2/kern.schema.json");
  assert.deepEqual(Object.keys(z.module).sort(), ["lead-bevoelkerungsschutz", "lead-kritis-betrieb"]);
  assert.deepEqual(Object.keys(z.meldungsmodule), ["lead-kritis-meldung"]);
  assert.equal(schema.properties.schema.const, "LEAD-Meldung-v2");
  assert.deepEqual(
    lies(`${ORDNER}/rollenregeln.json`).regeln.map((r) => r.regel),
    ["R1-betreiber", "R2-behoerde", "R3-bezug"],
  );
});

test("Schema entspricht dem Bau mit dem Werkzeug von KI-LEAD am gepinnten Stand", { skip: !dir && "KI_LEAD_DIR nicht gesetzt" }, async () => {
  const { baueSchemaV2, alsText, ZIEL } = await import("../werkzeuge/bauen/schema-v2-bauen.mjs");
  assert.equal(readFileSync(join(WURZEL, ZIEL), "utf-8"), alsText(await baueSchemaV2(dir)), "npm run bauen mit KI_LEAD_DIR ausführen");
});

test("Prüfer von KI-LEAD urteilt wie Ajv; Schema für KI-LEAD verwendbar", { skip: !dir && "KI_LEAD_DIR nicht gesetzt" }, () => {
  const datei = join(mkdtempSync(join(tmpdir(), "kritis-v2-")), "faelle.json");
  writeFileSync(datei, JSON.stringify(faelle.map(([, m]) => m)));
  const aus = execFileSync(process.execPath, ["--import", "tsx", "werkzeuge/pruefen/ki-lead-urteil-v2.mts", datei], { cwd: WURZEL, encoding: "utf-8", env: process.env });
  const { schemaFehler, urteile } = JSON.parse(aus);
  assert.equal(schemaFehler, null);
  faelle.forEach(([name, , gueltig], i) => assert.equal(urteile[i].gueltig, gueltig, `${name}: ${JSON.stringify(urteile[i].fehler)}`));
});
