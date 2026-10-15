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
  { id: "no-banks", text: "No banks or insurers", active: true },
  { id: "min-cap", text: "Market cap from €300m", active: true },
  { id: "europe-us", text: "Only Europe and the US", active: false },
]

const europeFilters: FilterToken[] = [
  { id: "region", label: "Region", value: "Europe" },
  { id: "market-cap", label: "Market cap", value: "€0.3–2bn" },
  { id: "pe", label: "P/E", value: "< 15" },
  { id: "net-margin", label: "Net margin", value: "> 0%" },
  { id: "sector", label: "Sector", value: "excl. financials" },
]

export const screens: SavedScreen[] = [
  {
    id: "europe-small-caps",
    name: "Europe Small Caps",
    query: "Profitable small caps in Europe, P/E under 15",
    meta: `Saved screen · ${AS_OF_TIME}`,
    updatedAt: AS_OF_TIME,
    filters: europeFilters,
    rows: companies,
  },
  {
    id: "defence-suppliers",
    name: "Defence suppliers",
    query: "European defence suppliers under €2bn",
    meta: `From research · ${AS_OF_TIME}`,
    updatedAt: AS_OF_TIME,
    filters: [
      { id: "region", label: "Region", value: "Europe" },
      { id: "industry", label: "Industry", value: "Defence" },
      { id: "market-cap", label: "Market cap", value: "< €2bn" },
      { id: "defence-share", label: "Defence share", value: "> 50%" },
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
 * the prototype shows the rows of "Europe Small Caps".
 */
export function draftScreen(query: string): SavedScreen {
  return {
    id: "new",
    name: "New screen",
    query,
    meta: "Not saved",
    updatedAt: AS_OF_TIME,
    filters: europeFilters,
    rows: companies,
  }
}
