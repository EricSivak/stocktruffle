import { describe, expect, it } from "vitest"

import { priceSeries, seeded } from "@/prototype/fixtures/random"

describe("seeded", () => {
  it("repeats the same numbers for the same seed", () => {
    const a = seeded(7)
    const b = seeded(7)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})

describe("priceSeries", () => {
  it("starts at the start price and ends exactly at the target", () => {
    const series = priceSeries(3, 39.64, 42.18, 250)
    expect(series).toHaveLength(250)
    expect(series[0]).toBeCloseTo(39.64, 10)
    expect(series.at(-1)).toBeCloseTo(42.18, 10)
  })

  it("never goes negative", () => {
    expect(Math.min(...priceSeries(11, 5, 4, 500, 0.05))).toBeGreaterThan(0)
  })
})
