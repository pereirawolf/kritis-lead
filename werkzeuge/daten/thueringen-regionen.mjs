// Namen zum Regionalschlüssel für Thüringen bis auf Gemeindeverband (9 Stellen) und Gemeinde (12 Stellen), für den
// Hinweis am Feld „Regionalschlüssel“ im Betreiberformular (seit 0.3.4, KL-UX-29).
//
// Eingang: das Anschriftenverzeichnis des Thüringer Landesamts für Statistik als drei CSV-Dateien (Semikolon, Kopfzeile
// F1;F2;…): Gemeinden, Verwaltungsgemeinschaften, Kreise und kreisfreie Städte. Übernommen werden nur Schlüssel und
// Namen; Anschriften, Kontaktdaten, Namen und Parteien von Bürgermeistern und Landräten bleiben draußen.
//
// Aufruf: node werkzeuge/daten/thueringen-regionen.mjs <gemeinden.csv> <verwaltungsgemeinschaften.csv> <kreise.csv> [Stand]
// Ausgabe: formular/daten/thueringen-regionen.json (CC BY 4.0 wie die übrigen Inhalte; Quelle siehe Datei)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ZIEL = fileURLToPath(new URL("../../formular/daten/thueringen-regionen.json", import.meta.url));

/** CSV lesen; UTF-8, sonst ISO-8859-1 (so liefert das Landesamt die Gemeindedatei aus). */
function lies(pfad) {
  const roh = readFileSync(pfad);
  let text = roh.toString("utf-8");
  if (text.includes("�")) text = new TextDecoder("latin1").decode(roh);
  return text
    .replace(/\r/g, "")
    .split("\n")
    .filter((z) => z.trim())
    .slice(1)
    .map((z) => z.split(";").map((x) => x.trim()));
}

const [gemeindeDatei, vgDatei, kreisDatei, stand = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
if (!kreisDatei) {
  console.error("Aufruf: node werkzeuge/daten/thueringen-regionen.mjs <gemeinden.csv> <verwaltungsgemeinschaften.csv> <kreise.csv> [Stand]");
  process.exit(2);
}

// Spalten: Gemeinden F3 = ARS (12), F13/F14 = Verwaltungsgemeinschaft, F15/F16 = erfüllende Gemeinde, F17 = Name;
// Verwaltungsgemeinschaften F3 = ARS (9), F4 = Name; Kreise F1 = Kreisschlüssel, F2 = Name
const gemeinden = lies(gemeindeDatei).map((r) => ({ ars: r[2], vg: r[13], erfuellend: r[15], name: r[16] }));
const vgs = lies(vgDatei).map((r) => ({ ars: r[2], name: r[3] }));
const kreise = lies(kreisDatei).map((r) => ({ ars: r[0], name: r[1] }));

const fehler = [];
const pruefe = (bedingung, text) => bedingung || fehler.push(text);
for (const g of gemeinden) pruefe(/^16\d{10}$/.test(g.ars) && g.name, `Gemeinde ohne Schlüssel oder Name: ${JSON.stringify(g)}`);
for (const v of vgs) pruefe(/^16\d{7}$/.test(v.ars) && v.name, `Verwaltungsgemeinschaft ohne Schlüssel oder Name: ${JSON.stringify(v)}`);
for (const k of kreise) pruefe(/^16\d{3}$/.test(k.ars) && k.name, `Kreis ohne Schlüssel oder Name: ${JSON.stringify(k)}`);

// Gemeindeverbände: Verwaltungsgemeinschaft, erfüllende Gemeinde (Schlüssel 5051 ff. ohne eigene Verwaltungsgemeinschaft)
// oder gemeinschaftsfreie Gemeinde (Schlüssel 0…, gleich der Gemeinde)
const verbaende = {};
for (const v of vgs) verbaende[v.ars] = `Verwaltungsgemeinschaft ${v.name}`;
for (const g of gemeinden) {
  const v = g.ars.slice(0, 9);
  if (verbaende[v]) continue;
  if (v[5] === "5") {
    const erfuellend = gemeinden.find((x) => x.ars.slice(0, 9) === v && x.erfuellend && x.erfuellend === x.name)?.name || g.erfuellend;
    pruefe(erfuellend, `Gemeindeverband ${v} ohne Verwaltungsgemeinschaft und ohne erfüllende Gemeinde`);
    verbaende[v] = `Erfüllende Gemeinde ${erfuellend}`;
  } else verbaende[v] = g.name;
}
for (const g of gemeinden) pruefe(kreise.some((k) => k.ars === g.ars.slice(0, 5)), `Gemeinde ${g.ars} ohne Kreis im Verzeichnis`);
if (fehler.length) {
  console.error(fehler.join("\n"));
  process.exit(1);
}

const sortiert = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
const daten = {
  quelle: "Thüringer Landesamt für Statistik, Anschriftenverzeichnis der Gemeinden, Verwaltungsgemeinschaften, Landkreise und kreisfreien Städte Thüringens",
  stand,
  hinweis: "Nur Regionalschlüssel und Namen; Verbreitung mit Quellenangabe. Erzeugt mit werkzeuge/daten/thueringen-regionen.mjs.",
  kreise: sortiert(Object.fromEntries(kreise.map((k) => [k.ars, k.name]))),
  verbaende: sortiert(verbaende),
  gemeinden: sortiert(Object.fromEntries(gemeinden.map((g) => [g.ars, g.name]))),
};
mkdirSync(fileURLToPath(new URL("../../formular/daten/", import.meta.url)), { recursive: true });
writeFileSync(ZIEL, JSON.stringify(daten, null, 1) + "\n");
console.log(`formular/daten/thueringen-regionen.json: ${kreise.length} Kreise, ${Object.keys(verbaende).length} Gemeindeverbände, ${gemeinden.length} Gemeinden (Stand ${stand}).`);
