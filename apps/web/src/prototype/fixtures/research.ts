// The finished research of the approved mockup (docs/design/mockups-v2/03-recherche.webp).
// The first ten sources are the mockup's; the other thirteen are invented to match.
import type { Source } from "./agent"

export type ResearchRow = {
  symbol: string
  /** Share of revenue from defence, 0 to 1. */
  defenceShare: number
  /** Order backlog as a multiple of annual revenue. */
  backlog: number
}

export type Research = {
  id: string
  title: string
  question: string
  durationSeconds: number
  summary: string
  steps: string[]
  heading: string
  answer: (string | { footnote: number })[]
  rows: ResearchRow[]
  unverified: string
  sources: Source[]
}

const sources: [string, string][] = [
  ["Halvard Systems: Annual report 2025", "Company report, PDF"],
  ["Armed forces framework contracts 2026", "Trade press, 12/09/2026"],
  ["Brixen Optik: Q2 quarterly report", "Company report"],
  ["Defence budgets in Europe", "Analysis, 05/09/2026"],
  ["Ostmark Avionik: Company presentation", "Company report, PDF"],
  ["Teralis: Half-year report 2026", "Company report, PDF"],
  ["EU defence programme 2025–2030", "Trade press, 28/08/2026"],
  ["Demand for defence electronics rises", "Trade press, 14/08/2026"],
  [
    "Halvard Systems wins a follow-on order",
    "Company announcement, 02/08/2026",
  ],
  ["Brixen Optik expands into Scandinavia", "Trade press, 21/07/2026"],
  ["Ostmark Avionik: Half-year report 2026", "Company report, PDF"],
  ["Teralis wins a tender for radar systems", "Trade press, 18/07/2026"],
  ["Supply chains of the European defence industry", "Analysis, 10/07/2026"],
  ["Halvard Systems: Capital markets day 2026", "Company report, PDF"],
  ["Optronics and sensors: capacity runs short", "Trade press, 30/06/2026"],
  ["Brixen Optik: Annual report 2025", "Company report, PDF"],
  ["Defence spending targets after the summit", "Analysis, 26/06/2026"],
  ["Ostmark Avionik expands production", "Trade press, 19/06/2026"],
  [
    "Teralis: Order backlog at a record high",
    "Company announcement, 12/06/2026",
  ],
  ["Smaller defence stocks compared", "Analysis, 04/06/2026"],
  ["Export licences for defence goods 2025", "Trade press, 28/05/2026"],
  ["Halvard Systems: Q1 quarterly report", "Company report"],
  [
    "Procurement awards more contracts to mid-sized firms",
    "Trade press, 15/05/2026",
  ],
]

export const defenceResearch: Research = {
  id: "demo",
  title: "Defence suppliers under €2bn",
  question:
    "Which European defence suppliers under €2bn gain most from higher defence budgets?",
  durationSeconds: 100,
  summary: "31 stocks screened · 8 researched · 4 selected",
  steps: [
    "Screen: aerospace and defence, Europe, market cap under €2bn · 31 stocks",
    "Read the annual reports and presentations of 8 stocks",
    "Compared defence share and order backlog",
    "Selected 4 stocks with more than half their revenue from defence and over two years of backlog",
  ],
  heading: "Four stocks stand out",
  answer: [
    "All four earn more than half their revenue from defence and hold orders for more than two years.",
    { footnote: 1 },
    " The picture is clearest at Halvard Systems, where two framework contracts run until 2030.",
    { footnote: 2 },
    " Brixen Optik is the smallest but grows fastest.",
    { footnote: 3 },
  ],
  rows: [
    { symbol: "HVS.OL", defenceShare: 0.82, backlog: 2.6 },
    { symbol: "OMA.DE", defenceShare: 0.64, backlog: 2.2 },
    { symbol: "BXO.MI", defenceShare: 0.71, backlog: 2.1 },
    { symbol: "TRL.PA", defenceShare: 0.58, backlog: 2.0 },
  ],
  unverified:
    "For 2 of the 8 researched stocks there was no reliable figure for the order backlog.",
  sources: sources.map(([title, detail], index) => ({
    n: index + 1,
    title,
    detail,
  })),
}

/** The steps a new question walks through while the prototype plays the running state. */
export const runningSteps = [
  "Question understood",
  "Matching stocks screened",
  "Sources searched",
  "Sources read",
]

export function researchById(id: string): Research | undefined {
  return id === defenceResearch.id ? defenceResearch : undefined
}
