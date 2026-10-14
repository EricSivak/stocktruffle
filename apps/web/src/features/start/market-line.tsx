import { Change } from "@/components/change"
import { formatNumber } from "@/lib/format"
import type { MarketQuote } from "@/prototype/fixtures/market"

/** The indices and the euro at the foot of the start page, divided by hairlines. */
export function MarketLine({ quotes }: { quotes: MarketQuote[] }) {
  return (
    <dl className="grid grid-cols-5 divide-x border-t py-5">
      {quotes.map((quote) => (
        <div key={quote.name} className="px-6 first:pl-0">
          <dt className="text-xs text-muted-foreground">{quote.name}</dt>
          <dd className="mt-1.5 flex items-baseline gap-4 tabular-nums">
            <span className="text-[15px]">
              {formatNumber(quote.value, quote.digits)}
            </span>
            <Change value={quote.change} />
          </dd>
        </div>
      ))}
    </dl>
  )
}
