import { describe, expect, it } from "vitest"

import {
  MISSING,
  formatAxisPrice,
  formatClock,
  formatCompact,
  formatDate,
  formatDuration,
  formatMonth,
  formatNumber,
  formatPercent,
  formatPrice,
  formatTime,
} from "@/lib/format"

// Intl puts a no-break space between a currency code and the amount.
const plain = (text: string) => text.replace(/\s/gu, " ")

describe("formatNumber", () => {
  it("uses British separators", () => {
    expect(formatNumber(1234.5, 1)).toBe("1,234.5")
    expect(formatNumber(11.4, 1)).toBe("11.4")
  })

  it("writes a real minus sign", () => {
    expect(formatNumber(-3.1, 1)).toBe("−3.1")
  })

  it.each([null, undefined, Number.NaN, Number.POSITIVE_INFINITY])(
    "shows a dash for %s instead of a zero",
    (value) => {
      expect(formatNumber(value)).toBe(MISSING)
    }
  )
})

describe("formatPrice", () => {
  it("always shows two decimals", () => {
    expect(formatPrice(42.18)).toBe("42.18")
    expect(formatPrice(118.4)).toBe("118.40")
  })

  it("puts the currency in front", () => {
    expect(formatPrice(42.18, "EUR")).toBe("€42.18")
    expect(plain(formatPrice(118.4, "SEK"))).toBe("SEK 118.40")
    expect(formatPrice(-2.6, "EUR")).toBe("−€2.60")
  })

  it("shows a dash for a missing price", () => {
    expect(formatPrice(null, "EUR")).toBe(MISSING)
  })
})

describe("formatPercent", () => {
  it("reads the value as a share of one", () => {
    expect(formatPercent(0.182)).toBe("18.2%")
  })

  it("signs gains and losses when asked", () => {
    expect(formatPercent(0.182, { signed: true })).toBe("+18.2%")
    expect(formatPercent(-0.031, { signed: true })).toBe("−3.1%")
    expect(formatPercent(0, { signed: true })).toBe("0.0%")
  })

  it("shows a dash for a missing value", () => {
    expect(formatPercent(undefined, { signed: true })).toBe(MISSING)
  })
})

describe("formatCompact", () => {
  it("shortens large amounts with financial-press units", () => {
    expect(formatCompact(1_234_000_000)).toBe("1.2bn")
    expect(formatCompact(850_000_000)).toBe("850m")
    expect(formatCompact(45_300)).toBe("45.3k")
    expect(formatCompact(2.6e12)).toBe("2.6tn")
  })

  it("leaves small amounts alone", () => {
    expect(formatCompact(999)).toBe("999")
  })

  it("moves to the next unit instead of showing 1,000 of the smaller one", () => {
    expect(formatCompact(999_950_000)).toBe("1.0bn")
    expect(formatCompact(999_400_000)).toBe("999m")
  })

  it("keeps the sign and the currency", () => {
    expect(formatCompact(-1_500_000_000)).toBe("−1.5bn")
    expect(formatCompact(1_234_000_000, "EUR")).toBe("€1.2bn")
    expect(formatCompact(-1_500_000_000, "EUR")).toBe("−€1.5bn")
  })

  it("shows a dash for a missing amount", () => {
    expect(formatCompact(null)).toBe(MISSING)
  })
})

describe("formatDate", () => {
  it("shows day and month, with the year on request", () => {
    expect(formatDate("2026-09-02")).toBe("02/09")
    expect(formatDate("2026-09-02", { year: true })).toBe("02/09/2026")
    expect(formatDate(new Date(2026, 6, 14))).toBe("14/07")
  })

  it("shows a dash for a missing or unreadable date", () => {
    expect(formatDate(null)).toBe(MISSING)
    expect(formatDate("no date")).toBe(MISSING)
  })
})

describe("chart labels", () => {
  it("writes axis prices with only the decimals they need", () => {
    expect(formatAxisPrice(40, "EUR")).toBe("€40")
    expect(formatAxisPrice(42.5, "EUR")).toBe("€42.5")
    expect(formatAxisPrice(null)).toBe("–")
  })

  it("writes times and short months", () => {
    expect(formatTime(new Date(2026, 9, 9, 9, 5))).toBe("09:05")
    expect(formatMonth(new Date(2026, 8, 1))).toBe("Sep")
  })
})

describe("durations", () => {
  it("writes how long research took", () => {
    expect(formatDuration(100)).toBe("1m 40s")
    expect(formatDuration(120)).toBe("2m")
    expect(formatDuration(40)).toBe("40s")
  })

  it("writes a running clock", () => {
    expect(formatClock(4)).toBe("0:04")
    expect(formatClock(100)).toBe("1:40")
  })
})
