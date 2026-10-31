// Betreiberformular KRITIS-LEAD: erfasst eine Betreibermeldung nach LEAD-KRITIS-Meldung-v0.1, prüft sie mit demselben
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
  reifegrad: DEFS.kritis_bcm.properties.reifegrad.enum.filter(Boolean),
  richtung: DEFS.kritis_abhaengigkeit.properties.richtung.enum,
  zustand: DEFS.kritis_abhaengigkeit.properties.zustand.enum,
  bedarfStatus: DEFS.kritis_unterstuetzung.properties.status.enum,
  ursacheStatus: betriebP.ursache.properties.status.enum,
  bestaetigung: betriebP.bestaetigungsgrad.enum,
  netzebene: DEFS.kritis_sektorangaben.properties.energie.properties.netzebene.enum.filter(Boolean),
  abkochgebot: DEFS.kritis_sektorangaben.properties.wasser.properties.abkochgebot.enum.filter(Boolean),
  notruf: DEFS.kritis_sektorangaben.properties.telekommunikation.properties.notruf.enum.filter(Boolean),
};
const ANZEIGE = {
  eingeschraenkt: "eingeschränkt", notbetrieb: "Notbetrieb", ausgefallen: "ausgefallen", voll: "voll", unbekannt: "unbekannt",
  belegt: "belegt", geschaetzt: "geschätzt", nicht_zutreffend: "nicht zutreffend", nicht_vorhanden: "nicht vorhanden",
  prognose: "Prognose", keine_prognose_moeglich: "keine Prognose möglich", zielzustand_erreicht: "Zielzustand erreicht",
  nicht_erforderlich: "nicht erforderlich", verfuegbar: "verfügbar", beeintraechtigt: "beeinträchtigt",
 
};
const zeige = (w) => ANZEIGE[w] ?? w;
const SEKTOR_ANGABEN = { Energie: "energie", Wasser: "wasser", "Informationstechnik und Telekommunikation": "telekommunikation", Gesundheitswesen: "gesundheit" };

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
      erweiterung: "lead-kritis/0.1",
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
try {
  const t = localStorage.getItem(SPEICHER);
  m = t ? JSON.parse(t) : neueMeldung();
} catch {
  m = neueMeldung();
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
  for (const k of ["anschluesse", "personen"]) {
    const w = b.ist.betroffene[k];
    if (!w.stand) w.stand = b.ist.stand;
    if (!["belegt", "geschaetzt"].includes(w.status)) w.wert = null;
  }
  if (!b.prognose.stand) b.prognose.stand = b.ist.stand;
  for (const e of b.ersatzverfahren) if (!e.stand) e.stand = b.ist.stand;
  if (m.kritis.meldeart === "Erstmeldung") m.kritis.bezug_meldung_id = "";
  const sa = SEKTOR_ANGABEN[b.sektor];
  if (b.sektor_angaben) for (const k of Object.keys(b.sektor_angaben)) if (k !== sa || !Object.keys(b.sektor_angaben[k] || {}).length) delete b.sektor_angaben[k];
  if (b.sektor_angaben && !Object.keys(b.sektor_angaben).length) delete b.sektor_angaben;
}

// ── Prüfung ──────────────────────────────────────────
const register = new Map(); // Pfad "/a/b/0" → { schritt, id, label }
const zeiger = (pfad) => "/" + teile(pfad).join("/");

function text(e) {
  const p = e.params || {};
  switch (e.keyword) {
    case "required":
      return "Pflichtangabe fehlt";
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
      const z = e.keyword === "required" ? `${e.instancePath}/${e.params.missingProperty}` : e.instancePath || "/";
      return { stufe: "fehler", pfad: z, text: text(e) };
    });
  // gleiche Stelle, gleicher Text nur einmal
  const eindeutig = [...new Map(befunde.map((b) => [`${b.pfad}|${b.text}`, b])).values()];
  const plausibel = ok ? pruefePlausibilitaet(m) : [];
  return { schemaOk: !!ok, befunde: [...eindeutig, ...plausibel.map((b) => ({ ...b, text: `${b.text} (${b.regel})` }))] };
}

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

function aenderung(neuZeichnen) {
  speichere();
  if (neuZeichnen) zeichne();
  else aktualisiereZahlen();
}

function rahmen(pfad, label, eingabe, { hinweis, pflicht, id } = {}) {
  register.set(zeiger(pfad), { schritt, id, label });
  return el("div", { class: "feld", "data-pfad": zeiger(pfad) }, el("label", { class: `feld-label${pflicht ? " pflicht" : ""}`, for: id }, label), eingabe, hinweis && el("p", { class: "hinweis" }, hinweis));
}

function textfeld(pfad, label, opt = {}) {
  const id = neueId();
  const typ = opt.typ || "text";
  const wert = hole(pfad);
  const attrs = { id, type: typ === "lang" ? undefined : typ, value: wert ?? "", placeholder: opt.platzhalter, readonly: opt.nurLesen };
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
    eingabe = el("input", { ...attrs, step: typ === "number" ? "any" : undefined, [opt.neuZeichnen ? "onchange" : "oninput"]: handler });
    if (typ === "datetime-local" || typ === "date") eingabe.value = wert ?? "";
  }
  return rahmen(pfad, label, eingabe, { ...opt, id });
}
const zeitfeld = (pfad, label, opt = {}) => textfeld(pfad, label, { ...opt, typ: "datetime-local" });

function auswahl(pfad, label, werte, opt = {}) {
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

function segmente(pfad, label, werte, opt = {}) {
  const id = neueId();
  const name = neueId();
  const aktuell = hole(pfad);
  const gruppe = el(
    "div",
    { class: "segmente", role: "radiogroup", id, "aria-label": label },
    werte.map((w) =>
      el(
        "label",
        { class: `segment${aktuell === w ? " an" : ""}` },
        el("input", { type: "radio", name, value: w, checked: aktuell === w, onchange: () => { setze(pfad, w); opt.danach?.(w); aenderung(true); } }),
        zeige(w),
      ),
    ),
  );
  register.set(zeiger(pfad), { schritt, id, label });
  return el("fieldset", { class: "feld", "data-pfad": zeiger(pfad) }, el("legend", { class: `feld-label${opt.pflicht ? " pflicht" : ""}` }, label), gruppe, opt.hinweis && el("p", { class: "hinweis" }, opt.hinweis));
}

function chips(pfad, label, werte, opt = {}) {
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
  register.set(zeiger(pfad), { schritt, id, label });
  return el("fieldset", { class: "feld", "data-pfad": zeiger(pfad) }, el("legend", { class: `feld-label${opt.pflicht ? " pflicht" : ""}` }, label), box, opt.hinweis && el("p", { class: "hinweis" }, opt.hinweis));
}

function gruppe(titel, ...inhalt) {
  return el("fieldset", { class: "gruppe" }, el("legend", {}, titel), ...inhalt);
}
const zeile = (...inhalt) => el("div", { class: "zeile" }, ...inhalt);

function liste(pfad, titel, neu, felder, opt = {}) {
  const eintraege = hole(pfad) || [];
  register.set(zeiger(pfad), { schritt, id: undefined, label: titel });
  return gruppe(
    titel,
    opt.hinweis && el("p", { class: "hinweis" }, opt.hinweis),
    el(
      "div",
      { class: "liste" },
      eintraege.map((_, i) =>
        el(
          "div",
          { class: "element" },
          el(
            "div",
            { class: "element-kopf" },
            `${opt.element || "Eintrag"} ${i + 1}`,
            el("button", { type: "button", class: "knopf leise klein", onclick: () => { hole(pfad).splice(i, 1); aenderung(true); } }, "entfernen"),
          ),
          felder(`${pfad}.${i}`),
        ),
      ),
    ),
    el("button", { type: "button", class: "knopf klein", onclick: () => { setze(pfad, [...(hole(pfad) || []), neu()]); aenderung(true); } }, opt.hinzufuegen || "hinzufügen"),
  );
}

function textliste(pfad, titel, opt = {}) {
  return liste(pfad, titel, () => "", (p) => textfeld(p, opt.label || "Text", { platzhalter: opt.platzhalter }), { ...opt, element: opt.element || "Eintrag" });
}

function messwert(pfad, titel, opt = {}) {
  const status = hole(`${pfad}.status`);
  const mitZahl = ["belegt", "geschaetzt"].includes(status);
  return gruppe(
    titel,
    segmente(`${pfad}.status`, "Status", E.messStatus, { hinweis: "belegt = gezählt oder gemessen; geschätzt = hochgerechnet; unbekannt = geprüft, nicht feststellbar." }),
    zeile(
      mitZahl ? textfeld(`${pfad}.wert`, "Wert", { typ: "number" }) : el("p", { class: "hinweis" }, "Ohne Zahl bei „unbekannt“ und „nicht zutreffend“."),
      textfeld(`${pfad}.einheit`, "Einheit", { platzhalter: opt.einheit }),
      zeitfeld(`${pfad}.stand`, "Datenstand", { hinweis: "leer = Datenstand des Istzustands" }),
    ),
    textfeld(`${pfad}.hinweis`, "Hinweis (optional)", { platzhalter: opt.hinweis }),
  );
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
    el("p", { class: "einleitung" }, "Wer meldet was in welcher Rolle? Betreiber melden Angaben zum eigenen Betrieb; Beurteilung, Tendenz und Lagenradar setzt die Behörde. Eine Folge-, Korrektur- oder Abschlussmeldung entsteht am einfachsten über „Vormeldung fortschreiben“."),
    segmente("kritis.meldeart", "Meldeart", E.meldeart, { pflicht: true }),
    folge && textfeld("kritis.bezug_meldung_id", "Bezug auf Meldung", { pflicht: true, platzhalter: "urn:uuid:…", hinweis: "Meldungs-ID der Meldung, die fortgeschrieben, berichtigt oder abgeschlossen wird. Beim Fortschreiben trägt das Formular sie ein." }),
    chips("kritis.meldeanlass", "Meldeanlass", E.meldeanlass, { pflicht: true }),
    zeile(zeitfeld("meldezeitpunkt", "Meldezeitpunkt", { pflicht: true }), zeitfeld("meldezeitraum.von", "Berichtszeitraum von"), zeitfeld("meldezeitraum.bis", "Berichtszeitraum bis")),
    zeile(
      textfeld("meldende_stelle", "Betreiber (meldende Stelle)", { pflicht: true, danach: (v) => { m.sachverhalte.forEach((sv) => (sv.betrieb.betreiber.name = v)); }, platzhalter: "z. B. Netzbetreiber Nord (FIKTIV)", hinweis: "Im Demonstrator nur fiktive Namen." }),
      auswahl("land", "Land", E.land, { pflicht: true, neuZeichnen: true, danach: () => { m.sachverhalte[0].kennung = ""; } }),
    ),
    segmente(`${B}.betreiber.traegerschaft`, "Trägerschaft", E.traegerschaft),
    textfeld("kritis.kontaktstelle", "Kontaktstelle (Funktionsadresse, keine Person)", { platzhalter: "z. B. Leitwarte, 24 h besetzt" }),
    textliste("kritis.empfaenger", "Empfänger", { label: "Empfänger", element: "Empfänger", hinzufuegen: "Empfänger hinzufügen", platzhalter: "z. B. Landkreis …, Krisenstab (Übungsrolle, FIKTIV)" }),
    liste(
      "kritis.gemeldet_an",
      "Parallele Pflichtmeldungen (nur dokumentiert)",
      () => ({ stelle: "", rechtsgrundlage: "", status: "erfolgt", zeitpunkt: "", kennzeichen: "" }),
      (p) => [zeile(textfeld(`${p}.stelle`, "Stelle"), textfeld(`${p}.rechtsgrundlage`, "Rechtsgrundlage", { platzhalter: "z. B. § 168 TKG" })), segmente(`${p}.status`, "Status", E.gemeldetStatus), zeile(zeitfeld(`${p}.zeitpunkt`, "Zeitpunkt"), textfeld(`${p}.kennzeichen`, "Kennzeichen"))],
      { element: "Pflichtmeldung", hinzufuegen: "Pflichtmeldung hinzufügen", hinweis: "Diese Meldung ersetzt keine gesetzliche Meldung. Leere Liste: keine dokumentiert." },
    ),
    gruppe(
      "Kennzeichnung",
      zeile(
        textfeld("kritis.meldung_id", "Meldungs-ID", { nurLesen: true }),
        textfeld("kritis.vertraulichkeit.tlp", "TLP", { nurLesen: true }),
        textfeld("kritis.datenart", "Datenart", { nurLesen: true }),
      ),
      el("p", { class: "hinweis" }, "Jede Meldung erhält eine neue ID. Der Demonstrator nimmt nur synthetische Daten mit TLP:CLEAR an."),
    ),
  ];
}

function schrittDienstleistung() {
  const b = m.sachverhalte[0].betrieb;
  const sa = SEKTOR_ANGABEN[b.sektor];
  const sektorGruppe = () => {
    if (!sa) return null;
    const p = `${B}.sektor_angaben.${sa}`;
    if (!hole(p)) setze(p, {});
    if (sa === "energie") return gruppe("Sektorangaben Energie (optional)", segmente(`${p}.netzebene`, "Netzebene", E.netzebene));
    if (sa === "wasser") return gruppe("Sektorangaben Wasser (optional)", zeile(textfeld(`${p}.druckzonen_betroffen`, "betroffene Druckzonen", { typ: "number" })), segmente(`${p}.abkochgebot`, "Abkochgebot", E.abkochgebot));
    if (sa === "telekommunikation") return gruppe("Sektorangaben Telekommunikation (optional)", segmente(`${p}.notruf`, "Notruf", E.notruf));
    return gruppe("Sektorangaben Gesundheit (optional)", el("p", { class: "hinweis" }, "Betreibbare Betten und Verlegungsbedarf als Messwerte lassen sich in der JSON-Datei ergänzen."));
  };
  return [
    el("p", { class: "einleitung" }, "Funktionsprofil nach SOP B12: Dienstleistung, Raum, Ausfallbeginn und tatsächlicher Leistungsgrad, jeweils mit Datenstand."),
    zeile(auswahl(`${B}.sektor`, "Sektor (§ 4 Abs. 1 KRITISDachG)", E.sektor, { pflicht: true, neuZeichnen: true, leerAlsFehlend: true }), textfeld(`${B}.kritische_dienstleistung`, "Kritische Dienstleistung", { pflicht: true, platzhalter: "z. B. Trinkwasserversorgung" })),
    zeile(textfeld(`${B}.anlage.bezeichnung`, "Anlage (optional)"), textfeld(`${B}.anlage.kennung_betreiber`, "Kennung der Anlage beim Betreiber (optional)")),
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
      segmente(`${B}.ist.eskalationsstufe_betrieblich`, "Betriebliche Eskalationsstufe", E.eskalation, { hinweis: "Betreibersicht; wird nie in eine LEAD-Beurteilung übersetzt. Leer = keine." }),
    ),
    messwert(`${B}.ist.betroffene.anschluesse`, "Betroffene Anschlüsse", { einheit: "z. B. Netzanschlüsse ohne Versorgung" }),
    messwert(`${B}.ist.betroffene.personen`, "Betroffene Personen", { einheit: "z. B. Bewohnerinnen und Bewohner", hinweis: "Personen nie als „belegt“ aus Anschlüssen hochrechnen" }),
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
    el("p", { class: "einleitung" }, "Drei Zeitarten getrennt halten: Istzustand (vorheriger Schritt), Prognose zum Datenstand und Planwerte aus der Vorsorge. Eine Nennlaufzeit ist keine Reichweite."),
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
      { element: "Ersatzverfahren", hinzufuegen: "Ersatzverfahren hinzufügen" },
    ),
    gruppe(
      "Prognose Wiederanlauf",
      segmente(`${B}.prognose.status`, "Status", E.prognoseStatus, { pflicht: true, danach: (w) => { if (w === "keine_prognose_moeglich") Object.assign(b.prognose, { fruehestens: "", spaetestens: "" }); } }),
      ps !== "keine_prognose_moeglich" && zeile(textfeld(`${B}.prognose.geber`, "Prognosegeber", { pflicht: ps === "prognose" }), textfeld(`${B}.prognose.zielzustand`, "Zielzustand", { pflicht: ps === "prognose", platzhalter: "z. B. Versorgung aller Anschlüsse wiederhergestellt" })),
      ps === "prognose" && zeile(zeitfeld(`${B}.prognose.fruehestens`, "frühestens"), zeitfeld(`${B}.prognose.spaetestens`, "spätestens")),
      ps === "prognose" && segmente(`${B}.prognose.unsicherheit`, "Unsicherheit", E.unsicherheit.filter(Boolean)),
      textfeld(`${B}.prognose.begruendung`, "Begründung"),
    ),
    liste(
      `${B}.unterstuetzungsbedarf`,
      "Unterstützungsbedarf",
      () => ({ leistung: "", menge: "", bis: "", adressat: "", status: "angefordert" }),
      (p) => [zeile(textfeld(`${p}.leistung`, "Leistung"), textfeld(`${p}.menge`, "Menge")), zeile(zeitfeld(`${p}.bis`, "benötigt bis"), textfeld(`${p}.adressat`, "Adressat")), segmente(`${p}.status`, "Status", E.bedarfStatus)],
      { element: "Bedarf", hinzufuegen: "Bedarf hinzufügen" },
    ),
    liste(
      `${B}.abhaengigkeiten`,
      "Abhängigkeiten",
      () => ({ dienstleistung: "", richtung: "eingehend", zustand: "verfuegbar", puffer: "", betroffene_stelle: "" }),
      (p) => [zeile(textfeld(`${p}.dienstleistung`, "Dienstleistung", { platzhalter: "z. B. Stromverteilung" }), textfeld(`${p}.betroffene_stelle`, "Stelle")), segmente(`${p}.richtung`, "Richtung", E.richtung), segmente(`${p}.zustand`, "Zustand", E.zustand), textfeld(`${p}.puffer`, "Puffer", { platzhalter: "z. B. Notstrom bis 16.10., 10:00 Uhr" })],
      { element: "Abhängigkeit", hinzufuegen: "Abhängigkeit hinzufügen", hinweis: "Eingehend: wovon der Betrieb abhängt. Ausgehend: wer vom Betrieb abhängt." },
    ),
    gruppe(
      "BCM (optional)",
      el("label", {}, el("input", { type: "checkbox", checked: mitBcm, onchange: (ev) => { if (ev.target.checked) b.bcm = { reifegrad: "", planung: {} }; else delete b.bcm; aenderung(true); } }), " Angaben aus dem betrieblichen Kontinuitätsmanagement machen"),
      mitBcm && auswahl(`${B}.bcm.reifegrad`, "Reifegrad (Selbstauskunft)", E.reifegrad),
      mitBcm && zeile(textfeld(`${B}.bcm.planung.rto_stunden`, "Wiederanlaufziel RTO (h)", { typ: "number" }), textfeld(`${B}.bcm.planung.mta_stunden`, "maximal tolerierbare Ausfallzeit (h)", { typ: "number" }), textfeld(`${B}.bcm.planung.notbetriebsniveau_prozent`, "Notbetriebsniveau (%)", { typ: "number" })),
      mitBcm && zeile(textfeld(`${B}.bcm.planung.zeitanker`, "Zeitanker", { platzhalter: "ab welchem Ereignis" }), textfeld(`${B}.bcm.planung.zielzustand`, "Zielzustand des Planwerts")),
      mitBcm && zeile(textfeld(`${B}.bcm.planung.quelle`, "Dokument (nur Bezeichnung)"), textfeld(`${B}.bcm.planung.stand`, "Stand", { typ: "date" })),
      el("p", { class: "hinweis" }, "Planwerte sind keine Zusage und keine Prognose. Keine Inhalte aus Notfallplänen, Netzplänen oder Alarmierungslisten."),
    ),
    gruppe(
      "Ursache (optional)",
      el("label", {}, el("input", { type: "checkbox", checked: mitUrsache, onchange: (ev) => { if (ev.target.checked) b.ursache = { kurz: "", status: "vorläufig" }; else delete b.ursache; aenderung(true); } }), " vorläufige Ursache angeben"),
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
      onclick: () => {
        const t = sv.sofort.bewertung_text || "";
        sv.sofort.bewertung_text = `${t}${t && !t.endsWith("\n") ? "\n" : ""}${k} `;
        aenderung(true);
      },
    }, k);
  return [
    el("p", { class: "einleitung" }, "Der Sachverhalt in Worten. Belege mit [Q1], [Q2] … auf das Quellenverzeichnis verweisen. Beurteilung, Tendenz und Lagenradar bleiben leer; sie setzt die Behörde für ihren Referenzraum."),
    zeile(textfeld(`${SV}.bezeichnung`, "Bezeichnung", { pflicht: true, platzhalter: "kurz: was, wo, Folge" }), textfeld(`${SV}.kennung`, "Kennung", { nurLesen: true, hinweis: "vergibt das Formular nach Wahl des Landes; bleibt bei der Fortschreibung gleich" })),
    zeile(zeitfeld(`${SV}.eintritt`, "Eintritt", { pflicht: true }), textfeld(`${SV}.ort`, "Ort", { pflicht: true })),
    chips(`${SV}.art`, "Ereignisart", E.art, { pflicht: true }),
    textfeld(`${SV}.analyse.lage_ereignis`, "Lage & Ereignis", { typ: "lang", pflicht: true, hinweis: "Was ist zum Datenstand der Fall? Zahlen mit Einheit und Stand." }),
    textfeld(`${SV}.analyse.risiken_auswirkungen`, "Risiken & Auswirkungen", { typ: "lang", pflicht: true, hinweis: "Was droht, wenn Puffer enden? Mögliche Entwicklungen als solche kennzeichnen." }),
    textfeld(`${SV}.analyse.massnahmen_empfehlungen`, "Maßnahmen & Bedarf", { typ: "lang", pflicht: true, hinweis: "Eigene Maßnahmen mit Status und Stand; Unterstützungsbedarf." }),
    textfeld(`${SV}.analyse.abhaengigkeiten_interdependenzen`, "Abhängigkeiten & Interdependenzen", { typ: "lang", pflicht: true, hinweis: "Wirkungskette mit Puffer und Reichweite." }),
    textfeld(`${SV}.sofort.bewertung_text`, "Betriebliche Einschätzung mit Kennsätzen", { typ: "lang", zeilen: 6, hinweis: "Beginnt am besten mit „Betriebliche Einschätzung des Betreibers, keine LEAD-Beurteilung:“. Kennsätze je Zeile." }),
    el("div", { class: "mehrfach" }, KENNSAETZE.map(kennsatz)),
  ];
}

function schrittQuellen() {
  const sv = m.sachverhalte[0];
  const vorschlag = () => {
    const d = (m.sachverhalte[0].betrieb.ist.stand || m.meldezeitpunkt || jetzt()).slice(0, 10).split("-").reverse().join(".");
    const z = `[Q1] B – ${m.meldende_stelle || "Betreiber"} (${d}): Betriebsangaben der Leitwarte (betriebsintern, FIKTIV) [Zugriff: ${d}]`;
    m.quellen = m.quellen ? `${m.quellen}\n${z.replace("[Q1]", `[Q${(m.quellen.match(/^\s*\[Q\d+\]/gm) || []).length + 1}]`)}` : z;
    aenderung(true);
  };
  const neu = { zeit: "", typ: D.zeitstrahlTypen[0], text: "", quelle: "[Q1]" };
  const anfuegen = () => {
    const n = (m.zeitstrahl.match(/^\s*\[Z\d+\]/gm) || []).length + 1;
    const z = `[Z${n}] ${neu.zeit || m.meldezeitpunkt} · ${sv.kennung || "KENNUNG"} · ${neu.typ} – ${neu.text} ${neu.quelle} · aufgenommen ${m.meldezeitpunkt}`;
    m.zeitstrahl = m.zeitstrahl ? `${m.zeitstrahl}\n${z}` : z;
    aenderung(true);
  };
  return [
    el("p", { class: "einleitung" }, "Je Quelle ein Eintrag, nummeriert in der Reihenfolge der ersten Nennung. Betriebsangaben sind Kategorie B. Darunter der Zeitstrahl: je eingetretenem Ereignis eine Zeile."),
    textfeld("quellen", "Quellenverzeichnis", { typ: "lang", zeilen: 5, pflicht: true, platzhalter: "[Q1] B – Betreiber (TT.MM.JJJJ): Titel (betriebsintern, FIKTIV) [Zugriff: TT.MM.JJJJ]" }),
    el("button", { type: "button", class: "knopf klein", onclick: vorschlag }, "Eintrag aus Betreiberangaben vorschlagen"),
    el("hr", { style: "border:none;border-top:1px solid var(--linie-zart);margin:1.25rem 0" }),
    textfeld("zeitstrahl", "Zeitstrahl", { typ: "lang", zeilen: 5, hinweis: "[Zn] JJJJ-MM-TTThh:mm · Kennung · Typ – Kurztext [Qn] · aufgenommen JJJJ-MM-TTThh:mm" }),
    gruppe(
      "Zeile anfügen",
      zeile(
        el("div", { class: "feld" }, el("label", { class: "feld-label" }, "Zeitpunkt"), el("input", { type: "datetime-local", oninput: (e) => (neu.zeit = e.target.value) })),
        el("div", { class: "feld" }, el("label", { class: "feld-label" }, "Typ"), el("select", { onchange: (e) => (neu.typ = e.target.value) }, D.zeitstrahlTypen.map((t) => el("option", { value: t }, t)))),
        el("div", { class: "feld" }, el("label", { class: "feld-label" }, "Quelle"), el("input", { type: "text", value: "[Q1]", oninput: (e) => (neu.quelle = e.target.value) })),
      ),
      el("div", { class: "feld" }, el("label", { class: "feld-label" }, "Kurztext"), el("input", { type: "text", oninput: (e) => (neu.text = e.target.value) })),
      el("button", { type: "button", class: "knopf klein", onclick: anfuegen }, "Zeile anfügen"),
    ),
  ];
}

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
    zeichne();
  };
  const zeichnung = (k, titel) => gruppe(titel, zeile(textfeld(`freigabe.${k}.name`, "Funktion"), textfeld(`freigabe.${k}.datum`, "Datum", { typ: "date" }), textfeld(`freigabe.${k}.hz`, "Zeichen")));
  return [
    el("p", { class: "einleitung" }, "Freigabe nach eigenem Verfahren; Funktionen statt Personen. Die Prüfung nutzt das Schema LEAD-KRITIS-Meldung-v0.1 und die Plausibilitätsregeln des Prüfwerkzeugs. Sie prüft Struktur und Stimmigkeit, nicht die sachliche Richtigkeit."),
    zeile(zeichnung("erfassung", "Erfassung"), zeichnung("freigabe", "Freigabe"), zeichnung("versand", "Versand")),
    el("h3", {}, "Prüfergebnis"),
    befunde.length
      ? el(
          "ul",
          { class: "befunde", "aria-live": "polite" },
          befunde.map((b) => {
            const r = register.get(b.pfad);
            const ziel = r?.schritt || schrittFuer(b.pfad);
            return el("li", { class: `befund${b.stufe === "warnung" ? " warnung" : ""}` }, el("button", { type: "button", onclick: () => springe(ziel, b.pfad) }, `${r?.label || b.pfad}`), `: ${b.text}`);
          }),
        )
      : el("p", { class: "ergebnis-ok", "aria-live": "polite" }, "Keine Befunde: Die Meldung entspricht dem Schema und den Plausibilitätsregeln."),
    el("div", { class: "werkzeugleiste-knoepfe" }, el("button", { type: "button", class: "knopf primaer", disabled: !schemaOk || fehler.length > 0, onclick: ausgeben, id: "ausgeben" }, "Meldung ausgeben (JSON)")),
    !schemaOk && el("p", { class: "hinweis" }, "Ausgabe erst ohne Fehler möglich; Warnungen hindern nicht."),
    hinweisText && el("p", { class: "lese", role: "status" }, hinweisText),
    el("details", {}, el("summary", {}, "JSON ansehen"), el("pre", { class: "json" }, JSON.stringify(m, null, 2))),
  ];
}

const INHALT = { meldung: schrittMeldung, dienstleistung: schrittDienstleistung, ersatz: schrittErsatz, lage: schrittLage, quellen: schrittQuellen, pruefen: schrittPruefen };

// ── Zeichnen ─────────────────────────────────────────
function aktualisiereZahlen() {
  const { befunde } = pruefe();
  const zahl = {};
  for (const b of befunde.filter((x) => x.stufe === "fehler")) {
    const s = register.get(b.pfad)?.schritt || schrittFuer(b.pfad);
    zahl[s] = (zahl[s] || 0) + 1;
  }
  for (const s of SCHRITTE) {
    const z = document.querySelector(`[data-schritt-zahl="${s.id}"]`);
    if (z) {
      z.textContent = zahl[s.id] ? String(zahl[s.id]) : "";
      z.hidden = !zahl[s.id];
    }
  }
  document.querySelector("#status").textContent = `${m.kritis.meldeart} · ${m.meldende_stelle || "ohne Betreiber"} · ${befunde.filter((b) => b.stufe === "fehler").length} offene Pflichtangaben/Fehler`;
}

function springe(ziel, pfad) {
  schritt = ziel;
  zeichne();
  const r = register.get(pfad);
  const node = r?.id ? document.getElementById(r.id) : document.querySelector(`[data-pfad="${pfad}"]`);
  node?.scrollIntoView({ block: "center" });
  node?.focus?.();
}

function zeichne() {
  register.clear();
  // Register für alle Schritte füllen, damit Befunde jeder Stelle einen Schritt und eine Bezeichnung finden
  const merke = schritt;
  for (const s of SCHRITTE) {
    if (s.id === "pruefen") continue;
    schritt = s.id;
    INHALT[s.id]();
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
        el("li", {}, el("button", { type: "button", class: `schritt${s.id === schritt ? " aktiv" : ""}`, "aria-current": s.id === schritt ? "step" : false, onclick: () => { schritt = s.id; zeichne(); } }, el("span", { class: "schritt-nr" }, String(j + 1)), s.titel, el("span", { class: "schritt-zahl", "data-schritt-zahl": s.id, hidden: true }))),
      ),
    ),
  );
  const inhalt = el(
    "section",
    { class: "schritt-inhalt", "aria-labelledby": "schritt-titel" },
    el("h2", { id: "schritt-titel" }, SCHRITTE[i].titel),
    INHALT[schritt](),
    el(
      "div",
      { class: "schritt-nav" },
      i > 0 ? el("button", { type: "button", class: "knopf", onclick: () => { schritt = SCHRITTE[i - 1].id; zeichne(); window.scrollTo(0, 0); } }, `← ${SCHRITTE[i - 1].titel}`) : el("span"),
      i < SCHRITTE.length - 1 ? el("button", { type: "button", class: "knopf primaer", onclick: () => { schritt = SCHRITTE[i + 1].id; zeichne(); window.scrollTo(0, 0); } }, `${SCHRITTE[i + 1].titel} →`) : el("span"),
    ),
  );
  const ziel = document.querySelector("#arbeitsbereich");
  ziel.replaceChildren(nav, inhalt);
  // Fehler an den Feldern kennzeichnen
  const { befunde } = pruefe();
  for (const b of befunde.filter((x) => x.stufe === "fehler")) {
    const f = ziel.querySelector(`[data-pfad="${b.pfad}"]`);
    if (f && !f.classList.contains("feld-fehler")) {
      f.classList.add("feld-fehler");
      f.append(el("p", { class: "feld-meldung" }, b.text));
    }
  }
  aktualisiereZahlen();
}

// ── Werkzeugleiste ───────────────────────────────────
function fortschreiben(vor) {
  if (!vor || vor.kritis?.rolle !== "Betreiber" || vor.schema !== D.schemaId) {
    hinweisText = "Fortschreiben geht nur mit einer Betreibermeldung nach LEAD-KRITIS-Meldung-v0.1.";
    schritt = "pruefen";
    return zeichne();
  }
  m = structuredClone(vor);
  m.kritis.bezug_meldung_id = vor.kritis.meldung_id;
  m.kritis.meldung_id = uuid();
  m.kritis.meldeart = "Folgemeldung";
  m.kritis.meldeanlass = ["wesentliche Änderung"];
  m.meldezeitpunkt = jetzt();
  m._entstehung = { verfahren: "manuell", werkzeug: `Betreiberformular KRITIS-LEAD ${D.version}` };
  for (const z of Object.values(m.freigabe)) z.datum = heute();
  const sv = m.sachverhalte[0];
  if (!/^Änderung zur Vormeldung:/m.test(sv.sofort.bewertung_text)) sv.sofort.bewertung_text = `${sv.sofort.bewertung_text.trimEnd()}\nÄnderung zur Vormeldung: `;
  hinweisText = `Fortschreibung von ${vor.kritis.meldung_id}: Meldeart, Datenstände und Änderungen prüfen.`;
  schritt = "meldung";
  speichere();
  zeichne();
}

document.querySelector("#neu").addEventListener("click", () => {
  if (!confirm("Neue Erstmeldung beginnen? Der aktuelle Entwurf wird verworfen.")) return;
  m = neueMeldung();
  hinweisText = "";
  schritt = "meldung";
  speichere();
  zeichne();
});
document.querySelector("#beispiel").addEventListener("click", () => {
  m = structuredClone(D.beispiel);
  hinweisText = "Beispiel geladen: Erstmeldung des fiktiven Trinkwasser-Zweckverbands im Szenario Orkantief „Ilka“.";
  schritt = "meldung";
  speichere();
  zeichne();
});
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
document.querySelector("#zur-pruefung").addEventListener("click", () => { schritt = "pruefen"; zeichne(); });

zeichne();
