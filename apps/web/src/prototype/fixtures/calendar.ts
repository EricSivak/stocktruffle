// The prototype's fixed "now": the close on Friday 9 October 2026, the date the stock mockup
// shows. All invented prices and dates are laid out backwards from here.

export const AS_OF_DATE = "2026-10-09"
export const AS_OF_TIME = "17:35"

/** Trading days per year, the length of every one-year series. */
export const DAYS_PER_YEAR = 250

function parse(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** `count` weekdays ending with `end`, oldest first. Holidays are ignored. */
export function tradingDays(end: string, count: number): string[] {
  const days: string[] = []
  const cursor = parse(end)
  while (days.length < count) {
    const weekday = cursor.getUTCDay()
    if (weekday !== 0 && weekday !== 6) days.push(toIso(cursor))
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return days.reverse()
}

/** The trading days of the one-year series every company carries. */
export const YEAR_DAYS = tradingDays(AS_OF_DATE, DAYS_PER_YEAR)

/** Position of a date in the one-year series: the last trading day on or before it. */
export function yearIndex(iso: string): number {
  let index = -1
  for (let i = 0; i < YEAR_DAYS.length && YEAR_DAYS[i] <= iso; i++) index = i
  return index
}

/**
 * A chart time in seconds. Wall-clock time is stored as if it were UTC, so the chart, which
 * formats in UTC, shows Frankfurt time without knowing about time zones.
 */
export function chartTime(iso: string, hours = 0, minutes = 0): number {
  const date = parse(iso)
  date.setUTCHours(hours, minutes)
  return date.getTime() / 1000
}
