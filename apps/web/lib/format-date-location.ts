export const formatDateLocationRange = (start: string, end: string, city: string, state: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const startFormatted = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  if (startDate.toDateString() === endDate.toDateString()) {
    return `${startFormatted} in ${city}, ${state}`
  }

  const endDay = endDate.toLocaleDateString('en-US', {
    day: 'numeric',
  })

  // Check if same month
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startFormatted}-${endDay} in ${city}, ${state}`
  }

  // Different months
  const endFormatted = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${startFormatted} - ${endFormatted} in ${city}, ${state}`
}