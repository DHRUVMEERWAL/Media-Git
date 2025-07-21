export function formatDistanceToNow(timestamp: number, options?: { addSuffix?: boolean }): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  let result = ""

  if (years > 0) {
    result = `${years} year${years > 1 ? "s" : ""}`
  } else if (months > 0) {
    result = `${months} month${months > 1 ? "s" : ""}`
  } else if (weeks > 0) {
    result = `${weeks} week${weeks > 1 ? "s" : ""}`
  } else if (days > 0) {
    result = `${days} day${days > 1 ? "s" : ""}`
  } else if (hours > 0) {
    result = `${hours} hour${hours > 1 ? "s" : ""}`
  } else if (minutes > 0) {
    result = `${minutes} minute${minutes > 1 ? "s" : ""}`
  } else {
    result = `${seconds} second${seconds > 1 ? "s" : ""}`
  }

  return options?.addSuffix ? `${result} ago` : result
}
