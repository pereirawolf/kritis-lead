// Baut die statische Seite für GitHub Pages nach dist/seite/: Startseite, Betreiberformular, Profilpaket zum
// Import in KI-LEAD, Szenario als Einzeldateien, Lizenztext der Schrift und die Seite „Schnittstelle“ mit Anleitung,
// Feldreferenz und dem Zielformat zum Herunterladen (schnittstelle/). Setzt npm run profil:zip voraus.
// Aufruf: npm run seite
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { posix } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import { SCHEMA_ID, ZIEL as SCHEMA_DATEI } from "./schema-bauen.mjs";
import { DATEIEN as SCHNITTSTELLE } from "./schnittstelle-bauen.mjs";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const ZIEL = "dist/seite";
const SZENARIO = "szenario/orkantief-ilka-sonneberg";
const REPO = "https://github.com/pereirawolf/kritis-lead";
const ANLEITUNG = "docs/SCHNITTSTELLE.md";
const SCHEMA_SEITE = `schnittstelle/${SCHEMA_ID}.schema.json`;

if (!existsSync(pfad("dist/lead-kritis.leadprofil"))) {
  console.error("dist/lead-kritis.leadprofil fehlt: zuerst npm run profil:zip ausführen.");
  process.exit(1);
}
const paket = JSON.parse(lies("package.json"));
const profil = JSON.parse(lies("profil/lead-kritis/profil.json"));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

rmSync(pfad(ZIEL), { recursive: true, force: true });
mkdirSync(pfad(`${ZIEL}/schrift`), { recursive: true });
mkdirSync(pfad(`${ZIEL}/szenario`), { recursive: true });
mkdirSync(pfad(`${ZIEL}/schnittstelle`), { recursive: true });
copyFileSync(pfad("formular/betreibermeldung.html"), pfad(`${ZIEL}/betreibermeldung.html`));
copyFileSync(pfad("dist/lead-kritis.leadprofil"), pfad(`${ZIEL}/lead-kritis.leadprofil`));
copyFileSync(pfad("formular/SCHRIFT-OFL.txt"), pfad(`${ZIEL}/schrift/OFL.txt`));
for (const g of [400, 700]) copyFileSync(pfad(`node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-${g}-normal.woff2`), pfad(`${ZIEL}/schrift/atkinson-hyperlegible-${g}.woff2`));
const meldungen = readdirSync(pfad(SZENARIO)).filter((n) => n.endsWith(".json")).sort();
for (const n of meldungen) copyFileSync(pfad(`${SZENARIO}/${n}`), pfad(`${ZIEL}/szenario/${n}`));

const zeilen = meldungen
  .map((n) => {
    const m = JSON.parse(lies(`${SZENARIO}/${n}`));
    const rolle = m.kritis?.rolle || "Behörde";
    const art = m.kritis?.meldeart || "Lagemeldung";
    return `<li><a href="szenario/${esc(n)}" download>${esc(m.meldezeitpunkt.replace("T", ", "))} Uhr · ${esc(m.meldende_stelle)}</a> <span class="hinweis">${esc(rolle)}, ${esc(art)}</span></li>`;
  })
  .join("\n");

/** Rahmen aller Seiten: Kopf, Hinweisband und Fuß wie im Betreiberformular. */
const rahmen = (titel, inhalt, zusatzStil = "", klasse = "") => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<style>
@font-face { font-family: "Atkinson Hyperlegible"; font-weight: 400; font-display: swap; src: url(schrift/atkinson-hyperlegible-400.woff2) format("woff2"); }
@font-face { font-family: "Atkinson Hyperlegible"; font-weight: 700; font-display: swap; src: url(schrift/atkinson-hyperlegible-700.woff2) format("woff2"); }
${lies("formular/quelle/stil.css").trim()}
.seite { max-width: 52rem; }
.seite h2 { margin-top: 2rem; }
.seite li { margin: 0.35rem 0; }
${zusatzStil}</style>
</head>
<body>
<div class="app">
  <header class="kopf">
    <div class="marke"><span class="marke-name">KRITIS-LEAD</span><span class="marke-zusatz">Betreibermeldungen im LEAD-Lagebild · ${esc(paket.version)}</span></div>
    <div class="kopf-rechts"><span class="chip-status">Forschungsdemonstrator</span></div>
  </header>
  <div class="hinweisband" role="note"><strong>Nur fiktive Daten.</strong> Privates Forschungsvorhaben zur Veranschaulichung einer Methode; kein Meldeweg, keine Meldepflicht, kein Ersatz für Meldungen nach Bundes- oder Landesrecht.</div>
  <main class="inhalt seite${klasse ? ` ${klasse}` : ""}">
${inhalt}
  </main>
  <footer class="fuss">© 2026 Heiko Pereira Wolf · Code EUPL-1.2, Inhalte CC BY 4.0, Schema und Feldverzeichnis zusätzlich CC0 1.0 · Schrift Atkinson Hyperlegible, <a href="schrift/OFL.txt">SIL Open Font License 1.1</a></footer>
</div>
</body>
</html>
`;

const html = rahmen("KRITIS-LEAD – Forschungsdemonstrator", `    <h1>KRITIS-LEAD</h1>
    <p>Betreiber Kritischer Infrastrukturen melden Angaben zum eigenen Betrieb – Leistungsgrad, Ersatzverfahren mit Reichweite, Prognose und Unterstützungsbedarf, jeweils mit Datenstand. Die Meldungen stehen in <a href="https://github.com/pereirawolf/ki-lead">KI-LEAD</a> im selben Lagebild wie die Lagemeldungen der Behörden; die Herkunft bleibt erkennbar, die Bewertung bleibt bei der Behörde.</p>
    <h2>Ausprobieren</h2>
    <ol>
      <li><a href="betreibermeldung.html"><strong>Betreiberformular öffnen</strong></a> – läuft ohne Netzverbindung, sendet nichts; „Beispiel laden“ zeigt eine ausgefüllte Meldung. Die Datei lässt sich auch herunterladen und lokal öffnen.</li>
      <li><a href="lead-kritis.leadprofil" download>Profilpaket lead-kritis ${esc(profil.version)} herunterladen</a> und in KI-LEAD unter „Profile“ importieren.</li>
      <li>In KI-LEAD die ausgegebene Meldung oder die Szenariomeldungen unten laden: Betreiber- und Behördenmeldungen erscheinen im selben Lagebild.</li>
    </ol>
    <h2 id="szenario">Szenario Orkantief „Ilka“, Landkreis Sonneberg (fiktiv)</h2>
    <ul>
${zeilen}
    </ul>
    <h2>Schnittstelle für BCM-Systeme</h2>
    <p>Betreiber, die Meldungen aus ihrem BCM-System oder Krisenmanagement heraus erzeugen wollen, finden das Zielformat menschen- und maschinenlesbar beschrieben: <a href="schnittstelle.html"><strong>Anleitung und Feldreferenz</strong></a>, dazu <a href="${SCHEMA_SEITE}" download>JSON-Schema ${esc(SCHEMA_ID)}</a>, <a href="schnittstelle/felder.json" download>Feldverzeichnis (JSON)</a>, <a href="schnittstelle/felder.csv" download>Feldverzeichnis (CSV)</a> und <a href="schnittstelle/beispiel-minimal.json" download>Minimalbeispiel</a>.</p>
    <h2>Erprobung</h2>
    <p>Erprobt wird als Planspiel mit Landeslagezentren und Betreibern, nur mit fiktiven Daten: <a href="https://github.com/pereirawolf/kritis-lead/blob/main/docs/ERPROBUNG.md">Rahmen und Erfolgskriterien</a>, <a href="https://github.com/pereirawolf/kritis-lead/blob/main/erprobung/README.md">Drehbuch und Bögen</a>, <a href="https://github.com/pereirawolf/kritis-lead/blob/main/erprobung/trockenlauf/ergebnis.md">Ergebnis des Trockenlaufs</a>.</p>
    <h2>Mehr</h2>
    <p><a href="https://github.com/pereirawolf/kritis-lead">Repository</a> mit Anleitung für Betreiber, Feldkatalog, Prüfwerkzeug und Konformitätsfällen; <a href="https://github.com/pereirawolf/kritis-lead/releases">Releases</a> mit Profilpaket, Formular und Erprobungsunterlagen.</p>`);
writeFileSync(pfad(`${ZIEL}/index.html`), html);
writeFileSync(pfad(`${ZIEL}/.nojekyll`), "");

// Seite „Schnittstelle“: Anleitung und Feldreferenz aus Markdown; Verweise auf Dateien, die auf der Seite liegen,
// zeigen dorthin, alle übrigen relativen Verweise auf das Repository.
const AUF_SEITE = new Map([
  [SCHEMA_DATEI, SCHEMA_SEITE],
  [SCHNITTSTELLE.referenz, "#feldreferenz"],
  [SCHNITTSTELLE.felder, "schnittstelle/felder.json"],
  [SCHNITTSTELLE.csv, "schnittstelle/felder.csv"],
  [SCHNITTSTELLE.minimal, "schnittstelle/beispiel-minimal.json"],
  [ANLEITUNG, "#anleitung"],
  ["formular/betreibermeldung.html", "betreibermeldung.html"],
]);
const kennwort = (t) =>
  t
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
function markdownHtml(datei, praefix) {
  const ordner = posix.dirname(datei);
  const verweis = (href) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#")) return href;
    const [weg, anker] = href.split("#");
    const ziel = posix.normalize(posix.join(ordner, weg));
    if (AUF_SEITE.has(ziel)) return AUF_SEITE.get(ziel);
    return `${REPO}/blob/main/${ziel}${anker ? `#${anker}` : ""}`;
  };
  const md = new Marked();
  md.use({
    walkTokens(t) {
      if (t.type === "link") t.href = verweis(t.href);
    },
    renderer: {
      heading({ tokens, depth, text }) {
        return `<h${depth} id="${praefix}${kennwort(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
    },
  });
  return md
    .parse(lies(datei))
    // lange Pfade nur hinter Punkten und Listenklammern umbrechen
    .replace(/<code>([^<]*)<\/code>/g, (_, c) => `<code>${c.replace(/([.\]])(?=\S)/g, "$1<wbr>")}</code>`)
    // breite Tabellen und Codeblöcke rollen waagerecht und sind dafür mit der Tastatur erreichbar
    .replace(/<pre>/g, '<pre tabindex="0">')
    .replace(/<table>/g, '<div class="tabelle" tabindex="0"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

copyFileSync(pfad(SCHEMA_DATEI), pfad(`${ZIEL}/${SCHEMA_SEITE}`));
copyFileSync(pfad(SCHEMA_DATEI), pfad(`${ZIEL}/schnittstelle/meldung.schema.json`));
for (const d of [SCHNITTSTELLE.felder, SCHNITTSTELLE.csv, SCHNITTSTELLE.minimal]) copyFileSync(pfad(d), pfad(`${ZIEL}/schnittstelle/${posix.basename(d)}`));
const schnittstelle = rahmen(
  "KRITIS-LEAD – Schnittstelle für BCM-Systeme",
  `    <nav aria-label="Auf dieser Seite"><p><a href="./">Startseite</a> · <a href="#anleitung">Anleitung</a> · <a href="#feldreferenz">Feldreferenz</a> · <a href="#herunterladen">Zielformat herunterladen</a></p></nav>
    <section id="herunterladen" class="kasten">
      <h2>Zielformat herunterladen</h2>
      <ul>
        <li><a href="${SCHEMA_SEITE}" download>JSON-Schema ${esc(SCHEMA_ID)}</a> (maßgeblich; dieselbe Datei unter der festen Adresse <a href="schnittstelle/meldung.schema.json">schnittstelle/meldung.schema.json</a> zeigt immer auf die aktuelle Fassung)</li>
        <li><a href="schnittstelle/felder.json" download>Feldverzeichnis als JSON</a> und <a href="schnittstelle/felder.csv" download>als CSV</a> (UTF-8, Semikolon)</li>
        <li><a href="schnittstelle/beispiel-minimal.json" download>Kleinste gültige Betreibermeldung</a> und die <a href="./#szenario">Meldungen des Szenarios</a></li>
      </ul>
    </section>
    <section id="anleitung">
${markdownHtml(ANLEITUNG, "a-")}
    </section>
    <section id="feldreferenz">
${markdownHtml(SCHNITTSTELLE.referenz, "f-")}
    </section>`,
  `.kasten { border: 1px solid var(--linie); border-radius: var(--r-mittel); background: var(--flaeche); padding: 0 1rem 0.5rem; margin: 1rem 0 2rem; }
.tabelle { overflow-x: auto; margin: 1rem 0; }
.tabelle:focus-visible, .seite pre:focus-visible { outline: 2px solid var(--fokus); outline-offset: 2px; }
.seite table { border-collapse: collapse; font-size: 0.9rem; }
.seite th, .seite td { border: 1px solid var(--linie); padding: 0.3rem 0.5rem; text-align: left; vertical-align: top; }
.seite th { background: var(--lese-flaeche); }
.seite pre { overflow-x: auto; background: var(--lese-flaeche); padding: 0.75rem; border-radius: var(--r-klein); }
.seite blockquote { margin: 1rem 0; padding-left: 1rem; border-left: 4px solid var(--linie); color: var(--tinte-leise); }
#feldreferenz h1, #anleitung h1 { margin-top: 2.5rem; }
.seite.breit { max-width: 84rem; }
.seite.breit > section > p, .seite.breit > section > ul, .seite.breit > section > ol, .seite.breit > section > pre, .seite.breit > section > blockquote, .seite.breit > section > h1, .seite.breit > section > h2, .seite.breit > section > h3, .seite.breit > nav, .seite.breit > .kasten { max-width: 52rem; }
.seite td code { white-space: normal; }
`,
  "breit",
);
writeFileSync(pfad(`${ZIEL}/schnittstelle.html`), schnittstelle);
console.log(`${ZIEL}/ gebaut: Startseite, Formular, Profilpaket, ${meldungen.length} Szenariomeldungen, Schnittstelle.`);
