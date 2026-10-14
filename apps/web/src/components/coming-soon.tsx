import { PageHeader } from "@/components/page-header"

/** Placeholder for pages of the prototype that later steps of docs/PROTOTYP.md build. */
export function ComingSoon({ title, step }: { title: string; step: number }) {
  return (
    <div className="mx-auto max-w-5xl px-8 pt-10">
      <PageHeader title={title} />
      <p className="mt-3 text-muted-foreground">
        Diese Seite entsteht in Schritt {step} des Prototyps.
      </p>
    </div>
  )
}
