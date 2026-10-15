import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RHYTHMS, type Rhythm } from "@/prototype/fixtures/tracking"

/** How often a signal would be checked, once checking exists. */
export function RhythmSelect({
  value,
  onChange,
  className,
}: {
  value: Rhythm
  onChange: (rhythm: Rhythm) => void
  className?: string
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => next && onChange(next as Rhythm)}
    >
      <SelectTrigger aria-label="Rhythm" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RHYTHMS.map((rhythm) => (
          <SelectItem key={rhythm} value={rhythm}>
            {rhythm}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
