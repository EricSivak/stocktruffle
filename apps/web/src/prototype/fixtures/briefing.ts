// "Since yesterday" on the start page: what changed among the screens and tracked stocks.
import { AS_OF_TIME } from "./calendar"
import { companyBySymbol } from "./companies"

export type BriefingItem = {
  id: string
  text: string
  /** A signed change shown in colour, or a short gray note. */
  change?: number
  note?: string
  to: { kind: "stock"; symbol: string } | { kind: "screen"; screenId: string }
}

const nordwind = companyBySymbol("NWT.DE")!

export const briefing: BriefingItem[] = [
  {
    id: "nordwind",
    text: nordwind.name,
    change: nordwind.dayChange,
    to: { kind: "stock", symbol: nordwind.symbol },
  },
  {
    id: "new-hits",
    text: "3 new stocks in Europe Small Caps",
    note: `since ${AS_OF_TIME}`,
    to: { kind: "screen", screenId: "europe-small-caps" },
  },
  {
    id: "altmeer",
    text: "Altmeer Mesure reports quarterly results",
    note: "tomorrow",
    to: { kind: "stock", symbol: "ALM.PA" },
  },
]

/** The examples under the start page's search field. */
export const searchExamples = [
  "Profitable small caps in Europe, P/E under 15",
  "Like ASML, only smaller and cheaper",
  "Why is Rheinmetall falling today?",
]
