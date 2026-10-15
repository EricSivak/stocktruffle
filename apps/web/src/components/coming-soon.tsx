import { PageHeader } from "@/components/page-header"

/** Placeholder for pages of the prototype that later steps of docs/PROTOTYP.md build. */
export function ComingSoon({
  title,
  step,
  children,
}: {
  title: string
  step: number
  children?: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-5xl px-8 pt-10">
      <PageHeader title={title} />
      <p className="mt-3 text-muted-foreground">
        This page arrives in step {step} of the prototype.
      </p>
      {children}
    </div>
  )
}
