import { get } from 'svelte/store'
import { persisted, type Persisted } from 'svelte-persisted-store'
import { STORAGE_KEY_COLLECTIONS } from '../config/constants.js'
import { mergeHashFiltersIntoSearchParams } from '../utils/index.js'

export type Collection = {
  id: string
  name: string
  pathname: string
  filterString: string
  created: number
  updated: number
}

type SaveCollectionParams = {
  id?: string
  name: string
  pathname: string
  filterString?: string
}

let collections: Persisted<Collection[]>

export function getCollections() {
  collections ||= persisted(STORAGE_KEY_COLLECTIONS, [])
  return collections
}

export function deleteCollection(id: string) {
  getCollections().update(($collections) =>
    $collections.filter((c) => c.id !== id)
  )
}

export function saveCollection(collection: SaveCollectionParams) {
  const { id: currentCollectionId, name, pathname, filterString } = collection
  const $collections = get(getCollections())
  const now = Date.now()

  // 验证输入
  validateCollectionInput(collection, $collections, currentCollectionId)

  // 更新或创建集合
  const updatedCollections = currentCollectionId
    ? updateExistingCollection(
        $collections,
        currentCollectionId,
        name,
        pathname,
        now
      )
    : createNewCollection($collections, name, pathname, filterString, now)

  getCollections().set(updatedCollections)
}

// 辅助函数：验证输入
function validateCollectionInput(
  collection: SaveCollectionParams,
  existingCollections: Collection[],
  currentCollectionId?: string
) {
  const { name, pathname } = collection

  if (
    currentCollectionId &&
    !existingCollections.some((c) => c.id === currentCollectionId)
  ) {
    throw new Error('Collection not found.')
  }

  const trimmedName = name?.trim()
  if (!trimmedName) {
    throw new Error('Collection name is required.')
  }

  const trimmedPathname = pathname?.trim()
  if (!/^[\w-]+$/.test(trimmedPathname)) {
    throw new Error(
      "Collection pathname is invalid. Only allow letters, numbers, '_' and '-'."
    )
  }

  if (
    existingCollections.some(
      (c) => c.pathname === trimmedPathname && c.id !== currentCollectionId
    )
  ) {
    throw new Error('Collection pathname already exists.')
  }
}

// 辅助函数：更新现有集合
// eslint-disable-next-line max-params
function updateExistingCollection(
  collections: Collection[],
  id: string,
  name: string,
  pathname: string,
  updated: number
) {
  return collections.map((c) =>
    c.id === id
      ? { ...c, name: name.trim(), pathname: pathname.trim(), updated }
      : c
  )
}

// 辅助函数：创建新集合
// eslint-disable-next-line max-params
function createNewCollection(
  collections: Collection[],
  name: string,
  pathname: string,
  filterString: string | undefined,
  created: number
) {
  return [
    {
      id: crypto.randomUUID(),
      name: name.trim(),
      pathname: pathname.trim(),
      filterString:
        filterString ||
        mergeHashFiltersIntoSearchParams(location.href).toString(),
      created,
      updated: created,
    },
    ...collections,
  ]
}
