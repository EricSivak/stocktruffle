// The metrics a screen can filter on. A prototype stand-in: from phase 1 the engine's
// catalog (apps/engine/src/engine/catalog/metrics.py) supplies this list.
export type CatalogMetric = { id: string; label: string; unit?: string }
export type CatalogGroup = { name: string; metrics: CatalogMetric[] }

export const catalog: CatalogGroup[] = [
  {
    name: "Bewertung",
    metrics: [
      { id: "pe", label: "KGV" },
      { id: "forward-pe", label: "KGV erwartet" },
      { id: "pb", label: "Kurs-Buchwert-Verhältnis" },
      { id: "ev-ebitda", label: "EV/EBITDA" },
      { id: "peg", label: "PEG" },
    ],
  },
  {
    name: "Wachstum",
    metrics: [
      { id: "revenue-growth", label: "Umsatzwachstum", unit: "%" },
      { id: "eps-growth", label: "Gewinnwachstum je Aktie", unit: "%" },
      { id: "ebitda-growth", label: "EBITDA-Wachstum", unit: "%" },
      { id: "fcf-growth", label: "Free-Cashflow-Wachstum", unit: "%" },
    ],
  },
  {
    name: "Qualität",
    metrics: [
      { id: "net-margin", label: "Nettomarge", unit: "%" },
      { id: "gross-margin", label: "Bruttomarge", unit: "%" },
      { id: "roe", label: "Eigenkapitalrendite", unit: "%" },
      { id: "debt-ebitda", label: "Verschuldung/EBITDA" },
      { id: "current-ratio", label: "Liquidität 2. Grades" },
    ],
  },
  {
    name: "Dividende",
    metrics: [
      { id: "dividend-yield", label: "Dividendenrendite", unit: "%" },
      { id: "dividend-years", label: "Jahre mit steigender Dividende" },
      { id: "payout", label: "Ausschüttungsquote", unit: "%" },
    ],
  },
  {
    name: "Momentum",
    metrics: [
      { id: "change-1y", label: "Kursveränderung 1 Jahr", unit: "%" },
      { id: "from-high", label: "Abstand zum 52-Wochen-Hoch", unit: "%" },
      { id: "short-interest", label: "Leerverkaufsquote", unit: "%" },
    ],
  },
  {
    name: "Unternehmen",
    metrics: [
      { id: "region", label: "Region" },
      { id: "country", label: "Land" },
      { id: "sector", label: "Sektor" },
      { id: "market-cap", label: "Marktkapitalisierung" },
    ],
  },
]
