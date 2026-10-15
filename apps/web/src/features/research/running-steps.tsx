import { useEffect, useEffectEvent, useState } from "react"
import { cn } from "cn"

import { formatClock } from "@/lib/format"
import { runningSteps } from "@/prototype/fixtures/research"

// When each step finishes, in seconds since the question; the prototype only plays them.
const FINISHED_AT = [1, 4, 9, 17]
const STEP_DELAY = 800

/**
 * The research at work, as the prototype plays it: steps appear one after another with the
 * time they finished, then the note that answers arrive with the real agent.
 */
export function RunningSteps({ onDone }: { onDone?: () => void }) {
  const [done, setDone] = useState(0)
  const finish = useEffectEvent(() => onDone?.())

  useEffect(() => {
    if (done >= runningSteps.length) {
      finish()
      return
    }
    const timer = window.setTimeout(() => setDone((n) => n + 1), STEP_DELAY)
    return () => window.clearTimeout(timer)
  }, [done])

  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <ol className="flex flex-col gap-1 text-xs">
        {runningSteps.map((step, index) =>
          index > done ? null : (
            <li
              key={step}
              className={cn(
                "flex max-w-md justify-between gap-6",
                index === done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span>
                {step}
                {index === done && " …"}
              </span>
              {index < done && (
                <span className="tabular-nums">
                  {formatClock(FINISHED_AT[index])}
                </span>
              )}
            </li>
          )
        )}
      </ol>
      {done >= runningSteps.length && (
        <p className="text-xs text-muted-foreground">
          Answer arrives in phase 3
        </p>
      )}
    </div>
  )
}
