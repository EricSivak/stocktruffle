import { useState } from "react"
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Composer } from "@/features/agent/composer"
import { Prose, Question, StepLine } from "@/features/agent/thread"
import { ResearchTable } from "@/features/research/research-table"
import { RunningSteps } from "@/features/research/running-steps"
import {
  SourcesColumn,
  VISIBLE_SOURCES,
} from "@/features/research/sources-column"
import { formatDuration } from "@/lib/format"
import { AS_OF_DATE } from "@/prototype/fixtures/calendar"
import { companyBySymbol } from "@/prototype/fixtures/companies"
import { researchById, type Research } from "@/prototype/fixtures/research"
import { tracking } from "@/prototype/tracking-store"

export const Route = createFileRoute("/_app/research/$id")({
  // /research/new?q=… plays a new research; any other id is a finished one.
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" ? { q: search.q } : {},
  loader: ({ params }) => {
    if (params.id === "new") return null
    const research = researchById(params.id)
    if (!research) throw notFound()
    return research
  },
  component: ResearchRoute,
})

function ResearchRoute() {
  const research = Route.useLoaderData()
  const { q } = Route.useSearch()
  return research ? (
    <FinishedResearch key={research.id} research={research} />
  ) : (
    <NewResearch key={q ?? ""} question={q ?? ""} />
  )
}

/** A reading column and, beside it behind a hairline, the sources. */
function ResearchLayout({
  children,
  aside,
}: {
  children: React.ReactNode
  aside: React.ReactNode
}) {
  return (
    <div className="grid min-h-full grid-cols-[minmax(0,1fr)_340px]">
      <article className="mx-auto w-full max-w-[840px] px-10 pt-8 pb-16">
        {children}
      </article>
      <div className="border-l">
        <div className="sticky top-0 max-h-svh overflow-y-auto px-7 pt-9 pb-10">
          {aside}
        </div>
      </div>
    </div>
  )
}

type FollowUp = { id: number; text: string; research: boolean }

/** Questions asked after the research; the prototype plays the work, answers come later. */
function FollowUps({
  placeholder,
  initialResearch = true,
}: {
  placeholder: string
  initialResearch?: boolean
}) {
  const [items, setItems] = useState<FollowUp[]>([])
  const [research, setResearch] = useState(initialResearch)
  return (
    <>
      {items.map((item) => (
        <div key={item.id} className="mt-8 flex flex-col gap-3">
          <Question className="text-[15px]">{item.text}</Question>
          {item.research ? (
            <RunningSteps />
          ) : (
            <StepLine>Answer arrives in phase 3</StepLine>
          )}
        </div>
      ))}
      <div className="mt-8">
        <Composer
          placeholder={placeholder}
          research={research}
          onResearchChange={setResearch}
          onSubmit={(text) =>
            setItems((current) => [
              ...current,
              { id: current.length, text, research },
            ])
          }
        />
      </div>
    </>
  )
}

function FinishedResearch({ research }: { research: Research }) {
  const navigate = useNavigate()
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [allSources, setAllSources] = useState(false)

  const trackAll = () => {
    const undos = research.rows.flatMap((row) => {
      const company = companyBySymbol(row.symbol)
      const undo =
        company &&
        tracking.track(company, {
          origin: {
            kind: "research",
            title: research.title,
            date: AS_OF_DATE,
            to: { researchId: research.id },
          },
        })
      return undo ? [undo] : []
    })
    if (undos.length === 0) {
      toast("All four stocks are already tracked")
      return
    }
    toast(`Tracking ${undos.length} stocks`, {
      action: {
        label: "Undo",
        onClick: () => undos.forEach((undo) => undo()),
      },
    })
  }

  return (
    <ResearchLayout
      aside={
        <SourcesColumn
          sources={research.sources}
          highlighted={highlighted}
          open={allSources}
          onOpenChange={setAllSources}
        />
      }
    >
      <PageHeader
        stacked
        title={research.title}
        meta={`Research · finished · ${research.sources.length} sources · ${formatDuration(research.durationSeconds)}`}
        actions={
          <>
            <Button
              variant="plain"
              onClick={() =>
                void navigate({
                  to: "/screens/$screenId",
                  params: { screenId: "defence-suppliers" },
                })
              }
            >
              Open as screen
            </Button>
            <Button
              onClick={() =>
                toast("Saved as memo", {
                  description: "Memos arrive in a later phase.",
                })
              }
            >
              Save as memo
            </Button>
          </>
        }
      />

      <Question className="mt-8 text-[15px]">{research.question}</Question>
      <Collapsible className="mt-3">
        <p className="text-xs text-muted-foreground">
          {research.summary} ·{" "}
          <CollapsibleTrigger className="text-foreground underline underline-offset-3 hover:decoration-2">
            Show steps
          </CollapsibleTrigger>
        </p>
        <CollapsibleContent>
          <ol className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
            {research.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="w-3 shrink-0 tabular-nums">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-6 border-t pt-7">
        <h2 className="font-serif text-2xl leading-tight">
          {research.heading}
        </h2>
        <Prose
          size="reading"
          className="mt-3"
          parts={research.answer}
          sources={research.sources}
          onFootnote={(n) => {
            setHighlighted(n)
            if (n > VISIBLE_SOURCES) setAllSources(true)
          }}
        />
      </div>

      <div className="mt-6">
        <ResearchTable rows={research.rows} />
      </div>
      <p className="mt-4 flex gap-6">
        <button
          type="button"
          onClick={trackAll}
          className="underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          Track all
        </button>
        <button
          type="button"
          onClick={() =>
            toast("Added to memo", {
              description: "Memos arrive in a later phase.",
            })
          }
          className="underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          Add to memo
        </button>
      </p>

      <p className="mt-8 border-t pt-5">
        <span className="font-medium">Not verified:</span>{" "}
        <span className="text-muted-foreground">{research.unverified}</span>
      </p>

      <FollowUps placeholder="Follow up" />
    </ResearchLayout>
  )
}

function NewResearch({ question }: { question: string }) {
  const [running, setRunning] = useState(question !== "")
  return (
    <ResearchLayout
      aside={
        <SourcesColumn
          sources={[]}
          highlighted={null}
          open={false}
          onOpenChange={() => undefined}
        />
      }
    >
      <PageHeader
        stacked
        title="New research"
        meta={
          question === ""
            ? "Research · no question yet"
            : running
              ? "Research · running"
              : "Research · answer arrives in phase 3"
        }
      />
      {question !== "" && (
        <div className="mt-8 flex flex-col gap-3">
          <Question className="text-[15px]">{question}</Question>
          <RunningSteps onDone={() => setRunning(false)} />
        </div>
      )}
      <FollowUps
        placeholder={
          question === "" ? "What do you want to know?" : "Follow up"
        }
      />
    </ResearchLayout>
  )
}
