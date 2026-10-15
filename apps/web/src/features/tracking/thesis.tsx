import { useState } from "react"
import { cn } from "cn"

import { Textarea } from "@/components/ui/textarea"

/**
 * Why a stock is tracked, in the serif italic of a handwritten note. A click turns it into a
 * text field; Enter keeps the change, Escape drops it.
 */
export function Thesis({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (thesis: string) => void
  className?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const text = "font-serif text-lg leading-snug italic"

  if (draft !== null) {
    const save = () => {
      onChange(draft.trim())
      setDraft(null)
    }
    return (
      <Textarea
        autoFocus
        rows={2}
        value={draft}
        aria-label="Thesis"
        placeholder="Cheap because …"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            save()
          }
          if (event.key === "Escape") {
            event.stopPropagation()
            setDraft(null)
          }
        }}
        className={cn(text, "min-h-0 max-w-2xl", className)}
      />
    )
  }

  return (
    <button
      type="button"
      title="Edit thesis"
      onClick={() => setDraft(value)}
      className={cn(
        text,
        "max-w-2xl text-left decoration-input decoration-1 underline-offset-[5px] hover:underline",
        value ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {value || "No reason noted yet"}
    </button>
  )
}
