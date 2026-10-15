import { afterEach, describe, expect, it } from "vitest"

import { companyBySymbol } from "@/prototype/fixtures/companies"
import { tracking } from "@/prototype/tracking-store"

const corvara = companyBySymbol("CRV.MI")!

afterEach(() => tracking.reset())

describe("tracking store", () => {
  it("tracks a stock at today's price and undoes it", () => {
    const undo = tracking.track(corvara, { thesis: "Cheap." })
    expect(tracking.find("CRV.MI")).toMatchObject({
      trackedPrice: corvara.price,
      thesis: "Cheap.",
    })
    expect(tracking.track(corvara)).toBeNull()
    undo?.()
    expect(tracking.find("CRV.MI")).toBeUndefined()
  })

  it("archives a stock and puts it back in its place", () => {
    const order = () => tracking.get().active.map((stock) => stock.symbol)
    const before = order()
    const undo = tracking.archive("HBG.DE", 18.3)
    expect(order()).not.toContain("HBG.DE")
    expect(tracking.get().archived[0]).toMatchObject({
      symbol: "HBG.DE",
      archivedPrice: 18.3,
    })
    undo?.()
    expect(order()).toEqual(before)
    expect(tracking.get().archived.map((stock) => stock.symbol)).not.toContain(
      "HBG.DE"
    )
  })

  it("adds signals and changes the thesis", () => {
    tracking.addSignal("LKS.HE", "Pulp price falls")
    tracking.setThesis("LKS.HE", "Timber is getting scarce.")
    expect(tracking.find("LKS.HE")).toMatchObject({
      thesis: "Timber is getting scarce.",
      signals: [{ text: "Pulp price falls", rhythm: "daily" }],
    })
  })
})
