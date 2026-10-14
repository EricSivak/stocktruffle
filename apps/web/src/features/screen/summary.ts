/** The figures in the meta line above a screen's table, computed from its rows. */
export type ScreenSummary = {
  count: number
  averagePe: number | null
  averageRevenueGrowth: number | null
  medianMarketCap: number | null
}

type Row = {
  pe: number | null
  revenueGrowth: number | null
  marketCapEur: number | null
}

function average(values: number[]): number | null {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null
}

function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

const present = (values: (number | null)[]) =>
  values.filter(
    (value): value is number => value !== null && Number.isFinite(value)
  )

export function summarize(rows: Row[]): ScreenSummary {
  return {
    count: rows.length,
    // A negative P/E means losses; it would drag the average into meaningless territory.
    averagePe: average(
      present(rows.map((row) => row.pe)).filter((pe) => pe > 0)
    ),
    averageRevenueGrowth: average(
      present(rows.map((row) => row.revenueGrowth))
    ),
    medianMarketCap: median(present(rows.map((row) => row.marketCapEur))),
  }
}
