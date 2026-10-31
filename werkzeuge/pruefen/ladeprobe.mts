// Ladeprobe: lädt das Profilpaket profil/lead-kritis mit dem Profilloader von KI-LEAD, liest die Beispiele ins Lagebild ein
// und führt den Redaktionscheck aus – mit dem Code von KI-LEAD am gepinnten Commit, ohne Browser.
// Aufruf: KI_LEAD_DIR=<Klon von pereirawolf/ki-lead mit node_modules> node --import tsx werkzeuge/pruefen/ladeprobe.mts
// Ausgabe: JSON mit Befunden des Profilladens, Einträgen des Lagebilds und Kennungsbefunden.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const dir = process.env.KI_LEAD_DIR;
if (!dir) throw new Error("KI_LEAD_DIR fehlt");
const imp = (p: string) => import(pathToFileURL(join(dir, p)).href);
const { ladeProfil } = await imp("src/profil/laden.ts");
const { einlesen, beispielDateien, alleSachverhalte, herkunftsrolleVon, herkunftsrolleAnzeige } = await imp("src/lagebild/lagebild.ts");
const { rohtabelle } = await imp("src/lagebild/ausgabe.ts");
const { redaktionscheck } = await imp("src/lagebild/redaktion.ts");
const { ausZip } = await imp("src/profil/zip.ts");
const { default: JSZip } = await import("jszip");

const wurzel = "profil/lead-kritis";
const dateien: Record<string, string> = {};
const sammle = (p: string) => {
  for (const n of readdirSync(p)) {
    const q = join(p, n);
    if (statSync(q).isDirectory()) sammle(q);
    else if (/\.(json|md)$/.test(n)) dateien[relative(wurzel, q)] = readFileSync(q, "utf-8");
  }
};
sammle(wurzel);

const { profil, befunde } = await ladeProfil(dateien);
const ergebnis: any = { profilGeladen: !!profil, befunde: befunde.map((b: any) => ({ stufe: b.stufe, text: b.text })) };
if (profil) {
  ergebnis.hash = profil.hash;
  ergebnis.beispiele = profil.manifest.beispiele.map((b: any) => {
    const { eintraege, fehler } = einlesen(beispielDateien(profil, b.ordner), profil);
    const red = redaktionscheck(eintraege, profil, "2026-10-15T08:30", new Date("2026-10-14T10:30:00+02:00"));
    return {
      ordner: b.ordner,
      einlesefehler: fehler,
      eintraege: eintraege.map((e: any) => ({
        name: e.name,
        herkunft: e.herkunft,
        fremd: !!e.fremd,
        schemabefunde: e.schema.length,
        hinweise: e.hinweise,
        rolle: e.daten?.kritis?.rolle || "Behörde",
        // Herkunft, wie das Lagebild sie anzeigt (KI-LEAD 0.6.13, rollen.herkunft mit Standard und Kategorie)
        herkunftsanzeige: herkunftsrolleAnzeige(profil, herkunftsrolleVon(e, profil)),
      })),
      // Zellen der Rohtabelle mit JSON-Objekten (bis KI-LEAD 0.6.13 bei Listen von Objekten; seit 0.6.14 lesbarer Text)
      rohtabelleJson: rohtabelle(eintraege, profil)
        .slice(1)
        .flat()
        .filter((z: string) => /\{"/.test(z)).length,
      sachverhalte: alleSachverhalte(eintraege, profil).length,
      kennungen: (red.kennungen || []).map((k: any) => ({ art: k.art, kennung: k.kennung, bezug: k.bezug })),
      zeitfenster: (red.zeit || []).length,
    };
  });
}
// Derselbe Inhalt als .leadprofil (ZIP mit Oberordner) über den Importweg der App
const zip = new JSZip();
for (const [p, t] of Object.entries(dateien)) zip.folder("lead-kritis")!.file(p, t);
const ausDemZip = await ladeProfil(await ausZip(await zip.generateAsync({ type: "uint8array" })));
ergebnis.zip = { geladen: !!ausDemZip.profil, gleicherHash: ausDemZip.profil?.hash === profil?.hash, befunde: ausDemZip.befunde.length };
process.stdout.write(JSON.stringify(ergebnis));
