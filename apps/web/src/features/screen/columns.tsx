import {
  columnVisibilityFeature,
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table"

import { Change } from "@/components/change"
import { Sparkline } from "@/components/sparkline"
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatPrice,
} from "@/lib/format"
import type { Company } from "@/prototype/fixtures/companies"

export const features = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const helper = createColumnHelper<typeof features, Company>()

/** Columns whose cells are figures: right-aligned, tabular. */
export const NUMERIC_COLUMNS = new Set([
  "price",
  "dayChange",
  "marketCapEur",
  "pe",
  "revenueGrowth",
  "netMargin",
  "yearChange",
])

export const columns = helper.columns([
  helper.accessor("name", {
    header: "Unternehmen",
    sortFn: "alphanumeric",
    enableHiding: false,
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
    header: "Kurs",
    cell: ({ row }) => (
      <span className="num">
        {formatPrice(row.original.price)}
        <span className="ml-1.5 inline-block w-8 text-left text-xs text-muted-foreground">
          {row.original.currency}
        </span>
      </span>
    ),
  }),
  helper.accessor("dayChange", {
    header: "Heute",
    cell: ({ getValue }) => <Change value={getValue()} />,
  }),
  helper.accessor("marketCapEur", {
    header: "Marktkap.",
    cell: ({ getValue }) => (
      <span className="num">{formatCompact(getValue(), "EUR")}</span>
    ),
  }),
  helper.accessor("pe", {
    header: "KGV",
    cell: ({ getValue }) => (
      <span className="num">{formatNumber(getValue(), 1)}</span>
    ),
  }),
  helper.accessor("revenueGrowth", {
    header: "Umsatz Δ",
    cell: ({ getValue }) => <Change value={getValue()} />,
  }),
  helper.accessor("netMargin", {
    header: "Nettomarge",
    cell: ({ getValue }) => (
      <span className="num">{formatPercent(getValue())}</span>
    ),
  }),
  helper.accessor("yearChange", {
    header: "1 Jahr",
    cell: ({ row }) => (
      <Sparkline
        values={row.original.year}
        tone={row.original.yearChange}
        className="ml-auto"
      />
    ),
  }),
])

/** Columns written to the CSV export, with raw numbers instead of formatted text. */
export const CSV_COLUMNS = [
  { header: "Unternehmen", value: (row: Company) => row.name },
  { header: "Ticker", value: (row: Company) => row.symbol },
  { header: "Kurs", value: (row: Company) => row.price },
  { header: "Währung", value: (row: Company) => row.currency },
  { header: "Heute", value: (row: Company) => row.dayChange },
  { header: "Marktkap. (EUR)", value: (row: Company) => row.marketCapEur },
  { header: "KGV", value: (row: Company) => row.pe },
  { header: "Umsatzwachstum", value: (row: Company) => row.revenueGrowth },
  { header: "Nettomarge", value: (row: Company) => row.netMargin },
  { header: "1 Jahr", value: (row: Company) => row.yearChange },
]
