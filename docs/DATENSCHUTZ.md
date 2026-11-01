# KRITIS-LEAD – Datenschutzerklärung und Datenschutzhinweise

Fassung 1.0 vom 01.11.2026, gilt für KRITIS-LEAD 0.3.3 · Heiko Pereira Wolf · Änderungen am Ende unter „Änderungsverlauf“

Aufgebaut nach dem Vorbild von [KI-LEAD](https://github.com/pereirawolf/ki-lead/blob/main/docs/DATENSCHUTZ.md). Diese Hinweise beschreiben, welche Daten KRITIS-LEAD wo verarbeitet. **Die Datenschutzerklärung nach Art. 13 DSGVO für alles, was der Herausgeber selbst verantwortet, steht in [Abschnitt 4](#4-datenschutzerklärung).** Verantwortlicher und Kontakt: [Impressum](https://www.pereirawolf.de/impressum.html). Die Hinweise sind keine Rechtsberatung.

---

## 1. Grundsatz

KRITIS-LEAD ist ein privater Forschungsdemonstrator. Er ist nur für **fiktive Daten** gedacht, nicht für echte Betriebsdaten, nicht für personenbezogene und nicht für eingestufte Daten; das Hinweisband jeder Seite sagt das. Werden nur fiktive Daten verwendet, verarbeitet KRITIS-LEAD außer technischen Verbindungsdaten beim Aufruf der Seiten keine personenbezogenen Daten.

## 2. Was wo gespeichert wird und wohin Daten gehen

| Teil | Was geschieht | Wohin |
|---|---|---|
| Startseite und Seite „Schnittstelle“ | Anzeige; Dateien lassen sich herunterladen | nichts; die Seiten speichern nichts und senden nichts |
| Betreiberformular (`betreibermeldung.html`, über GitHub Pages oder als Datei geöffnet) | Der Entwurf der gerade bearbeiteten Meldung liegt im Browser (localStorage, Schlüssel `kritis-lead-betreiberformular-entwurf`), damit er ein Neuladen übersteht. „Meldung ausgeben“ legt eine JSON-Datei im Download-Ordner an. | nichts; die Content-Security-Policy des Formulars erlaubt keine Netzverbindung (`connect-src 'none'`, `form-action 'none'`) |
| Weiterverarbeitung in KI-LEAD | Eine ausgegebene Meldung oder das Profilpaket wird von der nutzenden Person in KI-LEAD geladen. | es gelten die [Datenschutzhinweise von KI-LEAD](https://github.com/pereirawolf/ki-lead/blob/main/docs/DATENSCHUTZ.md) |
| Aufruf der Seiten | GitHub liefert die Dateien aus und erhebt dabei Verbindungsdaten (Abschnitt 4.2). Ein als Datei heruntergeladenes Formular läuft ohne diesen Aufruf. | GitHub, Inc. |

**Löschen:** „Neue Meldung“ im Formular verwirft den Entwurf. Ganz entfernt wird er mit dem Löschen der Website-Daten im Browser. Ausgegebene Dateien löscht die Person selbst. Der Herausgeber erhält weder Entwürfe noch Meldungen und kann deshalb nichts davon löschen oder darüber Auskunft geben.

## 3. Wer verantwortlich ist

Für die Seiten auf GitHub Pages und das Repository ist der Herausgeber verantwortlich (Abschnitt 4). Für das, was eine Person oder Stelle in das Formular eingibt, speichert und ausgibt, ist sie selbst verantwortlich; das Formular verarbeitet die Angaben nur auf ihrem Gerät.

## 4. Datenschutzerklärung

Diese Erklärung informiert nach Art. 13 DSGVO über die Verarbeitung personenbezogener Daten, für die der Herausgeber verantwortlich ist. Sie gilt für KRITIS-LEAD: die Seiten auf GitHub Pages (`https://pereirawolf.github.io/kritis-lead/`) und das Repository `github.com/pereirawolf/kritis-lead`. Die Website pereirawolf.de und KI-LEAD sind eigene Angebote; diese Erklärung gilt für sie nicht.

### 4.1 Verantwortlicher

Heiko Pereira Wolf. Anschrift und E-Mail-Adresse stehen im [Impressum](https://www.pereirawolf.de/impressum.html). Ein Datenschutzbeauftragter ist nicht benannt.

### 4.2 Verarbeitungen

| Vorgang | Daten | Zweck | Rechtsgrundlage | Empfänger | Speicherdauer |
|---|---|---|---|---|---|
| Aufruf der Seiten | IP-Adresse, Zeitpunkt, aufgerufene Datei, Browserangaben; erhoben von GitHub | Auslieferung und Sicherheit der Seiten | Art. 6 Abs. 1 Buchst. f DSGVO; berechtigtes Interesse: unentgeltliche, sichere Bereitstellung des Forschungsdemonstrators | GitHub, Inc. (Hosting); der Herausgeber erhält diese Daten nicht | nach den Bedingungen von GitHub (GitHub, 2026) |
| Entwurf im Browser (localStorage) | Angaben der gerade bearbeiteten Meldung (Abschnitt 2) | Funktion des Formulars: Entwurf übersteht ein Neuladen | § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich für den ausdrücklich gewünschten Dienst) | niemand; der Entwurf verlässt das Gerät nicht | bis „Neue Meldung“ oder bis zum Löschen der Website-Daten |
| Issues, Kommentare und Pull Requests im Repository | GitHub-Benutzername, Inhalt des Beitrags, Zeitpunkt, Anhänge | Bearbeitung von Fehlermeldungen und Hinweisen, Auswertung der Erprobung ([ERPROBUNG.md](ERPROBUNG.md)) | Art. 6 Abs. 1 Buchst. f DSGVO; berechtigtes Interesse: Weiterentwicklung und Erprobung des Forschungsvorhabens | öffentlich sichtbar; GitHub, Inc. | solange das Repository besteht; Beiträge werden auf Anfrage entfernt, soweit GitHub das zulässt; Auswertungen enthalten keine Namen |
| Vertrauliche Sicherheitsmeldung über GitHub ([SECURITY.md](../SECURITY.md)) | GitHub-Benutzername, Inhalt der Meldung | Behebung der Schwachstelle | Art. 6 Abs. 1 Buchst. f DSGVO; berechtigtes Interesse: Sicherheit der Software | GitHub, Inc. | bis zum Abschluss; danach nach den Regeln von GitHub für Sicherheitsmeldungen |
| Kontakt per E-Mail (Adresse im Impressum) | E-Mail-Adresse, Name, Inhalt | Beantwortung der Anfrage | Art. 6 Abs. 1 Buchst. f DSGVO; berechtigtes Interesse: Beantwortung von Anfragen | E-Mail-Dienst des Herausgebers | bis die Anfrage erledigt ist |

Der Herausgeber setzt **keine Cookies, kein Tracking, keine Analyse- und keine Werbedienste** ein. Meldungen und Entwürfe bitte nicht per E-Mail senden und keine echten Betriebs-, personenbezogenen oder eingestuften Daten in Issues stellen.

### 4.3 Übermittlung in Drittländer

GitHub, Inc. hat seinen Sitz in den USA und verarbeitet Daten auch dort. GitHub stützt Übermittlungen aus der EU nach eigener Angabe auf das EU-U.S. Data Privacy Framework und auf Standardvertragsklauseln (GitHub, 2026).

### 4.4 Pflicht zur Bereitstellung, automatisierte Entscheidungen

Niemand ist verpflichtet, dem Herausgeber Daten bereitzustellen. Formular und Seiten sind ohne Rückmeldung voll nutzbar; ohne Aufruf von GitHub Pages lässt sich nur die Online-Fassung nicht laden, das heruntergeladene Formular läuft weiter. Der Herausgeber trifft keine automatisierten Entscheidungen und betreibt kein Profiling.

### 4.5 Rechte der betroffenen Personen

Betroffene Personen haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Gegen Verarbeitungen auf Grundlage berechtigter Interessen können sie aus Gründen, die sich aus ihrer besonderen Situation ergeben, Widerspruch einlegen (Art. 21). Anfragen gehen an die Kontaktdaten im [Impressum](https://www.pereirawolf.de/impressum.html). Für Daten, die nur GitHub verarbeitet, ist GitHub der richtige Ansprechpartner.

Jede betroffene Person kann sich bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere im Mitgliedstaat ihres Aufenthaltsorts, ihres Arbeitsplatzes oder des mutmaßlichen Verstoßes (Art. 77 DSGVO).

### 4.6 Änderungen

Diese Erklärung wird mit KRITIS-LEAD fortgeschrieben. Die geltende Fassung steht im Kopf dieses Dokuments, frühere Fassungen im Änderungsverlauf und im Git-Verlauf.

---

## Quellen

- GitHub (2026): GitHub General Privacy Statement, gültig ab 27.04.2026. Online abrufbar unter: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement [Zugriff: 24.10.2026]
- lxgesetze (o. J.): § 25 Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG). Online abrufbar unter: https://lxgesetze.de/tdddg/25 [Zugriff: 24.10.2026]

Übernommen aus den Datenschutzhinweisen von KI-LEAD (Fassung 1.11), dort mit dem genannten Zugriffsdatum geprüft.

## Änderungsverlauf

| Fassung | Datum | Änderung |
|---|---|---|
| 1.0 | 01.11.2026 | Erste Fassung (KRITIS-LEAD 0.3.3), verlinkt aus der Fußzeile aller Seiten |
