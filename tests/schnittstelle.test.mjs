// Beschreibung des Zielformats für Schnittstellen (schnittstelle/, docs/SCHNITTSTELLE.md): Die erzeugten Dateien passen
// zum Schema, das Feldverzeichnis deckt alle Felder der Szenariomeldungen ab, das Minimalbeispiel ist gültig, und die
// Anleitung nennt nur Felder, die es gibt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { erzeuge, DATEIEN, FORMAT_FELDVERZEICHNIS } from "../werkzeuge/bauen/schnittstelle-bauen.mjs";
import { baueSchema, SCHEMA_ID } from "../werkzeuge/bauen/schema-bauen.mjs";
import { migriere } from "../werkzeuge/pruefen/pruefen.mjs";
import { pruefePlausibilitaet } from "../werkzeuge/pruefen/plausibilitaet.mjs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf-8");
const json = (p) => JSON.parse(lies(p));
const SZENARIO = "szenario/orkantief-ilka-sonneberg";

test("Feldreferenz, Feldverzeichnis und Minimalbeispiel entsprechen dem Schema", () => {
  for (const [p, t] of erzeuge()) assert.equal(lies(p), t, `${p}: npm run bauen ausführen`);
});

const verzeichnis = json(DATEIEN.felder);
const pfade = new Set(verzeichnis.felder.map((f) => f.pfad));

test("Feldverzeichnis nennt Format, Schemakennung und eindeutige Pfade", () => {
  assert.equal(verzeichnis.format, FORMAT_FELDVERZEICHNIS);
  assert.equal(verzeichnis.schema, SCHEMA_ID);
  assert.equal(pfade.size, verzeichnis.felder.length, "Pfade doppelt");
  const zeilen = lies(DATEIEN.csv).replace(/^﻿/, "").trim().split("\r\n");
  assert.equal(zeilen.length - 1, verzeichnis.felder.length, "CSV und JSON nennen verschieden viele Felder");
});

/** Alle Pfade einer Meldung in der Schreibweise des Feldverzeichnisses (Listenelemente als []). */
function pfadeVon(wert, basis = "", aus = new Set()) {
  if (Array.isArray(wert)) {
    for (const x of wert) if (x && typeof x === "object") pfadeVon(x, `${basis}[]`, aus);
  } else if (wert && typeof wert === "object") {
    for (const [k, v] of Object.entries(wert)) {
      const p = basis ? `${basis}.${k}` : k;
      aus.add(p);
      pfadeVon(v, p, aus);
    }
  }
  return aus;
}

test("Feldverzeichnis deckt jedes Feld der Szenariomeldungen ab", () => {
  const dateien = readdirSync(new URL(`../${SZENARIO}`, import.meta.url)).filter((n) => n.endsWith(".json"));
  assert.ok(dateien.length > 0);
  for (const n of dateien) for (const p of pfadeVon(json(`${SZENARIO}/${n}`))) assert.ok(pfade.has(p), `${n}: ${p} fehlt im Feldverzeichnis`);
});

test("Rollenregeln und Pflichtregel stehen mit ihrer Kennung im Feldverzeichnis", () => {
  const kennungen = verzeichnis.regeln.map((r) => r.kennung).filter(Boolean);
  for (const k of ["K-final", "R1-betreiber", "R2-behoerde", "R3-bezug", "R4-zeitzone"]) assert.ok(kennungen.includes(k), `${k} fehlt`);
  for (const r of verzeichnis.regeln) assert.ok(r.dann || r.sonst || r.immer, `Regel ohne Wirkung: ${JSON.stringify(r)}`);
});

test("Minimalbeispiel ist eine gültige Betreibermeldung ohne Plausibilitätsfehler", () => {
  const m = json(DATEIEN.minimal);
  const pruefe = new Ajv2020({ allErrors: true, strict: false }).compile(baueSchema());
  assert.ok(pruefe(migriere(m).daten), JSON.stringify(pruefe.errors));
  assert.equal(m.kritis.rolle, "Betreiber");
  assert.deepEqual(pruefePlausibilitaet(m).filter((b) => b.stufe === "fehler"), []);
  for (const p of pfadeVon(m)) assert.ok(pfade.has(p), `${p} fehlt im Feldverzeichnis`);
});

test("Anleitung für Schnittstellen nennt nur Felder, die es im Schema gibt", () => {
  const text = lies("docs/SCHNITTSTELLE.md");
  const wurzeln = new Set([...pfade].map((p) => p.split(/[.[]/)[0]));
  const genannt = [...text.matchAll(/`([a-z_][a-z0-9_]*(?:\[\])?(?:\.[a-z0-9_]+(?:\[\])?)*)`/g)].map((x) => x[1]);
  let geprueft = 0;
  for (const g of genannt) {
    const erster = g.split(/[.[]/)[0];
    if (g.endsWith(".")) continue;
    const voll = erster === "betrieb" ? `sachverhalte[].${g}` : wurzeln.has(erster) ? g : null;
    if (!voll) continue;
    geprueft++;
    assert.ok(pfade.has(voll), `docs/SCHNITTSTELLE.md nennt ${code(g)}, das Schema kennt ${voll} nicht`);
  }
  assert.ok(geprueft > 30, `nur ${geprueft} Feldnamen erkannt`);
});
const code = (t) => `\`${t}\``;
