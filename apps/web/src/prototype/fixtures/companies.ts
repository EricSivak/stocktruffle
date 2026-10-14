// Invented European small caps for the prototype. The first eight carry exactly the values
// of the approved mockup (docs/design/mockups-v2/02-screen-mit-agent.webp); the rest are
// generated so the screen has a realistic 47 hits. None of these companies exist.
import { priceSeries, seeded } from "./random"

export type Company = {
  symbol: string
  name: string
  country: string
  exchange: string
  sector: string
  currency: string
  price: number
  dayChange: number
  marketCapEur: number
  pe: number
  revenueGrowth: number
  netMargin: number
  fcfYield: number
  dividendYield: number | null
  yearChange: number
  /** Daily closes over one year, oldest first; the last one is `price`. */
  year: number[]
}

type Seed = Omit<Company, "year">

const DAYS_PER_YEAR = 250

const mockup: Seed[] = [
  {
    symbol: "SBG.ST",
    name: "Solberg Marine",
    country: "Schweden",
    exchange: "Stockholm",
    sector: "Industrie",
    currency: "SEK",
    price: 118.4,
    dayChange: 0.012,
    marketCapEur: 1.7e9,
    pe: 13.1,
    revenueGrowth: 0.21,
    netMargin: 0.094,
    fcfYield: 0.061,
    dividendYield: 0.022,
    yearChange: 0.284,
  },
  {
    symbol: "NWT.DE",
    name: "Nordwind Technik",
    country: "Deutschland",
    exchange: "Xetra",
    sector: "Industrie",
    currency: "EUR",
    price: 42.18,
    dayChange: -0.058,
    marketCapEur: 1.2e9,
    pe: 11.4,
    revenueGrowth: 0.182,
    netMargin: 0.081,
    fcfYield: 0.072,
    dividendYield: 0.024,
    yearChange: 0.064,
  },
  {
    symbol: "ALM.PA",
    name: "Altmeer Mesure",
    country: "Frankreich",
    exchange: "Euronext Paris",
    sector: "Technologie",
    currency: "EUR",
    price: 63.25,
    dayChange: 0.004,
    marketCapEur: 1.4e9,
    pe: 12.6,
    revenueGrowth: 0.157,
    netMargin: 0.112,
    fcfYield: 0.048,
    dividendYield: 0.015,
    yearChange: 0.191,
  },
  {
    symbol: "HLV.AS",
    name: "Helvoort Industries",
    country: "Niederlande",
    exchange: "Euronext Amsterdam",
    sector: "Industrie",
    currency: "EUR",
    price: 27.9,
    dayChange: 0.021,
    marketCapEur: 0.9e9,
    pe: 9.8,
    revenueGrowth: 0.125,
    netMargin: 0.067,
    fcfYield: 0.083,
    dividendYield: 0.031,
    yearChange: 0.142,
  },
  {
    symbol: "BRN.VI",
    name: "Brenner Kabel",
    country: "Österreich",
    exchange: "Wien",
    sector: "Industrie",
    currency: "EUR",
    price: 15.02,
    dayChange: -0.009,
    marketCapEur: 0.6e9,
    pe: 10.2,
    revenueGrowth: 0.111,
    netMargin: 0.058,
    fcfYield: 0.066,
    dividendYield: 0.035,
    yearChange: -0.087,
  },
  {
    symbol: "CRV.MI",
    name: "Corvara Sistemi",
    country: "Italien",
    exchange: "Mailand",
    sector: "Technologie",
    currency: "EUR",
    price: 8.64,
    dayChange: 0,
    marketCapEur: 0.4e9,
    pe: 7.9,
    revenueGrowth: 0.103,
    netMargin: 0.049,
    fcfYield: 0.091,
    dividendYield: null,
    yearChange: 0.118,
  },
  {
    symbol: "VDM.CO",
    name: "Vindmark",
    country: "Dänemark",
    exchange: "Kopenhagen",
    sector: "Versorger",
    currency: "DKK",
    price: 212,
    dayChange: 0.016,
    marketCapEur: 0.8e9,
    pe: 14.2,
    revenueGrowth: 0.096,
    netMargin: 0.123,
    fcfYield: 0.039,
    dividendYield: 0.028,
    yearChange: 0.163,
  },
  {
    symbol: "TRS.MC",
    name: "Torres Envases",
    country: "Spanien",
    exchange: "Madrid",
    sector: "Konsum",
    currency: "EUR",
    price: 19.76,
    dayChange: -0.003,
    marketCapEur: 1.1e9,
    pe: 12.9,
    revenueGrowth: 0.088,
    netMargin: 0.072,
    fcfYield: 0.057,
    dividendYield: 0.026,
    yearChange: -0.052,
  },
]

const MARKETS = [
  { country: "Deutschland", exchange: "Xetra", suffix: "DE", currency: "EUR" },
  {
    country: "Frankreich",
    exchange: "Euronext Paris",
    suffix: "PA",
    currency: "EUR",
  },
  {
    country: "Niederlande",
    exchange: "Euronext Amsterdam",
    suffix: "AS",
    currency: "EUR",
  },
  { country: "Italien", exchange: "Mailand", suffix: "MI", currency: "EUR" },
  { country: "Spanien", exchange: "Madrid", suffix: "MC", currency: "EUR" },
  { country: "Österreich", exchange: "Wien", suffix: "VI", currency: "EUR" },
  { country: "Schweden", exchange: "Stockholm", suffix: "ST", currency: "SEK" },
  {
    country: "Dänemark",
    exchange: "Kopenhagen",
    suffix: "CO",
    currency: "DKK",
  },
  { country: "Finnland", exchange: "Helsinki", suffix: "HE", currency: "EUR" },
  { country: "Polen", exchange: "Warschau", suffix: "WA", currency: "PLN" },
]
const STEMS = [
  "Arn",
  "Belm",
  "Calv",
  "Dorn",
  "Elm",
  "Falk",
  "Gran",
  "Hald",
  "Isen",
  "Korv",
  "Lind",
  "Marv",
  "Nord",
  "Ost",
  "Prav",
  "Rhen",
  "Sand",
  "Torv",
  "Varn",
  "West",
]
const ENDINGS = [
  "berg",
  "dal",
  "feld",
  "holm",
  "mark",
  "stein",
  "vik",
  "hafen",
  "lund",
  "au",
]
const KINDS = [
  { word: "Logistik", sector: "Industrie" },
  { word: "Systeme", sector: "Technologie" },
  { word: "Pharma", sector: "Gesundheit" },
  { word: "Energie", sector: "Versorger" },
  { word: "Bau", sector: "Industrie" },
  { word: "Chemie", sector: "Grundstoffe" },
  { word: "Elektronik", sector: "Technologie" },
  { word: "Maschinen", sector: "Industrie" },
  { word: "Foods", sector: "Konsum" },
  { word: "Medical", sector: "Gesundheit" },
]

function generated(count: number): Seed[] {
  const random = seeded(2026)
  const between = (min: number, max: number) => min + random() * (max - min)
  const round = (value: number, digits: number) => Number(value.toFixed(digits))
  const taken = new Set(mockup.map((company) => company.symbol))
  const companies: Seed[] = []
  for (let i = 0; companies.length < count; i++) {
    const stem = STEMS[Math.floor(random() * STEMS.length)]
    const ending = ENDINGS[Math.floor(random() * ENDINGS.length)]
    const kind = KINDS[Math.floor(random() * KINDS.length)]
    const market = MARKETS[i % MARKETS.length]
    const symbol = `${(stem + ending).slice(0, 3).toUpperCase()}.${market.suffix}`
    if (taken.has(symbol)) continue
    taken.add(symbol)
    // Lower growth than the eight mockup rows, so those stay on top of the default sort.
    companies.push({
      symbol,
      name: `${stem}${ending} ${kind.word}`,
      country: market.country,
      exchange: market.exchange,
      sector: kind.sector,
      currency: market.currency,
      price: round(between(4, 140), 2),
      dayChange: round(between(-0.03, 0.03), 3),
      marketCapEur: round(between(0.32, 1.95), 2) * 1e9,
      pe: round(between(6.2, 14.9), 1),
      revenueGrowth: round(between(-0.04, 0.087), 3),
      netMargin: round(between(0.02, 0.15), 3),
      fcfYield: round(between(0.02, 0.1), 3),
      dividendYield: random() < 0.25 ? null : round(between(0.01, 0.045), 3),
      yearChange: round(between(-0.25, 0.35), 3),
    })
  }
  return companies
}

export const companies: Company[] = [...mockup, ...generated(39)].map(
  (company, index) => ({
    ...company,
    year: priceSeries(
      index + 1,
      company.price / (1 + company.yearChange),
      company.price,
      DAYS_PER_YEAR
    ),
  })
)

export function companyBySymbol(symbol: string): Company | undefined {
  return companies.find((company) => company.symbol === symbol)
}
