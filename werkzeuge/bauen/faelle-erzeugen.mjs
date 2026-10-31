// Erzeugt die abgeleiteten Konformitätsfälle aus den handgeschriebenen Grundfällen in konformitaet/positiv/.
// Aufruf: node werkzeuge/bauen/faelle-erzeugen.mjs [--pruefen]
// --pruefen schreibt nichts und endet mit Fehler, wenn eingecheckte Dateien vom erzeugten Stand abweichen.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => JSON.parse(readFileSync(pfad(p), "utf-8"));
const text = (o) => JSON.stringify(o, null, 2) + "\n";

const basis = {
  wasser: () => lies("konformitaet/positiv/betreiber-wasser-folgemeldung.json"),
  strom: () => lies("konformitaet/positiv/betreiber-strom-erstmeldung.json"),
  mobilfunk: () => lies("konformitaet/positiv/betreiber-mobilfunk-erstmeldung-drohend.json"),
  kreis: () => lies("konformitaet/positiv/behoerde-kreis-lead-meldung-v1.json"),
  land: () => lies("konformitaet/positiv/behoerde-land-mit-meldekopf.json"),
};
const ID = {
  wasserErst: "urn:uuid:3f6c1a52-8d1e-4b7a-9c2e-5a1d0e7b4c01",
  wasserFolge: "urn:uuid:3f6c1a52-8d1e-4b7a-9c2e-5a1d0e7b4c02",
  wasserKorrektur: "urn:uuid:3f6c1a52-8d1e-4b7a-9c2e-5a1d0e7b4c03",
  wasserAbschluss: "urn:uuid:3f6c1a52-8d1e-4b7a-9c2e-5a1d0e7b4c04",
};
const sv = (m) => m.sachverhalte[0];
const betrieb = (m) => sv(m).betrieb;

// Abgeleitete gültige Fälle
function wasserErst() {
  const m = basis.wasser();
  Object.assign(m.kritis, { meldeart: "Erstmeldung", meldung_id: ID.wasserErst, bezug_meldung_id: "", meldeanlass: ["eingetretene Einschränkung"] });
  m.meldezeitpunkt = "2026-11-03T08:05";
  m.meldezeitraum = { von: "2026-11-03T05:40", bis: "2026-11-03T08:00" };
  sv(m).sofort.bewertung_text = "Betriebliche Einschätzung des Betreibers, keine LEAD-Beurteilung: Versorgung gehalten; Netzersatz Hauptpumpwerk trägt bis etwa 22:00 Uhr.";
  betrieb(m).unterstuetzungsbedarf = [];
  return m;
}
function wasserKorrektur() {
  const m = basis.wasser();
  Object.assign(m.kritis, { meldeart: "Korrekturmeldung", meldung_id: ID.wasserKorrektur, bezug_meldung_id: ID.wasserFolge, meldeanlass: ["wesentliche Änderung"] });
  m.meldezeitpunkt = "2026-11-03T15:10";
  betrieb(m).ist.betroffene.anschluesse.wert = 5100;
  betrieb(m).ist.betroffene.anschluesse.hinweis = "berichtigt: Druckzone 3 vollständig gezählt";
  m.zeitstrahl += "\n[Z4] 2026-11-03T15:05 · DE-TH-20261103-WQ7K · Berichtigung – Anschlusszahl Druckzonen 5.100 statt 4.900 [Q1] · aufgenommen 2026-11-03T15:10";
  return m;
}
function wasserAbschluss() {
  const m = basis.wasser();
  Object.assign(m.kritis, { meldeart: "Abschlussmeldung", meldung_id: ID.wasserAbschluss, bezug_meldung_id: ID.wasserKorrektur, meldeanlass: ["Zielzustand erreicht"] });
  m.meldezeitpunkt = "2026-11-05T09:00";
  m.meldezeitraum = { von: "2026-11-03T05:40", bis: "2026-11-05T08:45" };
  const b = betrieb(m);
  Object.assign(b.ist, { stand: "2026-11-05T08:45", leistungsgrad: "voll", leistungsgrad_prozent: 100, eskalationsstufe_betrieblich: "" });
  b.ist.betroffene.anschluesse = { wert: 0, einheit: "Hausanschlüsse", status: "belegt", stand: "2026-11-05T08:45", quelle: "[Q1]", hinweis: "" };
  b.ist.betroffene.personen = { wert: null, einheit: "Personen", status: "nicht_zutreffend", stand: "2026-11-05T08:45" };
  b.ersatzverfahren = [];
  b.unterstuetzungsbedarf = [];
  b.prognose = { stand: "2026-11-05T08:45", status: "zielzustand_erreicht", geber: "Betreiber (Leitwarte)", zielzustand: "Dienstleistung wiederhergestellt", fruehestens: "", spaetestens: "", unsicherheit: "", begruendung: "" };
  b.sektor_angaben = { wasser: { druckzonen_betroffen: 1, abkochgebot: "angeordnet" } };
  sv(m).sofort.bewertung_text = "Betriebliche Einschätzung des Betreibers, keine LEAD-Beurteilung: Versorgung wiederhergestellt.\nAbschluss im Lagebild: Dienstleistung wiederhergestellt; offen: Abkochgebot Druckzone 3 bis Laborbefund (Gesundheitsamt).";
  return m;
}

const abgeleitet = [
  { datei: "abgeleitet-betreiber-wasser-erstmeldung.json", bau: wasserErst, beschreibung: "Erstmeldung des Wasserversorgers ohne Bezug" },
  { datei: "abgeleitet-betreiber-wasser-korrekturmeldung.json", bau: wasserKorrektur, beschreibung: "Korrekturmeldung mit Bezug auf die Folgemeldung" },
  { datei: "abgeleitet-betreiber-wasser-abschlussmeldung.json", bau: wasserAbschluss, beschreibung: "Abschlussmeldung: Zielzustand erreicht, Nachsorge offen" },
];

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
  ["behoerde-kopf-mit-betrieb", "R2-behoerde", "/sachverhalte/0", "Behördenmeldung mit Meldekopf und Block betrieb", ab("land", (m) => (sv(m).betrieb = betrieb(basis.strom())))],
  ["folgemeldung-ohne-bezug", "R3-bezug", "/kritis/bezug_meldung_id", "Folgemeldung ohne bezug_meldung_id", ab("wasser", (m) => (m.kritis.bezug_meldung_id = ""))],
  ["erstmeldung-mit-bezug", "R3-bezug", "/kritis/bezug_meldung_id", "Erstmeldung mit bezug_meldung_id", ab("strom", (m) => (m.kritis.bezug_meldung_id = ID.wasserErst))],
  ["datenart-nicht-synthetisch", "Schema", "/kritis/datenart", "Demonstrator nimmt nur synthetische Daten an", ab("strom", (m) => (m.kritis.datenart = "real"))],
  ["tlp-amber", "Schema", "/kritis/vertraulichkeit/tlp", "Demonstrator nimmt nur TLP:CLEAR an", ab("strom", (m) => (m.kritis.vertraulichkeit.tlp = "AMBER"))],
  ["messwert-belegt-ohne-wert", "Schema", "/sachverhalte/0/betrieb/ist/betroffene/anschluesse/wert", "Status belegt ohne Zahl", ab("strom", (m) => (betrieb(m).ist.betroffene.anschluesse.wert = null))],
  ["messwert-unbekannt-mit-wert", "Schema", "/sachverhalte/0/betrieb/ist/betroffene/anschluesse/wert", "Status unbekannt mit Zahl", ab("mobilfunk", (m) => (betrieb(m).ist.betroffene.anschluesse.wert = 5000))],
  ["prozent-ohne-leistungsbasis", "Schema", "/sachverhalte/0/betrieb/ist/leistungsbasis", "Prozentwert ohne Leistungsbasis", ab("wasser", (m) => (betrieb(m).ist.leistungsbasis = ""))],
  ["rto-ohne-zeitanker", "Schema", "/sachverhalte/0/betrieb/bcm/planung/zeitanker", "Wiederanlaufziel ohne Zeitanker", ab("wasser", (m) => (betrieb(m).bcm.planung.zeitanker = ""))],
  ["prognose-ohne-zielzustand", "Schema", "/sachverhalte/0/betrieb/prognose/zielzustand", "Prognose ohne benannten Zielzustand", ab("strom", (m) => (betrieb(m).prognose.zielzustand = ""))],
  ["keine-prognose-mit-termin", "Schema", "/sachverhalte/0/betrieb/prognose/fruehestens", "„keine Prognose möglich“ mit Termin", ab("mobilfunk", (m) => (betrieb(m).prognose.fruehestens = "2026-11-03T12:00"))],
  ["sektor-unbekannt", "Schema", "/sachverhalte/0/betrieb/sektor", "Sektor nicht nach § 4 Abs. 1 KRITISDachG", ab("strom", (m) => (betrieb(m).sektor = "Strom"))],
  ["ars-ungueltig", "Schema", "/sachverhalte/0/betrieb/raum/ars/0", "Regionalschlüssel mit unzulässiger Länge", ab("strom", (m) => (betrieb(m).raum.ars = ["160680"]))],
  ["meldung-id-ungueltig", "Schema", "/kritis/meldung_id", "meldung_id keine URN-UUID", ab("strom", (m) => (m.kritis.meldung_id = "1234"))],
  ["zusatzfeld-im-kopf", "Schema", "/kritis", "nicht vorgesehenes Feld im Meldekopf", ab("strom", (m) => (m.kritis.prioritaet = "hoch"))],
  ["wanduhr-mit-offset", "Schema", "/sachverhalte/0/betrieb/ist/stand", "Zeitangabe mit Offset statt Wanduhrzeit", ab("wasser", (m) => (betrieb(m).ist.stand = "2026-11-03T14:00+01:00"))],
  ["kernfeld-fehlt", "Schema", "/", "Pflichtfeld freigabe des Kernschemas fehlt", ab("strom", (m) => delete m.freigabe)],
].map(([name, regel, pfadErwartet, beschreibung, bau]) => ({ datei: `${name}.json`, regel, pfad: pfadErwartet, beschreibung, bau }));

// Sätze für die Nachrichtenidentität
const saetze = [
  {
    ordner: "kette-wasser",
    beschreibung: "Erst-, Folge-, Korrektur- und Abschlussmeldung eines Betreibers in richtiger Kette",
    dateien: { "1-erst.json": wasserErst, "2-folge.json": basis.wasser, "3-korrektur.json": wasserKorrektur, "4-abschluss.json": wasserAbschluss },
    erwartung: { fehler: 0, regeln: [] },
  },
  {
    ordner: "doppelt-gleich",
    beschreibung: "dieselbe Meldung zweimal: wird einmal geführt",
    dateien: { "a.json": basis.strom, "b.json": basis.strom },
    erwartung: { fehler: 0, regeln: ["I1-identitaet"] },
  },
  {
    ordner: "doppelt-konflikt",
    beschreibung: "gleiche meldung_id, anderer Inhalt",
    dateien: { "a.json": basis.strom, "b.json": ab("strom", (m) => (betrieb(m).ist.betroffene.anschluesse.wert = 41000)) },
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
  for (const f of abgeleitet) dateien.set(`konformitaet/positiv/${f.datei}`, text(f.bau()));
  for (const f of negativ) dateien.set(`konformitaet/negativ/${f.datei}`, text(f.bau()));
  for (const s of saetze) for (const [n, bau] of Object.entries(s.dateien)) dateien.set(`konformitaet/identitaet/${s.ordner}/${n}`, text(bau()));
  const handgeschrieben = readdirSync(pfad("konformitaet/positiv")).filter((n) => n.endsWith(".json") && !n.startsWith("abgeleitet-")).sort();
  const faelle = {
    $comment: "Erwartungen der Konformitätsfälle. Erzeugt von werkzeuge/bauen/faelle-erzeugen.mjs; nicht von Hand bearbeiten.",
    schema: "LEAD-KRITIS-Meldung-v0.1",
    faelle: [
      ...handgeschrieben.map((n) => ({ datei: `positiv/${n}`, erwartung: "gueltig", beschreibung: "handgeschriebener Grundfall" })),
      ...abgeleitet.map((f) => ({ datei: `positiv/${f.datei}`, erwartung: "gueltig", beschreibung: f.beschreibung })),
      ...negativ.map((f) => ({ datei: `negativ/${f.datei}`, erwartung: "ungueltig", regel: f.regel, pfad: f.pfad, beschreibung: f.beschreibung })),
    ],
    saetze: saetze.map((s) => ({ ordner: `identitaet/${s.ordner}`, beschreibung: s.beschreibung, erwartung: s.erwartung })),
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
    for (const d of ["konformitaet/negativ", "konformitaet/identitaet"]) rmSync(pfad(d), { recursive: true, force: true });
    for (const [p, t] of dateien) {
      mkdirSync(pfad(p.split("/").slice(0, -1).join("/")), { recursive: true });
      writeFileSync(pfad(p), t);
    }
    console.log(`${dateien.size} Dateien geschrieben.`);
  }
}

export { erzeuge };
