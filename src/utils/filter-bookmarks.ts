import type { BookmarkKeyValuePair } from '../types/bookmarks.js'

/**
 * Filter bookmarks by URL parameters
 * @param entries - Array of bookmark key-value pairs
 * @param searchParams - URL search parameters string
 * @returns Filtered array of bookmarks
 */
export function filterBookmarksByUrlParams(
  entries: BookmarkKeyValuePair[],
  searchParams: string
): BookmarkKeyValuePair[] {
  // Parse URL parameters
  const urlParams = new URLSearchParams(searchParams)
  const timeType = urlParams.get('time') // 'created' or 'updated'
  const period = urlParams.get('period') // e.g. '7d', '30d', '3m', '1y'
  const startDate = urlParams.get('start') // YYYY-MM-DD format
  const endDate = urlParams.get('end') // YYYY-MM-DD format

  if (!timeType) return entries

  // Calculate date range
  let minDate: Date | undefined
  let maxDate: Date | undefined
  const now = new Date()

  if (period) {
    const unit = period.slice(-1)
    const value = Number.parseInt(period, 10)
    const multiplier =
      {
        d: 1, // days
        m: 30, // months (approximate)
        y: 365, // years (approximate)
      }[unit] || 1

    const days = value * multiplier
    minDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  } else {
    if (startDate) {
      minDate = new Date(startDate)
    }

    if (endDate) {
      maxDate = new Date(endDate)
    }
  }

  // Filter bookmarks
  return entries.filter(([_, entry]) => {
    if (!entry?.meta) return false

    const timestamp =
      timeType === 'created' ? entry.meta.created : entry.meta.updated

    const date = new Date(timestamp)

    if (minDate && date < minDate) return false
    if (maxDate && date > maxDate) return false
    return true
  })
}
