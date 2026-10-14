// The agent's conversation reads like a document, not a chat: questions are lines with a
// thin bar, work steps are one gray line, answers are prose with footnotes.
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

function Footnote({ n, source }: { n: number; source?: Source }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <sup className="ml-px cursor-default font-sans text-[10px] text-muted-foreground" />
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
  className,
}: {
  parts: (string | { footnote: number })[]
  sources: Source[]
  className?: string
}) {
  return (
    <p className={cn("voice text-foreground", className)}>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          part
        ) : (
          <Footnote
            key={index}
            n={part.footnote}
            source={sources.find((source) => source.n === part.footnote)}
          />
        )
      )}
    </p>
  )
}

export function SourceList({ items }: { items: Source[] }) {
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
