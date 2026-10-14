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

// Intl separates a number from its unit with a no-break space.
const nbsp = (text: string) => text.replaceAll(" ", " ")

describe("formatNumber", () => {
  it("uses German separators", () => {
    expect(formatNumber(1234.5, 1)).toBe("1.234,5")
    expect(formatNumber(11.4, 1)).toBe("11,4")
  })

  it("writes a real minus sign", () => {
    expect(formatNumber(-3.1, 1)).toBe("−3,1")
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
    expect(formatPrice(42.18)).toBe("42,18")
    expect(formatPrice(118.4)).toBe("118,40")
  })

  it("appends the currency when given", () => {
    expect(formatPrice(42.18, "EUR")).toBe(nbsp("42,18 €"))
    expect(formatPrice(118.4, "SEK")).toBe(nbsp("118,40 SEK"))
  })

  it("shows a dash for a missing price", () => {
    expect(formatPrice(null, "EUR")).toBe(MISSING)
  })
})

describe("formatPercent", () => {
  it("reads the value as a share of one", () => {
    expect(formatPercent(0.182)).toBe(nbsp("18,2 %"))
  })

  it("signs gains and losses when asked", () => {
    expect(formatPercent(0.182, { signed: true })).toBe(nbsp("+18,2 %"))
    expect(formatPercent(-0.031, { signed: true })).toBe(nbsp("−3,1 %"))
    expect(formatPercent(0, { signed: true })).toBe(nbsp("0,0 %"))
  })

  it("shows a dash for a missing value", () => {
    expect(formatPercent(undefined, { signed: true })).toBe(MISSING)
  })
})

describe("formatCompact", () => {
  it("shortens large amounts with German units", () => {
    expect(formatCompact(1_234_000_000)).toBe(nbsp("1,2 Mrd"))
    expect(formatCompact(850_000_000)).toBe(nbsp("850 Mio"))
    expect(formatCompact(45_300)).toBe(nbsp("45,3 Tsd"))
    expect(formatCompact(2.6e12)).toBe(nbsp("2,6 Bio"))
  })

  it("leaves small amounts alone", () => {
    expect(formatCompact(999)).toBe("999")
  })

  it("moves to the next unit instead of showing 1.000 of the smaller one", () => {
    expect(formatCompact(999_950_000)).toBe(nbsp("1,0 Mrd"))
    expect(formatCompact(999_400_000)).toBe(nbsp("999 Mio"))
  })

  it("keeps the sign and the currency", () => {
    expect(formatCompact(-1_500_000_000)).toBe(nbsp("−1,5 Mrd"))
    expect(formatCompact(1_234_000_000, "EUR")).toBe(nbsp("1,2 Mrd €"))
  })

  it("shows a dash for a missing amount", () => {
    expect(formatCompact(null)).toBe(MISSING)
  })
})

describe("formatDate", () => {
  it("shows day and month, with the year on request", () => {
    expect(formatDate("2026-09-02")).toBe("02.09.")
    expect(formatDate("2026-09-02", { year: true })).toBe("02.09.2026")
    expect(formatDate(new Date(2026, 6, 14))).toBe("14.07.")
  })

  it("shows a dash for a missing or unreadable date", () => {
    expect(formatDate(null)).toBe(MISSING)
    expect(formatDate("kein Datum")).toBe(MISSING)
  })
})

describe("chart labels", () => {
  const plain = (text: string) => text.replace(/\s/gu, " ")

  it("writes axis prices with only the decimals they need", () => {
    expect(plain(formatAxisPrice(40, "EUR"))).toBe("40 €")
    expect(plain(formatAxisPrice(42.5, "EUR"))).toBe("42,5 €")
    expect(formatAxisPrice(null)).toBe("–")
  })

  it("writes times and months the German way", () => {
    expect(formatTime(new Date(2026, 9, 9, 9, 5))).toBe("09:05")
    expect(formatMonth(new Date(2026, 2, 1))).toBe("Mär")
  })
})

describe("durations", () => {
  const plain = (text: string) => text.replace(/\s/gu, " ")

  it("writes how long research took", () => {
    expect(plain(formatDuration(100))).toBe("1 Min 40")
    expect(plain(formatDuration(120))).toBe("2 Min")
    expect(plain(formatDuration(40))).toBe("40 Sek")
  })

  it("writes a running clock", () => {
    expect(formatClock(4)).toBe("0:04")
    expect(formatClock(100)).toBe("1:40")
  })
})
