import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { Lockup } from "@/components/brand/logo"
import { isQuestion } from "@/features/omnibox/is-question"
import { SearchField } from "@/features/omnibox/search-field"
import { BriefingList } from "@/features/start/briefing-list"
import { MarketStatus } from "@/features/start/market-status"
import { briefing, searchExamples } from "@/prototype/fixtures/briefing"

export const Route = createFileRoute("/_app/")({ component: Start })

function Start() {
  const navigate = useNavigate()
  // Questions go to research, descriptions of stocks become a screen.
  const search = (text: string) =>
    isQuestion(text)
      ? void navigate({
          to: "/recherche/$id",
          params: { id: "neu" },
          search: { frage: text },
        })
      : void navigate({
          to: "/screens/$screenId",
          params: { screenId: "neu" },
          search: { q: text },
          viewTransition: true,
        })

  return (
    // The start page is one screen: it never scrolls.
    <div className="relative flex h-full flex-col overflow-hidden px-8">
      <MarketStatus className="absolute top-6 right-8 text-xs text-muted-foreground" />

      <div className="mx-auto flex w-full max-w-[640px] flex-col pt-[14vh]">
        <Lockup size={56} className="self-center" />
        <SearchField
          size="large"
          autoFocus
          className="mt-10"
          onSubmit={search}
        />
        <ul className="mt-4 flex flex-col items-start gap-1.5">
          {searchExamples.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => search(example)}
                className="text-left text-muted-foreground hover:text-foreground"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
        <BriefingList items={briefing} className="mt-14" />
      </div>
    </div>
  )
}
