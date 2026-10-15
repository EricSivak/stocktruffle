// Price series for the chart's periods, all cut from one history per company so that they
// never contradict each other: a month is the end of the year, five years extend it backwards,
// and the intraday views run between the daily closes.
import { AS_OF_DATE, chartTime, tradingDays, YEAR_DAYS } from "./calendar"
import type { Company } from "./companies"
import { priceSeries, seeded } from "./random"

export const RANGES = ["1D", "1W", "1M", "6M", "1Y", "5Y", "Max"] as const
export type Range = (typeof RANGES)[number]

/** Spoken name of a period, for "1 year +6.4%". */
export const RANGE_LABELS: Record<Range, string> = {
  "1D": "Today",
  "1W": "1 week",
  "1M": "1 month",
  "6M": "6 months",
  "1Y": "1 year",
  "5Y": "5 years",
  Max: "Max",
}

export type Point = { time: number; value: number }

const HISTORY_YEARS = 15
const SESSION_MINUTES = 8.5 * 60 // 09:00 to 17:30

function seedOf(company: Company): number {
  let hash = 0
  for (const char of company.symbol) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return hash >>> 0
}

/** One trading day from the previous close to this close, every `step` minutes. */
function session(
  seed: number,
  iso: string,
  open: number,
  close: number,
  step: number
): Point[] {
  const count = SESSION_MINUTES / step + 1
  return priceSeries(seed, open, close, count, 0.0022).map((value, i) => {
    const minutes = 9 * 60 + i * step
    return {
      time: chartTime(iso, Math.floor(minutes / 60), minutes % 60),
      value,
    }
  })
}

const cache = new Map<string, Point[]>()

function build(company: Company, range: Range): Point[] {
  const seed = seedOf(company)
  const year = company.year
  const days = (count: number): Point[] =>
    YEAR_DAYS.slice(-count).map((iso, i) => ({
      time: chartTime(iso),
      value: year[year.length - count + i],
    }))

  switch (range) {
    case "1D":
      return session(seed, AS_OF_DATE, year.at(-2)!, year.at(-1)!, 5)
    case "1W": {
      // The last day reuses the 1D path at half-hour steps, so both views agree.
      const today = session(seed, AS_OF_DATE, year.at(-2)!, year.at(-1)!, 5)
      const lastDay = today.filter((_, i) => i % 6 === 0)
      const earlier = YEAR_DAYS.slice(-5, -1).flatMap((iso, i) =>
        session(
          seed + i + 1,
          iso,
          year[year.length - 6 + i],
          year[year.length - 5 + i],
          30
        )
      )
      return [...earlier, ...lastDay]
    }
    case "1M":
      return days(21)
    case "6M":
      return days(125)
    case "1Y":
      return days(YEAR_DAYS.length)
    case "5Y":
    case "Max": {
      const before = HISTORY_YEARS * YEAR_DAYS.length
      const random = seeded(seed)
      const start = year[0] / (1.4 + random() * 2.2)
      const history = priceSeries(seed + 99, start, year[0], before + 1)
      const isoDays = tradingDays(AS_OF_DATE, before + YEAR_DAYS.length)
      const values = [...history.slice(0, -1), ...year]
      const points = isoDays.map((iso, i) => ({
        time: chartTime(iso),
        value: values[i],
      }))
      if (range === "5Y") return points.slice(-5 * YEAR_DAYS.length)
      // Weekly closes over the whole history, ending on the last day.
      return points.filter((_, i) => (points.length - 1 - i) % 5 === 0)
    }
  }
}

/** The series for one period of one company, cached. */
export function rangeSeries(company: Company, range: Range): Point[] {
  const key = `${company.symbol}:${range}`
  let points = cache.get(key)
  if (!points) {
    points = build(company, range)
    cache.set(key, points)
  }
  return points
}

/** Change over a period: last point against the first. */
export function rangeChange(points: Point[]): number | null {
  if (points.length < 2) return null
  return points[points.length - 1].value / points[0].value - 1
}

/** Lowest and highest close of the last year. */
export function yearRange(company: Company): { low: number; high: number } {
  return { low: Math.min(...company.year), high: Math.max(...company.year) }
}
