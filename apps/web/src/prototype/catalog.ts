// The metrics a screen can filter on. A prototype stand-in: from phase 1 the engine's
// catalog (apps/engine/src/engine/catalog/metrics.py) supplies this list.
export type CatalogMetric = { id: string; label: string; unit?: string }
export type CatalogGroup = { name: string; metrics: CatalogMetric[] }

export const catalog: CatalogGroup[] = [
  {
    name: "Valuation",
    metrics: [
      { id: "pe", label: "P/E" },
      { id: "forward-pe", label: "Forward P/E" },
      { id: "pb", label: "Price to book" },
      { id: "ev-ebitda", label: "EV/EBITDA" },
      { id: "peg", label: "PEG" },
    ],
  },
  {
    name: "Growth",
    metrics: [
      { id: "revenue-growth", label: "Revenue growth", unit: "%" },
      { id: "eps-growth", label: "EPS growth", unit: "%" },
      { id: "ebitda-growth", label: "EBITDA growth", unit: "%" },
      { id: "fcf-growth", label: "Free cash flow growth", unit: "%" },
    ],
  },
  {
    name: "Quality",
    metrics: [
      { id: "net-margin", label: "Net margin", unit: "%" },
      { id: "gross-margin", label: "Gross margin", unit: "%" },
      { id: "roe", label: "Return on equity", unit: "%" },
      { id: "debt-ebitda", label: "Debt/EBITDA" },
      { id: "current-ratio", label: "Quick ratio" },
    ],
  },
  {
    name: "Dividend",
    metrics: [
      { id: "dividend-yield", label: "Dividend yield", unit: "%" },
      { id: "dividend-years", label: "Years of rising dividends" },
      { id: "payout", label: "Payout ratio", unit: "%" },
    ],
  },
  {
    name: "Momentum",
    metrics: [
      { id: "change-1y", label: "Price change 1 year", unit: "%" },
      { id: "from-high", label: "Distance to 52-week high", unit: "%" },
      { id: "short-interest", label: "Short interest", unit: "%" },
    ],
  },
  {
    name: "Company",
    metrics: [
      { id: "region", label: "Region" },
      { id: "country", label: "Country" },
      { id: "sector", label: "Sector" },
      { id: "market-cap", label: "Market cap" },
    ],
  },
]
