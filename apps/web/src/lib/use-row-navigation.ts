import { useEffect, useRef } from "react"

import { useHotkey } from "@/lib/keys"

/**
 * j and k move the selection through a list of rows and keep the selected row in view. The
 * first row counts as selected until something else is.
 */
export function useRowNavigation<Item>({
  items,
  keyOf,
  activeKey,
  onActiveChange,
  enabled = true,
}: {
  items: Item[]
  keyOf: (item: Item) => string
  activeKey: string | null
  onActiveChange: (key: string) => void
  enabled?: boolean
}) {
  const index = Math.max(
    0,
    items.findIndex((item) => keyOf(item) === activeKey)
  )
  const active: Item | undefined = items[index]
  const current = active === undefined ? null : keyOf(active)
  const rows = useRef(new Map<string, HTMLElement>())

  useEffect(() => {
    if (current) rows.current.get(current)?.scrollIntoView({ block: "nearest" })
  }, [current])

  const move = (step: number) => {
    const next = items[Math.min(items.length - 1, Math.max(0, index + step))]
    if (next !== undefined) onActiveChange(keyOf(next))
  }
  const live = enabled && items.length > 0
  useHotkey("j", () => move(1), live)
  useHotkey("k", () => move(-1), live)

  /** Ref callback for a row, so the selection can scroll it into view. */
  const rowRef = (key: string) => (element: HTMLElement | null) => {
    if (element) rows.current.set(key, element)
    else rows.current.delete(key)
  }

  return { active, rowRef }
}
