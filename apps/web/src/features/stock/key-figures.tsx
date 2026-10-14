import { Change } from "@/components/change"
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatPrice,
} from "@/lib/format"
import type { Company } from "@/prototype/fixtures/companies"
import { yearRange } from "@/prototype/fixtures/series"
import type { StockDetails } from "@/prototype/fixtures/stock"

/** Where today's price sits between the year's low and high: a hairline with one mark. */
function YearRange({ company }: { company: Company }) {
  const { low, high } = yearRange(company)
  const position = high > low ? (company.price - low) / (high - low) : 0.5
  return (
    <span className="flex items-center gap-3 tabular-nums">
      {formatPrice(low, company.currency)}
      <span className="relative h-px w-40 bg-input" aria-hidden="true">
        <span
          className="absolute -top-1.5 h-3 w-px bg-foreground"
          style={{ left: `${position * 100}%` }}
        />
      </span>
      {formatPrice(high, company.currency)}
    </span>
  )
}

/** The stock's figures as a list with hairlines, labels left and values right. */
export function KeyFigures({
  company,
  details,
}: {
  company: Company
  details: StockDetails
}) {
  const rows: [string, React.ReactNode][] = [
    ["Marktkap.", formatCompact(company.marketCapEur, "EUR")],
    ["KGV", formatNumber(company.pe, 1)],
    ["KGV erwartet", formatNumber(details.forwardPe, 1)],
    ["EV/EBITDA", formatNumber(details.evToEbitda, 1)],
    ["Umsatzwachstum", <Change key="growth" value={company.revenueGrowth} />],
    ["Nettomarge", formatPercent(company.netMargin)],
    ["FCF-Rendite", formatPercent(company.fcfYield)],
    ["Dividendenrendite", formatPercent(company.dividendYield)],
    ["52-Wochen-Spanne", <YearRange key="range" company={company} />],
  ]
  return (
    <section aria-labelledby="key-figures">
      <h2 id="key-figures" className="border-b pb-2 text-[15px] font-medium">
        Kennzahlen
      </h2>
      <dl className="divide-y">
        {rows.map(([term, value]) => (
          <div key={term} className="flex h-8 items-center justify-between">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="num">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
