// Überführt das Szenario Orkantief „Ilka“ im Landkreis Sonneberg einmalig aus LEAD-KRITIS-Meldung-v0.2 bzw. LEAD-Meldung-v1
// nach LEAD-Meldung-v2 mit den Modulen von KRITIS-LEAD (formate/lead-kritis-v2/, Abbildung im README dort).
// Kernteile (Quellen, Zeitstrahl, Bewertung, Fristen, Freigabe, Zeiten) überführt das Werkzeug von KI-LEAD am gepinnten Stand
// (migriereV1 in src/kern/meldung-v2.js); die Betreiberangaben, Kennungen, Bezüge und Maßnahmen setzt die Tabelle unten.
// Grundsatz wie in KI-LEAD: nichts erfinden. Was nur abgeleitet ist, steht als Hinweis in entstehung.migration.hinweise.
//
// Aufruf: KI_LEAD_DIR=<Klon am Commit aus kern/quelle.json> node werkzeuge/migration/v2-ueberfuehren.mjs [--pruefen]
// Bis zur Umstellung von Formular und Profilpaket bleiben die Ausgangsdateien in szenario/ maßgeblich; danach werden die
// überführten Dateien die Quelle und dieses Werkzeug dokumentiert nur noch die Überführung.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { kiLeadDir } from "../bauen/schema-v2-bauen.mjs";

const WURZEL = fileURLToPath(new URL("../../", import.meta.url));
export const QUELLE = "szenario/orkantief-ilka-sonneberg";
export const ZIEL = "formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg";
const AM = new Date("2026-11-05T11:00:00Z");
const ZONE = "Europe/Berlin";
const lies = (p) => JSON.parse(readFileSync(join(WURZEL, p), "utf-8"));
const text = (o) => JSON.stringify(o, null, 2) + "\n";

/** Kennungen v0.2/v1 → v2 (Entscheidungen des Herausgebers vom 03. und 05.11.2026). */
export const KENNUNGEN = {
  "DE-TH-20261013-N4ST": "KRITIS-NETZSUED-20261013-N4ST7Q",
  "DE-TH-20261014-W2ZV": "KRITIS-ZVTN-20261014-W2ZV3M",
  "DE-TH-20261014-M7FB": "KRITIS-MOBILB-20261014-M7FB9X",
  "DE-TH-20261014-P8HM": "KRITIS-PFLEGEOL-20261014-P8HM4D",
  "DE-TH-20261014-G5RS": "DE-TH-SON-20261014-G5RS6T",
  "DE-TH-20261014-K3SB": "DE-TH-SON-20261014-R4WP",
};
const KREIS = { name: "Landkreis Sonneberg", schluessel: "16072" };
const id = (urn) => String(urn || "").replace(/^urn:uuid:/, "");

// Maßnahmen je Datei (Kern: handlungsbedarf.massnahmen). Ersatzverfahren und Unterstützungsbedarf stehen nur im Modul
// lead-kritis-betrieb und werden hier nicht doppelt geführt (Entscheidung vom 05.11.2026).
const M = (gegenstand, stelle, status, stand, quellen) => ({ gegenstand, stelle, status, stand, quellen });
const MASSNAHMEN = {
  "01": { liste: [], doppelt: "Umschaltungen über Nachbarabgänge (Ersatzverfahren)" },
  "02": { liste: [], doppelt: "Notstrombetrieb Pumpwerk (Ersatzverfahren); Unterstützungsbedarf Diesel" },
  "03": { liste: [M("Beschaffung mobiler Netzersatzanlagen", "Mobilfunkbetreiber", "begonnen", "2026-10-14T07:00", ["Q1"])], doppelt: "Unterstützungsbedarf Stellplätze und Betankung" },
  "04": { liste: [M("Heizung auf Gemeinschaftsräume begrenzt", "Träger", "umgesetzt", "2026-10-14T07:15", ["Q1"])], doppelt: "Notstrombetrieb (Ersatzverfahren); Unterstützungsbedarf Diesel" },
  "05": { liste: [M("Notrufannahme über die Notfalltreffpunkte mit BOS-Funk", "Leitstelle", "wirksam", "2026-10-14T07:30", ["Q1"])] },
  "06": { liste: [M("Mastneubau vorbereitet, Material angefordert", "Netzbetreiber", "begonnen", "2026-10-14T08:00", ["Q1"])], doppelt: "Unterstützungsbedarf Freiräumen der Zufahrt" },
  "07": {
    liste: [
      M("acht Notfalltreffpunkte mit BOS-Funk, Wärme und Ladestrom", "Krisenstab", "wirksam", "2026-10-14T08:00", ["Q6"]),
      M("Dieselnachschub für Pumpwerk und Pflegeheime", "Krisenstab", "angefordert", null, ["Q3", "Q4"]),
      M("Unterstützung durch THW aus Oberfranken mit Netzersatzanlagen", "Krisenstab", "angefordert", null, ["Q6"]),
    ],
    stelle_abgeleitet: "M3",
  },
  "08": { liste: [], doppelt: "14 Standorte über Netzersatzanlagen (Ersatzverfahren); Unterstützungsbedarf gedeckt" },
  "09": { liste: [], doppelt: "Notstrombetrieb Pumpwerk (Ersatzverfahren); Dieselbedarf gedeckt" },
  "10": { liste: [], doppelt: "Notstrombetrieb (Ersatzverfahren); Dieselbedarf gedeckt" },
  "11": { liste: [M("Seilzug an den Ersatzmasten", "Netzbetreiber", "begonnen", "2026-10-15T16:00", ["Q1"])], doppelt: "Unterstützungsbedarf gedeckt" },
  "12": { liste: [M("Seilzug an den Ersatzmasten", "Netzbetreiber", "begonnen", "2026-10-15T16:00", ["Q1"])], doppelt: "Unterstützungsbedarf gedeckt" },
  "13": { liste: [M("Wiederversorgung abgeschlossen", "Netzbetreiber", "beendet", "2026-10-16T21:10", ["Q1"])] },
  "14": { liste: [M("Rückschaltung auf Netzbetrieb", "Zweckverband", "beendet", "2026-10-16T21:30", ["Q1"])], doppelt: "Nachsorge (steht in abschluss.offene_punkte)" },
};

// Lagemeldung Nr. 4 des Krisenstabs: Meldungskennung (v1 hatte keine) und die Fassungen der Eingänge, auf die sie sich stützt
const KREISMELDUNG = {
  meldung_id: "1c4a2026-1013-4000-8000-000000000701",
  quellen: { Q1: "1c4a2026-1013-4000-8000-000000000102", Q2: "1c4a2026-1013-4000-8000-000000000201", Q3: "1c4a2026-1013-4000-8000-000000000301", Q4: "1c4a2026-1013-4000-8000-000000000401", Q5: "1c4a2026-1013-4000-8000-000000000501" },
};

// Zugang „betriebsintern“ für Betreiberquellen, deren v1-Titel ihn nicht nennt (Entscheidung vom 05.11.2026):
// eigene, nicht öffentliche Unterlagen des Betreibers, auch wenn sie an die Behörde gingen
const ZUGANG_BETREIBER = { "03": ["Q1"], "04": ["Q1"], "08": ["Q1"], "10": ["Q1"] };

// Messwerte des Blocks betrieb → Kennzahlen des Kerns: Rolle, Pfad im Block, Einheit, Art
const MESSWERTE = [
  ["betroffene_anschluesse", (b) => b.ist?.betroffene?.anschluesse, "Anschlüsse", "bestand"],
  ["betroffene_personen", (b) => b.ist?.betroffene?.personen, "Personen", "bestand"],
  ["wiederversorgte_anschluesse", (b) => b.sektor_angaben?.energie?.wiederversorgte_anschluesse, "Anschlüsse", "kumuliert"],
  ["standorte_ausgefallen", (b) => b.sektor_angaben?.telekommunikation?.standorte_ausgefallen, "Standorte", "bestand"],
  ["standorte_netzersatz", (b) => b.sektor_angaben?.telekommunikation?.standorte_netzersatz, "Standorte", "bestand"],
  ["betreibbare_betten", (b) => b.sektor_angaben?.gesundheit?.betreibbare_betten, "Betten", "kapazitaet"],
  ["verlegungsbedarf", (b) => b.sektor_angaben?.gesundheit?.verlegungsbedarf, "Personen", "bedarf"],
];
const ERHEBUNG = { belegt: "gezaehlt", geschaetzt: "geschaetzt" };

/** Entfernt leere Texte und leere Auswahlwerte ("" = bisher „nicht angegeben“). */
function ohneLeere(o) {
  if (Array.isArray(o)) return o.map(ohneLeere);
  if (!o || typeof o !== "object") return o;
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== "") out[k] = ohneLeere(v);
  return out;
}

async function werkzeug() {
  const dir = kiLeadDir();
  return import(pathToFileURL(join(dir, "src/kern/meldung-v2.js")).href);
}

/** Überführt eine Datei; liefert die v2-Meldung. */
export function ueberfuehre(name, alt, kl) {
  const nr = name.slice(0, 2);
  const zeit = (w) => kl.zeitV2(w, alt.zeitzone || ZONE);
  const hinweise = [];
  const betreiber = alt.kritis?.rolle === "Betreiber";
  const { kritis, zeitzone: _z, ...rest } = alt;
  const v1 = { ...rest, schema: "LEAD-Meldung-v1", sachverhalte: alt.sachverhalte.map(({ betrieb: _b, ...s }) => s) };
  const { meldung: m, hinweise: kernHinweise } = kl.migriereV1(v1, { meldungId: () => id(kritis?.meldung_id) || KREISMELDUNG.meldung_id, jetzt: () => AM });
  m.zeitzone = alt.zeitzone || ZONE;

  // Absender
  m.absender = betreiber
    ? { stelle: alt.meldende_stelle, ebene: "Betreiber", gebiet: { name: "Thüringen", schluessel: "DE-TH" } }
    : { stelle: alt.meldende_stelle, ebene: "Kreis", gebiet: { ...KREIS } };
  if (!betreiber) hinweise.push(`absender: Ebene Kreis und Gebiet ${KREIS.name} (${KREIS.schluessel}) gesetzt (Entscheidung vom 05.11.2026)`);

  // Meldungsmodul und Beziehungen aus dem Meldekopf
  if (kritis) {
    const { erweiterung: _e, rolle: _r, meldung_id: _m, bezug_meldung_id, ...kopf } = kritis;
    m.module = { "lead-kritis-meldung": ohneLeere({ fassung: "0.3", ...kopf, gemeldet_an: (kopf.gemeldet_an || []).map((g) => ({ ...g, ...(g.zeitpunkt !== undefined ? { zeitpunkt: zeit(g.zeitpunkt) } : {}) })) }) };
    if (bezug_meldung_id) m.beziehungen = [{ art: kritis.meldeart === "Korrekturmeldung" ? "berichtigung_von" : "fortschreibung_von", meldung_id: id(bezug_meldung_id) }];
  }

  // Zugang betriebsinterner Unterlagen, die v1 nicht kennzeichnet
  const zugangGesetzt = [];
  for (const q of m.quellen)
    if (betreiber && (ZUGANG_BETREIBER[nr] || []).includes(q.id) && q.zugang == null) {
      q.zugang = "betriebsintern";
      zugangGesetzt.push(q.id);
      hinweise.push(`quellen ${q.id}: Zugang „betriebsintern“ gesetzt (eigene Unterlage des Betreibers, in v1 nicht gekennzeichnet; Entscheidung vom 05.11.2026)`);
    }

  // Eingangsmeldungen der Kreismeldung mit ihrer Fassung
  if (nr === "07")
    for (const q of m.quellen) if (KREISMELDUNG.quellen[q.id]) q.meldung_id = KREISMELDUNG.quellen[q.id];

  m.sachverhalte = m.sachverhalte.map((sv, i) => {
    const a = alt.sachverhalte[i];
    const p = `sachverhalte[${i}]`;
    sv.kennung = KENNUNGEN[sv.kennung] || sv.kennung;
    if (sv.bezug) sv.bezug = sv.bezug.map((b) => ({ kennung: KENNUNGEN[b.kennung] || b.kennung }));
    // Berichtigungszeilen ohne berichtigte Zeile: In v2 berichtigt eine Zeile vom Typ „Berichtigung“ eine frühere Zeile
    // des Zeitstrahls; die Berichtigung einer Angabe der Meldung tragen beziehungen (berichtigung_von) und
    // aenderung_zur_vormeldung. Solche Zeilen entfallen.
    const ohne = (sv.zeitstrahl || []).filter((z) => z.typ === "Berichtigung" && !z.berichtigt);
    if (ohne.length) {
      sv.zeitstrahl = sv.zeitstrahl.filter((z) => !ohne.includes(z));
      for (const z of ohne) hinweise.push(`${p}.zeitstrahl: Zeile ${z.id} („${z.text}“) entfällt – Berichtigung einer Angabe, keiner Zeile; sie steht in beziehungen bzw. aenderung_zur_vormeldung`);
    }
    const tabelle = MASSNAHMEN[nr];
    sv.handlungsbedarf.massnahmen = tabelle.liste.map((x, j) => ({ id: `M${j + 1}`, ...x, stand: x.stand ? zeit(x.stand) : null }));
    delete sv.handlungsbedarf.erlaeuterung;
    hinweise.push(`${p}.handlungsbedarf.massnahmen: aus dem Text „Bestehende Maßnahmen“ übernommen${tabelle.doppelt ? `; nicht doppelt geführt: ${tabelle.doppelt}` : ""}`);

    if (betreiber) return betriebsSachverhalt(sv, a, p, zeit, hinweise);

    // Behörden: Raum mit Kreisschlüssel; Leitstelle ohne eigene Bewertung
    sv.raum.gebiete = [{ ...KREIS }];
    if (nr === "05") {
      delete sv.module["lead-bevoelkerungsschutz"];
      sv.bewertung.kernaussage = "Notrufe aus vier Gemeinden im Ausfallgebiet erreichen die Leitstelle seit etwa 04:30 Uhr nur eingeschränkt; Ursache sind ausgefallene Mobilfunkstandorte.";
      sv.bewertung.referenzraum = KREIS.name;
      hinweise.push(`${p}.bewertung.kernaussage: aus Lage & Ereignis übernommen (v0.2 ohne Kernaussage); referenzraum aus dem Absender`);
      hinweise.push(`${p}.module.lead-bevoelkerungsschutz: entfällt (Leitstelle ohne Ereignisart und Lagenradar; die Bewertung für den Landkreis trifft der Krisenstab)`);
    }
    if (nr === "07") {
      sv.bezug = sv.bezug.map((b) => ({ ...b, art: "verdichtung", meldung_id: bezugsFassung(b.kennung) }));
      sv.bewertung.referenzraum = KREIS.name;
      sv.bewertung.beurteilung.begruendung =
        "Die Puffer von Pflege und Trinkwasser enden vor der Wiederversorgung; entscheidend ist der Dieselnachschub bis 15.10. mittags.";
      for (const a2 of Object.values(sv.module["lead-bevoelkerungsschutz"].lagenradar)) a2.begruendung = "Radarwert illustrativ, nicht kalibriert (fiktives Szenario).";
      // D4 wie in der Fortschreibung SON 10:00 in KI-LEAD (Entscheidung des Herausgebers vom 05.11.2026)
      sv.module["lead-bevoelkerungsschutz"].lagenradar.d4.stufe = 2;
      hinweise.push(`${p}.module.lead-bevoelkerungsschutz.lagenradar.d4: Stufe 2 statt 4 wie in der Fortschreibung SON 10:00 (KI-LEAD, Landesprofil Thüringen): Hilfe aus angrenzenden Kreisen ist überörtlich, auch über die Landesgrenze (Entscheidung vom 05.11.2026)`);
      sv.kennzahlen = [
        kennzahl("K1", "Anschlüsse ohne Versorgung", "Anschlüsse", "bestand", 5300, "gezaehlt", zeit("2026-10-14T08:00"), ["Q1"]),
        kennzahl("K2", "Einwohnerinnen und Einwohner ohne Strom", "Personen", "bestand", 9800, "geschaetzt", zeit("2026-10-14T08:00"), ["Q6"]),
      ];
      hinweise.push(`${p}.bewertung.referenzraum: aus dem Absender (v1 ohne Zeile „Referenzraum:“)`);
      hinweise.push(`${p}.bewertung.beurteilung.begruendung: aus der Kernaussage abgeleitet`);
      hinweise.push(`${p}.module.lead-bevoelkerungsschutz.lagenradar: Begründung je Achse aus dem Bewertungstext („Radarwerte illustrativ, nicht kalibriert“)`);
      hinweise.push(`${p}.bezug: Art „verdichtung“ und Fassung der Eingangsmeldung zum Datenstand 08:00 gesetzt`);
      hinweise.push(`${p}.kennzahlen: Anschlüsse (rund 5.300, Datenstand 08:00) und Einwohner (rund 9.800, Zuordnung des Krisenstabs) aus Lage & Ereignis`);
    }
    return sv;
  });

  // Hinweise des Kernwerkzeugs, die die Überführung erledigt hat, entfallen
  const erledigt = [/\.bewertung\.(kernaussage|referenzraum)/, /handlungsbedarf\.massnahmen/, /raum\.gebiete/, /\.bezug: Art des Bezugs/, ...(betreiber ? [/Begründung im Bewertungstext für D/, /Grund der offenen Achse/, /kennzahlen: entscheidungsrelevante/] : [])];
  if (nr === "07") erledigt.push(/Begründung im Bewertungstext für D/, /beurteilung: Begründung nicht/, /kennzahlen: entscheidungsrelevante/);
  if (nr === "05") erledigt.push(/Begründung im Bewertungstext für D/, /Grund der offenen Achse/);
  for (const qid of zugangGesetzt) erledigt.push(new RegExp(`^quellen ${qid}: Zugang`));
  const offen = kernHinweise.filter((h) => !erledigt.some((r) => r.test(h)));
  m.entstehung.migration = {
    von: alt.schema,
    am: m.entstehung.migration.am,
    werkzeug: `werkzeuge/migration/v2-ueberfuehren.mjs (KRITIS-LEAD) mit ${m.entstehung.migration.werkzeug} (KI-LEAD)`,
    hinweise: [...offen, ...hinweise],
  };
  return ordne(m);
}

function bezugsFassung(kennung) {
  // Stand der Eingänge, auf die sich die Lagemeldung Nr. 4 (Datenstand 08:00) stützt
  return {
    "KRITIS-NETZSUED-20261013-N4ST7Q": "1c4a2026-1013-4000-8000-000000000102",
    "KRITIS-MOBILB-20261014-M7FB9X": "1c4a2026-1013-4000-8000-000000000201",
    "KRITIS-ZVTN-20261014-W2ZV3M": "1c4a2026-1013-4000-8000-000000000301",
    "KRITIS-PFLEGEOL-20261014-P8HM4D": "1c4a2026-1013-4000-8000-000000000401",
    "DE-TH-SON-20261014-G5RS6T": "1c4a2026-1013-4000-8000-000000000501",
  }[kennung];
}

const kennzahl = (id2, gegenstand, einheit, art, wert, erhebung, datenstand, quellen) => ({ id: id2, gegenstand, einheit, art, wert, mindestwert: false, erhebung, datenstand, quellen });
const quellenAus = (q) => [...String(q || "").matchAll(/Q(\d+)/g)].map((x) => `Q${x[1]}`);

function betriebsSachverhalt(sv, a, p, zeit, hinweise) {
  const b = a.betrieb;
  const bew = sv.bewertung;
  delete sv.bewertung;
  delete sv.module["lead-bevoelkerungsschutz"];
  hinweise.push(`${p}: Bewertung und Modul lead-bevoelkerungsschutz entfallen (Betreibermeldung; Ereignisarten aus v0.2: ${(a.art || []).join(", ") || "keine"})`);

  // Raum: Regionalschlüssel in den Kern, Beschreibung aus Block und Ort
  const ort = String(a.ort || "").replace(/^Thüringen;\s*/, "");
  sv.raum = {
    beschreibung: [b.raum.beschreibung, ort].filter(Boolean).join("; "),
    gebiete: (b.raum.ars || []).map((s) => (s === KREIS.schluessel ? { ...KREIS } : { name: s, schluessel: s })),
  };
  if (b.ist.beginn && zeit(b.ist.beginn) !== sv.eintritt.zeit) hinweise.push(`${p}.eintritt: Ausfallbeginn ${b.ist.beginn} weicht vom Eintritt ab, Eintritt beibehalten`);

  // Messwerte → Kennzahlen
  const kz = [];
  const verweis = {};
  const kzHinweis = {};
  for (const [rolle, wo, einheit, art] of MESSWERTE) {
    const w = wo(b);
    if (!w) continue;
    if (w.hinweis) kzHinweis[rolle] = w.hinweis;
    if (w.status === "nicht_zutreffend") verweis[rolle] = "nicht_zutreffend";
    else if (w.status === "unbekannt" || w.wert === null) verweis[rolle] = null;
    else {
      const k = `K${kz.length + 1}`;
      kz.push(kennzahl(k, w.einheit, einheit, art, w.wert, ERHEBUNG[w.status], zeit(w.stand), quellenAus(w.quelle)));
      verweis[rolle] = k;
    }
  }
  sv.kennzahlen = kz;

  const modul = {
    fassung: "0.3",
    betreiber: b.betreiber,
    sektor: b.sektor,
    kritische_dienstleistung: b.kritische_dienstleistung,
    anlage: b.anlage,
    anteil_gebiet_prozent: b.raum.anteil_gebiet_prozent,
    ist: { stand: zeit(b.ist.stand), leistungsgrad: b.ist.leistungsgrad, leistungsgrad_prozent: b.ist.leistungsgrad_prozent, leistungsbasis: b.ist.leistungsbasis, einrichtungen: b.ist.betroffene?.einrichtungen?.length ? b.ist.betroffene.einrichtungen : undefined, eskalationsstufe_betrieblich: b.ist.eskalationsstufe_betrieblich },
    kennzahlen: verweis,
    kennzahlen_hinweise: Object.keys(kzHinweis).length ? kzHinweis : undefined,
    ersatzverfahren: (b.ersatzverfahren || []).map((e) => ({ ...e, reichweite_bis: zeit(e.reichweite_bis), stand: zeit(e.stand) })),
    prognose: { ...b.prognose, stand: zeit(b.prognose.stand), fruehestens: b.prognose.fruehestens === "" ? undefined : zeit(b.prognose.fruehestens), spaetestens: b.prognose.spaetestens === "" ? undefined : zeit(b.prognose.spaetestens) },
    bcm: b.bcm && { ...b.bcm, planung: b.bcm.planung && (({ quelle, stand, ...pl }) => ({ ...pl, quellen: quellenAus(quelle), stand: stand ? zeit(stand) : undefined }))(b.bcm.planung) },
    abhaengigkeiten: b.abhaengigkeiten,
    unterstuetzungsbedarf: (b.unterstuetzungsbedarf || []).map((u) => ({ ...u, bis: zeit(u.bis) })),
    ursache: b.ursache,
    bestaetigungsgrad: b.bestaetigungsgrad,
    einschaetzung: bew.erlaeuterung,
    folgemeldung_bei: bew.neubewertung_bei?.length ? bew.neubewertung_bei.map((x) => x.indikator) : undefined,
    aenderung_zur_vormeldung: bew.aenderung_zur_vormeldung,
    abschluss: bew.abschluss && (([ergebnis, offen]) => ({ ergebnis, offene_punkte: offen }))(bew.abschluss.offene_punkte.split(/;\s*offen:\s*/)),
    sektor_angaben: sektor(b.sektor_angaben),
  };
  if (b.bcm?.planung?.quelle && !quellenAus(b.bcm.planung.quelle).length) hinweise.push(`${p}: Quelle der BCM-Planung „${b.bcm.planung.quelle}“ ohne Verweis`);
  sv.module = { ...sv.module, "lead-kritis-betrieb": entferneUndefiniert(ohneLeere(modul)) };
  return sv;
}

function sektor(sa) {
  if (!sa) return undefined;
  const out = {};
  if (sa.energie?.netzebene) out.energie = { netzebene: sa.energie.netzebene };
  if (sa.wasser) out.wasser = sa.wasser;
  if (sa.telekommunikation?.notruf) out.telekommunikation = { notruf: sa.telekommunikation.notruf };
  return Object.keys(out).length ? out : undefined;
}

function entferneUndefiniert(o) {
  if (Array.isArray(o)) return o.map(entferneUndefiniert);
  if (!o || typeof o !== "object") return o;
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, entferneUndefiniert(v)]));
}

/** Feste Reihenfolge der Felder wie im Kernschema. */
function ordne(m) {
  const reihe = ["schema", "fassung", "meldung_id", "beziehungen", "status", "absender", "berichtsraum", "meldezeitpunkt", "zeitzone", "meldezeitraum", "module", "quellen", "sachverhalte", "fehlanzeige", "freigabe", "entstehung"];
  const out = {};
  for (const k of reihe) if (k in m) out[k] = m[k];
  for (const k of Object.keys(m)) if (!(k in out)) out[k] = m[k];
  return out;
}

export async function erzeuge() {
  const kl = await werkzeug();
  const dateien = new Map();
  for (const name of readdirSync(join(WURZEL, QUELLE)).filter((n) => n.endsWith(".json")).sort())
    dateien.set(`${ZIEL}/${name}`, text(ueberfuehre(name, lies(`${QUELLE}/${name}`), kl)));
  return dateien;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dateien = await erzeuge();
  if (process.argv.includes("--pruefen")) {
    const ab = [...dateien].filter(([p, t]) => !existsSync(join(WURZEL, p)) || readFileSync(join(WURZEL, p), "utf-8") !== t).map(([p]) => p);
    if (ab.length) {
      console.error(`Abweichend von der Überführung: ${ab.join(", ")}. npm run bauen ausführen (mit KI_LEAD_DIR).`);
      process.exit(1);
    }
    console.log(`${dateien.size} überführte Meldungen entsprechen dem Stand.`);
  } else {
    for (const f of readdirSync(join(WURZEL, ZIEL), { withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith(".json"))) rmSync(join(WURZEL, ZIEL, f.name));
    for (const [p, t] of dateien) {
      mkdirSync(join(WURZEL, ZIEL), { recursive: true });
      writeFileSync(join(WURZEL, p), t);
    }
    console.log(`${dateien.size} Meldungen überführt (${ZIEL}).`);
  }
}
