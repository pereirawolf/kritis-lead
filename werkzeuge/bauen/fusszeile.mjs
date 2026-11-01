// Fußzeile aller Seiten (seit 0.3.3): Startseite, Betreiberformular und Schnittstelle tragen dieselbe Zeile, aufgebaut
// wie die Fußzeile von KI-LEAD (src/App.tsx, Verweise aus src/kern/herausgeber.ts): Kennung mit Version, wohin Daten
// gehen, Lizenzen, dann „Lizenzen · Impressum · Datenschutz“. Die Verweise öffnen sich in einem eigenen Fenster; die
// Seiten rufen keine dieser Adressen selbst auf.

export const HERAUSGEBER = "Heiko Pereira Wolf";

const REPOSITORY = "https://github.com/pereirawolf/kritis-lead";

/** Externe Verweise; Impressum nach § 18 Abs. 1 MStV auf der Website des Herausgebers, wie in KI-LEAD */
export const VERWEISE = {
  inhaltslizenz: `${REPOSITORY}/blob/main/LICENSE-CONTENT`,
  impressum: "https://www.pereirawolf.de/impressum.html",
  datenschutz: `${REPOSITORY}/blob/main/docs/DATENSCHUTZ.md`,
};

const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

/** Inhalt des Elements footer.fuss für die Version aus package.json */
export const fusszeile = (version) =>
  `KRITIS-LEAD ${version}. Daten bleiben auf diesem Gerät; das Betreiberformular sendet nichts, der Entwurf liegt nur im Browser. ` +
  `Code unter EUPL-1.2, Inhalte unter CC BY 4.0 (${HERAUSGEBER}), Schema und Feldverzeichnis zusätzlich unter CC0 1.0. ` +
  `${link(VERWEISE.inhaltslizenz, "Lizenzen")} · ${link(VERWEISE.impressum, "Impressum")} · ${link(VERWEISE.datenschutz, "Datenschutz")}`;
