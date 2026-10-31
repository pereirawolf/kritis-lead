// Stellt die Anhänge eines Releases nach dist/release/ zusammen (setzt npm run profil:zip voraus):
//   lead-kritis-<Profilversion>.leadprofil      Profilpaket zum Import in KI-LEAD
//   betreibermeldung-<Version>.html             Betreiberformular
//   kritis-lead-erprobung-<Version>.zip         Erprobungsunterlagen mit Formular, Anleitung, Profilpaket und Szenario
// Aufruf: npm run release [-- --tag v0.1.0]   (mit --tag: Abbruch, wenn der Tag nicht zur Version in package.json passt)
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, rmSync, copyFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const wurzel = fileURLToPath(new URL("../../", import.meta.url));
const pfad = (p) => join(wurzel, p);
const json = (p) => JSON.parse(readFileSync(pfad(p), "utf-8"));
const paket = json("package.json");
const profil = json("profil/lead-kritis/profil.json");
const version = paket.version;

const i = process.argv.indexOf("--tag");
if (i > 0) {
  const tag = process.argv[i + 1];
  if (tag !== `v${version}`) {
    console.error(`Tag ${tag} passt nicht zur Version ${version} in package.json.`);
    process.exit(1);
  }
}
if (!existsSync(pfad("dist/lead-kritis.leadprofil"))) {
  console.error("dist/lead-kritis.leadprofil fehlt: zuerst npm run profil:zip ausführen.");
  process.exit(1);
}

const ZIEL = "dist/release";
rmSync(pfad(ZIEL), { recursive: true, force: true });
mkdirSync(pfad(ZIEL), { recursive: true });
const profilDatei = `lead-kritis-${profil.version}.leadprofil`;
copyFileSync(pfad("dist/lead-kritis.leadprofil"), pfad(`${ZIEL}/${profilDatei}`));
copyFileSync(pfad("formular/betreibermeldung.html"), pfad(`${ZIEL}/betreibermeldung-${version}.html`));

// Erprobungspaket: Pfade wie im Repository, damit die Verweise in den Unterlagen stimmen
const INHALT = [
  "erprobung",
  "docs/ERPROBUNG.md",
  "docs/BETREIBER-ANLEITUNG.md",
  "docs/LAGEBILD.md",
  "docs/MELDEPROFIL.md",
  "formular/betreibermeldung.html",
  "formular/SCHRIFT-OFL.txt",
  "szenario/orkantief-ilka-sonneberg",
  "kern/lead-beispiel/beispiele/orkantief-ilka",
  "README.md",
  "LICENSE",
  "LICENSE-CC0",
  "LICENSE-CONTENT",
];
const zip = new JSZip();
const datum = new Date("2026-01-01T00:00:00Z");
const ordner = zip.folder(`kritis-lead-erprobung-${version}`);
const lege = (p) => {
  if (statSync(pfad(p)).isDirectory()) for (const n of readdirSync(pfad(p)).sort()) lege(`${p}/${n}`);
  else ordner.file(p, readFileSync(pfad(p)), { date: datum });
};
for (const p of INHALT) lege(p);
ordner.file(`profil/${profilDatei}`, readFileSync(pfad("dist/lead-kritis.leadprofil")), { date: datum });
ordner.file(
  "LIESMICH.txt",
  [
    `KRITIS-LEAD ${version} – Erprobungsunterlagen (Forschungsdemonstrator, alle Inhalte fiktiv)`,
    "",
    "Einstieg: erprobung/README.md und erprobung/DREHBUCH.md; Rahmen: docs/ERPROBUNG.md.",
    "Betreiber: formular/betreibermeldung.html im Browser öffnen; Anleitung docs/BETREIBER-ANLEITUNG.md.",
    `Lagezentren: profil/${profilDatei} in KI-LEAD unter „Profile“ importieren.`,
    "Quelle: https://github.com/pereirawolf/kritis-lead · Code EUPL-1.2, Inhalte CC BY 4.0 (LICENSE-CONTENT).",
    "",
  ].join("\n"),
  { date: datum },
);
const zipDatei = `kritis-lead-erprobung-${version}.zip`;
writeFileSync(pfad(`${ZIEL}/${zipDatei}`), await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
for (const n of readdirSync(pfad(ZIEL)).sort()) console.log(`${relative(wurzel, pfad(`${ZIEL}/${n}`))} (${Math.round(statSync(pfad(`${ZIEL}/${n}`)).size / 1024)} KiB)`);
