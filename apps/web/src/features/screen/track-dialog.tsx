import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Company } from "@/prototype/fixtures/companies"
import type { Origin } from "@/prototype/fixtures/tracking"
import { tracking } from "@/prototype/tracking-store"

const SUGGESTIONS = [
  "Interesting when the P/E falls below 10",
  "Interesting when insiders buy",
]

/** Track a stock: the thesis is optional, signals can be picked from suggestions. */
export function TrackDialog({
  company,
  origin = null,
  onClose,
}: {
  company: Company | null
  /** Where the idea came from, shown on the tracking page. */
  origin?: Origin | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string[]>([])

  return (
    <Dialog open={company !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {company && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              const thesis = new FormData(event.currentTarget).get("thesis")
              tracking.track(company, {
                thesis: typeof thesis === "string" ? thesis.trim() : "",
                signals: picked,
                origin,
              })
              onClose()
              setPicked([])
              toast(`Tracking ${company.name}`, {
                action: {
                  label: "Go to tracking",
                  onClick: () => void navigate({ to: "/tracking" }),
                },
              })
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-[15px] font-medium">
                Track
              </DialogTitle>
              <DialogDescription>
                {company.name} <span className="text-xs">{company.symbol}</span>
              </DialogDescription>
            </DialogHeader>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Why? (optional)
              </span>
              <Textarea
                name="thesis"
                rows={3}
                placeholder="Cheap because …"
                className="font-serif text-[15px]"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Signals (not checked yet)
              </span>
              <ul className="flex flex-col gap-1">
                {SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={picked.includes(suggestion)}
                        onChange={() =>
                          setPicked((items) =>
                            items.includes(suggestion)
                              ? items.filter((item) => item !== suggestion)
                              : [...items, suggestion]
                          )
                        }
                        className="accent-foreground"
                      />
                      {suggestion}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <DialogFooter className="mx-0 mb-0 items-center gap-5 border-0 p-0">
              <Button variant="plain" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Track</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
