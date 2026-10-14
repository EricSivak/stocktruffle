// The tracking list of the approved mockup (docs/design/mockups-v2/05-tracking.webp). Prices
// at tracking come from the series, which pass through the mockup's changes (anchors.ts).
import { ARCHIVED, TRACKED_SINCE } from "./anchors"
import { yearIndex } from "./calendar"
import { companyBySymbol } from "./companies"

export type Rhythm = "täglich" | "wöchentlich" | "nach Quartalszahlen"

export type Signal = { id: string; text: string; rhythm: Rhythm }

/** Where the idea came from; linked when the prototype has that page. */
export type Origin = {
  kind: "screen" | "research"
  title: string
  date: string
  to?: { screenId: string } | { researchId: string }
}

export type TrackedStock = {
  symbol: string
  trackedAt: string
  trackedPrice: number
  thesis: string
  origin: Origin | null
  signals: Signal[]
}

export type ArchivedStock = {
  symbol: string
  trackedAt: string
  archivedAt: string
  trackedPrice: number
  archivedPrice: number
  reason: string
}

/** The close of a stock on a past date of its one-year series. */
export function closeOn(symbol: string, iso: string): number {
  const company = companyBySymbol(symbol)
  if (!company) throw new Error(`Unknown symbol ${symbol}`)
  return company.year[yearIndex(iso)]
}

const SCREEN_ORIGIN = (date: string): Origin => ({
  kind: "screen",
  title: "Europa Small Caps",
  date,
  to: { screenId: "europa-small-caps" },
})

const details: Record<
  string,
  Omit<TrackedStock, "symbol" | "trackedAt" | "trackedPrice">
> = {
  "NWT.DE": {
    thesis: "Günstig, weil ein Großauftrag 2027 ausläuft. Die Marge hält.",
    origin: SCREEN_ORIGIN("2026-09-02"),
    signals: [
      {
        id: "s1",
        text: "Interessant, wenn das KGV unter 10 fällt",
        rhythm: "täglich",
      },
    ],
  },
  "HBG.DE": {
    thesis: "Günstig bewertet, aber der Neubau hängt an den Zinsen.",
    origin: {
      kind: "research",
      title: "Bauträger nach der Zinswende",
      date: "2026-08-21",
    },
    signals: [
      {
        id: "s2",
        text: "Interessant, wenn die Hypothekenzinsen sinken",
        rhythm: "wöchentlich",
      },
      {
        id: "s3",
        text: "Auftragseingang dreht ins Plus",
        rhythm: "nach Quartalszahlen",
      },
    ],
  },
  "SBG.ST": { thesis: "", origin: SCREEN_ORIGIN("2026-07-14"), signals: [] },
  "ALM.PA": {
    thesis: "Messtechnik für Windparks, hohe Marge.",
    origin: SCREEN_ORIGIN("2026-09-30"),
    signals: [
      { id: "s4", text: "Interessant, wenn Insider kaufen", rhythm: "täglich" },
    ],
  },
  "LKS.HE": { thesis: "", origin: null, signals: [] },
}

export const trackedStocks: TrackedStock[] = TRACKED_SINCE.map(
  ({ symbol, date }) => ({
    symbol,
    trackedAt: date,
    trackedPrice: closeOn(symbol, date),
    ...details[symbol],
  })
)

const reasons: Record<string, string> = {
  "TRS.MC": "These hat sich nicht bestätigt",
  "BRN.VI": "Kursziel erreicht",
}

export const archivedStocks: ArchivedStock[] = ARCHIVED.map((entry) => ({
  symbol: entry.symbol,
  trackedAt: entry.trackedAt,
  archivedAt: entry.archivedAt,
  trackedPrice: closeOn(entry.symbol, entry.trackedAt),
  archivedPrice: closeOn(entry.symbol, entry.archivedAt),
  reason: reasons[entry.symbol],
}))

/** Signal ideas offered under the input, per stock; the rest get the general ones. */
const suggestions: Record<string, string[]> = {
  "HBG.DE": ["Baugenehmigungen steigen", "Insiderkäufe"],
  "NWT.DE": ["Neuer Großauftrag", "Insiderkäufe"],
}

export function signalSuggestions(symbol: string): string[] {
  return suggestions[symbol] ?? ["KGV fällt unter 10", "Insiderkäufe"]
}
