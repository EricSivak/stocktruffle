import { Link } from "@tanstack/react-router"
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table"
import { ChevronRightIcon } from "lucide-react"

import { formatDate } from "@/lib/format"
import type { SignalRow } from "@/prototype/tracking-store"

export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const helper = createColumnHelper<typeof features, SignalRow>()

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
  helper.accessor("text", {
    header: "Signal",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="block max-w-md truncate text-foreground">
        {getValue()}
      </span>
    ),
  }),
  helper.accessor("symbol", {
    header: "Stock",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => (
      <Link
        to="/stocks/$symbol"
        params={{ symbol: getValue() }}
        onClick={(event) => event.stopPropagation()}
        className="text-xs text-muted-foreground underline decoration-input underline-offset-4 hover:text-foreground"
      >
        {getValue()}
      </Link>
    ),
  }),
  helper.accessor("rhythm", {
    header: "Rhythm",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => getValue(),
  }),
  helper.display({
    id: "status",
    header: "Status",
    cell: () => <span className="text-muted-foreground">not active</span>,
  }),
  helper.accessor("createdAt", {
    header: "Created on",
    sortFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {formatDate(getValue(), { year: true })}
      </span>
    ),
  }),
])
