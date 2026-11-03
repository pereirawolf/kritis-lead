// Baut das Betreiberformular als eine einzige, offline nutzbare HTML-Datei: formular/betreibermeldung.html.
// Eingebettet werden der mit Ajv vorab erzeugte Prüfcode des Schemas (kein eval, läuft unter strenger CSP),
// die Plausibilitätsregeln des Prüfwerkzeugs, das Beispiel aus dem Szenario, die Kennungspräfixe und die Schrift.
// Aufruf: node werkzeuge/bauen/formular-bauen.mjs [--pruefen]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import { build } from "esbuild";
import { fusszeile } from "./fusszeile.mjs";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const json = (p) => JSON.parse(lies(p));

export const ZIEL = "formular/betreibermeldung.html";
export const BEISPIEL = "szenario/orkantief-ilka-sonneberg/02_wasser_2026-10-14T06-30_erstmeldung.json";

/**
 * Namen der Kreise und kreisfreien Städte zum fünfstelligen Regionalschlüssel, für den Hinweis am Feld „Regionalschlüssel“
 * (seit 0.3.4). Quelle: Statistisches Bundesamt (Destatis), Kreisfreie Städte und Landkreise, Stand 31.12.2018,
 * Datenlizenz Deutschland – Namensnennung – 2.0; aufbereitet im npm-Paket landkreise-deutschland 3.0.0 (Alexander
 * Wunschik, CC BY 4.0). Spätere Gebietsänderungen: Eisenach (16056) gehört seit 01.07.2021 zum Wartburgkreis.
 */
export const KREISE_ENTFALLEN = ["16056"];
function kreise() {
  const daten = json("node_modules/landkreise-deutschland/data/districts.json");
  const name = ({ type, name: n }) => {
    const ort = String(n).split(",")[0].trim();
    if (type === "Kreisfreie Stadt") return `${ort} (kreisfreie Stadt)`;
    if (type === "Stadtkreis") return `${ort} (Stadtkreis)`;
    // „Wartburgkreis“, „Rhein-Kreis Neuss“, „Region Hannover“, „Städteregion Aachen“, „Landkreis Rostock“ ohne Zusatz
    if (/kreis|Kreis|^Region |^Städteregion |^Regionalverband |^Landkreis /.test(ort)) return ort;
    return `${type} ${ort}`;
  };
  return Object.fromEntries(
    daten
      .map((d) => [String(d.AGS).padStart(5, "0"), name(d)])
      .filter(([ags]) => !KREISE_ENTFALLEN.includes(ags))
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

/** Namen der Thüringer Gemeindeverbände (9 Stellen) und Gemeinden (12 Stellen) zum Regionalschlüssel. */
function orte() {
  const t = json("formular/daten/thueringen-regionen.json");
  return { ...t.verbaende, ...t.gemeinden };
}

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
    schemaId: schema.$id ? schema.$id.split("/").pop().replace(/\.schema\.json$/, "") : "LEAD-KRITIS-Meldung-v0.2",
    version: paket.version,
    schema: { properties: schema.properties, $defs: schema.$defs },
    ui: ui.felder,
    praefixe: ui.kennung.praefixe,
    praefixStandard: ui.kennung.standard,
    zeitstrahlTypen: ui.zeitstrahl.typen,
    beispiel: json(BEISPIEL),
    // Fassung des Meldeprofils für die Kennzeichnung in Schritt 6 (seit 0.3.4 nicht mehr im Seitenkopf)
    profil: { version: profil.version },
    kreise: kreise(),
    // Thüringen bis auf Gemeindeverband und Gemeinde, aus dem Verzeichnis des Thüringer Landesamts für Statistik
    // (formular/daten/thueringen-regionen.json, erzeugt mit werkzeuge/daten/thueringen-regionen.mjs)
    orte: orte(),
  };
  daten.schemaId = daten.beispiel.schema;
  // "<" maskieren, damit kein Text im JSON das Skript-Element beenden kann
  const datenText = JSON.stringify(daten).replace(/</g, "\\u003c");
  const schrift = (gewicht) => readFileSync(pfad(`node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-${gewicht}-normal.woff2`)).toString("base64");

  const ersetzen = {
    SCHRIFT_400: schrift(400),
    SCHRIFT_700: schrift(700),
    STIL: lies("formular/quelle/stil.css").trim(),
    FUSSZEILE: fusszeile(paket.version),
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
