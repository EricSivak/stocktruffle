import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  ColorType,
  createChart,
  CrosshairMode,
  LineSeries,
  LineStyle,
  TickMarkType,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts"
import { cn } from "cn"

import { Change } from "@/components/change"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatAxisPrice,
  formatDate,
  formatMonth,
  formatPrice,
  formatTime,
} from "@/lib/format"
import { chartTime } from "@/prototype/fixtures/calendar"
import type { Company } from "@/prototype/fixtures/companies"
import {
  RANGE_LABELS,
  RANGES,
  rangeChange,
  rangeSeries,
  type Point,
  type Range,
} from "@/prototype/fixtures/series"
import type { StockEvent } from "@/prototype/fixtures/stock"

const HEIGHT = 300
const INTRADAY: Range[] = ["1D", "1W"]

/** Chart times hold Frankfurt wall-clock time as UTC; this turns one into a local date. */
function wallDate(time: number): Date {
  const utc = new Date(time * 1000)
  return new Date(
    utc.getUTCFullYear(),
    utc.getUTCMonth(),
    utc.getUTCDate(),
    utc.getUTCHours(),
    utc.getUTCMinutes()
  )
}

function token(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/** Colours from the design tokens, read again whenever light and dark switch. */
function palette(change: number | null) {
  return {
    text: token("--muted-foreground"),
    grid: token("--border"),
    crosshair: token("--input"),
    line: token(change !== null && change < 0 ? "--loss" : "--gain"),
  }
}

type Marker = { x: number; y: number; time: number; value: number }

/**
 * The price over a chosen period on a sheet: one line coloured by the period's change,
 * horizontal grid lines only, prices on the right, a vertical crosshair with its own label
 * and short marks for events on the time axis.
 */
export function PriceChart({
  company,
  events,
  loading = false,
}: {
  company: Company
  events: StockEvent[]
  loading?: boolean
}) {
  const [range, setRange] = useState<Range>("1Y")
  const points = rangeSeries(company, range)
  const change = rangeChange(points)

  const container = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const series = useRef<ISeriesApi<"Line"> | null>(null)
  const [hover, setHover] = useState<Marker | null>(null)
  const [last, setLast] = useState<Marker | null>(null)
  const [eventMarks, setEventMarks] = useState<{ x: number; label: string }[]>(
    []
  )
  const [axisHeight, setAxisHeight] = useState(28)

  // Overlay positions depend on the chart's layout; recompute after data or size changes.
  const relayout = useEffectEvent(() => {
    const api = chart.current
    const line = series.current
    if (!api || !line || points.length === 0) return
    const end = points[points.length - 1]
    const x = api.timeScale().timeToCoordinate(end.time as UTCTimestamp)
    const y = line.priceToCoordinate(end.value)
    setLast(x === null || y === null ? null : { x, y, ...end })
    setAxisHeight(api.timeScale().height())
    const first = points[0].time
    setEventMarks(
      INTRADAY.includes(range)
        ? []
        : events.flatMap((event) => {
            const time = chartTime(event.date)
            if (time < first || time > end.time) return []
            const position = api
              .timeScale()
              .timeToCoordinate(time as UTCTimestamp)
            return position === null
              ? []
              : [{ x: position, label: event.label }]
          })
    )
  })

  // The chart draws on canvas, so it does not follow the CSS variables by itself.
  const recolor = useEffectEvent(() => {
    const next = palette(change)
    chart.current?.applyOptions({
      layout: { textColor: next.text },
      grid: { horzLines: { color: next.grid } },
      crosshair: { vertLine: { color: next.crosshair } },
    })
    series.current?.applyOptions({ color: next.line })
  })

  useLayoutEffect(() => {
    if (loading || !container.current) return
    const colors = palette(null)
    const api = createChart(container.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: colors.text,
        fontFamily: "Inter Variable, sans-serif",
        fontSize: 11,
        // Credited under Einstellungen → Über, as the licence allows.
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.08 },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        tickMarkFormatter: (time: Time, type: TickMarkType) => {
          const date = wallDate(time as number)
          if (type === TickMarkType.Year) return String(date.getFullYear())
          if (type === TickMarkType.Month) return formatMonth(date)
          if (type === TickMarkType.DayOfMonth) return formatDate(date)
          return formatTime(date)
        },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: colors.crosshair,
          width: 1,
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: { visible: false, labelVisible: false },
      },
      localization: {
        locale: "en-GB",
        priceFormatter: (price: number) =>
          formatAxisPrice(price, company.currency),
      },
      handleScroll: false,
      handleScale: false,
    })
    const line = api.addSeries(LineSeries, {
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerRadius: 3.5,
      crosshairMarkerBorderWidth: 0,
    })
    chart.current = api
    series.current = line

    const onMove = (param: MouseEventParams) => {
      const point =
        param.time === undefined ? undefined : param.seriesData.get(line)
      const value =
        point && "value" in point && typeof point.value === "number"
          ? point.value
          : null
      if (!param.point || value === null) {
        setHover(null)
        return
      }
      const y = line.priceToCoordinate(value)
      setHover(
        y === null
          ? null
          : {
              x: param.point.x,
              y,
              time: param.time as number,
              value,
            }
      )
    }
    api.subscribeCrosshairMove(onMove)
    const onSize = () => relayout()
    api.timeScale().subscribeSizeChange(onSize)

    const observer = new MutationObserver(() => recolor())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
      api.unsubscribeCrosshairMove(onMove)
      api.timeScale().unsubscribeSizeChange(onSize)
      api.remove()
      chart.current = null
      series.current = null
    }
  }, [loading, company.currency])

  useEffect(() => {
    const api = chart.current
    const line = series.current
    if (!api || !line) return
    line.setData(
      points.map((point: Point) => ({
        time: point.time as UTCTimestamp,
        value: point.value,
      }))
    )
    line.applyOptions({ color: palette(change).line })
    api.applyOptions({ timeScale: { timeVisible: INTRADAY.includes(range) } })
    api.timeScale().fitContent()
    setHover(null)
    // Positions are known once the chart has laid out the new data.
    const frame = requestAnimationFrame(() => relayout())
    return () => cancelAnimationFrame(frame)
  }, [points, change, range])

  const shown = hover ?? last
  const shownDate = shown ? wallDate(shown.time) : null

  return (
    <section
      aria-label="Price history"
      className="rounded-lg border border-input bg-card px-5 pt-3 pb-3"
    >
      <div className="flex items-center gap-6">
        <Tabs value={range} onValueChange={(next) => setRange(next as Range)}>
          <TabsList variant="line" className="gap-5">
            {RANGES.map((option) => (
              <TabsTrigger key={option} value={option}>
                {option}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="ml-auto flex items-baseline gap-3">
          <span className="text-muted-foreground">{RANGE_LABELS[range]}</span>
          <Change value={change} className="text-[15px]" />
        </p>
      </div>

      {loading ? (
        <div
          className="mt-3 h-[300px] rounded-md bg-muted/60"
          aria-busy="true"
          aria-label="Chart loading"
        />
      ) : (
        <div className="relative mt-3" style={{ height: HEIGHT }}>
          <div ref={container} className="absolute inset-0" />

          {!hover && last && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full",
                change !== null && change < 0 ? "bg-loss" : "bg-gain"
              )}
              style={{ left: last.x, top: last.y }}
            />
          )}

          {shown && shownDate && (
            <span
              role="status"
              className="pointer-events-none absolute z-10 -translate-x-full -translate-y-[calc(100%+10px)] rounded-md border bg-popover px-2.5 py-1 text-xs whitespace-nowrap tabular-nums shadow-(--shadow-overlay)"
              style={{ left: Math.max(shown.x, 150), top: shown.y }}
            >
              {formatDate(shownDate, { year: true })}
              {INTRADAY.includes(range) && `, ${formatTime(shownDate)}`} ·{" "}
              {formatPrice(shown.value, company.currency)}
            </span>
          )}

          {eventMarks.map((mark) => (
            <span
              key={mark.label}
              aria-hidden="true"
              className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center"
              style={{ left: mark.x, bottom: axisHeight - 6 }}
            >
              <span className="text-[11px] text-muted-foreground">
                {mark.label}
              </span>
              <span className="mt-1 h-3 w-px bg-foreground/70" />
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
