// Einstellungen → Darstellung (seit 0.3.6): Knopf „Einstellungen“ am Ende der Kopfleiste (Grunddesign LD-N01) und ein
// Dialog mit dem Bereich „Darstellung“ wie in KI-LEAD (src/ui/Farbschema.tsx): „Automatisch (wie Gerät)“, alle
// Schemata des Katalogs in den Gruppen Neutral, Kontrast, Bund und Bundesländer und „Farben des Profils“. Für
// Betreiberformular (formular-bauen.mjs) und Seiten (seite-bauen.mjs) gleich. Die Farben stehen im CSS aus farben.mjs.
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { AUTOMATISCH, KENNUNGEN, PROFIL, eintrag, profilName, schemata } from "./farben.mjs";

const pfad = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Schlüssel im localStorage; gespeichert wird nur eine feste Wahl (docs/DATENSCHUTZ.md) */
export const SCHLUESSEL = "kritis-lead-darstellung";

/** Gruppen der Auswahlliste in der Reihenfolge von KI-LEAD; Länder nach Namen */
const GRUPPEN = [
  ["Neutral", "Neutral"],
  ["Kontrast", "Kontrast (Text mindestens 7:1)"],
  ["Bund", "Bund"],
  ["Bundesländer", "Bundesländer"],
];

/** Wählbare Werte: „automatisch“, alle Kennungen des Katalogs, „profil“ */
export const WAHL = [AUTOMATISCH, ...KENNUNGEN, PROFIL];

/** Namen der Schemata, die „Automatisch“ je nach Systemeinstellung verwendet */
export function automatischNamen(farbschema) {
  const s = schemata(farbschema);
  const name = (x) => (x.id === farbschema.basis ? `${profilName(farbschema)} (Farbschema des Profils)` : eintrag(x.id).name);
  return { hell: name(s.hell), dunkel: name(s.dunkel), "kontrast-hell": name(s["kontrast-hell"]), "kontrast-dunkel": name(s["kontrast-dunkel"]) };
}

/** Regel der Option „Automatisch (wie Gerät)“, wie automatischRegel() in KI-LEAD, mit dem Profilschema für hell */
export function automatischRegel(farbschema) {
  const n = automatischNamen(farbschema);
  return `Folgt der Einstellung des Geräts: hell → ${n.hell}, dunkel → ${n.dunkel}, „Mehr Kontrast“ → ${n["kontrast-hell"]} bzw. ${n["kontrast-dunkel"]}.`;
}

/**
 * Skript für den Kopf der Seite: setzt die gespeicherte Wahl vor dem ersten Zeichnen (kein Aufblitzen). Nur Werte aus
 * der festen Liste erreichen das Attribut.
 */
export function darstellungKopf() {
  const erlaubt = JSON.stringify(WAHL.filter((w) => w !== AUTOMATISCH));
  return `<script>try{var a=JSON.parse(localStorage.getItem("${SCHLUESSEL}")||"null");a=a&&a.auswahl;if(${erlaubt}.indexOf(a)>=0)document.documentElement.setAttribute("data-farbschema",a)}catch(e){}</script>`;
}

/** Knopf am Ende der Navigation; ohne JavaScript verborgen, weil es dann nichts einzustellen gibt */
export const einstellungenKnopf = () =>
  `<button type="button" class="nav" id="einstellungen-oeffnen" aria-haspopup="dialog" aria-controls="einstellungen" hidden>Einstellungen</button>`;

function auswahlliste(farbschema) {
  const optionen = (gruppe) => {
    const liste = KENNUNGEN.map(eintrag).filter((e) => e.gruppe === gruppe);
    if (gruppe === "Bundesländer") liste.sort((a, b) => a.name.localeCompare(b.name, "de"));
    return liste.map((e) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join("");
  };
  return [
    `<option value="${AUTOMATISCH}">Automatisch (wie Gerät)</option>`,
    ...GRUPPEN.map(([g, titel]) => `<optgroup label="${esc(titel)}">${optionen(g)}</optgroup>`),
    `<optgroup label="Profil"><option value="${PROFIL}" data-name="${esc(profilName(farbschema))} (Farbschema des Profils)">Farben des Profils</option></optgroup>`,
  ].join("");
}

/** Dialog „Einstellungen“ mit dem Bereich „Darstellung“ und das Skript dazu */
export function einstellungenDialog(farbschema) {
  const n = automatischNamen(farbschema);
  const skript = buildSync({
    entryPoints: [pfad("formular/quelle/darstellung.mjs")],
    bundle: true,
    write: false,
    format: "iife",
    target: "es2022",
    minify: true,
    legalComments: "none",
    charset: "utf8",
    logLevel: "silent",
  }).outputFiles[0].text.trim();
  return `<dialog id="einstellungen" class="einstellungen" aria-labelledby="einstellungen-titel" data-hell="${esc(n.hell)}" data-dunkel="${esc(n.dunkel)}" data-kontrast-hell="${esc(n["kontrast-hell"])}" data-kontrast-dunkel="${esc(n["kontrast-dunkel"])}">
  <div class="dialog-kopf">
    <h2 id="einstellungen-titel">Einstellungen</h2>
    <button type="button" class="knopf leise" id="einstellungen-schliessen">Schließen</button>
  </div>
  <section aria-labelledby="darstellung-titel">
    <h3 id="darstellung-titel">Darstellung</h3>
    <p class="einleitung">Farbschema der Oberfläche. Es ändert nur die Bildschirmfarben: Prüfergebnisse behalten Bedeutung und Bezeichnung, die ausgegebene Meldung bleibt unverändert. Die Kontrastschemata haben Text mit mindestens 7:1; eine im System eingestellte Farbanpassung (z. B. Kontrastdesign von Windows) geht immer vor.</p>
    <div class="feld">
      <label class="feld-label" for="farbschema">Farbschema</label>
      <select id="farbschema">${auswahlliste(farbschema)}</select>
    </div>
    <p class="hinweis" id="farbschema-automatisch">${esc(automatischRegel(farbschema))}</p>
    <p class="hinweis" id="farbschema-verwendet">Verwendet: <strong></strong>.</p>
    <div class="farb-vorschau" id="farbschema-vorschau" aria-hidden="true">
      <div class="farb-vorschau-kopf">Vorschau</div>
      <p>Text auf der Arbeitsfläche, <span class="farb-vorschau-leise">Nebentext</span> und ein <span class="farb-vorschau-link">Link</span>.</p>
      <div class="farb-vorschau-zeile"><span class="farb-vorschau-knopf">Primärknopf</span><span class="farb-vorschau-auswahl">ausgewählt</span><span class="farb-vorschau-signal">Hinweis zur Stimmigkeit</span></div>
    </div>
    <p class="hinweis">Die Wahl gilt für Betreiberformular, Startseite und Schnittstelle und bleibt nur in diesem Browser gespeichert; ein heruntergeladenes Formular hat eine eigene. „Automatisch“ speichert nichts.</p>
  </section>
</dialog>
<script>${skript.replace(/<\/script/gi, "<\\/script")}</script>`;
}
