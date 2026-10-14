import { cn } from "cn"

/**
 * Serif title like a newspaper section heading, gray meta text on the same baseline, and on
 * the right the page's actions: text buttons and at most one primary button.
 */
export function PageHeader({
  title,
  meta,
  actions,
  className,
}: {
  title: string
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
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
