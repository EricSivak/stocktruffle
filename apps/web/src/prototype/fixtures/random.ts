// Repeatable randomness for the prototype's invented data: same seed, same numbers.

export function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

/**
 * A price path of `length` points from `start` to exactly `end`: a random walk in log
 * space, bent so its last point lands on the target.
 */
export function priceSeries(
  seed: number,
  start: number,
  end: number,
  length: number,
  volatility = 0.018
): number[] {
  const random = seeded(seed)
  const walk = [0]
  for (let i = 1; i < length; i++) {
    walk.push(walk[i - 1] + (random() - 0.5) * 2 * volatility)
  }
  const correction = Math.log(end / start) - walk[length - 1]
  return walk.map(
    (step, i) => start * Math.exp(step + (correction * i) / (length - 1))
  )
}
