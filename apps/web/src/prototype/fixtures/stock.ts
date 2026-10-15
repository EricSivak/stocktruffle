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
  /** The agent's prepared answer to "Why is it moving?". */
  why: ThreadItem[]
}

const EVENTS: StockEvent[] = [{ date: "2026-08-13", label: "Q2 results" }]

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
      title: "Two analysts cut their price target for Nordwind Technik",
      source: "Analyst note",
      date: "2026-10-09",
    },
    {
      title: "Wind power suppliers: order gap expected from 2027",
      source: "Industry report",
      date: "2026-09-12",
    },
    {
      title: "Nordwind Technik holds its margin in the second quarter",
      source: "Quarterly report",
      date: "2026-08-13",
    },
    {
      title: "Management confirms its guidance for 2026",
      source: "Press release",
      date: "2026-08-07",
    },
    {
      title: "Nordwind opens a service site in Rostock",
      source: "Trade press",
      date: "2026-07-22",
    },
  ],
  events: EVENTS,
  why: [
    { kind: "question", text: "Why is Nordwind Technik moving today?" },
    { kind: "steps", text: "News loaded · 3 sources read" },
    {
      kind: "answer",
      parts: [
        "Two analysts cut their price target today. They expect the major contract not to be renewed in 2027.",
        { footnote: 1 },
        " Nothing has changed in the business itself: the margin held steady in the second quarter,",
        { footnote: 2 },
        " and management stands by its guidance.",
        { footnote: 3 },
      ],
    },
    {
      kind: "sources",
      items: [
        { n: 1, title: "Analyst note", detail: "09/10/2026" },
        { n: 2, title: "Q2 quarterly report", detail: "13/08/2026" },
        { n: 3, title: "Press release", detail: "07/08/2026" },
      ],
    },
  ],
}

const HEADLINES = [
  "{name} reports second-quarter results",
  "Analyst raises the price target for {name}",
  "{name} announces a new order",
  "{name} confirms its 2028 targets at its capital markets day",
  "{name} board member buys shares",
]
const SOURCES = [
  "Quarterly report",
  "Analyst note",
  "Press release",
  "Trade press",
  "Directors' dealings",
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
      { kind: "question", text: `Why is ${company.name} moving today?` },
      { kind: "pending", text: "Answer arrives in phase 3" },
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
