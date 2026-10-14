import { useState } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNumber } from "@/lib/format"
import type { Period, StockDetails } from "@/prototype/fixtures/stock"

const WIDTH = 560
const HEIGHT = 200
const TOP = 18
const AXIS = 22
const BAR = 22
const GAP = 5

/** Revenue in ink, EBIT in warm gray; an estimate only as an outline. */
function Bars({ periods }: { periods: Period[] }) {
  const max = Math.max(...periods.map((period) => period.revenue))
  const plot = HEIGHT - TOP - AXIS
  const slot = WIDTH / periods.length
  const scale = (value: number) => (value / max) * plot
  const base = HEIGHT - AXIS

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full overflow-visible"
      role="img"
      aria-label={periods
        .map(
          (period) =>
            `${period.label}: Umsatz ${formatNumber(period.revenue, 0)}, EBIT ${formatNumber(period.ebit, 0)} Mio €`
        )
        .join("; ")}
    >
      <line
        x1={0}
        x2={WIDTH}
        y1={base + 0.5}
        y2={base + 0.5}
        className="stroke-border"
      />
      {periods.map((period, index) => {
        const center = slot * index + slot / 2
        const revenueX = center - BAR - GAP / 2
        const ebitX = center + GAP / 2
        const revenue = scale(period.revenue)
        const ebit = scale(period.ebit)
        const outline = period.estimate
        return (
          <g key={period.label}>
            <rect
              x={revenueX + (outline ? 0.5 : 0)}
              y={base - revenue + (outline ? 0.5 : 0)}
              width={BAR - (outline ? 1 : 0)}
              height={revenue - (outline ? 0.5 : 0)}
              className={
                outline ? "fill-none stroke-foreground" : "fill-foreground"
              }
            />
            <rect
              x={ebitX + (outline ? 0.5 : 0)}
              y={base - ebit + (outline ? 0.5 : 0)}
              width={BAR - (outline ? 1 : 0)}
              height={ebit - (outline ? 0.5 : 0)}
              className={outline ? "fill-none stroke-chart-2" : "fill-chart-2"}
            />
            <text
              x={revenueX + BAR / 2}
              y={base - revenue - 6}
              textAnchor="middle"
              className="fill-foreground text-[11px] tabular-nums"
            >
              {formatNumber(period.revenue, 0)}
            </text>
            <text
              x={center}
              y={HEIGHT - 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {period.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function Financials({ details }: { details: StockDetails }) {
  const [view, setView] = useState<"annual" | "quarterly">("annual")
  const periods = view === "annual" ? details.annual : details.quarterly

  return (
    <section aria-labelledby="financials">
      <div className="flex items-baseline border-b pb-2">
        <h2 id="financials" className="text-[15px] font-medium">
          Finanzen
        </h2>
        <Tabs
          value={view}
          onValueChange={(next) => setView(next as typeof view)}
          className="ml-auto"
        >
          <TabsList variant="line">
            <TabsTrigger value="annual">Jährlich</TabsTrigger>
            <TabsTrigger value="quarterly">Quartal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-6">
        <Bars periods={periods} />
      </div>
      <p className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 bg-foreground" aria-hidden="true" />
          Umsatz
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 bg-chart-2" aria-hidden="true" />
          EBIT
        </span>
        <span>in Mio €</span>
      </p>
    </section>
  )
}
