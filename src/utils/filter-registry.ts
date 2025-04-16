import type { BookmarkKeyValuePair } from '../types/bookmarks.js'

type FilterFunction = (
  entries: BookmarkKeyValuePair[],
  params: URLSearchParams
) => BookmarkKeyValuePair[]

class FilterRegistry {
  private filters: FilterFunction[] = []

  register(filter: FilterFunction) {
    this.filters.push(filter)
    return this // 支持链式调用
  }

  apply(entries: BookmarkKeyValuePair[], searchParams: string) {
    const params = new URLSearchParams(searchParams)
    return this.filters.reduce(
      (result, filter) => filter(result, params),
      entries
    )
  }
}

// 创建默认过滤器实例
export const defaultFilterRegistry = new FilterRegistry()
