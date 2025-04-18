import type { BookmarkMetadata } from '../../types/bookmarks.js'

function parseTagGroups(params: URLSearchParams) {
  const hasComma = params.getAll('t').some((t) => t.includes(','))

  if (hasComma) {
    return params
      .getAll('t')
      .map((tags) =>
        tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
      .filter((group) => group.length > 0)
  }

  return params
    .getAll('t')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function createTagCondition(params: URLSearchParams) {
  if (!params.has('t')) return undefined

  const conditionTags = parseTagGroups(params)
  if (conditionTags.length === 0) return undefined

  if (Array.isArray(conditionTags) && typeof conditionTags[0] === 'string') {
    // 纯AND模式
    return (href: string, tags: string[], meta: BookmarkMetadata) => {
      return conditionTags.every((tag) => tags.includes(tag as string))
    }
  }

  // 混合AND/OR模式
  return (href: string, tags: string[], meta: BookmarkMetadata) => {
    return conditionTags.every((tagGroup) =>
      (tagGroup as string[]).some((tag) => tags.includes(tag))
    )
  }
}
