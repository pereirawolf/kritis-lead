// Pin-Abstand zu KI-LEAD (werkzeuge/pruefen/pin-abstand.mjs) an einem nachgebauten KI-LEAD-Ordner, ohne Netz.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { HERKUNFT, MODULE, WURZEL, pinAbstand } from "../werkzeuge/pruefen/pin-abstand.mjs";

const sha256 = (d) => createHash("sha256").update(d).digest("hex");
const pins = ["kern/quelle.json", "kern/design/quelle.json"].map((p) => JSON.parse(readFileSync(join(WURZEL, p), "utf8")));

function kiLead({ kernAnders = false, designAnders = false, mitEinbettung = false, modulAlt = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "ki-lead-"));
  const schreibe = (pfad, inhalt) => {
    mkdirSync(dirname(join(dir, pfad)), { recursive: true });
    writeFileSync(join(dir, pfad), inhalt);
  };
  for (const pin of pins)
    for (const d of pin.dateien) {
      const kopie = readFileSync(join(WURZEL, d.ziel), "utf8");
      const anders = (kernAnders && d.ziel === "kern/lead-meldung-v2/kern.schema.json") || (designAnders && d.ziel.startsWith("kern/design/"));
      schreibe(d.quelle, anders ? `${kopie} ` : kopie);
    }
  if (mitEinbettung)
    schreibe(
      HERKUNFT,
      JSON.stringify({
        module: MODULE.map((m, i) => ({ quelle: m, sha256: modulAlt && i === 1 ? sha256("alt") : sha256(readFileSync(join(WURZEL, m))) })),
      }),
    );
  return dir;
}

test("Pin-Abstand: gleicher Stand ohne Einbettung ergibt keinen Befund, nur einen Hinweis", async () => {
  const { befunde, hinweise, bericht } = await pinAbstand({ dir: kiLead() });
  assert.deepEqual(befunde, []);
  assert.equal(hinweise.length, 1);
  assert.match(hinweise[0], /noch nicht ein/);
  assert.match(bericht, /Kein Abstand/);
});

test("Pin-Abstand: geändertes Kernschema in KI-LEAD wird gemeldet", async () => {
  const { befunde } = await pinAbstand({ dir: kiLead({ kernAnders: true }) });
  assert.equal(befunde.length, 1);
  assert.match(befunde[0], /kern\/lead-meldung-v2\/kern\.schema\.json entspricht nicht mehr/);
});

test("Pin-Abstand: aktuelle Einbettung der Module ergibt keinen Befund und keinen Hinweis", async () => {
  const { befunde, hinweise } = await pinAbstand({ dir: kiLead({ mitEinbettung: true }) });
  assert.deepEqual(befunde, []);
  assert.deepEqual(hinweise, []);
});

test("Pin-Abstand: veraltete Einbettung eines Moduls in KI-LEAD wird gemeldet", async () => {
  const { befunde } = await pinAbstand({ dir: kiLead({ mitEinbettung: true, modulAlt: true }) });
  assert.equal(befunde.length, 1);
  assert.match(befunde[0], /lead-kritis-betrieb\.schema\.json nicht in der aktuellen Fassung/);
});

test("Pin-Abstand: abweichende Design Tokens sind ein Hinweis, kein Abstand (bewusst gepinnte Fassung)", async () => {
  const { befunde, hinweise } = await pinAbstand({ dir: kiLead({ designAnders: true, mitEinbettung: true }) });
  assert.deepEqual(befunde, []);
  assert.equal(hinweise.length, 2);
  assert.ok(hinweise.every((h) => /Grunddesign 1\.0 gepinnt/.test(h)));
});
