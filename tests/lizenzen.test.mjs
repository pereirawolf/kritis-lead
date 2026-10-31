// Prüft die Lizenz- und Abgrenzungshinweise an den Stellen, an denen Nutzende sie erwarten.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf-8");

test("README trägt den Hinweis nach der EUPL und die Abgrenzung", () => {
  const readme = lies("README.md");
  assert.ok(readme.includes("© 2026 Heiko Pereira Wolf. Licensed under the EUPL-1.2"));
  assert.ok(readme.includes("privates Forschungsvorhaben"));
  assert.ok(readme.includes("fiktiv"));
});

test("Lizenzdateien sind vorhanden und vollständig", () => {
  assert.ok(lies("LICENSE").startsWith("EUROPEAN UNION PUBLIC LICENCE v. 1.2"));
  assert.ok(lies("LICENSE-CC0").includes("CC0 1.0 Universal"));
  const inhalt = lies("LICENSE-CONTENT");
  assert.ok(inhalt.includes("1. CC BY 4.0."));
  assert.ok(inhalt.includes("2. Zusätzlich CC0 1.0."));
  assert.ok(inhalt.includes("Creative Commons Attribution 4.0 International Public License"));
});

test("package.json und CITATION.cff nennen dieselben Lizenzen", () => {
  assert.equal(JSON.parse(lies("package.json")).license, "EUPL-1.2");
  assert.match(lies("CITATION.cff"), /^license:\n {2}- EUPL-1\.2\n {2}- CC-BY-4\.0$/m);
});
