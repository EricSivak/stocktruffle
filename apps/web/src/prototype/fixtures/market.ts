// The market line at the bottom of the start page, with the values of the approved mockup.

export type MarketQuote = {
  name: string
  value: number
  change: number
  /** Decimal places the quote is read with: none for indices, four for a currency pair. */
  digits: number
}

export const marketQuotes: MarketQuote[] = [
  { name: "DAX", value: 19482, change: 0.006, digits: 0 },
  { name: "Euro Stoxx 50", value: 4981, change: 0.004, digits: 0 },
  { name: "S&P 500", value: 5812, change: -0.002, digits: 0 },
  { name: "Nasdaq 100", value: 20344, change: -0.005, digits: 0 },
  { name: "EUR/USD", value: 1.0912, change: 0.001, digits: 4 },
]
