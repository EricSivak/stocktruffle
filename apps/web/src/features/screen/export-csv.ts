// CSV for spreadsheets: commas, decimal points, and a byte order mark so accented names survive.
export type CsvColumn<Row> = {
  header: string
  value: (row: Row) => string | number | null
}

const BYTE_ORDER_MARK = String.fromCharCode(0xfeff)

const LOCALE_NUMBER = new Intl.NumberFormat("en-GB", {
  useGrouping: false,
  maximumFractionDigits: 6,
})

function cell(value: string | number | null): string {
  if (value === null) return ""
  const text = typeof value === "number" ? LOCALE_NUMBER.format(value) : value
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv<Row>(rows: Row[], columns: CsvColumn<Row>[]): string {
  const lines = [
    columns.map((column) => cell(column.header)).join(","),
    ...rows.map((row) =>
      columns.map((column) => cell(column.value(row))).join(",")
    ),
  ]
  return `${BYTE_ORDER_MARK}${lines.join("\r\n")}\r\n`
}

export function downloadCsv(fileName: string, csv: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  )
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
