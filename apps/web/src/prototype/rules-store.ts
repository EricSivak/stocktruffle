// "My rules" as shared state for the prototype: a rule added in the settings shows up in every
// screen's rules popover. Lives in memory and starts from the sample rules on every reload;
// phase 1 keeps them in the profile row in Supabase.
import { useSyncExternalStore } from "react"

import { rules as sampleRules } from "@/prototype/fixtures/screens"

export type Rule = { id: string; text: string; active: boolean }

let state: Rule[] = sampleRules.map((rule) => ({ ...rule }))
let nextId = 1
const listeners = new Set<() => void>()

function set(next: Rule[]) {
  state = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRules(): Rule[] {
  return useSyncExternalStore(subscribe, () => state)
}

export const rulesStore = {
  get: () => state,

  add: (text: string) =>
    set([...state, { id: `rule-${nextId++}`, text, active: true }]),

  toggle: (id: string) =>
    set(
      state.map((rule) =>
        rule.id === id ? { ...rule, active: !rule.active } : rule
      )
    ),

  /** Removes a rule; returns an undo that puts it back in its place. */
  remove(id: string): (() => void) | null {
    const index = state.findIndex((rule) => rule.id === id)
    if (index < 0) return null
    const rule = state[index]
    set(state.filter((item) => item.id !== id))
    return () => {
      const next = [...state]
      next.splice(index, 0, rule)
      set(next)
    }
  },

  /** Back to the sample rules; for tests. */
  reset: () => set(sampleRules.map((rule) => ({ ...rule }))),
}
