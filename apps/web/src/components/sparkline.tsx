import { cn } from "cn"

/**
 * A small line without axes: the shape of a series, not its values. Coloured by direction
 * when `tone` is set (the period's change), otherwise in the muted text colour.
 */
export function Sparkline({
  values,
  width = 64,
  height = 18,
  tone,
  className,
}: {
  values: number[]
  width?: number
  height?: number
  tone?: number
  className?: string
}) {
  // At this size a year of daily closes is noise; about one point per 1.5 px reads as a shape.
  const target = Math.max(2, Math.round(width / 1.5))
  const sampled =
    values.length > target
      ? Array.from(
          { length: target },
          (_, i) => values[Math.round((i * (values.length - 1)) / (target - 1))]
        )
      : values
  const min = Math.min(...sampled)
  const span = Math.max(...sampled) - min || 1
  const points = sampled
    .map((value, index) => {
      const x = (index / (sampled.length - 1)) * width
      const y = height - 1 - ((value - min) / span) * (height - 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className={cn(
        tone === undefined && "text-muted-foreground",
        tone !== undefined && tone >= 0 && "text-gain",
        tone !== undefined && tone < 0 && "text-loss",
        className
      )}
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
