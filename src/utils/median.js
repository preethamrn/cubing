function median(values) {
  if (values.length === 0) return Number.NaN
  const middle = Math.floor(values.length / 2)
  if (values.length % 2 === 1) return values[middle]
  return (values[middle - 1] + values[middle]) / 2
}

/** Parse a csTimer JSON export and return the median of each session's latest 25 solves. */
export function parseMedianResults(text, solveCount = 25) {
  const data = JSON.parse(text)

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('The file must contain a csTimer JSON object.')
  }

  const sessionDataValue = data.properties?.sessionData
  if (sessionDataValue === undefined) {
    throw new Error('The file is missing session information.')
  }

  const sessionData = typeof sessionDataValue === 'string'
    ? JSON.parse(sessionDataValue)
    : sessionDataValue

  if (!sessionData || typeof sessionData !== 'object' || Array.isArray(sessionData)) {
    throw new Error('The session information is invalid.')
  }

  const results = []

  for (const [key, solves] of Object.entries(data)) {
    if (key === 'properties') continue

    const match = key.match(/^session(\d+)$/)
    if (!match) throw new Error(`Unexpected session key: ${key}`)
    if (!Array.isArray(solves)) throw new Error(`Session ${match[1]} does not contain a solve list.`)

    const recentSolves = solves.slice(-solveCount).map((solve, index) => {
      const result = solve?.[0]
      if (!Array.isArray(result) || result.length < 2) {
        throw new Error(`A solve in session ${match[1]} has an invalid format (solve ${index + 1}).`)
      }

      const [penalty, time] = result
      if (penalty === -1) return Number.POSITIVE_INFINITY
      if (typeof penalty !== 'number' || typeof time !== 'number') {
        throw new Error(`A solve in session ${match[1]} has an invalid time (solve ${index + 1}).`)
      }

      // csTimer stores solve durations in milliseconds and +2 penalties in milliseconds.
      return Math.floor((time + penalty) / 10)
    })

    if (recentSolves.length === 0) continue

    recentSolves.sort((a, b) => a - b)
    const sessionId = Number(match[1])
    const session = sessionData[match[1]]

    results.push({
      num: sessionId,
      name: session?.name || `Session ${sessionId}`,
      value: median(recentSolves) / 100,
      solveCount: recentSolves.length,
    })
  }

  return results.sort((a, b) => b.num - a.num)
}
