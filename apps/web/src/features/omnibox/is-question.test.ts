import { describe, expect, it } from "vitest"

import { isQuestion } from "@/features/omnibox/is-question"
import { searchExamples } from "@/prototype/fixtures/briefing"

describe("isQuestion", () => {
  it("sorts the start page's examples like the mockup intends", () => {
    expect(searchExamples.map(isQuestion)).toEqual([false, false, true])
  })

  it("takes a question mark, a question word or an auxiliary as a question", () => {
    expect(isQuestion("Is Nordwind still worth it?")).toBe(true)
    expect(isQuestion("Which defence stocks gain from the budget")).toBe(true)
    expect(isQuestion("why is the DAX falling")).toBe(true)
    expect(isQuestion("Does Vindmark pay a dividend")).toBe(true)
  })

  it("treats descriptions of stocks as screens", () => {
    expect(isQuestion("Small caps with a dividend above 4%")).toBe(false)
    expect(isQuestion("Like Rheinmetall, only smaller")).toBe(false)
    expect(isQuestion("Whiskey makers in Scotland")).toBe(false)
  })
})
