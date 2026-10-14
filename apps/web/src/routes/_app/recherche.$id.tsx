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

export const Route = createFileRoute("/_app/recherche/$id")({
  // /recherche/neu?frage=… plays a new research; any other id is a finished one.
  validateSearch: (search: Record<string, unknown>): { frage?: string } =>
    typeof search.frage === "string" ? { frage: search.frage } : {},
  loader: ({ params }) => {
    if (params.id === "neu") return null
    const research = researchById(params.id)
    if (!research) throw notFound()
    return research
  },
  component: ResearchRoute,
})

function ResearchRoute() {
  const research = Route.useLoaderData()
  const { frage } = Route.useSearch()
  return research ? (
    <FinishedResearch key={research.id} research={research} />
  ) : (
    <NewResearch key={frage ?? ""} question={frage ?? ""} />
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
            <StepLine>Antwort folgt in Phase 3</StepLine>
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
      toast("Alle vier Titel sind schon im Tracking")
      return
    }
    toast(`${undos.length} Titel werden getrackt`, {
      action: {
        label: "Rückgängig",
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
        meta={`Recherche · abgeschlossen · ${research.sources.length} Quellen · ${formatDuration(research.durationSeconds)}`}
        actions={
          <>
            <Button
              variant="plain"
              onClick={() =>
                void navigate({
                  to: "/screens/$screenId",
                  params: { screenId: "ruestungszulieferer" },
                })
              }
            >
              Als Screen öffnen
            </Button>
            <Button
              onClick={() =>
                toast("Als Memo gespeichert", {
                  description:
                    "Die Memo-Ansicht kommt in einer späteren Phase.",
                })
              }
            >
              Als Memo speichern
            </Button>
          </>
        }
      />

      <Question className="mt-8 text-[15px]">{research.question}</Question>
      <Collapsible className="mt-3">
        <p className="text-xs text-muted-foreground">
          {research.summary} ·{" "}
          <CollapsibleTrigger className="text-foreground underline underline-offset-3 hover:decoration-2">
            Schritte anzeigen
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
          Alle tracken
        </button>
        <button
          type="button"
          onClick={() =>
            toast("In das Memo übernommen", {
              description: "Die Memo-Ansicht kommt in einer späteren Phase.",
            })
          }
          className="underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          In Memo übernehmen
        </button>
      </p>

      <p className="mt-8 border-t pt-5">
        <span className="font-medium">Nicht belegt:</span>{" "}
        <span className="text-muted-foreground">{research.unverified}</span>
      </p>

      <FollowUps placeholder="Nachfragen" />
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
        title="Neue Recherche"
        meta={
          question === ""
            ? "Recherche · noch keine Frage"
            : running
              ? "Recherche · läuft"
              : "Recherche · Antwort folgt in Phase 3"
        }
      />
      {question !== "" && (
        <div className="mt-8 flex flex-col gap-3">
          <Question className="text-[15px]">{question}</Question>
          <RunningSteps onDone={() => setRunning(false)} />
        </div>
      )}
      <FollowUps
        placeholder={question === "" ? "Was willst du wissen?" : "Nachfragen"}
      />
    </ResearchLayout>
  )
}
