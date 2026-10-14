import { describe, expect, it } from "vitest"

import { toCsv } from "@/features/screen/export-csv"

type Row = { name: string; price: number; pe: number | null }

const columns = [
  { header: "Unternehmen", value: (row: Row) => row.name },
  { header: "Kurs", value: (row: Row) => row.price },
  { header: "KGV", value: (row: Row) => row.pe },
]

describe("toCsv", () => {
  it("writes semicolons, decimal commas and a byte order mark", () => {
    const csv = toCsv(
      [{ name: "Nordwind Technik", price: 42.18, pe: 11.4 }],
      columns
    )
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv.slice(1)).toBe(
      "Unternehmen;Kurs;KGV\r\nNordwind Technik;42,18;11,4\r\n"
    )
  })

  it("leaves missing values empty instead of writing zero", () => {
    expect(
      toCsv([{ name: "Vindmark", price: 212, pe: null }], columns)
    ).toContain("Vindmark;212;\r\n")
  })

  it("quotes text that contains separators or quotes", () => {
    const csv = toCsv(
      [{ name: 'Torres "Envases"; S.A.', price: 1, pe: 1 }],
      columns
    )
    expect(csv).toContain('"Torres ""Envases""; S.A.";1;1')
  })

  it("keeps large numbers without thousands separators", () => {
    expect(toCsv([{ name: "X", price: 1700000000, pe: 1 }], columns)).toContain(
      "X;1700000000;1"
    )
  })
})
