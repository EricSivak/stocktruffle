import { afterEach, describe, expect, it } from "vitest"

import { rulesStore } from "@/prototype/rules-store"

afterEach(() => rulesStore.reset())

const texts = () => rulesStore.get().map((rule) => rule.text)

describe("rules store", () => {
  it("adds a rule switched on", () => {
    rulesStore.add("No airlines")
    expect(rulesStore.get().at(-1)).toMatchObject({
      text: "No airlines",
      active: true,
    })
  })

  it("switches a rule off and on", () => {
    rulesStore.toggle("no-banks")
    expect(rulesStore.get()[0].active).toBe(false)
    rulesStore.toggle("no-banks")
    expect(rulesStore.get()[0].active).toBe(true)
  })

  it("removes a rule and puts it back in its place", () => {
    const before = texts()
    const undo = rulesStore.remove("min-cap")
    expect(texts()).not.toContain("Market cap from €300m")
    undo?.()
    expect(texts()).toEqual(before)
  })
})
