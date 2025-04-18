import { splitTags } from 'utags-utils'
import { normalizeAndDeduplicateStrings } from '../index.js'
import type { FilterCondition } from '../filter-registry.js'

function createAndCondition(requiredTags: string[]): FilterCondition {
  return (_, tags) => {
    const tagSet = new Set(tags)
    return requiredTags.every((tag) => tagSet.has(tag))
  }
}

function createMixedCondition(tagGroups: string[][]): FilterCondition {
  return (_, tags) => {
    const tagSet = new Set(tags)
    return tagGroups.every((group) => group.some((tag) => tagSet.has(tag)))
  }
}

export function createTagFilterCondition(
  params: URLSearchParams
): FilterCondition | undefined {
  if (!params.has('t')) return undefined

  const tagValues = params.getAll('t')
  const hasComma = tagValues.some((t) => t.includes(','))

  if (hasComma) {
    const tagGroups = [
      ...new Map(
        tagValues
          .map((tagValue) => splitTags(tagValue))
          .filter((group) => group.length > 0)
          .map((group) => [group.sort().join(','), group])
      ).values(),
    ]
    console.log(tagGroups)
    return tagGroups.length > 0 ? createMixedCondition(tagGroups) : undefined
  }

  const requiredTags = normalizeAndDeduplicateStrings(tagValues)
  console.log(requiredTags)
  return requiredTags.length > 0 ? createAndCondition(requiredTags) : undefined
}
