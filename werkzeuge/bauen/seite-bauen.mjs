// Baut die statische Seite für GitHub Pages nach dist/seite/: Startseite, Betreiberformular, Profilpaket zum
// Import in KI-LEAD, Szenario als Einzeldateien und Lizenztext der Schrift. Setzt npm run profil:zip voraus.
// Aufruf: npm run seite
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const lies = (p) => readFileSync(pfad(p), "utf-8");
const ZIEL = "dist/seite";
const SZENARIO = "szenario/orkantief-ilka-sonneberg";

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

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KRITIS-LEAD – Forschungsdemonstrator</title>
<style>
@font-face { font-family: "Atkinson Hyperlegible"; font-weight: 400; font-display: swap; src: url(schrift/atkinson-hyperlegible-400.woff2) format("woff2"); }
@font-face { font-family: "Atkinson Hyperlegible"; font-weight: 700; font-display: swap; src: url(schrift/atkinson-hyperlegible-700.woff2) format("woff2"); }
${lies("formular/quelle/stil.css").trim()}
.seite { max-width: 52rem; }
.seite h2 { margin-top: 2rem; }
.seite li { margin: 0.35rem 0; }
</style>
</head>
<body>
<div class="app">
  <header class="kopf">
    <div class="marke"><span class="marke-name">KRITIS-LEAD</span><span class="marke-zusatz">Betreibermeldungen im LEAD-Lagebild · ${esc(paket.version)}</span></div>
    <div class="kopf-rechts"><span class="chip-status">Forschungsdemonstrator</span></div>
  </header>
  <div class="hinweisband" role="note"><strong>Nur fiktive Daten.</strong> Privates Forschungsvorhaben zur Veranschaulichung einer Methode; kein Meldeweg, keine Meldepflicht, kein Ersatz für Meldungen nach Bundes- oder Landesrecht.</div>
  <main class="inhalt seite">
    <h1>KRITIS-LEAD</h1>
    <p>Betreiber Kritischer Infrastrukturen melden Angaben zum eigenen Betrieb – Leistungsgrad, Ersatzverfahren mit Reichweite, Prognose und Unterstützungsbedarf, jeweils mit Datenstand. Die Meldungen stehen in <a href="https://github.com/pereirawolf/ki-lead">KI-LEAD</a> im selben Lagebild wie die Lagemeldungen der Behörden; die Herkunft bleibt erkennbar, die Bewertung bleibt bei der Behörde.</p>
    <h2>Ausprobieren</h2>
    <ol>
      <li><a href="betreibermeldung.html"><strong>Betreiberformular öffnen</strong></a> – läuft ohne Netzverbindung, sendet nichts; „Beispiel laden“ zeigt eine ausgefüllte Meldung. Die Datei lässt sich auch herunterladen und lokal öffnen.</li>
      <li><a href="lead-kritis.leadprofil" download>Profilpaket lead-kritis ${esc(profil.version)} herunterladen</a> und in KI-LEAD unter „Profile“ importieren.</li>
      <li>In KI-LEAD die ausgegebene Meldung oder die Szenariomeldungen unten laden: Betreiber- und Behördenmeldungen erscheinen im selben Lagebild.</li>
    </ol>
    <h2>Szenario Orkantief „Ilka“, Landkreis Sonneberg (fiktiv)</h2>
    <ul>
${zeilen}
    </ul>
    <h2>Mehr</h2>
    <p><a href="https://github.com/pereirawolf/kritis-lead">Repository</a> mit Anleitung für Betreiber, Feldkatalog, Prüfwerkzeug und Konformitätsfällen.</p>
  </main>
  <footer class="fuss">© 2026 Heiko Pereira Wolf · Code EUPL-1.2, Inhalte CC BY 4.0 · Schrift Atkinson Hyperlegible, <a href="schrift/OFL.txt">SIL Open Font License 1.1</a></footer>
</div>
</body>
</html>
`;
writeFileSync(pfad(`${ZIEL}/index.html`), html);
writeFileSync(pfad(`${ZIEL}/.nojekyll`), "");
console.log(`${ZIEL}/ gebaut: Startseite, Formular, Profilpaket, ${meldungen.length} Szenariomeldungen.`);
