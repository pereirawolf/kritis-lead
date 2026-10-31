# Drehbuch Planspiel Orkantief „Ilka“, Landkreis Sonneberg

Fassung 1.0 vom 31.10.2026 · für KRITIS-LEAD 0.1.0 · alle Stellen, Zahlen und Ereignisse fiktiv · Rahmen und Kriterien: [docs/ERPROBUNG.md](../docs/ERPROBUNG.md)

## 1. Lage und Spielidee

Orkantief „Ilka“ zieht in der Nacht zum 14.10.2026 über Mitteldeutschland. Im Landkreis Sonneberg brechen zwei Masten einer 20-kV-Leitung; rund 18.000 Netzanschlüsse sind ohne Strom. Trinkwasser-Zweckverband, Mobilfunkbetreiber und Pflegeträger halten ihre Dienstleistungen mit Notstrom und Akkus. Ihre Puffer enden vor der Wiederversorgung, die der Netzbetreiber für den Abend des 16.10. erwartet. Der gemeinsame Engpass ist Kraftstoff.

Die Betreiber melden aus ihrer Leitwarte, was sie belastbar wissen. Die Landeslagezentren führen die Betreibermeldungen mit den Meldungen von Leitstelle, Krisenstab und anderen Ländern in KI-LEAD zusammen und erstellen eine Landesmeldung. Musterlösung ist der Sachverhalt `DE-TH-20261014-P5VN` der Thüringer Ilka-Meldung.

## 2. Rollen

| Rolle | Wer | Aufgabe | Werkzeug |
|---|---|---|---|
| Spielleitung | Herausgeber oder benannte Person | Einspielungen ausgeben, Dateien sammeln und prüfen, Meldungssatz an die Lagezentren, Zeit halten, Auswertung | Funktionsadresse, `npm run pruefen`, [Anleitung Spielleitung](spielleitung/ANLEITUNG.md) |
| Betreiber Strom | Teilnehmende Person 1 | Verteilnetzbetreiber Netzgebiet Südthüringen: Einspielungen 01, 06, 11, 12, 13 | Betreiberformular |
| Betreiber Wasser | Teilnehmende Person 2 | Zweckverband Trinkwasser Neuhaus am Rennweg: 02, 09, 14 | Betreiberformular |
| Betreiber Mobilfunk oder Pflege | Teilnehmende Person 3 | Mobilfunknetzbetreiber B (03, 08) oder Pflegeträger Oberland (04, 10); bei nur zwei Betreibern spielt die Spielleitung die übrigen Meldungen aus dem Szenario ein | Betreiberformular |
| Lagezentrum | je Land zwei Personen (A und B) | Lagebild, Landesmeldung für den Referenzraum Land Thüringen, Kodiervergleich | KI-LEAD mit Profil `lead-kritis` |
| Leitstelle, Krisenstab | Spielleitung | spielt die vorbereiteten Meldungen 05 und 07 ein | Szenariodateien |

Alle Lagezentren spielen dieselbe Rolle (Thüringer Landeslagezentrum), damit ihre Landesmeldungen vergleichbar sind. Betreiber treten nur unter den fiktiven Namen auf.

## 3. Ablauf

### Vorbereitung (T−7 bis T−1)

| Wann | Wer | Was |
|---|---|---|
| T−7 | Spielleitung | Erprobungsplan festlegen ([plan-vorlage.md](plan-vorlage.md)); Stände prüfen: Tag von KRITIS-LEAD, Commit von KI-LEAD aus `kern/quelle.json`; Trockenlauf grün |
| T−7 | Spielleitung | Funktionsadresse einrichten; an Betreiber: Formular, [Anleitung](../docs/BETREIBER-ANLEITUNG.md), Selbstprotokoll; an Lagezentren: Adresse von KI-LEAD, Profilpaket `lead-kritis.leadprofil`, Kodierleitfaden mit Anhang K |
| T−3 bis T−1 | alle | Einführung je Rolle, 60 Minuten: Betreiber mit „Beispiel laden“ im Formular, ohne die eigenen Einspielungen; Lagezentren mit dem Beispiel „Stand 14.10.“ in KI-LEAD |

### Planspieltag T1

Realzeit ist die Uhrzeit des Planspieltags; Spielzeit steht in den Meldungen. Die Spielleitung gibt jede Einspielung zur Realzeit aus ([Übersicht](einspielungen/README.md)).

| Realzeit | Spielzeit | Betreiber | Spielleitung | Lagezentren |
|---|---|---|---|---|
| 09:30 | – | Formular öffnen, Selbstprotokoll bereit | Start, Funktionsadresse besetzt | – |
| 10:00 | 13.10., 22:45 | **01** Strom, Erstmeldung | – | – |
| 10:20 | 14.10., 06:30 | **02** Wasser, Erstmeldung | – | – |
| 10:40 | 14.10., 07:15 | **03** Mobilfunk, Erstmeldung | – | – |
| 11:00 | 14.10., 07:30 | **04** Pflege, Erstmeldung | spielt **05** Leitstelle ein (07:45) | – |
| 11:30 | 14.10., 08:10 | **06** Strom, Folgemeldung | spielt **07** Krisenstab ein (08:30) | – |
| 12:00 | 14.10., 10:30 | – | prüft alle Dateien; stellt den Meldungssatz zusammen und sendet ihn an die Lagezentren | Meldungssatz erhalten |
| 13:00 | 15.10., 09:00 | **08** Mobilfunk, Folgemeldung | sammelt Phase 2 | Lagebild in KI-LEAD, Landesmeldung erstellen |
| 13:20 | 15.10., 11:00 | **09** Wasser, Folgemeldung | | Person A und B kodieren getrennt |
| 13:40 | 15.10., 11:30 | **10** Pflege, Folgemeldung | | |
| 14:00 | 15.10., 17:00 | **11** Strom, Folgemeldung | | |
| 14:20 | 15.10., 18:00 | **12** Strom, Korrekturmeldung | | |
| 14:40 | 16.10., 21:30 | **13** Strom, Abschlussmeldung | | |
| 15:00 | 17.10., 09:00 | **14** Wasser, Abschlussmeldung | | |
| 16:00 | – | Befragung Betreiber | nimmt Landesmeldungen entgegen | **Abgabe Landesmeldung** mit Stand 14.10., 10:30; Bogen Herkunft, Kodiervergleich |
| 16:15–16:45 | – | Nachbesprechung aller Rollen (Was hat getragen? Was hat gefehlt?) | moderiert | Befragung Lagezentren |

Der Meldungssatz für die Lagezentren enthält die Dateien der Betreiber zu 01–06, die Meldungen 05 und 07 und die sieben Meldungen des Ilka-Datensatzes, also den Stand 14.10., 10:30 Uhr. Phase 2 der Betreiber (08–14) misst den Aufwand für Folgemeldungen und den Abschluss; sie geht nicht in die Landesmeldung ein.

### Auswertung (T+1 bis T+14)

Die Spielleitung wertet nach [boegen/auswertung.md](boegen/auswertung.md) aus, legt Befunde als Issues an und veröffentlicht das Ergebnis unter `erprobung/ergebnisse/`.

## 4. Aufgaben der Lagezentren

1. Profil `lead-kritis` in KI-LEAD importieren und aktivieren (falls nicht schon in der Einführung geschehen).
2. Den Meldungssatz in der Auswertung laden. Prüfen, ob alle Meldungen ohne Umformatierung im Lagebild stehen; Auffälligkeiten notieren.
3. Landesmeldung für den Referenzraum Land Thüringen, Sachverhalt Stromausfall im Landkreis Sonneberg, Stand 14.10.2026, 10:30 Uhr, ohne KI erstellen. Kernaussage, Beurteilung, Tendenz und Lagenradar setzt das Lagezentrum; Betreiberangaben sind Quellen der Kategorie B.
4. Person A und Person B kodieren den Lagenradar zuerst **getrennt** auf dem [Bogen Kodiervergleich](boegen/kodiervergleich.md), dann einigen sie sich für die Landesmeldung.
5. Nach Abgabe: [Bogen Herkunft](boegen/herkunft-stichprobe.md) je Person, [Befragung](boegen/befragung.md).

Die KI-Verdichtung von KI-LEAD ist im Planspiel nicht vorgesehen. Wer sie zusätzlich ausprobiert, tut das nach dem Planspiel mit eigenem Schlüssel und vermerkt es.

## 5. Abbruch und Störungen

- Fällt bei einem Betreiber das Formular aus, spielt die Spielleitung dessen Szenariodatei ein und vermerkt das im Protokoll.
- Ist KI-LEAD nicht erreichbar, arbeiten die Lagezentren mit einer lokalen Installation oder mit der Rohtabelle aus der Einführung; die Spielleitung vermerkt es.
- Echte Lagen haben Vorrang. Wer abgerufen wird, verlässt das Planspiel ohne Begründung.

---
KRITIS-LEAD · Forschungsdemonstrator · alle Angaben fiktiv · CC BY 4.0
