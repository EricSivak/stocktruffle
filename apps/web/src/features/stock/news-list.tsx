import { formatDate } from "@/lib/format"
import type { NewsItem } from "@/prototype/fixtures/stock"

/** Headlines only, with source and date; no pictures, no teasers. */
export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <section aria-labelledby="news">
      <h2 id="news" className="border-b pb-2 text-[15px] font-medium">
        Nachrichten
      </h2>
      {items.length ? (
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.title} className="py-2.5">
              <p className="text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.source} · {formatDate(item.date, { year: true })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-3 text-muted-foreground">
          Keine Nachrichten in den letzten 30 Tagen.
        </p>
      )}
    </section>
  )
}
