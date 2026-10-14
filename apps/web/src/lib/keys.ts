import { useEffect, useEffectEvent } from "react"

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select") !== null)
  )
}

/**
 * Binds a key for as long as the component is mounted. `mod+k` means Ctrl or Cmd plus K
 * and also fires while typing; a bare key such as `j` or `/` is ignored inside inputs.
 */
export function useHotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  enabled = true
) {
  const onMatch = useEffectEvent(handler)

  useEffect(() => {
    if (!enabled) return
    const needsMod = combo.startsWith("mod+")
    const key = needsMod ? combo.slice(4) : combo

    const onKeyDown = (event: KeyboardEvent) => {
      const hasMod = event.ctrlKey || event.metaKey
      if (needsMod !== hasMod || event.altKey) return
      if (!needsMod && isTyping(event.target)) return
      if (event.key.toLowerCase() !== key) return
      event.preventDefault()
      onMatch(event)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [combo, enabled])
}
