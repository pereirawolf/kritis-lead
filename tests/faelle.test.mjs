// Prüft alle Konformitätsfälle (Szenario und Negativfälle) gegen ihre Erwartung (Referenzprüfer Ajv) und die Sätze zur Nachrichtenidentität.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { pruefeMeldung, pruefeSatz, migriere } from "../werkzeuge/pruefen/pruefen.mjs";
import { erzeuge } from "../werkzeuge/bauen/faelle-erzeugen.mjs";

const url = (p) => new URL(`../${p}`, import.meta.url);
const lies = (p) => JSON.parse(readFileSync(url(p), "utf-8"));
const { faelle, saetze, plausibilitaet } = lies("konformitaet/faelle.json");

test("Negativfälle und Sätze entsprechen dem Generator", () => {
  for (const [p, t] of erzeuge()) assert.equal(readFileSync(url(p), "utf-8"), t, `${p}: npm run bauen ausführen`);
});

test("mindestens 20 Fälle, jede Rollenregel mit Negativfall", () => {
  assert.ok(faelle.length >= 20);
  const regeln = new Set(faelle.filter((f) => f.regel).map((f) => f.regel));
  for (const r of ["R1-betreiber", "R2-behoerde", "R3-bezug", "R4-zeitzone"]) assert.ok(regeln.has(r), r);
});

for (const f of faelle) {
  test(`${f.datei}: ${f.erwartung}`, () => {
    const e = pruefeMeldung(lies(f.datei));
    if (f.erwartung === "gueltig") {
      assert.ok(e.gueltig, JSON.stringify(e.befunde, null, 1));
    } else {
      assert.ok(!e.gueltig, "Fall müsste abgewiesen werden");
      assert.ok(
        e.befunde.some((b) => b.regel === f.regel && b.pfad === f.pfad),
        `erwartet ${f.regel} an ${f.pfad}, erhalten: ${e.befunde.map((b) => `${b.regel} ${b.pfad}`).join("; ")}`,
      );
    }
  });
}

for (const f of plausibilitaet) {
  test(`${f.datei}: ${f.regel} (${f.stufe})`, () => {
    const e = pruefeMeldung(lies(f.datei));
    assert.ok(e.gueltig, "Fall muss schemagültig sein");
    const treffer = e.befunde.filter((b) => b.regel === f.regel && b.stufe === f.stufe);
    assert.ok(treffer.length, `erwartet ${f.regel}/${f.stufe}, erhalten: ${e.befunde.map((b) => `${b.regel}/${b.stufe}`).join("; ")}`);
    assert.ok(e.befunde.every((b) => b.regel.startsWith("P")), "nur Plausibilitätsbefunde erwartet");
  });
}

test("Szenario ohne Plausibilitätsbefund", () => {
  for (const f of faelle.filter((x) => x.erwartung === "gueltig")) assert.deepEqual(pruefeMeldung(lies(f.datei)).befunde, [], f.datei);
});

for (const s of saetze) {
  test(`Satz ${s.ordner}`, () => {
    const namen = readdirSync(url(s.ordner)).filter((n) => n.endsWith(".json")).sort();
    const satz = namen.map((n) => ({ name: n, daten: migriere(lies(`${s.ordner}/${n}`)).daten }));
    for (const m of satz) assert.ok(pruefeMeldung(m.daten).gueltig, `${m.name} müsste einzeln gültig sein`);
    const befunde = pruefeSatz(satz);
    assert.equal(befunde.filter((b) => b.stufe === "fehler").length, s.erwartung.fehler);
    assert.deepEqual([...new Set(befunde.map((b) => b.regel))].sort(), [...s.erwartung.regeln].sort());
  });
}
