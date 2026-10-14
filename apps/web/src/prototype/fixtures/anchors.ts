// Changes the mockups state outright. Price series are bent through them, so every figure the
// code derives from a series (since tracking, since the turn of the year) matches the mockup.

/** Stocks in the tracking mockup: tracked on `date`, `change` since then. */
export const TRACKED_SINCE = [
  { symbol: "NWT.DE", date: "2026-09-02", change: 0.064 },
  { symbol: "HBG.DE", date: "2026-08-21", change: -0.031 },
  { symbol: "SBG.ST", date: "2026-07-14", change: 0.129 },
  { symbol: "ALM.PA", date: "2026-09-30", change: 0.012 },
  { symbol: "LKS.HE", date: "2026-10-01", change: -0.008 },
]

/** Stocks in the tracking archive: the change while tracked, and since archiving. */
export const ARCHIVED = [
  {
    symbol: "TRS.MC",
    trackedAt: "2026-03-12",
    archivedAt: "2026-09-18",
    during: -0.084,
    since: 0.021,
  },
  {
    symbol: "BRN.VI",
    trackedAt: "2026-01-20",
    archivedAt: "2026-08-25",
    during: 0.142,
    since: -0.03,
  },
]

/** Last close of the previous year, the base of "since the start of the year". */
export const YEAR_START = "2025-12-31"

/** Stocks in the research mockup and their change since the start of the year. */
export const YEAR_TO_DATE: Record<string, number> = {
  "HVS.OL": 0.342,
  "OMA.DE": 0.189,
  "BXO.MI": 0.41,
  "TRL.PA": 0.124,
}
