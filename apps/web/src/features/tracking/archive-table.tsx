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
import { formatDate } from "@/lib/format"
import { companyBySymbol } from "@/prototype/fixtures/companies"
import type { ArchivedStock } from "@/prototype/fixtures/tracking"

/** Stocks no longer tracked: how they did while tracked, and since. */
export function ArchiveTable({ stocks }: { stocks: ArchivedStock[] }) {
  const navigate = useNavigate()
  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Unternehmen</TableHead>
            <TableHead>Getrackt am</TableHead>
            <TableHead>Archiviert am</TableHead>
            <TableHead className="text-right">Während Tracking</TableHead>
            <TableHead className="text-right">Seitdem</TableHead>
            <TableHead className="pl-8">Grund</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => {
            const company = companyBySymbol(stock.symbol)
            return (
              <TableRow
                key={`${stock.symbol}-${stock.archivedAt}`}
                className="cursor-default"
                onClick={() =>
                  void navigate({
                    to: "/aktie/$symbol",
                    params: { symbol: stock.symbol },
                  })
                }
              >
                <TableCell className="pl-5">
                  <span className="flex items-baseline gap-2">
                    <span>{company?.name ?? stock.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {stock.symbol}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatDate(stock.trackedAt, { year: true })}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatDate(stock.archivedAt, { year: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Change
                    value={stock.archivedPrice / stock.trackedPrice - 1}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Change
                    value={
                      company ? company.price / stock.archivedPrice - 1 : null
                    }
                  />
                </TableCell>
                <TableCell className="pl-8 text-muted-foreground">
                  {stock.reason || "–"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
