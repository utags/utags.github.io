import type { BookmarkKeyValuePair } from '../../types/bookmarks.js'

export function noteFilter(
  entries: BookmarkKeyValuePair[],
  params: URLSearchParams
) {
  const hasNote = params.get('has_note')
  if (!hasNote) return entries

  return entries.filter(([_, entry]) => {
    return entry.meta?.note?.trim().length > 0
  })
}
