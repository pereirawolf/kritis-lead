// Erzeugt die Konformitätsfälle nach LEAD-Meldung-v2 (formate/lead-kritis-v2/konformitaet/) aus den überführten Meldungen des
// Szenarios: Negativfälle (Schema, Kern und Rollenregeln R1 bis R3), Plausibilitätsfälle (P1 bis P11) und Sätze für die
// Nachrichtenidentität (I1 bis I5). Nachfolger von werkzeuge/bauen/faelle-erzeugen.mjs für LEAD-KRITIS-Meldung-v0.2.
// Aufruf: node werkzeuge/bauen/faelle-v2-erzeugen.mjs [--pruefen]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => JSON.parse(readFileSync(pfad(p), "utf-8"));
const text = (o) => JSON.stringify(o, null, 2) + "\n";

export const SZENARIO = "formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg";
export const ORDNER = "formate/lead-kritis-v2/konformitaet";
const basis = {
  strom: () => lies(`${SZENARIO}/01_netz_2026-10-13T22-45_erstmeldung.json`),
  mobilfunk: () => lies(`${SZENARIO}/03_mobilfunk_2026-10-14T07-15_erstmeldung.json`),
  leitstelle: () => lies(`${SZENARIO}/05_leitstelle_2026-10-14T07-45_erstmeldung.json`),
  kreis: () => lies(`${SZENARIO}/07_krisenstab_2026-10-14T08-30_lagemeldung-nr-4.json`),
  wasser: () => lies(`${SZENARIO}/09_wasser_2026-10-15T11-00_folgemeldung.json`),
  wasserAbschluss: () => lies(`${SZENARIO}/14_wasser_2026-10-17T09-00_abschlussmeldung.json`),
  netzKorrektur: () => lies(`${SZENARIO}/12_netz_2026-10-15T18-00_korrekturmeldung.json`),
};
const sv = (m) => m.sachverhalte[0];
const betrieb = (m) => sv(m).module["lead-kritis-betrieb"];
const kopf = (m) => m.module["lead-kritis-meldung"];
const ab = (name, fn) => () => {
  const m = basis[name]();
  fn(m);
  return m;
};
const bewertung = (stufe, richtung) => ({
  kernaussage: "Ausfall im Teilnetz.",
  referenzraum: "Netzgebiet Südthüringen",
  beurteilung: { stufe, begruendung: stufe ? "Begründung." : "" },
  tendenz: { richtung, bezug: "", begruendung: "" },
  neubewertung_bei: [],
});
const achse = { stufe: null, status: "offen", offen_grund: "kein_beleg", begruendung: "Keine Angabe.", quellen: [] };
const radar = { fassung: "1.0", ereignisarten: ["Stromausfall / Blackout"], lagenradar: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`d${n}`, achse])) };

// Ungültige Fälle: erwartete Regel und Pfad des Fehlers (Instanzpfad nach Ajv)
const negativ = [
  ["betreiber-mit-beurteilung", "R1-betreiber", "/sachverhalte/0/bewertung/beurteilung/stufe", "Betreiber vergibt eine Beurteilung", ab("wasser", (m) => (sv(m).bewertung = bewertung("kritisch", null)))],
  ["betreiber-mit-tendenz", "R1-betreiber", "/sachverhalte/0/bewertung/tendenz/richtung", "Betreiber vergibt eine Tendenz", ab("wasser", (m) => (sv(m).bewertung = bewertung(null, "Verschärfung")))],
  ["betreiber-mit-lagenradar", "R1-betreiber", "/sachverhalte/0/module", "Betreiber kodiert das Lagenradar (Modul lead-bevoelkerungsschutz)", ab("strom", (m) => (sv(m).module["lead-bevoelkerungsschutz"] = structuredClone(radar)))],
  ["betreiber-ohne-betrieb", "R1-betreiber", "/sachverhalte/0/module", "Betreiber-Sachverhalt ohne Modul lead-kritis-betrieb", ab("strom", (m) => delete sv(m).module["lead-kritis-betrieb"])],
  ["betreiber-ohne-meldungsmodul", "R1-betreiber", "/", "Betreibermeldung ohne Meldungsmodul lead-kritis-meldung", ab("strom", (m) => delete m.module)],
  ["betreiber-ohne-sachverhalt", "R1-betreiber", "/sachverhalte", "Betreibermeldung ohne Sachverhalt", ab("strom", (m) => (m.sachverhalte = []))],
  ["betreiber-kennung-ohne-praefix", "R1-betreiber", "/sachverhalte/0/kennung", "Betreiber-Kennung ohne Präfix KRITIS-", ab("mobilfunk", (m) => (sv(m).kennung = "DE-TH-20261014-M7FB9X"))],
  ["betreiber-kennung-vier-segmente", "R1-betreiber", "/sachverhalte/0/kennung", "Betreiberkürzel mit mehr als drei Segmenten", ab("mobilfunk", (m) => (sv(m).kennung = "KRITIS-MOBIL-B-TH-SON-20261014-M7FB9X"))],
  ["betreiber-ohne-kennung", "Schema", "/sachverhalte/0/kennung", "Betreibermeldung „freigegeben“ ohne Sachverhaltskennung (Kern)", ab("mobilfunk", (m) => (sv(m).kennung = ""))],
  ["behoerde-mit-betrieb", "R2-behoerde", "/sachverhalte/0/module", "Kreismeldung mit Modul lead-kritis-betrieb", ab("kreis", (m) => (sv(m).module["lead-kritis-betrieb"] = betrieb(basis.strom())))],
  ["leitstelle-mit-betrieb", "R2-behoerde", "/sachverhalte/0/module", "Leitstelle (Behörde) mit Modul lead-kritis-betrieb", ab("leitstelle", (m) => (sv(m).module["lead-kritis-betrieb"] = betrieb(basis.strom())))],
  ["behoerde-ohne-bewertung", "Schema", "/sachverhalte/0", "Behördenmeldung ohne Bewertung (Kern)", ab("kreis", (m) => delete sv(m).bewertung)],
  ["folgemeldung-ohne-beziehung", "R3-bezug", "/", "Folgemeldung ohne beziehungen", ab("wasser", (m) => delete m.beziehungen)],
  ["erstmeldung-mit-beziehung", "R3-bezug", "/beziehungen", "Erstmeldung mit beziehungen", ab("strom", (m) => (m.beziehungen = [{ art: "fortschreibung_von", meldung_id: basis.wasser().meldung_id }]))],
  ["korrektur-als-fortschreibung", "R3-bezug", "/beziehungen", "Korrekturmeldung nennt nur fortschreibung_von", ab("netzKorrektur", (m) => (m.beziehungen[0].art = "fortschreibung_von"))],
  ["datenart-nicht-synthetisch", "Schema", "/module/lead-kritis-meldung/datenart", "Demonstrator nimmt nur synthetische Daten an", ab("strom", (m) => (kopf(m).datenart = "real"))],
  ["tlp-amber", "Schema", "/module/lead-kritis-meldung/vertraulichkeit/tlp", "Demonstrator nimmt nur TLP:CLEAR an", ab("strom", (m) => (kopf(m).vertraulichkeit.tlp = "AMBER"))],
  ["zusatzfeld-im-meldungsmodul", "Schema", "/module/lead-kritis-meldung", "nicht vorgesehenes Feld im Meldungsmodul", ab("strom", (m) => (kopf(m).prioritaet = "hoch"))],
  ["meldungsmodul-alte-fassung", "Schema", "/module/lead-kritis-meldung/fassung", "Meldungsmodul in einer anderen Fassung", ab("strom", (m) => (kopf(m).fassung = "0.2"))],
  ["meldung-id-mit-urn", "Schema", "/meldung_id", "meldung_id mit Präfix urn:uuid: (v0.2-Form)", ab("strom", (m) => (m.meldung_id = `urn:uuid:${m.meldung_id}`))],
  ["sektor-unbekannt", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/sektor", "Sektor nicht nach § 4 Abs. 1 KRITISDachG", ab("strom", (m) => (betrieb(m).sektor = "Strom"))],
  ["gebietsschluessel-ungueltig", "Schema", "/sachverhalte/0/raum/gebiete/0/schluessel", "Regionalschlüssel mit Buchstaben", ab("strom", (m) => (sv(m).raum.gebiete[0].schluessel = "16O72"))],
  ["raum-im-modul", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb", "Raum im Modul statt im Kern (v0.2-Form)", ab("strom", (m) => (betrieb(m).raum = { ars: ["16072"], beschreibung: "Teilnetz" }))],
  ["prozent-ohne-leistungsbasis", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/ist", "Leistungsgrad in Prozent ohne Bezugsgröße", ab("wasser", (m) => delete betrieb(m).ist.leistungsbasis)],
  ["planwert-ohne-bezug", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/bcm/planung", "Planwert (RTO) ohne Geschäftsprozess oder Ressource", ab("wasser", (m) => delete betrieb(m).bcm.planung.bezug)],
  ["planwert-ohne-grundlage", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/bcm/planung", "Planwert ohne Begriffsgrundlage", ab("wasser", (m) => delete betrieb(m).bcm.planung.grundlage)],
  ["notbetriebsniveau-ohne-bezugsgroesse", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/bcm/planung/notbetriebsniveau", "Notbetriebsniveau in Prozent ohne Bezugsgröße", ab("wasser", (m) => delete betrieb(m).bcm.planung.notbetriebsniveau.bezugsgroesse)],
  ["prognose-ohne-zielzustand", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/prognose", "Prognose ohne benannten Zielzustand", ab("strom", (m) => delete betrieb(m).prognose.zielzustand)],
  ["keine-prognose-mit-termin", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/prognose", "„keine Prognose möglich“ mit Termin", ab("mobilfunk", (m) => (betrieb(m).prognose.fruehestens = "2026-10-14T12:00+02:00"))],
  ["kennzahl-verweis-ungueltig", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/kennzahlen/betroffene_anschluesse", "Verweis auf eine Kennzahl ohne Kennzahlform", ab("strom", (m) => (betrieb(m).kennzahlen.betroffene_anschluesse = "18000"))],
  ["zeitpunkt-ohne-versatz", "Schema", "/sachverhalte/0/module/lead-kritis-betrieb/ist/stand", "Wanduhrzeit ohne UTC-Versatz (v0.2-Form)", ab("wasser", (m) => (betrieb(m).ist.stand = "2026-10-15T10:45"))],
  ["kernfeld-fehlt", "Schema", "/", "Pflichtfeld entstehung des Kernschemas fehlt", ab("strom", (m) => delete m.entstehung)],
].map(([name, regel, pfadErwartet, beschreibung, bau]) => ({ datei: `${name}.json`, regel, pfad: pfadErwartet, beschreibung, bau }));

// Schemagültig, aber nicht plausibel: erwartete Regel und Stufe
const plausibel = [
  ["prognose-umgekehrt", "P1-prognose", "fehler", "„frühestens“ nach „spätestens“", ab("strom", (m) => Object.assign(betrieb(m).prognose, { fruehestens: "2026-10-16T22:00+02:00", spaetestens: "2026-10-14T12:00+02:00" }))],
  ["reichweite-vor-stand", "P2-reichweite", "warnung", "Reichweite endet vor dem Datenstand", ab("wasser", (m) => (betrieb(m).ersatzverfahren[0].reichweite_bis = "2026-10-15T08:00+02:00"))],
  ["stand-nach-meldezeitpunkt", "P3-stand", "fehler", "Datenstand nach dem Meldezeitpunkt", ab("wasser", (m) => (betrieb(m).ist.stand = "2026-10-15T12:00+02:00"))],
  ["quellenverweis-fehlt", "P4-quellen", "warnung", "Verweis auf eine Quelle, die im Verzeichnis fehlt", ab("strom", (m) => (sv(m).analyse.risiken_auswirkungen += " Nachbarnetz ebenfalls gestört [Q3]."))],
  ["meldezeitraum-umgekehrt", "P5-meldezeitraum", "fehler", "Meldezeitraum „von“ nach „bis“", ab("strom", (m) => (m.meldezeitraum = { von: "2026-10-13T22:30+02:00", bis: "2026-10-13T21:40+02:00" }))],
  ["folgemeldung-ohne-aenderung", "P6-aenderung", "warnung", "Folgemeldung ohne „Änderung zur Vormeldung“", ab("wasser", (m) => delete betrieb(m).aenderung_zur_vormeldung)],
  ["abschluss-ohne-abschluss", "P7-abschluss", "warnung", "Abschlussmeldung ohne Abschluss", ab("wasserAbschluss", (m) => delete betrieb(m).abschluss)],
  ["bedarf-ueberfaellig", "P8-bedarf", "warnung", "angeforderter Bedarf überfällig", ab("mobilfunk", (m) => (m.meldezeitpunkt = "2026-10-14T13:00+02:00"))],
  ["einschraenkung-ohne-eintritt", "P9-beginn", "warnung", "eingeschränkte Leistung ohne Eintritt", ab("strom", (m) => (sv(m).eintritt = { zeit: null, genauigkeit: "unbekannt" }))],
  ["rto-nicht-kleiner-mtpd", "P10-planwerte", "warnung", "RTO nicht kleiner als MTPD", ab("wasser", (m) => (betrieb(m).bcm.planung.mtpd_stunden = 1))],
  ["kennzahl-verweis-fehlt", "P11-kennzahl", "fehler", "Modul verweist auf eine Kennzahl, die im Sachverhalt fehlt", ab("strom", (m) => (betrieb(m).kennzahlen.betroffene_anschluesse = "K9"))],
].map(([name, regel, stufe, beschreibung, bau]) => ({ datei: `${name}.json`, regel, stufe, beschreibung, bau }));

// Sätze für die Nachrichtenidentität
const saetze = [
  { ordner: "doppelt-gleich", beschreibung: "dieselbe Meldung zweimal: wird einmal geführt", dateien: { "a.json": basis.strom, "b.json": basis.strom }, erwartung: { fehler: 0, regeln: ["I1-identitaet"] } },
  {
    ordner: "doppelt-konflikt",
    beschreibung: "gleiche meldung_id, anderer Inhalt",
    dateien: { "a.json": basis.strom, "b.json": ab("strom", (m) => (sv(m).kennzahlen[0].wert = 18500)) },
    erwartung: { fehler: 1, regeln: ["I1-identitaet"] },
  },
  {
    ordner: "bezug-fremde-stelle",
    beschreibung: "Folgemeldung bezieht sich auf die Meldung eines anderen Betreibers",
    dateien: { "a.json": basis.strom, "b.json": ab("wasser", (m) => (m.beziehungen = [{ art: "fortschreibung_von", meldung_id: basis.strom().meldung_id }])) },
    erwartung: { fehler: 0, regeln: ["I3-bezug-stelle", "I5-bezug-kennung"] },
  },
];

export function erzeuge() {
  const dateien = new Map();
  for (const f of negativ) dateien.set(`${ORDNER}/negativ/${f.datei}`, text(f.bau()));
  for (const f of plausibel) dateien.set(`${ORDNER}/plausibel/${f.datei}`, text(f.bau()));
  for (const s of saetze) for (const [n, bau] of Object.entries(s.dateien)) dateien.set(`${ORDNER}/identitaet/${s.ordner}/${n}`, text(bau()));
  const szenario = readdirSync(pfad(SZENARIO)).filter((n) => n.endsWith(".json")).sort();
  const faelle = {
    $comment: "Erwartungen der Konformitätsfälle nach LEAD-Meldung-v2; Pfade relativ zum Repository. Erzeugt von werkzeuge/bauen/faelle-v2-erzeugen.mjs; nicht von Hand bearbeiten.",
    schema: "LEAD-Meldung-v2",
    profilschema: "formate/lead-kritis-v2/meldung.schema.json",
    faelle: [
      ...szenario.map((n) => ({ datei: `${SZENARIO}/${n}`, erwartung: "gueltig", beschreibung: "Szenariomeldung" })),
      { datei: "formate/lead-kritis-v2/beispiele/betreiber-minimal.json", erwartung: "gueltig", beschreibung: "Minimalbeispiel" },
      ...negativ.map((f) => ({ datei: `${ORDNER}/negativ/${f.datei}`, erwartung: "ungueltig", regel: f.regel, pfad: f.pfad, beschreibung: f.beschreibung })),
    ],
    plausibilitaet: plausibel.map((f) => ({ datei: `${ORDNER}/plausibel/${f.datei}`, regel: f.regel, stufe: f.stufe, beschreibung: f.beschreibung })),
    saetze: [
      { ordner: SZENARIO, beschreibung: "ganzes Szenario: Ketten aus Erst-, Folge-, Korrektur- und Abschlussmeldungen", erwartung: { fehler: 0, regeln: [] } },
      ...saetze.map((s) => ({ ordner: `${ORDNER}/identitaet/${s.ordner}`, beschreibung: s.beschreibung, erwartung: s.erwartung })),
    ],
  };
  dateien.set(`${ORDNER}/faelle.json`, text(faelle));
  return dateien;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dateien = erzeuge();
  if (process.argv.includes("--pruefen")) {
    const ab2 = [...dateien].filter(([p, t]) => !existsSync(pfad(p)) || readFileSync(pfad(p), "utf-8") !== t).map(([p]) => p);
    if (ab2.length) {
      console.error(`Abweichend vom erzeugten Stand: ${ab2.join(", ")}. npm run bauen ausführen.`);
      process.exit(1);
    }
    console.log(`${dateien.size} Dateien entsprechen dem erzeugten Stand.`);
  } else {
    for (const d of ["negativ", "plausibel", "identitaet"]) rmSync(pfad(`${ORDNER}/${d}`), { recursive: true, force: true });
    for (const [p, t] of dateien) {
      mkdirSync(pfad(p.split("/").slice(0, -1).join("/")), { recursive: true });
      writeFileSync(pfad(p), t);
    }
    console.log(`${dateien.size} Dateien geschrieben (${ORDNER}).`);
  }
}
