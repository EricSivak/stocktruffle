import { Fragment, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTable, type SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import { cn } from "cn"

import { ariaSort, SortButton } from "@/components/sort-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  columns,
  features,
  NUMERIC_COLUMNS,
  type TrackedRow,
} from "@/features/tracking/columns"
import { TrackingDetails } from "@/features/tracking/tracking-details"
import { useHotkey } from "@/lib/keys"
import { useRowNavigation } from "@/lib/use-row-navigation"
import { tracking } from "@/prototype/tracking-store"

/**
 * The tracked stocks. j/k select, space or a click opens the row, Enter opens the stock and
 * Delete moves it to the archive with an undo.
 */
export function TrackingTable({ rows }: { rows: TrackedRow[] }) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const table = useTable({
    features,
    columns,
    data: rows,
    state: { sorting },
    onSortingChange: setSorting,
  })
  const ordered = table.getRowModel().rows
  const { active, rowRef } = useRowNavigation({
    items: ordered,
    keyOf: (row) => row.original.symbol,
    activeKey: activeSymbol,
    onActiveChange: setActiveSymbol,
  })
  const current = active?.original

  const toggle = (symbol: string) =>
    setExpanded((open) => (open === symbol ? null : symbol))
  const archive = (row: TrackedRow) => {
    const undo = tracking.archive(row.symbol, row.price)
    if (!undo) return
    toast(`${row.symbol} archiviert`, {
      action: { label: "Rückgängig", onClick: undo },
    })
  }

  const enabled = ordered.length > 0
  useHotkey(" ", () => current && toggle(current.symbol), enabled)
  useHotkey(
    "enter",
    () =>
      current &&
      void navigate({
        to: "/aktie/$symbol",
        params: { symbol: current.symbol },
      }),
    enabled
  )
  useHotkey("delete", () => current && archive(current), enabled)

  const columnCount = table.getAllLeafColumns().length

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const id = header.column.id
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={ariaSort(sorted)}
                    className={cn(
                      NUMERIC_COLUMNS.has(id) && "text-right",
                      id === "expand" && "w-10 pr-0 pl-4"
                    )}
                  >
                    {header.column.getCanSort() ? (
                      <SortButton
                        sorted={sorted}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                      </SortButton>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {ordered.map((row) => {
            const item = row.original
            const isOpen = expanded === item.symbol
            return (
              <Fragment key={row.id}>
                <TableRow
                  ref={rowRef(item.symbol)}
                  aria-expanded={isOpen}
                  data-state={
                    item.symbol === current?.symbol ? "selected" : undefined
                  }
                  className={cn(
                    "group/row cursor-default",
                    isOpen && "border-b-0"
                  )}
                  onClick={() => {
                    setActiveSymbol(item.symbol)
                    toggle(item.symbol)
                  }}
                  onDoubleClick={() =>
                    void navigate({
                      to: "/aktie/$symbol",
                      params: { symbol: item.symbol },
                    })
                  }
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        NUMERIC_COLUMNS.has(cell.column.id) && "text-right",
                        cell.column.id === "expand" && "w-10 pr-0 pl-4"
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
                {isOpen && (
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableCell colSpan={columnCount} className="h-auto pl-14">
                      <TrackingDetails stock={item.stock} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
