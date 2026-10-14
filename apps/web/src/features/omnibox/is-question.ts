// The start page sends questions to research and everything else to a screen. In the
// prototype a question is text ending in "?" or opening with a question word. "Wie" alone is
// not one: "Wie ASML, nur kleiner" describes stocks, it does not ask about them.

const QUESTION_WORDS = new Set([
  "warum",
  "wieso",
  "weshalb",
  "was",
  "wer",
  "wen",
  "wem",
  "wessen",
  "welche",
  "welcher",
  "welches",
  "welchen",
  "welchem",
  "wo",
  "wann",
  "woher",
  "wohin",
  "wozu",
  "womit",
])

export function isQuestion(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.endsWith("?")) return true
  const first = trimmed.split(/[\s,]+/)[0]?.toLowerCase() ?? ""
  return QUESTION_WORDS.has(first)
}
