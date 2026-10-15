import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

import { Change } from "@/components/change"
import { formatDate, formatPrice } from "@/lib/format"
import type { Company } from "@/prototype/fixtures/companies"
import type { TrackedStock } from "@/prototype/fixtures/tracking"

/** A tracked stock with its company and the change since it was tracked. */
export type TrackedRow = {
  symbol: string
  company: Company
  stock: TrackedStock
  name: string
  price: number
  since: number
  trackedAt: string
  signals: number
}

export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const helper = createColumnHelper<typeof features, TrackedRow>()

export const NUMERIC_COLUMNS = new Set(["price", "since", "signals"])

export const columns = helper.columns([
  helper.display({
    id: "expand",
    header: () => <span className="sr-only">Expand</span>,
    cell: () => (
      <ChevronRightIcon
        aria-hidden="true"
        strokeWidth={1.6}
        className="size-4 text-muted-foreground transition-transform duration-150 group-aria-expanded/row:rotate-90"
      />
    ),
  }),
  helper.accessor("name", {
    header: "Company",
    sortFn: "alphanumeric",
    cell: ({ row }) => (
      <span className="flex items-baseline gap-2">
        <span className="text-foreground">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.symbol}
        </span>
      </span>
    ),
  }),
  helper.accessor("price", {
    header: "Price",
    cell: ({ row }) => (
      <span className="num">
        {formatPrice(row.original.price)}
        <span className="ml-1.5 inline-block w-8 text-left text-xs text-muted-foreground">
          {row.original.company.currency}
        </span>
      </span>
    ),
  }),
  helper.accessor("since", {
    header: "Since tracking",
    cell: ({ getValue }) => <Change value={getValue()} />,
  }),
  helper.accessor("trackedAt", {
    header: "Tracked on",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {formatDate(getValue(), { year: true })}
      </span>
    ),
  }),
  helper.display({
    id: "thesis",
    header: "Thesis",
    cell: ({ row }) => (
      <span
        className={cn(
          "block max-w-72 truncate font-serif text-[15px] italic",
          "text-muted-foreground"
        )}
      >
        {row.original.stock.thesis || "No reason noted yet"}
      </span>
    ),
  }),
  helper.accessor("signals", {
    header: "Signals",
    cell: ({ getValue }) => <span className="num">{getValue()}</span>,
  }),
])
