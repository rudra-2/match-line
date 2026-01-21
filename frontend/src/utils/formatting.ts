export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-700'
  if (score >= 60) return 'text-blue-700'
  if (score >= 40) return 'text-yellow-700'
  return 'text-red-700'
}

export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-50'
  if (score >= 60) return 'bg-blue-50'
  if (score >= 40) return 'bg-yellow-50'
  return 'bg-red-50'
}

export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const truncate = (text: string, length: number = 100): string => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
