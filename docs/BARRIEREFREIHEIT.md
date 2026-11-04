# KRITIS-LEAD – Barrierefreiheit des Betreiberformulars

Fassung 1.4 vom 04.11.2026, gilt für KRITIS-LEAD 0.3.6 · Heiko Pereira Wolf · Änderungen am Ende unter „Änderungsverlauf“

Aufgebaut wie eine Erklärung zur Barrierefreiheit, nach dem Vorbild von [KI-LEAD](https://github.com/pereirawolf/ki-lead/blob/main/docs/BARRIEREFREIHEIT.md). KRITIS-LEAD ist ein privater Forschungsdemonstrator; eine gesetzliche Pflicht zu dieser Erklärung besteht nicht. Keine Rechtsberatung.

---

## 1. Geltungsbereich

Diese Erklärung gilt für das Betreiberformular `formular/betreibermeldung.html`, als Datei geöffnet oder über GitHub Pages (`https://pereirawolf.github.io/kritis-lead/betreibermeldung.html`), und für die Startseite und die Seite „Schnittstelle“ der Pages. Für Lagebild und Verdichtung in KI-LEAD gilt dessen eigene Erklärung.

## 2. Stand der Vereinbarkeit

KRITIS-LEAD beansprucht **keine Konformität** mit der WCAG 2.2, der EN 301 549 oder der BITV 2.0. Einzelne Anforderungen sind umgesetzt und automatisiert geprüft (Abschnitt 3); bekannte Lücken stehen in Abschnitt 4. Die Bewertung ist eine Selbstbewertung des Herausgebers. Eine Prüfung durch Dritte und eine Prüfung mit Menschen mit Behinderungen haben nicht stattgefunden.

## 3. Was umgesetzt und geprüft ist

Alle Punkte prüfen `tests/barrierefreiheit.test.mjs`, `tests/oberflaeche.test.mjs` und `tests/darstellung.test.mjs` in Chromium; in der CI sind die Tests Pflicht.

| Bereich | Umsetzung |
|---|---|
| Automatische Prüfung | axe-core prüft alle sechs Schritte leer und mit Beispiel sowie den Rückfragedialog und den Dialog „Einstellungen“ (mit drei Farbschemata) gegen die Regeln zu WCAG 2.0, 2.1 und 2.2, Stufen A und AA, und die Empfehlungen („best practice“); breit und hell sowie 390 px breit und dunkel; keine Ausnahmen. Das schließt Kontraste des angezeigten Textes ein. |
| Tastatur | Alle Bedienelemente sind mit der Tabulatortaste erreichbar, auch „Vormeldung fortschreiben“ und „Beispiel laden“ in der Liste unter „Meldung öffnen“ (`aria-expanded`; Escape schließt sie, der Fokus kehrt zum Knopf zurück). Optionsfelder werden mit den Pfeiltasten, Kontrollkästchen mit der Leertaste bedient; der Fokus bleibt danach am selben Element, obwohl das Formular den Schritt neu aufbaut. |
| Fokusführung | Beim Schrittwechsel liegt der Fokus auf der Überschrift „Schritt n von 6: …“. „hinzufügen“ setzt ihn in das erste Feld des neuen Eintrags, „entfernen“ auf „Rückgängig“ unter derselben Liste und „Rückgängig“ auf „hinzufügen“, ein Kennsatz-Knopf ans Ende des Textfelds; „aufklappen“ und „einklappen“ eines Listeneintrags (`aria-expanded`, `aria-controls`) lassen ihn am Knopf. Ein Befund im Prüfergebnis führt zum Eingabeelement und klappt einen eingeklappten Eintrag dafür auf. |
| Rückfrage | „Neue Meldung“ und „Beispiel laden“ bei begonnenem Entwurf fragen in einem modalen Dialog statt mit `window.confirm`; der Fokus liegt zuerst auf „Abbrechen“, Escape bricht ab, der Fokus kehrt zum Auslöser zurück. |
| Einstellungen | „Einstellungen“ am Ende der Kopfleiste (alle drei Seiten) öffnet einen modalen Dialog mit dem Bereich „Darstellung“; der Fokus liegt auf der Auswahl „Farbschema“, eine Wahl gilt sofort, „Schließen“ und Escape schließen, der Fokus kehrt zu „Einstellungen“ zurück. Bei „Automatisch (wie Gerät)“ ist die Regel als Beschreibung mit der Auswahl verknüpft. Ohne JavaScript entfällt der Knopf; die Farben folgen dann den Systemeinstellungen. |
| Fehlermeldungen | Felder mit Fehler tragen `aria-invalid` und sind über `aria-describedby` mit der Meldung „Fehler: …“ verknüpft; Hinweise zu Feldern ebenso. Pflichtfelder tragen `aria-required`. Fehlende Pflichtangaben erscheinen erst nach Bearbeiten und Verlassen des Felds, nach dem Besuch von Schritt 6 oder bei einer geladenen Meldung, damit ein leeres Formular nicht nur aus Fehlern besteht. Die Schrittleiste markiert Schritte mit Befund mit einem Punkt und besuchte Schritte ohne offene Angabe mit einem Haken und nennt beides im zugänglichen Namen und im Tooltip („1 Feld mit Befund“, „vollständig“). Befunde im Prüfergebnis stehen nach Schritten und haben einen Namen mit Art, Abschnitt, Feld und Text. |
| Statusmeldungen | Geladenes Beispiel, Fortschreibung, Ausgabe, entfernte und wiederhergestellte Einträge werden über eine Statusregion angesagt; der Hinweis zur letzten Aktion steht zudem sichtbar unter der Werkzeugleiste, bis zum Schrittwechsel oder „Ausblenden“; die laufende Zählzeile unter der Werkzeugleiste ist keine Live-Region. |
| Struktur | Kopf mit Seitennavigation (Start, Betreiberformular, Schnittstelle) und Hinweisband, Hauptbereich und Fuß als Seitenbereiche; Schrittleiste als Navigation mit `aria-current`; Gruppen als `fieldset` mit Legende. Lange Hinweise zeigen den ersten Satz und „mehr“; über `aria-describedby` ist immer der ganze Text verknüpft. |
| Darstellung | Farben nach dem Grunddesign der App-Familie. Vorgabe „Automatisch (wie Gerät)“: hell das Farbschema des Profils „Bevölkerungsschutz · BBK“, dunkel „Neutral · Night Mode“ nach Systemeinstellung, bei „mehr Kontrast“ „Kontrast · Hell“ bzw. „Kontrast · Dunkel“ mit Text ab 7:1. Unter „Einstellungen → Darstellung“ lässt sich wie in KI-LEAD jedes der 22 Schemata des Katalogs oder „Farben des Profils“ fest wählen, auch die Kontrastschemata unabhängig von der Systemeinstellung; der Bau prüft die Kontraste aller Schemata; bei erzwungenen Systemfarben gibt das System die Farben vor, Auswahl mit Systemfarben hervorgehoben, ohne Band. Schrift Atkinson Hyperlegible; Auswahl zusätzlich mit Haken und unterstrichen bzw. als Kontrollkästchen markiert, nicht nur farbig. Hinweise stehen unter der Beschriftung, vor dem Feld. Auf schmalen Bildschirmen stehen Optionen ab vier untereinander, und „Zurück: …“ und „Weiter: …“ mit dem Ziel und der Zahl offener Angaben bleiben am unteren Rand. Chips und „mehr“ sind bei Touch-Bedienung mindestens 44 px hoch; der Fokus ist überall ein Ring mit zweitem, hellem Ring. Bei 320 und 390 px Breite entsteht keine waagerechte Bildlaufleiste der Seite, auch nicht bei leerem Formular; nur die Schrittleiste scrollt, und der aktive Schritt rückt ins Bild. Gleiches prüft `tests/seite.test.mjs` für Startseite und Seite „Schnittstelle“. |

## 4. Bekannte Lücken

| Lücke | Wirkung | Umgehung |
|---|---|---|
| Nicht mit Screenreadern (NVDA, JAWS, VoiceOver, TalkBack) und nicht mit Menschen mit Behinderungen geprüft | Ansagen und Reihenfolge können abweichen | Rückmeldung als Issue |
| Schmale Ansicht: Die Schrittleiste ist ein waagerecht verschiebbarer Streifen | Schritte am Rand sind erst nach Verschieben sichtbar; ein Verlauf am Rand zeigt, dass dort weitere liegen | „Weiter“ und „Zurück“ am unteren Rand |
| Kontrastschema und erzwungene Systemfarben nur automatisiert und emuliert geprüft (Chromium), nicht mit echtem Kontrastdesign unter Windows | Darstellung kann abweichen | Rückmeldung als Issue |
| Datum und Uhrzeit nutzen die Eingabefelder des Browsers | Bedienung und Ansage hängen vom Browser ab | Eingabe als Ziffern mit der Tastatur |
| Lange Freitextfelder ohne Zeichenzählung | – | – |

## 5. Rückmeldung

Barrieren bitte als [Issue mit der Vorlage „Fehler“](https://github.com/pereirawolf/kritis-lead/issues/new?template=fehler.yml) und dem Teil „Barrierefreiheit“ melden, mit Browser, Hilfsmittel und Schritt. Issues sind öffentlich; keine personenbezogenen Angaben.

## Änderungsverlauf

| Fassung | Datum | Änderung |
|---|---|---|
| 1.0 | 31.10.2026 | Erste Fassung (KRITIS-LEAD 0.1.1) |
| 1.1 | 01.11.2026 | Oberfläche nach der UX-Prüfung (KRITIS-LEAD 0.3.1): Fehleranzeige, Befundmarke, Einklappen, lange Hinweise, Seitennavigation, schmale Ansicht ohne waagerechtes Scrollen |
| 1.2 | 03.11.2026 | Zweite UX-Runde (KRITIS-LEAD 0.3.4): „Meldung öffnen“ mit Aufklappliste, Rückfrage beim Beispiel, „Rückgängig“, Hinweis zur letzten Aktion, Haken in der Schrittleiste, Hinweise vor dem Feld, Navigation am unteren Rand |
| 1.3 | 04.11.2026 | Grunddesign der App-Familie (KRITIS-LEAD 0.3.5): Farben aus dem Profil mit Kontrastschema und erzwungenen Farben, Blätterknöpfe mit Ziel auf allen Breiten, Chips 44 px bei Touch-Bedienung, Fokusring an Chips und Segmenten, neutrale Ansprache |
| 1.4 | 04.11.2026 | Einstellungen → Darstellung (KRITIS-LEAD 0.3.6): Wahl des Farbschemas im Dialog „Einstellungen“ auf allen drei Seiten, mit axe-core und Tastaturbedienung geprüft |
