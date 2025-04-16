import type { BookmarkKeyValuePair } from '../types/bookmarks.js'

type FilterCondition = (
  href: string,
  tags: string[],
  meta: Record<string, any>,
  params: URLSearchParams
) => boolean

class FilterRegistry {
  private conditionFactories: Map<
    string,
    (params: URLSearchParams) => FilterCondition | null
  > = new Map()

  register(
    paramName: string,
    factory: (params: URLSearchParams) => FilterCondition | null
  ) {
    this.conditionFactories.set(paramName, factory)
    return this
  }

  apply(entries: BookmarkKeyValuePair[], searchParams: string) {
    const params = new URLSearchParams(searchParams)
    const activeConditions: FilterCondition[] = []

    // 动态创建需要的条件
    for (const [paramName, factory] of this.conditionFactories) {
      if (params.has(paramName)) {
        const condition = factory(params)
        if (condition) activeConditions.push(condition)
      }
    }

    if (activeConditions.length === 0) return entries

    return entries.filter(([href, { tags, meta }]) =>
      activeConditions.every((condition) => condition(href, tags, meta, params))
    )
  }
}

export const defaultFilterRegistry = new FilterRegistry()
