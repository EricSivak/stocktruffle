import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "cn"

type Sorted = false | "asc" | "desc"

/** The `aria-sort` value for a column header. */
export function ariaSort(sorted: Sorted) {
  if (sorted === "asc") return "ascending"
  if (sorted === "desc") return "descending"
  return undefined
}

/** A column title that sorts on click; the active one turns ink and shows its direction. */
export function SortButton({
  sorted,
  onClick,
  children,
}: {
  sorted: Sorted
  onClick?: (event: unknown) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground",
        sorted && "text-foreground"
      )}
    >
      {children}
      {sorted === "desc" && (
        <ArrowDownIcon className="size-3" aria-hidden="true" />
      )}
      {sorted === "asc" && (
        <ArrowUpIcon className="size-3" aria-hidden="true" />
      )}
    </button>
  )
}
