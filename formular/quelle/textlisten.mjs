// Quellenverzeichnis und Zeitstrahl als Liste von Einträgen (seit 0.3.4, KL-UX-27). Gespeichert bleibt der Text nach
// Meldeprofil, je Eintrag eine Zeile. Das Formular zerlegt jede Zeile in ihre Teile und setzt sie beim Bearbeiten wieder
// zusammen; eine Zeile, die nicht genau der Form folgt, bleibt ein Eintrag in freier Form und unverändert. Ohne
// Bearbeitung ändert sich am Text nichts (der Trockenlauf gibt jede Szenariomeldung unverändert aus).

// [Qn] Kategorie – Herausgeber (TT.MM.JJJJ): Titel [Zugriff: TT.MM.JJJJ]. Ergänzung
const QUELLE = /^\[Q(\d+)\] ([A-Z]) – (.+?) \((\d{2}\.\d{2}\.\d{4})\): (.*?)(?: \[Zugriff: (\d{2}\.\d{2}\.\d{4})\])?((?:\. .*)?)$/;
// [Zn] JJJJ-MM-TTThh:mm · Kennung · Typ – Kurztext [Qn] · aufgenommen JJJJ-MM-TTThh:mm
const ZEILE = /^\[Z(\d+)\] (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}) · (\S+) · (\S+) – (.*?)(?: (\[Q\d+\]))? · aufgenommen (\d{4}-\d{2}-\d{2}T\d{2}:\d{2})$/;

export const KATEGORIEN = [
  ["B", "B – Betreiber, auch eigene Angaben"],
  ["A", "A – amtlich"],
  ["W", "W – wissenschaftlich"],
  ["M", "M – Medien"],
  ["P", "P – sonstige private Quelle"],
];

/** Zeilen eines Texts; Leerzeilen entfallen. */
export const zeilen = (text) => String(text || "").split("\n").filter((z) => z.trim() !== "");

/** Quelleneintrag zerlegen; `frei` trägt eine Zeile, die nicht der Form folgt. */
export function quelleLesen(zeile) {
  const t = QUELLE.exec(zeile);
  if (!t) return { frei: zeile, nr: Number(/^\s*\[Q(\d+)\]/.exec(zeile)?.[1]) || null };
  return { nr: Number(t[1]), kategorie: t[2], herausgeber: t[3], datum: t[4], titel: t[5], zugriff: t[6] || "", ergaenzung: t[7] ? t[7].slice(2) : "" };
}

export function quelleSchreiben(q) {
  if (q.frei !== undefined) return q.frei;
  return `[Q${q.nr}] ${q.kategorie} – ${q.herausgeber} (${q.datum}): ${q.titel}${q.zugriff ? ` [Zugriff: ${q.zugriff}]` : ""}${q.ergaenzung ? `. ${q.ergaenzung}` : ""}`;
}

/** Zeitstrahlzeile zerlegen; `frei` trägt eine Zeile, die nicht der Form folgt. */
export function zeileLesen(zeile) {
  const t = ZEILE.exec(zeile);
  if (!t) return { frei: zeile, nr: Number(/^\s*\[Z(\d+)\]/.exec(zeile)?.[1]) || null };
  return { nr: Number(t[1]), zeit: t[2], kennung: t[3], typ: t[4], text: t[5], quelle: t[6] || "", aufgenommen: t[7] };
}

export function zeileSchreiben(z) {
  if (z.frei !== undefined) return z.frei;
  return `[Z${z.nr}] ${z.zeit} · ${z.kennung} · ${z.typ} – ${z.text}${z.quelle ? ` ${z.quelle}` : ""} · aufgenommen ${z.aufgenommen}`;
}

/** Nächste freie Nummer; bestehende Nummern bleiben, damit Verweise wie [Q2] im Text stimmen. */
export const naechsteNr = (eintraege) => Math.max(0, ...eintraege.map((e) => e.nr || 0)) + 1;

/** „14.10.2026“ ↔ „2026-10-14“ für Datumsfelder */
export const datumAlsIso = (d) => (/^\d{2}\.\d{2}\.\d{4}$/.test(d || "") ? d.split(".").reverse().join("-") : "");
export const datumAusIso = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d.split("-").reverse().join(".") : "");
