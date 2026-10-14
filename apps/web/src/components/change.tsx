import { cn } from "cn"

import { formatPercent } from "@/lib/format"

/** A signed change. The only place the interface uses colour. */
export function Change({
  value,
  className,
}: {
  value: number | null | undefined
  className?: string
}) {
  return (
    <span
      className={cn(
        "num",
        value != null && value > 0 && "text-gain",
        value != null && value < 0 && "text-loss",
        value === 0 && "text-muted-foreground",
        className
      )}
    >
      {formatPercent(value, { signed: true })}
    </span>
  )
}
