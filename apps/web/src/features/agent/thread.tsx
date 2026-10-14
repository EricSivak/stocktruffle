// The agent's conversation reads like a document, not a chat: questions are lines with a
// thin bar, work steps are one gray line, answers are prose with footnotes.
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { cn } from "cn"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Source, ThreadItem } from "@/prototype/fixtures/agent"

export function Question({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "border-l-2 border-input py-0.5 pl-3 text-foreground",
        className
      )}
    >
      {children}
    </p>
  )
}

export function StepLine({
  children,
  undoable,
}: {
  children: React.ReactNode
  undoable?: boolean
}) {
  return (
    <p className="text-xs text-muted-foreground">
      {children}
      {undoable && (
        <>
          {" · "}
          <button
            type="button"
            className="underline underline-offset-3 hover:text-foreground"
            onClick={() => toast("Änderung zurückgenommen")}
          >
            Rückgängig
          </button>
        </>
      )}
    </p>
  )
}

const SUP = "ml-px font-sans text-[10px] leading-none text-muted-foreground"

function Footnote({
  n,
  source,
  onSelect,
}: {
  n: number
  source?: Source
  onSelect?: (n: number) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          onSelect ? (
            <button
              type="button"
              aria-label={`Quelle ${n}`}
              onClick={() => onSelect(n)}
              className={cn(SUP, "align-super hover:text-foreground")}
            />
          ) : (
            <sup className={cn(SUP, "cursor-default")} />
          )
        }
      >
        {n}
      </TooltipTrigger>
      <TooltipContent>
        {source
          ? [source.title, source.detail].filter(Boolean).join(", ")
          : `Quelle ${n}`}
      </TooltipContent>
    </Tooltip>
  )
}

export function Prose({
  parts,
  sources,
  onFootnote,
  size = "default",
  className,
}: {
  parts: (string | { footnote: number })[]
  sources: Source[]
  /** Makes footnotes clickable, e.g. to point at the source in a list beside the text. */
  onFootnote?: (n: number) => void
  /** "reading" is one step larger, for the wide column of a research. */
  size?: "default" | "reading"
  className?: string
}) {
  return (
    <p
      className={cn(
        size === "reading" ? "reading" : "voice",
        "text-foreground",
        className
      )}
    >
      {parts.map((part, index) =>
        typeof part === "string" ? (
          part
        ) : (
          <Footnote
            key={index}
            n={part.footnote}
            source={sources.find((source) => source.n === part.footnote)}
            onSelect={onFootnote}
          />
        )
      )}
    </p>
  )
}

function StackedSource({
  source,
  highlighted,
}: {
  source: Source
  highlighted: boolean
}) {
  const item = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (highlighted) item.current?.scrollIntoView({ block: "nearest" })
  }, [highlighted])
  return (
    <li
      ref={item}
      data-highlighted={highlighted || undefined}
      className="-mx-2 flex gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 data-highlighted:bg-muted"
    >
      <span className="w-4 shrink-0 text-xs text-muted-foreground tabular-nums">
        {source.n}
      </span>
      <span className="min-w-0">
        <span className="block text-foreground">{source.title}</span>
        {source.detail && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {source.detail}
          </span>
        )}
      </span>
    </li>
  )
}

/**
 * Numbered sources. Inline: one gray line each, under an answer. Stacked: title and kind
 * on two lines with hairlines, for the sources column of a research.
 */
export function SourceList({
  items,
  layout = "inline",
  highlighted,
}: {
  items: Source[]
  layout?: "inline" | "stacked"
  highlighted?: number | null
}) {
  if (layout === "stacked") {
    return (
      <ol className="flex flex-col divide-y">
        {items.map((source) => (
          <StackedSource
            key={source.n}
            source={source}
            highlighted={source.n === highlighted}
          />
        ))}
      </ol>
    )
  }
  return (
    <ol className="space-y-1 text-xs text-muted-foreground">
      {items.map((source) => (
        <li key={source.n} className="flex gap-3">
          <span className="w-3 shrink-0 tabular-nums">{source.n}</span>
          <span>
            {[source.title, source.detail].filter(Boolean).join(", ")}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function Thread({ items }: { items: ThreadItem[] }) {
  const sources = items.flatMap((item) =>
    item.kind === "sources" ? item.items : []
  )
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        switch (item.kind) {
          case "question":
            return (
              <Question key={index} className={index > 0 ? "mt-3" : undefined}>
                {item.text}
              </Question>
            )
          case "steps":
            return (
              <StepLine key={index} undoable={item.undoable}>
                {item.text}
              </StepLine>
            )
          case "answer":
            return (
              <Prose
                key={index}
                parts={item.parts}
                sources={sources}
                className="mt-2"
              />
            )
          case "sources":
            return <SourceList key={index} items={item.items} />
          case "pending":
            return <StepLine key={index}>{item.text}</StepLine>
        }
      })}
    </div>
  )
}
