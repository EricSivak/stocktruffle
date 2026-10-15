// The agent conversation shown next to the screen in the approved mockup.
export type Source = { n: number; title: string; detail?: string }

export type ThreadItem =
  | { kind: "question"; text: string }
  | { kind: "steps"; text: string; undoable?: boolean }
  | { kind: "answer"; parts: (string | { footnote: number })[] }
  | { kind: "sources"; items: Source[] }
  | { kind: "pending"; text: string }

export const screenThread: ThreadItem[] = [
  {
    kind: "question",
    text: "Drop financials and sort by growth.",
  },
  { kind: "steps", text: "Screen changed · 2 edits", undoable: true },
  { kind: "question", text: "Why is Nordwind so cheap?" },
  { kind: "steps", text: "Figures loaded · 4 sources read" },
  {
    kind: "answer",
    parts: [
      "The market is pricing in the end of a major contract in 2027.",
      { footnote: 1 },
      " The margin has held steady for three quarters,",
      { footnote: 2 },
      " and management confirmed its guidance in August.",
      { footnote: 3 },
    ],
  },
  {
    kind: "sources",
    items: [
      { n: 1, title: "Industry report", detail: "12/09/2026" },
      { n: 2, title: "Q2 quarterly report" },
      { n: 3, title: "Press release", detail: "07/08/2026" },
    ],
  },
]
