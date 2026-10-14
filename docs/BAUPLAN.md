# Plan: stocktruffle – der Rest ab Phase 0b

## Kontext

Das Produkt, die Zielgruppe, der Funktionsumfang und die Gestaltungsregeln sind beschlossen und stehen in `docs/PLAN.md`; dieser Plan ersetzt sie nicht, sondern legt fest, **wie der verbleibende Bau abläuft**. Das Fundament (Phase 0a) ist fertig und geprüft. Offen sind die Oberfläche von Phase 0 und die Phasen 1 bis 5.

**Vorhanden und wiederzuverwenden:**

- `npm run dev` startet Supabase, Engine (:8000) und Web (:5173); `npm run env`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run db:types`.
- Engine: `apps/engine/src/engine/` mit `main.py` (`create_app`), `config.py` (`Settings`), `auth.py` (`current_user`, prüft Supabase-Tokens per JWKS), `api/system.py`; 10 Tests.
- Web: `apps/web/src/` mit `lib/format.ts` (`formatNumber`, `formatPrice`, `formatPercent`, `formatCompact`, `formatDate`, `MISSING`), `lib/supabase.ts`, `lib/api.ts` (`engine<T>()` mit Bearer-Token), `router.ts`, Routen `__root`, `login`, `_app` (Login-Wächter), `_app/index`; shadcn-Preset `nova` auf Base UI, bisher nur `components/ui/button.tsx`.
- Supabase: Migration mit `profiles` (RLS) und Einzelnutzer-Hook `hook_single_user`.
- `.mcp.json` für den shadcn-MCP ist angelegt und per Probelauf geprüft, in der Session aber **noch nicht verbunden**: Eric muss Claude Code einmal neu starten.

**Stehende Entscheidungen:** Name stocktruffle; Oberfläche Deutsch; Europa plus USA in Euro; Modelle in drei Rollen (Opus 5.5 Chat, Sonnet 5.5 Recherche pro Aktie, Haiku 5.5 Text zu Filter) als Ausgangspunkt; Signale vorerst nur als Oberfläche. Git: nichts ist committet, Commits nur auf Erics Wunsch.

## Arbeitsweise für alle Phasen

- Jede Phase endet mit ihrem „Fertig, wenn“, von Hand durchgespielt und Eric gezeigt. Erst dann beginnt die nächste.
- Jede Ansicht wird im eingebauten Browser in Hell und Dunkel geprüft (Screenshot, Konsole fehlerfrei, Durchgang nur mit Tastatur).
- Komponenten kommen über den shadcn-MCP (suchen, Beispiele ansehen, Add-Befehl holen, mit `--cwd apps/web` ausführen). Nichts nachbauen, was die Registry hat.
- Vor jeder neuen Bibliothek die aktuelle Doku lesen; vor Agent-Code den Skill `claude-api` laden.
- Zahlen ausschließlich über `lib/format.ts`. Neue Tabellen immer mit RLS, danach `npm run db:types`.
- Engine-Tests nutzen aufgezeichnete Yahoo-Antworten, keine Live-Abrufe.

## Phase 0b: Design und Prototyp (als Nächstes)

Voraussetzung: Neustart, damit die shadcn-Werkzeuge da sind. Falls sie danach fehlen, zuerst das klären, nicht mit Handarbeit umgehen.

1. **Design-Tokens** in `apps/web/src/index.css` (die shadcn-Variablen überschreiben, keine zweite Token-Welt): neutrale Grauskala hell und dunkel, `--gain` und `--loss` als einzige Farben, kleiner Radius, Haarlinien-Rahmen, `--text-sm` auf 13 px, Schriftrollen `--font-sans`, `--font-mono`, `--font-serif`. Tabellenziffern als Utility-Klasse.
2. **Schriften** über Fontsource: Geist und Geist Mono (Variante A), IBM Plex Sans und Mono (Variante B), Newsreader für lange Texte. Umschaltbar über ein Attribut am `html`-Element, nur für den Prototyp.
3. **Bausteine** per MCP holen: input, field/label, table, tooltip, popover, command, dialog, sheet, tabs, toggle, kbd, skeleton, separator, scroll-area, sonner. Chat-Bausteine aus der AI-Elements-Registry prüfen und nur übernehmen, wenn sie ohne Umbau zu den Tokens passen.
4. **App-Shell** in `routes/_app.tsx`: Kopfzeile (Screens, Tracking, Profil), Agent-Panel rechts mit Strg J, Befehlspalette mit Strg K, zentrale Tastaturbelegung in `lib/keys.ts`.
5. **Login** in `routes/login.tsx`: gleiche Komposition wie die Startseite (Wortmarke, E-Mail, Passwort), Anmelden und einmalige Registrierung über `supabase.auth`, Fehlermeldungen auf Deutsch, auch die Ablehnung des Einzelnutzer-Hooks. Das ist echte Funktion, kein Prototyp.
6. **Prototyp-Ansichten** mit Beispieldaten aus `src/prototype/fixtures.ts` (erfundene Firmen, klar getrennt von echtem Code):
   - Start: Wortmarke, Suchfeld, drei Beispielzeilen, Statuszeile.
   - Screen mit Agent: Suchfeld oben, Filterzeile mit Tokens, Ergebnistabelle mit Sparklines, Zeilen-Vorschau, Agent-Panel mit Schritten und Fußnoten.
   - Aktie: Kopf, Chart-Platzhalter in echter Größe, Kennzahlenliste, Finanzbalken, Zeitleiste.
   - Tracking: Tabelle, aufgeklappte Zeile mit These und Signalen („noch nicht aktiv“), Signal-Eingabe, Blick nach Signal, Archiv.
   - Recherche-Chat: breites Panel, Schalter im Eingabefeld, Schrittprotokoll, Tabelle in der Antwort, Aktionen, „Nicht belegt“.
   - Zustände: je eine Lade-, Leer- und Fehleransicht.
7. **Bewegung:** Suchfeld wandert von der Mitte nach oben (View Transitions oder Motion, nach Doku-Blick), sonst nichts über 150 ms.
8. **Abnahme:** Screenshots aller Ansichten in Hell und Dunkel und in beiden Schriftvarianten an Eric; er wählt Schrift, bestätigt oder ändert den shadcn-Stil (`shadcn apply`) und nennt Änderungen. Danach Variante B oder A samt Umschalter entfernen.

*Fertig, wenn* Eric sich einloggen kann und das Aussehen abgenommen hat.

## Phase 1: Screener

1. **Engine-Grundlage:** `data/gateway.py` (Drosselung, Retry, Cache in Postgres mit Laufzeit je Datentyp, Herkunft und Zeitstempel), `data/yahoo.py` als erster Connector; Postgres-Zugang über psycopg; Migration für `securities`, `fundamentals`, `prices_daily`, `api_cache`.
2. **Katalog:** `catalog/metrics.py` mit rund 60 Kennzahlen (Schlüssel, deutsches Label, Einheit, Format, Yahoo-Feld oder Formel, Beschreibung fürs Modell). Ein Endpunkt liefert ihn ans Frontend, damit Filterzeile und Spalten daraus entstehen.
3. **ScreenSpec und Compiler:** `screen/spec.py` (Pydantic), `screen/compiler.py` (teilt in Yahoo-`EquityQuery` und lokale Filter), `screen/runner.py` (Kandidaten seitenweise holen, anreichern, in Euro normalisieren, verworfene Titel ausblenden, Lauf speichern). Migration für `screens`, `screen_versions`, `screen_runs`, `screen_run_rows`, `screen_dismissals`.
4. **Text zu ScreenSpec:** `nl/parse.py` mit strukturierter Ausgabe; `tests/evals/nl_queries.yaml` mit rund 40 deutschen und englischen Sätzen; Auswertung nach Trefferquote, Latenz, Kosten für Haiku 5.5 und Sonnet 5.5. Braucht Erics API-Key in `apps/engine/.env`.
5. **API:** `api/search.py` (Ticker, Name, ISIN), `api/screens.py` (parsen, ausführen, speichern, Versionen, verwerfen). Typen fürs Frontend aus dem OpenAPI-Schema generieren.
6. **Web:** Prototyp-Ansichten Start und Screen an echte Daten hängen: `features/omnibox`, `features/screen` (FilterBar, ResultsTable mit TanStack Table und Virtual, ColumnPicker, RowPeek, Triage), Speichern, CSV, „Meine Regeln“ als abwählbarer Block aus `profiles.rules`.

*Fertig, wenn* „Profitable Small Caps in Europa, KGV unter 15“ in Sekunden eine korrekte, editierbare Liste liefert, der zweite Aufruf aus dem Cache kommt und die Auswertung die Modellwahl belegt.

## Phase 2: Aktie und Tracking

1. **Engine:** `api/stocks.py` (Profil, Kennzahlen, Abschlüsse über 5 Jahre, Kursreihe, Schätzungen, Termine, Insider, News) über das Gateway.
2. **Aktienseite:** `routes/_app/t.$symbol.tsx` mit Lightweight Charts, Kennzahlenliste aus dem Katalog, Finanzbalken, News, Notizen.
3. **Tracking:** Migration für `tracked_stocks`, `signals`, `signal_targets`, `signal_checks`; `api/tracking.py` und `api/signals.py`; Seite `routes/_app/tracking.tsx` mit beiden Blickwinkeln und Archiv; `T` überall, Dialog mit These, Snapshot und Herkunft automatisch.
4. **Signale als Oberfläche:** anlegen, an mehrere Aktien heften, Rhythmus wählen, überall „noch nicht aktiv“. Signal-Vorschläge aus der These als einzelner Modellaufruf.

*Fertig, wenn* ein Titel aus einem Screen getrackt, mit These und Signal versehen und in beiden Blickwinkeln zu sehen ist.

## Phase 3: Agent

1. **Laufzeit:** `agent/runtime.py` mit Tool-Schleife, Streaming als eigene SSE-Ereignisse, Kontext der Ansicht als System-Nachricht, Prompt-Cache; Migration für `threads`, `messages`, `memos`, `jobs`.
2. **Werkzeuge** in `agent/tools/` als dünne Hüllen um vorhandene Funktionen aus Phase 1 und 2; Websuche und Seitenabruf als Server-Werkzeuge.
3. **Web:** `features/agent` an den Stream hängen (`useAgentStream`), Schritte, Fußnoten, Quellenliste, Verlauf pro Screen und Aktie, Änderungen am Screen mit Rückgängig über `screen_versions`.
4. **Recherche-Modus:** Hintergrund-Job mit Limit für Suchen und Kosten, `research_each` mit dem Recherche-Modell, Fortschritt über Supabase Realtime, Inline-Tabelle mit „Als Screen öffnen“, „Alle tracken“, „Als Memo speichern“, Abschnitt „Nicht belegt“, Verbrauchsanzeige in den Einstellungen.

*Fertig, wenn* Eric per Chat einen Screen umbauen und zurücknehmen kann und eine Recherche-Frage eine belegte Antwort mit Tabelle liefert, ohne dass sich die Ansicht ändert.

## Phase 4: Dranbleiben

In dieser Reihenfolge, jedes Stück einzeln abnehmbar: Screens erneut ausführen mit Diff und Zeitplan (`jobs/`), Vorwärtstest, Was hat sich geändert, Warum bewegt sich das, Gegenposition, Zeitleiste, Earnings-Vorbereitung, Briefing-Zeile, KI-Spalten (`ai_columns`, `ai_cells`, füllt sich über Realtime, mit Kostenvorschau).

*Fertig, wenn* sich eine KI-Spalte live mit belegten Antworten füllt, ein gespeicherter Screen neue und herausgefallene Titel zeigt und die Briefing-Zeile stimmt.

## Phase 5: Tiefe

Firmen-Index (Beschreibungen sammeln als fortsetzbarer Hintergrundlauf, lokale Embeddings, pgvector), „ähnlich wie“ und Themen-Suche im Suchfeld, Branchenvergleich, Linsen (`lenses`), Dokumente als PDF mit Seitenangabe, SEC EDGAR als zweiter Connector, Vergleichsansicht.

*Fertig, wenn* „Wie ASML, nur kleiner“ ohne Websuche Treffer liefert.

## Später

Signale scharf schalten (Einsortieren in Daten- oder Recherche-Prüfung, Prüfverlauf, E-Mail über einen Maildienst).

## Verifikation

- **Automatisch:** `npm test` (pytest und Vitest), `npm run typecheck`, `npm run lint` nach jedem Arbeitsschritt; ab Phase 1 Playwright für den Kernablauf (suchen, Filter ändern, speichern, tracken, Signal anheften).
- **Sichtprüfung:** `preview_start` mit `web` und `engine` aus `.claude/launch.json`, Screenshots in Hell und Dunkel, Konsole ohne Fehler.
- **Daten:** Stichprobe von fünf Titeln je Phase gegen die Yahoo-Seite prüfen, bevor eine Kennzahl als korrekt gilt.
- **Kosten:** Die Auswertung in Phase 1 und jeder Recherche-Lauf melden ihren Verbrauch.

## Was Eric beisteuern muss

- **Jetzt:** Claude Code neu starten.
- **In Phase 0b:** Schrift und Stil am Prototyp wählen, Aussehen abnehmen.
- **Vor Phase 1:** API-Key in `apps/engine/.env` eintragen.
- **Jederzeit:** sagen, wann committet werden soll.
