import { Fragment, useState } from "react"
import { useTable, type SortingState } from "@tanstack/react-table"
import { toast } from "sonner"
import { cn } from "cn"

import { ariaSort, SortButton } from "@/components/sort-button"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { columns, features } from "@/features/signals/columns"
import { RhythmSelect } from "@/features/signals/rhythm-select"
import { useHotkey } from "@/lib/keys"
import { useRowNavigation } from "@/lib/use-row-navigation"
import { tracking, type SignalRow } from "@/prototype/tracking-store"

function remove(row: SignalRow) {
  const undo = tracking.removeSignal(row.symbol, row.id)
  if (!undo) return
  toast("Signal deleted", { action: { label: "Undo", onClick: undo } })
}

/** The opened row: what checking will show, the rhythm, and deleting. */
function SignalDetails({ row }: { row: SignalRow }) {
  return (
    <dl className="grid grid-cols-[112px_1fr] items-center gap-x-8 gap-y-4 py-5 pr-2 whitespace-normal">
      <dt className="text-muted-foreground">Check history</dt>
      <dd className="text-muted-foreground">No checks yet</dd>
      <dt className="text-muted-foreground">Rhythm</dt>
      <dd>
        <RhythmSelect
          value={row.rhythm}
          onChange={(rhythm) => tracking.setRhythm(row.symbol, row.id, rhythm)}
          className="w-44"
        />
      </dd>
      <dt />
      <dd>
        <Button
          variant="destructive"
          className="px-0"
          onClick={() => remove(row)}
        >
          Delete
        </Button>
      </dd>
    </dl>
  )
}

/**
 * Every signal across the tracked stocks. j/k select, space or a click opens the row and
 * Delete removes the signal with an undo.
 */
export function SignalsTable({ rows }: { rows: SignalRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [activeId, setActiveId] = useState<string | null>(null)
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
    keyOf: (row) => row.original.id,
    activeKey: activeId,
    onActiveChange: setActiveId,
  })
  const current = active?.original
  const toggle = (id: string) =>
    setExpanded((open) => (open === id ? null : id))

  const enabled = ordered.length > 0
  useHotkey(" ", () => current && toggle(current.id), enabled)
  useHotkey("delete", () => current && remove(current), enabled)

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={ariaSort(sorted)}
                    className={cn(
                      header.column.id === "expand" && "w-10 pr-0 pl-4"
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
            const isOpen = expanded === item.id
            return (
              <Fragment key={row.id}>
                <TableRow
                  ref={rowRef(item.id)}
                  aria-expanded={isOpen}
                  data-state={item.id === current?.id ? "selected" : undefined}
                  className={cn(
                    "group/row cursor-default",
                    isOpen && "border-b-0"
                  )}
                  onClick={() => {
                    setActiveId(item.id)
                    toggle(item.id)
                  }}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "expand" && "w-10 pr-0 pl-4"
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
                {isOpen && (
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableCell
                      colSpan={table.getAllLeafColumns().length}
                      className="h-auto pl-14"
                    >
                      <SignalDetails row={item} />
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
