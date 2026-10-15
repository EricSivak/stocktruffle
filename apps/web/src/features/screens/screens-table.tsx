import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { cn } from "cn"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatNumber } from "@/lib/format"
import { useHotkey } from "@/lib/keys"
import { useRowNavigation } from "@/lib/use-row-navigation"
import type { SavedScreen } from "@/prototype/fixtures/screens"

/** Saved screens with their query, hits and what is new since the last run. */
export function ScreensTable({ screens }: { screens: SavedScreen[] }) {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<string | null>(null)
  const { active, rowRef } = useRowNavigation({
    items: screens,
    keyOf: (screen) => screen.id,
    activeKey: activeId,
    onActiveChange: setActiveId,
  })
  const open = (screen: SavedScreen) =>
    void navigate({
      to: "/screens/$screenId",
      params: { screenId: screen.id },
    })
  useHotkey("enter", () => active && open(active), screens.length > 0)

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Screen</TableHead>
            <TableHead className="text-right">Hits</TableHead>
            <TableHead className="text-right">New since last run</TableHead>
            <TableHead className="pr-5 text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {screens.map((screen) => (
            <TableRow
              key={screen.id}
              ref={rowRef(screen.id)}
              data-state={screen.id === active?.id ? "selected" : undefined}
              className="cursor-default"
              onClick={() => setActiveId(screen.id)}
              onDoubleClick={() => open(screen)}
            >
              <TableCell className="pl-5">
                <button
                  type="button"
                  onClick={() => open(screen)}
                  className="flex items-baseline gap-3 text-left"
                >
                  <span className="text-foreground hover:underline hover:underline-offset-4">
                    {screen.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {screen.query}
                  </span>
                </button>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(screen.rows.length, 0)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  screen.newSinceLastRun > 0
                    ? "text-gain"
                    : "text-muted-foreground"
                )}
              >
                {screen.newSinceLastRun > 0
                  ? `+${formatNumber(screen.newSinceLastRun, 0)}`
                  : formatNumber(0, 0)}
              </TableCell>
              <TableCell className="pr-5 text-right text-muted-foreground tabular-nums">
                {formatDate(screen.updatedOn)}, {screen.updatedAt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
