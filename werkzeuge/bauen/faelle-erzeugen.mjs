// Erzeugt die Negativfälle und Identitätssätze aus den Meldungen des Szenarios (szenario/orkantief-ilka-sonneberg).
// Aufruf: node werkzeuge/bauen/faelle-erzeugen.mjs [--pruefen]
// --pruefen schreibt nichts und endet mit Fehler, wenn eingecheckte Dateien vom erzeugten Stand abweichen.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => JSON.parse(readFileSync(pfad(p), "utf-8"));
const text = (o) => JSON.stringify(o, null, 2) + "\n";

const SZENARIO = "szenario/orkantief-ilka-sonneberg";
const basis = {
  strom: () => lies(`${SZENARIO}/01_netz_2026-10-13T22-45_erstmeldung.json`),
  mobilfunk: () => lies(`${SZENARIO}/03_mobilfunk_2026-10-14T07-15_erstmeldung.json`),
  leitstelle: () => lies(`${SZENARIO}/05_leitstelle_2026-10-14T07-45_erstmeldung.json`),
  kreis: () => lies(`${SZENARIO}/07_krisenstab_2026-10-14T08-30_lagemeldung-nr-4.json`),
  wasser: () => lies(`${SZENARIO}/09_wasser_2026-10-15T11-00_folgemeldung.json`),
  wasserAbschluss: () => lies(`${SZENARIO}/14_wasser_2026-10-17T09-00_abschlussmeldung.json`),
};
const sv = (m) => m.sachverhalte[0];
const betrieb = (m) => sv(m).betrieb;

// Ungültige Fälle: erwartete Regel und Pfad des Fehlers
const ab = (name, fn) => () => { const m = basis[name](); fn(m); return m; };
const negativ = [
  ["betreiber-mit-beurteilung", "R1-betreiber", "/sachverhalte/0/sofort/beurteilung", "Betreiber vergibt eine Beurteilung", ab("wasser", (m) => (sv(m).sofort.beurteilung = "kritisch"))],
  ["betreiber-mit-tendenz", "R1-betreiber", "/sachverhalte/0/sofort/tendenz", "Betreiber vergibt eine Tendenz", ab("wasser", (m) => (sv(m).sofort.tendenz = "Verschärfung"))],
  ["betreiber-mit-radarwert", "R1-betreiber", "/sachverhalte/0/sofort/lagenradar/d5", "Betreiber kodiert eine Radarachse", ab("strom", (m) => (sv(m).sofort.lagenradar.d5 = 3))],
  ["betreiber-ohne-betrieb", "R1-betreiber", "/sachverhalte/0", "Betreibermeldung ohne Block betrieb", ab("strom", (m) => delete sv(m).betrieb)],
  ["betreiber-ohne-kennung", "R1-betreiber", "/sachverhalte/0/kennung", "Betreibermeldung ohne Sachverhaltskennung", ab("mobilfunk", (m) => (sv(m).kennung = ""))],
  ["betreiber-ohne-zeitzone", "R4-zeitzone", "/", "Meldekopf ohne Zeitzone", ab("strom", (m) => delete m.zeitzone)],
  ["behoerde-v1-mit-betrieb", "R2-behoerde", "/sachverhalte/0", "Behördenmeldung nach LEAD-Meldung-v1 mit Block betrieb", ab("kreis", (m) => (sv(m).betrieb = betrieb(basis.strom())))],
  ["behoerde-kopf-mit-betrieb", "R2-behoerde", "/sachverhalte/0", "Behördenmeldung mit Meldekopf und Block betrieb", ab("leitstelle", (m) => (sv(m).betrieb = betrieb(basis.strom())))],
  ["folgemeldung-ohne-bezug", "R3-bezug", "/kritis/bezug_meldung_id", "Folgemeldung ohne bezug_meldung_id", ab("wasser", (m) => (m.kritis.bezug_meldung_id = ""))],
  ["erstmeldung-mit-bezug", "R3-bezug", "/kritis/bezug_meldung_id", "Erstmeldung mit bezug_meldung_id", ab("strom", (m) => (m.kritis.bezug_meldung_id = basis.wasser().kritis.meldung_id))],
  ["datenart-nicht-synthetisch", "Schema", "/kritis/datenart", "Demonstrator nimmt nur synthetische Daten an", ab("strom", (m) => (m.kritis.datenart = "real"))],
  ["tlp-amber", "Schema", "/kritis/vertraulichkeit/tlp", "Demonstrator nimmt nur TLP:CLEAR an", ab("strom", (m) => (m.kritis.vertraulichkeit.tlp = "AMBER"))],
  ["messwert-belegt-ohne-wert", "Schema", "/sachverhalte/0/betrieb/ist/betroffene/anschluesse/wert", "Status belegt ohne Zahl", ab("strom", (m) => (betrieb(m).ist.betroffene.anschluesse.wert = null))],
  ["messwert-ohne-einheit", "Schema", "/sachverhalte/0/betrieb/ist/betroffene/anschluesse", "Status belegt ohne Einheit", ab("strom", (m) => delete betrieb(m).ist.betroffene.anschluesse.einheit)],
  ["messwert-unbekannt-mit-wert", "Schema", "/sachverhalte/0/betrieb/ist/betroffene/anschluesse/wert", "Status unbekannt mit Zahl", ab("mobilfunk", (m) => (betrieb(m).ist.betroffene.anschluesse.wert = 5000))],
  ["prozent-ohne-leistungsbasis", "Schema", "/sachverhalte/0/betrieb/ist/leistungsbasis", "Prozentwert ohne Leistungsbasis", ab("wasser", (m) => (betrieb(m).ist.leistungsbasis = ""))],
  ["planwert-ohne-bezug", "Schema", "/sachverhalte/0/betrieb/bcm/planung/bezug", "Planwert (RTO) ohne Geschäftsprozess oder Ressource", ab("wasser", (m) => (betrieb(m).bcm.planung.bezug = ""))],
  ["planwert-ohne-grundlage", "Schema", "/sachverhalte/0/betrieb/bcm/planung/grundlage", "Planwert ohne Begriffsgrundlage (BSI-Standard 200-4 oder anderer)", ab("wasser", (m) => (betrieb(m).bcm.planung.grundlage = ""))],
  ["notbetriebsniveau-ohne-bezugsgroesse", "Schema", "/sachverhalte/0/betrieb/bcm/planung/notbetriebsniveau/bezugsgroesse", "Notbetriebsniveau in Prozent ohne Bezugsgröße", ab("wasser", (m) => (betrieb(m).bcm.planung.notbetriebsniveau.bezugsgroesse = ""))],
  ["prognose-ohne-zielzustand", "Schema", "/sachverhalte/0/betrieb/prognose/zielzustand", "Prognose ohne benannten Zielzustand", ab("strom", (m) => (betrieb(m).prognose.zielzustand = ""))],
  ["keine-prognose-mit-termin", "Schema", "/sachverhalte/0/betrieb/prognose/fruehestens", "„keine Prognose möglich“ mit Termin", ab("mobilfunk", (m) => (betrieb(m).prognose.fruehestens = "2026-11-03T12:00"))],
  ["sektor-unbekannt", "Schema", "/sachverhalte/0/betrieb/sektor", "Sektor nicht nach § 4 Abs. 1 KRITISDachG", ab("strom", (m) => (betrieb(m).sektor = "Strom"))],
  ["ars-ungueltig", "Schema", "/sachverhalte/0/betrieb/raum/ars/0", "Regionalschlüssel mit unzulässiger Länge", ab("strom", (m) => (betrieb(m).raum.ars = ["160680"]))],
  ["meldung-id-ungueltig", "Schema", "/kritis/meldung_id", "meldung_id keine URN-UUID", ab("strom", (m) => (m.kritis.meldung_id = "1234"))],
  ["zusatzfeld-im-kopf", "Schema", "/kritis", "nicht vorgesehenes Feld im Meldekopf", ab("strom", (m) => (m.kritis.prioritaet = "hoch"))],
  ["wanduhr-mit-offset", "Schema", "/sachverhalte/0/betrieb/ist/stand", "Zeitangabe mit Offset statt Wanduhrzeit", ab("wasser", (m) => (betrieb(m).ist.stand = "2026-10-15T10:45+02:00"))],
  ["kernfeld-fehlt", "Schema", "/", "Pflichtfeld freigabe des Kernschemas fehlt", ab("strom", (m) => delete m.freigabe)],
].map(([name, regel, pfadErwartet, beschreibung, bau]) => ({ datei: `${name}.json`, regel, pfad: pfadErwartet, beschreibung, bau }));

// Schemagültig, aber nicht plausibel: erwartete Regel und Stufe
const plausibel = [
  ["rto-nicht-kleiner-mtpd", "P10-planwerte", "warnung", "RTO nicht kleiner als MTPD", ab("wasser", (m) => (betrieb(m).bcm.planung.mtpd_stunden = 1))],
  ["prognose-umgekehrt", "P1-prognose", "fehler", "„frühestens“ nach „spätestens“", ab("strom", (m) => Object.assign(betrieb(m).prognose, { fruehestens: "2026-10-16T22:00", spaetestens: "2026-10-14T12:00" }))],
  ["stand-nach-meldezeitpunkt", "P3-stand", "fehler", "Datenstand nach dem Meldezeitpunkt", ab("wasser", (m) => (betrieb(m).ist.stand = "2026-10-15T12:00"))],
  ["meldezeitraum-umgekehrt", "P5-meldezeitraum", "fehler", "Meldezeitraum „von“ nach „bis“", ab("strom", (m) => (m.meldezeitraum = { von: "2026-10-13T22:30", bis: "2026-10-13T21:40" }))],
  ["reichweite-vor-stand", "P2-reichweite", "warnung", "Reichweite endet vor dem Datenstand", ab("wasser", (m) => (betrieb(m).ersatzverfahren[0].reichweite_bis = "2026-10-15T08:00"))],
  ["quellenverweis-fehlt", "P4-quellen", "warnung", "Verweis auf eine Quelle, die im Verzeichnis fehlt", ab("strom", (m) => (sv(m).analyse.risiken_auswirkungen += " Nachbarnetz ebenfalls gestört [Q3]."))],
  ["folgemeldung-ohne-aenderung", "P6-aenderung", "warnung", "Folgemeldung ohne „Änderung zur Vormeldung:“", ab("wasser", (m) => (sv(m).sofort.bewertung_text = sv(m).sofort.bewertung_text.replace(/\nÄnderung zur Vormeldung:.*$/s, "")))],
  ["abschluss-ohne-kennsatz", "P7-abschluss", "warnung", "Abschlussmeldung ohne „Abschluss im Lagebild:“", ab("wasserAbschluss", (m) => (sv(m).sofort.bewertung_text = sv(m).sofort.bewertung_text.replace(/\nAbschluss im Lagebild:.*$/s, "")))],
  ["bedarf-ueberfaellig", "P8-bedarf", "warnung", "angeforderter Bedarf überfällig", ab("mobilfunk", (m) => (m.meldezeitpunkt = "2026-10-14T13:00"))],
  ["einschraenkung-ohne-beginn", "P9-beginn", "warnung", "eingeschränkte Leistung ohne Beginn", ab("strom", (m) => (betrieb(m).ist.beginn = ""))],
].map(([name, regel, stufe, beschreibung, bau]) => ({ datei: `${name}.json`, regel, stufe, beschreibung, bau }));

// Sätze für die Nachrichtenidentität
const saetze = [
  {
    ordner: "doppelt-gleich",
    beschreibung: "dieselbe Meldung zweimal: wird einmal geführt",
    dateien: { "a.json": basis.strom, "b.json": basis.strom },
    erwartung: { fehler: 0, regeln: ["I1-identitaet"] },
  },
  {
    ordner: "doppelt-konflikt",
    beschreibung: "gleiche meldung_id, anderer Inhalt",
    dateien: { "a.json": basis.strom, "b.json": ab("strom", (m) => (betrieb(m).ist.betroffene.anschluesse.wert = 18500)) },
    erwartung: { fehler: 1, regeln: ["I1-identitaet"] },
  },
  {
    ordner: "bezug-fremde-stelle",
    beschreibung: "Folgemeldung bezieht sich auf die Meldung eines anderen Betreibers",
    dateien: { "a.json": basis.strom, "b.json": ab("wasser", (m) => (m.kritis.bezug_meldung_id = basis.strom().kritis.meldung_id)) },
    erwartung: { fehler: 0, regeln: ["I3-bezug-stelle", "I5-bezug-kennung"] },
  },
];

function erzeuge() {
  const dateien = new Map();
  for (const f of negativ) dateien.set(`konformitaet/negativ/${f.datei}`, text(f.bau()));
  for (const f of plausibel) dateien.set(`konformitaet/plausibel/${f.datei}`, text(f.bau()));
  for (const s of saetze) for (const [n, bau] of Object.entries(s.dateien)) dateien.set(`konformitaet/identitaet/${s.ordner}/${n}`, text(bau()));
  const szenario = readdirSync(pfad(SZENARIO)).filter((n) => n.endsWith(".json")).sort();
  const faelle = {
    $comment: "Erwartungen der Konformitätsfälle; Pfade relativ zum Repository. Erzeugt von werkzeuge/bauen/faelle-erzeugen.mjs; nicht von Hand bearbeiten.",
    schema: "LEAD-KRITIS-Meldung-v0.2",
    faelle: [
      ...szenario.map((n) => ({ datei: `${SZENARIO}/${n}`, erwartung: "gueltig", beschreibung: "Szenariomeldung" })),
      ...negativ.map((f) => ({ datei: `konformitaet/negativ/${f.datei}`, erwartung: "ungueltig", regel: f.regel, pfad: f.pfad, beschreibung: f.beschreibung })),
    ],
    plausibilitaet: plausibel.map((f) => ({ datei: `konformitaet/plausibel/${f.datei}`, regel: f.regel, stufe: f.stufe, beschreibung: f.beschreibung })),
    saetze: [
      { ordner: SZENARIO, beschreibung: "ganzes Szenario: Ketten aus Erst-, Folge-, Korrektur- und Abschlussmeldungen", erwartung: { fehler: 0, regeln: [] } },
      ...saetze.map((s) => ({ ordner: `konformitaet/identitaet/${s.ordner}`, beschreibung: s.beschreibung, erwartung: s.erwartung })),
    ],
  };
  dateien.set("konformitaet/faelle.json", text(faelle));
  return dateien;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dateien = erzeuge();
  if (process.argv.includes("--pruefen")) {
    const abweichend = [...dateien].filter(([p, t]) => !existsSync(pfad(p)) || readFileSync(pfad(p), "utf-8") !== t).map(([p]) => p);
    if (abweichend.length) {
      console.error(`Abweichend vom erzeugten Stand: ${abweichend.join(", ")}. npm run bauen ausführen.`);
      process.exit(1);
    }
    console.log(`${dateien.size} Dateien entsprechen dem erzeugten Stand.`);
  } else {
    for (const d of ["konformitaet/negativ", "konformitaet/plausibel", "konformitaet/identitaet"]) rmSync(pfad(d), { recursive: true, force: true });
    for (const [p, t] of dateien) {
      mkdirSync(pfad(p.split("/").slice(0, -1).join("/")), { recursive: true });
      writeFileSync(pfad(p), t);
    }
    console.log(`${dateien.size} Dateien geschrieben.`);
  }
}

export { erzeuge };
