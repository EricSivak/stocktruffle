// The tracking list of the approved mockup (docs/design/mockups-v2/05-tracking.webp). Prices
// at tracking come from the series, which pass through the mockup's changes (anchors.ts).
import { ARCHIVED, TRACKED_SINCE } from "./anchors"
import { yearIndex } from "./calendar"
import { companyBySymbol } from "./companies"

export type Rhythm = "daily" | "weekly" | "after earnings"

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
  title: "Europe Small Caps",
  date,
  to: { screenId: "europe-small-caps" },
})

const details: Record<
  string,
  Omit<TrackedStock, "symbol" | "trackedAt" | "trackedPrice">
> = {
  "NWT.DE": {
    thesis: "Cheap because a major contract ends in 2027. The margin holds.",
    origin: SCREEN_ORIGIN("2026-09-02"),
    signals: [
      {
        id: "s1",
        text: "Interesting when the P/E falls below 10",
        rhythm: "daily",
      },
    ],
  },
  "HBG.DE": {
    thesis: "Cheaply valued, but new building depends on interest rates.",
    origin: {
      kind: "research",
      title: "Developers after the rate turn",
      date: "2026-08-21",
    },
    signals: [
      {
        id: "s2",
        text: "Interesting when mortgage rates fall",
        rhythm: "weekly",
      },
      {
        id: "s3",
        text: "Order intake turns positive",
        rhythm: "after earnings",
      },
    ],
  },
  "SBG.ST": { thesis: "", origin: SCREEN_ORIGIN("2026-07-14"), signals: [] },
  "ALM.PA": {
    thesis: "Measuring equipment for wind farms, high margin.",
    origin: SCREEN_ORIGIN("2026-09-30"),
    signals: [
      { id: "s4", text: "Interesting when insiders buy", rhythm: "daily" },
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
  "TRS.MC": "Thesis did not hold",
  "BRN.VI": "Price target reached",
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
  "HBG.DE": ["Building permits rise", "Insider buying"],
  "NWT.DE": ["New major contract", "Insider buying"],
}

export function signalSuggestions(symbol: string): string[] {
  return suggestions[symbol] ?? ["P/E falls below 10", "Insider buying"]
}
