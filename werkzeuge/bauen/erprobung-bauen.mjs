// Baut die abgeleiteten Erprobungsunterlagen aus dem Szenario nach LEAD-Meldung-v2 (formate/lead-kritis-v2/szenario/, seit M4), damit Einspielungen, Stichprobe und Musterlösungen
// immer zu den Szenariodateien passen:
//   erprobung/einspielungen/NN_<stelle>.md   Lagekarte je Betreibermeldung (Fakten, kein Meldungstext)
//   erprobung/einspielungen/README.md        Übersicht mit Spielzeit und Realzeit
//   erprobung/boegen/herkunft-stichprobe.md  20 Angaben aus dem Lagebild zum Zuordnen (ohne Lösung)
//   erprobung/boegen/kodiervergleich.md      Bogen für zwei Personen je Referenzraum (Achsen aus dem Profil)
//   erprobung/spielleitung/loesungen.md      Musterlösungen: Szenariodatei je Einspielung, Lösung der Stichprobe
// Aufruf: node werkzeuge/bauen/erprobung-bauen.mjs [--pruefen]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const json = (p) => JSON.parse(lies(p));
const SZENARIO = "formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg";
const ILKA = "kern/lead-beispiel/beispiele/orkantief-ilka";
const STAND = "2026-10-14T10:30";
const FUSS = "\n\n---\nKRITIS-LEAD · Forschungsdemonstrator · alle Angaben fiktiv · CC BY 4.0 · erzeugt mit `node werkzeuge/bauen/erprobung-bauen.mjs`, nicht von Hand bearbeiten\n";

/** Zuordnung Spielzeit → Realzeit am Planspieltag T1 (Drehbuch, Abschnitt 3). */
export const ABLAUF = {
  "01": "10:00",
  "02": "10:20",
  "03": "10:40",
  "04": "11:00",
  "06": "11:30",
  "08": "13:00",
  "09": "13:20",
  "10": "13:40",
  "11": "14:00",
  "12": "14:20",
  "13": "14:40",
  "14": "15:00",
};

// Zeitpunkte nach LEAD-Meldung-v2 tragen den UTC-Versatz („2026-10-14T06:30+02:00“); angezeigt wird die Wanduhrzeit.
const zeit = (t) => {
  if (!t) return "–";
  const [d, h] = t.split("T");
  const [j, mo, ta] = d.split("-");
  return h ? `${ta}.${mo}.${j}, ${h.slice(0, 5)} Uhr` : `${ta}.${mo}.${j}`;
};
const kurzzeit = (t) => (t ? (t.length > 10 ? `${t.slice(8, 10)}.${t.slice(5, 7)}., ${t.slice(11, 16)} Uhr` : `${t.slice(8, 10)}.${t.slice(5, 7)}.`) : "–");
const ohneFiktiv = (t) => t.replace(/^FIKTIV – /, "").replace(/ \(FIKTIV\)/g, "").replace(/ \(Übungsrolle, FIKTIV\)/g, "");
const ANZEIGE = { eingeschraenkt: "eingeschränkt", notbetrieb: "Notbetrieb", geschaetzt: "geschätzt", gezaehlt: "gezählt", amtlich_gemeldet: "amtlich gemeldet", hochgerechnet: "hochgerechnet", prognostiziert: "prognostiziert", nicht_zutreffend: "nicht zutreffend", nicht_vorhanden: "nicht vorhanden", keine_prognose_moeglich: "keine Prognose möglich", zielzustand_erreicht: "Zielzustand erreicht", nicht_erforderlich: "nicht erforderlich", verfuegbar: "verfügbar", beeintraechtigt: "beeinträchtigt" };
const zeige = (w) => ANZEIGE[w] ?? w;
const zahl = (n) => (typeof n === "number" ? n.toLocaleString("de-DE") : n);

/** Rollen der Zahlen im Modul lead-kritis-betrieb (Verweis auf `kennzahlen[]` des Sachverhalts), Reihenfolge der Lagekarte. */
const ROLLEN = { betroffene_anschluesse: "Betroffene Anschlüsse", betroffene_personen: "Betroffene Personen", wiederversorgte_anschluesse: "Wiederversorgte Anschlüsse", standorte_ausgefallen: "Ausgefallene Standorte", standorte_netzersatz: "Standorte mit Netzersatz", betreibbare_betten: "Betreibbare Betten", verlegungsbedarf: "Verlegungsbedarf" };
const SEKTORFELD = { netzebene: "Netzebene", druckzonen_betroffen: "betroffene Druckzonen", abkochgebot: "Abkochgebot", notruf: "Notruf" };
const sektorangaben = (b) =>
  Object.values(b.sektor_angaben || {}).flatMap((o) =>
    Object.entries(o)
      .filter(([, v]) => v !== "" && v !== null)
      .map(([k, v]) => `${SEKTORFELD[k] || k}: ${zeige(String(v))}`),
  );

const betriebVon = (m) => m.sachverhalte[0].module?.["lead-kritis-betrieb"];
const kopfVon = (m) => m.module?.["lead-kritis-meldung"];
const istBetreiber = (m) => m.absender?.ebene === "Betreiber";

/** Kennzahl eines Sachverhalts als Text: Wert, Einheit, Gegenstand und Erhebung, ohne Hinweis. */
function kennzahl(k) {
  if (!k) return "–";
  return `${k.mindestwert ? "mindestens " : ""}${zahl(k.wert)} ${k.einheit} – ${k.gegenstand} (${zeige(k.erhebung)})`;
}

/** Zahl zu einer Rolle des Moduls: Kennzahl, „nicht zutreffend“ oder „unbekannt“ (Verweis null), mit Hinweis. */
function rollenwert(sv, b, rolle, { hinweis = true } = {}) {
  const ref = b.kennzahlen?.[rolle];
  const text = ref === "nicht_zutreffend" ? "nicht zutreffend" : ref ? kennzahl((sv.kennzahlen || []).find((k) => k.id === ref)) : "unbekannt";
  const h = hinweis ? b.kennzahlen_hinweise?.[rolle] : "";
  return `${text}${h ? `; ${h}` : ""}`;
}

function lagekarte(nr, m, vorgaenger) {
  const k = kopfVon(m);
  const sv = m.sachverhalte[0];
  const b = betriebVon(m);
  const z = [];
  z.push(`# Einspielung ${nr} – ${ohneFiktiv(m.absender.stelle)}`);
  z.push("");
  z.push(`**Spielzeit ${zeit(m.meldezeitpunkt)}** · Realzeit am Planspieltag ${ABLAUF[nr]} Uhr · ${k.meldeart} · nur fiktive Angaben`);
  z.push("");
  z.push("## Auftrag");
  z.push("");
  if (k.meldeart === "Erstmeldung") z.push(`Erfassen Sie im Betreiberformular eine **Erstmeldung** („Neue Meldung“). Meldezeitpunkt ist die Spielzeit, nicht die Uhrzeit des Planspieltags.`);
  else if (k.meldeart === "Folgemeldung") z.push(`Öffnen Sie Ihre ausgegebene Meldung von ${kurzzeit(vorgaenger?.meldezeitpunkt)} mit „Meldung öffnen“ → „Vormeldung fortschreiben“; daraus entsteht eine **Folgemeldung**. Meldezeitpunkt ist die Spielzeit. Tragen Sie unter „Änderung zur Vormeldung“ ein, was sich geändert hat, und aktualisieren Sie alle Datenstände.`);
  else z.push(`Wählen Sie im ersten Schritt die Meldeart **${k.meldeart}** und laden Sie dann mit „Vormeldung laden“ Ihre ausgegebene Meldung von ${kurzzeit(vorgaenger?.meldezeitpunkt)}. Meldezeitpunkt ist die Spielzeit. ${k.meldeart === "Abschlussmeldung" ? "Tragen Sie unter „Abschluss“ Ergebnis, offene Punkte und Nachsorge ein." : "Tragen Sie unter „Änderung zur Vormeldung“ ein, was Sie berichtigen."}`);
  if (k.meldeart === "Korrekturmeldung" && vorgaenger) {
    const svAlt = vorgaenger.sachverhalte[0];
    const alt = betriebVon(vorgaenger);
    const falsch = Object.entries(ROLLEN)
      .map(([r, label]) => ({ label, a: rollenwert(svAlt, alt, r, { hinweis: false }), n: rollenwert(sv, b, r, { hinweis: false }) }))
      .filter((x) => x.a !== x.n);
    if (falsch.length) z.push("", `Ihre Vormeldung enthielt einen Fehler: ${falsch.map((x) => `${x.label} „${x.a}“, richtig ist „${x.n}“`).join("; ")}. Berichtigen Sie nur das und vermerken Sie die Berichtigung.`);
  }
  z.push("");
  z.push("Geben Sie die Meldung als JSON-Datei aus und senden Sie sie an die Funktionsadresse der Spielleitung. Notieren Sie Beginn und Ende im Selbstprotokoll.");
  z.push("");
  z.push(`## Lage aus Sicht Ihrer Leitwarte (Stand ${zeit(b.ist.stand)})`);
  z.push("");
  const p = (t) => z.push(`- ${t}`);
  p(`Betreiber: ${b.betreiber.name}; Trägerschaft ${b.betreiber.traegerschaft || "–"}; Land ${m.absender.gebiet.name}`);
  p(`Sektor ${b.sektor}; kritische Dienstleistung: ${b.kritische_dienstleistung}${b.anlage?.bezeichnung ? `; Anlage: ${b.anlage.bezeichnung}${b.anlage.kennung_betreiber ? ` (${b.anlage.kennung_betreiber})` : ""}` : ""}`);
  p(`Versorgungsgebiet: ${sv.raum.beschreibung}${sv.raum.gebiete?.length ? `; Gebietsschlüssel ${sv.raum.gebiete.map((g) => `${g.schluessel} (${g.name})`).join(", ")}` : ""}`);
  p(`Ausfallbeginn (Eintritt): ${zeit(sv.eintritt?.zeit)}${sv.eintritt?.genauigkeit && sv.eintritt.genauigkeit !== "belegt" ? ` (${sv.eintritt.genauigkeit})` : ""}`);
  p(`Leistungsgrad: ${zeige(b.ist.leistungsgrad)}${typeof b.ist.leistungsgrad_prozent === "number" ? ` (${b.ist.leistungsgrad_prozent} % – ${b.ist.leistungsbasis})` : ""}${b.ist.eskalationsstufe_betrieblich ? `; betriebliche Eskalationsstufe ${b.ist.eskalationsstufe_betrieblich}` : ""}`);
  for (const [r, label] of Object.entries(ROLLEN)) if (b.kennzahlen && r in b.kennzahlen) p(`${label}: ${rollenwert(sv, b, r)}`);
  for (const a of sektorangaben(b)) p(`Sektorangabe ${a}`);
  if (b.ist.einrichtungen?.length) p(`Einrichtungen mit besonderem Bedarf: ${b.ist.einrichtungen.join("; ")}`);
  for (const e of b.ersatzverfahren || []) p(`Ersatzverfahren: ${e.art}, ${zeige(e.status)}${typeof e.traegt_leistungsgrad_prozent === "number" ? `, trägt ${e.traegt_leistungsgrad_prozent} %` : ""}${e.reichweite_bis ? `, Reichweite bis ${zeit(e.reichweite_bis)}` : ""}${e.bedingung ? ` (${e.bedingung})` : ""}`);
  const pr = b.prognose;
  if (pr.status === "prognose") p(`Prognose, Geber ${pr.geber}: ${pr.zielzustand} frühestens ${zeit(pr.fruehestens)}, spätestens ${zeit(pr.spaetestens)}; Unsicherheit ${pr.unsicherheit || "–"}${pr.begruendung ? `; ${pr.begruendung}` : ""}`);
  else p(`Prognose: ${zeige(pr.status)}${pr.zielzustand ? ` – ${pr.zielzustand}` : ""}${pr.begruendung ? `; ${pr.begruendung}` : ""}`);
  for (const u of b.unterstuetzungsbedarf || []) p(`Unterstützungsbedarf: ${u.leistung}${u.menge ? `, ${u.menge}` : ""}${u.bis ? `, bis ${zeit(u.bis)}` : ""}${u.adressat ? `, an ${ohneFiktiv(u.adressat)}` : ""}; Status ${u.status}`);
  for (const x of sv.handlungsbedarf?.massnahmen || []) p(`Eigene Maßnahme: ${x.gegenstand}; Status ${x.status}${x.stand ? `, Stand ${kurzzeit(x.stand)}` : ""}`);
  for (const f of sv.handlungsbedarf?.fristen || []) p(`Frist: ${f.aufgabe} bis ${zeit(f.bis)}${f.adressat ? `, an ${ohneFiktiv(f.adressat)}` : ""}${f.bedingung ? ` (${f.bedingung})` : ""}`);
  for (const a of b.abhaengigkeiten || []) p(`Abhängigkeit (${a.richtung}): ${a.dienstleistung}, ${zeige(a.zustand)}${a.puffer ? `; Puffer ${a.puffer}` : ""}${a.betroffene_stelle ? `; ${ohneFiktiv(a.betroffene_stelle)}` : ""}`);
  if (b.bcm) {
    const bc = b.bcm;
    p(`BCM (Selbstauskunft): ${[bc.umsetzungsstand, bc.notfallplaene && `Notfallpläne ${bc.notfallplaene}`, bc.standardbezug && `orientiert an ${bc.standardbezug}`, bc.zertifizierung].filter(Boolean).join("; ") || "–"}`);
    const pl = bc.planung;
    if (pl && (typeof pl.rto_stunden === "number" || typeof pl.mtpd_stunden === "number" || pl.notbetriebsniveau?.beschreibung))
      p(`Planwerte aus der Vorsorge (keine Prognose) für ${pl.bezug}, nach ${pl.grundlage}: ${[typeof pl.mtpd_stunden === "number" ? `MTPD ${pl.mtpd_stunden} h ab Ausfallbeginn` : "", typeof pl.rto_stunden === "number" ? `RTO ${pl.rto_stunden} h ab Ausrufen des Notfalls` : "", pl.notbetriebsniveau?.beschreibung ? `Notbetriebsniveau: ${pl.notbetriebsniveau.beschreibung}${typeof pl.notbetriebsniveau.prozent === "number" ? ` (${pl.notbetriebsniveau.prozent} % der ${pl.notbetriebsniveau.bezugsgroesse})` : ""}` : ""].filter(Boolean).join("; ")}${pl.stand ? `; Stand des Dokuments ${zeit(pl.stand)}` : ""}`);
  }
  if (b.ursache) p(`Ursache (${b.ursache.status}): ${b.ursache.kurz}`);
  if (b.abschluss) p(`Abschluss: ${b.abschluss.ergebnis}${b.abschluss.offene_punkte ? `; offene Punkte: ${b.abschluss.offene_punkte}` : ""}${b.abschluss.nachsorge ? `; Nachsorge: ${b.abschluss.nachsorge}` : ""}`);
  for (const g of k.gemeldet_an || []) p(`Parallele Pflichtmeldung (fiktiv, nur dokumentieren): ${ohneFiktiv(g.stelle)}, ${g.rechtsgrundlage}, ${zeige(g.status)}${g.zeitpunkt ? `, ${zeit(g.zeitpunkt)}` : ""}${g.kennzeichen ? `, ${g.kennzeichen}` : ""}`);
  p(`Empfänger: ${(k.empfaenger || []).map(ohneFiktiv).join("; ") || "–"}; Kontaktstelle: ${k.kontaktstelle || "–"}`);
  p(`Bestätigungsgrad: ${b.bestaetigungsgrad}`);
  z.push("");
  z.push("## Hinweise");
  z.push("");
  z.push(`- Meldeanlass laut Drehbuch: ${k.meldeanlass.join(", ")}.`);
  z.push("- Ihre Einschätzung aus Sicht des Betriebs schreiben Sie als Text in „Betriebliche Einschätzung“.");
  z.push("- Ist, Prognose und Planwerte getrennt halten; jede Zahl mit Datenstand; Reichweite nur mit Bedingung.");
  z.push("- Quelle Ihrer Angaben: Betriebstagebuch der Leitwarte (Kategorie B, Zugang betriebsintern, fiktiv).");
  return z.join("\n") + FUSS;
}

function stichprobe(meldungen, ilka) {
  const angaben = [];
  const bis = Date.parse(`${STAND}:00+02:00`);
  for (const m of meldungen.filter((x) => Date.parse(x.daten.meldezeitpunkt) <= bis)) {
    const sv = m.daten.sachverhalte[0];
    if (istBetreiber(m.daten)) {
      const b = betriebVon(m.daten);
      // erste Zahl mit Wert in der Reihenfolge der Rollen (wie bisher: Anschlüsse, Personen, dann Sektorzahlen)
      const ref = Object.keys(ROLLEN).map((r) => b.kennzahlen?.[r]).find((x) => x && x !== "nicht_zutreffend");
      const w = (sv.kennzahlen || []).find((k) => k.id === ref);
      const anteil = typeof b.ist.leistungsgrad_prozent === "number" ? ` (${b.ist.leistungsgrad_prozent} %)` : "";
      angaben.push({ text: `${b.kritische_dienstleistung}: Leistungsgrad ${zeige(b.ist.leistungsgrad)}${anteil}${w ? `; ${kennzahl(w)}` : ""}, Stand ${kurzzeit(w?.datenstand || b.ist.stand)}`, herkunft: "Betreiber", datei: m.name });
      const e = (b.ersatzverfahren || []).find((x) => x.reichweite_bis);
      if (e) angaben.push({ text: `${e.art}: ${zeige(e.status)}, Reichweite bis ${kurzzeit(e.reichweite_bis)} (${e.bedingung})`, herkunft: "Betreiber", datei: m.name });
      else if (b.prognose.status === "prognose") angaben.push({ text: `${b.prognose.zielzustand}: frühestens ${kurzzeit(b.prognose.fruehestens)}, spätestens ${kurzzeit(b.prognose.spaetestens)}`, herkunft: "Betreiber", datei: m.name });
    } else {
      angaben.push({ text: ohneFiktiv(sv.bezeichnung), herkunft: "Behörde", datei: m.name });
    }
  }
  for (const i of ilka) for (const sv of i.daten.sachverhalte) angaben.push({ text: sv.bezeichnung, herkunft: "Behörde", datei: i.name });
  const h = (t) => createHash("sha256").update(t).digest("hex");
  return angaben.sort((a, b) => h(a.text).localeCompare(h(b.text))).slice(0, 20);
}

export function baueErprobung() {
  const dateien = readdirSync(pfad(SZENARIO)).filter((n) => n.endsWith(".json")).sort();
  const meldungen = dateien.map((n) => ({ name: n, nr: n.slice(0, 2), daten: json(`${SZENARIO}/${n}`) }));
  const ilka = readdirSync(pfad(ILKA)).filter((n) => n.endsWith(".json")).sort().map((n) => ({ name: n, daten: json(`${ILKA}/${n}`) }));
  const nachId = new Map(meldungen.map((m) => [m.daten.meldung_id, m.daten]));
  const betreiber = meldungen.filter((m) => istBetreiber(m.daten));
  const vormeldung = (m) => nachId.get((m.beziehungen || []).find((b) => ["fortschreibung_von", "berichtigung_von"].includes(b.art))?.meldung_id);
  const out = {};

  // Einspielungen
  const slug = (m) => m.name.replace(/\.json$/, "").replace(/_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}/, "");
  for (const m of betreiber) {
    if (!ABLAUF[m.nr]) throw new Error(`Einspielung ${m.nr} ohne Realzeit im Ablauf`);
    out[`erprobung/einspielungen/${slug(m)}.md`] = lagekarte(m.nr, m.daten, vormeldung(m.daten));
  }
  const uebersicht = [
    "# Einspielungen für Betreiber",
    "",
    "Je Betreibermeldung des Szenarios eine Lagekarte mit den Fakten, die die Leitwarte zur Spielzeit kennt. Die Karten enthalten keinen Meldungstext: Formulieren und Erfassen ist Aufgabe der Teilnehmenden. Die Spielleitung gibt jede Karte zur Realzeit aus ([Drehbuch](../DREHBUCH.md), Abschnitt 3); die Musterlösung ist die Szenariodatei ([Lösungen](../spielleitung/loesungen.md)).",
    "",
    "| Nr. | Realzeit T1 | Spielzeit | Rolle | Meldeart | Karte |",
    "| --- | --- | --- | --- | --- | --- |",
    ...betreiber.map((m) => `| ${m.nr} | ${ABLAUF[m.nr]} | ${kurzzeit(m.daten.meldezeitpunkt)} | ${ohneFiktiv(m.daten.absender.stelle)} | ${kopfVon(m.daten).meldeart} | [${slug(m)}.md](${slug(m)}.md) |`),
    "",
    "Behördenmeldungen spielt die Spielleitung ein, sie werden nicht erfasst: 05 Leitstelle (Spielzeit 14.10., 07:45 Uhr) und 07 Krisenstab, Lagemeldung Nr. 4 (14.10., 08:30 Uhr), dazu die Ländermeldungen des Ilka-Datensatzes.",
  ].join("\n") + FUSS;
  out["erprobung/einspielungen/README.md"] = uebersicht;

  // Herkunft
  const sp = stichprobe(meldungen, ilka);
  out["erprobung/boegen/herkunft-stichprobe.md"] = [
    "# Bogen Herkunft: 20 Angaben aus dem Lagebild",
    "",
    "Für Teilnehmende der Lagezentren nach dem Erstellen der Landesmeldung (Drehbuch, Abschnitt 4). Die Angaben stammen aus dem Meldungssatz der Landesmeldung (Szenario bis 14.10.2026, 10:30 Uhr, und Ländermeldungen des Ilka-Datensatzes). Ordnen Sie jede Angabe so zu, wie das Lagebild in KI-LEAD sie zeigt: Stammt sie aus der Meldung eines **Betreibers** oder einer **Behörde**? Suchen Sie die Angabe im Lagebild; raten Sie nicht. Zielwert: mindestens 95 % richtig.",
    "",
    "Lagezentrum (Kürzel, ohne Namen): ______  Person: A / B  Dauer: ____ min",
    "",
    "| Nr. | Angabe | Betreiber | Behörde | nicht erkennbar |",
    "| --- | --- | --- | --- | --- |",
    ...sp.map((a, i) => `| ${i + 1} | ${a.text} | ☐ | ☐ | ☐ |`),
    "",
    "Was hat die Zuordnung erleichtert oder erschwert?",
    "",
    "______________________________________________",
  ].join("\n") + FUSS;

  // Kodiervergleich
  const ui = json("profil/lead-kritis/meldung.ui.json");
  const achsen = ui.radare.lagenradar.achsen;
  out["erprobung/boegen/kodiervergleich.md"] = [
    "# Bogen Kodiervergleich",
    "",
    "Zwei Personen eines Lagezentrums kodieren denselben Referenzraum unabhängig voneinander, ohne Absprache und ohne KI (Drehbuch, Abschnitt 4). Referenzraum im Planspiel: Land Thüringen, Sachverhalt Stromausfall im Landkreis Sonneberg, Stand 14.10.2026, 10:30 Uhr. Grundlage: Kodierleitfaden im Profilpaket lead-kritis mit Anhang K. Stufen 0 bis 6 nach Lagenradar; „–“ für nicht kodierbar.",
    "",
    "Lagezentrum (Kürzel, ohne Namen): ______",
    "",
    "| Achse | Person A | Person B | Abweichung (Stufen) | Begründung bei Abweichung > 1 |",
    "| --- | --- | --- | --- | --- |",
    ...achsen.map((a) => `| ${a.label} |  |  |  |  |`),
    "| Beurteilung (geringfügig / erheblich / kritisch) |  |  | gleich ☐ |  |",
    "| Tendenz (Entspannung / Stabilisierung / Verschärfung) |  |  | gleich ☐ |  |",
    "",
    `Auswertung: Anteil der Achsen mit Abweichung ≤ 1 Stufe = ____ von ${achsen.length} (Zielwert ≥ 80 %). Abweichungen werden begründet, nicht bereinigt.`,
  ].join("\n") + FUSS;

  // Lösungen für die Spielleitung
  out["erprobung/spielleitung/loesungen.md"] = [
    "# Musterlösungen für die Spielleitung",
    "",
    "Nicht an Teilnehmende ausgeben, bevor ihre Ergebnisse abgegeben sind.",
    "",
    "## Einspielungen",
    "",
    "Die Musterlösung jeder Einspielung ist die Szenariodatei. Abweichungen in Formulierung, Meldungs-ID und Bezug sind erwartet; geprüft werden Struktur (`npm run pruefen`), Zeitarten und die Trennung von Angabe und Bewertung.",
    "",
    "| Nr. | Einspielung | Musterlösung |",
    "| --- | --- | --- |",
    ...betreiber.map((m) => `| ${m.nr} | [${slug(m)}](../einspielungen/${slug(m)}.md) | [\`${m.name}\`](../../${SZENARIO}/${m.name}) |`),
    "",
    "## Landesmeldung",
    "",
    "Musterlösung ist der Sachverhalt `DE-TH-20261014-P5VN` der Thüringer Ilka-Meldung (`kern/lead-beispiel/beispiele/orkantief-ilka/LEAD-Meldung_TH_2026-10-14T10-30_FIKTIV_Orkantief-Ilka.json`). Kernaussage für das Kriterium Nutzen: Mehrere Notstrompuffer (Trinkwasser, Mobilfunk, Pflege) enden vor der Wiederversorgung; Kraftstoff ist die gemeinsame Engpassressource.",
    "",
    "## Bogen Herkunft",
    "",
    "| Nr. | Herkunft | Datei |",
    "| --- | --- | --- |",
    ...sp.map((a, i) => `| ${i + 1} | ${a.herkunft} | \`${a.datei}\` |`),
    "",
    `Verteilung: ${sp.filter((a) => a.herkunft === "Betreiber").length} Betreiber, ${sp.filter((a) => a.herkunft === "Behörde").length} Behörde.`,
  ].join("\n") + FUSS;
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = baueErprobung();
  if (process.argv.includes("--pruefen")) {
    const vorhanden = existsSync(pfad("erprobung/einspielungen")) ? readdirSync(pfad("erprobung/einspielungen")).map((n) => `erprobung/einspielungen/${n}`) : [];
    const ueberzaehlig = vorhanden.filter((p) => !(p in out));
    const abweichend = Object.entries(out).filter(([p, t]) => !existsSync(pfad(p)) || lies(p) !== t).map(([p]) => p);
    if (ueberzaehlig.length || abweichend.length) {
      console.error(`Erprobungsunterlagen nicht aktuell (npm run bauen): ${[...abweichend, ...ueberzaehlig].join(", ")}`);
      process.exit(1);
    }
    console.log(`${Object.keys(out).length} Erprobungsunterlagen entsprechen dem Szenario.`);
  } else {
    rmSync(pfad("erprobung/einspielungen"), { recursive: true, force: true });
    for (const [p, t] of Object.entries(out)) {
      mkdirSync(pfad(p.split("/").slice(0, -1).join("/")), { recursive: true });
      writeFileSync(pfad(p), t);
    }
    console.log(`${Object.keys(out).length} Erprobungsunterlagen geschrieben.`);
  }
}
