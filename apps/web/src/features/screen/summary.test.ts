import { describe, expect, it } from "vitest"

import { summarize } from "@/features/screen/summary"
import { companies } from "@/prototype/fixtures/companies"

describe("summarize", () => {
  it("averages P/E and growth and takes the median market cap", () => {
    const summary = summarize([
      { pe: 10, revenueGrowth: 0.1, marketCapEur: 1e9 },
      { pe: 14, revenueGrowth: 0.2, marketCapEur: 3e9 },
      { pe: 12, revenueGrowth: null, marketCapEur: 2e9 },
    ])
    expect(summary.count).toBe(3)
    expect(summary.averagePe).toBeCloseTo(12)
    expect(summary.averageRevenueGrowth).toBeCloseTo(0.15)
    expect(summary.medianMarketCap).toBe(2e9)
  })

  it("leaves losses out of the P/E average", () => {
    expect(
      summarize([
        { pe: -4, revenueGrowth: 0, marketCapEur: 1 },
        { pe: 8, revenueGrowth: 0, marketCapEur: 1 },
      ]).averagePe
    ).toBe(8)
  })

  it("returns nothing instead of zero for an empty screen", () => {
    expect(summarize([])).toEqual({
      count: 0,
      averagePe: null,
      averageRevenueGrowth: null,
      medianMarketCap: null,
    })
  })
})

describe("prototype screen data", () => {
  it("has 47 hits that all meet the screen's filters", () => {
    expect(companies).toHaveLength(47)
    for (const company of companies) {
      expect(company.pe).toBeLessThan(15)
      expect(company.netMargin).toBeGreaterThan(0)
      expect(company.marketCapEur).toBeGreaterThanOrEqual(0.3e9)
      expect(company.marketCapEur).toBeLessThanOrEqual(2e9)
    }
    expect(new Set(companies.map((company) => company.symbol)).size).toBe(47)
  })

  it("keeps the mockup's eight rows on top when sorted by revenue growth", () => {
    const top = [...companies]
      .sort((a, b) => b.revenueGrowth - a.revenueGrowth)
      .slice(0, 8)
      .map((company) => company.symbol)
    expect(top).toEqual([
      "SBG.ST",
      "NWT.DE",
      "ALM.PA",
      "HLV.AS",
      "BRN.VI",
      "CRV.MI",
      "VDM.CO",
      "TRS.MC",
    ])
  })

  it("ends each price series at the current price", () => {
    for (const company of companies) {
      expect(company.year.at(-1)).toBeCloseTo(company.price, 6)
    }
  })
})
