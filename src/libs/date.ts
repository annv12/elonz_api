export function generateDayInterval(numberOfDay: number = 7) {
  const today = new Date()
  const dayInterval = []
  for (let i = 0; i < numberOfDay; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dayInterval.push(date)
  }
  return dayInterval
}
