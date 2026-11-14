// Trockenlauf mit dem ganzen Szenario (Meilenstein M4): spielt Orkantief „Ilka“ im Landkreis Sonneberg einmal ohne
// Teilnehmende durch und misst die Erfolgskriterien, die sich ohne Planspiel messen lassen.
//   1. Betreiberformular: jede Betreibermeldung des Szenarios wird im Formular geöffnet, durch alle Schritte geführt,
//      geprüft und ausgegeben; die Ausgabe muss bis auf den Herkunftsnachweis (entstehung) unverändert und gültig sein.
//      Seit 0.4 (M3) mit dem Szenario nach LEAD-Meldung-v2 (formate/lead-kritis-v2/szenario/).
//   2. Prüfwerkzeug: Schema, Rollen, Plausibilität und Nachrichtenidentität über das Szenario nach LEAD-Meldung-v2 (seit M4).
//   3. Zweiter Prüfweg: gleiches Urteil des KI-LEAD-Prüfers für alle Konformitätsfälle nach LEAD-Meldung-v2 und Überführung
//      des Ilka-Datensatzes (seit M4). Schritt 4 folgt mit dem Profilpaket nach v2 (M4-2).
//   4. Lagebild in KI-LEAD: Profilpaket laden, beide Beispiele einlesen, Herkunft je Meldung.
// Ergebnis: erprobung/trockenlauf/ergebnis.json und ergebnis.md (ohne Zeitstempel, daher prüfbar).
// Aufruf: KI_LEAD_DIR=<Klon am gepinnten Commit, mit node_modules> npm run trockenlauf [-- --pruefen]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pruefeMeldung, pruefeSatz } from "../pruefen/v2/pruefen.mjs";

const wurzel = fileURLToPath(new URL("../../", import.meta.url));
const pfad = (p) => join(wurzel, p);
const json = (p) => JSON.parse(readFileSync(pfad(p), "utf-8"));
const ZIEL = "erprobung/trockenlauf";
const SZENARIO_V2 = "formate/lead-kritis-v2/szenario/orkantief-ilka-sonneberg";
const SPEICHER = "kritis-lead-betreiberformular-entwurf-v2";
const KRAFTSTOFF = /diesel|kraftstoff|betankung/i;

const kiLead = process.env.KI_LEAD_DIR;
if (!kiLead) {
  console.error("KI_LEAD_DIR fehlt: Klon von pereirawolf/ki-lead am Commit aus kern/quelle.json, dort npm ci --ignore-scripts.");
  process.exit(2);
}
const quelle = json("kern/quelle.json");
const paket = json("package.json");
const profil = json("profil/lead-kritis/profil.json");
const tsx = (skript) => JSON.parse(execFileSync(process.execPath, ["--import", "tsx", skript], { cwd: wurzel, encoding: "utf-8", env: process.env, maxBuffer: 64 * 1024 * 1024 }));

const meldungen = readdirSync(pfad(SZENARIO_V2))
  .filter((n) => n.endsWith(".json"))
  .sort()
  .map((n) => ({ name: n, daten: json(`${SZENARIO_V2}/${n}`) }));
const betreiber = meldungen.filter((m) => m.daten.absender?.ebene === "Betreiber");
const betriebVon = (s) => s.module?.["lead-kritis-betrieb"];
const ohneHerkunft = ({ entstehung, ...rest }) => rest;

// ── 1. Betreiberformular ─────────────────────────────
async function formularlauf() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const ablage = mkdtempSync(join(tmpdir(), "kritis-trockenlauf-"));
  const url = pathToFileURL(pfad("formular/betreibermeldung.html")).href;
  const ergebnisse = [];
  try {
    for (const m of betreiber) {
      const kontext = await browser.newContext({ acceptDownloads: true, offline: true });
      await kontext.addInitScript(([k, v]) => { if (!sessionStorage.getItem("geladen")) { localStorage.setItem(k, v); sessionStorage.setItem("geladen", "1"); } }, [SPEICHER, JSON.stringify(m.daten)]);
      const seite = await kontext.newPage();
      const fehler = [];
      seite.on("pageerror", (e) => fehler.push(e.message));
      await seite.goto(url);
      const schritte = seite.locator(".schritte button");
      const anzahl = await schritte.count();
      for (let i = 0; i < anzahl; i++) await seite.locator(".schritte button").nth(i).click();
      const befunde = await seite.locator(".befund").allTextContents();
      const knopf = seite.locator("#ausgeben");
      let ausgabe = null;
      if (await knopf.isEnabled()) {
        const [download] = await Promise.all([seite.waitForEvent("download"), knopf.click()]);
        const ziel = join(ablage, m.name);
        await download.saveAs(ziel);
        ausgabe = JSON.parse(readFileSync(ziel, "utf-8"));
      }
      const r = ausgabe ? pruefeMeldung(ausgabe) : null;
      ergebnisse.push({
        datei: m.name,
        meldeart: m.daten.module["lead-kritis-meldung"].meldeart,
        schritte: anzahl,
        befundeImFormular: befunde.length,
        ausgegeben: !!ausgabe,
        unveraendert: !!ausgabe && JSON.stringify(ohneHerkunft(ausgabe)) === JSON.stringify(ohneHerkunft(m.daten)),
        gueltig: !!r?.gueltig,
        skriptfehler: fehler.length,
      });
      await kontext.close();
    }
  } finally {
    await browser.close();
  }
  return ergebnisse;
}

// ── 2. Prüfwerkzeug ──────────────────────────────────
function pruefwerkzeug() {
  const je = meldungen.map((m) => {
    const r = pruefeMeldung(m.daten);
    return {
      datei: m.name,
      rolle: r.rolle,
      gueltig: r.gueltig,
      fehler: r.befunde.filter((b) => b.stufe === "fehler").length,
      warnungen: r.befunde.filter((b) => b.stufe === "warnung").length,
    };
  });
  const satz = pruefeSatz(meldungen);
  return { je, satzFehler: satz.filter((b) => b.stufe === "fehler").length, satzWarnungen: satz.filter((b) => b.stufe === "warnung").length };
}

// ── 3. Zweiter Prüfweg ───────────────────────────────
function pruefwege() {
  const ki = tsx("werkzeuge/pruefen/ki-lead-pruefweg-v2.mts");
  const faelle = ki.faelle.map((f) => {
    const eigen = pruefeMeldung(json(f.datei)).gueltig;
    return { datei: f.datei, kritisLead: eigen, kiLead: f.gueltig, gleich: eigen === f.gueltig };
  });
  const rollenfaelle = faelle.filter((f) => /negativ\/betreiber-mit-(beurteilung|tendenz|lagenradar)/.test(f.datei));
  return {
    schemaFehler: ki.schemaFehler ? String(ki.schemaFehler) : null,
    faelle,
    rollentreue: rollenfaelle.map((f) => ({ datei: f.datei, angenommen: f.kritisLead || f.kiLead })),
    ilkaGueltig: ki.ilka.filter((i) => i.gueltig).length,
    ilka: ki.ilka.length,
  };
}

// ── 4. Lagebild in KI-LEAD ───────────────────────────
function lagebild() {
  const l = tsx("werkzeuge/pruefen/ladeprobe.mts");
  return {
    profilGeladen: l.profilGeladen,
    profilBefunde: l.befunde.filter((b) => b.stufe !== "hinweis").length,
    zip: l.zip,
    beispiele: l.beispiele.map((b) => ({
      ordner: b.ordner,
      meldungen: b.eintraege.length,
      betreiber: b.eintraege.filter((e) => e.rolle === "Betreiber").length,
      ohneUmformatierung: b.eintraege.filter((e) => !e.fremd && e.schemabefunde === 0).length,
      herkunftRichtig: b.eintraege.filter((e) => e.herkunftsanzeige === (e.rolle === "Betreiber" ? "Betreiber (B)" : "Behörde (A)")).length,
      sachverhalte: b.sachverhalte,
      einlesefehler: b.einlesefehler.length,
      kennungsbefunde: b.kennungen.filter((k) => k.art !== "fortschreibung").length,
      rohtabelleJson: b.rohtabelleJson,
    })),
  };
}

// ── Kriterien ────────────────────────────────────────
function kriterien(e) {
  const quote = (a, b) => `${a} von ${b}`;
  const [stand, verlauf] = e.lagebild.beispiele;
  // Rollentreue nach R1: keine Beurteilungsstufe, keine Tendenzrichtung, kein Modul lead-bevoelkerungsschutz (Lagenradar)
  const betreiberMitBewertung = betreiber.filter((m) =>
    m.daten.sachverhalte.some((s) => s.bewertung?.beurteilung?.stufe || s.bewertung?.tendenz?.richtung || s.module?.["lead-bevoelkerungsschutz"]),
  ).length;
  const angenommen = e.pruefwege.rollentreue.filter((r) => r.angenommen).length;
  const bisStand = (m) => Date.parse(m.daten.meldezeitpunkt) <= Date.parse("2026-10-14T10:30:00+02:00");
  const kraftstoff = betreiber.filter((m) => bisStand(m) && m.daten.sachverhalte.some((s) => (betriebVon(s)?.unterstuetzungsbedarf || []).some((u) => KRAFTSTOFF.test(`${u.leistung} ${u.menge || ""}`))));
  const gleich = e.pruefwege.faelle.filter((f) => f.gleich).length;
  const formOk = e.formular.filter((f) => f.ausgegeben && f.unveraendert && f.gueltig && f.skriptfehler === 0).length;
  return [
    { bereich: "Nahtlosigkeit", kriterium: "Meldungen ohne Umformatierung im Lagebild (Verlauf: Szenario und Ilka)", ziel: "100 %", wert: quote(verlauf.ohneUmformatierung, verlauf.meldungen), erfuellt: verlauf.ohneUmformatierung === verlauf.meldungen && stand.ohneUmformatierung === stand.meldungen },
    { bereich: "Prüfwege", kriterium: "gleiches Urteil Prüfwerkzeug und KI-LEAD je Konformitätsfall", ziel: "100 %", wert: quote(gleich, e.pruefwege.faelle.length), erfuellt: gleich === e.pruefwege.faelle.length },
    { bereich: "Rollentreue", kriterium: "Betreibermeldungen mit Beurteilung, Tendenz oder Lagenradar angenommen (Negativfälle R1 nach LEAD-Meldung-v2; Szenario)", ziel: "0", wert: `${angenommen} von ${e.pruefwege.rollentreue.length} Negativfällen; ${betreiberMitBewertung} von ${betreiber.length} Szenariomeldungen mit Bewertung`, erfuellt: angenommen === 0 && betreiberMitBewertung === 0 },
    { bereich: "Herkunft", kriterium: "Herkunft im Lagebild richtig angezeigt (Betreiber (B) / Behörde (A)); Zuordnung durch Teilnehmende nur im Planspiel", ziel: "100 % (Planspiel: ≥ 95 %)", wert: quote(verlauf.herkunftRichtig, verlauf.meldungen), erfuellt: verlauf.herkunftRichtig === verlauf.meldungen && stand.herkunftRichtig === stand.meldungen },
    { bereich: "Datenqualität", kriterium: "Szenariomeldungen (LEAD-Meldung-v2) im Formular geöffnet, durch alle Schritte geführt, bis auf den Herkunftsnachweis unverändert und gültig ausgegeben", ziel: "100 % (Planspiel: ≥ 90 % beim ersten Export)", wert: quote(formOk, e.formular.length), erfuellt: formOk === e.formular.length },
    { bereich: "Plausibilität und Identität", kriterium: "Szenario (LEAD-Meldung-v2) ohne Schema-, Plausibilitäts- und Identitätsfehler", ziel: "0 Fehler", wert: `${e.pruefwerkzeug.je.reduce((s, x) => s + x.fehler, 0)} Fehler, ${e.pruefwerkzeug.je.reduce((s, x) => s + x.warnungen, 0)} Warnungen je Meldung; Satz: ${e.pruefwerkzeug.satzFehler} Fehler`, erfuellt: e.pruefwerkzeug.je.every((x) => x.gueltig && x.fehler === 0) && e.pruefwerkzeug.satzFehler === 0 },
    { bereich: "Nutzen (Voraussetzung)", kriterium: "Kraftstoff als Unterstützungsbedarf in mehreren Betreibermeldungen bis 14.10., 10:30 (Erkennen durch die Lagezentren nur im Planspiel)", ziel: "≥ 2 Meldungen", wert: `${kraftstoff.length} (${kraftstoff.map((m) => m.daten.absender.stelle.replace(" (FIKTIV)", "")).join("; ")})`, erfuellt: kraftstoff.length >= 2 },
  ];
}

const NUR_PLANSPIEL = [
  ["Aufwand", "Erstmeldung im Formular; Folgemeldung", "Median ≤ 15 min; ≤ 10 min, P90 ausgewiesen", "Selbstprotokoll"],
  ["Zeitarten", "Planwert, Prognose und Ist in entscheidungstragenden Aussagen verwechselt", "0", "Durchsicht der Landesmeldungen"],
  ["Nutzen", "Lagezentrum erkennt die gemeinsame Engpassressource Kraftstoff bis T1 16:00", "in jedem Lagezentrum", "Landesmeldung, Kernaussage"],
  ["Kodierung", "Abweichung zweier Personen im selben Referenzraum", "≤ 1 Stufe in ≥ 80 % der Achsen", "Kodiervergleich"],
  ["Akzeptanz", "Betreiber halten den Pflichtkern für leistbar", "≥ 2 von 3", "Befragung"],
];

function alsMarkdown(e) {
  const zeile = (z) => `| ${z.join(" | ")} |`;
  const ja = (b) => (b ? "ja" : "**nein**");
  return [
    "# Trockenlauf Orkantief „Ilka“, Landkreis Sonneberg",
    "",
    `Erzeugt mit \`npm run trockenlauf\` (KRITIS-LEAD ${paket.version}, Profil ${profil.id} ${profil.version}, KI-LEAD ${quelle.app_version} @ \`${quelle.commit.slice(0, 7)}\`). Die Datei wird nicht von Hand bearbeitet; die CI prüft, dass sie zum Stand passt. Alle Daten sind fiktiv.`,
    "",
    "Der Trockenlauf spielt das Szenario ohne Teilnehmende durch: Er misst die Erfolgskriterien der Erprobung ([docs/ERPROBUNG.md](../../docs/ERPROBUNG.md), Abschnitt 3), die sich maschinell messen lassen, und zeigt, dass Formular, Prüfwerkzeug, Profilpaket und KI-LEAD zusammen funktionieren. Die übrigen Kriterien misst erst das Planspiel ([Drehbuch](../DREHBUCH.md)).",
    "",
    `**Ergebnis: ${e.kriterien.every((k) => k.erfuellt) ? "alle maschinell messbaren Kriterien erfüllt" : "nicht alle Kriterien erfüllt"}.**`,
    "",
    "## Kriterien",
    "",
    zeile(["Bereich", "Kriterium", "Zielwert", "Trockenlauf", "erfüllt"]),
    zeile(["---", "---", "---", "---", "---"]),
    ...e.kriterien.map((k) => zeile([k.bereich, k.kriterium, k.ziel, k.wert, ja(k.erfuellt)])),
    "",
    "Erst im Planspiel messbar:",
    "",
    zeile(["Bereich", "Kriterium", "Zielwert", "Messung"]),
    zeile(["---", "---", "---", "---"]),
    ...NUR_PLANSPIEL.map(zeile),
    "",
    "## 1. Betreiberformular",
    "",
    "Jede Betreibermeldung des Szenarios nach LEAD-Meldung-v2 wird als Entwurf geöffnet, Schritt für Schritt angezeigt, geprüft und als JSON ausgegeben; „unverändert“ heißt: bis auf den Herkunftsnachweis (`entstehung`), den das Formular bei der Ausgabe setzt.",
    "",
    zeile(["Meldung", "Meldeart", "Befunde im Formular", "unverändert", "gültig"]),
    zeile(["---", "---", "---", "---", "---"]),
    ...e.formular.map((f) => zeile([`\`${f.datei}\``, f.meldeart, String(f.befundeImFormular), ja(f.unveraendert), ja(f.gueltig)])),
    "",
    "## 2. Prüfwerkzeug",
    "",
    "Szenario nach LEAD-Meldung-v2 (`formate/lead-kritis-v2/szenario/`), geprüft mit `npm run pruefen`: Schema und Rollenregeln, Plausibilität P1 bis P11, Nachrichtenidentität I1 bis I5.",
    "",
    zeile(["Meldung", "Rolle", "gültig", "Fehler", "Warnungen"]),
    zeile(["---", "---", "---", "---", "---"]),
    ...e.pruefwerkzeug.je.map((x) => zeile([`\`${x.datei}\``, x.rolle, ja(x.gueltig), String(x.fehler), String(x.warnungen)])),
    "",
    `Nachrichtenidentität über alle ${meldungen.length} Meldungen (I1 bis I5): ${e.pruefwerkzeug.satzFehler} Fehler, ${e.pruefwerkzeug.satzWarnungen} Warnungen.`,
    "",
    "## 3. Zweiter Prüfweg",
    "",
    `Der Schemaprüfer von KI-LEAD urteilt über ${e.pruefwege.faelle.length} Konformitätsfälle nach LEAD-Meldung-v2; in ${e.pruefwege.faelle.filter((f) => f.gleich).length} Fällen gleich wie das Prüfwerkzeug. Fehler beim Übernehmen des Schemas in den Prüfer: ${e.pruefwege.schemaFehler || "keine"}. Behördenmeldungen des Ilka-Datensatzes von KI-LEAD, mit \`migriereV1\` von KI-LEAD überführt, gültig: ${e.pruefwege.ilkaGueltig} von ${e.pruefwege.ilka}.`,
    "",
    "## 4. Lagebild in KI-LEAD",
    "",
    `Profilpaket geladen: ${ja(e.lagebild.profilGeladen)}, Fehler und Warnungen: ${e.lagebild.profilBefunde}; als .leadprofil mit gleicher Prüfsumme: ${ja(e.lagebild.zip.gleicherHash)}.`,
    "",
    zeile(["Beispiel", "Meldungen", "davon Betreiber", "ohne Umformatierung", "Herkunft richtig", "Sachverhalte", "Kennungsbefunde außer Fortschreibung", "JSON in der Rohtabelle"]),
    zeile(["---", "---", "---", "---", "---", "---", "---", "---"]),
    ...e.lagebild.beispiele.map((b) => zeile([`\`${b.ordner}\``, String(b.meldungen), String(b.betreiber), String(b.ohneUmformatierung), String(b.herkunftRichtig), String(b.sachverhalte), String(b.kennungsbefunde), String(b.rohtabelleJson)])),
    "",
  ].join("\n");
}

const ergebnis = { stand: { kritisLead: paket.version, profil: `${profil.id} ${profil.version}`, kiLead: { version: quelle.app_version, commit: quelle.commit } } };
ergebnis.formular = await formularlauf();
ergebnis.pruefwerkzeug = pruefwerkzeug();
ergebnis.pruefwege = pruefwege();
ergebnis.lagebild = lagebild();
ergebnis.kriterien = kriterien(ergebnis);

const ausgaben = { [`${ZIEL}/ergebnis.json`]: JSON.stringify(ergebnis, null, 2) + "\n", [`${ZIEL}/ergebnis.md`]: alsMarkdown(ergebnis) };
if (process.argv.includes("--pruefen")) {
  let abweichend = 0;
  for (const [p, t] of Object.entries(ausgaben)) {
    let alt = "";
    try {
      alt = readFileSync(pfad(p), "utf-8");
    } catch {
      /* fehlt */
    }
    if (alt !== t) {
      console.error(`${p} entspricht nicht dem Trockenlauf: npm run trockenlauf ausführen.`);
      abweichend++;
    }
  }
  if (abweichend) process.exit(1);
} else {
  mkdirSync(pfad(ZIEL), { recursive: true });
  for (const [p, t] of Object.entries(ausgaben)) writeFileSync(pfad(p), t);
}
for (const k of ergebnis.kriterien) console.log(`${k.erfuellt ? "✓" : "✗"} ${k.bereich}: ${k.wert}`);
if (!ergebnis.kriterien.every((k) => k.erfuellt)) process.exit(1);
