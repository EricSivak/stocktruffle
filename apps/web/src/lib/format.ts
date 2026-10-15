/** Shown wherever a value is unknown. Never 0: a missing number is not a zero. */
export const MISSING = "–"

// British English: decimal point, comma thousands, day before month.
const LOCALE = "en-GB"

type Numeric = number | null | undefined

const numberFormats = new Map<string, Intl.NumberFormat>()

function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options)
  let format = numberFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat(LOCALE, options)
    numberFormats.set(key, format)
  }
  return format
}

function isMissing(value: Numeric): value is null | undefined {
  return value === null || value === undefined || !Number.isFinite(value)
}

// Intl writes negative numbers with a hyphen. The real minus sign is as wide as the plus
// sign, which keeps signed columns aligned.
function withMinusSign(text: string): string {
  return text.replace("-", "−")
}

/** A plain number: 1234.5 becomes "1,234.5". */
export function formatNumber(value: Numeric, fractionDigits = 2): string {
  if (isMissing(value)) return MISSING
  return withMinusSign(
    numberFormat({
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)
  )
}

function formatMoney(
  value: number,
  currency: string,
  minimumFractionDigits: number,
  maximumFractionDigits: number
): string {
  return withMinusSign(
    numberFormat({
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value)
  )
}

/** A price in its own currency: "42.18", or "€42.18" and "SEK 118.40" with the currency. */
export function formatPrice(value: Numeric, currency?: string): string {
  if (isMissing(value)) return MISSING
  return currency ? formatMoney(value, currency, 2, 2) : formatNumber(value, 2)
}

/** A share of one as a percentage: 0.182 becomes "18.2%", signed "+18.2%". */
export function formatPercent(
  value: Numeric,
  options: { signed?: boolean; fractionDigits?: number } = {}
): string {
  if (isMissing(value)) return MISSING
  const { signed = false, fractionDigits = 1 } = options
  return withMinusSign(
    numberFormat({
      style: "percent",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      signDisplay: signed ? "exceptZero" : "auto",
    }).format(value)
  )
}

// Financial-press units: €1.2bn, €850m. Intl's compact notation would write "B".
const UNITS = [
  { size: 1e12, label: "tn" },
  { size: 1e9, label: "bn" },
  { size: 1e6, label: "m" },
  { size: 1e3, label: "k" },
] as const

/** A large amount in short form: 1 234 000 000 becomes "1.2bn", or "€1.2bn". */
export function formatCompact(value: Numeric, currency?: string): string {
  if (isMissing(value)) return MISSING
  // 0.9995 of a unit already rounds up to "1.0" of it, so 999.95m reads as 1.0bn.
  const unit = UNITS.find(({ size }) => Math.abs(value) >= size * 0.9995)
  const scaled = unit ? value / unit.size : value
  const fractionDigits = unit && Math.abs(scaled) < 99.95 ? 1 : 0
  const amount = currency
    ? formatMoney(scaled, currency, fractionDigits, fractionDigits)
    : formatNumber(scaled, fractionDigits)
  return unit ? amount + unit.label : amount
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value
  // A bare date has no time zone. Parsed as UTC it would slip to the previous day
  // west of Greenwich.
  const match = DATE_ONLY.exec(value)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  return new Date(value)
}

const dayMonth = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
})
const dayMonthYear = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

/** A date as "02/09", or "02/09/2026" when the year matters. */
export function formatDate(
  value: Date | string | null | undefined,
  options: { year?: boolean } = {}
): string {
  if (value === null || value === undefined) return MISSING
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return MISSING
  return (options.year ? dayMonthYear : dayMonth).format(date)
}

/** A price on a chart axis: as few decimals as the tick needs, "€40" or "€42.5". */
export function formatAxisPrice(value: Numeric, currency?: string): string {
  if (isMissing(value)) return MISSING
  return currency
    ? formatMoney(value, currency, 0, 2)
    : withMinusSign(numberFormat({ maximumFractionDigits: 2 }).format(value))
}

const hourMinute = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
})

/** A time of day as "14:30". */
export function formatTime(value: Date | null | undefined): string {
  if (!value || Number.isNaN(value.getTime())) return MISSING
  return hourMinute.format(value)
}

// Three letters, as on a chart axis; Intl writes "Sept" in British English.
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** A month as a short axis label: "Mar". */
export function formatMonth(value: Date): string {
  return MONTHS[value.getMonth()]
}

/** How long something took: "1m 40s", "2m", or "40s" under a minute. */
export function formatDuration(seconds: Numeric): string {
  if (isMissing(seconds)) return MISSING
  const whole = Math.round(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = whole % 60
  if (minutes === 0) return `${rest}s`
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
}

/** A running clock: "0:04", "1:40". */
export function formatClock(seconds: Numeric): string {
  if (isMissing(seconds)) return MISSING
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}
