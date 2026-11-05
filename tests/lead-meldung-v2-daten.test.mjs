// Umstellung auf LEAD-Meldung-v2 (Meilenstein M2): überführtes Szenario, Konformitätsfälle, Prüfwerkzeug v2 und zweiter Prüfweg.
// Ist KI_LEAD_DIR gesetzt, prüft der Test zusätzlich, dass die Überführung mit dem Werkzeug von KI-LEAD am gepinnten Stand
// reproduzierbar ist und dass Prüfer und Referenzprüfung von KI-LEAD wie erwartet urteilen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pruefeMeldung, pruefeSatz } from "../werkzeuge/pruefen/v2/pruefen.mjs";
import { erzeuge as faelleErzeugen } from "../werkzeuge/bauen/faelle-v2-erzeugen.mjs";

const WURZEL = fileURLToPath(new URL("..", import.meta.url));
const lies = (p) => JSON.parse(readFileSync(join(WURZEL, p), "utf-8"));
const dir = process.env.KI_LEAD_DIR;
const FAELLE = lies("formate/lead-kritis-v2/konformitaet/faelle.json");
const SZENARIO = "formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg";
const szenario = readdirSync(join(WURZEL, SZENARIO))
  .filter((n) => n.endsWith(".json"))
  .sort()
  .map((n) => ({ name: n, daten: lies(`${SZENARIO}/${n}`) }));

test("Konformitätsfälle entsprechen dem erzeugten Stand", () => {
  for (const [p, t] of faelleErzeugen()) assert.equal(readFileSync(join(WURZEL, p), "utf-8"), t, `${p}: npm run bauen ausführen`);
});

test("Überführung des Szenarios ist reproduzierbar (Werkzeug von KI-LEAD am gepinnten Stand)", { skip: !dir && "KI_LEAD_DIR nicht gesetzt" }, async () => {
  const { erzeuge } = await import("../werkzeuge/migration/v2-ueberfuehren.mjs");
  const dateien = await erzeuge();
  assert.equal(dateien.size, szenario.length);
  for (const [p, t] of dateien) assert.equal(readFileSync(join(WURZEL, p), "utf-8"), t, `${p}: npm run bauen ausführen`);
});

for (const f of FAELLE.faelle)
  test(`Fall ${f.datei.split("/").pop()}: ${f.erwartung}${f.regel ? ` (${f.regel} an ${f.pfad})` : ""}`, () => {
    const e = pruefeMeldung(lies(f.datei));
    assert.equal(e.gueltig, f.erwartung === "gueltig", JSON.stringify(e.befunde.filter((b) => b.stufe === "fehler").slice(0, 4)));
    if (f.regel) assert.ok(e.befunde.some((b) => b.stufe === "fehler" && b.regel === f.regel && b.pfad === f.pfad), JSON.stringify(e.befunde.map((b) => [b.regel, b.pfad])));
    if (f.erwartung === "gueltig") assert.deepEqual(e.befunde.filter((b) => b.stufe !== "hinweis"), [], "gültige Fälle ohne Plausibilitätsbefund");
  });

for (const f of FAELLE.plausibilitaet)
  test(`Plausibilität ${f.datei.split("/").pop()}: ${f.regel} (${f.stufe})`, () => {
    const e = pruefeMeldung(lies(f.datei));
    assert.ok(e.gueltig, "Fall muss schemagültig sein");
    assert.ok(e.befunde.some((b) => b.regel === f.regel && b.stufe === f.stufe), JSON.stringify(e.befunde));
    assert.deepEqual(e.befunde.filter((b) => b.regel !== f.regel), [], "nur die erwartete Regel");
  });

for (const s of FAELLE.saetze)
  test(`Satz ${s.ordner.split("/").pop()}: ${s.beschreibung}`, () => {
    const ds = readdirSync(join(WURZEL, s.ordner))
      .filter((n) => n.endsWith(".json"))
      .sort()
      .map((n) => ({ name: n, daten: lies(`${s.ordner}/${n}`) }));
    const b = pruefeSatz(ds);
    assert.equal(b.filter((x) => x.stufe === "fehler").length, s.erwartung.fehler);
    assert.deepEqual([...new Set(b.map((x) => x.regel))].sort(), [...s.erwartung.regeln].sort());
  });

test("Kennungen: Betreiber mit Präfix KRITIS-, Kreis und Leitstelle mit DE-TH-SON-, Lagemeldung Nr. 4 als R4WP mit Bezug auf alle Eingänge", () => {
  for (const { name, daten } of szenario)
    for (const sv of daten.sachverhalte)
      assert.match(sv.kennung, daten.absender.ebene === "Betreiber" ? /^KRITIS-(NETZSUED|ZVTN|MOBILB|PFLEGEOL)-\d{8}-[0-9A-HJKMNP-TV-Z]{6}$/ : /^DE-TH-SON-\d{8}-[0-9A-HJKMNP-TV-Z]{4,6}$/, name);
  const kreis = szenario.find((m) => m.name.startsWith("07_")).daten;
  const r4wp = kreis.sachverhalte[0];
  assert.equal(r4wp.kennung, "DE-TH-SON-20261014-R4WP");
  assert.deepEqual(kreis.absender, { stelle: "Landratsamt Sonneberg, Krisenstab (Übungsrolle, FIKTIV)", ebene: "Kreis", gebiet: { name: "Landkreis Sonneberg", schluessel: "16072" } });
  const eingaenge = new Map(szenario.filter((m) => m.daten.meldezeitpunkt < kreis.meldezeitpunkt).flatMap((m) => m.daten.sachverhalte.map((s) => [s.kennung, m.daten.meldung_id])));
  assert.equal(r4wp.bezug.length, 5);
  for (const b of r4wp.bezug) {
    assert.equal(b.art, "verdichtung");
    assert.ok(eingaenge.has(b.kennung), `${b.kennung} ist kein Eingang vor 08:30`);
    // die jüngste Fassung des Eingangs vor der Lagemeldung
    const fassungen = szenario.filter((m) => m.daten.meldezeitpunkt < kreis.meldezeitpunkt && m.daten.sachverhalte.some((s) => s.kennung === b.kennung));
    assert.equal(b.meldung_id, fassungen.at(-1).daten.meldung_id, b.kennung);
  }
});

test("Überführte Meldungen nennen ihre Herkunft und keine Bewertung bei Betreibern", () => {
  for (const { name, daten } of szenario) {
    assert.match(daten.entstehung.migration.werkzeug, /^werkzeuge\/migration\/v2-ueberfuehren\.mjs/, name);
    assert.ok(["LEAD-KRITIS-Meldung-v0.2", "LEAD-Meldung-v1"].includes(daten.entstehung.migration.von), name);
    if (daten.absender.ebene === "Betreiber") for (const sv of daten.sachverhalte) assert.equal(sv.bewertung, undefined, name);
  }
});

test("Zweiter Prüfweg: Prüfer und Referenzprüfung von KI-LEAD urteilen wie erwartet", { skip: !dir && "KI_LEAD_DIR nicht gesetzt" }, () => {
  const datei = join(mkdtempSync(join(tmpdir(), "kritis-v2-")), "faelle.json");
  const alle = [...FAELLE.faelle, ...FAELLE.plausibilitaet.map((f) => ({ ...f, erwartung: "gueltig" }))];
  writeFileSync(datei, JSON.stringify(alle.map((f) => lies(f.datei))));
  const aus = execFileSync(process.execPath, ["--import", "tsx", "werkzeuge/pruefen/ki-lead-urteil-v2.mts", datei], { cwd: WURZEL, encoding: "utf-8", env: process.env });
  const { schemaFehler, urteile } = JSON.parse(aus);
  assert.equal(schemaFehler, null);
  alle.forEach((f, i) => {
    assert.equal(urteile[i].gueltig, f.erwartung === "gueltig", `${f.datei}: ${JSON.stringify(urteile[i].fehler)}`);
    if (f.erwartung === "gueltig" && !f.stufe) assert.deepEqual(urteile[i].referenzfehler, [], `${f.datei}: Referenzprüfung`);
  });
});
