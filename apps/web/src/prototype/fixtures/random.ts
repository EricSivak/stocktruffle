// Repeatable randomness for the prototype's invented data: same seed, same numbers.

export function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** A point a series must pass through exactly, by position. */
export type Anchor = { index: number; value: number }

/**
 * A price path of `length` points from `start` to exactly `end`: a random walk in log
 * space, bent so it lands on the target and on every anchor in between. The bend is spread
 * linearly between neighbouring fixed points, so the path keeps its texture.
 */
export function priceSeries(
  seed: number,
  start: number,
  end: number,
  length: number,
  volatility = 0.018,
  anchors: Anchor[] = []
): number[] {
  const random = seeded(seed)
  const walk = [0]
  for (let i = 1; i < length; i++) {
    walk.push(walk[i - 1] + (random() - 0.5) * 2 * volatility)
  }

  const fixed = [
    { index: 0, value: start },
    ...anchors.filter(
      (anchor) => anchor.index > 0 && anchor.index < length - 1
    ),
    { index: length - 1, value: end },
  ].sort((a, b) => a.index - b.index)
  // How far the walk misses each fixed point, in log space.
  const misses = fixed.map(
    ({ index, value }) => Math.log(value / start) - walk[index]
  )

  return walk.map((step, i) => {
    const right = fixed.findIndex((point) => point.index >= i)
    if (fixed[right].index === i) return start * Math.exp(step + misses[right])
    const left = right - 1
    const share =
      (i - fixed[left].index) / (fixed[right].index - fixed[left].index)
    const correction = misses[left] + (misses[right] - misses[left]) * share
    return start * Math.exp(step + correction)
  })
}
