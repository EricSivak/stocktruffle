# Prototyp v2 – Bauplan für alle Seiten

## Kontext

Der erste Prototyp (einfarbig, Geist Mono) wurde verworfen. Danach sind in zwei Bildrunden Mockups entstanden; Runde 2 (`docs/design/mockups-v2/`) und der Login aus Runde 1 (`docs/design/mockups-v1/03-login.webp`) sind die Vorlage. Regeln, Palette und die Liste der zu vermeidenden Muster stehen in `docs/design/konzept.md`.

**Ziel:** ein klickbarer Prototyp aller Seiten, der aussieht wie die Mockups, mit echtem Login, erfundenen Beispieldaten, Dunkelmodus und gestalteten Lade-, Leer- und Fehlerzuständen. Echte Daten kommen erst ab Phase 1; die Engine bleibt unverändert.

**Fertig, wenn** Eric die Vergleichsseite (Mockup neben Prototyp, hell und dunkel) abgenommen hat.

**Wird weiterverwendet:** `lib/format.ts` (alle Zahlen), `lib/keys.ts` (`useHotkey`), `lib/supabase.ts`, `lib/api.ts`, `components/theme-provider.tsx`, der Login-Wächter in `routes/_app.tsx`, die Fehlertexte aus `routes/login.tsx` (`explain`), die shadcn-Bausteine in `components/ui/`, `components/sparkline.tsx`, `components/change.tsx`, Playwright (schon installiert).

**Stand der Datenbank:** Es gibt jetzt ein Konto (deins). Eine zweite Registrierung wird abgelehnt; das betrifft die automatischen Tests (Entscheidung 5).

## Entscheidungen

> **Stand 14.10.2026:** Die App ist inzwischen englisch: Oberfläche, Pfade (`/stocks`, `/research`, `/signals`, `/settings`), Suchparameter (`?state=`, `?view=`, `?q=`) und Beispieldaten; Zahlen im britischen Format. Die deutschen Bezeichnungen in diesem Dokument beschreiben dieselben Stellen.

Mit meiner Empfehlung; bitte bestätigen oder ändern.

1. **Schriften:** Newsreader (Serif, mit Kursiv und optischen Größen) und Inter (Grotesk, mit Tabellenziffern). Beide kostenlos und den Mockups sehr nah. Geist, Geist Mono, IBM Plex und der Schrift-Umschalter fliegen raus.
2. **Recherche als eigene Seite** `/recherche/$id`, wie in Mockup 03. Der Schalter „Recherche an“ im Agenten öffnet sie; das Gespräch geht dort weiter, die Screen-Ansicht bleibt unverändert.
3. **Signale nur an einer Stelle:** Die Leiste hat einen eigenen Punkt „Signale“. Deshalb wird der Umschalter im Tracking zu „Aktiv · Archiv“ statt „Nach Aktie · Nach Signal · Archiv“, sonst gäbe es dieselbe Ansicht zweimal.
4. **Vorschau klappt auf:** Die Leertaste öffnet die Details direkt unter der Zeile, wie beim Tracking, statt einer Seitenleiste; rechts sitzt schon der Agent.
5. **Testkonten:** Konten mit der Endung `@stocktruffle.test` zählen nicht für die Einzelnutzer-Sperre. Tests legen so ein Konto an und löschen es danach; dein Konto und deine Daten bleiben unberührt.
6. **Kurs-Chart mit Lightweight Charts** (TradingView, Apache-2.0, Namensnennung unter Einstellungen → Über), weil Phase 2 ihn ohnehin braucht. Finanzbalken und Sparklines bleiben schlanke eigene SVGs.
7. **Tabellen mit TanStack Table v9** (Sortieren, Spaltenauswahl), damit Phase 1 darauf aufbauen kann.
8. **Lesbare Pfade:** `/`, `/screens`, `/screens/$screenId`, `/aktie/$symbol`, `/recherche/$id`, `/tracking`, `/signale`, `/einstellungen`, `/login`. Die alten Pfade `/s/…`, `/t/…` und `/zustaende` entfallen.

## Schritt 1 · Grundlagen

**Aufräumen**
- Schrift-Umschalter, Geist, Geist Mono, IBM Plex und die Regel `[data-font="plex"]` entfernen.
- Alte Routen `s.$screenId.tsx`, `t.$symbol.tsx`, `zustaende.tsx` und `src/prototype/fixtures.ts` ersetzen; die alten Screenshots in `docs/prototyp/` löschen.

**Tokens** in `apps/web/src/index.css`, exakt aus `konzept.md`, als shadcn-Variablen, damit alle Bausteine sie automatisch nutzen:

| shadcn-Variable | Hell | Dunkel |
|---|---|---|
| `--background` (Papier) | `#F5F1EA` | `#12100E` |
| `--card`, `--popover` (Feld) | `#FBF8F3` | `#171411` |
| `--muted`, `--accent` (Auswahl) | `#ECE5DA` | `#201B17` |
| `--border` (Rand) | `#E2D9CC` | `#2F2823` |
| `--input` (Feldrand) | `#D8CDBE` | `#3A322B` |
| `--foreground`, `--primary` (Tinte) | `#1D1915` | `#F3EDE4` |
| `--primary-foreground` | `#F5F1EA` | `#1D1915` |
| `--muted-foreground` (Grau) | `#6B6157` | `#A89C90` |

Dazu eigene Tokens `--inactive`, `--gold`, `--truffle`, `--gain`, `--loss` (Werte aus `konzept.md`) und `--radius: 6px`. Fokusring: 2 px in Tinte mit 25 % Deckkraft, ohne Leuchten.

**Schrift**
- Inter mit optischen Größen (`@fontsource-variable/inter`) für alles Bedienbare; Newsreader mit optischen Größen und Kursiv für Titel und Fließtext.
- Größen: 11 px (Labels der Leiste), 12 px (Metatext, Tabellenköpfe), 13 px (Grundgröße), 14 px (Fragen), 15 px (Antworten des Agenten), 16 px (Thesen), 18 px (Zwischentitel in Antworten), 28 px (Seitentitel, Serif), 30 px (Kurs).
- Hilfsklassen: `title` (Serif 28 px, normal), `voice` (Serif 15 px, Zeilenhöhe 1,6), `num` (Inter mit Tabellenziffern, rechtsbündig). Die bisherige `num`-Klasse mit Monospace fällt weg.
- Kontraste per Skript prüfen (Text mindestens 4,5:1). Inaktive Icons dürfen `--inactive` sein, ihre Labels nutzen Grau.

**Logo**
- `components/brand/logo.tsx` mit `LogoMark` (hell, dunkel mit cremefarbenem Rand, einfarbig), `Wordmark` („stock“ in Inter 700, „truffle“ in Newsreader kursiv) und `Lockup`.
- Das „t“ wird aus der Newsreader-Schrift als Kontur übernommen. Ein Skript `scripts/build-logo.py` (fontTools über `uv run --with fonttools,brotli`) schreibt die Pfade nach `components/brand/logo-paths.ts`. Dazu kommen Form, Stufen und Goldpunkt.
- `public/favicon.svg` zeigt in kleiner Größe nur „t“ und Punkt.

**Adermuster für den Login:** Ein Skript `scripts/build-veins.mjs` (d3-contour und simplex-noise, nur zum Erzeugen) schreibt einmalig `src/assets/veins.svg` mit Höhenlinien; eine Linie ist golden.

**Bausteine anpassen** in `components/ui/`
- **Button:** `default` ist der eine Hauptbutton (Tinte, 28 px hoch, 6 px Ecken). Neu ist `plain` als Textbutton ohne Rahmen. `ghost` bleibt nur für reine Icon-Buttons.
- **Input:** Feld-Fläche, Feldrand, 36 px hoch, ruhiger Fokus.
- **Tabs:** Variante `line` als Text mit 1 px Unterstrich.
- **Table:** Kopf 12 px, mittleres Gewicht, grau. Zeilen 40 px mit Haarlinien. Gewählte Zeile mit Auswahl-Fläche und 2 px Goldmarker links.
- **Popover, Dropdown, Tooltip, Command, Dialog, Sheet, Sonner:** Feld-Fläche, Rand und ein kleiner Schatten (nur hier erlaubt), keine Unschärfe, Toasts ohne Icons.
- **Kbd:** nur noch in Tooltips und der Befehlspalette.

**Beispieldaten** in `src/prototype/fixtures/`, getrennt nach `companies.ts`, `screens.ts`, `stock.ts`, `research.ts`, `tracking.ts`, `signals.ts`, `market.ts`, `briefing.ts`. Alle Werte, die in den Mockups stehen, exakt übernehmen. Für 47 Treffer werden zusätzliche erfundene Firmen deterministisch erzeugt. Kursreihen für alle Zeiträume kommen aus einem festen Zufallsgenerator, sodass Nordwind „heute −5,8 %“ und „1 Jahr +6,4 %“ zeigt.

**Styleguide** `/styleguide`: nur in der Entwicklung, nicht in der Navigation. Er zeigt Farben, Schriften, alle Bausteine und alle Zustände und dient mir als Prüfseite.

## Schritt 2 · App-Rahmen

- **Aufbau:** Leiste (64 px) | Inhalt (scrollt) | Agent (360 px, wenn offen).
- **Leiste:** Logo (32 px, führt zum Start). Darunter Suche (Lupe), Screens (Raster), Tracking (steigende Linie), Signale (Glocke), jeweils als Icon mit 11 px Label; das sind die Icons, die in den Mockups überwiegen. Aktiv: Auswahl-Fläche, Tinte, 6 px Ecken. Unten der Schalter für Hell und Dunkel (Mond oder Sonne) und der Avatar mit dem ersten Buchstaben deiner E-Mail; sein Menü führt zu Einstellungen und Abmelden.
- **Seitenkopf** `PageHeader`: Serif-Titel (28 px), daneben auf derselben Grundlinie grauer Metatext, rechts Textbuttons und höchstens ein Hauptbutton.
- **Agent:** `features/agent/agent-panel-context.tsx` behält nur noch `open`, ohne Recherche-Zustand. Ist der Agent zu, steht im Seitenkopf der Textbutton „Agent“. Strg J öffnet und schließt ihn auf allen Seiten außer Start, Recherche und Login.
- **Befehlspalette (Strg K):** Gruppen „Gehe zu“ (alle Seiten), „Screens“ (gespeicherte), „Aktien“ (Suche über Name und Ticker), „Aktionen“ (Agent öffnen, Neue Recherche, Hell oder Dunkel). Tastenkürzel werden hier und in Tooltips gezeigt, nie als eigene Leiste.
- **Tasten:** `/` setzt den Fokus ins Suchfeld, Esc schließt Agent und Menüs. j/k, Leertaste, Enter, T und X gelten in Tabellen.
- **Übergang:** Das Suchfeld wandert per View Transition vom Start in den Screen (bestehende CSS-Regeln).

## Schritt 3 · Seiten

### Login `/login` (Vorlage: v1, 03)
- **Links (44 %):** dunkle Fläche `#1B1714` mit dem Adermuster, cremefarbenes Logo oben links, unten das Zitat in Newsreader kursiv 32 px („Die besten Funde liegen unter der Oberfläche.“) und die Unterzeile.
- **Rechts:** ein zentrierter Bogen, 420 px breit. Er darf wie im abgenommenen Mockup 12 px Ecken und einen ganz weichen Schatten haben; das ist die einzige Ausnahme. Darin der Titel „Willkommen zurück“ (Serif 30 px), die Unterzeile, die Felder E-Mail und Passwort (mit Auge zum Anzeigen), der Hauptbutton „Anmelden“ über die ganze Breite, der Link „Konto anlegen“, eine Trennlinie und der Hinweis zum einen Konto. Unten rechts „Lokal verbunden“ mit Moos-Punkt, wie im Mockup.
- **Funktion:** bestehende Anmeldung und Fehlertexte. Neu ist eine Datenbankfunktion `installation_has_account()` (für nicht angemeldete Nutzer lesbar), damit „Konto anlegen“ verschwindet, sobald es dein Konto gibt.

### Start `/` (Vorlage: v2, 01)
- **Oben rechts:** „Xetra offen · 14:32“ oder „Xetra geschlossen · öffnet Mo 09:00“, echt aus der Uhrzeit berechnet (Mo bis Fr, 9:00 bis 17:30).
- **Mitte:** Logo-Lockup mit 56 px, Suchfeld 640 × 46 px mit Fokus beim Laden, darunter drei Beispiele als graue Textzeilen; ein Klick sucht damit.
- **„Seit gestern“:** drei Zeilen mit Haarlinien, Nordwind und Altmeer verlinken auf die Aktienseite, „3 neue Titel“ auf den Screen.
- **Unten:** Marktzeile mit DAX, Euro Stoxx 50, S&P 500, Nasdaq 100 und EUR/USD.
- **Absenden (Prototyp):** Eine Frage (Fragezeichen am Ende oder W-Wort am Anfang) führt zu `/recherche/demo`, alles andere zum Screen „Europa Small Caps“ mit deinem Text im Suchfeld.

### Screens `/screens` (nicht gemockt, nach den Regeln)
- **Kopf:** Titel „Screens“, Metatext „3 gespeichert“, Hauptbutton „Neuer Screen“ (führt zur Suche).
- **Tabelle auf einem Bogen:** Name in Tinte mit der Abfrage grau dahinter, Treffer, „Neu seit letztem Lauf“ (z. B. „+3“ in Moos), Aktualisiert. Ein Klick öffnet den Screen.
- **Leer:** „Noch keine Screens. Beschreib auf der Startseite, wonach du suchst, und speichere das Ergebnis.“ mit dem Textbutton „Zur Suche“.

### Screen mit Agent `/screens/$screenId` (Vorlage: v2, 02; dunkel: 06)
- **Kopf:** Titel „Europa Small Caps“, Metatext „Gespeicherter Screen · 17:35“. Textbuttons „Agent“ (wenn zu), „Spalten“ (Menü mit Häkchen pro Spalte) und „Exportieren“ (lädt die aktuelle Tabelle als CSV). Hauptbutton „Speichern“ (Meldung „Gespeichert“).
- **Suchfeld** mit der Abfrage; Enter führt im Prototyp denselben Screen erneut aus.
- **Filter-Tokens:** Ein Klick öffnet ein kleines Feld zum Ändern mit „Filter entfernen“. „Meine Regeln“ zeigt deine Regeln mit Schaltern. „+ Filter“ zeigt den Kennzahlen-Katalog nach Gruppen (Bewertung, Wachstum, Qualität, Dividende, Momentum), durchsuchbar.
- **Metazeile:** „47 Treffer · Ø KGV 11,2 · Ø Umsatzwachstum +13,9 % · Median Marktkap. 1,1 Mrd €“.
- **Tabelle (TanStack):** Unternehmen, Kurs, Heute, Marktkap., KGV, Umsatz Δ, Nettomarge, 1 Jahr. Ein Klick auf den Spaltenkopf sortiert, der Pfeil zeigt die Richtung. Zeilen 40 px, 47 Titel, Sparklines in Moos oder Terrakotta ohne Füllung.
- **Tasten:** j/k wählt, Leertaste klappt die Vorschau auf (größere Kurve, sechs Kennzahlen, „Öffnen“, „Tracken“), Enter öffnet die Aktie, T öffnet den Tracken-Dialog (These optional, Signal-Vorschläge), X verwirft mit „Rückgängig“ in der Meldung. Unter der Tabelle steht dann „2 verworfen · anzeigen“.
- **Agent rechts:** wie im Mockup. Kopf „Agent“ mit „sieht diesen Screen“. Der Verlauf ist ein Dokument: Frage mit feinem Strich, graue Schrittzeile mit „Rückgängig“, Antwort in Serif mit Fußnoten (Tooltip mit Quelle), Quellenliste.
- **Eingabe des Agenten:** „Recherche aus“ bzw. „an“ als Textschalter. Mit „aus“ erscheint die Frage im Verlauf und darunter grau „Antwort folgt in Phase 3“; mit „an“ führt Enter zur Recherche-Seite.
- **Zustände:** Laden (Skelett-Zeilen), leer („Kein Titel erfüllt alle Filter. Am engsten ist KGV < 15; ohne diesen Filter wären es 34 Treffer.“ mit Textbutton „KGV-Filter entfernen“), Fehler („Yahoo antwortet gerade nicht. Der letzte Stand von 17:35 ist gespeichert.“ mit „Erneut versuchen“), veraltet (Metazeile „Stand gestern, 17:35 · Aktualisieren“).

### Recherche `/recherche/$id` (Vorlage: v2, 03)
- **Aufbau:** Lesespalte (720 px) und Quellenspalte (280 px) mit einer Haarlinie dazwischen.
- **Kopf:** Titel, Metatext „Recherche · abgeschlossen · 23 Quellen · 1 Min 40“, Textbutton „Als Screen öffnen“ (Screen mit den 4 Titeln), Hauptbutton „Als Memo speichern“.
- **Frage** mit feinem Strich, darunter die Schrittzeile; „Schritte anzeigen“ klappt die vier Schritte grau auf.
- **Antwort** in Serif mit Zwischentitel. Ein Klick auf eine Fußnote hebt die Quelle rechts hervor.
- **Tabelle** mit Rüstungsanteil als dünnem Tinte-Balken, darunter die Links „Alle tracken“ und „In Memo übernehmen“ und die Zeile „Nicht belegt: …“.
- **Eingabe** „Nachfragen“ mit „Recherche an“; eine Nachfrage erscheint im Verlauf mit „Antwort folgt in Phase 3“.
- **Quellen:** 10 sichtbar, „Weitere 13 Quellen anzeigen“ klappt den Rest auf.
- **Laufender Zustand** (bei neuer Frage, nur im Prototyp vorgespielt): Die Schritte erscheinen nacheinander mit Laufzeit, dann die Antwort.

### Aktie `/aktie/$symbol` (Vorlage: v2, 04)
- **Kopf:** Name in Serif, Metatext „NWT.DE · Xetra · Industrie · Deutschland“. Textbutton „Warum bewegt sich das?“ öffnet den Agenten mit einer vorbereiteten Antwort; Hauptbutton „Tracken“ öffnet den Dialog.
- **Kurszeile:** „42,18 €“ (30 px), Veränderung in Terrakotta, „heute, 17:35“.
- **Chart auf einem Bogen** (Lightweight Charts):
  - Zeiträume 1T bis Max als Text mit Unterstrich; die Linienfarbe folgt der Veränderung im Zeitraum.
  - Nur waagerechte Gitterlinien, Preise rechts („40 €“), deutsche Monatsnamen.
  - Senkrechtes Fadenkreuz mit eigenem Tooltip „09.10.2026 · 42,18 €“.
  - Ereignis-Striche „Q2-Zahlen“ und „Getrackt“ auf der Zeitachse.
  - Oben rechts „1 Jahr +6,4 %“, passend zum gewählten Zeitraum.
- **Kennzahlen:** Liste mit Haarlinien und der 52-Wochen-Spanne als Linie mit Strich.
- **Finanzen:** eigene SVG-Balken (Umsatz in Tinte, EBIT in warmem Grau), die Schätzung nur als Umriss, Umschalter „Jährlich · Quartal“ als Text.
- **These:** Serif kursiv, per Klick bearbeitbar. Darunter die Signale (derselbe Baustein wie im Tracking).
- **Nachrichten:** fünf Schlagzeilen mit Quelle und Datum, nur Text.
- **Zustände:** Chart lädt (ruhiges graues Band), keine Nachrichten.

### Tracking `/tracking` (Vorlage: v2, 05)
- **Kopf:** Titel „Tracking“, Metatext „5 Titel · 4 Signale“, Umschalter „Aktiv · Archiv“ als Text (siehe Entscheidung 3).
- **Tabelle auf einem Bogen:** Pfeil, Unternehmen, Kurs, Seit Tracking, Getrackt am, These (grau, Serif kursiv, gekürzt), Signale (Anzahl).
- **Aufgeklappte Zeile:**
  - These in Serif, bearbeitbar.
  - Herkunft als Link zum Screen oder zur Recherche.
  - Signal-Zeilen mit Rhythmus und „nicht aktiv“.
  - Eingabe „Interessant, wenn …“: Enter fügt das Signal hinzu, mit der Meldung „Signal gespeichert. Es wird noch nicht geprüft.“
  - „Vorschläge:“ als Links; ein Klick fügt den Vorschlag als Signal hinzu.
- **Tasten:** j/k, Leertaste klappt auf, Enter öffnet die Aktie, Entf archiviert mit „Rückgängig“.
- **Archiv:** Unternehmen, Getrackt am, Archiviert am, Während Tracking, Seitdem (farbig), Grund (grau).
- **Fuß:** „Signale werden gespeichert, aber noch nicht geprüft.“
- **Leer:** „Noch nichts getrackt. Drück T in einem Screen oder auf einer Aktienseite.“

### Signale `/signale` (nicht gemockt, nach den Regeln)
- **Kopf:** Titel „Signale“, Metatext „4 Signale · keins aktiv“. Darunter grau: „Signale werden gespeichert, aber noch nicht geprüft. Die Prüfung kommt in einer späteren Phase.“
- **Neues Signal** oben: Eingabe „Interessant, wenn …“, Auswahl der Aktien (aus dem Tracking), Rhythmus, Textbutton „Hinzufügen“.
- **Tabelle auf einem Bogen:** Signal, Aktien (Ticker als graue Links), Rhythmus, Status „nicht aktiv“, angelegt am.
- **Aufgeklappt:** „Prüfverlauf: noch keine Prüfung“, Rhythmus ändern, Textbutton „Löschen“.
- **Leer:** „Noch keine Signale. Formuliere oben in eigenen Worten, wann eine Aktie interessant wird.“

### Einstellungen `/einstellungen` (nicht gemockt, nach den Regeln)
- **Darstellung:** Wie das System, Hell oder Dunkel.
- **Meine Regeln:** Liste mit „Entfernen“ und einer Eingabe für neue Regeln, zum Beispiel „keine Banken“.
- **Konto:** E-Mail und „Abmelden“.
- **Verbrauch:** grau „Erscheint mit dem Agenten in Phase 3.“
- **Über:** Version, Namensnennung „Kurs-Charts: Lightweight Charts von TradingView“ mit Link, Datenhinweis „Kursdaten über Yahoo Finance (yfinance), nur für privaten Gebrauch“.

### Nicht gefunden
Titel „Nicht gefunden“ in Serif, eine graue Zeile, Textlink „Zur Startseite“.

## Schritt 4 · Dunkelmodus und Zustände

Jede Seite in Hell und Dunkel; Screen und Login exakt nach ihren Mockups. Alle Zustände (laden, leer, Fehler, veraltet) stehen im Styleguide und auf den Seiten an ihrer echten Stelle.

## Reihenfolge

Die Seiten, die Bausteine für andere liefern, kommen zuerst. Nach jedem Block gibt es einen Zwischenstand für Eric.

1. **Grundlagen und App-Rahmen:** Tokens, Schriften, Logo, Bausteine, Styleguide, Leiste, Agent-Spalte, Befehlspalette.
2. **Screen mit Agent:** liefert Tabelle, Seitenkopf, Filter und den Agent-Verlauf, die fast alle anderen Seiten nutzen. Hat außerdem das beste Mockup, auch in Dunkel.
   → **Zwischenstand A:** Screen hell und dunkel neben den Mockups. Passt das Design-System hier, passt es überall.
3. **Start:** das Suchfeld, das in den Screen wandert.
4. **Tracking:** aufklappbare Zeilen und der Signal-Baustein, den die Aktienseite übernimmt.
5. **Aktie:** Chart, Kennzahlen, Finanzen; nutzt den Signal-Baustein.
6. **Recherche:** nutzt den Agent-Verlauf aus Schritt 2 in breiter Form.
   → **Zwischenstand B:** der ganze Kernablauf: suchen, Screen, Aktie, tracken, recherchieren.
7. **Signale:** Tabelle und Signal-Bausteine sind dann fertig.
8. **Screens-Übersicht.**
9. **Einstellungen.**
10. **Login:** funktioniert schon, bekommt hier das abgenommene Design.
11. **Nicht gefunden.**
12. **Dunkelmodus für alle Seiten, Zustände, Tests, Screenshots und Vergleichsseite.**
    → **Zwischenstand C:** Abnahme.

Vor dem ersten Code mit TanStack Table die mitgelieferten Agent-Skills des Pakets laden (`npx @tanstack/intent@latest install`), weil v9 eine neue API hat. Ebenso die Lightweight-Charts-Doku für v5 lesen.

## Verifikation

- **Automatisch:** `npm run typecheck`, `npm run lint`, `npm test`. Neue Unit-Tests für die Erkennung von Fragen, die Börsenzeiten und die Beispieldaten (stimmen mit den Mockups überein).
- **Klicktest mit Playwright** (`apps/web/e2e/`), mit einem Testkonto `@stocktruffle.test`, das danach über die lokale Admin-Schnittstelle gelöscht wird. Er deckt ab:
  - Anmelden.
  - Suchen und im Screen landen.
  - j/k, Leertaste, T, X und Rückgängig.
  - Strg J und Strg K.
  - Recherche und Nachfrage.
  - Zeitraum im Chart wechseln.
  - Tracking aufklappen und ein Signal anlegen.
  - Signale-Seite und Hell/Dunkel in den Einstellungen.
- **Screenshots:** `scripts/prototype-shots.mjs` erzeugt alle Seiten bei 1536 × 1024 (Format der Mockups), hell und dunkel, in `docs/design/prototyp-v2/` mit denselben Dateinamen wie `mockups-v2/`. Dazu `docs/design/vergleich.html` mit Mockup und Prototyp nebeneinander.
- **Selbstprüfung:** Jede Seite gegen die Tabelle „Was wir vermeiden“ in `konzept.md`, bevor du sie siehst. Dazu ein Durchgang nur mit der Tastatur und die Kontrastprüfung.
