// "Seit gestern" on the start page: what changed among the screens and tracked stocks.
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
    text: "3 neue Titel in Europa Small Caps",
    note: `seit ${AS_OF_TIME}`,
    to: { kind: "screen", screenId: "europa-small-caps" },
  },
  {
    id: "altmeer",
    text: "Altmeer Mesure meldet Quartalszahlen",
    note: "morgen",
    to: { kind: "stock", symbol: "ALM.PA" },
  },
]

/** The examples under the start page's search field. */
export const searchExamples = [
  "Profitable Small Caps in Europa, KGV unter 15",
  "Wie ASML, nur kleiner und günstiger",
  "Warum fällt Rheinmetall heute?",
]
