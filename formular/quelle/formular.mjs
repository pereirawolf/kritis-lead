// Betreiberformular KRITIS-LEAD: erfasst eine Betreibermeldung nach LEAD-KRITIS-Meldung-v0.2, prüft sie mit demselben
// Schema und denselben Plausibilitätsregeln wie das Prüfwerkzeug und gibt sie als JSON-Datei aus. Kein Server, keine
// Netzverbindung; ein Entwurf bleibt im Browser dieses Geräts. Gebaut von werkzeuge/bauen/formular-bauen.mjs.
import validate from "virtual:validator";
import { pruefePlausibilitaet } from "../../werkzeuge/pruefen/plausibilitaet.mjs";

const D = window.KRITIS_DATEN;
const S = D.schema;
const DEFS = S.$defs;
const SPEICHER = "kritis-lead-betreiberformular-entwurf";

// ── Werte aus dem Schema ─────────────────────────────
const kopfP = DEFS.kritis_meldekopf.properties;
const betriebP = DEFS.kritis_betrieb.properties;
const E = {
  meldeart: kopfP.meldeart.enum,
  meldeanlass: kopfP.meldeanlass.items.enum,
  gemeldetStatus: kopfP.gemeldet_an.items.properties.status.enum,
  land: S.properties.land.enum.filter((x) => x && x !== "Bund"),
  art: DEFS.sachverhalt.properties.art.items.enum,
  sektor: betriebP.sektor.enum,
  traegerschaft: betriebP.betreiber.properties.traegerschaft.enum.filter(Boolean),
  leistungsgrad: betriebP.ist.properties.leistungsgrad.enum,
  eskalation: betriebP.ist.properties.eskalationsstufe_betrieblich.enum.filter(Boolean),
  messStatus: DEFS.kritis_messwert.properties.status.enum,
  ersatzStatus: DEFS.kritis_ersatzverfahren.properties.status.enum,
  prognoseStatus: DEFS.kritis_prognose.properties.status.enum,
  unsicherheit: DEFS.kritis_prognose.properties.unsicherheit.enum,
  richtung: DEFS.kritis_abhaengigkeit.properties.richtung.enum,
  zustand: DEFS.kritis_abhaengigkeit.properties.zustand.enum,
  bedarfStatus: DEFS.kritis_unterstuetzung.properties.status.enum,
  ursacheStatus: betriebP.ursache.properties.status.enum,
  bestaetigung: betriebP.bestaetigungsgrad.enum,
};
const ANZEIGE = {
  eingeschraenkt: "eingeschränkt", notbetrieb: "Notbetrieb", ausgefallen: "ausgefallen", voll: "voll", unbekannt: "unbekannt",
  belegt: "belegt", geschaetzt: "geschätzt", nicht_zutreffend: "nicht zutreffend", nicht_vorhanden: "nicht vorhanden",
  prognose: "Prognose", keine_prognose_moeglich: "keine Prognose möglich", zielzustand_erreicht: "Zielzustand erreicht",
  nicht_erforderlich: "nicht erforderlich", verfuegbar: "verfügbar", beeintraechtigt: "beeinträchtigt", "": "keine Angabe",
};
const zeige = (w) => ANZEIGE[w] ?? w;

// ── Beschriftungen aus der Darstellungsdatei des Profils ─────
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
const istMesswert = (k) => typeof k?.$ref === "string" && k.$ref.endsWith("/kritis_messwert");
/** Schlüssel des Sektorblocks unter sektor_angaben: der Block, dessen Beschriftung im Sektornamen vorkommt („Telekommunikation“ in „Informationstechnik und Telekommunikation“). */
function sektorSchluessel(sektor) {
  if (!sektor) return null;
  for (const k of Object.keys(DEFS.kritis_sektorangaben.properties)) {
    const l = UI[`sachverhalte[].betrieb.sektor_angaben.${k}`]?.label;
    if (l && sektor.includes(l)) return k;
  }
  return null;
}

// ── Hilfen ───────────────────────────────────────────
const zwei = (n) => String(n).padStart(2, "0");
const jetzt = () => {
  const d = new Date();
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}T${zwei(d.getHours())}:${zwei(d.getMinutes())}`;
};
const heute = () => jetzt().slice(0, 10);
function uuid() {
  if (crypto.randomUUID) return `urn:uuid:${crypto.randomUUID()}`;
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `urn:uuid:${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function neueKennung(land, datum) {
  const praefix = D.praefixe[land] || D.praefixStandard || "DE";
  const tag = (datum || heute()).slice(0, 10).replaceAll("-", "");
  const z = crypto.getRandomValues(new Uint8Array(4));
  return `${praefix}-${tag}-${[...z].map((x) => CROCKFORD[x % 32]).join("")}`;
}
const leererMesswert = (einheit) => ({ wert: null, einheit, status: "unbekannt", stand: "", quelle: "[Q1]" });

function neuerSachverhalt() {
  return {
    kennung: "",
    bezug: [],
    eintritt: "",
    art: [],
    ort: "",
    bezeichnung: "",
    analyse: { lage_ereignis: "", risiken_auswirkungen: "", massnahmen_empfehlungen: "", abhaengigkeiten_interdependenzen: "" },
    sofort: { beurteilung: "", tendenz: "", bewertung_text: "", lagenradar: { d1: null, d2: null, d3: null, d4: null, d5: null, d6: null, d7: null, d8: null } },
    betrieb: {
      betreiber: { name: "", traegerschaft: "" },
      kritische_dienstleistung: "",
      raum: { ars: [], beschreibung: "" },
      ist: { stand: "", leistungsgrad: "", beginn: "", betroffene: { anschluesse: leererMesswert("Anschlüsse"), personen: leererMesswert("Personen"), einrichtungen: [] } },
      ersatzverfahren: [],
      prognose: { stand: "", status: "keine_prognose_moeglich", geber: "", zielzustand: "", fruehestens: "", spaetestens: "", unsicherheit: "", begruendung: "" },
      abhaengigkeiten: [],
      unterstuetzungsbedarf: [],
      bestaetigungsgrad: "vorläufige Eigenangabe",
    },
  };
}

function neueMeldung() {
  const zeichnung = () => ({ name: "", datum: heute(), hz: "" });
  return {
    schema: D.schemaId,
    _status: "final",
    _entstehung: { verfahren: "manuell", werkzeug: `Betreiberformular KRITIS-LEAD ${D.version}` },
    zeitzone: "Europe/Berlin",
    kritis: {
      erweiterung: "lead-kritis/0.2",
      rolle: "Betreiber",
      meldeart: "Erstmeldung",
      meldeanlass: [],
      meldung_id: uuid(),
      bezug_meldung_id: "",
      datenart: "synthetisch",
      vertraulichkeit: { tlp: "CLEAR", einstufung: "", hinweis: "Fiktive Übungsdaten" },
      empfaenger: [],
      gemeldet_an: [],
      rechtsgrundlage_dieser_meldung: "Fiktive Übung; keine Aussage über reale gesetzliche Pflichten",
      kontaktstelle: "",
    },
    land: "",
    meldende_stelle: "",
    meldezeitpunkt: jetzt(),
    meldezeitraum: { von: "", bis: "" },
    quellen: "",
    zeitstrahl: "",
    sachverhalte: [neuerSachverhalt()],
    freigabe: { erfassung: zeichnung(), freigabe: zeichnung(), versand: zeichnung() },
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
// Erklärung „belegt / geschätzt / …“ nur am ersten Messwert eines Schritts (KL-UX-08)
let statusErklaert = false;
try {
  const t = localStorage.getItem(SPEICHER);
  m = t ? JSON.parse(t) : neueMeldung();
  alleZeigen = geladen = !!t;
} catch {
  m = neueMeldung();
}
/** Neue oder geladene Meldung: Sichtbarkeit der Befunde und eingeklappte Elemente zurücksetzen. */
function frisch(istGeladen) {
  alleZeigen = geladen = istGeladen;
  bearbeitet.clear();
  zu.clear();
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

/** Abgeleitete Werte vor Prüfung und Ausgabe: Betreibername, Kennung, Datenstände der Messwerte. */
function ableiten() {
  const sv = m.sachverhalte[0];
  const b = sv.betrieb;
  if (!b.betreiber.name) b.betreiber.name = m.meldende_stelle;
  if (!sv.kennung && m.land) sv.kennung = neueKennung(m.land, sv.eintritt || m.meldezeitpunkt);
  // Bei „nicht zutreffend“ entfällt eine leere Einheit (seit 0.3.2); eine angegebene bleibt
  const ohneLeereEinheit = (w) => { if (w.status === "nicht_zutreffend" && !textWert(w.einheit)) delete w.einheit; };
  for (const k of ["anschluesse", "personen"]) {
    const w = b.ist.betroffene[k];
    if (!w.stand) w.stand = b.ist.stand;
    if (!["belegt", "geschaetzt"].includes(w.status)) w.wert = null;
    ohneLeereEinheit(w);
  }
  if (!b.prognose.stand) b.prognose.stand = b.ist.stand;
  for (const e of b.ersatzverfahren) if (!e.stand) e.stand = b.ist.stand;
  if (m.kritis.meldeart === "Erstmeldung") m.kritis.bezug_meldung_id = "";
  const sa = sektorSchluessel(b.sektor);
  const leer = (v) => v === "" || v == null || (typeof v === "object" && !Array.isArray(v) && Object.values(v).every(leer));
  if (b.sektor_angaben)
    for (const k of Object.keys(b.sektor_angaben)) {
      const block = b.sektor_angaben[k];
      if (k !== sa) { delete b.sektor_angaben[k]; continue; }
      for (const [f, v] of Object.entries(block || {})) {
        if (leer(v)) delete block[f];
        else if (v && typeof v === "object" && "status" in v) {
          if (!v.stand) v.stand = b.ist.stand;
          if (!["belegt", "geschaetzt"].includes(v.status)) v.wert = null;
          if (v.wert === undefined) v.wert = null;
          ohneLeereEinheit(v);
        }
      }
      if (!Object.keys(block || {}).length) delete b.sektor_angaben[k];
    }
  if (b.sektor_angaben && !Object.keys(b.sektor_angaben).length) delete b.sektor_angaben;
}

// ── Prüfung ──────────────────────────────────────────
const register = new Map(); // Pfad "/a/b/0" → { schritt, id, label, kontext }
const zeiger = (pfad) => "/" + teile(pfad).join("/");
const ausZeiger = (z) => z.split("/").filter(Boolean).join(".");
/** Einheitlicher Text eines fehlenden Werts, wie in KI-LEAD (KL-UX-02) */
const FEHLT = "Pflichtangabe fehlt.";
const leerWert = (v) => v == null || v === "" || (Array.isArray(v) && v.length === 0);
// Felder, die das Formular aus anderen Angaben ableitet: Der Befund steht bei dem Feld, das die Person ausfüllt (KL-UX-05)
const ABGELEITET = { "/sachverhalte/0/betrieb/betreiber/name": "/meldende_stelle", "/sachverhalte/0/kennung": "/land" };
// Beschriftungen für Felder, die nicht in einem Schritt mit Register stehen
const BESCHRIFTUNG = { "/kritis/meldung_id": "Meldungs-ID", "/kritis/vertraulichkeit/tlp": "TLP", "/kritis/datenart": "Datenart", "/kritis/vertraulichkeit/hinweis": "Hinweis zur Vertraulichkeit" };

function text(e) {
  const p = e.params || {};
  switch (e.keyword) {
    case "required":
      return FEHLT;
    case "minLength":
      return "darf nicht leer sein";
    case "pattern":
      if (p.pattern === "\\S") return "darf nicht leer sein";
      if (String(p.pattern).includes("T\\d{2}:\\d{2}")) return "Datum und Uhrzeit fehlen oder haben nicht die Form TT.MM.JJJJ hh:mm";
      if (String(p.pattern).includes("urn:uuid")) return "ID hat nicht die Form urn:uuid:…";
      if (String(p.pattern).startsWith("^\\d{2}")) return "Regionalschlüssel mit 2, 3, 5, 9 oder 12 Ziffern";
      return "Form stimmt nicht";
    case "enum":
      return "bitte einen der vorgesehenen Werte wählen";
    case "const":
      return p.allowedValue === "" ? "muss leer bleiben" : `muss „${p.allowedValue}“ sein`;
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
  if (/^\/kritis\/(meldung_id|vertraulichkeit|datenart)/.test(z)) return "pruefen";
  if (/^\/sachverhalte\/\d+\/betrieb\/(ersatzverfahren|prognose|abhaengigkeiten|unterstuetzungsbedarf|bcm|ursache|bestaetigungsgrad)/.test(z)) return "ersatz";
  if (/^\/sachverhalte\/\d+\/betrieb/.test(z)) return "dienstleistung";
  if (/^\/sachverhalte/.test(z)) return "lage";
  if (/^\/(quellen|zeitstrahl)/.test(z)) return "quellen";
  if (/^\/freigabe/.test(z)) return "pruefen";
  return "meldung";
}

function pruefe() {
  ableiten();
  const ok = validate(m);
  const befunde = (validate.errors || [])
    .filter((e) => e.keyword !== "if")
    .map((e) => {
      const roh = e.keyword === "required" ? `${e.instancePath}/${e.params.missingProperty}` : e.instancePath || "/";
      // Leerer Wert: einheitlich „Pflichtangabe fehlt.“, gleich welche Schemaregel greift
      const fehlt = e.keyword === "required" || (roh !== "/" && leerWert(hole(ausZeiger(roh))));
      return { stufe: "fehler", pfad: ABGELEITET[roh] ?? roh, text: fehlt ? FEHLT : text(e), fehlt };
    });
  // je Feld ein Befund (KL-UX-05, wie KI-LEAD UX-2026-W44-11): der erste, ein fehlender Wert vor anderen Regeln
  const jeFeld = new Map();
  for (const b of befunde) {
    const alt = jeFeld.get(b.pfad);
    if (!alt || (b.fehlt && !alt.fehlt)) jeFeld.set(b.pfad, b);
  }
  const eindeutig = [...jeFeld.values()];
  const plausibel = ok ? pruefePlausibilitaet(m) : [];
  return { schemaOk: !!ok, befunde: [...eindeutig, ...plausibel.map((b) => ({ ...b, text: `${b.text} (${b.regel})` }))] };
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

function rahmen(pfad, label, eingabe, { hinweis, pflicht, id, labelVersteckt } = {}) {
  register.set(zeiger(pfad), { schritt, id, label });
  eingabe.dataset.fokus = zeiger(pfad);
  if (hinweis) eingabe.setAttribute("aria-describedby", `${id}-h`);
  if (pflicht) eingabe.setAttribute("aria-required", "true");
  return el("div", { class: "feld", "data-pfad": zeiger(pfad) }, el("label", { class: `feld-label${pflicht ? " pflicht" : ""}${labelVersteckt ? " sr" : ""}`, for: id }, label), eingabe, hinweis && hinweisElement(`${id}-h`, hinweis, zeiger(pfad), label));
}

/** Rahmen für Gruppen von Optionsfeldern und Kontrollkästchen: Legende, Hinweis und Fehler hängen an der Gruppe. */
function gruppenrahmen(pfad, label, inhalt, opt, id) {
  register.set(zeiger(pfad), { schritt, id, label });
  return el(
    "fieldset",
    { class: "feld", "data-pfad": zeiger(pfad), "aria-describedby": opt.hinweis ? `${id}-h` : undefined },
    el("legend", { class: `feld-label${opt.pflicht ? " pflicht" : ""}` }, label),
    inhalt,
    opt.hinweis && hinweisElement(`${id}-h`, opt.hinweis, zeiger(pfad), label),
  );
}

function textfeld(pfad, label, opt = {}) {
  [label, opt] = beschriftet(pfad, label, opt);
  const id = neueId();
  const typ = opt.typ || "text";
  const wert = hole(pfad);
  const attrs = { id, type: typ === "lang" ? undefined : typ, value: wert ?? "", placeholder: opt.platzhalter, readonly: opt.nurLesen, disabled: opt.gesperrt };
  const leseWert = (t) => {
    if (opt.typ === "number") return t.value === "" ? null : Number(t.value);
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
  return rahmen(pfad, label, eingabe, { ...opt, id });
}
const zeitfeld = (pfad, label, opt = {}) => textfeld(pfad, label, { ...opt, typ: "datetime-local" });

function auswahl(pfad, label, werte, opt = {}) {
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
  const gruppe = el(
    "div",
    { class: "segmente", role: "radiogroup", id, "aria-label": label, "aria-required": opt.pflicht ? "true" : undefined },
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
const textWert = (v) => (v == null ? "" : String(v).trim());
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
              el("button", { type: "button", class: "knopf leise klein", "data-fokus": `${z}#entfernen${i}`, "aria-label": `${name} ${i + 1} entfernen`, onclick: () => { hole(pfad).splice(i, 1); zuNachEntfernen(z, i); aenderung(true); } }, "entfernen"),
            ),
          ),
          el("div", { id: inhaltId, class: "element-inhalt", hidden: geschlossen }, felder(`${pfad}.${i}`)),
        );
      }),
    ),
    el("button", { type: "button", class: "knopf klein", "data-fokus": `${z}#neu`, onclick: () => { setze(pfad, [...(hole(pfad) || []), neu()]); const n = hole(pfad).length - 1; zu.set(`${z}/${n}`, false); aenderung(true, `${z}/${n}`); } }, opt.hinzufuegen || "hinzufügen"),
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
    eintraege.map((_, i) =>
      el(
        "div",
        { class: "textliste-zeile" },
        textfeld(`${pfad}.${i}`, `${opt.label || name} ${i + 1}`, { eigen: true, platzhalter: opt.platzhalter, hinweis: "", labelVersteckt: true }),
        el("button", { type: "button", class: "knopf leise klein", "data-fokus": `${z}#entfernen${i}`, "aria-label": `${name} ${i + 1} entfernen`, onclick: () => { hole(pfad).splice(i, 1); aenderung(true); } }, "entfernen"),
      ),
    ),
    el("button", { type: "button", class: "knopf klein", "data-fokus": `${z}#neu`, onclick: () => { setze(pfad, [...(hole(pfad) || []), ""]); aenderung(true, `${z}/${hole(pfad).length - 1}`); } }, opt.hinzufuegen || "hinzufügen"),
  );
}

/**
 * Quelle eines Messwerts oder einer Zeitstrahlzeile als Auswahl der Einträge im Quellenverzeichnis (seit 0.3.1, KL-UX-09).
 * Gespeichert wird wie bisher die Marke „[Qn]“; ein anderer vorhandener Wert bleibt als Option erhalten.
 */
function quellenOptionen(aktuell) {
  const eintraege = (m.quellen || "")
    .split("\n")
    .map((z) => z.match(/^\s*(\[Q\d+\])\s*(.*)$/))
    .filter(Boolean)
    .map(([, marke, rest]) => [marke, `${marke} ${rest.length > 70 ? `${rest.slice(0, 69)}…` : rest}`]);
  if (!eintraege.some(([w]) => w === "[Q1]")) eintraege.unshift(["[Q1]", "[Q1] (noch nicht im Quellenverzeichnis)"]);
  if (aktuell && !eintraege.some(([w]) => w === aktuell)) eintraege.push([aktuell, aktuell]);
  return eintraege;
}
function quellenAuswahl(pfad, label = "Quelle") {
  const id = neueId();
  const aktuell = hole(pfad) ?? "";
  const s = el(
    "select",
    { id, onchange: (ev) => { setze(pfad, ev.target.value || undefined); aenderung(false); } },
    el("option", { value: "" }, "– keine Angabe –"),
    quellenOptionen(aktuell).map(([w, t]) => el("option", { value: w }, t)),
  );
  s.value = aktuell;
  return rahmen(pfad, label, s, { id });
}

/**
 * Messwert (kritis_messwert): Status, Wert, Einheit, Datenstand, Quelle, Hinweis. Seit 0.3.1 (KL-UX-08) erscheint der
 * Wert nur bei „belegt“ und „geschätzt“ und wird beim Wechsel zu einem anderen Status geleert; bei „nicht zutreffend“
 * entfallen auch Einheit (seit 0.3.2; das Schema verlangt sie dann nicht), Datenstand und Quelle. Die Erklärung der Status steht nur am ersten Messwert eines Schritts.
 */
function messwert(pfad, titel, opt = {}) {
  const u = uiEintrag(pfad);
  const status = hole(`${pfad}.status`);
  const mitZahl = ["belegt", "geschaetzt"].includes(status);
  const zutreffend = status !== "nicht_zutreffend";
  const erklaerung = statusErklaert ? "" : "belegt = gezählt oder gemessen; geschätzt = hochgerechnet; unbekannt = geprüft, nicht feststellbar.";
  statusErklaert = true;
  // Optionaler Messwert (etwa in den Sektorangaben): „keine Angabe“ nimmt ihn ganz zurück; ohne Status nur die Auswahl
  const optional = !schemaInfo(pfad).pflicht;
  const statusFeld = segmente(`${pfad}.status`, "Status", DEFS.kritis_messwert.properties.status.enum, {
    hinweis: erklaerung,
    keineAngabe: optional ? () => setze(pfad, undefined) : undefined,
    danach: (w) => { if (!["belegt", "geschaetzt"].includes(w) && hole(`${pfad}.wert`) != null) setze(`${pfad}.wert`, null); },
  });
  if (optional && !status) return gruppe(u.label ?? titel, u.hinweis && el("p", { class: "hinweis" }, u.hinweis), statusFeld);
  return gruppe(
    u.label ?? titel,
    u.hinweis && el("p", { class: "hinweis" }, u.hinweis),
    statusFeld,
    zeile(
      mitZahl && textfeld(`${pfad}.wert`, "Wert", { typ: "number", hinweis: "" }),
      zutreffend && textfeld(`${pfad}.einheit`, "Einheit", { platzhalter: opt.einheit, hinweis: "" }),
      zutreffend && zeitfeld(`${pfad}.stand`, "Datenstand", { hinweis: "leer = Datenstand des Istzustands" }),
    ),
    zeile(zutreffend && quellenAuswahl(`${pfad}.quelle`), textfeld(`${pfad}.hinweis`, "Hinweis (optional)", { platzhalter: opt.hinweis, hinweis: "" })),
  );
}

/**
 * Feld aus dem Schema: Messwert, Auswahl, Zahl, Datum, Zeit, Text, Liste oder Gruppe – mit Beschriftung aus der
 * Darstellungsdatei. So erscheinen neue Felder des Meldeprofils (etwa ein weiterer Sektorblock) ohne Programmänderung.
 */
function schemaFeld(pfad, roh, opt = {}) {
  const k = aufloesen(roh);
  const u = uiEintrag(pfad);
  const typen = [].concat(k.type || []);
  if (istMesswert(roh)) return messwert(pfad, u.label || teile(pfad).at(-1));
  if (k.enum) {
    const werte = k.enum;
    return werte.length <= 6 && u.widget !== "auswahl" ? segmente(pfad, u.label, werte, opt) : auswahl(pfad, u.label, werte.filter((w) => w !== ""), opt);
  }
  if (typen.includes("object") || k.properties) {
    const kinder = Object.entries(k.properties || {}).map(([n, s]) => schemaFeld(`${pfad}.${n}`, s));
    return u.layout === "zeile" ? gruppe(u.label || "", zeile(...kinder)) : gruppe(u.label || "", u.hinweis && el("p", { class: "hinweis" }, u.hinweis), ...kinder);
  }
  if (typen.includes("array")) {
    const it = aufloesen(k.items);
    if (it.properties) return liste(pfad, u.label, () => ({}), (p) => Object.entries(it.properties).map(([n, s]) => schemaFeld(`${p}.${n}`, s)), {});
    return textliste(pfad, u.label, { label: uiEintrag(`${pfad}.0`).label || u.label });
  }
  if (typen.includes("number") || typen.includes("integer")) return textfeld(pfad, u.label, { typ: "number", ganzzahl: typen.includes("integer") });
  const muster = String(k.pattern || "");
  if (muster.includes("T\\d{2}:\\d{2}")) return zeitfeld(pfad, u.label);
  if (muster.includes("\\d{4}-\\d{2}-\\d{2}")) return textfeld(pfad, u.label, { typ: "date" });
  return textfeld(pfad, u.label);
}

// ── Schritte ─────────────────────────────────────────
const SV = "sachverhalte.0";
const B = `${SV}.betrieb`;
const SCHRITTE = [
  { id: "meldung", titel: "Meldung und Betreiber" },
  { id: "dienstleistung", titel: "Dienstleistung und Istzustand" },
  { id: "ersatz", titel: "Ersatz, Prognose und Bedarf" },
  { id: "lage", titel: "Lage und Einschätzung" },
  { id: "quellen", titel: "Quellen und Zeitstrahl" },
  { id: "pruefen", titel: "Freigabe, Prüfen und Ausgabe" },
];

function schrittMeldung() {
  const k = m.kritis;
  const folge = k.meldeart !== "Erstmeldung";
  return [
    el("p", { class: "einleitung" }, "Art und Anlass der Meldung und wer meldet. Für eine Folge-, Korrektur- oder Abschlussmeldung laden Sie Ihre letzte Meldung über „Vormeldung fortschreiben“; das Formular übernimmt die Angaben und setzt den Bezug."),
    segmente("kritis.meldeart", "Meldeart", E.meldeart, { pflicht: true }),
    // Seit 0.3.1 (KL-UX-11): ohne geladene Vormeldung den Weg dorthin an der Auswahl anbieten
    folge &&
      !k.bezug_meldung_id &&
      el(
        "div",
        { class: "lese vormeldung-angebot" },
        el("p", {}, `Für eine ${k.meldeart} übernimmt das Formular die Angaben Ihrer letzten Meldung und setzt den Bezug.`),
        el("button", { type: "button", class: "knopf klein", "data-fokus": "aktion:vormeldung", onclick: () => document.querySelector("#vormeldung").click() }, "Vormeldung laden"),
      ),
    folge && textfeld("kritis.bezug_meldung_id", "Bezug auf Meldung", { pflicht: true, platzhalter: "urn:uuid:…", hinweis: "Meldungs-ID der Meldung, die fortgeschrieben, berichtigt oder abgeschlossen wird. Beim Fortschreiben trägt das Formular sie ein." }),
    chips("kritis.meldeanlass", "Meldeanlass", E.meldeanlass, { pflicht: true }),
    zeile(zeitfeld("meldezeitpunkt", "Meldezeitpunkt", { pflicht: true }), zeitfeld("meldezeitraum.von", "Berichtszeitraum von", { eigen: true }), zeitfeld("meldezeitraum.bis", "Berichtszeitraum bis", { eigen: true })),
    zeile(
      textfeld("meldende_stelle", "Betreiber (meldende Stelle)", { pflicht: true, danach: (v) => { m.sachverhalte.forEach((sv) => (sv.betrieb.betreiber.name = v)); }, platzhalter: "z. B. Netzbetreiber Nord (FIKTIV)", hinweis: "Im Demonstrator nur fiktive Namen." }),
      auswahl("land", "Land", E.land, { eigen: true, pflicht: true, neuZeichnen: true, danach: () => { m.sachverhalte[0].kennung = ""; } }),
    ),
    segmente(`${B}.betreiber.traegerschaft`, "Trägerschaft", E.traegerschaft),
    textfeld("kritis.kontaktstelle", "Kontaktstelle (Funktionsadresse, keine Person)", { platzhalter: "z. B. Leitwarte, 24 h besetzt" }),
    textliste("kritis.empfaenger", "Empfänger", { label: "Empfänger", element: "Empfänger", hinzufuegen: "Empfänger hinzufügen", platzhalter: "z. B. Landkreis …, Krisenstab (Übungsrolle, FIKTIV)" }),
    liste(
      "kritis.gemeldet_an",
      "Parallele Pflichtmeldungen (nur dokumentiert)",
      () => ({ stelle: "", rechtsgrundlage: "", status: "erfolgt", zeitpunkt: "", kennzeichen: "" }),
      (p) => [zeile(textfeld(`${p}.stelle`, "Stelle"), textfeld(`${p}.rechtsgrundlage`, "Rechtsgrundlage", { platzhalter: "z. B. § 168 TKG" })), segmente(`${p}.status`, "Status", E.gemeldetStatus), zeile(zeitfeld(`${p}.zeitpunkt`, "Zeitpunkt"), textfeld(`${p}.kennzeichen`, "Kennzeichen"))],
      { element: "Pflichtmeldung", hinzufuegen: "Pflichtmeldung hinzufügen", hinweis: "Diese Meldung ersetzt keine gesetzliche Meldung. Leere Liste: keine dokumentiert.", kurz: (e) => [e.stelle, e.rechtsgrundlage, zeige(e.status)] },
    ),
    // Kennzeichnung (Meldungs-ID, TLP, Datenart) steht seit 0.3.1 in Schritt 6 (KL-UX-10)
  ];
}

function schrittDienstleistung() {
  const b = m.sachverhalte[0].betrieb;
  // Sektorangaben aus dem Schema: der Block zum gewählten Sektor, Felder und Beschriftungen aus Schema und Darstellungsdatei
  const sektorGruppe = () => {
    const sa = sektorSchluessel(b.sektor);
    if (!sa) return b.sektor ? el("p", { class: "hinweis" }, `Für „${b.sektor}“ sieht das Meldeprofil keine Sektorangaben vor; es gilt der gemeinsame Kern.`) : null;
    const p = `${B}.sektor_angaben.${sa}`;
    const block = DEFS.kritis_sektorangaben.properties[sa];
    return gruppe(
      `${uiEintrag(`${B}.sektor_angaben`).label || "Sektorangaben"}: ${uiEintrag(p).label || sa}`,
      el("p", { class: "hinweis" }, "Optional. Ein Messwert zählt erst, wenn ein Status gewählt ist und, außer bei „nicht zutreffend“, eine Einheit; „keine Angabe“ nimmt ihn zurück, leere Angaben entfallen bei der Ausgabe."),
      ...Object.entries(aufloesen(block).properties).map(([n, sch]) => schemaFeld(`${p}.${n}`, sch)),
    );
  };
  return [
    el("p", { class: "einleitung" }, "Welche Dienstleistung ist betroffen, in welchem Gebiet, seit wann und wie stark? Jede Angabe gilt zu einem Datenstand: dem Zeitpunkt, zu dem sie zutraf."),
    zeile(auswahl(`${B}.sektor`, "Sektor (§ 4 Abs. 1 KRITISDachG)", E.sektor, { pflicht: true, neuZeichnen: true, leerAlsFehlend: true }), textfeld(`${B}.kritische_dienstleistung`, "Kritische Dienstleistung", { pflicht: true, platzhalter: "z. B. Trinkwasserversorgung" })),
    gruppe(uiEintrag(`${B}.anlage`).label || "Anlage", zeile(textfeld(`${B}.anlage.bezeichnung`, "Bezeichnung"), textfeld(`${B}.anlage.kennung_betreiber`, "Kennung des Betreibers"))),
    gruppe(
      "Betroffener Raum",
      textliste(`${B}.raum.ars`, "Regionalschlüssel (ARS)", { label: "Schlüssel", element: "Schlüssel", hinzufuegen: "Schlüssel hinzufügen", platzhalter: "z. B. 16072" }),
      textfeld(`${B}.raum.beschreibung`, "Beschreibung des Versorgungsgebiets", { pflicht: true }),
      textfeld(`${B}.raum.anteil_gebiet_prozent`, "Anteil am Gebiet in % (optional)", { typ: "number" }),
    ),
    gruppe(
      "Istzustand",
      zeile(zeitfeld(`${B}.ist.stand`, "Datenstand", { pflicht: true }), zeitfeld(`${B}.ist.beginn`, "Ausfallbeginn", { hinweis: "leer, wenn die Leistung nicht eingeschränkt ist" })),
      segmente(`${B}.ist.leistungsgrad`, "Leistungsgrad", E.leistungsgrad, { pflicht: true }),
      zeile(textfeld(`${B}.ist.leistungsgrad_prozent`, "Leistungsgrad in % (optional)", { typ: "number" }), textfeld(`${B}.ist.leistungsbasis`, "Bezug des Prozentwerts", { hinweis: "Pflicht, wenn ein Prozentwert angegeben ist." })),
      schemaFeld(`${B}.ist.eskalationsstufe_betrieblich`, betriebP.ist.properties.eskalationsstufe_betrieblich, {
        hinweis: "Ihre eigene Einstufung nach Bewältigungsfähigkeit und Planlage (BSI-Standard 200-4): Störung = im Normalbetrieb behebbar; Notfall = zeitkritischer Prozess nicht innerhalb seiner MTPD im Normalbetrieb wiederherstellbar, Pläne vorhanden; Krise = im Normalbetrieb nicht beherrschbar, Pläne greifen nicht oder nur bedingt.",
      }),
    ),
    messwert(`${B}.ist.betroffene.anschluesse`, "Betroffene Anschlüsse", { einheit: "z. B. Netzanschlüsse ohne Versorgung" }),
    messwert(`${B}.ist.betroffene.personen`, "Betroffene Personen", { einheit: "z. B. Bewohnerinnen und Bewohner" }),
    textliste(`${B}.ist.betroffene.einrichtungen`, "Einrichtungen mit besonderem Bedarf", { label: "Einrichtung", element: "Einrichtung", hinzufuegen: "Einrichtung hinzufügen" }),
    sektorGruppe(),
  ];
}

function schrittErsatz() {
  const b = m.sachverhalte[0].betrieb;
  const ps = b.prognose.status;
  const mitBcm = !!b.bcm;
  const mitUrsache = !!b.ursache;
  return [
    el("p", { class: "einleitung" }, "Wie überbrücken Sie den Ausfall, wann rechnen Sie mit dem Wiederanlauf, und welche Unterstützung brauchen Sie? Halten Sie dabei auseinander: den Istzustand (vorheriger Schritt), Ihre Prognose und Planwerte aus der Vorsorge. Eine Reichweite gilt nur mit ihrer Bedingung; die Nennlaufzeit etwa eines Aggregats ist keine Reichweite."),
    liste(
      `${B}.ersatzverfahren`,
      "Ersatzverfahren",
      () => ({ art: "", status: "eingesetzt", traegt_leistungsgrad_prozent: null, reichweite_bis: "", bedingung: "", stand: "" }),
      (p) => [
        textfeld(`${p}.art`, "Art", { platzhalter: "z. B. Notstromaggregat Pumpwerk" }),
        auswahl(`${p}.status`, "Status", E.ersatzStatus),
        zeile(zeitfeld(`${p}.reichweite_bis`, "Reichweite bis"), textfeld(`${p}.traegt_leistungsgrad_prozent`, "trägt Leistungsgrad in %", { typ: "number" }), zeitfeld(`${p}.stand`, "Datenstand", { hinweis: "leer = Datenstand des Istzustands" })),
        textfeld(`${p}.bedingung`, "Bedingung der Reichweite", { platzhalter: "z. B. ohne Nachbetankung, bei Normalverbrauch" }),
      ],
      { element: "Ersatzverfahren", hinzufuegen: "Ersatzverfahren hinzufügen", kurz: (e) => [e.art, zeige(e.status), e.reichweite_bis && `Reichweite bis ${zeitKurz(e.reichweite_bis)}`] },
    ),
    gruppe(
      "Prognose Wiederanlauf",
      segmente(`${B}.prognose.status`, "Status", E.prognoseStatus, { pflicht: true, danach: (w) => { if (w === "keine_prognose_moeglich") Object.assign(b.prognose, { fruehestens: "", spaetestens: "" }); } }),
      ps !== "keine_prognose_moeglich" && zeile(textfeld(`${B}.prognose.geber`, "Prognosegeber", { pflicht: ps === "prognose" }), textfeld(`${B}.prognose.zielzustand`, "Zielzustand", { pflicht: ps === "prognose", platzhalter: "z. B. Versorgung aller Anschlüsse wiederhergestellt" })),
      ps === "prognose" && zeile(zeitfeld(`${B}.prognose.fruehestens`, "frühestens"), zeitfeld(`${B}.prognose.spaetestens`, "spätestens")),
      ps === "prognose" && segmente(`${B}.prognose.unsicherheit`, "Unsicherheit", E.unsicherheit.filter(Boolean)),
      textfeld(`${B}.prognose.begruendung`, "Begründung"),
      zeitfeld(`${B}.prognose.stand`, "Datenstand", { hinweis: "leer = Datenstand des Istzustands" }),
    ),
    liste(
      `${B}.unterstuetzungsbedarf`,
      "Unterstützungsbedarf",
      () => ({ leistung: "", menge: "", bis: "", adressat: "", status: "angefordert" }),
      (p) => [zeile(textfeld(`${p}.leistung`, "Leistung"), textfeld(`${p}.menge`, "Menge")), zeile(zeitfeld(`${p}.bis`, "benötigt bis"), textfeld(`${p}.adressat`, "Adressat")), segmente(`${p}.status`, "Status", E.bedarfStatus)],
      { element: "Bedarf", hinzufuegen: "Bedarf hinzufügen", kurz: (e) => [e.leistung, e.menge, zeige(e.status), e.bis && `bis ${zeitKurz(e.bis)}`] },
    ),
    liste(
      `${B}.abhaengigkeiten`,
      "Abhängigkeiten",
      () => ({ dienstleistung: "", richtung: "eingehend", zustand: "verfuegbar", puffer: "", betroffene_stelle: "" }),
      (p) => [zeile(textfeld(`${p}.dienstleistung`, "Dienstleistung", { platzhalter: "z. B. Stromverteilung" }), textfeld(`${p}.betroffene_stelle`, "Stelle")), segmente(`${p}.richtung`, "Richtung", E.richtung), segmente(`${p}.zustand`, "Zustand", E.zustand), textfeld(`${p}.puffer`, "Puffer", { platzhalter: "z. B. Notstrom bis 16.10., 10:00 Uhr" })],
      { element: "Abhängigkeit", hinzufuegen: "Abhängigkeit hinzufügen", hinweis: "Eingehend: wovon der Betrieb abhängt. Ausgehend: wer vom Betrieb abhängt.", kurz: (e) => [e.dienstleistung, e.richtung, zeige(e.zustand)] },
    ),
    gruppe(
      "BCM (optional)",
      el("label", {}, el("input", { type: "checkbox", checked: mitBcm, "data-fokus": "schalter:bcm", onchange: (ev) => { if (ev.target.checked) b.bcm = {}; else delete b.bcm; aenderung(true); } }), " Angaben aus dem betrieblichen Kontinuitätsmanagement machen"),
      // Felder, Beschriftungen und Hinweise nach Meldeprofil (Begriffe nach BSI-Standard 200-4)
      ...(mitBcm ? Object.entries(aufloesen(betriebP.bcm).properties).map(([n, sch]) => schemaFeld(`${B}.bcm.${n}`, sch)) : []),
      el("p", { class: "hinweis" }, "Planwerte sind keine Zusage und keine Prognose. Keine Inhalte aus Notfallplänen, Netzplänen oder Alarmierungslisten."),
    ),
    gruppe(
      "Ursache (optional)",
      el("label", {}, el("input", { type: "checkbox", checked: mitUrsache, "data-fokus": "schalter:ursache", onchange: (ev) => { if (ev.target.checked) b.ursache = { kurz: "", status: "vorläufig" }; else delete b.ursache; aenderung(true); } }), " vorläufige Ursache angeben"),
      mitUrsache && zeile(textfeld(`${B}.ursache.kurz`, "Ursache"), auswahl(`${B}.ursache.status`, "Status", E.ursacheStatus)),
    ),
    segmente(`${B}.bestaetigungsgrad`, "Bestätigungsgrad", E.bestaetigung, { pflicht: true }),
  ];
}

const KENNSAETZE = ["Neubewertung bei:", "Handlungsrelevant bis:", "Änderung zur Vormeldung:", "Abschluss im Lagebild:"];
function schrittLage() {
  const sv = m.sachverhalte[0];
  const kennsatz = (k) =>
    el("button", {
      type: "button",
      class: "knopf klein",
      "data-fokus": `kennsatz:${k}`,
      "aria-label": `Kennsatz einfügen: ${k}`,
      onclick: () => {
        const t = sv.sofort.bewertung_text || "";
        sv.sofort.bewertung_text = `${t}${t && !t.endsWith("\n") ? "\n" : ""}${k} `;
        // Fokus ans Ende des Textfelds, damit nach dem Kennsatz weitergeschrieben werden kann
        aenderung(true, `/${SV.replaceAll(".", "/")}/sofort/bewertung_text`);
      },
    }, k);
  return [
    el("p", { class: "einleitung" }, "Beschreiben Sie die Lage aus Sicht Ihres Betriebs in Worten. Belege verweisen mit [Q1], [Q2] … auf das Quellenverzeichnis im nächsten Schritt."),
    zeile(textfeld(`${SV}.bezeichnung`, "Bezeichnung", { pflicht: true, platzhalter: "kurz: was, wo, Folge" }), textfeld(`${SV}.kennung`, "Kennung", { nurLesen: true, hinweis: "vergibt das Formular nach Wahl des Landes; bleibt bei der Fortschreibung gleich" })),
    zeile(zeitfeld(`${SV}.eintritt`, "Eintritt", { eigen: true, pflicht: true }), textfeld(`${SV}.ort`, "Ort", { pflicht: true })),
    textliste(`${SV}.bezug`, "Bezug (Kennungen)", { label: "Kennung", element: "Kennung", hinzufuegen: "Kennung hinzufügen", hinweis: "Kennungen anderer Sachverhalte, auf die sich diese Meldung bezieht, etwa die eines Netzbetreibers, von dessen Ausfall der eigene Betrieb abhängt. Meist leer." }),
    chips(`${SV}.art`, "Ereignisart", E.art, { eigen: true, pflicht: true }),
    textfeld(`${SV}.analyse.lage_ereignis`, "Lage & Ereignis", { typ: "lang", pflicht: true, hinweis: "Was ist zum Datenstand der Fall? Zahlen mit Einheit und Stand." }),
    textfeld(`${SV}.analyse.risiken_auswirkungen`, "Risiken & Auswirkungen", { typ: "lang", pflicht: true, hinweis: "Was droht, wenn Puffer enden? Mögliche Entwicklungen als solche kennzeichnen." }),
    textfeld(`${SV}.analyse.massnahmen_empfehlungen`, "Maßnahmen & Bedarf", { eigen: true, typ: "lang", pflicht: true, hinweis: "Eigene Maßnahmen mit Status und Stand; Unterstützungsbedarf." }),
    textfeld(`${SV}.analyse.abhaengigkeiten_interdependenzen`, "Abhängigkeiten & Interdependenzen", { typ: "lang", pflicht: true, hinweis: "Wirkungskette mit Puffer und Reichweite." }),
    textfeld(`${SV}.sofort.bewertung_text`, "Betriebliche Einschätzung mit Kennsätzen", { eigen: true, typ: "lang", zeilen: 6, platzhalter: "", hinweis: "Was bedeutet die Lage für Ihre Dienstleistung, und was müsste sich ändern, damit sie wieder voll erbracht wird? Kennsätze fügen die Knöpfe unten ein, je Kennsatz eine Zeile." }),
    el("div", { class: "mehrfach" }, KENNSAETZE.map(kennsatz)),
  ];
}

function schrittQuellen() {
  const sv = m.sachverhalte[0];
  const vorschlag = () => {
    const d = (m.sachverhalte[0].betrieb.ist.stand || m.meldezeitpunkt || jetzt()).slice(0, 10).split("-").reverse().join(".");
    const z = `[Q1] B – ${m.meldende_stelle || "Betreiber"} (${d}): Betriebsangaben der Leitwarte (betriebsintern, FIKTIV) [Zugriff: ${d}]`;
    m.quellen = m.quellen ? `${m.quellen}\n${z.replace("[Q1]", `[Q${(m.quellen.match(/^\s*\[Q\d+\]/gm) || []).length + 1}]`)}` : z;
    aenderung(true, "/quellen");
  };
  const neu = { zeit: "", typ: D.zeitstrahlTypen[0], text: "", quelle: "[Q1]" };
  const anfuegen = () => {
    const n = (m.zeitstrahl.match(/^\s*\[Z\d+\]/gm) || []).length + 1;
    const z = `[Z${n}] ${neu.zeit || m.meldezeitpunkt} · ${sv.kennung || "KENNUNG"} · ${neu.typ} – ${neu.text} ${neu.quelle} · aufgenommen ${m.meldezeitpunkt}`;
    m.zeitstrahl = m.zeitstrahl ? `${m.zeitstrahl}\n${z}` : z;
    ansage(`Zeile Z${n} an den Zeitstrahl angefügt.`);
    aenderung(true, "/zeitstrahl");
  };
  return [
    el("p", { class: "einleitung" }, "Worauf beruhen Ihre Angaben? Je Quelle ein Eintrag, nummeriert in der Reihenfolge der ersten Nennung; eigene Betriebsangaben haben die Kategorie B, einen Eintrag dafür schlägt der Knopf unter dem Feld vor. Im Zeitstrahl darunter steht je eingetretenem Ereignis eine Zeile."),
    textfeld("quellen", "Quellenverzeichnis", { eigen: true, typ: "lang", zeilen: 5, pflicht: true, hinweis: "Form je Eintrag: [Qn] Kategorie – Herausgeber (Datum): Titel [Zugriff: TT.MM.JJJJ]. Kategorien: B = Betreiber, auch eigene Angaben; A = amtlich; W = wissenschaftlich; M = Medien; P = sonstige private Quellen.", platzhalter: "[Q1] B – Betreiber (TT.MM.JJJJ): Titel (betriebsintern, FIKTIV) [Zugriff: TT.MM.JJJJ]" }),
    el("button", { type: "button", class: "knopf klein", "data-fokus": "aktion:quelle", onclick: vorschlag }, "Eintrag aus Betreiberangaben vorschlagen"),
    el("hr", { style: "border:none;border-top:1px solid var(--linie-zart);margin:1.25rem 0" }),
    textfeld("zeitstrahl", "Zeitstrahl", { typ: "lang", zeilen: 5, hinweis: "Am einfachsten über „Zeile anfügen“. Form je Zeile: [Zn] JJJJ-MM-TTThh:mm · Kennung · Typ – Kurztext [Qn] · aufgenommen JJJJ-MM-TTThh:mm" }),
    gruppe(
      "Zeile anfügen",
      zeile(
        el("div", { class: "feld" }, el("label", { class: "feld-label", for: "zs-zeit" }, "Zeitpunkt"), el("input", { id: "zs-zeit", type: "datetime-local", oninput: (e) => (neu.zeit = e.target.value) })),
        el("div", { class: "feld" }, el("label", { class: "feld-label", for: "zs-typ" }, "Typ"), el("select", { id: "zs-typ", onchange: (e) => (neu.typ = e.target.value) }, D.zeitstrahlTypen.map((t) => el("option", { value: t }, t)))),
        el("div", { class: "feld" }, el("label", { class: "feld-label", for: "zs-quelle" }, "Quelle"), el("select", { id: "zs-quelle", onchange: (e) => (neu.quelle = e.target.value) }, quellenOptionen("[Q1]").map(([w, t]) => el("option", { value: w }, t)))),
      ),
      el("div", { class: "feld" }, el("label", { class: "feld-label", for: "zs-text" }, "Kurztext"), el("input", { id: "zs-text", type: "text", oninput: (e) => (neu.text = e.target.value) })),
      el("button", { type: "button", class: "knopf klein", "data-fokus": "aktion:zeile", onclick: anfuegen }, "Zeile anfügen"),
    ),
  ];
}

const offenText = (n) => `${n} ${n === 1 ? "Angabe" : "Angaben"} offen`;

function dateiname() {
  const kurz = (m.meldende_stelle || "Betreiber").replace(/\(FIKTIV\)/g, "").trim().replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return `${(m.meldezeitpunkt || jetzt()).replace(":", "-")}_KRITIS-Meldung_${kurz}_${m.kritis.meldeart}_FIKTIV.json`;
}

function schrittPruefen() {
  const { schemaOk, befunde } = pruefe();
  const fehler = befunde.filter((b) => b.stufe === "fehler");
  const ausgeben = () => {
    ableiten();
    const blob = new Blob([JSON.stringify(m, null, 2) + "\n"], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: dateiname() });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    hinweisText = `Ausgegeben: ${dateiname()}`;
    ansage(hinweisText);
    zeichne();
  };
  const zeichnung = (k, titel) => gruppe(titel, zeile(textfeld(`freigabe.${k}.name`, "Funktion", { eigen: true, hinweis: "Funktion statt Name" }), textfeld(`freigabe.${k}.datum`, "Datum", { typ: "date" }), textfeld(`freigabe.${k}.hz`, "Zeichen")));
  const befundEintrag = (b) =>
    el("li", { class: `befund${b.stufe === "warnung" ? " warnung" : ""}` }, el("button", { type: "button", "aria-label": `${b.stufe === "warnung" ? "Warnung" : "Fehler"}: ${feldName(b)}, ${b.text} Zum Feld springen`, onclick: () => springe(zielSchritt(b), b.pfad) }, feldName(b)), `: ${b.text}`);
  const warnungen = befunde.filter((b) => b.stufe !== "fehler");
  const bereit = schemaOk && fehler.length === 0;
  const k = m.kritis;
  return [
    el("p", { class: "einleitung" }, "Tragen Sie die Freigabe nach Ihrem eigenen Verfahren ein, mit Funktionen statt Namen. Das Formular prüft Vollständigkeit, Form und Stimmigkeit der Angaben, nicht ihre sachliche Richtigkeit."),
    zeile(zeichnung("erfassung", "Erfassung"), zeichnung("freigabe", "Freigabe"), zeichnung("versand", "Versand")),
    // Seit 0.3.1 (KL-UX-10): Kennzeichnung als eine Zeile, Einzelheiten zum Aufklappen
    el(
      "details",
      { class: "kennzeichnung" },
      el("summary", {}, `Kennzeichnung: TLP:${k.vertraulichkeit?.tlp || "CLEAR"} · ${k.datenart} · Meldungs-ID ${String(k.meldung_id).replace(/^urn:uuid:/, "").slice(0, 8)}…`),
      zeile(textfeld("kritis.meldung_id", "Meldungs-ID", { nurLesen: true, hinweis: "" }), textfeld("kritis.vertraulichkeit.tlp", "TLP", { nurLesen: true }), textfeld("kritis.datenart", "Datenart", { nurLesen: true, hinweis: "" })),
      textfeld("kritis.vertraulichkeit.hinweis", "Hinweis zur Vertraulichkeit", { eigen: true }),
      el("p", { class: "hinweis" }, "Meldungs-ID, TLP und Datenart setzt das Formular; jede Meldung erhält eine neue ID. Im Demonstrator sind nur fiktive Daten mit TLP:CLEAR zulässig."),
    ),
    // Seit 0.3.1 (KL-UX-05, wie KI-LEAD UX-2026-W44-02/11): „Noch offen“ nach Schritten, je Feld ein Befund mit Abschnitt
    el("h3", {}, fehler.length ? "Noch offen" : "Prüfergebnis"),
    ...SCHRITTE.filter((s) => fehler.some((b) => zielSchritt(b) === s.id)).map((s) =>
      el("div", { class: "befund-schritt" }, el("h4", {}, `Schritt ${SCHRITTE.indexOf(s) + 1}: ${s.titel}`), el("ul", { class: "befunde" }, fehler.filter((b) => zielSchritt(b) === s.id).map(befundEintrag))),
    ),
    !befunde.length && el("p", { class: "ergebnis-ok" }, "Keine Befunde: Die Meldung ist vollständig und stimmig."),
    warnungen.length > 0 && el("div", { class: "befund-schritt" }, el("h4", {}, "Hinweise zur Stimmigkeit (hindern die Ausgabe nicht)"), el("ul", { class: "befunde" }, warnungen.map(befundEintrag))),
    // Seit 0.3.1 (KL-UX-06, wie KI-LEAD UX-2026-W44-12): hervorgehoben ist, was zum Stand passt
    el("div", { class: "werkzeugleiste-knoepfe" }, el("button", { type: "button", class: `knopf${bereit ? " primaer" : ""}`, disabled: !bereit, onclick: ausgeben, id: "ausgeben", "aria-describedby": bereit ? undefined : "ausgabe-stand" }, "Meldung ausgeben (JSON)")),
    !bereit && el("p", { class: "hinweis", id: "ausgabe-stand" }, `Ausgabe gesperrt: noch ${offenText(Math.max(fehler.length, 1))}. Hinweise zur Stimmigkeit hindern die Ausgabe nicht.`),
    hinweisText && el("p", { class: "lese", role: "status" }, hinweisText),
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
  for (const b of zeigen) zahl[zielSchritt(b)] = (zahl[zielSchritt(b)] || 0) + 1;
  for (const s of SCHRITTE) {
    const n = zahl[s.id] || 0;
    const knopf = document.querySelector(`[data-fokus="schritt:${s.id}"]`);
    if (!knopf) continue;
    knopf.classList.toggle("mit-befund", n > 0);
    if (n) knopf.title = `${n} ${n === 1 ? "Feld" : "Felder"} mit Befund`;
    else knopf.removeAttribute("title");
    knopf.querySelector(".schritt-befund").hidden = !n;
    knopf.querySelector("[data-schritt-zahl]").textContent = n ? `, ${n} ${n === 1 ? "Feld" : "Felder"} mit Befund` : "";
  }
  for (const s of document.querySelectorAll("[data-element-befund]")) {
    const ez = s.dataset.elementBefund;
    const n = zeigen.filter((b) => b.pfad.startsWith(`${ez}/`)).length;
    s.textContent = n ? ` · ${n} ${n === 1 ? "Feld" : "Felder"} mit Befund` : "";
  }
  document.querySelector("#status").textContent = `${m.kritis.meldeart} · ${m.meldende_stelle || "ohne Betreiber"} · ${fehler.length ? offenText(fehler.length) : "vollständig"}`;
}

function springe(ziel, pfad) {
  schritt = ziel;
  // eingeklappte Elemente auf dem Weg zum Feld öffnen
  const t = pfad.split("/").filter(Boolean);
  t.forEach((s, i) => { if (/^\d+$/.test(s)) zu.set(`/${t.slice(0, i + 1).join("/")}`, false); });
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

/** Inhalt eines Schritts bauen; die Erklärung der Messwert-Status gilt je Schritt. */
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

/**
 * Zeichnet Schrittleiste und aktuellen Schritt neu. Der Fokus bleibt am selben Bedienelement (gleiches data-fokus),
 * nach einem Schrittwechsel liegt er auf der Überschrift, nach „hinzufügen“ im ersten Feld des neuen Eintrags.
 */
function zeichne({ ueberschrift = false, fokusPraefix } = {}) {
  const vorher = document.activeElement?.dataset?.fokus;
  // Wer Schritt 6 öffnet, sieht ab dann alle Befunde an den Feldern (KL-UX-02)
  if (schritt === "pruefen") alleZeigen = true;
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
            { type: "button", class: `schritt${s.id === schritt ? " aktiv" : ""}`, "aria-current": s.id === schritt ? "step" : false, "data-fokus": `schritt:${s.id}`, onclick: () => { schritt = s.id; zeichne({ ueberschrift: true }); } },
            el("span", { class: "schritt-nr" }, String(j + 1), el("span", { class: "schritt-befund", "aria-hidden": "true", hidden: true })),
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
    el(
      "div",
      { class: "schritt-nav" },
      i > 0 ? el("button", { type: "button", class: "knopf", onclick: () => { schritt = SCHRITTE[i - 1].id; zeichne({ ueberschrift: true }); window.scrollTo(0, 0); } }, `← ${SCHRITTE[i - 1].titel}`) : el("span"),
      i < SCHRITTE.length - 1 ? el("button", { type: "button", class: "knopf primaer", onclick: () => { schritt = SCHRITTE[i + 1].id; zeichne({ ueberschrift: true }); window.scrollTo(0, 0); } }, `${SCHRITTE[i + 1].titel} →`) : el("span"),
    ),
  );
  const ziel = document.querySelector("#arbeitsbereich");
  ziel.replaceChildren(nav, inhalt);
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
});

// ── Werkzeugleiste ───────────────────────────────────
function fortschreiben(vor) {
  if (!vor || vor.kritis?.rolle !== "Betreiber" || vor.schema !== D.schemaId) {
    hinweisText = "Fortschreiben geht nur mit einer Betreibermeldung, die dieses Formular (Meldeprofil v0.2) ausgegeben hat.";
    schritt = "pruefen";
    return zeichne();
  }
  // gewählte Meldeart bleibt (KL-UX-11: „Vormeldung laden“ an der Auswahl), sonst Folgemeldung
  const gewaehlt = m?.kritis?.meldeart;
  m = structuredClone(vor);
  frisch(true);
  m.kritis.bezug_meldung_id = vor.kritis.meldung_id;
  m.kritis.meldung_id = uuid();
  m.kritis.meldeart = gewaehlt && gewaehlt !== "Erstmeldung" ? gewaehlt : "Folgemeldung";
  m.kritis.meldeanlass = ["wesentliche Änderung"];
  m.meldezeitpunkt = jetzt();
  m._entstehung = { verfahren: "manuell", werkzeug: `Betreiberformular KRITIS-LEAD ${D.version}` };
  for (const z of Object.values(m.freigabe)) z.datum = heute();
  const sv = m.sachverhalte[0];
  if (!/^Änderung zur Vormeldung:/m.test(sv.sofort.bewertung_text)) sv.sofort.bewertung_text = `${sv.sofort.bewertung_text.trimEnd()}\nÄnderung zur Vormeldung: `;
  hinweisText = `Fortschreibung von ${vor.kritis.meldung_id}: Meldeart, Datenstände und Änderungen prüfen.`;
  ansage(`${m.kritis.meldeart} angelegt. ${hinweisText}`);
  schritt = "meldung";
  speichere();
  zeichne({ ueberschrift: true });
}

// Rückfrage als modaler Dialog statt window.confirm: Fokus zuerst auf „Abbrechen“, Escape bricht ab, Fokus zurück zum Auslöser
const dialog = document.querySelector("#rueckfrage");
const neuKnopf = document.querySelector("#neu");
neuKnopf.addEventListener("click", () => {
  dialog.showModal();
  document.querySelector("#rueckfrage-abbrechen").focus();
});
document.querySelector("#rueckfrage-abbrechen").addEventListener("click", () => dialog.close("abbrechen"));
document.querySelector("#rueckfrage-ok").addEventListener("click", () => dialog.close("ok"));
dialog.addEventListener("close", () => {
  if (dialog.returnValue === "ok") {
    m = neueMeldung();
    frisch(false);
    hinweisText = "";
    schritt = "meldung";
    speichere();
    ansage("Neue Erstmeldung begonnen.");
    zeichne({ ueberschrift: true });
  } else neuKnopf.focus();
  dialog.returnValue = "";
});
document.querySelector("#beispiel").addEventListener("click", () => {
  m = structuredClone(D.beispiel);
  frisch(true);
  hinweisText = "Beispiel geladen: Erstmeldung des fiktiven Trinkwasser-Zweckverbands im Szenario Orkantief „Ilka“.";
  ansage(hinweisText);
  schritt = "meldung";
  speichere();
  zeichne();
});
document.querySelector("#vormeldung-waehlen").addEventListener("click", () => document.querySelector("#vormeldung").click());
document.querySelector("#vormeldung").addEventListener("change", async (ev) => {
  const datei = ev.target.files?.[0];
  ev.target.value = "";
  if (!datei) return;
  try {
    fortschreiben(JSON.parse(await datei.text()));
  } catch (e) {
    hinweisText = `Datei nicht lesbar: ${e.message}`;
    schritt = "pruefen";
    zeichne();
  }
});
document.querySelector("#zur-pruefung").addEventListener("click", () => {
  schritt = "pruefen";
  zeichne({ ueberschrift: true });
  const { befunde } = pruefe();
  const f = befunde.filter((b) => b.stufe === "fehler").length;
  const w = befunde.length - f;
  ansage(f || w ? `Prüfung: ${f} Fehler, ${w} Warnungen.` : "Prüfung: keine Befunde.");
});

zeichne();
