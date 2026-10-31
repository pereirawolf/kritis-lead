# KRITIS-LEAD – Barrierefreiheit des Betreiberformulars

Fassung 1.0 vom 31.10.2026, gilt für KRITIS-LEAD 0.1.1 · Heiko Pereira Wolf · Änderungen am Ende unter „Änderungsverlauf“

Aufgebaut wie eine Erklärung zur Barrierefreiheit, nach dem Vorbild von [KI-LEAD](https://github.com/pereirawolf/ki-lead/blob/main/docs/BARRIEREFREIHEIT.md). KRITIS-LEAD ist ein privater Forschungsdemonstrator; eine gesetzliche Pflicht zu dieser Erklärung besteht nicht. Keine Rechtsberatung.

---

## 1. Geltungsbereich

Diese Erklärung gilt für das Betreiberformular `formular/betreibermeldung.html`, als Datei geöffnet oder über GitHub Pages (`https://pereirawolf.github.io/kritis-lead/betreibermeldung.html`), und für die Startseite der Pages. Für Lagebild und Verdichtung in KI-LEAD gilt dessen eigene Erklärung.

## 2. Stand der Vereinbarkeit

KRITIS-LEAD beansprucht **keine Konformität** mit der WCAG 2.2, der EN 301 549 oder der BITV 2.0. Einzelne Anforderungen sind umgesetzt und automatisiert geprüft (Abschnitt 3); bekannte Lücken stehen in Abschnitt 4. Die Bewertung ist eine Selbstbewertung des Herausgebers. Eine Prüfung durch Dritte und eine Prüfung mit Menschen mit Behinderungen haben nicht stattgefunden.

## 3. Was umgesetzt und geprüft ist

Alle Punkte prüft `tests/barrierefreiheit.test.mjs` in Chromium; in der CI ist der Test Pflicht.

| Bereich | Umsetzung |
|---|---|
| Automatische Prüfung | axe-core prüft alle sechs Schritte leer und mit Beispiel sowie den Rückfragedialog gegen die Regeln zu WCAG 2.0, 2.1 und 2.2, Stufen A und AA, und die Empfehlungen („best practice“); breit und hell sowie 390 px breit und dunkel; keine Ausnahmen. Das schließt Kontraste des angezeigten Textes ein. |
| Tastatur | Alle Bedienelemente sind mit der Tabulatortaste erreichbar, auch „Vormeldung fortschreiben“. Optionsfelder werden mit den Pfeiltasten, Kontrollkästchen mit der Leertaste bedient; der Fokus bleibt danach am selben Element, obwohl das Formular den Schritt neu aufbaut. |
| Fokusführung | Beim Schrittwechsel liegt der Fokus auf der Überschrift „Schritt n von 6: …“. „hinzufügen“ setzt ihn in das erste Feld des neuen Eintrags, „entfernen“ auf „hinzufügen“ derselben Liste, ein Kennsatz-Knopf ans Ende des Textfelds. Ein Befund im Prüfergebnis führt zum Eingabeelement. |
| Rückfrage | „Neue Meldung“ fragt in einem modalen Dialog statt mit `window.confirm`; der Fokus liegt zuerst auf „Abbrechen“, Escape bricht ab, der Fokus kehrt zum Auslöser zurück. |
| Fehlermeldungen | Felder mit Fehler tragen `aria-invalid` und sind über `aria-describedby` mit der Meldung „Fehler: …“ verknüpft; Hinweise zu Feldern ebenso. Pflichtfelder tragen `aria-required`. Die Schrittleiste nennt die Zahl offener Fehler auch für Screenreader („3 offene Fehler“). Befunde im Prüfergebnis haben einen Namen mit Art, Feld und Text. |
| Statusmeldungen | Prüfergebnis, geladenes Beispiel, Fortschreibung, Ausgabe und angefügte Zeitstrahlzeilen werden über eine Statusregion angesagt; die laufende Zählzeile unter der Werkzeugleiste ist keine Live-Region. |
| Struktur | Kopf mit Hinweisband, Hauptbereich und Fuß als Seitenbereiche; Schrittleiste als Navigation mit `aria-current`; Gruppen als `fieldset` mit Legende. |
| Darstellung | Farbschemata und Schrift nach KI-LEAD (Atkinson Hyperlegible), dunkle Darstellung nach Systemeinstellung; Auswahl zusätzlich unterstrichen bzw. als Kontrollkästchen markiert, nicht nur farbig. Bei 320 px Breite entsteht keine waagerechte Bildlaufleiste der Seite. |

## 4. Bekannte Lücken

| Lücke | Wirkung | Umgehung |
|---|---|---|
| Nicht mit Screenreadern (NVDA, JAWS, VoiceOver, TalkBack) und nicht mit Menschen mit Behinderungen geprüft | Ansagen und Reihenfolge können abweichen | Rückmeldung als Issue |
| Schmale Ansicht: Die Schrittleiste ist ein waagerecht verschiebbarer Streifen | Schritte am Rand sind erst nach Verschieben sichtbar | „Weiter“ und „Zurück“ unter jedem Schritt |
| Kein eigenes Kontrastschema und keine Prüfung mit erzwungenen Systemfarben | bei starker Sehbeeinträchtigung | Zoom des Browsers; KI-LEAD bietet Kontrastschemata |
| Datum und Uhrzeit nutzen die Eingabefelder des Browsers | Bedienung und Ansage hängen vom Browser ab | Eingabe als Ziffern mit der Tastatur |
| Lange Freitextfelder ohne Zeichenzählung | – | – |

## 5. Rückmeldung

Barrieren bitte als [Issue mit der Vorlage „Fehler“](https://github.com/pereirawolf/kritis-lead/issues/new?template=fehler.yml) und dem Teil „Barrierefreiheit“ melden, mit Browser, Hilfsmittel und Schritt. Issues sind öffentlich; keine personenbezogenen Angaben.

## Änderungsverlauf

| Fassung | Datum | Änderung |
|---|---|---|
| 1.0 | 31.10.2026 | Erste Fassung (KRITIS-LEAD 0.1.1) |
