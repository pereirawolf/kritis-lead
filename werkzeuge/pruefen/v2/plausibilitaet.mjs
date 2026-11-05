// Plausibilitätsregeln für Meldungen nach LEAD-Meldung-v2 mit den Modulen von KRITIS-LEAD (formate/lead-kritis-v2/).
// Ohne Abhängigkeiten, damit dasselbe Modul im Prüfwerkzeug und im Betreiberformular läuft. Erwartet eine schemagültige Meldung.
// Zeitvergleiche wie in KI-LEAD (LEAD-MELDUNG-V2.md, Abschnitt 8): Zeitpunkte absolut; ein Kalendertag gegen einen Zeitpunkt
// ist nicht entscheidbar und ergibt keinen Befund. Querverweise auf das Quellenverzeichnis prüft zusätzlich die Referenzprüfung
// von KI-LEAD (zweiter Prüfweg); P4 hier deckt auch die Belege in den Modulen ab.

const ZEITPUNKT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;
const TAG = /^\d{4}-\d{2}-\d{2}$/;
const MODUL = "lead-kritis-betrieb";
const KOPF = "lead-kritis-meldung";

/** Vergleich zweier Zeitangaben: -1, 0, 1 oder null (nicht entscheidbar oder keine Zeitangabe). */
export function vergleiche(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return null;
  if (ZEITPUNKT.test(a) && ZEITPUNKT.test(b)) return Math.sign(Date.parse(a) - Date.parse(b));
  if (TAG.test(a) && TAG.test(b)) return a < b ? -1 : a > b ? 1 : 0;
  return null;
}
const nach = (a, b) => vergleiche(a, b) === 1;
const text = (v) => (typeof v === "string" ? v : "");

/** Liefert Befunde {stufe: "fehler"|"warnung", regel, pfad, text}. */
export function pruefePlausibilitaet(m) {
  const befunde = [];
  const melde = (stufe, regel, pfad, t) => befunde.push({ stufe, regel, pfad, text: t });
  if (!m || typeof m !== "object") return befunde;
  const t0 = m.meldezeitpunkt;
  const art = m.module?.[KOPF]?.meldeart || "";

  // P5 Meldezeitraum
  if (nach(m.meldezeitraum?.von, m.meldezeitraum?.bis)) melde("fehler", "P5-meldezeitraum", "/meldezeitraum", "Meldezeitraum: „von“ liegt nach „bis“.");
  if (nach(m.meldezeitraum?.bis, t0)) melde("warnung", "P5-meldezeitraum", "/meldezeitraum/bis", "Meldezeitraum endet nach dem Meldezeitpunkt.");

  // P4 Belege: jeder Verweis [Qn] und jede Quellen-ID muss im Quellenverzeichnis stehen
  const definiert = new Set((m.quellen || []).map((q) => q.id));
  const verwiesen = new Set();
  const ausText = (t) => {
    for (const x of text(t).matchAll(/\[(Q[\d,\s–\-Q]+)\]/g)) for (const n of x[1].matchAll(/Q?(\d+)/g)) verwiesen.add(`Q${n[1]}`);
  };
  const ausListe = (l) => (Array.isArray(l) ? l : []).forEach((q) => verwiesen.add(q));

  (m.sachverhalte || []).forEach((sv, i) => {
    const p = `/sachverhalte/${i}`;
    for (const t of Object.values(sv.analyse || {})) ausText(t);
    for (const k of sv.kennzahlen || []) ausListe(k.quellen);
    for (const z of sv.zeitstrahl || []) ausListe(z.quellen);
    for (const l of ["massnahmen", "empfehlungen", "fristen"]) for (const x of sv.handlungsbedarf?.[l] || []) ausListe(x.quellen);
    const b = sv.module?.[MODUL];
    if (!b) return;
    const pb = `${p}/module/${MODUL}`;
    ausListe(b.bcm?.planung?.quellen);

    // P6/P7 Angaben je Meldeart
    if ((art === "Folgemeldung" || art === "Korrekturmeldung") && !text(b.aenderung_zur_vormeldung).trim())
      melde("warnung", "P6-aenderung", `${pb}/aenderung_zur_vormeldung`, `${art} ohne „Änderung zur Vormeldung“.`);
    if (art === "Abschlussmeldung" && !b.abschluss) melde("warnung", "P7-abschluss", `${pb}/abschluss`, "Abschlussmeldung ohne Abschluss.");
    if (art === "Abschlussmeldung" && b.prognose?.status !== "zielzustand_erreicht")
      melde("warnung", "P7-abschluss", `${pb}/prognose/status`, "Abschlussmeldung, aber Prognose nicht „zielzustand_erreicht“.");

    // P3 Datenstände nicht nach dem Meldezeitpunkt, Eintritt nicht nach dem Datenstand
    const staende = [
      [`${pb}/ist/stand`, b.ist?.stand],
      [`${pb}/prognose/stand`, b.prognose?.stand],
      ...(b.ersatzverfahren || []).map((e, j) => [`${pb}/ersatzverfahren/${j}/stand`, e.stand]),
      ...(sv.kennzahlen || []).map((k, j) => [`${p}/kennzahlen/${j}/datenstand`, k.datenstand]),
    ];
    for (const [q, s] of staende) if (nach(s, t0)) melde("fehler", "P3-stand", q, "Datenstand liegt nach dem Meldezeitpunkt.");
    if (nach(sv.eintritt?.zeit, b.ist?.stand)) melde("fehler", "P3-stand", `${p}/eintritt/zeit`, "Eintritt liegt nach dem Datenstand des Istzustands.");

    // P9 Einschränkung ohne Eintritt
    if (["eingeschraenkt", "notbetrieb", "ausgefallen"].includes(b.ist?.leistungsgrad) && !sv.eintritt?.zeit)
      melde("warnung", "P9-beginn", `${p}/eintritt`, "Leistung eingeschränkt, aber kein Eintritt angegeben.");

    // P1 Prognoseintervall
    if (nach(b.prognose?.fruehestens, b.prognose?.spaetestens)) melde("fehler", "P1-prognose", `${pb}/prognose/fruehestens`, "Prognose: „frühestens“ liegt nach „spätestens“.");
    if (b.prognose?.status === "prognose" && !b.prognose.fruehestens && !b.prognose.spaetestens)
      melde("warnung", "P1-prognose", `${pb}/prognose`, "Prognose ohne Zeitangabe; sonst „keine Prognose möglich“ wählen.");

    // P2 Reichweiten
    (b.ersatzverfahren || []).forEach((e, j) => {
      if (vergleiche(e.reichweite_bis, e.stand) === -1) melde("warnung", "P2-reichweite", `${pb}/ersatzverfahren/${j}/reichweite_bis`, "Reichweite endet vor dem Datenstand.");
      if (e.reichweite_bis && !text(e.bedingung).trim()) melde("warnung", "P2-reichweite", `${pb}/ersatzverfahren/${j}/bedingung`, "Reichweite ohne Bedingung.");
    });

    // P10 Planwerte: RTO kleiner als MTPD (BSI-Standard 200-4)
    const pl = b.bcm?.planung;
    if (typeof pl?.rto_stunden === "number" && typeof pl?.mtpd_stunden === "number" && pl.rto_stunden >= pl.mtpd_stunden)
      melde("warnung", "P10-planwerte", `${pb}/bcm/planung/rto_stunden`, "Planwerte: Die RTO muss kleiner sein als die MTPD (BSI-Standard 200-4); Reaktionszeit bis zum Ausrufen des Notfalls kommt hinzu.");

    // P8 überfälliger Bedarf
    (b.unterstuetzungsbedarf || []).forEach((u, j) => {
      if (["geplant", "angefordert"].includes(u.status) && nach(t0, u.bis))
        melde("warnung", "P8-bedarf", `${pb}/unterstuetzungsbedarf/${j}/bis`, "Bedarf ist überfällig und weder zugesagt noch gedeckt.");
    });

    // P11 Verweise des Moduls auf Kennzahlen des Sachverhalts
    const ids = new Set((sv.kennzahlen || []).map((k) => k.id));
    for (const [rolle, v] of Object.entries(b.kennzahlen || {}))
      if (typeof v === "string" && v !== "nicht_zutreffend" && !ids.has(v)) melde("fehler", "P11-kennzahl", `${pb}/kennzahlen/${rolle}`, `Verweis auf Kennzahl ${v}, die im Sachverhalt fehlt.`);
  });

  const fehlend = [...verwiesen].filter((q) => !definiert.has(q)).sort((a, b) => a.slice(1) - b.slice(1));
  if (fehlend.length) melde("warnung", "P4-quellen", "/quellen", `Verweis ohne Eintrag im Quellenverzeichnis: ${fehlend.map((q) => `[${q}]`).join(", ")}.`);
  return befunde;
}
