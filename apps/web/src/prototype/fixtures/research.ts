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
  ["Halvard Systems: Geschäftsbericht 2025", "Unternehmensbericht, PDF"],
  ["Rahmenverträge der Streitkräfte 2026", "Fachpresse, 12.09.2026"],
  ["Brixen Optik: Quartalsbericht Q2", "Unternehmensbericht"],
  ["Verteidigungsetats in Europa", "Analyse, 05.09.2026"],
  ["Ostmark Avionik: Unternehmenspräsentation", "Unternehmensbericht, PDF"],
  ["Teralis: Halbjahresbericht 2026", "Unternehmensbericht, PDF"],
  ["EU-Verteidigungsprogramm 2025–2030", "Fachpresse, 28.08.2026"],
  ["Nachfrage nach Rüstungselektronik steigt", "Fachpresse, 14.08.2026"],
  ["Halvard Systems erhält Folgeauftrag", "Unternehmensmitteilung, 02.08.2026"],
  ["Brixen Optik expandiert in Skandinavien", "Fachpresse, 21.07.2026"],
  ["Ostmark Avionik: Halbjahresbericht 2026", "Unternehmensbericht, PDF"],
  ["Teralis gewinnt Ausschreibung für Radarsysteme", "Fachpresse, 18.07.2026"],
  [
    "Zulieferketten der europäischen Verteidigungsindustrie",
    "Analyse, 10.07.2026",
  ],
  ["Halvard Systems: Kapitalmarkttag 2026", "Unternehmensbericht, PDF"],
  ["Optronik und Sensorik: Kapazitäten werden knapp", "Fachpresse, 30.06.2026"],
  ["Brixen Optik: Geschäftsbericht 2025", "Unternehmensbericht, PDF"],
  ["Ziele für Verteidigungsausgaben nach dem Gipfel", "Analyse, 26.06.2026"],
  ["Ostmark Avionik erweitert die Fertigung", "Fachpresse, 19.06.2026"],
  [
    "Teralis: Auftragsbestand auf Rekordniveau",
    "Unternehmensmitteilung, 12.06.2026",
  ],
  ["Kleinere Rüstungswerte im Vergleich", "Analyse, 04.06.2026"],
  ["Exportgenehmigungen für Rüstungsgüter 2025", "Fachpresse, 28.05.2026"],
  ["Halvard Systems: Quartalsbericht Q1", "Unternehmensbericht"],
  [
    "Beschaffung vergibt mehr Aufträge an den Mittelstand",
    "Fachpresse, 15.05.2026",
  ],
]

export const defenceResearch: Research = {
  id: "demo",
  title: "Rüstungszulieferer unter 2 Mrd €",
  question:
    "Welche europäischen Rüstungszulieferer unter 2 Mrd € profitieren am stärksten von höheren Verteidigungsetats?",
  durationSeconds: 100,
  summary: "31 Titel gescreent · 8 recherchiert · 4 ausgewählt",
  steps: [
    "Screen: Luftfahrt und Verteidigung, Europa, Marktkap. unter 2 Mrd € · 31 Titel",
    "Geschäftsberichte und Präsentationen von 8 Titeln gelesen",
    "Rüstungsanteil und Auftragsbestand verglichen",
    "4 Titel mit mehr als der Hälfte Rüstungsumsatz und mehr als zwei Jahren Bestand ausgewählt",
  ],
  heading: "Vier Titel stechen heraus",
  answer: [
    "Alle vier erzielen mehr als die Hälfte ihres Umsatzes mit Verteidigung und haben Aufträge für mehr als zwei Jahre im Bestand.",
    { footnote: 1 },
    " Am klarsten ist das Bild bei Halvard Systems, wo zwei Rahmenverträge bis 2030 laufen.",
    { footnote: 2 },
    " Brixen Optik ist am kleinsten, wächst aber am schnellsten.",
    { footnote: 3 },
  ],
  rows: [
    { symbol: "HVS.OL", defenceShare: 0.82, backlog: 2.6 },
    { symbol: "OMA.DE", defenceShare: 0.64, backlog: 2.2 },
    { symbol: "BXO.MI", defenceShare: 0.71, backlog: 2.1 },
    { symbol: "TRL.PA", defenceShare: 0.58, backlog: 2.0 },
  ],
  unverified:
    "Für 2 der 8 recherchierten Titel gab es keine belastbaren Angaben zum Auftragsbestand.",
  sources: sources.map(([title, detail], index) => ({
    n: index + 1,
    title,
    detail,
  })),
}

/** The steps a new question walks through while the prototype plays the running state. */
export const runningSteps = [
  "Frage verstanden",
  "Passende Titel gescreent",
  "Quellen gesucht",
  "Quellen gelesen",
]

export function researchById(id: string): Research | undefined {
  return id === defenceResearch.id ? defenceResearch : undefined
}
