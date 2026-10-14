import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { Lockup } from "@/components/brand/logo"
import { SearchField } from "@/features/omnibox/search-field"

export const Route = createFileRoute("/_app/")({ component: Start })

// Interim start page; the designed one (examples, briefing, market line) comes in step 3.
function Start() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center px-6 pt-[30vh]">
      <Lockup size={56} />
      <SearchField
        size="large"
        autoFocus
        className="mt-8"
        onSubmit={() =>
          void navigate({
            to: "/screens/$screenId",
            params: { screenId: "europa-small-caps" },
            viewTransition: true,
          })
        }
      />
    </div>
  )
}
