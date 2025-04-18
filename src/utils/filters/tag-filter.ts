import type { BookmarkMetadata } from '../../types/bookmarks.js'

type TagCondition = (
  href: string,
  tags: string[],
  meta: BookmarkMetadata
) => boolean

function parseTags(tagString: string): string[] {
  return tagString
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function createAndCondition(requiredTags: string[]): TagCondition {
  return (_, tags) => {
    const tagSet = new Set(tags)
    return requiredTags.every((tag) => tagSet.has(tag))
  }
}

function createMixedCondition(tagGroups: string[][]): TagCondition {
  return (_, tags) => {
    const tagSet = new Set(tags)
    return tagGroups.every((group) => group.some((tag) => tagSet.has(tag)))
  }
}

export function createTagCondition(
  params: URLSearchParams
): TagCondition | undefined {
  if (!params.has('t')) return undefined

  const tagValues = params.getAll('t')
  const hasComma = tagValues.some((t) => t.includes(','))

  if (hasComma) {
    const tagGroups = [
      ...new Map(
        tagValues
          .map(parseTags)
          .filter((group) => group.length > 0)
          .map((group) => [group.join(','), group])
      ).values(),
    ]
    return tagGroups.length > 0 ? createMixedCondition(tagGroups) : undefined
  }

  const requiredTags = [
    ...new Set(tagValues.map((tag) => tag.trim()).filter(Boolean)),
  ]
  return requiredTags.length > 0 ? createAndCondition(requiredTags) : undefined
}
