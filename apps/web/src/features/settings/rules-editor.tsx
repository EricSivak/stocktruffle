import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { rulesStore, useRules } from "@/prototype/rules-store"

/** Standing rules every screen applies; the screens' "My rules" popover shows the same list. */
export function RulesEditor() {
  const rules = useRules()
  const [text, setText] = useState("")

  return (
    <div className="flex flex-col gap-3">
      {rules.length > 0 && (
        <ul className="flex flex-col">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center gap-3 border-b py-2 first:pt-0"
            >
              <Switch
                id={`setting-${rule.id}`}
                checked={rule.active}
                onCheckedChange={() => rulesStore.toggle(rule.id)}
              />
              <label
                htmlFor={`setting-${rule.id}`}
                className={
                  rule.active ? "text-foreground" : "text-muted-foreground"
                }
              >
                {rule.text}
              </label>
              <Button
                variant="plain"
                className="ml-auto text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const undo = rulesStore.remove(rule.id)
                  if (undo)
                    toast("Rule removed", {
                      action: { label: "Undo", onClick: undo },
                    })
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="max-w-sm"
        onSubmit={(event) => {
          event.preventDefault()
          if (!text.trim()) return
          rulesStore.add(text.trim())
          setText("")
        }}
      >
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a rule, e.g. no banks"
          aria-label="New rule"
        />
      </form>
    </div>
  )
}
