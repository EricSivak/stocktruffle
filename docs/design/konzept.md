# stocktruffle – Designkonzept

## Stand

- **Runde 1 (14.10.2026):** Bilder in `mockups-v1/`. Abgenommen sind das Logo (Monogramm: ein „t“ mit Stufen-Querbalken und Goldpunkt in einer Trüffelform) und der Login (`mockups-v1/03-login.webp`). Der Rest wirkte stellenweise generisch; die Analyse steht unten unter „Was wir vermeiden“.
- **Runde 2:** die Prompts im Ordner `prompts/`. Sie behalten Palette, Logo und Wärme und streichen das Template-Füllmaterial.

## Die Prompts für Runde 2

Jede Datei enthält genau einen vollständigen Prompt: öffnen, alles markieren, kopieren, in ChatGPT einfügen.

| Datei | Erzeugt |
|---|---|
| `prompts/01-start.txt` | Startseite mit Suchfeld, Beispielen und Briefing |
| `prompts/02-screen-mit-agent.txt` | Screen-Ergebnisse mit angedocktem Agenten |
| `prompts/03-recherche.txt` | Recherche-Modus mit Antwort, Tabelle und Quellen |
| `prompts/04-aktie.txt` | Detailseite einer Aktie |
| `prompts/05-tracking.txt` | Tracking-Seite mit These und Signalen |
| `prompts/06-screen-dunkel.txt` | Screen-Ergebnisse im Dunkelmodus |
| `prompts/07-app-icons.txt` | App-Icons und Favicons mit dem Monogramm |

## So benutzt du die Prompts

1. **Neuer Chat:** Starte für Runde 2 einen neuen ChatGPT-Chat, damit die Muster aus Runde 1 nicht nachwirken.
2. **Nur das Logo anhängen:** Hänge ein Bild deines Logos an (zum Beispiel einen Ausschnitt aus `mockups-v1/04-brand-board.webp`) und schreib „Use the attached logo exactly“. Häng keine alten Screens an, sonst übernimmt das Modell deren Muster.
3. **Ganze Datei kopieren:** Jeder Prompt ist eigenständig und enthält alle Regeln.
4. **Nachbessern statt neu würfeln:** zum Beispiel „Keep everything identical, only remove the shadows“ oder „Keep everything identical, only make the table text crisp and exactly as specified“.
5. **Ablegen:** Gute Ergebnisse nach `mockups-v2/`.

Die Prompts sind auf Englisch, weil Bildmodelle Gestaltungsanweisungen so am zuverlässigsten umsetzen. Alle Oberflächentexte stehen auf Deutsch in Anführungszeichen. Firmen und Zahlen sind erfunden.

## Die Idee: „Papier und schwarzer Trüffel“

stocktruffle soll sich anfühlen wie eine sorgfältig gesetzte Finanzzeitung, die jemand mit dem Anspruch eines Feinkostladens gestaltet hat: warm, ruhig, präzise. Der Trüffel liefert die Geschichte: Die besten Aktien liegen verborgen, und die App ist die Spürnase, die sie ausgräbt.

**Palette**

| Name | Hell | Dunkel | Verwendung |
|---|---|---|---|
| Papier | `#F5F1EA` | `#12100E` | Seitenhintergrund |
| Feld | `#FBF8F3` | `#171411` | Eingabefelder, höchstens ein Inhaltsbogen pro Seite |
| Auswahl | `#ECE5DA` | `#201B17` | gewählte Zeile, aktive Navigation |
| Rand | `#E2D9CC` | `#2F2823` | Haarlinien |
| Feldrand | `#D8CDBE` | `#3A322B` | Ränder von Eingaben und Bögen |
| Tinte | `#1D1915` | `#F3EDE4` | Text, Hauptbutton |
| Grau | `#6B6157` | `#A89C90` | Nebentext |
| Inaktiv | `#8F8378` | `#74685E` | inaktive Navigation |
| Trüffel | `#2A211B` | – | Logo |
| Trüffelgold | `#B08337` | `#D6A85C` | nur Logopunkt und Marker der gewählten Zeile |
| Moos | `#2E7D4F` | `#63C08A` | Gewinn |
| Terrakotta | `#B5432B` | `#E0705A` | Verlust |

## Gestaltungsregeln ab Runde 2

1. **Eine Grotesk für die Bedienung und alle Zahlen.** UI-Text 13 px, kleine Texte 12 px, Tabellenziffern, Satzschreibung, nie gesperrte Großbuchstaben.
2. **Serif nur für Stimme und Rubrik.** Seitentitel in 24 px wie eine Zeitungsrubrik, dazu Fließtext: Antworten des Agenten, Memos, Thesen. Nie für Zahlen, nie größer als 30 px.
3. **Höchstens eine Fläche.** Inhalte liegen auf dem Papier, gegliedert durch Ausrichtung, Weißraum und Haarlinien. Eine Tabelle oder ein Chart darf auf einem Bogen ohne Schatten liegen; nichts darin wird nochmals eingerahmt.
4. **Gold nur zweimal:** im Logo und als Marker der gewählten Zeile.
5. **Farbe nur für Veränderung:** Moos und Terrakotta auf Zahlen und Linien, die eine Richtung zeigen.
6. **Ein Hauptbutton pro Seite**, alles andere sind Textbuttons ohne Icon. Ecken 6 px, keine Pillen.
7. **Der Agent schreibt, er chattet nicht:** Verlauf als Dokument ohne Sprechblasen, Quellen als Fußnoten.
8. **Keine Dekoration in der App.** Die Login-Seite ist der einzige Ort für das Adermuster.

## Was wir vermeiden (Erkenntnisse aus Runde 1)

| Muster | Wo es auftrat | Stattdessen |
|---|---|---|
| Rand, Schatten und große Radien an fast jedem Element | Tabelle, Filter, Buttons, Kontextbox, Briefing, Chart, Kennzahlen, Eingabefeld | Höchstens ein Bogen ohne Schatten, Radius 6 bis 8 px |
| Riesige Serif-Überschriften | „Wonach suchst du heute?“, Seitentitel mit 44 bis 70 px | Serif-Rubrik mit 24 px, auf der Startseite das Logo statt einer Frage |
| Serif-Zahlen | Kennzahlenleiste, Kurs „42,18 €“ | Alle Zahlen in der Grotesk |
| Gesperrte Gold-Labels über Abschnitten | RECHERCHE, QUELLEN, KENNZAHLEN, FINANZEN, ZAHLEN, TRACKING HEUTE | Normale Abschnittstitel, 13 px, Tinte |
| Gold an vielen Stellen | Labels, Meine Regeln, Navigation, Fußnoten, Balken, Schalter | Nur Logopunkt und Zeilenmarker |
| Initialen in Pastellkreisen | SM, NT, HV in allen Tabellen, NT auf der Aktienseite | Name und Ticker, nichts davor |
| Verlauf unter Linien | Sparklines, Kurs-Chart | Dünne Linien ohne Füllung |
| Kennzahlenleiste mit großen Zahlen | „Treffer 47“, „Ø KGV 11,2“ | Eine Zeile Metatext |
| Chat-Bausatz | Beige Sprechblasen, runder Senden-Knopf, Quellen-Pillen, grüne Häkchenliste | Frage als Zeile mit feinem Strich, Schritte als eine graue Zeile, Quellen als Fußnoten |
| Icon plus Text auf Buttons | Spalten, Exportieren, Als Screen öffnen, Alle tracken | Textbuttons |
| Kästchen und Pfeile für Umschalter | 1T bis Max, Jährlich/Quartal, Filter mit Dropdown-Pfeil | Text mit Unterstrich, schlichte Filter-Tokens |
| Dekoration ohne Funktion | Goldlinie auf der Startseite, Statuspillen mit Punkt, Tastenkürzel-Leiste, schwebender Agent-Knopf | Weglassen; Kürzel in Tooltips und der Befehlspalette |
| Erfundene Quellen-Logos | Blaues „F“, „SZ“, bunte Kacheln | Quellen nur als Text |
| Doppelte Aktionen | „Als Screen öffnen“ im Kopf und unter der Tabelle | Jede Aktion einmal |
| Spannweite als Schieberegler | 52-Wochen-Spanne auf der Aktienseite | Dünne Linie mit Markierung |
