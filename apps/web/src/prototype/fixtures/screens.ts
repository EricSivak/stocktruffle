import { companies, type Company } from "./companies"

export type FilterToken = { id: string; label: string; value: string }

export type SavedScreen = {
  id: string
  name: string
  query: string
  updatedAt: string
  filters: FilterToken[]
  rows: Company[]
}

export const rules = [
  { id: "no-banks", text: "Keine Banken und Versicherungen", active: true },
  { id: "min-cap", text: "Marktkapitalisierung ab 300 Mio €", active: true },
  { id: "europe-us", text: "Nur Europa und USA", active: false },
]

export const screens: SavedScreen[] = [
  {
    id: "europa-small-caps",
    name: "Europa Small Caps",
    query: "Profitable Small Caps in Europa, KGV unter 15",
    updatedAt: "17:35",
    filters: [
      { id: "region", label: "Region", value: "Europa" },
      { id: "market-cap", label: "Marktkap.", value: "0,3–2 Mrd €" },
      { id: "pe", label: "KGV", value: "< 15" },
      { id: "net-margin", label: "Nettomarge", value: "> 0 %" },
      { id: "sector", label: "Sektor", value: "ohne Finanzwerte" },
    ],
    rows: companies,
  },
]

export function screenById(id: string): SavedScreen | undefined {
  return screens.find((screen) => screen.id === id)
}
