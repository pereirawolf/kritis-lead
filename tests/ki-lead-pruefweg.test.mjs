// Zweiter Prüfweg: Der Prüfer von KI-LEAD muss für jeden Fall wie Ajv urteilen. Läuft, wenn KI_LEAD_DIR auf einen Klon zeigt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const dir = process.env.KI_LEAD_DIR;
const wurzel = fileURLToPath(new URL("..", import.meta.url));
const lies = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf-8"));

test("KI-LEAD-Prüfer urteilt wie die Erwartung", { skip: !dir && "KI_LEAD_DIR nicht gesetzt" }, () => {
  const pin = lies("kern/quelle.json").commit;
  const kopf = execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf-8" }).trim();
  assert.equal(kopf, pin, "KI_LEAD_DIR steht nicht auf dem gepinnten Commit");

  const aus = execFileSync(process.execPath, ["--import", "tsx", "werkzeuge/pruefen/ki-lead-pruefweg.mts"], { cwd: wurzel, encoding: "utf-8", env: process.env });
  const ergebnis = JSON.parse(aus);
  assert.equal(ergebnis.schemaFehler, null, "Profilschema für KI-LEAD nicht verwendbar");

  const erwartet = new Map(lies("konformitaet/faelle.json").faelle.map((f) => [f.datei, f.erwartung === "gueltig"]));
  for (const f of ergebnis.faelle) assert.equal(f.gueltig, erwartet.get(f.datei), `${f.datei}: ${JSON.stringify(f.fehler)}`);
  assert.ok(ergebnis.ilka.length > 0);
  for (const f of ergebnis.ilka) assert.ok(f.gueltig, `Behördenmeldung ${f.datei} aus KI-LEAD müsste gültig sein`);
});
