/** Shown wherever a value is unknown. Never 0: a missing number is not a zero. */
export const MISSING = "–"

const LOCALE = "de-DE"
const NBSP = " "

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

function currencySymbol(currency: string): string {
  const parts = numberFormat({ style: "currency", currency }).formatToParts(0)
  return parts.find((part) => part.type === "currency")?.value ?? currency
}

/** A plain number with German separators: 1234.5 becomes "1.234,5". */
export function formatNumber(value: Numeric, fractionDigits = 2): string {
  if (isMissing(value)) return MISSING
  return withMinusSign(
    numberFormat({
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)
  )
}

/** A price in its own currency: "42,18", or "42,18 €" when the currency is given. */
export function formatPrice(value: Numeric, currency?: string): string {
  if (isMissing(value)) return MISSING
  const text = formatNumber(value, 2)
  return currency ? text + NBSP + currencySymbol(currency) : text
}

/** A share of one as a percentage: 0.182 becomes "18,2 %", signed "+18,2 %". */
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

const UNITS = [
  { size: 1e12, label: "Bio" },
  { size: 1e9, label: "Mrd" },
  { size: 1e6, label: "Mio" },
  { size: 1e3, label: "Tsd" },
] as const

/** A large amount in German short form: 1 234 000 000 becomes "1,2 Mrd". */
export function formatCompact(value: Numeric, currency?: string): string {
  if (isMissing(value)) return MISSING
  // 0.9995 of a unit already rounds up to "1,0" of it, so 999,95 Mio reads as 1,0 Mrd.
  const unit = UNITS.find(({ size }) => Math.abs(value) >= size * 0.9995)
  const scaled = unit ? value / unit.size : value
  const fractionDigits = unit && Math.abs(scaled) < 99.95 ? 1 : 0
  const parts = [formatNumber(scaled, fractionDigits)]
  if (unit) parts.push(unit.label)
  if (currency) parts.push(currencySymbol(currency))
  return parts.join(NBSP)
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

/** A date as "02.09.", or "02.09.2026" when the year matters. */
export function formatDate(
  value: Date | string | null | undefined,
  options: { year?: boolean } = {}
): string {
  if (value === null || value === undefined) return MISSING
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return MISSING
  return (options.year ? dayMonthYear : dayMonth).format(date)
}
