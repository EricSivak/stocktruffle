// What the stock page shows beyond the screen's columns. Nordwind carries the values of the
// approved mockup (docs/design/mockups-v2/04-aktie.webp); every other company gets
// deterministic invented values derived from its screen figures.
import type { ThreadItem } from "./agent"
import type { Company } from "./companies"
import { seeded } from "./random"

/** One bar group of the financials chart, in million euros. */
export type Period = {
  label: string
  revenue: number
  ebit: number
  estimate?: boolean
}

export type NewsItem = { title: string; source: string; date: string }

export type StockEvent = { date: string; label: string }

export type StockDetails = {
  forwardPe: number | null
  evToEbitda: number | null
  annual: Period[]
  quarterly: Period[]
  news: NewsItem[]
  events: StockEvent[]
  /** The agent's prepared answer to "Warum bewegt sich das?". */
  why: ThreadItem[]
}

const EVENTS: StockEvent[] = [{ date: "2026-08-13", label: "Q2-Zahlen" }]

// Share of a year's revenue per quarter: business picks up towards year end.
const SEASON = [0.23, 0.25, 0.25, 0.27]

function quarters(annual: Period[], margin: number): Period[] {
  const [, , y2024, y2025, y2026] = annual
  const quarter = (
    label: string,
    year: Period,
    q: number,
    estimate = false
  ): Period => {
    const revenue = Math.round(year.revenue * SEASON[q])
    return { label, revenue, ebit: Math.round(revenue * margin), estimate }
  }
  return [
    quarter("Q4/24", y2024, 3),
    quarter("Q1/25", y2025, 0),
    quarter("Q2/25", y2025, 1),
    quarter("Q3/25", y2025, 2),
    quarter("Q4/25", y2025, 3),
    quarter("Q1/26", y2026, 0),
    quarter("Q2/26", y2026, 1),
    quarter("Q3/26e", y2026, 2, true),
  ]
}

const nordwindAnnual: Period[] = [
  { label: "2022", revenue: 612, ebit: 66 },
  { label: "2023", revenue: 688, ebit: 76 },
  { label: "2024", revenue: 754, ebit: 85 },
  { label: "2025", revenue: 861, ebit: 98 },
  { label: "2026e", revenue: 1018, ebit: 117, estimate: true },
]

const nordwind: StockDetails = {
  forwardPe: 9.8,
  evToEbitda: 6.2,
  annual: nordwindAnnual,
  quarterly: quarters(nordwindAnnual, 0.114),
  news: [
    {
      title: "Zwei Analysten senken das Kursziel für Nordwind Technik",
      source: "Analystenkommentar",
      date: "2026-10-09",
    },
    {
      title: "Windkraft-Zulieferer: Auftragslücke ab 2027 erwartet",
      source: "Branchenbericht",
      date: "2026-09-12",
    },
    {
      title: "Nordwind Technik hält die Marge im zweiten Quartal",
      source: "Quartalsbericht",
      date: "2026-08-13",
    },
    {
      title: "Management bestätigt die Prognose für 2026",
      source: "Pressemitteilung",
      date: "2026-08-07",
    },
    {
      title: "Nordwind eröffnet einen Servicestandort in Rostock",
      source: "Fachpresse",
      date: "2026-07-22",
    },
  ],
  events: EVENTS,
  why: [
    { kind: "question", text: "Warum bewegt sich Nordwind Technik heute?" },
    { kind: "steps", text: "Nachrichten geladen · 3 Quellen gelesen" },
    {
      kind: "answer",
      parts: [
        "Zwei Analysten haben heute ihr Kursziel gesenkt. Sie rechnen damit, dass der Großauftrag 2027 nicht verlängert wird.",
        { footnote: 1 },
        " Am laufenden Geschäft hat sich nichts geändert: Die Marge ist im zweiten Quartal stabil geblieben,",
        { footnote: 2 },
        " und das Management hält an der Prognose fest.",
        { footnote: 3 },
      ],
    },
    {
      kind: "sources",
      items: [
        { n: 1, title: "Analystenkommentar", detail: "09.10.2026" },
        { n: 2, title: "Quartalsbericht Q2", detail: "13.08.2026" },
        { n: 3, title: "Pressemitteilung", detail: "07.08.2026" },
      ],
    },
  ],
}

const HEADLINES = [
  "{name} legt Zahlen zum zweiten Quartal vor",
  "Analyst hebt das Kursziel für {name}",
  "{name} meldet einen neuen Auftrag",
  "{name} bestätigt auf dem Kapitalmarkttag die Ziele bis 2028",
  "Vorstand von {name} kauft Aktien",
]
const SOURCES = [
  "Quartalsbericht",
  "Analystenkommentar",
  "Pressemitteilung",
  "Fachpresse",
  "Stimmrechtsmitteilung",
]
const NEWS_DATES = [
  "2026-10-06",
  "2026-09-24",
  "2026-09-03",
  "2026-08-19",
  "2026-08-13",
]

function symbolSeed(symbol: string): number {
  let hash = 7
  for (const char of symbol) hash = (hash * 33 + char.charCodeAt(0)) | 0
  return hash >>> 0
}

function invented(company: Company): StockDetails {
  const random = seeded(symbolSeed(company.symbol))
  // Revenue implied by the screen figures: profit is market cap over P/E.
  const revenue2025 =
    company.marketCapEur / company.pe / company.netMargin / 1e6
  const ebitMargin = company.netMargin * (1.3 + random() * 0.3)
  const annual: Period[] = []
  let revenue = revenue2025
  for (let year = 2025; year >= 2022; year--) {
    annual.unshift({
      label: String(year),
      revenue: Math.round(revenue),
      ebit: Math.round(revenue * ebitMargin),
    })
    revenue /= 1 + company.revenueGrowth * (0.6 + random() * 0.8)
  }
  const estimate = revenue2025 * (1 + company.revenueGrowth)
  annual.push({
    label: "2026e",
    revenue: Math.round(estimate),
    ebit: Math.round(estimate * ebitMargin),
    estimate: true,
  })
  const news = HEADLINES.map((headline, i) => ({
    title: headline.replace("{name}", company.name),
    source: SOURCES[i],
    date: NEWS_DATES[i],
  })).sort((a, b) => b.date.localeCompare(a.date))

  return {
    forwardPe: Number((company.pe * (0.82 + random() * 0.1)).toFixed(1)),
    evToEbitda: Number((company.pe * (0.5 + random() * 0.15)).toFixed(1)),
    annual,
    quarterly: quarters(annual, ebitMargin),
    news,
    events: EVENTS,
    why: [
      { kind: "question", text: `Warum bewegt sich ${company.name} heute?` },
      { kind: "pending", text: "Antwort folgt in Phase 3" },
    ],
  }
}

const cache = new Map<string, StockDetails>()

/** Details for one company; the same object every time, so pages can depend on it. */
export function stockDetails(company: Company): StockDetails {
  if (company.symbol === "NWT.DE") return nordwind
  let details = cache.get(company.symbol)
  if (!details) {
    details = invented(company)
    cache.set(company.symbol, details)
  }
  return details
}
