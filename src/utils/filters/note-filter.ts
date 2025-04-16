import { defaultFilterRegistry } from '../filter-registry.js'

export function createNoteCondition(params: URLSearchParams) {
  if (!params.has('has_note')) return null

  return (href: string, tags: string[], meta: Record<string, any>) => {
    return !!meta.note?.trim()
  }
}

defaultFilterRegistry.register('has_note', createNoteCondition)
