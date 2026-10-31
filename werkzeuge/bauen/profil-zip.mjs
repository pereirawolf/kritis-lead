// Packt das Profilpaket profil/lead-kritis als dist/lead-kritis.leadprofil (ZIP mit Oberordner lead-kritis/),
// wie KI-LEAD es unter „Profile“ importiert. Aufruf: npm run profil:zip
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const wurzel = fileURLToPath(new URL("../../profil/lead-kritis", import.meta.url));
const ziel = fileURLToPath(new URL("../../dist/lead-kritis.leadprofil", import.meta.url));

const zip = new JSZip();
const ordner = zip.folder("lead-kritis");
const sammle = (p) => {
  for (const n of readdirSync(p).sort()) {
    const q = join(p, n);
    if (statSync(q).isDirectory()) sammle(q);
    else if (/\.(json|md)$/.test(n)) ordner.file(relative(wurzel, q).split("\\").join("/"), readFileSync(q, "utf-8"), { date: new Date("2026-01-01T00:00:00Z") });
  }
};
sammle(wurzel);
mkdirSync(fileURLToPath(new URL("../../dist", import.meta.url)), { recursive: true });
writeFileSync(ziel, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
console.log(`${relative(process.cwd(), ziel)} geschrieben (${Object.keys(zip.files).filter((n) => !zip.files[n].dir).length} Dateien).`);
