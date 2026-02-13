import { format, formatDistanceToNow, isToday, isYesterday, isThisYear } from 'date-fns'

export const formatBlogDate = (dateString) => {
  const date = new Date(dateString)
  
  // If less than 7 days ago, show relative time
  const now = new Date()
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 7) {
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true }) // "1 hour ago", "2 minutes ago"
    }
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    return formatDistanceToNow(date, { addSuffix: true }) // "3 days ago"
  }
  
  // If this year, show "MMM DD"
  if (isThisYear(date)) {
    return format(date, 'MMM d') // "Feb 2"
  }
  
  // Otherwise show "MMM DD, YYYY"
  return format(date, 'MMM d, yyyy') // "Feb 2, 2026"
}

export const formatFullDate = (dateString) => {
  const date = new Date(dateString)
  return format(date, 'MMM d, yyyy') // "Feb 2, 2026"
}