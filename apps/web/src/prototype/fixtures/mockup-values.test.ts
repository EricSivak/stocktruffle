// The figures the approved mockups state must come out of the fixtures by calculation.
import { describe, expect, it } from "vitest"

import { formatPercent, formatPrice } from "@/lib/format"
import {
  ARCHIVED,
  YEAR_START,
  YEAR_TO_DATE,
} from "@/prototype/fixtures/anchors"
import { companyBySymbol } from "@/prototype/fixtures/companies"
import { rangeChange, rangeSeries } from "@/prototype/fixtures/series"
import {
  archivedStocks,
  closeOn,
  trackedStocks,
} from "@/prototype/fixtures/tracking"

const nordwind = companyBySymbol("NWT.DE")!

// The formatter separates units with a no-break space; the expectations use plain ones.
const plain = (text: string) => text.replace(/\s/gu, " ")

describe("stock page (mockup 04)", () => {
  it("shows today's change in euros and percent", () => {
    const change = nordwind.price - nordwind.price / (1 + nordwind.dayChange)
    expect(plain(formatPrice(change, "EUR"))).toBe("−2,60 €")
    expect(plain(formatPercent(nordwind.dayChange, { signed: true }))).toBe(
      "−5,8 %"
    )
  })

  it("agrees between the periods of the chart", () => {
    expect(rangeChange(rangeSeries(nordwind, "1J"))).toBeCloseTo(0.064, 10)
    expect(rangeChange(rangeSeries(nordwind, "1T"))).toBeCloseTo(-0.058, 10)
    for (const range of ["1T", "1W", "1M", "6M", "1J", "5J", "Max"] as const) {
      expect(rangeSeries(nordwind, range).at(-1)?.value).toBeCloseTo(42.18, 10)
    }
    expect(
      rangeSeries(nordwind, "5J")
        .slice(-250)
        .map((point) => point.value)
    ).toEqual(nordwind.year)
  })

  it("keeps chart times in order", () => {
    for (const range of ["1T", "1W", "5J", "Max"] as const) {
      const times = rangeSeries(nordwind, range).map((point) => point.time)
      expect(times).toEqual([...times].sort((a, b) => a - b))
      expect(new Set(times).size).toBe(times.length)
    }
  })
})

describe("tracking (mockup 05)", () => {
  it("has five stocks with four signals", () => {
    expect(trackedStocks).toHaveLength(5)
    expect(
      trackedStocks.reduce((sum, stock) => sum + stock.signals.length, 0)
    ).toBe(4)
  })

  it("computes the change since tracking from the series", () => {
    const since = Object.fromEntries(
      trackedStocks.map((stock) => [
        stock.symbol,
        plain(
          formatPercent(
            companyBySymbol(stock.symbol)!.price / stock.trackedPrice - 1,
            { signed: true }
          )
        ),
      ])
    )
    expect(since).toEqual({
      "NWT.DE": "+6,4 %",
      "HBG.DE": "−3,1 %",
      "SBG.ST": "+12,9 %",
      "ALM.PA": "+1,2 %",
      "LKS.HE": "−0,8 %",
    })
  })

  it("computes the archive's changes from the series", () => {
    for (const [index, entry] of ARCHIVED.entries()) {
      const stock = archivedStocks[index]
      const price = companyBySymbol(entry.symbol)!.price
      expect(stock.archivedPrice / stock.trackedPrice - 1).toBeCloseTo(
        entry.during,
        10
      )
      expect(price / stock.archivedPrice - 1).toBeCloseTo(entry.since, 10)
    }
  })
})

describe("research (mockup 03)", () => {
  it("computes the change since the start of the year from the series", () => {
    for (const [symbol, change] of Object.entries(YEAR_TO_DATE)) {
      const price = companyBySymbol(symbol)!.price
      expect(price / closeOn(symbol, YEAR_START) - 1).toBeCloseTo(change, 10)
    }
  })
})
