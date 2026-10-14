import { cn } from "cn"

/**
 * Serif title like a newspaper section heading, gray meta text on the same baseline, and on
 * the right the page's actions: text buttons and at most one primary button. Long titles
 * stack the meta text underneath instead.
 */
export function PageHeader({
  title,
  meta,
  actions,
  stacked = false,
  className,
}: {
  title: string
  meta?: React.ReactNode
  actions?: React.ReactNode
  stacked?: boolean
  className?: string
}) {
  if (stacked) {
    return (
      <header className={cn("flex items-start gap-8", className)}>
        <div className="min-w-0">
          <h1 className="title">{title}</h1>
          {meta && (
            <p className="mt-1.5 text-xs text-muted-foreground">{meta}</p>
          )}
        </div>
        {actions && (
          <div className="ml-auto flex shrink-0 items-center gap-5 pt-1.5">
            {actions}
          </div>
        )}
      </header>
    )
  }
  return (
    <header className={cn("flex items-baseline gap-4", className)}>
      <h1 className="title">{title}</h1>
      {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
      {actions && (
        <div className="ml-auto flex items-center gap-5 self-center">
          {actions}
        </div>
      )}
    </header>
  )
}
