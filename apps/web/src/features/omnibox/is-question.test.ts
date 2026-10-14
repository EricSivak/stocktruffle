import { describe, expect, it } from "vitest"

import { isQuestion } from "@/features/omnibox/is-question"
import { searchExamples } from "@/prototype/fixtures/briefing"

describe("isQuestion", () => {
  it("sorts the start page's examples like the mockup intends", () => {
    expect(searchExamples.map(isQuestion)).toEqual([false, false, true])
  })

  it("takes a question mark or a question word as a question", () => {
    expect(isQuestion("Lohnt sich Nordwind noch?")).toBe(true)
    expect(isQuestion("Welche Rüstungswerte profitieren vom Etat")).toBe(true)
    expect(isQuestion("warum fällt der DAX")).toBe(true)
  })

  it("treats descriptions of stocks as screens", () => {
    expect(isQuestion("Small Caps mit Dividende über 4 %")).toBe(false)
    expect(isQuestion("Wie Rheinmetall, nur kleiner")).toBe(false)
    expect(isQuestion("Wasserversorger in Europa")).toBe(false)
  })
})
