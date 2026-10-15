import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SourceList } from "@/features/agent/thread"
import type { Source } from "@/prototype/fixtures/agent"

const VISIBLE = 10

/** Footnotes past this number point into the folded part of the list. */
export const VISIBLE_SOURCES = VISIBLE

/** The sources beside a research; a footnote click marks its source here. */
export function SourcesColumn({
  sources,
  highlighted,
  open,
  onOpenChange,
}: {
  sources: Source[]
  highlighted: number | null
  /** Whether the sources past the first ten are shown. */
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const rest = sources.length - VISIBLE

  return (
    <aside aria-labelledby="sources" className="flex flex-col">
      <h2
        id="sources"
        className="flex items-baseline gap-2 pb-3 text-[15px] font-medium"
      >
        Sources
        <span className="text-sm font-normal text-muted-foreground tabular-nums">
          {sources.length || ""}
        </span>
      </h2>
      {sources.length === 0 ? (
        <p className="border-t pt-3 text-muted-foreground">
          Sources appear here as the research reads them.
        </p>
      ) : (
        <div className="border-t">
          <SourceList
            layout="stacked"
            items={sources.slice(0, VISIBLE)}
            highlighted={highlighted}
          />
          {rest > 0 && (
            <Collapsible open={open} onOpenChange={onOpenChange}>
              <CollapsibleContent>
                <div className="border-t">
                  <SourceList
                    layout="stacked"
                    items={sources.slice(VISIBLE)}
                    highlighted={highlighted}
                  />
                </div>
              </CollapsibleContent>
              <CollapsibleTrigger className="mt-3 text-foreground underline decoration-1 underline-offset-4 hover:decoration-2">
                {open ? "Show fewer sources" : `Show ${rest} more sources`}
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      )}
    </aside>
  )
}
