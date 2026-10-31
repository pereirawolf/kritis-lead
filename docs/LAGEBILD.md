# Lagebild in KI-LEAD: Betreiber- und Behördenmeldungen

Mit dem Profilpaket `lead-kritis` führt [KI-LEAD](https://github.com/pereirawolf/ki-lead) Meldungen von KRITIS-Betreibern und Lagemeldungen von Behörden in einem Lagebild zusammen. Dafür ist keine KRITIS-spezifische Änderung an KI-LEAD nötig; die Ladeprobe in den Tests belegt das mit dem Code von KI-LEAD am gepinnten Commit (App 0.6.14). Die allgemeinen Funktionen Herkunft im Lagebild und lesbare Listen hat KI-LEAD dafür ergänzt (Issue #114).

## Ablauf

1. **Profil bereitstellen:** `npm run profil:zip` erzeugt `dist/lead-kritis.leadprofil`. Die Datei hängt auch an jedem Lauf der Prüfung in GitHub Actions (Artefakt „lead-kritis-profil“).
2. **In KI-LEAD importieren:** „Profile“ → Profil importieren → Datei wählen → Profil aktivieren. Ein API-Schlüssel ist nicht nötig.
3. **Beispiel laden:** „Auswertung“ → „Beispiel laden“ und eines der beiden Beispiele wählen.

| Beispiel | Inhalt | Meldungen |
|---|---|---|
| Stand 14.10.2026, 10:30 | Szenario bis zur Lagemeldung Nr. 4 des Krisenstabs und der Ilka-Datensatz; Zeitpunkt der Thüringer Ilka-Meldung | 14: 5 Betreiber, Leitstelle, Krisenstab, 6 Länder, Koordinierungsstelle |
| Verlauf 13.–17.10.2026 | alle Szenariomeldungen bis zu den Abschlussmeldungen und der Ilka-Datensatz | 21: 12 Betreiber, Leitstelle, Krisenstab, 6 Länder, Koordinierungsstelle |

## Was das Lagebild zeigt

- **Alle Meldungen im Profilschema.** Betreibermeldungen folgen `LEAD-KRITIS-Meldung-v0.1`. Behördenmeldungen nach `LEAD-Meldung-v1` (Krisenstab, Länder, Koordinierungsstelle) übernimmt die Migrationsregel des Profils ohne Inhaltsänderung; sie tragen den Hinweis „Behördenmeldung nach LEAD-Meldung-v1 ohne Inhaltsänderung übernommen“. Keine Meldung gilt als fremd, keine hat Schemabefunde.
- **Herkunft.** Betreiber lassen Beurteilung, Tendenz und Lagenradar leer; in der Übersicht nach Schwere stehen sie deshalb ohne Beurteilung neben den bewerteten Behördenmeldungen. Die Rolle steht in `kritis.rolle`; das Profil führt sie als Rolle `herkunft` mit dem Standard „Behörde“ für Meldungen ohne Meldekopf. Seit KI-LEAD 0.6.13 ([Issue #114](https://github.com/pereirawolf/ki-lead/issues/114)) trägt jede Meldung und jeder Sachverhalt das Kennzeichen „Betreiber (B)“ oder „Behörde (A)“; ein Filter „Herkunft“ blendet Betreiber- oder Behördenmeldungen aus, Rohtabelle und CSV haben eine Spalte „Herkunft“, das PDF einen Vermerk. Meldestatus, Redaktionscheck und Übergabe an die Verdichtung sehen immer alle Meldungen.
- **Betreiberangaben lesbar.** Seit KI-LEAD 0.6.14 stehen die Blöcke `betrieb` in Erfassung, PDF und Rohtabelle gegliedert: Listen wie Ersatzverfahren und Abhängigkeiten je Eintrag statt als JSON, Messwerte als eigene Gruppen mit Beschriftung.
- **Meldestatus.** Die Kontaktliste des Profils nennt die sechs Stellen des Szenarios; das Lagebild zeigt, wer gemeldet hat. Die Ilka-Meldungen erscheinen unter „weitere“.
- **Redaktionscheck.** Die Kennsätze `Handlungsrelevant bis:` der Betreiber und des Krisenstabs (Diesel und Zufahrt bis 14.10. bzw. 15.10.) erscheinen als Zeitfenster. Folgemeldungen derselben Stelle zeigt der Check als Fortschreibung derselben Kennung; Doppelvergaben oder Bezüge ins Leere gibt es nicht.

## Die Kette Betreiber → Landkreis → Land → Bund

| Ebene | Meldung | Verknüpfung |
|---|---|---|
| Betreiber, Leitstelle | `01`–`06` | eigene Kennungen, z. B. `DE-TH-20261013-N4ST` |
| Landkreis | `07` Lagemeldung Nr. 4, `DE-TH-20261014-K3SB` | `bezug` auf die fünf Kennungen; Quellen B und A |
| Land | Ilka TH, `DE-TH-20261014-P5VN` | Quellen [Q3] Krisenstab, [Q4] Netzbetreiber, [Q5] Mobilfunkbetreiber |
| Bund | Ilka Koordinierungsstelle, `DE-20261014-7QKD` | `bezug` auf P5VN und die übrigen Länder |

Die Ilka-Meldungen bleiben unverändert. Weil sie älter sind als das Szenario, verweist die Thüringer Meldung über ihr Quellenverzeichnis auf die Szenariomeldungen, nicht über `bezug`.

## Betreibermeldungen als Eingang einer Verdichtung

- **Mit dem Profil `lead-kritis`:** In der Auswertung Krisenstab-, Leitstellen- und Betreibermeldungen auswählen und an die Verdichtung geben. Die Arbeitsanweisung Verdichtung enthält die Ergänzung KRITIS-LEAD (Kategorie B, keine Bewertung übernehmen, gemeinsame Engpassressourcen). Die KI-Funktion braucht einen eigenen API-Schlüssel und bleibt optional.
- **Mit dem Beispielprofil von KI-LEAD:** Betreibermeldungen gelten dort als fremd. Sie erscheinen nicht unter den Sachverhalten, stehen der KI-Verdichtung aber als Eingangsmeldungen zur Verfügung.
- **Forschungsfrage:** Eine Verdichtung der Sonneberger Eingänge zur Landesmeldung lässt sich mit dem Vergleich von KI-LEAD je Radarachse gegen den Ilka-Sachverhalt P5VN als Referenz auswerten. Die Radarwerte der Lagemeldung Nr. 4 sind illustrativ und nicht kalibriert.

Alle Inhalte sind fiktiv; reale Orts- und Behördennamen dienen nur als Raumbezug und sind als Übungsrolle gekennzeichnet.
