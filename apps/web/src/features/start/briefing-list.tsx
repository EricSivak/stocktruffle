import { Link } from "@tanstack/react-router"
import { cn } from "cn"

import { Change } from "@/components/change"
import type { BriefingItem } from "@/prototype/fixtures/briefing"

function Target({
  item,
  children,
}: {
  item: BriefingItem
  children: React.ReactNode
}) {
  const className =
    "flex items-baseline gap-6 border-b py-3 hover:[&>span:first-child]:underline hover:[&>span:first-child]:underline-offset-4"
  return item.to.kind === "stock" ? (
    <Link
      to="/aktie/$symbol"
      params={{ symbol: item.to.symbol }}
      className={className}
    >
      {children}
    </Link>
  ) : (
    <Link
      to="/screens/$screenId"
      params={{ screenId: item.to.screenId }}
      className={className}
    >
      {children}
    </Link>
  )
}

/** "Seit gestern": what moved among your screens and tracked stocks, as plain lines. */
export function BriefingList({
  items,
  className,
}: {
  items: BriefingItem[]
  className?: string
}) {
  return (
    <section aria-labelledby="briefing" className={cn("border-t", className)}>
      <h2 id="briefing" className="border-b py-3 font-medium">
        Seit gestern
      </h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <Target item={item}>
              <span>{item.text}</span>
              <span className="ml-auto">
                {item.change !== undefined ? (
                  <Change value={item.change} />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {item.note}
                  </span>
                )}
              </span>
            </Target>
          </li>
        ))}
      </ul>
    </section>
  )
}
