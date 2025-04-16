import type { BookmarkKeyValuePair } from '../types/bookmarks.js'

type FilterCondition = (
  entry: BookmarkKeyValuePair,
  params: URLSearchParams
) => boolean

class FilterRegistry {
  private conditions: FilterCondition[] = []

  register(condition: FilterCondition) {
    this.conditions.push(condition)
    return this
  }

  apply(entries: BookmarkKeyValuePair[], searchParams: string) {
    if (this.conditions.length === 0) return entries

    const params = new URLSearchParams(searchParams)
    return entries.filter((entry) =>
      this.conditions.every((condition) => condition(entry, params))
    )
  }
}

export const defaultFilterRegistry = new FilterRegistry()
