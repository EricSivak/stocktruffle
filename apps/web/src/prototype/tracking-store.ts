// The tracking list as shared state for the prototype: what you track in a screen shows up on
// the tracking page and the stock page. Lives in memory and starts from the mockup's data on
// every reload; phase 1 replaces it with Supabase.
import { useSyncExternalStore } from "react"

import { AS_OF_DATE } from "@/prototype/fixtures/calendar"
import type { Company } from "@/prototype/fixtures/companies"
import {
  archivedStocks,
  trackedStocks,
  type ArchivedStock,
  type Origin,
  type Rhythm,
  type Signal,
  type TrackedStock,
} from "@/prototype/fixtures/tracking"

export type TrackingState = {
  active: TrackedStock[]
  archived: ArchivedStock[]
}

const initial = (): TrackingState => ({
  active: trackedStocks.map((stock) => ({ ...stock })),
  archived: [...archivedStocks],
})

let state = initial()
let nextId = 1
const listeners = new Set<() => void>()

function set(next: TrackingState) {
  state = next
  for (const listener of listeners) listener()
}

function updateStock(
  symbol: string,
  change: (stock: TrackedStock) => TrackedStock
) {
  set({
    ...state,
    active: state.active.map((stock) =>
      stock.symbol === symbol ? change(stock) : stock
    ),
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTracking(): TrackingState {
  return useSyncExternalStore(subscribe, () => state)
}

export const tracking = {
  get: () => state,

  find: (symbol: string) =>
    state.active.find((stock) => stock.symbol === symbol),

  /** Starts tracking at today's price; returns an undo, or null if already tracked. */
  track(
    company: Company,
    {
      thesis = "",
      signals = [],
      origin = null,
    }: { thesis?: string; signals?: string[]; origin?: Origin | null } = {}
  ): (() => void) | null {
    if (tracking.find(company.symbol)) return null
    const stock: TrackedStock = {
      symbol: company.symbol,
      trackedAt: AS_OF_DATE,
      trackedPrice: company.price,
      thesis,
      origin,
      signals: signals.map((text) => ({
        id: `new-${nextId++}`,
        text,
        rhythm: "daily",
        createdAt: AS_OF_DATE,
      })),
    }
    set({ ...state, active: [...state.active, stock] })
    return () =>
      set({
        ...state,
        active: state.active.filter((item) => item.symbol !== company.symbol),
      })
  },

  /** Moves a stock to the archive; returns an undo that puts it back in its place. */
  archive(symbol: string, price: number): (() => void) | null {
    const index = state.active.findIndex((stock) => stock.symbol === symbol)
    if (index < 0) return null
    const stock = state.active[index]
    set({
      active: state.active.filter((item) => item.symbol !== symbol),
      archived: [
        {
          symbol,
          trackedAt: stock.trackedAt,
          archivedAt: AS_OF_DATE,
          trackedPrice: stock.trackedPrice,
          archivedPrice: price,
          reason: "",
        },
        ...state.archived,
      ],
    })
    return () => {
      const active = [...state.active]
      active.splice(index, 0, stock)
      set({
        active,
        archived: state.archived.filter(
          (item) => !(item.symbol === symbol && item.archivedAt === AS_OF_DATE)
        ),
      })
    }
  },

  setThesis: (symbol: string, thesis: string) =>
    updateStock(symbol, (stock) => ({ ...stock, thesis })),

  addSignal: (symbol: string, text: string, rhythm: Rhythm = "daily") =>
    updateStock(symbol, (stock) => ({
      ...stock,
      signals: [
        ...stock.signals,
        { id: `new-${nextId++}`, text, rhythm, createdAt: AS_OF_DATE },
      ],
    })),

  setRhythm: (symbol: string, id: string, rhythm: Rhythm) =>
    updateStock(symbol, (stock) => ({
      ...stock,
      signals: stock.signals.map((signal) =>
        signal.id === id ? { ...signal, rhythm } : signal
      ),
    })),

  /** Deletes a signal; returns an undo that puts it back in its place. */
  removeSignal(symbol: string, id: string): (() => void) | null {
    const stock = tracking.find(symbol)
    const index = stock?.signals.findIndex((signal) => signal.id === id) ?? -1
    if (!stock || index < 0) return null
    const signal = stock.signals[index]
    updateStock(symbol, (current) => ({
      ...current,
      signals: current.signals.filter((item) => item.id !== id),
    }))
    return () =>
      updateStock(symbol, (current) => {
        const signals = [...current.signals]
        signals.splice(index, 0, signal)
        return { ...current, signals }
      })
  },

  /** Back to the mockup's data; for tests. */
  reset: () => set(initial()),
}

/** A signal together with the stock it belongs to. */
export type SignalRow = Signal & { symbol: string }

/** Every signal of every tracked stock, in tracking order. */
export function allSignals(state: TrackingState): SignalRow[] {
  return state.active.flatMap((stock) =>
    stock.signals.map((signal) => ({ ...signal, symbol: stock.symbol }))
  )
}
