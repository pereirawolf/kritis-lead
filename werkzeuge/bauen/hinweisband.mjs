// Hinweisband und Kopfbereich nach Grunddesign 1.6 (LD-R01, LD-R04; Referenz KI-LEAD 0.7.15, src/ui/hinweisband.ts,
// src/ui/kopfKompakt.ts, src/ui/kopfHoehe.ts). Startseite, Schnittstelle und Betreiberformular tragen denselben Wortlaut
// und dasselbe Verhalten: Kopfleiste, Identitätsband und Hinweisband laufen als Kopfbereich mit; nach dem Scrollen wird
// das Band schmaler (weniger Innenabstand, kleinere Schrift), der ganze Wortlaut bleibt immer sichtbar. Hinweise, die nur KRITIS-LEAD betreffen (sendet nichts, kein Meldeweg, keine Meldepflicht),
// stehen in Fußzeile, Startseite und Einleitung von Schritt 1, nicht im Band.

export const HINWEIS_KENNUNG = "Forschungsdemonstrator";
/** Mittelpunkt mit geschützten Leerzeichen: gleicher Abstand davor und danach, kein Umbruch am Mittelpunkt */
export const HINWEIS_TRENNER = " · ";
export const HINWEIS_TEXT = "Nur fiktive oder offen zugängliche Inhalte verwenden – keine personenbezogenen und keine eingestuften Daten.";

/** Hinweisband als HTML; für Screenreader steht statt des Mittelpunkts ein Punkt */
export const hinweisband = () =>
  `<p class="hinweisband" role="note"><strong>${HINWEIS_KENNUNG}</strong><span aria-hidden="true">${HINWEIS_TRENNER}</span><span class="sr">. </span>${HINWEIS_TEXT}</p>`;

/**
 * Skript des Kopfbereichs (ohne Abhängigkeiten, läuft auch in der Offline-Datei): misst die Höhe als --kopf-hoehe für
 * stehende Leisten und Sprungziele und setzt die Klasse „kompakt“. Hysterese wie in KI-LEAD: kompakt ab 96 px Scrollhöhe,
 * mindestens aber eine volle Bandhöhe über 8 px, wieder wie zuvor unter 8 px; Scroll-Anchoring ist während des
 * Wechsels aus, damit die Position nicht springt.
 */
export const kopfSkript = () => `(function () {
  var bereich = document.querySelector(".kopfbereich");
  if (!bereich) return;
  var band = bereich.querySelector(".hinweisband"), wurzel = document.documentElement;
  var AUS = 8, EIN_MIN = 96, PAUSE = 400;
  var kompakt = false, bandVoll = 0, geplant = 0, zurueck = 0, anchoring = null;
  var scroller = [wurzel, document.body];
  function anchoringZurueck() {
    if (anchoring) scroller.forEach(function (e, i) { e.style.overflowAnchor = anchoring[i]; });
    anchoring = null;
  }
  function pruefen() {
    geplant = 0;
    if (!kompakt && band) bandVoll = band.getBoundingClientRect().height;
    var y = window.scrollY;
    var neu = kompakt ? y > AUS : y > Math.max(EIN_MIN, bandVoll + AUS + 16);
    if (neu === kompakt) return;
    kompakt = neu;
    if (!anchoring) {
      anchoring = scroller.map(function (e) { return e.style.overflowAnchor; });
      scroller.forEach(function (e) { e.style.overflowAnchor = "none"; });
    }
    bereich.classList.toggle("kompakt", kompakt);
    clearTimeout(zurueck);
    zurueck = setTimeout(anchoringZurueck, PAUSE);
  }
  window.addEventListener("scroll", function () { if (!geplant) geplant = requestAnimationFrame(pruefen); }, { passive: true });
  function messen() { wurzel.style.setProperty("--kopf-hoehe", bereich.getBoundingClientRect().height + "px"); }
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(messen).observe(bereich);
  messen();
  pruefen();
})();`;
