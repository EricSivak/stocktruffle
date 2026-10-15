// The start page sends questions to research and everything else to a screen. In the
// prototype a question is text ending in "?" or opening with a question word or an auxiliary
// verb ("Is Nordwind cheap"). "Like ASML, only smaller" describes stocks, it asks nothing.

const QUESTION_WORDS = new Set([
  "why",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "where",
  "when",
  "how",
  "is",
  "are",
  "was",
  "were",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "will",
  "would",
])

export function isQuestion(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.endsWith("?")) return true
  const first = trimmed.split(/[\s,]+/)[0]?.toLowerCase() ?? ""
  return QUESTION_WORDS.has(first)
}
