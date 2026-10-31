// Ladeprobe mit dem Code von KI-LEAD am gepinnten Commit: Profilpaket laden, Beispiele ins Lagebild einlesen, Redaktionscheck.
// Läuft, wenn KI_LEAD_DIR auf einen Klon mit installierten Abhängigkeiten (npm ci) zeigt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const dir = process.env.KI_LEAD_DIR;
const wurzel = fileURLToPath(new URL("..", import.meta.url));
const ohne = !dir ? "KI_LEAD_DIR nicht gesetzt" : !existsSync(join(dir, "node_modules")) ? "KI-LEAD ohne node_modules (npm ci)" : false;

test("Profilpaket lädt in KI-LEAD, Beispiele stehen vollständig im Lagebild", { skip: ohne }, () => {
  const e = JSON.parse(execFileSync(process.execPath, ["--import", "tsx", "werkzeuge/pruefen/ladeprobe.mts"], { cwd: wurzel, encoding: "utf-8", env: process.env }));
  assert.ok(e.profilGeladen, JSON.stringify(e.befunde));
  assert.deepEqual(e.befunde.filter((b) => b.stufe !== "hinweis"), [], "Profil lädt mit Fehlern oder Warnungen");
  assert.deepEqual(e.zip, { geladen: true, gleicherHash: true, befunde: 0 }, "Import als .leadprofil weicht ab");
  assert.equal(e.beispiele.length, 2);
  for (const b of e.beispiele) {
    assert.deepEqual(b.einlesefehler, [], b.ordner);
    for (const m of b.eintraege) {
      assert.ok(!m.fremd, `${b.ordner}/${m.name} gilt als fremd`);
      assert.equal(m.schemabefunde, 0, `${b.ordner}/${m.name} hat Schemabefunde`);
    }
    // Keine Doppelvergabe und kein Bezug ins Leere; Fortschreibungen derselben Stelle sind erwartet
    assert.deepEqual(b.kennungen.filter((k) => k.art !== "fortschreibung"), [], b.ordner);
  }
  const [stand, verlauf] = e.beispiele;
  assert.equal(stand.eintraege.length, 14);
  assert.equal(verlauf.eintraege.length, 21);
  assert.equal(stand.eintraege.filter((m) => m.rolle === "Betreiber").length, 5);
  assert.equal(verlauf.eintraege.filter((m) => m.rolle === "Betreiber").length, 12);
  assert.deepEqual(stand.kennungen.map((k) => k.kennung), ["DE-TH-20261013-N4ST"]);
  // Behördenmeldungen nach LEAD-Meldung-v1 laufen über die Migrationsregel
  assert.equal(stand.eintraege.filter((m) => m.herkunft === "LEAD-Meldung-v1").length, 8);
});
