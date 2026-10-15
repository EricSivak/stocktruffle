import { useNavigate } from "@tanstack/react-router"

import { Change } from "@/components/change"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCompact, formatNumber, formatPercent } from "@/lib/format"
import { YEAR_START } from "@/prototype/fixtures/anchors"
import { companyBySymbol } from "@/prototype/fixtures/companies"
import type { ResearchRow } from "@/prototype/fixtures/research"
import { closeOn } from "@/prototype/fixtures/tracking"

/** A share as a number and a thin ink bar on a pale track. */
function ShareBar({ share }: { share: number }) {
  return (
    <span className="flex items-center gap-3">
      <span className="w-9 text-right tabular-nums">
        {formatPercent(share, { fractionDigits: 0 })}
      </span>
      <span className="h-1 w-24 bg-muted" aria-hidden="true">
        <span
          className="block h-full bg-foreground"
          style={{ width: `${share * 100}%` }}
        />
      </span>
    </span>
  )
}

/** The research's result as a table on the page itself, without a sheet around it. */
export function ResearchTable({ rows }: { rows: ResearchRow[] }) {
  const navigate = useNavigate()
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-0">Company</TableHead>
          <TableHead className="text-right">Market cap</TableHead>
          <TableHead className="pl-8">Defence share</TableHead>
          <TableHead className="text-right">Backlog</TableHead>
          <TableHead className="pr-0 text-right">YTD</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const company = companyBySymbol(row.symbol)
          if (!company) return null
          return (
            <TableRow
              key={row.symbol}
              className="cursor-default"
              onClick={() =>
                void navigate({
                  to: "/stocks/$symbol",
                  params: { symbol: row.symbol },
                })
              }
            >
              <TableCell className="pl-0">
                <span className="flex items-baseline gap-2">
                  <span>{company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {company.symbol}
                  </span>
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCompact(company.marketCapEur, "EUR")}
              </TableCell>
              <TableCell className="pl-8">
                <ShareBar share={row.defenceShare} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(row.backlog, 1)}× revenue
              </TableCell>
              <TableCell className="pr-0 text-right">
                <Change
                  value={company.price / closeOn(row.symbol, YEAR_START) - 1}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
