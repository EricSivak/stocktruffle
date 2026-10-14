import {
  useTable,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import { cn } from "cn"

import { ariaSort, SortButton } from "@/components/sort-button"
import { Sparkline } from "@/components/sparkline"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { columns, features, NUMERIC_COLUMNS } from "@/features/screen/columns"
import { formatCompact, formatNumber, formatPercent } from "@/lib/format"
import { useHotkey } from "@/lib/keys"
import { useRowNavigation } from "@/lib/use-row-navigation"
import type { Company } from "@/prototype/fixtures/companies"

function Preview({
  company,
  onOpen,
  onTrack,
}: {
  company: Company
  onOpen: () => void
  onTrack: () => void
}) {
  const facts: [string, string][] = [
    ["Marktkap.", formatCompact(company.marketCapEur, "EUR")],
    ["KGV", formatNumber(company.pe, 1)],
    ["Umsatz Δ", formatPercent(company.revenueGrowth, { signed: true })],
    ["Nettomarge", formatPercent(company.netMargin)],
    ["FCF-Rendite", formatPercent(company.fcfYield)],
    ["Dividende", formatPercent(company.dividendYield)],
  ]
  return (
    <div className="flex items-center gap-8 py-3 whitespace-normal">
      <Sparkline
        values={company.year}
        tone={company.yearChange}
        width={220}
        height={48}
        className="shrink-0"
      />
      <dl className="grid flex-1 grid-cols-6 gap-4">
        {facts.map(([term, value]) => (
          <div key={term}>
            <dt className="text-xs text-muted-foreground">{term}</dt>
            <dd className="mt-0.5 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex shrink-0 gap-5">
        <Button variant="plain" onClick={onOpen}>
          Öffnen
        </Button>
        <Button variant="plain" onClick={onTrack}>
          Tracken
        </Button>
      </div>
    </div>
  )
}

export function ResultsTable({
  rows,
  dismissed,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  activeSymbol,
  onActiveChange,
  previewOpen,
  onPreviewChange,
  onOpen,
  onTrack,
  onDismiss,
}: {
  rows: Company[]
  dismissed: Set<string>
  sorting: SortingState
  onSortingChange: (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => void
  columnVisibility: ColumnVisibilityState
  onColumnVisibilityChange: (
    updater:
      | ColumnVisibilityState
      | ((old: ColumnVisibilityState) => ColumnVisibilityState)
  ) => void
  activeSymbol: string | null
  onActiveChange: (symbol: string) => void
  previewOpen: boolean
  onPreviewChange: (open: boolean) => void
  onOpen: (company: Company) => void
  onTrack: (company: Company) => void
  onDismiss: (company: Company) => void
}) {
  const table = useTable({
    features,
    columns,
    data: rows,
    state: { sorting, columnVisibility },
    onSortingChange,
    onColumnVisibilityChange,
  })
  const ordered = table.getRowModel().rows
  const { active: activeRow, rowRef } = useRowNavigation({
    items: ordered,
    keyOf: (row) => row.original.symbol,
    activeKey: activeSymbol,
    onActiveChange,
  })
  const active = activeRow?.original
  const enabled = ordered.length > 0
  useHotkey(" ", () => onPreviewChange(!previewOpen), enabled)
  useHotkey("enter", () => active && onOpen(active), enabled)
  useHotkey("t", () => active && onTrack(active), enabled)
  useHotkey("x", () => active && onDismiss(active), enabled)

  const visibleColumns = table.getVisibleLeafColumns().length

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const numeric = NUMERIC_COLUMNS.has(header.column.id)
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={ariaSort(sorted)}
                    className={cn(
                      numeric && "text-right",
                      header.column.id === "name" && "pl-5"
                    )}
                  >
                    <SortButton
                      sorted={sorted}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                    </SortButton>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {ordered.map((row) => {
            const company = row.original
            const isActive = company.symbol === active?.symbol
            return [
              <TableRow
                key={row.id}
                ref={rowRef(company.symbol)}
                data-state={isActive ? "selected" : undefined}
                className={cn(
                  "cursor-default",
                  dismissed.has(company.symbol) && "opacity-45"
                )}
                onClick={() => onActiveChange(company.symbol)}
                onDoubleClick={() => onOpen(company)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      NUMERIC_COLUMNS.has(cell.column.id) && "text-right",
                      cell.column.id === "name" && "pl-5"
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>,
              isActive && previewOpen ? (
                <TableRow
                  key={`${row.id}-preview`}
                  className="bg-muted hover:bg-muted"
                >
                  <TableCell colSpan={visibleColumns} className="h-auto pl-5">
                    <Preview
                      company={company}
                      onOpen={() => onOpen(company)}
                      onTrack={() => onTrack(company)}
                    />
                  </TableCell>
                </TableRow>
              ) : null,
            ]
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-input bg-card"
      aria-busy="true"
      aria-label="Lädt"
    >
      <div className="h-8 border-b" />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex h-row items-center gap-6 border-b px-5 last:border-0"
        >
          <span className="h-2 w-40 rounded-full bg-muted" />
          <span className="ml-auto h-2 w-14 rounded-full bg-muted" />
          <span className="h-2 w-12 rounded-full bg-muted" />
          <span className="h-2 w-16 rounded-full bg-muted" />
          <span className="h-2 w-10 rounded-full bg-muted" />
          <span className="h-2 w-12 rounded-full bg-muted" />
          <span className="h-2 w-14 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}
