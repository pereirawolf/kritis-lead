// Plausibilitätsregeln über Zeitfolgen, Verweise und Kennsätze. Ohne Abhängigkeiten, damit dasselbe Modul im
// Prüfwerkzeug und im Betreiberformular läuft. Erwartet eine schemagültige Meldung (Profilschema LEAD-KRITIS-Meldung).
// Wanduhrzeiten JJJJ-MM-TTThh:mm derselben Zeitzone lassen sich als Text vergleichen.

const WANDUHR = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const zeit = (v) => (typeof v === "string" && WANDUHR.test(v) ? v : "");
const text = (v) => (typeof v === "string" ? v : "");

/** Liefert Befunde {stufe: "fehler"|"warnung", regel, pfad, text}. */
export function pruefePlausibilitaet(m) {
  const befunde = [];
  const melde = (stufe, regel, pfad, t) => befunde.push({ stufe, regel, pfad, text: t });
  if (!m || typeof m !== "object") return befunde;
  const mz = zeit(m.meldezeitpunkt);
  const art = m.kritis?.meldeart || "";

  // P5 Meldezeitraum
  const von = zeit(m.meldezeitraum?.von);
  const bis = zeit(m.meldezeitraum?.bis);
  if (von && bis && von > bis) melde("fehler", "P5-meldezeitraum", "/meldezeitraum", "Meldezeitraum: „von“ liegt nach „bis“.");
  if (bis && mz && bis > mz) melde("warnung", "P5-meldezeitraum", "/meldezeitraum/bis", "Meldezeitraum endet nach dem Meldezeitpunkt.");

  // P4 Quellenverweise
  const definiert = new Set([...text(m.quellen).matchAll(/^\s*\[Q(\d+)\]/gm)].map((x) => x[1]));
  const verweise = new Set();
  const sammle = (t) => {
    for (const x of text(t).matchAll(/\[(Q[\d,\s–\-Q]+)\]/g))
      for (const n of x[1].matchAll(/Q?(\d+)/g)) verweise.add(n[1]);
  };
  sammle(m.zeitstrahl);

  (m.sachverhalte || []).forEach((sv, i) => {
    const p = `/sachverhalte/${i}`;
    for (const t of Object.values(sv.analyse || {})) sammle(t);
    sammle(sv.sofort?.bewertung_text);
    const bt = text(sv.sofort?.bewertung_text);

    // P6/P7 Kennsätze je Meldeart
    if ((art === "Folgemeldung" || art === "Korrekturmeldung") && !/^Änderung zur Vormeldung:/m.test(bt))
      melde("warnung", "P6-aenderung", `${p}/sofort/bewertung_text`, `${art} ohne Kennsatz „Änderung zur Vormeldung:“.`);
    if (art === "Abschlussmeldung" && !/^Abschluss im Lagebild:/m.test(bt))
      melde("warnung", "P7-abschluss", `${p}/sofort/bewertung_text`, "Abschlussmeldung ohne Kennsatz „Abschluss im Lagebild:“.");

    const b = sv.betrieb;
    if (!b) return;
    const pb = `${p}/betrieb`;
    if (art === "Abschlussmeldung" && b.prognose?.status !== "zielzustand_erreicht")
      melde("warnung", "P7-abschluss", `${pb}/prognose/status`, "Abschlussmeldung, aber Prognose nicht „zielzustand_erreicht“.");

    // P3 Datenstände nicht nach dem Meldezeitpunkt
    const staende = [
      [`${pb}/ist/stand`, b.ist?.stand],
      [`${pb}/prognose/stand`, b.prognose?.stand],
      ...(b.ersatzverfahren || []).map((e, j) => [`${pb}/ersatzverfahren/${j}/stand`, e.stand]),
    ];
    for (const [q, s] of staende) if (zeit(s) && mz && zeit(s) > mz) melde("fehler", "P3-stand", q, "Datenstand liegt nach dem Meldezeitpunkt.");
    if (zeit(b.ist?.beginn) && zeit(b.ist?.stand) && b.ist.beginn > b.ist.stand) melde("fehler", "P3-stand", `${pb}/ist/beginn`, "Ausfallbeginn liegt nach dem Datenstand.");

    // P9 Einschränkung ohne Beginn
    if (["eingeschraenkt", "notbetrieb", "ausgefallen"].includes(b.ist?.leistungsgrad) && !zeit(b.ist?.beginn))
      melde("warnung", "P9-beginn", `${pb}/ist/beginn`, "Leistung eingeschränkt, aber kein Beginn angegeben.");

    // P1 Prognoseintervall
    const fr = zeit(b.prognose?.fruehestens);
    const sp = zeit(b.prognose?.spaetestens);
    if (fr && sp && fr > sp) melde("fehler", "P1-prognose", `${pb}/prognose/fruehestens`, "Prognose: „frühestens“ liegt nach „spätestens“.");
    if (b.prognose?.status === "prognose" && !fr && !sp) melde("warnung", "P1-prognose", `${pb}/prognose`, "Prognose ohne Zeitangabe; sonst „keine Prognose möglich“ wählen.");

    // P2 Reichweiten
    (b.ersatzverfahren || []).forEach((e, j) => {
      const r = zeit(e.reichweite_bis);
      if (r && zeit(e.stand) && r < e.stand) melde("warnung", "P2-reichweite", `${pb}/ersatzverfahren/${j}/reichweite_bis`, "Reichweite endet vor dem Datenstand.");
      if (r && !text(e.bedingung).trim()) melde("warnung", "P2-reichweite", `${pb}/ersatzverfahren/${j}/bedingung`, "Reichweite ohne Bedingung.");
    });

    // P8 überfälliger Bedarf
    (b.unterstuetzungsbedarf || []).forEach((u, j) => {
      if (["geplant", "angefordert"].includes(u.status) && zeit(u.bis) && mz && u.bis < mz)
        melde("warnung", "P8-bedarf", `${pb}/unterstuetzungsbedarf/${j}/bis`, "Bedarf ist überfällig und weder zugesagt noch gedeckt.");
    });
  });

  const fehlend = [...verweise].filter((n) => !definiert.has(n)).sort((a, b) => a - b);
  if (fehlend.length) melde("warnung", "P4-quellen", "/quellen", `Verweis ohne Eintrag im Quellenverzeichnis: ${fehlend.map((n) => `[Q${n}]`).join(", ")}.`);
  return befunde;
}
