export const parseIndicator = (indicatorString: string): number => {
  if (!indicatorString) return 0

  const match = indicatorString.match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 0
}

export const parseDensity = (densityString: string): number => {
  if (!densityString) return 0

  const match = densityString.match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 0
}
