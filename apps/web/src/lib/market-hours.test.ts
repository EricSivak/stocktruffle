import { describe, expect, it } from "vitest"

import { xetraStatus } from "@/lib/market-hours"

// Instants in UTC; Frankfurt is two hours ahead in summer and one in winter.
const at = (iso: string) => xetraStatus(new Date(iso)).text

describe("xetraStatus", () => {
  it("reads open with the Frankfurt time during trading hours", () => {
    expect(at("2026-10-14T12:32:00Z")).toBe("Xetra offen · 14:32")
    expect(at("2026-12-01T08:30:00Z")).toBe("Xetra offen · 09:30")
  })

  it("opens later the same morning before 09:00", () => {
    expect(at("2026-10-13T06:00:00Z")).toBe("Xetra geschlossen · öffnet 09:00")
  })

  it("opens tomorrow after the close on a weekday", () => {
    expect(at("2026-10-15T15:30:00Z")).toBe(
      "Xetra geschlossen · öffnet morgen 09:00"
    )
  })

  it("opens on Monday after the close on Friday and at the weekend", () => {
    expect(at("2026-10-09T16:00:00Z")).toBe(
      "Xetra geschlossen · öffnet Mo 09:00"
    )
    expect(at("2026-10-10T10:00:00Z")).toBe(
      "Xetra geschlossen · öffnet Mo 09:00"
    )
    expect(at("2026-10-11T10:00:00Z")).toBe(
      "Xetra geschlossen · öffnet morgen 09:00"
    )
  })
})
