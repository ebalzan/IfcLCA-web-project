function sortByDate<T extends { timestamp: Date }>(array: T[]) {
  return array.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

export default sortByDate
