import type { BookmarkKeyValuePair } from '../../types/bookmarks.js'

export function createNoteCondition(params: URLSearchParams) {
  if (!params.has('has_note')) return null

  return (entry: BookmarkKeyValuePair) => {
    return !!entry[1].meta?.note?.trim()
  }
}

defaultFilterRegistry.register('has_note', createNoteCondition)
