import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import type { Signal } from "@/prototype/fixtures/tracking"

/**
 * A stock's signals: one line each with its rhythm and state, then a field to add one in
 * your own words and a few suggestions. Signals are stored, not yet checked.
 */
export function SignalList({
  signals,
  suggestions,
  onAdd,
}: {
  signals: Signal[]
  suggestions: string[]
  onAdd: (text: string) => void
}) {
  const [text, setText] = useState("")
  const add = (signal: string) => {
    onAdd(signal)
    toast("Signal saved. It isn't checked yet.")
  }
  const open = suggestions.filter(
    (suggestion) => !signals.some((signal) => signal.text === suggestion)
  )

  return (
    <div className="flex flex-col gap-3">
      {signals.length > 0 && (
        <ul className="flex flex-col">
          {signals.map((signal) => (
            <li
              key={signal.id}
              className="flex items-baseline gap-6 border-b py-2 first:pt-0"
            >
              <span className="text-foreground">{signal.text}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {signal.rhythm} · not active
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <form
          className="w-full max-w-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (!text.trim()) return
            add(text.trim())
            setText("")
          }}
        >
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Interesting when …"
            aria-label="New signal"
          />
        </form>
        {open.length > 0 && (
          <p className="flex items-baseline gap-4 text-muted-foreground">
            Suggestions:
            {open.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => add(suggestion)}
                className="text-foreground underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {suggestion}
              </button>
            ))}
          </p>
        )}
      </div>
    </div>
  )
}
