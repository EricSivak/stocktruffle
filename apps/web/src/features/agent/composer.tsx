import { useState } from "react"
import { ArrowRightIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

/** One line to ask the agent; "Research" switches to research mode for the next question. */
export function Composer({
  placeholder,
  research,
  onResearchChange,
  onSubmit,
}: {
  placeholder: string
  research: boolean
  onResearchChange: (research: boolean) => void
  onSubmit: (text: string) => void
}) {
  const [text, setText] = useState("")

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const question = text.trim()
        if (!question) return
        onSubmit(question)
        setText("")
      }}
    >
      <InputGroup>
        <InputGroupInput
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <InputGroupAddon align="inline-end" className="gap-3 pr-2.5">
          <button
            type="button"
            aria-pressed={research}
            onClick={() => onResearchChange(!research)}
            className="text-xs font-normal text-muted-foreground hover:text-foreground aria-pressed:text-foreground"
          >
            {research ? "Research on" : "Research off"}
          </button>
          <button
            type="submit"
            aria-label="Send"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowRightIcon className="size-4" strokeWidth={1.6} />
          </button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
