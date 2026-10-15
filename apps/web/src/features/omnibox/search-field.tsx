import { useRef, useState } from "react"
import { SearchIcon } from "lucide-react"
import { cn } from "cn"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useHotkey } from "@/lib/keys"

/**
 * The one search field. Its view-transition name lets it travel from the middle of the start
 * page into a screen's header instead of being swapped.
 */
export function SearchField({
  defaultValue = "",
  size = "default",
  autoFocus,
  onSubmit,
  className,
}: {
  defaultValue?: string
  size?: "default" | "large"
  autoFocus?: boolean
  onSubmit: (query: string) => void
  className?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const input = useRef<HTMLInputElement>(null)

  useHotkey("/", () => input.current?.select())

  return (
    <form
      role="search"
      className={cn("w-full", className)}
      style={{ viewTransitionName: "search-field" }}
      onSubmit={(event) => {
        event.preventDefault()
        if (value.trim()) onSubmit(value.trim())
      }}
    >
      <InputGroup className={cn(size === "large" ? "h-12" : "h-10")}>
        <InputGroupAddon className="pl-3">
          <SearchIcon
            strokeWidth={1.6}
            className={size === "large" ? "size-[18px]" : undefined}
          />
        </InputGroupAddon>
        <InputGroupInput
          ref={input}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Describe what you're looking for"
          aria-label="Search"
          autoFocus={autoFocus}
          className={cn(size === "large" ? "text-[15px]" : "text-sm")}
        />
      </InputGroup>
    </form>
  )
}
