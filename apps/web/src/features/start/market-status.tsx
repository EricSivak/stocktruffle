import { useEffect, useState } from "react"

import { xetraStatus } from "@/lib/market-hours"

/** "Xetra offen · 14:32", from the clock; refreshed every half minute. */
export function MarketStatus({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <p className={className} aria-live="polite">
      {xetraStatus(now).text}
    </p>
  )
}
