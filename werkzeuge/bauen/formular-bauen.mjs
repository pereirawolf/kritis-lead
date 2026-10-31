// Baut das Betreiberformular als eine einzige, offline nutzbare HTML-Datei: formular/betreibermeldung.html.
// Eingebettet werden der mit Ajv vorab erzeugte Prüfcode des Schemas (kein eval, läuft unter strenger CSP),
// die Plausibilitätsregeln des Prüfwerkzeugs, das Beispiel aus dem Szenario, die Kennungspräfixe und die Schrift.
// Aufruf: node werkzeuge/bauen/formular-bauen.mjs [--pruefen]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import { build } from "esbuild";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const json = (p) => JSON.parse(lies(p));

export const ZIEL = "formular/betreibermeldung.html";
export const BEISPIEL = "szenario/orkantief-ilka-sonneberg/02_wasser_2026-10-14T06-30_erstmeldung.json";

export async function baueFormular() {
  const schema = json("profil/lead-kritis/meldung.schema.json");
  const ui = json("profil/lead-kritis/meldung.ui.json");
  const profil = json("profil/lead-kritis/profil.json");
  const paket = json("package.json");

  const ajv = new Ajv2020({ allErrors: true, strict: false, code: { source: true, esm: true, lines: false } });
  const validatorCode = standaloneCode(ajv, ajv.compile(schema));

  const bundle = await build({
    entryPoints: [pfad("formular/quelle/formular.mjs")],
    bundle: true,
    write: false,
    format: "iife",
    target: "es2022",
    minify: true,
    legalComments: "none",
    charset: "utf8",
    logLevel: "silent",
    plugins: [
      {
        name: "validator",
        setup(b) {
          b.onResolve({ filter: /^virtual:validator$/ }, () => ({ path: "validator", namespace: "virtuell" }));
          b.onLoad({ filter: /.*/, namespace: "virtuell" }, () => ({ contents: validatorCode, loader: "js", resolveDir: pfad(".") }));
        },
      },
    ],
  });
  const skript = bundle.outputFiles[0].text.trim();

  const daten = {
    schemaId: schema.$id ? schema.$id.split("/").pop().replace(/\.schema\.json$/, "") : "LEAD-KRITIS-Meldung-v0.1",
    version: paket.version,
    schema: { properties: schema.properties, $defs: schema.$defs },
    praefixe: ui.kennung.praefixe,
    praefixStandard: ui.kennung.standard,
    zeitstrahlTypen: ui.zeitstrahl.typen,
    beispiel: json(BEISPIEL),
  };
  daten.schemaId = daten.beispiel.schema;
  // "<" maskieren, damit kein Text im JSON das Skript-Element beenden kann
  const datenText = JSON.stringify(daten).replace(/</g, "\\u003c");
  const schrift = (gewicht) => readFileSync(pfad(`node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-${gewicht}-normal.woff2`)).toString("base64");

  const ersetzen = {
    SCHRIFT_400: schrift(400),
    SCHRIFT_700: schrift(700),
    STIL: lies("formular/quelle/stil.css").trim(),
    PROFIL_ID: profil.id,
    PROFIL_VERSION: profil.version,
    VERSION: paket.version,
    SCHEMA_ID: daten.schemaId,
    DATEN: datenText,
    SKRIPT: skript.replace(/<\/script/gi, "<\\/script"),
  };
  return lies("formular/quelle/vorlage.html").replace(/\{\{([A-Z_0-9]+)\}\}/g, (_, k) => {
    if (!(k in ersetzen)) throw new Error(`Platzhalter {{${k}}} unbekannt`);
    return ersetzen[k];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = await baueFormular();
  if (process.argv.includes("--pruefen")) {
    let alt = "";
    try {
      alt = lies(ZIEL);
    } catch {
      /* fehlt */
    }
    if (alt !== html) {
      console.error(`${ZIEL} ist nicht aktuell: npm run bauen ausführen.`);
      process.exit(1);
    }
    console.log(`${ZIEL} ist aktuell.`);
  } else {
    writeFileSync(pfad(ZIEL), html);
    console.log(`${ZIEL} gebaut (${Math.round(html.length / 1024)} KiB).`);
  }
}
