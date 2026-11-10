// Betreiberformular KRITIS-LEAD: erfasst eine Betreibermeldung nach LEAD-Meldung-v2 mit den Modulen lead-kritis-meldung
// und lead-kritis-betrieb (formate/lead-kritis-v2/), prüft sie mit demselben Schema und denselben Plausibilitätsregeln
// wie das Prüfwerkzeug (npm run pruefen:v2) und gibt sie als JSON-Datei aus. Kein Server, keine Netzverbindung; ein
// Entwurf bleibt im Browser dieses Geräts. Gebaut von werkzeuge/bauen/formular-bauen.mjs. Seit 0.4 (Umstellung auf v2):
// Quellen, Zeitstrahl, Maßnahmen und Zahlen als Listen von Objekten, Zeiten mit UTC-Versatz, Kennung KRITIS-<Kürzel>-….
import validate from "virtual:validator";
import { pruefePlausibilitaet } from "../../werkzeuge/pruefen/v2/plausibilitaet.mjs";

const D = window.KRITIS_DATEN;
const S = D.schema;
const DEFS = S.$defs;
// Neuer Schlüssel seit 0.4: Entwürfe nach v0.2 bleiben unberührt und werden nicht als v2 gelesen
const SPEICHER = "kritis-lead-betreiberformular-entwurf-v2";
const KOPF = "lead-kritis-meldung";
const BETRIEB = "lead-kritis-betrieb";

// ── Werte aus dem Schema ─────────────────────────────
const kopfP = DEFS.modul_lead_kritis_meldung.properties;
const betriebP = DEFS.modul_lead_kritis_betrieb.properties;
const E = {
  meldeart: kopfP.meldeart.enum,
  meldeanlass: kopfP.meldeanlass.items.enum,
  gemeldetStatus: kopfP.gemeldet_an.items.properties.status.enum,
  sektor: betriebP.sektor.enum,
  traegerschaft: betriebP.betreiber.properties.traegerschaft.enum,
  leistungsgrad: betriebP.ist.properties.leistungsgrad.enum,
  eskalation: betriebP.ist.properties.eskalationsstufe_betrieblich.enum,
  ersatzStatus: betriebP.ersatzverfahren.items.properties.status.enum,
  prognoseStatus: betriebP.prognose.properties.status.enum,
  unsicherheit: betriebP.prognose.properties.unsicherheit.enum,
  richtung: betriebP.abhaengigkeiten.items.properties.richtung.enum,
  zustand: betriebP.abhaengigkeiten.items.properties.zustand.enum,
  bedarfStatus: betriebP.unterstuetzungsbedarf.items.properties.status.enum,
  ursacheStatus: betriebP.ursache.properties.status.enum,
  bestaetigung: betriebP.bestaetigungsgrad.enum,
  massnahmeStatus: DEFS.massnahme.properties.status.enum,
  zugang: DEFS.quelle.properties.zugang.enum.filter((x) => x !== null),
  kategorie: DEFS.quelle.properties.kategorie.enum,
  genauigkeit: DEFS.eintritt.properties.genauigkeit.enum,
};
const ANZEIGE = {
  eingeschraenkt: "eingeschränkt", notbetrieb: "Notbetrieb", ausgefallen: "ausgefallen", voll: "voll", unbekannt: "unbekannt",
  gezaehlt: "gezählt", geschaetzt: "geschätzt", nicht_zutreffend: "nicht zutreffend", nicht_vorhanden: "nicht vorhanden",
  amtlich_gemeldet: "amtlich gemeldet", hochgerechnet: "hochgerechnet", prognostiziert: "prognostiziert",
  prognose: "Prognose", keine_prognose_moeglich: "keine Prognose möglich", zielzustand_erreicht: "Zielzustand erreicht",
  nicht_erforderlich: "nicht erforderlich", verfuegbar: "verfügbar", beeintraechtigt: "beeinträchtigt", "": "keine Angabe",
  ungefaehr: "ungefähr", oeffentlich: "öffentlich", behoerdenintern: "behördenintern", betriebsintern: "betriebsintern", eingangsmaterial: "Eingangsmaterial",
  eingangsmeldung: "Eingangsmeldung", nicht_ausgewertet: "nicht ausgewertet", paywall: "Paywall",
};
const zeige = (w) => ANZEIGE[w] ?? w;
const KATEGORIE_TEXT = { A: "A – amtlich", B: "B – Betreiber, auch eigene Angaben", W: "W – wissenschaftlich", M: "M – Medien", P: "P – sonstige private Quellen" };
const ISO = {
  "Schleswig-Holstein": "DE-SH", Hamburg: "DE-HH", Niedersachsen: "DE-NI", Bremen: "DE-HB", "Nordrhein-Westfalen": "DE-NW", Hessen: "DE-HE",
  "Rheinland-Pfalz": "DE-RP", "Baden-Württemberg": "DE-BW", Bayern: "DE-BY", Saarland: "DE-SL", Berlin: "DE-BE", Brandenburg: "DE-BB",
  "Mecklenburg-Vorpommern": "DE-MV", Sachsen: "DE-SN", "Sachsen-Anhalt": "DE-ST", "Thüringen": "DE-TH",
};
const LAND_NAMEN = Object.keys(ISO).sort((a, b) => a.localeCompare(b, "de"));

// ── Regionalschlüssel ────────────────────────────────
// Namen zum ARS (seit 0.3.4, KL-UX-29): Länder hier, Kreise aus dem Kreisverzeichnis des Statistischen Bundesamts,
// für Thüringen Gemeindeverbände und Gemeinden aus dem Verzeichnis des Thüringer Landesamts für Statistik; beides bettet
// formular-bauen.mjs ein. Ein unbekannter Schlüssel ist kein Fehler; das Formular nennt dann keinen oder einen
// allgemeinen Namen.
const LAENDER = {
  "01": "Schleswig-Holstein", "02": "Hamburg", "03": "Niedersachsen", "04": "Bremen", "05": "Nordrhein-Westfalen", "06": "Hessen",
  "07": "Rheinland-Pfalz", "08": "Baden-Württemberg", "09": "Bayern", 10: "Saarland", 11: "Berlin", 12: "Brandenburg",
  13: "Mecklenburg-Vorpommern", 14: "Sachsen", 15: "Sachsen-Anhalt", 16: "Thüringen",
};
/** Teile zum ARS: { ort, kreis, land }; `ort` nur bei Gemeindeverband und Gemeinde, sofern bekannt. Null, wenn unbekannt. */
function arsTeile(ars) {
  const a = String(ars || "").trim();
  if (!/^\d+$/.test(a) || ![2, 3, 5, 9, 12].includes(a.length)) return null;
  const land = LAENDER[a.slice(0, 2)];
  if (!land) return null;
  if (a.length < 5) return { ort: a.length === 3 ? "Regierungsbezirk" : "", kreis: "", land };
  const kreis = D.kreise?.[a.slice(0, 5)];
  if (!kreis) return null;
  return { ort: a.length > 5 ? D.orte?.[a] || "" : "", kreis, land, stellen: a.length };
}
/** „16072“ → „Landkreis Sonneberg (Thüringen)“, „160725051013“ → „Neuhaus am Rennweg, Stadt · Landkreis Sonneberg (Thüringen)“. */
function arsName(ars) {
  const t = arsTeile(ars);
  if (!t) return "";
  if (!t.kreis) return t.ort ? `${t.ort} in ${t.land}` : t.land;
  if (t.stellen === 5) return `${t.kreis} (${t.land})`;
  const ort = t.ort || (t.stellen === 9 ? "Gemeindeverband" : "Gemeinde");
  return t.ort ? `${ort} · ${t.kreis} (${t.land})` : `${ort} in ${t.kreis} (${t.land})`;
}// ── Beschriftungen aus der Darstellungsdatei des Profils ─────
// Das Formular nimmt Beschriftungen, Hinweise und Platzhalter aus meldung.ui.json, damit Betreiber dieselben Begriffe
// sehen wie die Behörde im Lagebild von KI-LEAD. Eigene Texte nur dort, wo das Formular Betreiber führt.
const UI = D.ui || {};
/** "sachverhalte.0.betrieb.raum.ars.1" → "sachverhalte[].betrieb.raum.ars[]" */
const uiSchluessel = (pfad) => teile(pfad).reduce((a, k) => (typeof k === "number" ? `${a}[]` : a ? `${a}.${k}` : k), "");
function uiEintrag(pfad) {
  const k = uiSchluessel(pfad);
  if (UI[k]) return UI[k];
  const t = k.split(".");
  for (const [muster, v] of Object.entries(UI)) {
    if (!muster.includes("*")) continue;
    const mt = muster.split(".");
    if (mt.length === t.length && mt.every((x, i) => x === "*" || x === t[i])) return v;
  }
  return {};
}
/** Optionen eines Felds um Beschriftung, Hinweis und Platzhalter aus der Darstellungsdatei ergänzen. */
function beschriftet(pfad, label, opt = {}) {
  const u = uiEintrag(pfad);
  return [opt.eigen ? label : (u.label ?? label), { ...opt, hinweis: opt.hinweis ?? u.hinweis, platzhalter: opt.platzhalter ?? u.platzhalter }];
}
// ── Schema-Hilfen ────────────────────────────────────
const aufloesen = (k) => {
  while (k?.$ref) k = DEFS[k.$ref.split("/").pop()];
  return k || {};
};
/** Schlüssel des Sektorblocks unter sektor_angaben: der Block, dessen Beschriftung im Sektornamen vorkommt („Telekommunikation“ in „Informationstechnik und Telekommunikation“). */
function sektorSchluessel(sektor) {
  if (!sektor) return null;
  // Blöcke aus Schema und Darstellungsdatei: Gesundheit hat Zahlen (Kennzahlen), aber keine qualitativen Angaben
  const praefix = `sachverhalte[].module.${BETRIEB}.sektor_angaben.`;
  const ausUi = Object.keys(UI).filter((p) => p.startsWith(praefix) && !p.slice(praefix.length).includes(".")).map((p) => p.slice(praefix.length));
  for (const k of new Set([...Object.keys(betriebP.sektor_angaben.properties), ...ausUi])) {
    const l = UI[`${praefix}${k}`]?.label;
    if (l && sektor.includes(l)) return k;
  }
  return null;
}
// Zahlen je Rolle: Beschriftung, Einheit, Art der Kennzahl und Sektor (ohne Sektor: für alle)
const ROLLEN = {
  betroffene_anschluesse: { einheit: "Anschlüsse", art: "bestand", gegenstand: "Anschlüsse ohne Versorgung" },
  betroffene_personen: { einheit: "Personen", art: "bestand", gegenstand: "Personen ohne Versorgung" },
  wiederversorgte_anschluesse: { einheit: "Anschlüsse", art: "kumuliert", gegenstand: "Netzanschlüsse wieder versorgt", sektor: "energie" },
  standorte_ausgefallen: { einheit: "Standorte", art: "bestand", gegenstand: "Standorte ausgefallen", sektor: "telekommunikation" },
  standorte_netzersatz: { einheit: "Standorte", art: "bestand", gegenstand: "Standorte mit Netzersatz", sektor: "telekommunikation" },
  betreibbare_betten: { einheit: "Betten", art: "kapazitaet", gegenstand: "betreibbare Betten", sektor: "gesundheit" },
  verlegungsbedarf: { einheit: "Personen", art: "bedarf", gegenstand: "Verlegungsbedarf", sektor: "gesundheit" },
};

// ── Zeit ─────────────────────────────────────────────
// Zeiten stehen in der Meldung mit UTC-Versatz der Zeitzone der Meldung (LEAD-Meldung-v2, Abschnitt 1 Nr. 4); die
// Eingabefelder zeigen Datum und Uhrzeit in dieser Zone. Umrechnung wie in KI-LEAD (src/kern/meldung-v2.js, mitVersatz).
const zwei = (n) => String(n).padStart(2, "0");
function versatzMinuten(ms, zone) {
  const teil = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" }).formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName")?.value;
  const x = /GMT([+-])(\d{2}):(\d{2})/.exec(teil || "");
  return x ? (x[1] === "+" ? 1 : -1) * (Number(x[2]) * 60 + Number(x[3])) : 0;
}
/** „2026-10-14T06:30“ in der Zone → „2026-10-14T06:30+02:00“ */
function mitVersatz(lokal, zone = m?.zeitzone || "Europe/Berlin") {
  const x = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(lokal || "");
  if (!x) return null;
  const wand = Date.UTC(+x[1], +x[2] - 1, +x[3], +x[4], +x[5]);
  let utc = wand;
  for (let i = 0; i < 4; i++) {
    const neu = wand - versatzMinuten(utc, zone) * 60000;
    if (neu === utc) break;
    utc = neu;
  }
  const v = versatzMinuten(utc, zone);
  const a = Math.abs(v);
  return `${lokal}${v < 0 ? "-" : "+"}${zwei(Math.floor(a / 60))}:${zwei(a % 60)}`;
}
const lokal = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v) ? v.slice(0, 16) : "");
const jetztLokal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}T${zwei(d.getHours())}:${zwei(d.getMinutes())}`;
};
const jetzt = () => mitVersatz(jetztLokal());
const heute = () => jetztLokal().slice(0, 10);

/** UUID Version 7 (zeitlich sortierbar), wie LEAD-Meldung-v2 empfiehlt. */
function uuid() {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let t = Date.now();
  for (let i = 5; i >= 0; i--) {
    b[i] = t % 256;
    t = Math.floor(t / 256);
  }
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
// Kennung des Betreiber-Sachverhalts: KRITIS-<Kürzel>-JJJJMMTT-<Zufall>, Zufall nach Crockford-Base32 mit 6 Zeichen
// (Kodierleitfaden, Anhang K; AUSTAUSCH.md Abschnitt 9 in KI-LEAD); das Datum ist das Anlagedatum. Das Kürzel wählt der Betreiber einmal.
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const KUERZEL = new RegExp(D.kennung?.kuerzel || "^[A-Z0-9]{1,8}(-[A-Z0-9]{1,8}){0,2}$");
const KENNUNG = /^KRITIS-([A-Z0-9-]+)-(\d{8})-([0-9A-HJKMNP-TV-Z]{4,8})$/;
const kuerzelVon = (k) => KENNUNG.exec(k || "")?.[1] || "";
function neueKennung(kuerzel, datum) {
  const tag = String(datum || heute()).slice(0, 10).replaceAll("-", "");
  const z = crypto.getRandomValues(new Uint8Array(6));
  return `KRITIS-${kuerzel}-${tag}-${[...z].map((x) => CROCKFORD[x % 32]).join("")}`;
}
// Eingegebenes, noch ungültiges Kürzel (die Kennung bleibt dann leer)
let kuerzelEntwurf = "";

function neuerSachverhalt() {
  return {
    kennung: "",
    bezeichnung: "",
    eintritt: { zeit: null, genauigkeit: "unbekannt" },
    raum: { beschreibung: "", gebiete: [] },
    analyse: { lage_ereignis: "", risiken_auswirkungen: "", abhaengigkeiten_interdependenzen: "" },
    handlungsbedarf: { massnahmen: [], empfehlungen: [], fristen: [] },
    kennzahlen: [],
    zeitstrahl: [],
    module: {
      [BETRIEB]: {
        fassung: betriebP.fassung.const,
        betreiber: { name: "" },
        kritische_dienstleistung: "",
        ist: {},
        kennzahlen: { betroffene_anschluesse: null, betroffene_personen: null },
        ersatzverfahren: [],
        prognose: { status: "keine_prognose_moeglich" },
        unterstuetzungsbedarf: [],
        bestaetigungsgrad: "vorläufige Eigenangabe",
      },
    },
  };
}

function neueMeldung() {
  return {
    schema: S.properties.schema.const,
    fassung: D.fassung,
    meldung_id: uuid(),
    status: "zur_freigabe",
    absender: { stelle: "", ebene: "Betreiber", gebiet: { name: "" } },
    meldezeitpunkt: jetzt(),
    zeitzone: "Europe/Berlin",
    meldezeitraum: { von: null, bis: null },
    module: {
      [KOPF]: {
        fassung: kopfP.fassung.const,
        meldeart: "Erstmeldung",
        meldeanlass: [],
        datenart: "synthetisch",
        vertraulichkeit: { tlp: "CLEAR", hinweis: "Fiktive Übungsdaten" },
        empfaenger: [],
        gemeldet_an: [],
        rechtsgrundlage_dieser_meldung: "Fiktive Übung; keine Aussage über reale gesetzliche Pflichten",
      },
    },
    quellen: [],
    sachverhalte: [neuerSachverhalt()],
    freigabe: { erfasst: { name: "", zeitpunkt: heute() } },
    entstehung: { verfahren: "manuell", werkzeug: { name: "KRITIS-LEAD, Betreiberformular", version: D.version } },
  };
}
// ── Zustand ──────────────────────────────────────────
let m;
let schritt = "meldung";
let hinweisText = "";
// Seit 0.3.1 (KL-UX-02, wie KI-LEAD UX-2026-W44-05): Fehlende Pflichtangaben zeigt das Formular erst, wenn das Feld
// bearbeitet und verlassen wurde, nach dem Besuch von Schritt 6 oder bei einer geladenen Meldung; andere Befunde sofort.
let alleZeigen = false;
const bearbeitet = new Set();
// Seit 0.3.1 (KL-UX-04, wie KI-LEAD UX-2026-W44-08): Listenelemente einklappbar. Eine geladene Meldung zeigt Listen mit
// mehreren Einträgen eingeklappt; ein neuer Eintrag ist offen; ein Sprung aus Schritt 6 öffnet das Element.
let geladen = false;
const zu = new Map();
// Lange Hinweise: aufgeklappte (KL-UX-12)
const offeneHinweise = new Set();
// Erklärung „gezählt / geschätzt / …“ nur an der ersten Zahl eines Schritts (KL-UX-08)
let statusErklaert = false;
// Seit 0.3.4: Entwurf noch unberührt (neu begonnen, nichts eingegeben)? Dann lädt „Beispiel laden“ ohne Rückfrage
// (KL-UX-15), und der Seitenkopf zeigt die Einführung (KL-UX-30).
let unberuehrt = true;
// Zuletzt entfernter Listeneintrag zum Wiederherstellen (KL-UX-16): { z, text, wiederherstellen }
let rueckgaengig = null;
// Besuchte Schritte: Ein besuchter Schritt ohne offene Angabe trägt in der Schrittleiste einen Haken (KL-UX-29)
const besucht = new Set();
// Nach „Meldung ausgeben“: Dateiname, bis zur nächsten Änderung (KL-UX-20)
let ausgegeben = "";
// BCM-Angaben eingeklappt? null = Standard: bei geladener Meldung eingeklappt (KL-UX-26)
let bcmZu = null;
try {
  const t = localStorage.getItem(SPEICHER);
  const gespeichert = t ? JSON.parse(t) : null;
  // nur ein Entwurf nach LEAD-Meldung-v2 aus diesem Formular
  const passt = gespeichert?.schema === S.properties.schema.const && gespeichert?.module?.[KOPF] && gespeichert?.sachverhalte?.[0]?.module?.[BETRIEB];
  m = passt ? gespeichert : neueMeldung();
  alleZeigen = geladen = !!passt;
  unberuehrt = !passt;
} catch {
  m = neueMeldung();
}
/** Neue oder geladene Meldung: Sichtbarkeit der Befunde und eingeklappte Elemente zurücksetzen. */
function frisch(istGeladen) {
  alleZeigen = geladen = istGeladen;
  unberuehrt = !istGeladen;
  bearbeitet.clear();
  zu.clear();
  besucht.clear();
  rueckgaengig = null;
  ausgegeben = "";
  bcmZu = null;
  kuerzelEntwurf = "";
}
function speichere() {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(m));
  } catch {
    /* Speicher nicht verfügbar: Entwurf nur bis zum Schließen */
  }
}

const teile = (pfad) => (Array.isArray(pfad) ? pfad : String(pfad).split(".")).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
function hole(pfad, obj = m) {
  let o = obj;
  for (const k of teile(pfad)) {
    if (o == null) return undefined;
    o = o[k];
  }
  return o;
}
function setze(pfad, wert, obj = m) {
  const t = teile(pfad);
  let o = obj;
  t.slice(0, -1).forEach((k, i) => {
    if (o[k] == null) o[k] = typeof t[i + 1] === "number" ? [] : {};
    o = o[k];
  });
  if (wert === undefined) delete o[t.at(-1)];
  else o[t.at(-1)] = wert;
}
const SV = "sachverhalte.0";
const B = `${SV}.module.${BETRIEB}`;
const K = `module.${KOPF}`;
const betrieb = () => m.sachverhalte[0].module[BETRIEB];
const kopf = () => m.module[KOPF];

/** Leere optionale Texte entfernen: Das Schema kennt für „nicht angegeben“ kein "" (Feld fehlt, LEAD-Meldung-v2 Grundsatz 3). */
function bereinige(o, pfad) {
  if (Array.isArray(o)) return o.forEach((x, i) => bereinige(x, `${pfad}.${i}`));
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    const p = pfad ? `${pfad}.${k}` : k;
    if (v === "" && !schemaInfo(p).pflicht) delete o[k];
    else bereinige(v, p);
  }
}

/** Abgeleitete Werte vor Prüfung und Ausgabe. */
function ableiten() {
  const sv = m.sachverhalte[0];
  const b = sv.module[BETRIEB];
  const k = m.module[KOPF];
  m.absender.ebene = "Betreiber";
  if (m.absender.gebiet?.name && ISO[m.absender.gebiet.name]) m.absender.gebiet.schluessel = ISO[m.absender.gebiet.name];
  if (!textWert(b.betreiber.name)) b.betreiber.name = m.absender.stelle;
  // Beziehungen nach Meldeart (Rollenregel R3): Erstmeldung ohne, Korrektur berichtigt, sonst Fortschreibung
  if (k.meldeart === "Erstmeldung") delete m.beziehungen;
  else if (m.beziehungen?.length) for (const r of m.beziehungen) r.art = k.meldeart === "Korrekturmeldung" ? "berichtigung_von" : "fortschreibung_von";
  // Eintritt: ohne Zeit unbekannt, mit Zeit mindestens ungefähr
  if (!sv.eintritt?.zeit) sv.eintritt = { zeit: null, genauigkeit: "unbekannt" };
  else if (sv.eintritt.genauigkeit === "unbekannt") sv.eintritt.genauigkeit = "belegt";
  // Datenstände ohne eigene Angabe: Datenstand des Istzustands
  const ist = b.ist?.stand;
  if (ist) {
    for (const z of sv.kennzahlen) if (!z.datenstand) z.datenstand = ist;
  }
  for (const z of sv.kennzahlen) if (z.bandbreite && !Object.keys(z.bandbreite).length) delete z.bandbreite;
  if (ist) {
    if (b.prognose && !b.prognose.stand) b.prognose.stand = ist;
    for (const e of b.ersatzverfahren || []) if (!e.stand) e.stand = ist;
  }
  // Zahlen und Sektorangaben nur für den gewählten Sektor
  const sa = sektorSchluessel(b.sektor);
  for (const [rolle, r] of Object.entries(ROLLEN))
    if (r.sektor && r.sektor !== sa && rolle in (b.kennzahlen || {})) entferneRolle(rolle);
  if (b.sektor_angaben) {
    for (const s of Object.keys(b.sektor_angaben)) {
      const block = b.sektor_angaben[s];
      if (s !== sa) delete b.sektor_angaben[s];
      else for (const [f, v] of Object.entries(block || {})) if (v === "" || v == null) delete block[f];
      if (b.sektor_angaben[s] && !Object.keys(b.sektor_angaben[s]).length) delete b.sektor_angaben[s];
    }
    if (!Object.keys(b.sektor_angaben).length) delete b.sektor_angaben;
  }
  if (b.kennzahlen_hinweise) {
    for (const [r, t] of Object.entries(b.kennzahlen_hinweise)) if (!textWert(t) || !(r in b.kennzahlen)) delete b.kennzahlen_hinweise[r];
    if (!Object.keys(b.kennzahlen_hinweise).length) delete b.kennzahlen_hinweise;
  }
  // Zeitstrahl: neue Zeilen gelten als erstmals mit dieser Meldung gemeldet
  for (const z of sv.zeitstrahl || []) if (!z.erstmals_gemeldet) z.erstmals_gemeldet = m.meldezeitpunkt || null;
  // Status nach Zeichnung: freigegeben mit Name und Zeitpunkt der Freigabe, sonst zur Freigabe
  const f = m.freigabe.freigegeben;
  if (f && !textWert(f.name) && !f.zeitpunkt) delete m.freigabe.freigegeben;
  m.status = m.freigabe.freigegeben ? "freigegeben" : "zur_freigabe";
  m.entstehung = { ...m.entstehung, verfahren: "manuell", werkzeug: { name: "KRITIS-LEAD, Betreiberformular", version: D.version } };
  bereinige(m, "");
}

// ── Prüfung ──────────────────────────────────────────
const register = new Map(); // Pfad "/a/b/0" → { schritt, id, label, kontext }
const zeiger = (pfad) => "/" + teile(pfad).join("/");
const ausZeiger = (z) => z.split("/").filter(Boolean).join(".");
/** Einheitlicher Text eines fehlenden Werts, wie in KI-LEAD (KL-UX-02) */
const FEHLT = "Pflichtangabe fehlt.";
const leerWert = (v) => v == null || v === "" || (Array.isArray(v) && v.length === 0);
// Felder, die das Formular aus anderen Angaben ableitet: Der Befund steht bei dem Feld, das die Person ausfüllt (KL-UX-05)
const BETREIBERNAME = `/sachverhalte/0/module/${BETRIEB}/betreiber/name`;
const ABGELEITET = { [BETREIBERNAME]: "/absender/stelle", "/absender/gebiet/schluessel": "/absender/gebiet/name", "/sachverhalte/0/eintritt": "/sachverhalte/0/eintritt/zeit", "/sachverhalte/0/eintritt/genauigkeit": "/sachverhalte/0/eintritt/zeit" };
// Datenstände, die leer den Datenstand des Istzustands übernehmen: Fehlt dieser, steht der Befund nur dort (KL-UX-14)
const IST_STAND = `/sachverhalte/0/module/${BETRIEB}/ist/stand`;
const STAND_VOM_IST = new RegExp(`^/sachverhalte/0/(kennzahlen/\\d+/datenstand|module/${BETRIEB}/(prognose|ersatzverfahren/\\d+)/stand)$`);
const befundZiel = (roh, fehlt) => ABGELEITET[roh] ?? (fehlt && STAND_VOM_IST.test(roh) && !betrieb()?.ist?.stand ? IST_STAND : roh);
// Beschriftungen für Felder, die nicht in einem Schritt mit Register stehen
const BESCHRIFTUNG = { "/meldung_id": "Meldungs-ID", [`/module/${KOPF}/vertraulichkeit/tlp`]: "TLP", [`/module/${KOPF}/datenart`]: "Datenart", "/status": "Status", "/entstehung": "Entstehung" };

function text(e) {
  const p = e.params || {};
  const muster = String(p.pattern || "");
  switch (e.keyword) {
    case "required":
      return FEHLT;
    case "minLength":
      return "darf nicht leer sein";
    case "pattern":
      if (muster === "\\S") return "darf nicht leer sein";
      if (muster.includes("KRITIS-")) return "Kürzel des Betreibers fehlt oder hat nicht die vorgesehene Form (1 bis 3 Teile aus A–Z und 0–9, je höchstens 8 Zeichen)";
      if (muster.includes("T([01]")) return "Datum und Uhrzeit fehlen oder haben nicht die vorgesehene Form";
      if (muster.includes("[0-9a-f]{8}")) return "ID hat nicht die Form einer UUID";
      if (muster.includes("[0-9]{2,12}")) return "Regionalschlüssel mit 2 bis 12 Ziffern";
      if (muster.startsWith("^K[")) return "Verweis auf eine Kennzahl (K1, K2 …)";
      if (muster.startsWith("^Q[")) return "Verweis auf eine Quelle (Q1, Q2 …)";
      return "Form stimmt nicht";
    case "enum":
      return "bitte einen der vorgesehenen Werte wählen";
    case "const":
      return `muss „${p.allowedValue}“ sein`;
    case "type":
      return String(p.type).includes("number") ? "Zahl erwartet" : String(p.type) === "null" ? "muss leer bleiben" : "falscher Datentyp";
    case "minimum":
    case "maximum":
      return "Wert außerhalb des zulässigen Bereichs";
    case "minItems":
      return "mindestens ein Eintrag";
    case "additionalProperties":
      return `nicht vorgesehene Angabe „${p.additionalProperty}“`;
    case "not":
      return "Angabe hier nicht zulässig";
    default:
      return e.message;
  }
}

function schrittFuer(z) {
  if (/^\/(meldung_id|status|entstehung|freigabe)/.test(z) || new RegExp(`^/module/${KOPF}/(vertraulichkeit|datenart)`).test(z)) return "pruefen";
  if (/^\/quellen/.test(z) || /^\/sachverhalte\/\d+\/zeitstrahl/.test(z)) return "quellen";
  if (new RegExp(`^/sachverhalte/\\d+/module/${BETRIEB}/(ersatzverfahren|prognose|abhaengigkeiten|unterstuetzungsbedarf|bcm|ursache)`).test(z) || /^\/sachverhalte\/\d+\/handlungsbedarf/.test(z)) return "ersatz";
  if (new RegExp(`^/sachverhalte/\\d+/module/${BETRIEB}/(einschaetzung|folgemeldung_bei|aenderung_zur_vormeldung|abschluss)`).test(z)) return "lage";
  if (z === "/sachverhalte/0/kennung") return "meldung";
  if (new RegExp(`^/sachverhalte/\\d+/(module/${BETRIEB}|raum|eintritt|kennzahlen)`).test(z)) return "dienstleistung";
  if (/^\/sachverhalte/.test(z)) return "lage";
  return "meldung";
}

function pruefe() {
  ableiten();
  const ok = validate(m);
  const befunde = (validate.errors || [])
    // Zweige ohne eigene Aussage: „if“, und die Wahl Sachverhalt oder Fehlanzeige (Betreiber melden keine Fehlanzeige;
    // das fehlende Quellenverzeichnis meldet der andere Zweig)
    .filter((e) => e.keyword !== "if" && !(e.instancePath === "" && (e.keyword === "anyOf" || (e.keyword === "required" && e.params.missingProperty === "fehlanzeige"))))
    .map((e) => {
      const roh = e.keyword === "required" ? `${e.instancePath}/${e.params.missingProperty}` : e.instancePath || "/";
      // Leerer Wert: einheitlich „Pflichtangabe fehlt.“, gleich welche Schemaregel greift
      const fehlt = e.keyword === "required" || (roh !== "/" && leerWert(hole(ausZeiger(roh))));
      return { stufe: "fehler", pfad: befundZiel(roh, fehlt), text: fehlt ? FEHLT : text(e), fehlt };
    });
  // Eigene Prüfungen des Formulars: gezählte oder geschätzte Zahl ohne Wert; ungültiges Kürzel
  m.sachverhalte[0].kennzahlen.forEach((z, i) => {
    if (z.wert == null) befunde.push({ stufe: "fehler", pfad: `/sachverhalte/0/kennzahlen/${i}/wert`, text: FEHLT, fehlt: true });
  });
  if (kuerzelEntwurf && !KUERZEL.test(kuerzelEntwurf)) befunde.push({ stufe: "fehler", pfad: "/sachverhalte/0/kennung", text: text({ keyword: "pattern", params: { pattern: "KRITIS-" } }), fehlt: false });
  // je Feld ein Befund (KL-UX-05, wie KI-LEAD UX-2026-W44-11): der erste, ein fehlender Wert vor anderen Regeln
  const jeFeld = new Map();
  for (const b of befunde) {
    const alt = jeFeld.get(b.pfad);
    if (!alt || (b.fehlt && !alt.fehlt)) jeFeld.set(b.pfad, b);
  }
  const eindeutig = [...jeFeld.values()];
  const plausibel = ok && !eindeutig.length ? pruefePlausibilitaet(m) : [];
  const plausibelZiel = plausibel.map((b) => ({ ...b, pfad: befundZiel(b.pfad, false), text: `${b.text} (${b.regel})` }));
  return { schemaOk: !!ok && !eindeutig.length, befunde: [...eindeutig, ...plausibelZiel] };
}
/** Befund am Feld zeigen? Fehlende Pflichtangaben erst nach Bearbeiten, Prüfschritt oder Laden (KL-UX-02). */
const sichtbar = (b) => !b.fehlt || alleZeigen || bearbeitet.has(b.pfad);
const zielSchritt = (b) => register.get(b.pfad)?.schritt || schrittFuer(b.pfad);
const feldName = (b) => {
  const r = register.get(b.pfad);
  const name = r?.label || BESCHRIFTUNG[b.pfad] || b.pfad;
  return r?.kontext ? `${r.kontext} › ${name}` : name;
};

// ── DOM-Hilfen ───────────────────────────────────────
function el(tag, attrs = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "text") e.textContent = v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kinder.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}
let zaehler = 0;
const neueId = () => `f${++zaehler}`;

function aenderung(neuZeichnen, fokusPraefix) {
  // Jede Änderung beendet das Angebot „rückgängig“ und den Stand „ausgegeben“
  unberuehrt = false;
  ausgegeben = "";
  if (rueckgaengig) {
    rueckgaengig = null;
    // ohne Neuaufbau, damit Fokus und Schreibmarke im Feld bleiben
    document.querySelectorAll(".rueckgaengig").forEach((e) => e.remove());
  }
  document.querySelectorAll(".nach-ausgabe").forEach((e) => e.remove());
  speichere();
  if (neuZeichnen) zeichne({ fokusPraefix });
  else aktualisiereZahlen();
}

/**
 * Hinweis am Feld. Lange Hinweise (seit 0.3.1, KL-UX-12) zeigen den ersten Satz und „mehr“; Bildschirmleser erhalten
 * über aria-describedby immer den ganzen Text.
 */
function hinweisElement(id, text, schluessel, label) {
  const teil = text.length > 120 ? text.match(/^(.{25,}?[.:])\s+(\S[\s\S]*)$/) : null;
  if (!teil || teil[1].length > 120) return el("p", { class: "hinweis", id }, text);
  const offen = offeneHinweise.has(schluessel);
  return el(
    "div",
    { class: "hinweis" },
    el("span", { class: "sr", id }, text),
    el("span", { "aria-hidden": "true" }, offen ? text : teil[1]),
    " ",
    el(
      "button",
      {
        type: "button",
        class: "knopf leise klein hinweis-mehr",
        "aria-expanded": String(offen),
        "aria-label": `${offen ? "weniger" : "mehr"}: Hinweis zu ${label}`,
        "data-fokus": `hinweis:${schluessel}`,
        onclick: () => {
          if (offen) offeneHinweise.delete(schluessel);
          else offeneHinweise.add(schluessel);
          zeichne();
        },
      },
      offen ? "weniger" : "mehr",
    ),
  );
}

/**
 * Rahmen eines Eingabefelds. Seit 0.3.4 (KL-UX-25) steht der Hinweis immer unter der Beschriftung und vor dem Feld,
 * wie bei Gruppen; `klasse` setzt die Breite nach Inhalt (schmal für Zahlen, zeit für Datum und Uhrzeit, KL-UX-24).
 */
function rahmen(pfad, label, eingabe, { hinweis, pflicht, id, labelVersteckt, klasse } = {}) {
  register.set(zeiger(pfad), { schritt, id, label });
  eingabe.dataset.fokus = zeiger(pfad);
  if (hinweis) eingabe.setAttribute("aria-describedby", `${id}-h`);
  if (pflicht) eingabe.setAttribute("aria-required", "true");
  return el(
    "div",
    { class: `feld${klasse ? ` ${klasse}` : ""}`, "data-pfad": zeiger(pfad) },
    el("label", { class: `feld-label${pflicht ? " pflicht" : ""}${labelVersteckt ? " sr" : ""}`, for: id }, label),
    hinweis && hinweisElement(`${id}-h`, hinweis, zeiger(pfad), label),
    eingabe,
  );
}

/** Rahmen für Gruppen von Optionsfeldern und Kontrollkästchen: Legende, Hinweis und Fehler hängen an der Gruppe. */
function gruppenrahmen(pfad, label, inhalt, opt, id) {
  register.set(zeiger(pfad), { schritt, id, label });
  return el(
    "fieldset",
    { class: "feld", "data-pfad": zeiger(pfad), "aria-describedby": opt.hinweis ? `${id}-h` : undefined },
    el("legend", { class: `feld-label${opt.pflicht ? " pflicht" : ""}` }, label),
    opt.hinweis && hinweisElement(`${id}-h`, opt.hinweis, zeiger(pfad), label),
    inhalt,
  );
}

function textfeld(pfad, label, opt = {}) {
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const typ = opt.typ || "text";
  const wert = hole(pfad);
  const attrs = { id, type: typ === "lang" ? undefined : typ, value: wert ?? "", placeholder: opt.platzhalter, readonly: opt.nurLesen, disabled: opt.gesperrt };
  const leseWert = (t) => {
    if (opt.typ === "number") {
      if (t.value !== "") return Number(t.value);
      // leer: null, wenn das Schema „unbekannt“ als null kennt, sonst entfällt die Angabe
      const k = schemaInfo(pfad).knoten;
      return [].concat(k.type || []).includes("null") ? null : undefined;
    }
    return t.value;
  };
  const handler = (ev) => {
    setze(pfad, leseWert(ev.target));
    opt.danach?.(ev.target.value);
    aenderung(opt.neuZeichnen);
  };
  let eingabe;
  if (typ === "lang") {
    eingabe = el("textarea", { id, rows: opt.zeilen || 4, placeholder: opt.platzhalter, readonly: opt.nurLesen, oninput: handler });
    eingabe.value = wert ?? "";
  } else {
    eingabe = el("input", { ...attrs, step: typ === "number" ? (opt.ganzzahl ? "1" : "any") : undefined, [opt.neuZeichnen ? "onchange" : "oninput"]: handler });
    if (typ === "datetime-local" || typ === "date") eingabe.value = wert ?? "";
  }
  const klasse = opt.klasse ?? (typ === "number" ? "schmal" : typ === "datetime-local" || typ === "date" ? "zeit" : undefined);
  return rahmen(pfad, label, eingabe, { ...opt, id, klasse });
}function auswahl(pfad, label, werte, opt = {}) {
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const s = el(
    "select",
    { id, onchange: (ev) => { setze(pfad, ev.target.value === "" && opt.leerAlsFehlend ? undefined : ev.target.value); opt.danach?.(ev.target.value); aenderung(opt.neuZeichnen); } },
    el("option", { value: "" }, opt.leer || "– bitte wählen –"),
    werte.map((w) => el("option", { value: w }, zeige(w))),
  );
  s.value = hole(pfad) ?? "";
  return rahmen(pfad, label, s, { ...opt, id });
}

/** Schemaknoten eines Felds und ob es im übergeordneten Objekt unter `required` steht. */
function schemaInfo(pfad) {
  let k = S;
  let eltern = null;
  for (const seg of teile(pfad)) {
    const a = aufloesen(k);
    if (typeof seg === "number") {
      k = a.items;
      eltern = null;
    } else {
      eltern = a;
      k = a.properties?.[seg];
      if (!k) return { knoten: {}, pflicht: false };
    }
  }
  return { knoten: aufloesen(k), pflicht: !!eltern?.required?.includes(teile(pfad).at(-1)) };
}

/**
 * Optionsfelder. Seit 0.3.2: Ein Feld, das nach dem Schema nicht Pflicht ist, bietet „keine Angabe“ an, damit sich eine
 * Auswahl wieder zurücknehmen lässt (bisher blieb nach der ersten Auswahl immer eine Option gesetzt). Zurückgenommen wird
 * auf "", wenn das Schema den Leerwert kennt, sonst entfällt die Angabe; `opt.keineAngabe` ersetzt das, etwa beim
 * optionalen Messwert, der dann ganz entfällt.
 */
function segmente(pfad, label, werte, opt = {}) {
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const name = neueId();
  const aktuell = hole(pfad);
  const info = schemaInfo(pfad);
  const zuruecknehmen =
    opt.keineAngabe ??
    (!opt.pflicht && !info.pflicht && !werte.includes("") ? () => setze(pfad, info.knoten.enum?.includes("") ? "" : undefined) : null);
  const option = (w, an, wenn) =>
    el(
      "label",
      { class: `segment${an ? " an" : ""}` },
      el("input", { type: "radio", name, value: w, checked: an, "data-fokus": `${zeiger(pfad)}=${w}`, onchange: () => { wenn(); opt.danach?.(w); aenderung(true); } }),
      zeige(w),
    );
  // Viele oder lange Optionen untereinander statt in einer umbrechenden Leiste (seit 0.3.4, KL-UX-22)
  // Breite geschätzt: rund 8,5 px je Zeichen und 30 px Rand je Option; über 700 px bricht die Leiste im Formular um
  const anzahl = werte.length + (zuruecknehmen ? 1 : 0);
  const zeichen = werte.reduce((n, w) => n + String(zeige(w)).length, zuruecknehmen ? zeige("").length : 0);
  const gruppe = el(
    "div",
    { class: `segmente${zeichen * 8.5 + anzahl * 30 > 700 ? " senkrecht" : ""}`, role: "radiogroup", id, "aria-label": label, "aria-required": opt.pflicht ? "true" : undefined },
    zuruecknehmen && option("", aktuell == null || aktuell === "", zuruecknehmen),
    werte.map((w) => option(w, aktuell === w, () => setze(pfad, w))),
  );
  return gruppenrahmen(pfad, label, gruppe, opt, id);
}

function chips(pfad, label, werte, opt = {}) {
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const liste = hole(pfad) || [];
  const box = el(
    "div",
    { class: "mehrfach", id },
    werte.map((w) =>
      el(
        "label",
        { class: `chip${liste.includes(w) ? " an" : ""}` },
        el("input", {
          type: "checkbox",
          value: w,
          checked: liste.includes(w),
          "data-fokus": `${zeiger(pfad)}=${w}`,
          onchange: (ev) => {
            const neu = new Set(hole(pfad) || []);
            if (ev.target.checked) neu.add(w);
            else neu.delete(w);
            setze(pfad, werte.filter((x) => neu.has(x)));
            aenderung(true);
          },
        }),
        w,
      ),
    ),
  );
  return gruppenrahmen(pfad, label, box, opt, id);
}

function gruppe(titel, ...inhalt) {
  return el("fieldset", { class: "gruppe" }, el("legend", {}, titel), ...inhalt);
}
const zeile = (...inhalt) => el("div", { class: "zeile" }, ...inhalt);

/** Eingeklappte Elemente nach dem Entfernen von Element i der Liste z nachführen. */
function zuNachEntfernen(z, i) {
  const alt = [...zu].filter(([k]) => k.startsWith(`${z}/`));
  for (const [k] of alt) zu.delete(k);
  for (const [k, v] of alt) {
    const j = Number(k.slice(z.length + 1));
    if (j !== i) zu.set(`${z}/${j > i ? j - 1 : j}`, v);
  }
}
const istZu = (ez, anzahl) => (zu.has(ez) ? zu.get(ez) : geladen && anzahl > 1);

/**
 * Eintrag entfernen und „Rückgängig“ anbieten (seit 0.3.4, KL-UX-16): bisher war ein Eintrag mit allen Feldern sofort
 * weg. Das Angebot steht unter der Liste, bis zur nächsten Änderung oder zum Schrittwechsel.
 */
function entferneMitRueckgaengig(z, text, entfernen, wiederherstellen) {
  entfernen();
  unberuehrt = false;
  ausgegeben = "";
  rueckgaengig = { z, text, wiederherstellen };
  speichere();
  // Fokus auf „Rückgängig“: gleich wieder herstellbar, und kein zweiter Klick trifft den nächsten Eintrag
  zeichne({ fokusPraefix: `${z}#rueckgaengig` });
  ansage(`${text} Rückgängig mit dem Knopf unter der Liste.`);
}
/** Entfernen aus einer Liste unter `pfad`, Wiederherstellen an derselben Stelle. */
function entferneAusListe(pfad, z, i, name) {
  let weg;
  entferneMitRueckgaengig(
    z,
    `${name} ${i + 1} entfernt.`,
    () => {
      [weg] = hole(pfad).splice(i, 1);
      zuNachEntfernen(z, i);
    },
    () => {
      const l = hole(pfad) || [];
      l.splice(i, 0, weg);
      setze(pfad, l);
      for (const k of [...zu.keys()]) if (k.startsWith(`${z}/`)) zu.delete(k);
      zu.set(`${z}/${i}`, false);
    },
  );
}
function rueckgaengigLeiste(z) {
  if (rueckgaengig?.z !== z) return null;
  return el(
    "p",
    { class: "rueckgaengig" },
    rueckgaengig.text,
    " ",
    el("button", {
      type: "button",
      class: "knopf klein",
      "data-fokus": `${z}#rueckgaengig`,
      onclick: () => {
        const r = rueckgaengig;
        rueckgaengig = null;
        r.wiederherstellen();
        speichere();
        zeichne({ fokusPraefix: `${z}#neu` });
        ansage(`${r.text.replace(/ entfernt\.$/, "")} wiederhergestellt.`);
      },
    }, "Rückgängig"),
  );
}const textWert = (v) => (v == null ? "" : String(v).trim());
/** „2026-10-16T10:00“ → „16.10., 10:00“ */
const zeitKurz = (t) => (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t || "") ? `${t.slice(8, 10)}.${t.slice(5, 7)}., ${t.slice(11, 16)}` : textWert(t));

/**
 * Liste wiederholter Blöcke. Seit 0.3.1 (KL-UX-04, wie KI-LEAD UX-2026-W44-07/08) mit Kopfzeile aus den wichtigsten
 * Angaben (`opt.kurz`) und der Zahl der Felder mit Befund; einklappbar. Eingeklappt bleiben die Felder im Dokument
 * (verborgen), damit Befunde ihre Bezeichnung behalten.
 */
function liste(pfad, titel, neu, felder, opt = {}) {
  const u = uiEintrag(pfad);
  titel = u.label ?? titel;
  opt = { ...opt, element: u.element_label ?? opt.element, hinzufuegen: u.hinzufuegen ?? opt.hinzufuegen, hinweis: opt.hinweis ?? u.hinweis };
  const eintraege = hole(pfad) || [];
  const z = zeiger(pfad);
  const name = opt.element || "Eintrag";
  const kurz = opt.kurz || ((e) => Object.values(e || {}).filter((v) => typeof v === "string").slice(0, 2));
  register.set(z, { schritt, id: undefined, label: titel });
  return gruppe(
    titel,
    opt.hinweis && el("p", { class: "hinweis" }, opt.hinweis),
    el(
      "div",
      { class: "liste" },
      eintraege.map((e, i) => {
        const ez = `${z}/${i}`;
        const geschlossen = istZu(ez, eintraege.length);
        const inhaltId = `inhalt${ez.replace(/\W/g, "-")}`;
        const stand = kurz(e).map(textWert).filter(Boolean).join(" · ");
        return el(
          "div",
          { class: `element${geschlossen ? " zu" : ""}`, "data-element": ez, "data-titel": `${name} ${i + 1}` },
          el(
            "div",
            { class: "element-kopf" },
            el("span", { class: "element-titel" }, `${name} ${i + 1}`, stand && el("span", { class: "element-stand" }, ` · ${stand}`), el("span", { class: "element-befund", "data-element-befund": ez })),
            el(
              "span",
              { class: "element-knoepfe" },
              el("button", { type: "button", class: "knopf leise klein", "aria-expanded": String(!geschlossen), "aria-controls": inhaltId, "aria-label": `${name} ${i + 1} ${geschlossen ? "aufklappen" : "einklappen"}`, "data-fokus": `${z}#umschalten${i}`, onclick: () => { zu.set(ez, !geschlossen); zeichne(); } }, geschlossen ? "aufklappen" : "einklappen"),
              el("button", { type: "button", class: "knopf leise klein", "data-fokus": `${z}#entfernen${i}`, "aria-label": `${name} ${i + 1} entfernen`, onclick: () => entferneAusListe(pfad, z, i, name) }, "entfernen"),
            ),
          ),
          el("div", { id: inhaltId, class: "element-inhalt", hidden: geschlossen }, felder(`${pfad}.${i}`)),
        );
      }),
    ),
    rueckgaengigLeiste(z),
    el("button", { type: "button", class: "knopf klein", "data-fokus": `${z}#neu`, onclick: () => { setze(pfad, [...(hole(pfad) || []), neu()]); const n = hole(pfad).length - 1; zu.set(`${z}/${n}`, false); aenderung(true, `${z}/${n}`); } }, opt.hinzufuegen || "hinzufügen"),
    opt.extra?.(),
  );
}

/**
 * Liste einzelner Texte (Empfänger, Regionalschlüssel, Einrichtungen, Bezug). Seit 0.3.1 (KL-UX-04) je Eintrag eine
 * Zeile aus Eingabefeld und „entfernen“, ohne eigenen Rahmen und Kopf.
 */
function textliste(pfad, titel, opt = {}) {
  const u = uiEintrag(pfad);
  titel = u.label ?? titel;
  const hinweis = opt.hinweis ?? u.hinweis;
  const eintraege = hole(pfad) || [];
  const z = zeiger(pfad);
  const name = opt.element || "Eintrag";
  register.set(z, { schritt, id: undefined, label: titel });
  return el(
    "fieldset",
    { class: "feld textliste", "data-pfad": z },
    el("legend", { class: "feld-label" }, titel),
    hinweis && el("p", { class: "hinweis" }, hinweis),
    eintraege.map((_, i) => {
      // Zusatz unter dem Feld, etwa der Name zum Regionalschlüssel (KL-UX-29); aktualisiert beim Tippen
      const zid = opt.zusatz ? neueId() : null;
      const feld = textfeld(`${pfad}.${i}`, `${opt.label || name} ${i + 1}`, {
        eigen: true,
        platzhalter: opt.platzhalter,
        hinweis: "",
        labelVersteckt: true,
        klasse: opt.klasse,
        danach: zid ? (v) => { const z2 = document.getElementById(zid); if (z2) z2.textContent = opt.zusatz(v); } : undefined,
      });
      if (zid) {
        const eingabe = feld.querySelector("input");
        eingabe.setAttribute("aria-describedby", zid);
        feld.append(el("p", { class: "hinweis", id: zid, "aria-live": "polite" }, opt.zusatz(hole(`${pfad}.${i}`))));
      }
      return el(
        "div",
        { class: "textliste-zeile" },
        feld,
        el("button", { type: "button", class: "knopf leise klein", "data-fokus": `${z}#entfernen${i}`, "aria-label": `${name} ${i + 1} entfernen`, onclick: () => entferneAusListe(pfad, z, i, name) }, "entfernen"),
      );
    }),
    rueckgaengigLeiste(z),
    el("button", { type: "button", class: "knopf klein", "data-fokus": `${z}#neu`, onclick: () => { setze(pfad, [...(hole(pfad) || []), ""]); aenderung(true, `${z}/${hole(pfad).length - 1}`); } }, opt.hinzufuegen || "hinzufügen"),
  );
}
/**
 * Datum und Uhrzeit: Eingabe in der Zeitzone der Meldung, gespeichert mit UTC-Versatz. Ein leeres Feld entfällt oder
 * steht auf null, wenn das Schema den Wert verlangt und null zulässt (etwa „Reichweite bis“ unbekannt).
 */
function zeitfeld(pfad, label, opt = {}) {
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const info = schemaInfo(pfad);
  const nullbar = [].concat(info.knoten.anyOf || []).some((a) => a.type === "null");
  const eingabe = el("input", {
    id,
    type: "datetime-local",
    onchange: (ev) => {
      const v = ev.target.value;
      setze(pfad, v ? mitVersatz(v) : info.pflicht && nullbar ? null : undefined);
      opt.danach?.(v);
      aenderung(opt.neuZeichnen);
    },
  });
  eingabe.value = lokal(hole(pfad));
  return rahmen(pfad, label, eingabe, { ...opt, id, klasse: "zeit" });
}
/** Kalendertag (JJJJ-MM-TT), leer = null, wenn das Schema den Wert verlangt, sonst entfällt er. */
function datumfeld(pfad, label, opt = {}) {
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const info = schemaInfo(pfad);
  const eingabe = el("input", { id, type: "date", onchange: (ev) => { setze(pfad, ev.target.value || (info.pflicht ? null : undefined)); aenderung(false); } });
  eingabe.value = String(hole(pfad) || "").slice(0, 10);
  return rahmen(pfad, label, eingabe, { ...opt, id, klasse: "zeit" });
}

const quellenIds = () => (m.quellen || []).map((q) => q.id).filter(Boolean);
const quellenText = (id) => {
  const q = (m.quellen || []).find((x) => x.id === id);
  return q ? `${id} ${[q.herausgeber, q.titel].filter(Boolean).join(": ").slice(0, 60)}` : `${id} (nicht im Quellenverzeichnis)`;
};
/** Belege als Mehrfachauswahl der Einträge im Quellenverzeichnis (Quellen-IDs). */
function belege(pfad, label = "Belege", opt = {}) {
  const ids = [...new Set([...quellenIds(), ...(hole(pfad) || [])])].filter((q) => q !== opt.ohne);
  if (!ids.length) return el("p", { class: "hinweis", "data-pfad": zeiger(pfad) }, `${label}: noch keine Quelle im Quellenverzeichnis (Schritt 5).`);
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const liste = hole(pfad) || [];
  const box = el(
    "div",
    { class: "mehrfach", id },
    ids.map((q) =>
      el(
        "label",
        { class: `chip${liste.includes(q) ? " an" : ""}`, title: quellenText(q) },
        el("input", { type: "checkbox", value: q, checked: liste.includes(q), "data-fokus": `${zeiger(pfad)}=${q}`, onchange: (ev) => { const n = new Set(hole(pfad) || []); if (ev.target.checked) n.add(q); else n.delete(q); setze(pfad, ids.filter((x) => n.has(x))); aenderung(true); } }),
        q,
      ),
    ),
  );
  return gruppenrahmen(pfad, label, box, { ...opt, hinweis: opt.hinweis ?? "" }, id);
}

/** Nächste freie Nummer einer Liste mit IDs wie Q1, K2, M3. */
const naechste = (liste, praefix) => `${praefix}${Math.max(0, ...(liste || []).map((x) => Number(String(x.id || "").slice(praefix.length)) || 0)) + 1}`;

/** Zahl einer Rolle entfernen: Verweis und Kennzahl. */
function entferneRolle(rolle) {
  const sv = m.sachverhalte[0];
  const b = sv.module[BETRIEB];
  const ref = b.kennzahlen?.[rolle];
  if (typeof ref === "string" && ref !== "nicht_zutreffend") sv.kennzahlen = sv.kennzahlen.filter((z) => z.id !== ref);
  if (b.kennzahlen) delete b.kennzahlen[rolle];
}

/**
 * Zahl einer Rolle (betroffene Anschlüsse, Personen, Sektorgrößen): gezählt oder geschätzt mit Wert, Bezeichnung,
 * Einheit, Datenstand und Belegen als Kennzahl des Sachverhalts; unbekannt oder nicht zutreffend ohne Kennzahl.
 * Das Modul verweist je Rolle auf die Kennzahl (lead-kritis-betrieb, kennzahlen). Wie bisher beim Messwert erscheint
 * der Wert nur bei „gezählt“ und „geschätzt“ (KL-UX-08); die Erklärung steht nur an der ersten Zahl eines Schritts.
 */
function zahl(rolle, titel, opt = {}) {
  const sv = m.sachverhalte[0];
  const b = sv.module[BETRIEB];
  const r = ROLLEN[rolle];
  const p = `${B}.kennzahlen.${rolle}`;
  const u = uiEintrag(p);
  const ref = b.kennzahlen?.[rolle];
  const i = typeof ref === "string" ? sv.kennzahlen.findIndex((z) => z.id === ref) : -1;
  const kz = i >= 0 ? sv.kennzahlen[i] : null;
  const status = kz ? kz.erhebung : ref === null ? "unbekannt" : ref === "nicht_zutreffend" ? "nicht_zutreffend" : "";
  const optional = !opt.pflicht;
  const erklaerung = statusErklaert ? "" : "gezählt = gezählt oder gemessen; geschätzt = hochgerechnet; unbekannt = geprüft, nicht feststellbar; nicht zutreffend = für diese Dienstleistung nicht einschlägig.";
  statusErklaert = true;
  const setzeStatus = (w) => {
    if (DEFS.kennzahl.properties.erhebung.enum.includes(w)) {
      if (kz) kz.erhebung = w;
      else {
        const neu = { id: naechste(sv.kennzahlen, "K"), gegenstand: r.gegenstand, einheit: r.einheit, art: r.art, wert: null, mindestwert: false, erhebung: w, datenstand: null, quellen: quellenIds().slice(0, 1) };
        sv.kennzahlen.push(neu);
        setze(p, neu.id);
      }
    } else {
      if (kz) sv.kennzahlen = sv.kennzahlen.filter((z) => z !== kz);
      if (w === "") delete b.kennzahlen[rolle];
      else setze(p, w === "unbekannt" ? null : "nicht_zutreffend");
    }
  };
  const id = neueId();
  const name = neueId();
  // weitere Erhebungsarten des Kerns (etwa hochgerechnet) nur, wenn eine geladene Meldung sie enthält
  const werte = ["gezaehlt", "geschaetzt", ...(kz && !["gezaehlt", "geschaetzt"].includes(kz.erhebung) ? [kz.erhebung] : []), "unbekannt", "nicht_zutreffend"];
  const option = (w) =>
    el("label", { class: `segment${status === w ? " an" : ""}` }, el("input", { type: "radio", name, value: w, checked: status === w, "data-fokus": `${zeiger(p)}=${w}`, onchange: () => { setzeStatus(w); aenderung(true); } }), zeige(w));
  const statusFeld = gruppenrahmen(
    p,
    "Erhebung",
    el("div", { class: "segmente", role: "radiogroup", id, "aria-label": `${u.label ?? titel}: Erhebung` }, optional && option(""), werte.map(option)),
    { hinweis: erklaerung, pflicht: opt.pflicht },
    id,
  );
  const kzp = `${SV}.kennzahlen.${i}`;
  const hp = `${B}.kennzahlen_hinweise.${rolle}`;
  return gruppe(
    u.label ?? titel,
    u.hinweis && el("p", { class: "hinweis" }, u.hinweis),
    statusFeld,
    kz && zeile(textfeld(`${kzp}.wert`, "Wert", { eigen: true, typ: "number", hinweis: "" }), textfeld(`${kzp}.einheit`, "Einheit", { eigen: true, hinweis: "" }), zeitfeld(`${kzp}.datenstand`, "Datenstand", { eigen: true, hinweis: "leer = Datenstand des Istzustands" })),
    kz && textfeld(`${kzp}.gegenstand`, "Bezeichnung", { eigen: true, platzhalter: opt.gegenstand || r.gegenstand, hinweis: "" }),
    kz &&
      (register.set(zeiger(`${kzp}.mindestwert`), { schritt, label: "Mindestzahl" }), true) &&
      el(
        "label",
        { class: "feld", "data-pfad": zeiger(`${kzp}.mindestwert`) },
        el("input", { type: "checkbox", checked: !!kz.mindestwert, "data-fokus": zeiger(`${kzp}.mindestwert`), onchange: (ev) => { kz.mindestwert = ev.target.checked; aenderung(false); } }),
        " Mindestzahl: bestätigte Untergrenze, nicht die vollständige Zahl",
      ),
    kz && kz.erhebung !== "gezaehlt" && zeile(textfeld(`${kzp}.bandbreite.von`, "Bandbreite von (optional)", { eigen: true, typ: "number", hinweis: "" }), textfeld(`${kzp}.bandbreite.bis`, "bis", { eigen: true, typ: "number", hinweis: "" })),
    kz && belege(`${kzp}.quellen`, "Belege"),
    status !== "" && textfeld(hp, "Hinweis (optional)", { eigen: true, platzhalter: opt.hinweis, hinweis: "" }),
  );
}

/** Gebiete mit Regionalschlüssel (Kern: raum.gebiete); der Name kommt aus dem Verzeichnis (KL-UX-29). */
function kurzName(ars) {
  const t = arsTeile(ars);
  if (!t) return String(ars || "");
  return t.stellen > 5 && t.ort ? t.ort : t.kreis || t.land;
}
function gebiete() {
  const pfad = `${SV}.raum.gebiete`;
  const eintraege = hole(pfad) || [];
  const z = zeiger(pfad);
  register.set(z, { schritt, id: undefined, label: "Regionalschlüssel" });
  return el(
    "fieldset",
    { class: "feld textliste", "data-pfad": z },
    el("legend", { class: "feld-label" }, "Regionalschlüssel (ARS)"),
    el("p", { class: "hinweis" }, "Kreis- oder Gemeindeschlüssel des betroffenen Raums; der Name erscheint unter dem Feld. Das Versorgungsgebiet folgt oft keinen Verwaltungsgrenzen, dafür steht die Beschreibung."),
    eintraege.map((g, i) => {
      const zid = neueId();
      const feld = textfeld(`${pfad}.${i}.schluessel`, `Schlüssel ${i + 1}`, {
        eigen: true,
        hinweis: "",
        labelVersteckt: true,
        klasse: "kurz",
        platzhalter: "z. B. 16072",
        danach: (v) => {
          setze(`${pfad}.${i}.name`, kurzName(v.trim()));
          const z2 = document.getElementById(zid);
          if (z2) z2.textContent = arsName(v);
        },
      });
      feld.querySelector("input").setAttribute("aria-describedby", zid);
      feld.append(el("p", { class: "hinweis", id: zid, "aria-live": "polite" }, arsName(g.schluessel)));
      return el("div", { class: "textliste-zeile" }, feld, el("button", { type: "button", class: "knopf leise klein", "data-fokus": `${z}#entfernen${i}`, "aria-label": `Schlüssel ${i + 1} entfernen`, onclick: () => entferneAusListe(pfad, z, i, "Schlüssel") }, "entfernen"));
    }),
    rueckgaengigLeiste(z),
    el("button", { type: "button", class: "knopf klein", "data-fokus": `${z}#neu`, onclick: () => { setze(pfad, [...eintraege, { name: "" }]); aenderung(true, `${z}/${eintraege.length}`); } }, "Schlüssel hinzufügen"),
  );
}

/** Kennungen anderer Sachverhalte (Kern: bezug, Einträge {kennung}). */
function bezugListe() {
  const pfad = `${SV}.bezug`;
  const eintraege = hole(pfad) || [];
  const z = zeiger(pfad);
  register.set(z, { schritt, id: undefined, label: "Bezug" });
  return el(
    "fieldset",
    { class: "feld textliste", "data-pfad": z },
    el("legend", { class: "feld-label" }, "Bezug (Kennungen)"),
    el("p", { class: "hinweis" }, "Kennungen anderer Sachverhalte, auf die sich diese Meldung bezieht, etwa die eines Netzbetreibers, von dessen Ausfall der eigene Betrieb abhängt. Meist leer."),
    eintraege.map((_, i) =>
      el("div", { class: "textliste-zeile" }, textfeld(`${pfad}.${i}.kennung`, `Kennung ${i + 1}`, { eigen: true, hinweis: "", labelVersteckt: true }), el("button", { type: "button", class: "knopf leise klein", "data-fokus": `${z}#entfernen${i}`, "aria-label": `Kennung ${i + 1} entfernen`, onclick: () => entferneAusListe(pfad, z, i, "Kennung") }, "entfernen")),
    ),
    rueckgaengigLeiste(z),
    el("button", { type: "button", class: "knopf klein", "data-fokus": `${z}#neu`, onclick: () => { setze(pfad, [...eintraege, { kennung: "" }]); aenderung(true, `${z}/${eintraege.length}`); } }, "Kennung hinzufügen"),
  );
}

/**
 * Feld aus dem Schema: Auswahl, Zahl, Datum, Zeit, Text, Liste oder Gruppe – mit Beschriftung aus der Darstellungsdatei.
 * So erscheinen neue Felder des Moduls (etwa ein weiterer Sektorblock) ohne Programmänderung.
 */
function schemaFeld(pfad, roh, opt = {}) {
  const k = aufloesen(roh);
  const u = uiEintrag(pfad);
  const typen = [].concat(k.type || []);
  const varianten = [].concat(k.anyOf || []).map(aufloesen);
  const zeitVariante = varianten.find((v) => String(v.pattern || "").includes("T([01]"));
  if (k.enum) {
    const werte = k.enum;
    return werte.length <= 6 && u.widget !== "auswahl" ? segmente(pfad, u.label, werte, opt) : auswahl(pfad, u.label, werte, opt);
  }
  if (typen.includes("object") || k.properties) {
    const kinder = Object.entries(k.properties || {}).filter(([n]) => n !== "quellen").map(([n, s]) => schemaFeld(`${pfad}.${n}`, s));
    if (k.properties?.quellen) kinder.push(belege(`${pfad}.quellen`));
    return u.layout === "zeile" ? gruppe(u.label || "", zeile(...kinder)) : gruppe(u.label || "", u.hinweis && el("p", { class: "hinweis" }, u.hinweis), ...kinder);
  }
  if (typen.includes("array")) {
    const it = aufloesen(k.items);
    if (it.properties) return liste(pfad, u.label, () => ({}), (p) => Object.entries(it.properties).map(([n, s]) => schemaFeld(`${p}.${n}`, s)), {});
    return textliste(pfad, u.label, { label: uiEintrag(`${pfad}.0`).label || u.label });
  }
  if (typen.includes("number") || typen.includes("integer")) return textfeld(pfad, u.label, { typ: "number", ganzzahl: typen.includes("integer") });
  if (zeitVariante || String(k.pattern || "").includes("T([01]")) {
    // Zeitpunkt: mit Uhrzeit; Kalendertag allein (etwa Stand eines Dokuments): Datumsfeld
    return u.widget === "datum" ? datumfeld(pfad, u.label) : zeitfeld(pfad, u.label);
  }
  return textfeld(pfad, u.label);
}

// ── Schritte ─────────────────────────────────────────
const SCHRITTE = [
  { id: "meldung", titel: "Meldung und Betreiber" },
  { id: "dienstleistung", titel: "Dienstleistung und Istzustand" },
  { id: "ersatz", titel: "Ersatz, Prognose und Bedarf" },
  { id: "lage", titel: "Lage und Einschätzung" },
  { id: "quellen", titel: "Quellen und Zeitstrahl" },
  { id: "pruefen", titel: "Prüfen, Freigabe und Ausgabe" },
];

/** Kürzel des Betreibers: bildet die Kennung KRITIS-<Kürzel>-JJJJMMTT-<Zufall>; bei einer Fortschreibung unveränderlich. */
function kuerzelFeld() {
  const sv = m.sachverhalte[0];
  const fest = !!m.beziehungen?.length && !!sv.kennung;
  const pfad = `${SV}.kennung`;
  const id = neueId();
  const eingabe = el("input", {
    id,
    type: "text",
    value: kuerzelVon(sv.kennung) || kuerzelEntwurf,
    placeholder: "z. B. ZVTN oder NETZ-SUED",
    readonly: fest,
    autocapitalize: "characters",
    oninput: (ev) => {
      const k = ev.target.value.toUpperCase().replace(/\s+/g, "");
      if (ev.target.value !== k) ev.target.value = k;
      if (KUERZEL.test(k)) {
        kuerzelEntwurf = "";
        const alt = KENNUNG.exec(sv.kennung || "");
        sv.kennung = alt ? `KRITIS-${k}-${alt[2]}-${alt[3]}` : neueKennung(k, m.meldezeitpunkt);
      } else {
        kuerzelEntwurf = k;
        sv.kennung = "";
      }
      aenderung(false);
    },
  });
  return rahmen(pfad, "Kürzel des Betreibers", eingabe, {
    id,
    pflicht: true,
    klasse: "kurz",
    hinweis: fest
      ? `Kennung ${sv.kennung}; sie bleibt bei der Fortschreibung gleich.`
      : "Selbst gewähltes Kürzel aus Großbuchstaben A–Z und Ziffern, bis zu drei Teile mit Bindestrich, je höchstens acht Zeichen, ohne Umlaute. Es bildet die Kennung des Sachverhalts, etwa KRITIS-ZVTN-20261014-W2ZV3M; einmal wählen und beibehalten.",
  });
}

function schrittMeldung() {
  const k = kopf();
  const folge = k.meldeart !== "Erstmeldung";
  const vor = m.beziehungen?.[0]?.meldung_id;
  return [
    el("p", { class: "einleitung" }, "Art und Anlass der Meldung und wer meldet. Für eine Folge-, Korrektur- oder Abschlussmeldung die letzte eigene Meldung über „Vormeldung fortschreiben“ laden; das Formular übernimmt die Angaben und setzt den Bezug. Das Formular ist kein Meldeweg: Es ersetzt keine gesetzliche Meldung und begründet keine Meldepflicht."),
    segmente(`${K}.meldeart`, "Meldeart", E.meldeart, { pflicht: true, neuZeichnen: true }),
    // Seit 0.3.1 (KL-UX-11): ohne geladene Vormeldung den Weg dorthin an der Auswahl anbieten
    folge &&
      !vor &&
      el(
        "div",
        { class: "lese vormeldung-angebot" },
        el("p", {}, `Für eine ${k.meldeart} übernimmt das Formular die Angaben der letzten eigenen Meldung und setzt den Bezug.`),
        el("button", { type: "button", class: "knopf klein", "data-fokus": "aktion:vormeldung", onclick: () => document.querySelector("#vormeldung").click() }, "Vormeldung laden"),
      ),
    folge && vor && textfeld("beziehungen.0.meldung_id", "Bezug auf Meldung", { eigen: true, nurLesen: true, hinweis: "Meldungs-ID der Meldung, die fortgeschrieben, berichtigt oder abgeschlossen wird; trägt das Formular beim Fortschreiben ein." }),
    chips(`${K}.meldeanlass`, "Meldeanlass", E.meldeanlass, { pflicht: true }),
    zeile(zeitfeld("meldezeitpunkt", "Meldezeitpunkt", { eigen: true, pflicht: true, hinweis: "" }), zeitfeld("meldezeitraum.von", "Berichtszeitraum von", { eigen: true, hinweis: "" }), zeitfeld("meldezeitraum.bis", "Berichtszeitraum bis", { eigen: true, hinweis: "" })),
    zeile(
      textfeld("absender.stelle", "Betreiber (meldende Stelle)", { eigen: true, pflicht: true, danach: (v) => { betrieb().betreiber.name = v; }, platzhalter: "z. B. Netzbetreiber Nord (FIKTIV)", hinweis: "Im Demonstrator nur fiktive Namen." }),
      auswahl("absender.gebiet.name", "Land", LAND_NAMEN, { eigen: true, pflicht: true, hinweis: "" }),
    ),
    kuerzelFeld(),
    textfeld("absender.stelle_id", "Stellenkennung (optional)", { eigen: true, klasse: "kurz", hinweis: "Stabile Kennung der meldenden Stelle, falls vereinbart." }),
    segmente(`${B}.betreiber.traegerschaft`, "Trägerschaft", E.traegerschaft),
    textfeld(`${K}.kontaktstelle`, "Kontaktstelle (Funktionsadresse, keine Person)", { platzhalter: "z. B. Leitwarte, 24 h besetzt" }),
    textliste(`${K}.empfaenger`, "Empfänger", { label: "Empfänger", element: "Empfänger", hinzufuegen: "Empfänger hinzufügen", platzhalter: "z. B. Landkreis …, Krisenstab (Übungsrolle, FIKTIV)" }),
    liste(
      `${K}.gemeldet_an`,
      "Parallele Pflichtmeldungen (nur dokumentiert)",
      () => ({ stelle: "", rechtsgrundlage: "", status: "erfolgt" }),
      (p) => [zeile(textfeld(`${p}.stelle`, "Stelle"), textfeld(`${p}.rechtsgrundlage`, "Rechtsgrundlage", { platzhalter: "z. B. § 168 TKG" })), segmente(`${p}.status`, "Status", E.gemeldetStatus), zeile(zeitfeld(`${p}.zeitpunkt`, "Zeitpunkt"), textfeld(`${p}.kennzeichen`, "Kennzeichen"))],
      { element: "Pflichtmeldung", hinzufuegen: "Pflichtmeldung hinzufügen", hinweis: "Diese Meldung ersetzt keine gesetzliche Meldung. Leere Liste: keine dokumentiert.", kurz: (e) => [e.stelle, e.rechtsgrundlage, zeige(e.status)] },
    ),
    // Kennzeichnung (Meldungs-ID, TLP, Datenart) steht seit 0.3.1 in Schritt 6 (KL-UX-10)
  ];
}

function schrittDienstleistung() {
  const sv = m.sachverhalte[0];
  const b = sv.module[BETRIEB];
  const sa = sektorSchluessel(b.sektor);
  // Sektorangaben aus dem Schema: qualitative Angaben des Blocks zum gewählten Sektor, Zahlen als Kennzahlen
  const sektorGruppe = () => {
    if (!sa) return b.sektor ? el("p", { class: "hinweis" }, `Für „${b.sektor}“ sind keine Sektorangaben vorgesehen; es gelten die gemeinsamen Angaben.`) : null;
    const p = `${B}.sektor_angaben.${sa}`;
    const block = betriebP.sektor_angaben.properties[sa] || {};
    const rollen = Object.entries(ROLLEN).filter(([, r]) => r.sektor === sa);
    return gruppe(
      `${uiEintrag(`${B}.sektor_angaben`).label || "Sektorangaben"}: ${uiEintrag(p).label || sa}`,
      el("p", { class: "hinweis" }, "Optional. „keine Angabe“ nimmt eine Angabe zurück; leere Angaben entfallen bei der Ausgabe."),
      ...Object.entries(aufloesen(block).properties || {}).map(([n, sch]) => schemaFeld(`${p}.${n}`, sch)),
      ...rollen.map(([rolle]) => zahl(rolle, rolle)),
    );
  };
  return [
    el("p", { class: "einleitung" }, "Welche Dienstleistung ist betroffen, in welchem Gebiet, seit wann und wie stark? Jede Angabe gilt zu einem Datenstand: dem Zeitpunkt, zu dem sie zutraf."),
    zeile(auswahl(`${B}.sektor`, "Sektor (§ 4 Abs. 1 KRITISDachG)", E.sektor, { pflicht: true, neuZeichnen: true, leerAlsFehlend: true }), textfeld(`${B}.kritische_dienstleistung`, "Kritische Dienstleistung", { pflicht: true, platzhalter: "z. B. Trinkwasserversorgung" })),
    gruppe(uiEintrag(`${B}.anlage`).label || "Anlage", zeile(textfeld(`${B}.anlage.bezeichnung`, "Bezeichnung"), textfeld(`${B}.anlage.kennung_betreiber`, "Kennung des Betreibers"))),
    gruppe(
      "Betroffener Raum",
      gebiete(),
      textfeld(`${SV}.raum.beschreibung`, "Beschreibung des Versorgungsgebiets", { eigen: true, hinweis: "In Worten, etwa Teilnetz, Ortsteile oder Versorgungsgebiet." }),
      textfeld(`${B}.anteil_gebiet_prozent`, "Anteil am Gebiet in % (optional)", { typ: "number" }),
    ),
    gruppe(
      "Istzustand",
      zeile(
        zeitfeld(`${B}.ist.stand`, "Datenstand", { pflicht: true }),
        zeitfeld(`${SV}.eintritt.zeit`, "Ausfallbeginn", { eigen: true, hinweis: "Wann die Dienstleistung eingeschränkt wurde; leer, wenn sie nicht eingeschränkt ist oder der Beginn unbekannt ist.", neuZeichnen: true }),
      ),
      zeitfeld(`${SV}.bekannt_seit`, "Bekannt seit (optional)", { eigen: true, hinweis: "Wann der Betrieb von der Einschränkung erfahren hat, wenn das später als ihr Beginn war." }),
      sv.eintritt?.zeit && segmente(`${SV}.eintritt.genauigkeit`, "Genauigkeit des Beginns", E.genauigkeit.filter((g) => g !== "unbekannt"), { eigen: true, pflicht: true, hinweis: "belegt = durch eigene Aufzeichnung; ungefähr = nur eingrenzbar (in Lage & Ereignis erläutern)." }),
      segmente(`${B}.ist.leistungsgrad`, "Leistungsgrad", E.leistungsgrad, { pflicht: true }),
      zeile(textfeld(`${B}.ist.leistungsgrad_prozent`, "Leistungsgrad in % (optional)", { typ: "number" }), textfeld(`${B}.ist.leistungsbasis`, "Bezug des Prozentwerts", { hinweis: "Pflicht, wenn ein Prozentwert angegeben ist." })),
      schemaFeld(`${B}.ist.eskalationsstufe_betrieblich`, betriebP.ist.properties.eskalationsstufe_betrieblich, {
        hinweis: "Eigene Einstufung des Betriebs nach Bewältigungsfähigkeit und Planlage (BSI-Standard 200-4): Störung = im Normalbetrieb behebbar; Notfall = zeitkritischer Prozess nicht innerhalb seiner MTPD im Normalbetrieb wiederherstellbar, Pläne vorhanden; Krise = im Normalbetrieb nicht beherrschbar, Pläne greifen nicht oder nur bedingt.",
      }),
      // Seit 0.3.4 beim Istzustand (KL-UX-26): er sagt, wie gesichert diese Angaben sind
      segmente(`${B}.bestaetigungsgrad`, "Bestätigungsgrad", E.bestaetigung, { pflicht: true }),
    ),
    zahl("betroffene_anschluesse", "Betroffene Anschlüsse", { pflicht: true, gegenstand: "z. B. Netzanschlüsse ohne Versorgung" }),
    zahl("betroffene_personen", "Betroffene Personen", { pflicht: true, gegenstand: "z. B. Bewohnerinnen und Bewohner" }),
    textliste(`${B}.ist.einrichtungen`, "Einrichtungen mit besonderem Bedarf", { label: "Einrichtung", element: "Einrichtung", hinzufuegen: "Einrichtung hinzufügen" }),
    sektorGruppe(),
  ];
}

function schrittErsatz() {
  const sv = m.sachverhalte[0];
  const b = sv.module[BETRIEB];
  const ps = b.prognose.status;
  const mitBcm = !!b.bcm;
  const mitUrsache = !!b.ursache;
  return [
    el("p", { class: "einleitung" }, "Wie wird der Ausfall überbrückt, was tut der Betrieb, wann ist mit dem Wiederanlauf zu rechnen, und welche Unterstützung braucht er? Dabei auseinanderhalten: den Istzustand (vorheriger Schritt), die eigene Prognose und Planwerte aus der Vorsorge. Eine Reichweite gilt nur mit ihrer Bedingung; die Nennlaufzeit etwa eines Aggregats ist keine Reichweite."),
    liste(
      `${B}.ersatzverfahren`,
      "Ersatzverfahren",
      () => ({ art: "", status: "eingesetzt", reichweite_bis: null, bedingung: "" }),
      (p) => [
        textfeld(`${p}.art`, "Art", { platzhalter: "z. B. Notstromaggregat Pumpwerk" }),
        segmente(`${p}.status`, "Status", E.ersatzStatus),
        zeile(zeitfeld(`${p}.reichweite_bis`, "Reichweite bis", { hinweis: "leer = unbekannt" }), textfeld(`${p}.traegt_leistungsgrad_prozent`, "trägt Leistungsgrad in %", { typ: "number" }), zeitfeld(`${p}.stand`, "Datenstand", { hinweis: "leer = Datenstand des Istzustands" })),
        textfeld(`${p}.bedingung`, "Bedingung der Reichweite", { platzhalter: "z. B. ohne Nachbetankung, bei Normalverbrauch" }),
      ],
      { element: "Ersatzverfahren", hinzufuegen: "Ersatzverfahren hinzufügen", kurz: (e) => [e.art, zeige(e.status), e.reichweite_bis && `Reichweite bis ${zeitKurz(e.reichweite_bis)}`] },
    ),
    liste(
      `${SV}.handlungsbedarf.massnahmen`,
      "Eigene Maßnahmen",
      () => ({ id: naechste(sv.handlungsbedarf.massnahmen, "M"), gegenstand: "", stelle: m.absender.stelle || "", status: "begonnen", stand: null, quellen: quellenIds().slice(0, 1) }),
      (p) => [
        zeile(textfeld(`${p}.gegenstand`, "Maßnahme", { eigen: true, platzhalter: "z. B. Mastneubau vorbereitet" }), textfeld(`${p}.stelle`, "Stelle", { eigen: true })),
        auswahl(`${p}.status`, "Status", E.massnahmeStatus, { eigen: true, hinweis: "„wirksam“ nur, wenn die Wirkung belegt ist." }),
        zeitfeld(`${p}.stand`, "Stand", { eigen: true, hinweis: "" }),
        belege(`${p}.quellen`),
      ],
      { element: "Maßnahme", hinzufuegen: "Maßnahme hinzufügen", hinweis: "Was der Betrieb tut, außer Ersatzverfahren und Unterstützungsbedarf, die eigene Listen haben.", kurz: (e) => [e.gegenstand, zeige(e.status)] },
    ),
    gruppe(
      "Prognose Wiederanlauf",
      segmente(`${B}.prognose.status`, "Status", E.prognoseStatus, { pflicht: true, neuZeichnen: true, danach: (w) => { if (w === "keine_prognose_moeglich") { delete b.prognose.fruehestens; delete b.prognose.spaetestens; } } }),
      ps !== "keine_prognose_moeglich" && zeile(textfeld(`${B}.prognose.geber`, "Prognosegeber", { pflicht: ps === "prognose" }), textfeld(`${B}.prognose.zielzustand`, "Zielzustand", { pflicht: ps === "prognose", platzhalter: "z. B. Versorgung aller Anschlüsse wiederhergestellt" })),
      ps === "prognose" && zeile(zeitfeld(`${B}.prognose.fruehestens`, "Frühestens", { eigen: true }), zeitfeld(`${B}.prognose.spaetestens`, "Spätestens", { eigen: true })),
      ps === "prognose" && segmente(`${B}.prognose.unsicherheit`, "Unsicherheit", E.unsicherheit),
      textfeld(`${B}.prognose.begruendung`, "Begründung"),
      zeitfeld(`${B}.prognose.stand`, "Datenstand", { hinweis: "leer = Datenstand des Istzustands" }),
    ),
    liste(
      `${B}.unterstuetzungsbedarf`,
      "Unterstützungsbedarf",
      () => ({ leistung: "", bis: null, adressat: "", status: "angefordert" }),
      (p) => [zeile(textfeld(`${p}.leistung`, "Leistung"), textfeld(`${p}.menge`, "Menge")), zeile(zeitfeld(`${p}.bis`, "Benötigt bis", { eigen: true, hinweis: "leer = ohne Termin" }), textfeld(`${p}.adressat`, "Adressat")), segmente(`${p}.status`, "Status", E.bedarfStatus)],
      { element: "Bedarf", hinzufuegen: "Bedarf hinzufügen", kurz: (e) => [e.leistung, e.menge, zeige(e.status), e.bis && `bis ${zeitKurz(e.bis)}`] },
    ),
    liste(
      `${SV}.handlungsbedarf.fristen`,
      "Fristen",
      () => ({ id: naechste(sv.handlungsbedarf.fristen, "F"), bis: null, aufgabe: "", adressat: "", grundlage: "", quellen: quellenIds().slice(0, 1) }),
      (p) => [
        zeile(zeitfeld(`${p}.bis`, "Bis", { eigen: true, hinweis: "" }), textfeld(`${p}.adressat`, "Adressat", { eigen: true })),
        textfeld(`${p}.aufgabe`, "Was bis dahin geschehen muss", { eigen: true, platzhalter: "z. B. Dieselkraftstoff 2.000 l für das Pumpwerk" }),
        zeile(textfeld(`${p}.bedingung`, "Bedingung", { eigen: true, platzhalter: "z. B. vor Ende der Notstromreichweite" }), textfeld(`${p}.grundlage`, "Grundlage", { eigen: true, platzhalter: "z. B. Betriebstagebuch" })),
        belege(`${p}.quellen`),
      ],
      { element: "Frist", hinzufuegen: "Frist hinzufügen", hinweis: "Zeitgebundener Bedarf: bis wann etwas geschehen muss, damit die Dienstleistung gehalten wird, und woraus das folgt.", kurz: (e) => [e.bis && `bis ${zeitKurz(e.bis)}`, e.aufgabe] },
    ),
    textfeld(`${SV}.handlungsbedarf.erlaeuterung`, "Erläuterung zu Maßnahmen und Fristen (optional)", { eigen: true, typ: "lang", zeilen: 2, hinweis: "Einordnung in Worten; Status, Stellen und Termine stehen in den Listen." }),
    liste(
      `${B}.abhaengigkeiten`,
      "Abhängigkeiten",
      () => ({ dienstleistung: "", richtung: "eingehend", zustand: "verfuegbar" }),
      (p) => [zeile(textfeld(`${p}.dienstleistung`, "Dienstleistung", { platzhalter: "z. B. Stromverteilung" }), textfeld(`${p}.betroffene_stelle`, "Stelle")), segmente(`${p}.richtung`, "Richtung", E.richtung), segmente(`${p}.zustand`, "Zustand", E.zustand), textfeld(`${p}.puffer`, "Puffer", { platzhalter: "z. B. Notstrom bis 16.10., 10:00 Uhr" })],
      { element: "Abhängigkeit", hinzufuegen: "Abhängigkeit hinzufügen", hinweis: "Eingehend: wovon der Betrieb abhängt. Ausgehend: wer vom Betrieb abhängt.", kurz: (e) => [e.dienstleistung, e.richtung, zeige(e.zustand)] },
    ),
    bcmGruppe(b, mitBcm),
    gruppe(
      "Ursache (optional)",
      el("label", {}, el("input", { type: "checkbox", checked: mitUrsache, "data-fokus": "schalter:ursache", onchange: (ev) => { if (ev.target.checked) b.ursache = { kurz: "", status: "vorläufig" }; else delete b.ursache; aenderung(true); } }), " vorläufige Ursache angeben"),
      mitUrsache && textfeld(`${B}.ursache.kurz`, "Ursache"),
      mitUrsache && segmente(`${B}.ursache.status`, "Status", E.ursacheStatus),
    ),
  ];
}

/**
 * BCM-Angaben (optional). Seit 0.3.4 (KL-UX-26) eingeklappt, wenn eine geladene Meldung sie enthält, mit einer Zeile
 * aus den wichtigsten Angaben. Eingeklappt bleiben die Felder im Dokument.
 */
function bcmGruppe(b, mitBcm) {
  const geschlossen = mitBcm && (bcmZu ?? geladen);
  const c = b.bcm || {};
  const stand = [c.umsetzungsstand, c.standardbezug, c.planung?.bezug && `Planwerte für ${c.planung.bezug}`].map(textWert).filter(Boolean).join(" · ");
  return gruppe(
    "BCM (optional)",
    el("label", {}, el("input", { type: "checkbox", checked: mitBcm, "data-fokus": "schalter:bcm", onchange: (ev) => { if (ev.target.checked) { b.bcm = {}; bcmZu = false; } else delete b.bcm; aenderung(true); } }), " Angaben aus dem betrieblichen Kontinuitätsmanagement machen"),
    mitBcm &&
      el(
        "div",
        { class: "bcm-kopf" },
        el("span", { class: "element-stand" }, stand || "noch keine Angaben"),
        el("button", { type: "button", class: "knopf leise klein", "aria-expanded": String(!geschlossen), "aria-controls": "bcm-inhalt", "data-fokus": "schalter:bcm-umschalten", onclick: () => { bcmZu = !geschlossen; zeichne(); } }, geschlossen ? "aufklappen" : "einklappen"),
      ),
    mitBcm &&
      el(
        "div",
        { id: "bcm-inhalt", hidden: geschlossen },
        el("p", { class: "hinweis" }, "Nur Bezeichnungen und Werte, keine Inhalte aus Notfallplänen, Netzplänen oder Alarmierungslisten."),
        Object.entries(aufloesen(betriebP.bcm).properties).map(([n, sch]) => schemaFeld(`${B}.bcm.${n}`, sch)),
      ),
  );
}

function schrittLage() {
  const sv = m.sachverhalte[0];
  const art = kopf().meldeart;
  const b = sv.module[BETRIEB];
  return [
    el("p", { class: "einleitung" }, "Die Lage aus Sicht des Betriebs in Worten. Belege verweisen mit [Q1], [Q2] … auf das Quellenverzeichnis im nächsten Schritt."),
    zeile(textfeld(`${SV}.bezeichnung`, "Bezeichnung", { eigen: true, pflicht: true, platzhalter: "kurz: was, wo, Folge", hinweis: "" }), el("div", { class: "feld" }, el("p", { class: "feld-label" }, "Kennung"), el("p", { class: "hinweis" }, "Bildet das Formular aus dem Kürzel in Schritt 1; bleibt bei der Fortschreibung gleich."), el("p", { class: "lesewert" }, sv.kennung || "noch keine (Kürzel in Schritt 1 fehlt)"))),
    bezugListe(),
    textfeld(`${SV}.analyse.lage_ereignis`, "Lage & Ereignis", { eigen: true, typ: "lang", pflicht: true, hinweis: "Was ist zum Datenstand der Fall? Zahlen mit Einheit und Stand." }),
    textfeld(`${SV}.analyse.risiken_auswirkungen`, "Risiken & Auswirkungen", { eigen: true, typ: "lang", hinweis: "Was droht, wenn Puffer enden? Mögliche Entwicklungen als solche kennzeichnen." }),
    textfeld(`${SV}.analyse.abhaengigkeiten_interdependenzen`, "Abhängigkeiten & Interdependenzen", { eigen: true, typ: "lang", hinweis: "Wirkungskette mit Puffer und Reichweite." }),
    textfeld(`${B}.einschaetzung`, "Betriebliche Einschätzung", { typ: "lang", zeilen: 2 }),
    textliste(`${B}.folgemeldung_bei`, "Folgemeldung bei", { label: "Anlass", element: "Anlass", hinzufuegen: "Anlass hinzufügen" }),
    (art === "Folgemeldung" || art === "Korrekturmeldung" || b.aenderung_zur_vormeldung != null) && textfeld(`${B}.aenderung_zur_vormeldung`, "Änderung zur Vormeldung", { typ: "lang", zeilen: 2 }),
    (art === "Abschlussmeldung" || b.abschluss) &&
      gruppe(
        uiEintrag(`${B}.abschluss`).label || "Abschluss",
        textfeld(`${B}.abschluss.ergebnis`, "Ergebnis", { pflicht: true }),
        zeile(textfeld(`${B}.abschluss.offene_punkte`, "Offene Punkte"), textfeld(`${B}.abschluss.nachsorge`, "Nachsorge")),
      ),
  ];
}

// „betriebsintern“ zuerst: für Betreiber der Regelfall (Entscheidung vom 05.11.2026); sonst Reihenfolge des Schemas.
const ZUGANG = [["", "nicht angegeben"], ...[...E.zugang].sort((a, b) => (b === "betriebsintern") - (a === "betriebsintern")).map((z) => [z, zeige(z)])];
function schrittQuellen() {
  const sv = m.sachverhalte[0];
  const vorschlag = () => ({ id: naechste(m.quellen, "Q"), kategorie: "B", herausgeber: m.absender.stelle || "Betreiber", titel: "Betriebsangaben der Leitwarte (FIKTIV)", veroeffentlicht: String(betrieb().ist?.stand || jetzt()).slice(0, 10), zugriff: heute(), datenstand: betrieb().ist?.stand || null, zugang: "betriebsintern" });
  const quellen = liste(
    "quellen",
    "Quellenverzeichnis",
    () => ({ id: naechste(m.quellen, "Q"), kategorie: "B", herausgeber: "", titel: "", zugriff: heute(), zugang: null }),
    (p) => {
      const q = hole(p);
      return [
        zeile(
          textfeld(`${p}.id`, "Nummer", { eigen: true, nurLesen: true, hinweis: "", klasse: "schmal" }),
          auswahlPaare(`${p}.kategorie`, "Kategorie", E.kategorie.map((k2) => [k2, KATEGORIE_TEXT[k2] || k2])),
          auswahlPaare(`${p}.zugang`, "Zugang", ZUGANG, { nullAlsLeer: true, neuZeichnen: true, hinweis: "Eigene, nicht öffentliche Unterlagen des Betriebs (Betriebstagebuch, Leitwarte, Störungsübersicht): betriebsintern." }),
        ),
        zeile(textfeld(`${p}.herausgeber`, "Herausgeber", { eigen: true, platzhalter: "z. B. eigener Betrieb (FIKTIV)", hinweis: "" }), textfeld(`${p}.titel`, "Titel", { eigen: true, platzhalter: "z. B. Betriebstagebuch Leitwarte (FIKTIV)", hinweis: "" })),
        zeile(datumfeld(`${p}.veroeffentlicht`, "Datum", { eigen: true, hinweis: "" }), datumfeld(`${p}.zugriff`, "Zugriff", { eigen: true, hinweis: "" }), zeitfeld(`${p}.datenstand`, "Datenstand", { eigen: true, hinweis: "" })),
        zeile(textfeld(`${p}.url`, "Adresse (URL, optional)", { eigen: true, hinweis: "" }), textfeld(`${p}.anmerkung`, "Anmerkung (optional)", { eigen: true, hinweis: "" })),
        q?.zugang === "eingangsmeldung" && textfeld(`${p}.meldung_id`, "Meldungs-ID der Meldung", { eigen: true, hinweis: "Meldungs-ID der verwendeten Meldung einer anderen Stelle, etwa aus deren Datei." }),
        quellenIds().length > 1 && belege(`${p}.ursprung`, "Ursprungsquellen (optional)", { ohne: q?.id, hinweis: "Wenn diese Quelle eine Angabe nur weitergibt, etwa ein Medienbericht mit Zitat: die Quelle, von der sie stammt." }),
      ];
    },
    {
      element: "Quelle",
      hinzufuegen: "Quelle hinzufügen",
      hinweis: "Je Quelle ein Eintrag, nummeriert in der Reihenfolge der ersten Nennung. Eigene Betriebsangaben haben die Kategorie B.",
      kurz: (e) => [e.id, e.kategorie, e.herausgeber],
      extra: () => el("button", { type: "button", class: "knopf klein", "data-fokus": "aktion:quelle", onclick: () => { m.quellen.push(vorschlag()); zu.set(`/quellen/${m.quellen.length - 1}`, false); aenderung(true, `/quellen/${m.quellen.length - 1}`); } }, "Eintrag aus Betreiberangaben vorschlagen"),
    },
  );
  const typen = D.zeitstrahlTypen;
  const zeitstrahl = liste(
    `${SV}.zeitstrahl`,
    "Zeitstrahl",
    () => ({ id: naechste(sv.zeitstrahl, "Z"), zeit: m.meldezeitpunkt, typ: typen[0], text: "", quellen: quellenIds().slice(0, 1), erstmals_gemeldet: m.meldezeitpunkt }),
    (p) => {
      const z = hole(p);
      const fruehere = (sv.zeitstrahl || []).filter((x) => x !== z).map((x) => [x.id, `${x.id} ${zeitKurz(x.zeit)} ${x.text}`.slice(0, 70)]);
      return [
        zeile(zeitfeld(`${p}.zeit`, "Zeitpunkt", { eigen: true, hinweis: "" }), auswahlPaare(`${p}.typ`, "Typ", typen.map((t) => [t, t]), { neuZeichnen: true })),
        textfeld(`${p}.text`, "Kurztext", { eigen: true, hinweis: `Ein Satz ohne Quellenverweis${z?.erstmals_gemeldet ? `; erstmals gemeldet ${zeitKurz(z.erstmals_gemeldet)}` : ""}.` }),
        z?.typ === "Berichtigung" && auswahlPaare(`${p}.berichtigt`, "Berichtigt Zeile", [["", "– bitte wählen –"], ...fruehere], { pflicht: true }),
        belege(`${p}.quellen`),
      ];
    },
    { element: "Zeile", hinzufuegen: "Zeile hinzufügen", hinweis: "Je eingetretenem Ereignis eine Zeile, auch aus früheren Meldungen.", kurz: (e) => [zeitKurz(e.zeit), e.typ, e.text] },
  );
  return [el("p", { class: "einleitung" }, "Worauf beruhen die Angaben, und was ist wann geschehen? Belege in den Texten verweisen mit [Q1], [Q2] … auf das Quellenverzeichnis."), quellen, zeitstrahl];
}

/** Auswahl mit Wert-Text-Paaren; `nullAlsLeer`: leere Wahl steht als null in der Meldung. */
function auswahlPaare(pfad, label, paare, opt = {}) {
  [label, opt] = beschriftet(pfad, label, { eigen: true, hinweis: "", ...opt });
  const id = neueId();
  const s = el(
    "select",
    { id, onchange: (ev) => { const v = ev.target.value; setze(pfad, v === "" ? (opt.nullAlsLeer ? null : undefined) : v); aenderung(!!opt.neuZeichnen); } },
    paare.map(([w, t]) => el("option", { value: w }, t)),
  );
  s.value = hole(pfad) ?? "";
  return rahmen(pfad, label, s, { ...opt, id });
}

const offenText = (n) => `${n} ${n === 1 ? "Angabe" : "Angaben"} offen`;

function dateiname() {
  const kurz = (m.absender.stelle || "Betreiber").replace(/\(FIKTIV\)/g, "").trim().replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return `${lokal(m.meldezeitpunkt || jetzt()).replace(":", "-")}_KRITIS-Meldung_${kurz}_${kopf().meldeart}_FIKTIV.json`;
}

/** Zahl einer Rolle in einer Zeile: „3.100 Hausanschlüsse (gezählt)“ oder nur „unbekannt“. */
function zahlText(rolle) {
  const sv = m.sachverhalte[0];
  const ref = sv.module[BETRIEB].kennzahlen?.[rolle];
  if (ref === undefined) return "";
  if (ref === null) return "unbekannt";
  if (ref === "nicht_zutreffend") return "nicht zutreffend";
  const z = sv.kennzahlen.find((x) => x.id === ref);
  return z && z.wert != null ? `${Number(z.wert).toLocaleString("de-DE")} ${z.gegenstand || z.einheit} (${zeige(z.erhebung)})` : "";
}
const verbinde = (...teile) => teile.filter((t) => t != null && t !== false && textWert(t) !== "").join(" · ");

/** Zusammenfassung vor der Ausgabe (seit 0.3.4, KL-UX-19): die Angaben, auf die es im Lagebild ankommt, in Sätzen. */
function zusammenfassung() {
  const sv = m.sachverhalte[0];
  const b = sv.module[BETRIEB];
  const k = kopf();
  const zeile2 = (label, ...werte) => {
    const w = werte.flat().filter((x) => x != null && x !== false).map(textWert).filter(Boolean);
    if (!w.length) return null;
    return [el("dt", {}, label), el("dd", {}, w.length > 1 ? el("ul", {}, w.map((x) => el("li", {}, x))) : w[0])];
  };
  const pr = b.prognose || {};
  const prognose =
    pr.status === "prognose"
      ? verbinde(pr.zielzustand, `frühestens ${zeitKurz(pr.fruehestens) || "–"}, spätestens ${zeitKurz(pr.spaetestens) || "–"}`, pr.unsicherheit && `Unsicherheit ${pr.unsicherheit}`, pr.geber && `Prognosegeber: ${pr.geber}`)
      : pr.status && verbinde(zeige(pr.status), pr.zielzustand);
  const ist = b.ist || {};
  return el(
    "dl",
    { class: "zusammenfassung" },
    zeile2("Betreiber", m.absender.stelle),
    zeile2("Meldung", verbinde(k.meldeart, (k.meldeanlass || []).join(", "), m.meldezeitpunkt && `Meldezeitpunkt ${zeitKurz(m.meldezeitpunkt)}`)),
    zeile2("Sachverhalt", verbinde(sv.bezeichnung, sv.kennung)),
    zeile2("Dienstleistung", verbinde(b.kritische_dienstleistung, b.sektor && `Sektor ${b.sektor}`)),
    zeile2("Gebiet", verbinde(sv.raum?.beschreibung, ...(sv.raum?.gebiete || []).map((g) => (arsName(g.schluessel) ? `${g.schluessel} ${arsName(g.schluessel)}` : g.schluessel)))),
    zeile2(
      `Istzustand${ist.stand ? `, Stand ${zeitKurz(ist.stand)}` : ""}`,
      verbinde(ist.leistungsgrad && `Leistung ${zeige(ist.leistungsgrad)}${ist.leistungsgrad_prozent != null ? ` (${ist.leistungsgrad_prozent} %)` : ""}`, sv.eintritt?.zeit && `seit ${zeitKurz(sv.eintritt.zeit)}`, ist.eskalationsstufe_betrieblich && `betriebliche Einstufung: ${ist.eskalationsstufe_betrieblich}`, b.bestaetigungsgrad),
    ),
    zeile2("Betroffene Anschlüsse", zahlText("betroffene_anschluesse")),
    zeile2("Betroffene Personen", zahlText("betroffene_personen")),
    zeile2("Einrichtungen mit besonderem Bedarf", ist.einrichtungen || []),
    zeile2("Ersatzverfahren", (b.ersatzverfahren || []).map((e) => verbinde(e.art, zeige(e.status), e.traegt_leistungsgrad_prozent != null && `trägt ${e.traegt_leistungsgrad_prozent} %`, e.reichweite_bis && `Reichweite bis ${zeitKurz(e.reichweite_bis)}${e.bedingung ? ` (${e.bedingung})` : ""}`))),
    zeile2("Eigene Maßnahmen", (sv.handlungsbedarf.massnahmen || []).map((x) => verbinde(x.gegenstand, zeige(x.status), x.stand && `Stand ${zeitKurz(x.stand)}`))),
    zeile2("Prognose Wiederanlauf", prognose),
    zeile2("Unterstützungsbedarf", (b.unterstuetzungsbedarf || []).map((u) => verbinde(u.leistung, u.menge, u.bis && `bis ${zeitKurz(u.bis)}`, u.adressat && `an ${u.adressat}`, zeige(u.status)))),
    zeile2("Fristen", (sv.handlungsbedarf.fristen || []).map((f) => verbinde(f.bis && `bis ${zeitKurz(f.bis)}`, f.aufgabe, f.adressat))),
    zeile2("Abhängigkeiten", (b.abhaengigkeiten || []).map((a) => verbinde(a.dienstleistung, a.richtung, zeige(a.zustand)))),
    zeile2("Betriebliche Einschätzung", b.einschaetzung),
  );
}

/**
 * Schritt 6. Seit 0.3.4 (KL-UX-18) in der Reihenfolge der Arbeit: erst das Prüfergebnis, dann die Zusammenfassung, dann
 * die Freigabe, zuletzt Kennzeichnung und Ausgabe. Seit 0.4: Status nach Zeichnung (freigegeben mit Funktion und
 * Zeitpunkt der Freigabe, sonst zur Freigabe); kein Versandvermerk, weil der Versand nicht Teil der Meldung ist.
 */
function schrittPruefen() {
  const { schemaOk, befunde } = pruefe();
  const fehler = befunde.filter((b) => b.stufe === "fehler");
  const ausgeben = () => {
    ableiten();
    m.entstehung.erstellt = jetzt();
    const blob = new Blob([JSON.stringify(m, null, 2) + "\n"], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: dateiname() });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    ausgegeben = dateiname();
    ansage(`Ausgegeben: ${ausgegeben}`);
    zeichne({ fokusPraefix: "aktion:folgemeldung" });
  };
  // Freigabe: „Wie Erfassung“ übernimmt Funktion, Zeitpunkt und Handzeichen, wenn eine Stelle alles tut (KL-UX-21)
  const zeichnung = (k, titel) => {
    const e = m.freigabe.erfasst || {};
    const kopie = k !== "erfasst" && [e.name, e.hz].some((x) => textWert(x));
    return gruppe(
      titel,
      textfeld(`freigabe.${k}.name`, "Funktion", { eigen: true, hinweis: "" }),
      datumfeld(`freigabe.${k}.zeitpunkt`, "Datum", { eigen: true, hinweis: "" }),
      textfeld(`freigabe.${k}.hz`, "Zeichen", { eigen: true, hinweis: "" }),
      kopie && el("button", { type: "button", class: "knopf klein", "data-fokus": `aktion:wie-erfassung-${k}`, "aria-label": `Wie Erfassung (${titel})`, onclick: () => { m.freigabe[k] = { ...m.freigabe[k], name: e.name, zeitpunkt: e.zeitpunkt, hz: e.hz }; aenderung(true); } }, "Wie Erfassung"),
    );
  };
  const befundEintrag = (b) =>
    el("li", { class: `befund${b.stufe === "warnung" ? " warnung" : ""}` }, el("button", { type: "button", "aria-label": `${b.stufe === "warnung" ? "Warnung" : "Fehler"}: ${feldName(b)}, ${b.text} Zum Feld springen`, onclick: () => springe(zielSchritt(b), b.pfad) }, feldName(b)), `: ${b.text}`);
  const warnungen = befunde.filter((b) => b.stufe !== "fehler");
  const bereit = schemaOk && fehler.length === 0;
  const k = kopf();
  const format = `${S.properties.schema.const} ${D.fassung}, Module ${KOPF} und ${BETRIEB} ${betriebP.fassung.const}`;
  return [
    el("p", { class: "einleitung" }, "Erst prüfen, was noch offen ist, dann die Meldung durchsehen und die Freigabe nach dem eigenen Verfahren eintragen. Das Formular prüft Vollständigkeit, Form und Stimmigkeit der Angaben, nicht ihre sachliche Richtigkeit."),
    el("h3", {}, fehler.length ? "Noch offen" : "Prüfergebnis"),
    ...SCHRITTE.filter((s) => fehler.some((b) => zielSchritt(b) === s.id)).map((s) =>
      el("div", { class: "befund-schritt" }, el("h4", {}, `Schritt ${SCHRITTE.indexOf(s) + 1}: ${s.titel}`), el("ul", { class: "befunde" }, fehler.filter((b) => zielSchritt(b) === s.id).map(befundEintrag))),
    ),
    !befunde.length && el("p", { class: "ergebnis-ok" }, "Keine Befunde: Die Meldung ist vollständig und stimmig."),
    warnungen.length > 0 && el("div", { class: "befund-schritt" }, el("h4", {}, "Hinweise zur Stimmigkeit (hindern die Ausgabe nicht)"), el("ul", { class: "befunde" }, warnungen.map(befundEintrag))),
    el("div", { class: "abschnitt-kopf" }, el("h3", {}, "Zusammenfassung"), el("button", { type: "button", class: "knopf klein", "data-fokus": "aktion:drucken", onclick: () => window.print() }, "Drucken")),
    // Nur im Druck (seit Grunddesign 1.6 nicht mehr im Hinweisband): das Papier nicht für eine echte Meldung halten
    el("p", { class: "nur-druck" }, "KRITIS-LEAD ist kein Meldeweg: Diese Zusammenfassung ersetzt keine gesetzliche Meldung und begründet keine Meldepflicht."),
    zusammenfassung(),
    el("h3", {}, "Freigabe"),
    el("p", { class: "hinweis" }, "Mit Funktionen statt Namen, nach dem eigenen Verfahren. Mit Funktion und Datum der Freigabe gilt die Meldung als freigegeben, sonst als zur Freigabe vorgelegt."),
    zeile(zeichnung("erfasst", "Erfassung"), zeichnung("freigegeben", "Freigabe")),
    el(
      "details",
      { class: "kennzeichnung" },
      el("summary", {}, `Kennzeichnung: TLP:${k.vertraulichkeit?.tlp || "CLEAR"} · ${k.datenart} · Meldungs-ID ${String(m.meldung_id).slice(0, 8)}…`),
      zeile(textfeld("meldung_id", "Meldungs-ID", { eigen: true, nurLesen: true, hinweis: "" }), textfeld(`${K}.vertraulichkeit.tlp`, "TLP", { eigen: true, nurLesen: true, hinweis: "" }), textfeld(`${K}.datenart`, "Datenart", { eigen: true, nurLesen: true, hinweis: "" })),
      textfeld(`${K}.vertraulichkeit.hinweis`, "Hinweis zur Vertraulichkeit", { eigen: true, hinweis: "" }),
      el("p", { class: "hinweis" }, `Meldungs-ID, TLP und Datenart setzt das Formular; jede Meldung erhält eine neue ID. Im Demonstrator sind nur fiktive Daten mit TLP:CLEAR zulässig. Format: ${format}.`),
    ),
    el("div", { class: "werkzeugleiste-knoepfe" }, el("button", { type: "button", class: `knopf${bereit ? " primaer" : ""}`, disabled: !bereit, onclick: ausgeben, id: "ausgeben", "aria-describedby": bereit ? undefined : "ausgabe-stand" }, "Meldung ausgeben (JSON)")),
    !bereit && el("p", { class: "hinweis", id: "ausgabe-stand" }, `Ausgabe gesperrt: noch ${offenText(Math.max(fehler.length, 1))}. Hinweise zur Stimmigkeit hindern die Ausgabe nicht.`),
    ausgegeben &&
      el(
        "div",
        { class: "lese nach-ausgabe" },
        el("p", {}, el("strong", {}, "Ausgegeben: "), ausgegeben),
        el("p", {}, "Die Datei auf dem mit der Behörde vereinbarten Meldeweg übermitteln; dieses Formular sendet nichts. Die Datei aufbewahren; sie ist die Vormeldung der nächsten Folge-, Korrektur- oder Abschlussmeldung."),
        k.meldeart !== "Abschlussmeldung" && el("button", { type: "button", class: "knopf", "data-fokus": "aktion:folgemeldung", onclick: () => fortschreiben(structuredClone(m), "Folgemeldung") }, "Folgemeldung beginnen"),
      ),
    el("details", {}, el("summary", {}, "JSON ansehen"), el("pre", { class: "json" }, JSON.stringify(m, null, 2))),
  ];
}
const INHALT = { meldung: schrittMeldung, dienstleistung: schrittDienstleistung, ersatz: schrittErsatz, lage: schrittLage, quellen: schrittQuellen, pruefen: schrittPruefen };

// ── Zeichnen ─────────────────────────────────────────
/** Befunde an den Feldern kennzeichnen; ohne Neuaufbau, damit Fokus und Eingabe erhalten bleiben (seit 0.3.1). */
function markiere() {
  const ziel = document.querySelector("#arbeitsbereich");
  for (const f of ziel.querySelectorAll(".feld-fehler")) f.classList.remove("feld-fehler");
  for (const p of ziel.querySelectorAll(".feld-meldung")) p.remove();
  for (const c of ziel.querySelectorAll('[aria-invalid="true"]')) c.removeAttribute("aria-invalid");
  for (const c of ziel.querySelectorAll('[aria-describedby*="fehler-"]')) {
    const rest = c.getAttribute("aria-describedby").split(" ").filter((x) => !x.startsWith("fehler-"));
    if (rest.length) c.setAttribute("aria-describedby", rest.join(" "));
    else c.removeAttribute("aria-describedby");
  }
  const { befunde } = pruefe();
  let n = 0;
  for (const b of befunde.filter((x) => x.stufe === "fehler" && sichtbar(x))) {
    const f = ziel.querySelector(`[data-pfad="${b.pfad}"]`);
    if (!f || f.classList.contains("feld-fehler")) continue;
    f.classList.add("feld-fehler");
    const mid = `fehler-${++n}`;
    f.append(el("p", { class: "feld-meldung", id: mid }, el("span", { class: "sr" }, "Fehler: "), b.text));
    // Fehler am Element ankündigen: Eingabefeld bzw. Optionsgruppe, sonst die Gruppe (fieldset)
    const ctl = f.matches("fieldset") ? f.querySelector('[role="radiogroup"]') || f : f.querySelector("input,select,textarea");
    if (ctl) {
      if (ctl.matches('input,select,textarea,[role="radiogroup"]')) ctl.setAttribute("aria-invalid", "true");
      ctl.setAttribute("aria-describedby", [mid, ctl.getAttribute("aria-describedby")].filter(Boolean).join(" "));
    }
  }
}

/**
 * Befundmarken der Schrittleiste und der Listenelemente, Zwischenstand. Seit 0.3.1 (KL-UX-03, wie KI-LEAD
 * UX-2026-W44-06) ein Punkt an der Schrittnummer, die Zahl im zugänglichen Namen und im Tooltip; gezählt werden die
 * Befunde, die die Felder zeigen. Der Zwischenstand nennt alle offenen Angaben.
 */
function aktualisiereZahlen() {
  const { befunde } = pruefe();
  const fehler = befunde.filter((x) => x.stufe === "fehler");
  const zeigen = fehler.filter(sichtbar);
  const zahl = {};
  const alle = {};
  for (const b of zeigen) zahl[zielSchritt(b)] = (zahl[zielSchritt(b)] || 0) + 1;
  for (const b of fehler) alle[zielSchritt(b)] = (alle[zielSchritt(b)] || 0) + 1;
  for (const s of SCHRITTE) {
    const n = zahl[s.id] || 0;
    // Haken (seit 0.3.4, KL-UX-29): besucht oder geladen und ohne offene Angabe, auch ohne angezeigte; Schritt 6 erst,
    // wenn die ganze Meldung vollständig ist. Der Zustand folgt den Befunden, nicht der Position (wie KI-LEAD 0.6.20).
    const fertig = !n && (besucht.has(s.id) || geladen) && (s.id === "pruefen" ? fehler.length === 0 : !alle[s.id]);
    const knopf = document.querySelector(`[data-fokus="schritt:${s.id}"]`);
    if (!knopf) continue;
    knopf.classList.toggle("mit-befund", n > 0);
    knopf.classList.toggle("fertig", fertig);
    if (n) knopf.title = `${n} ${n === 1 ? "Feld" : "Felder"} mit Befund`;
    else if (fertig) knopf.title = "vollständig";
    else knopf.removeAttribute("title");
    knopf.querySelector(".schritt-befund").hidden = !n;
    knopf.querySelector(".schritt-fertig").hidden = !fertig;
    knopf.querySelector("[data-schritt-zahl]").textContent = n ? `, ${n} ${n === 1 ? "Feld" : "Felder"} mit Befund` : fertig ? ", vollständig" : "";
  }
  const stand = document.querySelector("#nav-stand");
  if (stand) stand.textContent = fehler.length ? offenText(fehler.length) : "vollständig";
  for (const s of document.querySelectorAll("[data-element-befund]")) {
    const ez = s.dataset.elementBefund;
    const n = zeigen.filter((b) => b.pfad.startsWith(`${ez}/`)).length;
    s.textContent = n ? ` · ${n} ${n === 1 ? "Feld" : "Felder"} mit Befund` : "";
  }
  document.querySelector("#status").textContent = `${kopf().meldeart} · ${m.absender.stelle || "ohne Betreiber"} · ${fehler.length ? offenText(fehler.length) : "vollständig"}`;
}

function springe(ziel, pfad) {
  schritt = ziel;
  // eingeklappte Elemente auf dem Weg zum Feld öffnen
  const t = pfad.split("/").filter(Boolean);
  t.forEach((s, i) => { if (/^\d+$/.test(s)) zu.set(`/${t.slice(0, i + 1).join("/")}`, false); });
  if (pfad.includes(`/${BETRIEB}/bcm`)) bcmZu = false;
  hinweisText = "";
  rueckgaengig = null;
  zeichne();
  const r = register.get(pfad);
  const feld = document.querySelector(`[data-pfad="${pfad}"]`);
  // Ziel ist das Eingabeelement, bei Gruppen das erste Options- oder Kontrollfeld, sonst die Gruppe selbst
  const node = (r?.id && document.getElementById(r.id)?.matches("input,select,textarea") ? document.getElementById(r.id) : null) || feld?.querySelector("input,select,textarea,button") || feld;
  if (node && !node.matches("input,select,textarea,button")) node.setAttribute("tabindex", "-1");
  node?.scrollIntoView({ block: "center" });
  node?.focus?.();
}

/** Kurze Ansage für Screenreader über die Statusregion; leeren und neu setzen, damit gleiche Texte erneut gelesen werden. */
function ansage(text) {
  const a = document.querySelector("#ansage");
  if (!a) return;
  a.textContent = "";
  setTimeout(() => (a.textContent = text), 50);
}

const fokusSuche = (bedingung) => [...document.querySelectorAll("#arbeitsbereich [data-fokus]")].find(bedingung);

/** Inhalt eines Schritts bauen; die Erklärung der Erhebung gilt je Schritt. */
function baue(id) {
  statusErklaert = false;
  return INHALT[id]();
}

/** Abschnitt eines Felds für das Prüfergebnis: Gruppenlegenden und Listenelement, etwa „Istzustand › Datenstand“. */
function abschnitt(f) {
  const teile = [];
  for (let e = f.parentElement; e; e = e.parentElement) {
    if (e.matches("fieldset.gruppe")) {
      const l = e.querySelector(":scope > legend")?.textContent.trim();
      if (l) teile.unshift(l);
    }
    if (e.dataset?.titel) teile.unshift(e.dataset.titel);
  }
  // „Ersatzverfahren › Ersatzverfahren 1“ → „Ersatzverfahren 1“
  return teile.filter((t, i) => !(teile[i + 1] || "").startsWith(t)).join(" › ");
}

/** Hält den aktiven Schritt in der waagerecht scrollbaren Schrittleiste im Bild (seit 0.3.1, wie KI-LEAD leiste.ts). */
function aktivInsBild() {
  const liste = document.querySelector(".schritte ol");
  if (!liste || liste.scrollWidth <= liste.clientWidth) return;
  const aktiv = liste.querySelector("[aria-current]");
  if (!aktiv) return;
  const links = aktiv.offsetLeft - liste.offsetLeft;
  const rechts = links + aktiv.offsetWidth;
  const rand = 24;
  // breiter als die Leiste: am Anfang des Eintrags ausrichten
  if (rechts - links + 2 * rand > liste.clientWidth) liste.scrollLeft = Math.max(0, links - 8);
  else if (links - rand < liste.scrollLeft) liste.scrollLeft = Math.max(0, links - rand);
  else if (rechts + rand > liste.scrollLeft + liste.clientWidth) liste.scrollLeft = rechts + rand - liste.clientWidth;
}

/** Schritt wechseln: Hinweise einer früheren Aktion und das Angebot „rückgängig“ enden (seit 0.3.4, KL-UX-17). */
function wechsle(id, { oben = false } = {}) {
  schritt = id;
  hinweisText = "";
  rueckgaengig = null;
  zeichne({ ueberschrift: true });
  if (oben) window.scrollTo(0, 0);
}

/**
 * Hinweis zur letzten Aktion (Beispiel geladen, Vormeldung fortgeschrieben, Datei nicht lesbar) unter der Werkzeugleiste
 * statt in Schritt 6, mit „Ausblenden“, wie der Statuskasten in KI-LEAD (seit 0.3.4, KL-UX-17). Bisher stand er nur in
 * Schritt 6 und blieb dort stehen, etwa „Beispiel geladen“ neben dem Ausgabeknopf.
 */
function zeichneHinweis() {
  const box = document.querySelector("#meldungen");
  if (!box) return;
  box.replaceChildren(
    ...(hinweisText
      ? [el("div", { class: "lese kasten" }, el("p", {}, hinweisText), el("button", { type: "button", class: "knopf leise klein", "data-fokus": "aktion:ausblenden", onclick: () => { hinweisText = ""; zeichneHinweis(); document.querySelector("#schritt-titel")?.focus(); } }, "Ausblenden"))]
      : []),
  );
}

/** Einführung im Seitenkopf nur, solange der Entwurf unberührt ist (seit 0.3.4, KL-UX-30). */
function zeigeEinfuehrung() {
  const e = document.querySelector(".einfuehrung");
  if (e) e.hidden = !unberuehrt;
}

/**
 * Knopf der Schrittnavigation: „Zurück: <Titel>“ als leiser Knopf, „Weiter: <Titel>“ als Hauptknopf, auf allen Breiten
 * (Grunddesign LD-A05, LD-B02, wie KI-LEAD). Seit 0.3.5; KL-UX-30 hatte auf schmalen Bildschirmen nur „Zurück“ bzw.
 * „Weiter“ gezeigt.
 */
const navKnopf = (ziel, vor) =>
  el(
    "button",
    { type: "button", class: `knopf ${vor ? "primaer" : "leise"}`, "data-fokus": vor ? "nav:weiter" : "nav:zurueck", onclick: () => wechsle(ziel.id, { oben: true }) },
    `${vor ? "Weiter" : "Zurück"}: ${ziel.titel}`,
  );

/**
 * Zeichnet Schrittleiste und aktuellen Schritt neu. Der Fokus bleibt am selben Bedienelement (gleiches data-fokus),
 * nach einem Schrittwechsel liegt er auf der Überschrift, nach „hinzufügen“ im ersten Feld des neuen Eintrags.
 */
function zeichne({ ueberschrift = false, fokusPraefix } = {}) {
  const vorher = document.activeElement?.dataset?.fokus;
  // Wer Schritt 6 öffnet, sieht ab dann alle Befunde an den Feldern (KL-UX-02)
  if (schritt === "pruefen") alleZeigen = true;
  besucht.add(schritt);
  register.clear();
  // Register für alle Schritte füllen, damit Befunde jeder Stelle einen Schritt, eine Bezeichnung und einen Abschnitt finden
  const merke = schritt;
  for (const s of SCHRITTE) {
    schritt = s.id;
    const probe = el("div", {}, baue(s.id));
    for (const f of probe.querySelectorAll("[data-pfad]")) {
      const r = register.get(f.dataset.pfad);
      if (r) r.kontext = abschnitt(f);
    }
  }
  schritt = merke;
  const i = SCHRITTE.findIndex((s) => s.id === schritt);
  const nav = el(
    "nav",
    { class: "schritte", "aria-label": "Schritte" },
    el(
      "ol",
      {},
      SCHRITTE.map((s, j) =>
        el(
          "li",
          {},
          el(
            "button",
            { type: "button", class: `schritt${s.id === schritt ? " aktiv" : ""}`, "aria-current": s.id === schritt ? "step" : false, "data-fokus": `schritt:${s.id}`, onclick: () => wechsle(s.id) },
            el("span", { class: "schritt-nr" }, String(j + 1), el("span", { class: "schritt-befund", "aria-hidden": "true", hidden: true }), el("span", { class: "schritt-fertig", "aria-hidden": "true", hidden: true }, "✓")),
            s.titel,
            el("span", { class: "sr", "data-schritt-zahl": s.id }),
          ),
        ),
      ),
    ),
  );
  const inhalt = el(
    "section",
    { class: "schritt-inhalt", "aria-labelledby": "schritt-titel" },
    el("h2", { id: "schritt-titel", tabindex: "-1" }, `Schritt ${i + 1} von ${SCHRITTE.length}: ${SCHRITTE[i].titel}`),
    baue(schritt),
    // Seit 0.3.4 (KL-UX-30) mit der Zahl offener Angaben; auf schmalen Bildschirmen am unteren Rand stehend
    el(
      "div",
      { class: "schritt-nav" },
      i > 0 ? navKnopf(SCHRITTE[i - 1], false) : el("span"),
      el("span", { class: "nav-stand", id: "nav-stand", "aria-hidden": "true" }),
      i < SCHRITTE.length - 1 ? navKnopf(SCHRITTE[i + 1], true) : el("span"),
    ),
  );
  const ziel = document.querySelector("#arbeitsbereich");
  ziel.replaceChildren(nav, inhalt);
  zeichneHinweis();
  markiere();
  aktualisiereZahlen();
  aktivInsBild();
  // Fokus wiederherstellen
  let ziel2 = null;
  if (ueberschrift) ziel2 = document.querySelector("#schritt-titel");
  else if (fokusPraefix) ziel2 = fokusSuche((e) => e.dataset.fokus.startsWith(fokusPraefix));
  if (!ziel2 && vorher) {
    ziel2 = fokusSuche((e) => e.dataset.fokus === vorher);
    // entfernter Eintrag: Fokus auf „hinzufügen“ derselben Liste
    if (!ziel2 && vorher.includes("#entfernen")) ziel2 = fokusSuche((e) => e.dataset.fokus === `${vorher.split("#")[0]}#neu`);
    // „Übernehmen“ oder „Wie Erfassung“ verschwinden nach dem Klick: Fokus ins Feld davor
    if (!ziel2 && vorher.startsWith("aktion:wie-erfassung-")) ziel2 = fokusSuche((e) => e.dataset.fokus === `/freigabe/${vorher.slice(21)}/name`);
  }
  if (ziel2) {
    ziel2.focus({ preventScroll: !ueberschrift && !fokusPraefix });
    if (fokusPraefix && ziel2.matches("textarea,input[type=text]")) ziel2.setSelectionRange(ziel2.value.length, ziel2.value.length);
  }
}

// Bearbeitet und verlassen (change feuert bei Textfeldern beim Verlassen nach einer Änderung, bei Auswahl sofort):
// ab dann zeigt das Feld eine fehlende Pflichtangabe (KL-UX-02)
document.querySelector("#arbeitsbereich").addEventListener("change", (ev) => {
  const f = ev.target.closest?.("[data-pfad]");
  if (!f || !ev.target.matches("input,select,textarea")) return;
  bearbeitet.add(f.dataset.pfad);
  markiere();
  aktualisiereZahlen();
});// ── Werkzeugleiste ───────────────────────────────────
/**
 * Vormeldung fortschreiben. `meldeart` setzt „Folgemeldung beginnen“ nach der Ausgabe (KL-UX-20); sonst bleibt die
 * gewählte Meldeart (KL-UX-11: „Vormeldung laden“ an der Auswahl), ohne Wahl Folgemeldung.
 */
function fortschreiben(vor, meldeart) {
  const passt = vor?.schema === S.properties.schema.const && vor?.absender?.ebene === "Betreiber" && vor?.module?.[KOPF] && vor?.sachverhalte?.length === 1 && vor.sachverhalte[0].module?.[BETRIEB];
  if (!passt) {
    hinweisText = "Fortschreiben geht nur mit einer Betreibermeldung nach LEAD-Meldung-v2, die dieses Formular ausgegeben hat. Für eine Meldung in einem früheren Format eine Erstmeldung beginnen.";
    ansage(hinweisText);
    return zeichne();
  }
  const gewaehlt = m?.module?.[KOPF]?.meldeart;
  m = structuredClone(vor);
  frisch(true);
  const k = kopf();
  k.meldeart = meldeart || (gewaehlt && gewaehlt !== "Erstmeldung" ? gewaehlt : "Folgemeldung");
  k.meldeanlass = k.meldeart === "Abschlussmeldung" ? ["Zielzustand erreicht"] : ["wesentliche Änderung"];
  // neue Fassung: neue Meldungs-ID, Bezug auf die Vormeldung; die Kennung des Sachverhalts bleibt
  m.beziehungen = [{ art: k.meldeart === "Korrekturmeldung" ? "berichtigung_von" : "fortschreibung_von", meldung_id: vor.meldung_id }];
  m.meldung_id = uuid();
  m.meldezeitpunkt = jetzt();
  m.status = "zur_freigabe";
  // Zeichnungen gelten für die Vormeldung: Funktionen bleiben, Datum heute, Freigabe neu
  m.freigabe = { erfasst: { ...(vor.freigabe?.erfasst || { name: "" }), zeitpunkt: heute() } };
  m.entstehung = { verfahren: "manuell", werkzeug: { name: "KRITIS-LEAD, Betreiberformular", version: D.version } };
  delete betrieb().aenderung_zur_vormeldung;
  hinweisText = `Fortschreibung von ${vor.meldung_id}: Meldeart, Datenstände und Änderungen prüfen; die Änderung zur Vormeldung in Schritt 4 eintragen.`;
  ansage(`${k.meldeart} angelegt. ${hinweisText}`);
  schritt = "meldung";
  speichere();
  zeigeEinfuehrung();
  zeichne({ ueberschrift: true });
}

// „Meldung öffnen“ (seit 0.3.4, KL-UX-30, Name wie in KI-LEAD): Vormeldung und Beispiel hinter einem Knopf. Aufklappliste
// mit aria-expanded; Escape und ein Klick daneben schließen sie, Fokus zurück auf den Knopf.
const oeffnen = document.querySelector("#oeffnen");
const oeffnenListe = document.querySelector("#oeffnen-liste");
function listeZeigen(an, fokusZurueck = false) {
  oeffnen.setAttribute("aria-expanded", String(an));
  oeffnenListe.hidden = !an;
  if (an) oeffnenListe.querySelector("button")?.focus();
  else if (fokusZurueck) oeffnen.focus();
}
oeffnen.addEventListener("click", () => listeZeigen(oeffnenListe.hidden));
oeffnenListe.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") listeZeigen(false, true);
});
document.addEventListener("click", (ev) => {
  if (!oeffnenListe.hidden && !ev.target.closest(".menue")) listeZeigen(false);
});
document.addEventListener("focusin", (ev) => {
  if (!oeffnenListe.hidden && !ev.target.closest?.(".menue")) listeZeigen(false);
});

// Rückfrage als modaler Dialog statt window.confirm: Fokus zuerst auf „Abbrechen“, Escape bricht ab, Fokus zurück zum
// Auslöser. Seit 0.3.4 für „Neue Meldung“ und „Beispiel laden“ (KL-UX-15), Texte je Aktion.
const dialog = document.querySelector("#rueckfrage");
const neuKnopf = document.querySelector("#neu");
let rueckfrageAktion = null;
let rueckfrageAusloeser = null;
function rueckfrage({ titel, text, ok }, aktion, ausloeser) {
  document.querySelector("#rueckfrage-titel").textContent = titel;
  document.querySelector("#rueckfrage-text").textContent = text;
  document.querySelector("#rueckfrage-ok").textContent = ok;
  rueckfrageAktion = aktion;
  rueckfrageAusloeser = ausloeser;
  dialog.showModal();
  document.querySelector("#rueckfrage-abbrechen").focus();
}
document.querySelector("#rueckfrage-abbrechen").addEventListener("click", () => dialog.close("abbrechen"));
// Die Aktion läuft beim Klick auf „OK“, nicht im close-Ereignis: Das folgt asynchron und darf eine inzwischen neu
// geöffnete Rückfrage nicht berühren.
document.querySelector("#rueckfrage-ok").addEventListener("click", () => {
  const aktion = rueckfrageAktion;
  rueckfrageAktion = null;
  dialog.close("ok");
  aktion?.();
});
dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "ok" && !dialog.open) {
    rueckfrageAktion = null;
    rueckfrageAusloeser?.focus();
  }
  dialog.returnValue = "";
});
neuKnopf.addEventListener("click", () =>
  rueckfrage(
    { titel: "Neue Meldung beginnen?", text: "Der aktuelle Entwurf wird verworfen. Ausgegebene Dateien bleiben erhalten.", ok: "Entwurf verwerfen" },
    () => {
      m = neueMeldung();
      frisch(false);
      hinweisText = "";
      schritt = "meldung";
      speichere();
      zeigeEinfuehrung();
      ansage("Neue Erstmeldung begonnen.");
      zeichne({ ueberschrift: true });
    },
    neuKnopf,
  ),
);
function beispielLaden() {
  m = structuredClone(D.beispiel);
  frisch(true);
  hinweisText = "Beispiel geladen: Erstmeldung des fiktiven Trinkwasser-Zweckverbands im Szenario Orkantief „Ilka“.";
  ansage(hinweisText);
  schritt = "meldung";
  speichere();
  zeigeEinfuehrung();
  zeichne();
}
document.querySelector("#beispiel").addEventListener("click", () => {
  listeZeigen(false);
  if (unberuehrt) return beispielLaden();
  rueckfrage({ titel: "Beispiel laden?", text: "Das Beispiel ersetzt den aktuellen Entwurf. Ausgegebene Dateien bleiben erhalten.", ok: "Entwurf ersetzen" }, beispielLaden, oeffnen);
});
document.querySelector("#vormeldung-waehlen").addEventListener("click", () => {
  listeZeigen(false);
  document.querySelector("#vormeldung").click();
});
document.querySelector("#vormeldung").addEventListener("change", async (ev) => {
  const datei = ev.target.files?.[0];
  ev.target.value = "";
  if (!datei) return;
  try {
    fortschreiben(JSON.parse(await datei.text()));
  } catch (e) {
    hinweisText = `Datei nicht lesbar: ${e.message}`;
    ansage(hinweisText);
    zeichne();
  }
});

zeigeEinfuehrung();
zeichne();