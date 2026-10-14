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

const SUGGESTIONS = [
  "Interessant, wenn das KGV unter 10 fällt",
  "Interessant, wenn Insider kaufen",
]

/** Track a stock: the thesis is optional, signals can be picked from suggestions. */
export function TrackDialog({
  company,
  onClose,
}: {
  company: Company | null
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
              onClose()
              setPicked([])
              toast(`${company.name} wird getrackt`, {
                action: {
                  label: "Zum Tracking",
                  onClick: () => void navigate({ to: "/tracking" }),
                },
              })
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-[15px] font-medium">
                Tracken
              </DialogTitle>
              <DialogDescription>
                {company.name} <span className="text-xs">{company.symbol}</span>
              </DialogDescription>
            </DialogHeader>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Warum? (optional)
              </span>
              <Textarea
                name="thesis"
                rows={3}
                placeholder="Günstig, weil …"
                className="font-serif text-[15px]"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Signale (werden noch nicht geprüft)
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
                Abbrechen
              </Button>
              <Button type="submit">Tracken</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
