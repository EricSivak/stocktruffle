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
    text: "Wirf Finanzwerte raus und sortier nach Wachstum.",
  },
  { kind: "steps", text: "Screen angepasst · 2 Änderungen", undoable: true },
  { kind: "question", text: "Warum ist Nordwind so günstig?" },
  { kind: "steps", text: "Kennzahlen geladen · 4 Quellen gelesen" },
  {
    kind: "answer",
    parts: [
      "Der Markt preist das Ende eines Großauftrags 2027 ein.",
      { footnote: 1 },
      " Die Marge ist seit drei Quartalen stabil,",
      { footnote: 2 },
      " und das Management hat die Prognose im August bestätigt.",
      { footnote: 3 },
    ],
  },
  {
    kind: "sources",
    items: [
      { n: 1, title: "Branchenbericht", detail: "12.09.2026" },
      { n: 2, title: "Quartalsbericht Q2" },
      { n: 3, title: "Pressemitteilung", detail: "07.08.2026" },
    ],
  },
]
