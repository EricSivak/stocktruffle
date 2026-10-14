# Plan: stocktruffle – Aktien-Screener mit Recherche-Agent

## Kontext

Eric will ein persönliches Werkzeug, mit dem er Aktien per Text findet, statt Filterformulare auszufüllen: ein Suchfeld im Stil der Google-Startseite, daneben ein Agent, der seine Screens sieht und selbstständig im Netz recherchiert. Heutige Screener sind formularlastig, Chatbots erfinden Zahlen. Ziel ist eine vollständige Web-App, die zunächst nur lokal läuft (lokales Supabase, E-Mail-Login) und sichtbar gestaltet ist, nicht „gevibecodet“.

**Name (von Eric festgelegt):** stocktruffle. Wortmarke, Titel und Pakete heißen `stocktruffle`; der Projektordner bleibt `stockfinderapp`.

**Zielgruppe (von Eric bestätigt):** ernsthafte Privatanleger im deutschsprachigen Raum, die Einzelaktien nach Fundamentaldaten auswählen und langfristig halten. Daraus folgt: Oberfläche auf Deutsch, Europa plus USA, Beträge in Euro, Suche versteht ISIN, Tages- statt Sekundenrhythmus. Das Tool informiert und belegt, es empfiehlt nicht.

**Ausgangslage (geprüft am 2026-10-13):** Projektordner leer, kein Git-Repo. Vorhanden: Supabase CLI 2.117, Docker (läuft), Node 24, npm 12, Python 3.14, uv 0.11. Es fehlen: shadcn-MCP (in der Session nicht verbunden) und ein Anthropic-API-Key (nicht gesetzt).

## Leitprinzipien

1. **Das Modell übersetzt, der Code rechnet.** Aus Text wird eine sichtbare, editierbare Filterzeile. Jede Zahl stammt aus einer Datenquelle mit Zeitstempel, nie aus dem Modell. Web-Aussagen des Agenten tragen Fußnoten.
2. **Keine Sackgasse.** Jede Liste im Chat lässt sich als Screen öffnen, jeder Titel tracken, jede Antwort als Memo speichern.
3. **Ehrliche Zustände.** „Nicht belegt“ steht ausdrücklich da, Signale zeigen „noch nicht aktiv“, der Datenstand ist immer sichtbar, fehlende Werte sind „–“ und nicht 0.
4. **Der Agent ändert nie still.** Jede Änderung an einem Screen ist eine neue Version, erscheint als Schritt im Chat und lässt sich zurücknehmen.
5. **Eine Quelle der Wahrheit für Kennzahlen.** Ein Katalog steuert Modell-Prompt, Filterzeile, Spaltenauswahl und Formatierung.

## Gestaltung (Abnahme in Phase 0, vor jeder Logik)

- **Farbe gehört den Daten.** Oberfläche schwarz, weiß, grau. Grün und Rot nur für Veränderungen, immer mit Vorzeichen. Keine Verläufe, kein Glas, Schatten nur bei Popovern.
- **Linien statt Kästen.** Haarlinien und Weißraum, keine Karten in Karten.
- **Zahlen wie im Terminal.** Tabellenziffern, rechtsbündig, einheitliches deutsches Format (1,2 Mrd).
- **Schrift mit Aufgaben.** Sans für die Oberfläche, Mono für Zahlen und Ticker, Serif nur für lange Research-Texte. Vorschlag Geist, Alternative IBM Plex; Entscheidung am Prototyp. Schriften lokal über Fontsource.
- **Wortmarke.** Der Name kleingeschrieben in der Oberflächenschrift, ohne Bildzeichen.
- **Bewegung nur als Erklärung.** Das Suchfeld wandert von der Mitte nach oben, sonst nichts über 150 ms.
- **Tastatur zuerst.** `/` Suche, Strg K Befehle, Strg J Agent, j/k Zeilen, Leertaste Vorschau, `T` tracken, `X` verwerfen.
- **Jeder Zustand gestaltet.** Laden (Skelette in Form des Inhalts), leer, Fehler, veraltete Daten.
- **Keine Template-Merkmale.** Kein Emoji, kein Funkel-Icon für KI.
- Hell und Dunkel nach Systemeinstellung.

Ansichten: Start, Screen mit Agent, Aktie, Tracking, Recherche-Chat (breit), Login, Einstellungen, Befehlspalette. Komponenten kommen über das shadcn-MCP; Chat-Bausteine aus der AI-Elements-Registry, wo sie passen.

## Funktionsumfang (alles von Eric bestätigt)

| Bereich | Inhalt | Phase |
|---|---|---|
| Suche | Ein Feld: Ticker- und ISIN-Vorschläge sofort, Freitext wird zur Filterzeile, Fragen gehen an den Agenten | 1 |
| Ergebnisse | Tabelle mit Sparklines, Spalten-Sets, Sortieren, Zeilen-Vorschau, CSV, Speichern | 1 |
| Triage mit Gedächtnis | `T` trackt, `X` verwirft; Verworfenes taucht in diesem Screen nicht wieder auf | 1 |
| Meine Regeln | Dauerhafte Vorgaben als abwählbarer Filter; der Agent hält sich daran | 1 |
| Aktie | Chart, Kennzahlen, Finanzen über 5 Jahre, Schätzungen, Termine, Insider, News, Notizen | 2 |
| Tracking | Seite mit Kurs, Entwicklung seit Tracking, These, Snapshot, Herkunft; Blick nach Aktie oder Signal; Archiv mit Nachlauf | 2 |
| Signale (nur Oberfläche) | Satz in eigenen Worten an eine oder mehrere Aktien heften, Prüfrhythmus wählen, sichtbar „noch nicht aktiv“; beim Tracken schlägt das Modell passende Signale aus der These vor | 2 |
| Agent | Sieht die Ansicht, kennt Screens und Tracking, ändert Screens mit Rückgängig, recherchiert mit Quellen | 3 |
| Recherche-Modus | Schalter im Chat: Agent bleibt im Chat, screent als Werkzeug, fächert Recherche pro Aktie auf, antwortet mit Tabelle und Belegen | 3 |
| Dranbleiben | Was hat sich geändert, Warum bewegt sich das, Gegenposition, Zeitleiste, Earnings-Vorbereitung, Briefing-Zeile, Screens erneut ausführen mit Diff und Zeitplan, Vorwärtstest, KI-Spalten | 4 |
| Tiefe | Firmen-Index für Themen und „ähnlich wie“, Branchenvergleich, Linsen, Dokumente (PDF), SEC EDGAR, Vergleichsansicht | 5 |
| Signale scharf | Prüfung per Daten oder Recherche, Prüfverlauf, E-Mail bei Auslösung | später |

Bewusst nicht: Backtests (ohne historische Daten zum damaligen Wissensstand irreführend), Depot mit Kauf- und Verkaufsempfehlungen, Dashboards und Heatmaps.

## Architektur

```
Browser: Vite + React + shadcn/ui
   |  Login, eigene Daten (supabase-js)        |  Screens, Chat-Stream (HTTP + SSE, Bearer-Token)
   v                                            v
Supabase lokal                            Engine: Python + FastAPI
Auth, Postgres (RLS), Realtime, pgvector  <--  yfinance-Zugang mit Cache, Screen-Compiler, Agent, Jobs
                                                |
                                 Yahoo, Claude API (Websuche), später SEC EDGAR, FRED
```

Der API-Key liegt nur in der Engine; der Browser sieht ihn nie.

### Repo-Aufbau (alles neu anzulegen)

```
stockfinderapp/             Ordnername bleibt; die App heißt stocktruffle
  CLAUDE.md                 Konventionen und Gestaltungsregeln für spätere Sessions
  docs/PLAN.md              dieser Plan im Repo
  .mcp.json                 shadcn-MCP
  package.json              Root-Skripte: dev startet Supabase, Engine und Web
  .env.example
  supabase/
    config.toml             Auth: E-Mail und Passwort, Anmeldung nach dem ersten Konto geschlossen
    migrations/             Kern, Tracking und Signale, Chat, Marktdaten-Cache
  apps/web/                 Vite, React 19, TypeScript, Tailwind 4
    components.json
    src/styles/tokens.css   Design-Tokens, hell und dunkel
    src/lib/                format.ts (Zahlen, Währung, Datum), supabase.ts, api.ts (typisiert aus OpenAPI), keys.ts
    src/routes/             Start, login, s.$screenId, t.$symbol, tracking, settings
    src/features/
      omnibox/              Suchfeld, Vorschläge, Weiterleitung
      screen/               FilterBar, ResultsTable, ColumnPicker, RowPeek, Triage
      stock/                Header, PriceChart, Metrics, Financials, Timeline
      tracking/             TrackingTable, TrackDialog, SignalEditor, Archive
      agent/                ChatPanel, Composer mit Recherche-Schalter, Steps, Sources, InlineScreenCard, useAgentStream
      command/              Befehlspalette
  apps/engine/              Python über uv, FastAPI
    src/engine/
      main.py, config.py    App, CORS, Supabase-JWT-Prüfung; Modelle je Rolle, Limits
      catalog/metrics.py    Kennzahlen-Katalog
      screen/               spec.py (ScreenSpec), compiler.py, runner.py
      data/                 gateway.py (Drosselung, Cache, Retry), yahoo.py; später edgar.py, fred.py
      nl/parse.py           Text zu ScreenSpec
      agent/                runtime.py (Tool-Schleife, Stream, Modi), prompts.py, tools/
      jobs/                 Hintergrundläufe und Zeitplan
      api/                  Router: search, screens, stocks, tracking, signals, chat, jobs
    tests/                  pytest mit aufgezeichneten Yahoo-Antworten; evals/nl_queries.yaml
```

Stack mit geprüften Versionen: Vite 8, React 19, Tailwind 4.3, shadcn 4.21, TanStack Router, Query, Table 9 und Virtual, Lightweight Charts 5, Motion; FastAPI 0.143, yfinance 1.7, pandas 3, Anthropic SDK 1.13, sse-starlette, psycopg 3. Fast alle haben seit 2025 Major-Sprünge gemacht, deshalb gegen die aktuelle Doku bauen statt aus dem Gedächtnis. Vor Agent-Code den Skill `claude-api` laden und die Python-Dateien lesen (README, tool-use, streaming, prompt-caching).

### Screen-Pipeline

1. **Text zu ScreenSpec:** strukturierte Ausgabe gegen den Katalog (rund 60 Kennzahlen): Universum, Filter, Sortierung, Spalten. „Meine Regeln“ werden als eigener, abwählbarer Block ergänzt.
2. **Grobfilter bei Yahoo:** `compiler.py` schiebt alles, was der yfinance-Screener kann (rund 90 Felder, 59 Länder), in eine `EquityQuery` und holt die Kandidaten seitenweise.
3. **Feinfilter lokal:** Details nachladen, eigene Kennzahlen rechnen (FCF-Rendite, Abstand zum 52-Wochen-Hoch, Dividendenhistorie), Marktkapitalisierung in Euro normalisieren, verworfene Titel ausblenden. Jeder Lauf wird als Snapshot gespeichert (`screen_runs`).
4. **Optional qualitativ:** Recherche pro Zeile (Recherche-Modus, KI-Spalten).

Alle Yahoo-Aufrufe laufen über `data/gateway.py`: Drosselung, Cache in Postgres mit Laufzeiten je Datentyp (Kurse Minuten, Fundamentaldaten ein Tag, Abschlüsse eine Woche, Beschreibungen ein Monat), Herkunft und Zeitstempel pro Wert. Jede Quelle hängt hinter derselben Connector-Schnittstelle.

### Agent

- **Laufzeit:** Anthropic Python SDK, Tool-Schleife mit Streaming, adaptives Denken, Effort `medium` im Normalfall und `high` im Recherche-Modus. Stream zum Browser als eigene SSE-Ereignisse: Text, Schritt, Inline-Screen, Canvas geändert, Quelle, Verbrauch, Ende.
- **Kontext:** Die aktuelle Ansicht (Route, Filter, sichtbare Zeilen, Auswahl) kommt pro Turn als System-Nachricht in den Verlauf; Tool-Liste und System-Prompt bleiben stabil, damit der Prompt-Cache greift.
- **Eigene Werkzeuge:** `search_securities`, `run_screen` (liefert Handle, Kennzahlen-Statistik und Top-Zeilen), `get_screen`, `list_screens`, `apply_to_canvas` (neue Version), `get_quote`, `get_fundamentals`, `get_financials`, `get_price_stats`, `get_news`, `get_insiders`, `get_estimates`, `compare`, `research_each` (fächert pro Aktie auf), `track_stock`, `add_signal` (speichert nur), `save_memo`, `open_in_ui`.
- **Server-Werkzeuge:** Websuche und Seitenabruf der Claude API (`web_search_20260209`, `web_fetch_20260209`) mit Zitaten.
- **Recherche-Modus:** gleiche Werkzeuge, aber `apply_to_canvas` und `open_in_ui` sind gesperrt. Der Lauf ist ein Hintergrund-Job mit Limit für Suchen und Kosten, Fortschritt über Supabase Realtime, Ergebnis als Nachricht mit Inline-Tabelle, Fußnoten und dem Abschnitt „Nicht belegt“. `research_each` ist dieselbe Mechanik, die später KI-Spalten füllt.

### Datenmodell (Supabase Postgres)

- **Nutzerdaten mit RLS (`user_id = auth.uid()`):** `profiles` (Regeln, Einstellungen), `screens`, `screen_versions` (Spec je Version, Urheber Nutzer oder Agent), `screen_runs`, `screen_run_rows`, `screen_dismissals`, `tracked_stocks` (These, Snapshot, Herkunft, Archivdatum), `signals` (Text, Rhythmus, Status `inactive`), `signal_targets` (ein Signal, viele Aktien), `signal_checks` (jetzt leer, für später), `threads`, `messages` (Inhalt, Modus, Verbrauch), `memos`, `jobs`; ab Phase 4 `ai_columns`, `ai_cells`, ab Phase 5 `lenses`.
- **Marktdaten, für alle angemeldeten lesbar:** `securities` (Symbol, Name, Börse, Land, Sektor, Währung, ISIN, Beschreibung, später Embedding), `fundamentals`, `prices_daily`, `api_cache`.
- Typen für das Frontend aus `supabase gen types` und aus dem OpenAPI-Schema der Engine.

### Modelle und Key (Claudes Vorschlag als Ausgangspunkt, von Eric noch nicht ausdrücklich bestätigt)

| Rolle | Modell | Warum |
|---|---|---|
| Agent im Chat, Leitung der Recherche, Memos, Signal-Vorschläge | `claude-opus-5-5` | Urteilsvermögen bestimmt die Qualität |
| Recherche pro Aktie (`research_each`, KI-Spalten) | `claude-sonnet-5-5` | Viele parallele Aufrufe, halber Preis, unterstützt die aktuelle Websuche |
| Text zu Filterzeile, Signale einsortieren, Titel | `claude-haiku-5-5` | Einfache Extraktion, bei der Tempo zählt |

Die Zuordnung ist je Rolle eine Zeile in `config.py`; Alternativen wären alles auf Opus 5.5 oder Sonnet 5.5 für Chat und Recherche. Für Text zu Filterzeile entscheidet ein Test mit rund 40 Beispielsätzen (Trefferquote, Latenz, Kosten). Eric legt den Key selbst an, am besten in einem eigenen Workspace mit Ausgabenlimit, und trägt ihn in `apps/engine/.env` ein. Gebraucht wird er ab Phase 1. Die Einstellungen zeigen den Verbrauch pro Tag.

## Phasen

**Phase 0: Fundament und Design.** In dieser Reihenfolge:
1. `git init`, Root-`package.json`, `.gitignore`, `.env.example`.
2. shadcn-MCP einrichten (`npx shadcn@latest mcp init --client claude`). Danach muss Eric Claude Code neu starten, sonst fehlen die shadcn-Werkzeuge; alles Weitere in Phase 0 baut darauf auf.
3. `supabase init`, Auth-Konfiguration, `supabase start`, Login-Seite.
4. Web-Gerüst mit Design-Tokens und App-Shell; Engine-Gerüst mit Health-Endpunkt und JWT-Prüfung.
5. `CLAUDE.md` und dieser Plan als `docs/PLAN.md`.
6. Alle Kernansichten als klickbarer Prototyp mit Beispieldaten: Start, Screen mit Agent, Aktie, Tracking mit Signal-Eingabe, Recherche-Chat. Zwei Schriftvarianten nebeneinander.

*Fertig, wenn* `npm run dev` alles startet, der Login funktioniert und Eric das Aussehen in Hell und Dunkel abgenommen hat. Vorher entsteht keine Logik.

**Phase 1: Screener.** Gateway mit Cache, Katalog, ScreenSpec, Compiler, Runner, Text zu Filterzeile, Suchfeld mit Ticker- und ISIN-Vorschlägen, Ergebnistabelle, Filter editieren, Speichern, Triage, Meine Regeln.
*Fertig, wenn* „Profitable Small Caps in Europa, KGV unter 15“ in Sekunden eine korrekte, editierbare Liste liefert, der zweite Aufruf aus dem Cache kommt und der Test mit den Beispielsätzen die Modellwahl belegt.

**Phase 2: Aktie und Tracking.** Detailseite mit Chart, Kennzahlen und Finanzen; Tracking mit These, Snapshot, Herkunft und Archiv; Signale als reine Oberfläche mit Datenmodell für später, dazu Signal-Vorschläge beim Tracken.
*Fertig, wenn* ein Titel aus einem Screen mit `T` getrackt, mit These und Signal versehen und auf der Tracking-Seite in beiden Blickwinkeln zu sehen ist, und jedes Signal „noch nicht aktiv“ zeigt.

**Phase 3: Agent.** Laufzeit, Werkzeuge, Stream, Verlauf, Kontext der Ansicht, Änderungen mit Rückgängig; Recherche-Modus mit Hintergrund-Job, Inline-Tabelle und Aktionen.
*Fertig, wenn* Eric per Chat einen Screen umbauen und zurücknehmen kann und eine Recherche-Frage eine belegte Antwort mit Tabelle liefert, ohne dass sich die Ansicht ändert.

**Phase 4: Dranbleiben.** Die Punkte aus der Zeile „Dranbleiben“ der Tabelle oben.
*Fertig, wenn* sich eine KI-Spalte live mit belegten Antworten füllt, ein gespeicherter Screen beim erneuten Ausführen neue und herausgefallene Titel zeigt und die Briefing-Zeile auf der Startseite stimmt.

**Phase 5: Tiefe.** Firmen-Index mit lokalen Embeddings in pgvector, Branchenvergleich, Linsen, Dokumente, SEC EDGAR, Vergleich.
*Fertig, wenn* „Wie ASML, nur kleiner“ ohne Websuche Treffer liefert.

**Später: Signale scharf schalten.** Beim Aktivieren sortiert das Modell jedes Signal ein: per Daten prüfbar (Zinsen über FRED, Kennzahlen, Kurse) oder nur per Recherche. Jede Prüfung schreibt Urteil und Belege in `signal_checks`; E-Mail nur beim Wechsel auf „ausgelöst“. Dann zu klären: Maildienst, und dass nur geprüft wird, solange der Rechner läuft.

## Verifikation

- **Engine:** `uv run pytest` für Compiler, Katalog, Währungsumrechnung und Cache, mit aufgezeichneten Yahoo-Antworten statt Live-Abrufen; der Test mit den Beispielsätzen meldet Trefferquote, Latenz und Kosten je Modell.
- **Web:** Typprüfung, Lint, Vitest für Formatierung und die Abbildung zwischen ScreenSpec und Filterzeile; Playwright für den Kernablauf (suchen, Filter ändern, speichern, tracken, Signal anheften).
- **Sichtprüfung:** jede Ansicht im Browser in Hell und Dunkel gegen den abgenommenen Prototyp, dazu ein Durchgang nur mit der Tastatur.
- **Ende zu Ende je Phase:** das „Fertig, wenn“ von Hand durchspielen und Eric zeigen.

## Risiken und Grenzen

- **yfinance ist ein inoffizieller Yahoo-Zugang:** Rate-Limits, teils verzögerte Kurse, Lücken bei kleinen Nicht-US-Titeln. Antwort darauf sind Gateway, Cache und austauschbare Quellen.
- **Kosten:** Der Agent läuft über die Claude API mit eigenem Key. Recherche-Läufe und KI-Spalten haben Limits und zeigen ihre Kosten.
- **Falls daraus ein Produkt wird:** Yahoo-Daten sind nur für privaten Gebrauch gedacht, und persönliche Empfehlungen wären in Deutschland vermutlich erlaubnispflichtig. Beides vor einem Start klären. Für den Namen gab es nur eine schnelle Websuche ohne Treffer, keine Marken- oder Domainprüfung.

## Offen

- **Modelle:** Der Vorschlag oben gilt, bis Eric etwas anderes sagt.
- **API-Key:** legt Eric vor Phase 1 an.
- **Schrift:** Entscheidung am Prototyp in Phase 0.
