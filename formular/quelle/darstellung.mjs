// Einstellungen → Darstellung (seit 0.3.6): Wahl des Farbschemas wie in KI-LEAD (src/ui/Farbschema.tsx), für
// Betreiberformular, Startseite und Seite „Schnittstelle“. Die Farben selbst stehen im CSS des Baus
// ([data-farbschema="<Kennung>"], werkzeuge/bauen/farben.mjs); dieses Skript setzt nur das Attribut am Wurzelelement,
// zeigt den Dialog und speichert die Wahl im localStorage. Gespeichert wird nur eine feste Wahl; „Automatisch“ entfernt
// den Eintrag. Den Dialog erzeugt werkzeuge/bauen/darstellung.mjs; das Attribut setzt vor dem ersten Zeichnen ein
// kurzes Skript im Kopf der Seite (darstellungKopf), damit nichts aufblitzt.

const SCHLUESSEL = "kritis-lead-darstellung";
const AUTOMATISCH = "automatisch";
const wurzel = document.documentElement;
const dialog = document.getElementById("einstellungen");
const knopf = document.getElementById("einstellungen-oeffnen");
const auswahl = document.getElementById("farbschema");
const regel = document.getElementById("farbschema-automatisch");
const verwendet = document.getElementById("farbschema-verwendet");
const vorschau = document.getElementById("farbschema-vorschau");
const kennungen = auswahl ? [...auswahl.options].map((o) => o.value) : [];

const gueltig = (a) => typeof a === "string" && kennungen.includes(a);

function lesen() {
  try {
    const roh = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
    return gueltig(roh?.auswahl) ? roh.auswahl : AUTOMATISCH;
  } catch {
    return AUTOMATISCH;
  }
}

function speichern(a) {
  try {
    if (a === AUTOMATISCH) localStorage.removeItem(SCHLUESSEL);
    else localStorage.setItem(SCHLUESSEL, JSON.stringify({ version: 1, auswahl: a }));
  } catch {
    /* ohne localStorage (privater Modus o. Ä.) gilt die Wahl bis zum Neuladen */
  }
}

const passt = (q) => {
  try {
    return !!window.matchMedia?.(q).matches;
  } catch {
    return false;
  }
};

/** Schema, das „Automatisch“ gerade verwendet, mit Namen; die Namen setzt der Bau an den Dialog */
function automatisch() {
  const dunkel = passt("(prefers-color-scheme: dark)");
  if (passt("(prefers-contrast: more)")) {
    const art = dunkel ? "kontrast-dunkel" : "kontrast-hell";
    return `Automatisch: ${dialog.dataset[art === "kontrast-dunkel" ? "kontrastDunkel" : "kontrastHell"]} (Systemeinstellung „mehr Kontrast“)`;
  }
  return `Automatisch: ${dunkel ? dialog.dataset.dunkel : dialog.dataset.hell} (Systemeinstellung ${dunkel ? "dunkel" : "hell"})`;
}

function anwenden(a) {
  if (a === AUTOMATISCH) wurzel.removeAttribute("data-farbschema");
  else wurzel.setAttribute("data-farbschema", a);
}

function anzeigen(a) {
  if (!auswahl) return;
  auswahl.value = a;
  const auto = a === AUTOMATISCH;
  regel.hidden = !auto;
  if (auto) auswahl.setAttribute("aria-describedby", regel.id);
  else auswahl.removeAttribute("aria-describedby");
  const option = auswahl.selectedOptions[0];
  verwendet.querySelector("strong").textContent = auto ? automatisch() : option.dataset.name || option.textContent;
  // Die Vorschau zeigt das verwendete Schema; bei „Automatisch“ erbt sie die Farben der Seite
  if (auto) vorschau.removeAttribute("data-farbschema");
  else vorschau.setAttribute("data-farbschema", a);
}

if (dialog && knopf && auswahl) {
  let aktuell = lesen();
  anwenden(aktuell);
  knopf.hidden = false;
  knopf.addEventListener("click", () => {
    anzeigen(aktuell);
    dialog.showModal();
    auswahl.focus();
  });
  auswahl.addEventListener("change", () => {
    aktuell = gueltig(auswahl.value) ? auswahl.value : AUTOMATISCH;
    anwenden(aktuell);
    speichern(aktuell);
    anzeigen(aktuell);
  });
  document.getElementById("einstellungen-schliessen").addEventListener("click", () => dialog.close());
  // Escape schließt den Dialog (Browser); der Fokus kehrt zum Knopf in der Kopfleiste zurück
  dialog.addEventListener("close", () => knopf.focus());
  // Systemeinstellung geändert: Anzeige von „Automatisch“ nachführen (die Farben folgt das CSS von selbst)
  for (const q of ["(prefers-color-scheme: dark)", "(prefers-contrast: more)"]) {
    try {
      window.matchMedia(q).addEventListener("change", () => dialog.open && anzeigen(aktuell));
    } catch {
      /* ältere Browser */
    }
  }
  // Wahl in einem anderen Fenster derselben Seiten übernehmen
  window.addEventListener("storage", (e) => {
    if (e.key !== null && e.key !== SCHLUESSEL) return;
    aktuell = lesen();
    anwenden(aktuell);
    if (dialog.open) anzeigen(aktuell);
  });
}
