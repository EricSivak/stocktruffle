import { AS_OF_TIME } from "./calendar"
import { allCompanies, companies, type Company } from "./companies"
import { defenceResearch } from "./research"

export type FilterToken = { id: string; label: string; value: string }

export type SavedScreen = {
  id: string
  name: string
  query: string
  /** Gray text next to the title: whether and when it was saved. */
  meta: string
  updatedAt: string
  filters: FilterToken[]
  rows: Company[]
}

export const rules = [
  { id: "no-banks", text: "Keine Banken und Versicherungen", active: true },
  { id: "min-cap", text: "Marktkapitalisierung ab 300 Mio €", active: true },
  { id: "europe-us", text: "Nur Europa und USA", active: false },
]

const europeFilters: FilterToken[] = [
  { id: "region", label: "Region", value: "Europa" },
  { id: "market-cap", label: "Marktkap.", value: "0,3–2 Mrd €" },
  { id: "pe", label: "KGV", value: "< 15" },
  { id: "net-margin", label: "Nettomarge", value: "> 0 %" },
  { id: "sector", label: "Sektor", value: "ohne Finanzwerte" },
]

export const screens: SavedScreen[] = [
  {
    id: "europa-small-caps",
    name: "Europa Small Caps",
    query: "Profitable Small Caps in Europa, KGV unter 15",
    meta: `Gespeicherter Screen · ${AS_OF_TIME}`,
    updatedAt: AS_OF_TIME,
    filters: europeFilters,
    rows: companies,
  },
  {
    id: "ruestungszulieferer",
    name: "Rüstungszulieferer",
    query: "Europäische Rüstungszulieferer unter 2 Mrd €",
    meta: `Aus der Recherche · ${AS_OF_TIME}`,
    updatedAt: AS_OF_TIME,
    filters: [
      { id: "region", label: "Region", value: "Europa" },
      { id: "industry", label: "Branche", value: "Verteidigung" },
      { id: "market-cap", label: "Marktkap.", value: "< 2 Mrd €" },
      { id: "defence-share", label: "Rüstungsanteil", value: "> 50 %" },
    ],
    rows: defenceResearch.rows.map((row) =>
      allCompanies.find((company) => company.symbol === row.symbol)!
    ),
  },
]

export function screenById(id: string): SavedScreen | undefined {
  return screens.find((screen) => screen.id === id)
}

/**
 * An unsaved screen for a new query from the start page. Until phase 1 translates the text,
 * the prototype shows the rows of "Europa Small Caps".
 */
export function draftScreen(query: string): SavedScreen {
  return {
    id: "neu",
    name: "Neuer Screen",
    query,
    meta: "Nicht gespeichert",
    updatedAt: AS_OF_TIME,
    filters: europeFilters,
    rows: companies,
  }
}
