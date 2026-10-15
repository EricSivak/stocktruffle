// Invented European small caps for the prototype. The first eight carry exactly the values
// of the approved mockup (docs/design/mockups-v2/02-screen-mit-agent.webp); the rest are
// generated so the screen has a realistic 47 hits. A few more appear only in the tracking
// and research mockups. None of these companies exist.
import { ARCHIVED, TRACKED_SINCE, YEAR_START, YEAR_TO_DATE } from "./anchors"
import { DAYS_PER_YEAR, yearIndex } from "./calendar"
import { priceSeries, seeded, type Anchor } from "./random"

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

const mockup: Seed[] = [
  {
    symbol: "SBG.ST",
    name: "Solberg Marine",
    country: "Sweden",
    exchange: "Stockholm",
    sector: "Industrials",
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
    country: "Germany",
    exchange: "Xetra",
    sector: "Industrials",
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
    country: "France",
    exchange: "Euronext Paris",
    sector: "Technology",
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
    country: "Netherlands",
    exchange: "Euronext Amsterdam",
    sector: "Industrials",
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
    country: "Austria",
    exchange: "Vienna",
    sector: "Industrials",
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
    country: "Italy",
    exchange: "Milan",
    sector: "Technology",
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
    country: "Denmark",
    exchange: "Copenhagen",
    sector: "Utilities",
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
    country: "Spain",
    exchange: "Madrid",
    sector: "Consumer",
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
  { country: "Germany", exchange: "Xetra", suffix: "DE", currency: "EUR" },
  {
    country: "France",
    exchange: "Euronext Paris",
    suffix: "PA",
    currency: "EUR",
  },
  {
    country: "Netherlands",
    exchange: "Euronext Amsterdam",
    suffix: "AS",
    currency: "EUR",
  },
  { country: "Italy", exchange: "Milan", suffix: "MI", currency: "EUR" },
  { country: "Spain", exchange: "Madrid", suffix: "MC", currency: "EUR" },
  { country: "Austria", exchange: "Vienna", suffix: "VI", currency: "EUR" },
  { country: "Sweden", exchange: "Stockholm", suffix: "ST", currency: "SEK" },
  {
    country: "Denmark",
    exchange: "Copenhagen",
    suffix: "CO",
    currency: "DKK",
  },
  { country: "Finland", exchange: "Helsinki", suffix: "HE", currency: "EUR" },
  { country: "Poland", exchange: "Warsaw", suffix: "WA", currency: "PLN" },
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
  { word: "Logistik", sector: "Industrials" },
  { word: "Systeme", sector: "Technology" },
  { word: "Pharma", sector: "Healthcare" },
  { word: "Energie", sector: "Utilities" },
  { word: "Bau", sector: "Industrials" },
  { word: "Chemie", sector: "Materials" },
  { word: "Elektronik", sector: "Technology" },
  { word: "Maschinen", sector: "Industrials" },
  { word: "Foods", sector: "Consumer" },
  { word: "Medical", sector: "Healthcare" },
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

/** Companies from the tracking and research mockups that are not in the screen. */
const others: Seed[] = [
  {
    symbol: "HBG.DE",
    name: "Hausberg Wohnbau",
    country: "Germany",
    exchange: "Xetra",
    sector: "Real estate",
    currency: "EUR",
    price: 18.3,
    dayChange: -0.004,
    marketCapEur: 0.7e9,
    pe: 9.4,
    revenueGrowth: -0.021,
    netMargin: 0.062,
    fcfYield: 0.054,
    dividendYield: 0.041,
    yearChange: -0.118,
  },
  {
    symbol: "LKS.HE",
    name: "Lakso Paper",
    country: "Finland",
    exchange: "Helsinki",
    sector: "Materials",
    currency: "EUR",
    price: 31.4,
    dayChange: 0.003,
    marketCapEur: 0.9e9,
    pe: 12.1,
    revenueGrowth: 0.034,
    netMargin: 0.071,
    fcfYield: 0.063,
    dividendYield: 0.038,
    yearChange: 0.052,
  },
  {
    symbol: "HVS.OL",
    name: "Halvard Systems",
    country: "Norway",
    exchange: "Oslo",
    sector: "Industrials",
    currency: "NOK",
    price: 214.6,
    dayChange: 0.014,
    marketCapEur: 1.4e9,
    pe: 18.4,
    revenueGrowth: 0.226,
    netMargin: 0.091,
    fcfYield: 0.032,
    dividendYield: 0.011,
    yearChange: 0.412,
  },
  {
    symbol: "OMA.DE",
    name: "Ostmark Avionik",
    country: "Germany",
    exchange: "Xetra",
    sector: "Industrials",
    currency: "EUR",
    price: 46.8,
    dayChange: -0.007,
    marketCapEur: 0.9e9,
    pe: 16.2,
    revenueGrowth: 0.174,
    netMargin: 0.083,
    fcfYield: 0.041,
    dividendYield: null,
    yearChange: 0.236,
  },
  {
    symbol: "BXO.MI",
    name: "Brixen Optik",
    country: "Italy",
    exchange: "Milan",
    sector: "Technology",
    currency: "EUR",
    price: 12.36,
    dayChange: 0.021,
    marketCapEur: 0.5e9,
    pe: 21.5,
    revenueGrowth: 0.288,
    netMargin: 0.064,
    fcfYield: 0.022,
    dividendYield: null,
    yearChange: 0.547,
  },
  {
    symbol: "TRL.PA",
    name: "Teralis",
    country: "France",
    exchange: "Euronext Paris",
    sector: "Industrials",
    currency: "EUR",
    price: 88.4,
    dayChange: 0.005,
    marketCapEur: 1.8e9,
    pe: 14.8,
    revenueGrowth: 0.121,
    netMargin: 0.097,
    fcfYield: 0.051,
    dividendYield: 0.019,
    yearChange: 0.168,
  },
]

/** The closes a stock's year must pass through, so derived changes match the mockups. */
function anchorsFor(seed: Seed): Anchor[] {
  const at = (date: string, value: number) => ({
    index: yearIndex(date),
    value,
  })
  const anchors: Anchor[] = [
    // Yesterday's close, so "today" on the stock page agrees with the series.
    { index: DAYS_PER_YEAR - 2, value: seed.price / (1 + seed.dayChange) },
  ]
  for (const tracked of TRACKED_SINCE) {
    if (tracked.symbol === seed.symbol)
      anchors.push(at(tracked.date, seed.price / (1 + tracked.change)))
  }
  for (const entry of ARCHIVED) {
    if (entry.symbol !== seed.symbol) continue
    const atArchive = seed.price / (1 + entry.since)
    anchors.push(at(entry.archivedAt, atArchive))
    anchors.push(at(entry.trackedAt, atArchive / (1 + entry.during)))
  }
  const sinceNewYear = YEAR_TO_DATE[seed.symbol]
  if (sinceNewYear !== undefined)
    anchors.push(at(YEAR_START, seed.price / (1 + sinceNewYear)))
  return anchors
}

function withYear(seed: Seed, index: number): Company {
  return {
    ...seed,
    year: priceSeries(
      index + 1,
      seed.price / (1 + seed.yearChange),
      seed.price,
      DAYS_PER_YEAR,
      0.018,
      anchorsFor(seed)
    ),
  }
}

/** The 47 hits of the screen "Europa Small Caps". */
export const companies: Company[] = [...mockup, ...generated(39)].map(withYear)

/** Every company the prototype knows, screen or not. */
export const allCompanies: Company[] = [
  ...companies,
  ...others.map((seed, index) => withYear(seed, companies.length + index)),
]

export function companyBySymbol(symbol: string): Company | undefined {
  return allCompanies.find((company) => company.symbol === symbol)
}
