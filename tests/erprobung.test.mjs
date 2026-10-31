// Erprobungsunterlagen: gebaute Dateien aktuell, Verweise erreichbar, Einspielungen vollständig, Abgrenzung erhalten.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { baueErprobung, ABLAUF } from "../werkzeuge/bauen/erprobung-bauen.mjs";

const wurzel = fileURLToPath(new URL("..", import.meta.url));
const lies = (p) => readFileSync(join(wurzel, p), "utf-8");
const alle = (p) => (statSync(join(wurzel, p)).isDirectory() ? readdirSync(join(wurzel, p)).flatMap((n) => alle(`${p}/${n}`)) : [p]);

test("gebaute Erprobungsunterlagen entsprechen dem Szenario", () => {
  for (const [p, t] of Object.entries(baueErprobung())) assert.equal(lies(p), t, `${p}: npm run bauen ausführen`);
});

test("jede Betreibermeldung des Szenarios hat eine Einspielung mit Realzeit", () => {
  const ordner = "szenario/orkantief-ilka-sonneberg";
  const betreiber = readdirSync(join(wurzel, ordner)).filter((n) => n.endsWith(".json") && JSON.parse(lies(`${ordner}/${n}`)).kritis?.rolle === "Betreiber");
  assert.equal(betreiber.length, 12);
  assert.deepEqual(Object.keys(ABLAUF).sort(), betreiber.map((n) => n.slice(0, 2)).sort());
  const karten = readdirSync(join(wurzel, "erprobung/einspielungen")).filter((n) => n !== "README.md");
  assert.equal(karten.length, 12);
  for (const k of karten) {
    const t = lies(`erprobung/einspielungen/${k}`);
    assert.match(t, /\*\*Spielzeit /);
    assert.match(t, /Beurteilung, Tendenz und Lagenradar bleiben leer/);
  }
});

test("relative Verweise in Erprobungsunterlagen und Dokumentation führen zu vorhandenen Dateien", () => {
  const dateien = [...alle("erprobung"), ...alle("docs"), "README.md"].filter((p) => p.endsWith(".md"));
  const fehlend = [];
  for (const d of dateien) {
    for (const [, ziel] of lies(d).matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(ziel)) continue;
      const p = normalize(join(dirname(d), ziel.split("#")[0]));
      if (!existsSync(join(wurzel, p))) fehlend.push(`${d} → ${ziel}`);
    }
  }
  assert.deepEqual(fehlend, []);
});

test("Erprobungshinweise grenzen ab und nennen nur fiktive Daten", () => {
  const e = lies("docs/ERPROBUNG.md");
  assert.ok(e.includes("privates Forschungsvorhaben"));
  assert.ok(e.includes("keine dienstliche Maßnahme"));
  assert.ok(e.includes("Nur fiktive Inhalte"));
  assert.ok(e.includes("simuliert **keinen Meldeweg**"));
  // Zielwerte in ERPROBUNG.md und Trockenlauf stimmen überein
  const t = JSON.parse(lies("erprobung/trockenlauf/ergebnis.json"));
  for (const bereich of ["Nahtlosigkeit", "Prüfwege", "Rollentreue", "Herkunft", "Datenqualität"]) {
    assert.ok(t.kriterien.some((k) => k.bereich === bereich && k.erfuellt), `Trockenlauf: ${bereich}`);
    assert.match(e, new RegExp(`\\| ${bereich} \\|`));
  }
});

test("Trockenlauf passt zu Version, Profil und Pin", () => {
  const t = JSON.parse(lies("erprobung/trockenlauf/ergebnis.json"));
  const paket = JSON.parse(lies("package.json"));
  const profil = JSON.parse(lies("profil/lead-kritis/profil.json"));
  const quelle = JSON.parse(lies("kern/quelle.json"));
  assert.equal(t.stand.kritisLead, paket.version, "npm run trockenlauf ausführen");
  assert.equal(t.stand.profil, `${profil.id} ${profil.version}`);
  assert.equal(t.stand.kiLead.commit, quelle.commit);
});
