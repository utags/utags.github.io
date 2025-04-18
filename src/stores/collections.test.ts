import { describe, it, expect, beforeEach, vi } from 'vitest'
import { get } from 'svelte/store'
import { STORAGE_KEY_COLLECTIONS } from '../config/constants.js'
import {
  getCollections,
  deleteCollection,
  saveCollection,
} from './collections.js'

let storageChangeHandler: ((event: StorageEvent) => void) | undefined
// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem(key: string, value: string) {
      store[key] = value.toString()
      if (typeof storageChangeHandler === 'function') {
        // @ts-expect-error - StorageEvent is not defined in vitest
        storageChangeHandler({ key, newValue: value })
      }
    },
    clear() {
      store = {}
    },
  }
})()

// mock localStorage for svelte-persisted-store
vi.stubGlobal('localStorage', localStorageMock)
// mock document for svelte-persisted-store
vi.stubGlobal('document', {})
// mock window for svelte-persisted-store
vi.stubGlobal('window', {
  addEventListener(type: string, handler: (event: StorageEvent) => void) {
    console.log('addEventListener', type)
    if (type === 'storage') {
      storageChangeHandler = handler
    }
  },
  removeEventListener(type: string) {
    console.log('removeEventListener', type)
    if (type === 'storage') {
      // storageChangeHandler = null
    }
  },
})

// 添加location对象mock
const locationMock = {
  href: 'http://test.com/?q=search&t=tag1,tag2&d=example.com',
}

vi.stubGlobal('location', locationMock)

const collections = getCollections()

describe('collections store', () => {
  beforeEach(() => {
    // 重置store和localStorage
    collections.set([])
    localStorage.clear()
  })

  describe('deleteCollection', () => {
    it('should remove collection with given id', () => {
      const testCollection = {
        id: '1',
        name: 'Test',
        pathname: 'test',
        filterString: '',
        created: Date.now(),
        updated: Date.now(),
      }
      collections.set([testCollection])

      expect(get(collections)).toEqual([testCollection])

      deleteCollection('1')

      expect(get(collections)).toEqual([])
    })

    it('should do nothing if collection not found', () => {
      const testCollection = {
        id: '1',
        name: 'Test',
        pathname: 'test',
        filterString: '',
        created: Date.now(),
        updated: Date.now(),
      }
      collections.set([testCollection])

      deleteCollection('2')

      expect(get(collections)).toEqual([testCollection])
    })
  })

  describe('saveCollection', () => {
    it('should create new collection when no id provided', () => {
      const now = Date.now()
      vi.useFakeTimers().setSystemTime(now)

      saveCollection({
        name: 'New Collection',
        pathname: 'new-collection',
      })

      const result = get(collections)
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('New Collection')
      expect(result[0].pathname).toBe('new-collection')
      expect(result[0].created).toBe(now)
      expect(result[0].updated).toBe(now)
      expect(result[0].id).toBeDefined()
      expect(result[0].filterString).toBe(
        'q=search&t=tag1%2Ctag2&d=example.com'
      )
    })

    it('should update existing collection when id provided', () => {
      const oldTime = Date.now() - 1000
      const testCollection = {
        id: '1',
        name: 'Old Name',
        pathname: 'old-path',
        filterString: '',
        created: oldTime,
        updated: oldTime,
      }
      collections.set([testCollection])

      const now = Date.now()
      vi.useFakeTimers().setSystemTime(now)

      saveCollection({
        id: '1',
        name: 'New Name',
        pathname: 'new-path',
      })

      const result = get(collections)
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('New Name')
      expect(result[0].pathname).toBe('new-path')
      expect(result[0].created).toBe(oldTime) // created时间不应改变
      expect(result[0].updated).toBe(now) // updated时间应更新
    })

    it('should throw error when collection name is empty', () => {
      expect(() => {
        saveCollection({
          name: '',
          pathname: 'test',
        })
      }).toThrow('Collection name is required.')
    })

    it('should throw error when pathname is invalid', () => {
      expect(() => {
        saveCollection({
          name: 'Test',
          pathname: 'invalid path',
        })
      }).toThrow('Collection pathname is invalid.')
    })

    it('should throw error when pathname already exists', () => {
      collections.set([
        {
          id: '1',
          name: 'Existing',
          pathname: 'existing',
          filterString: '',
          created: Date.now(),
          updated: Date.now(),
        },
      ])

      expect(() => {
        saveCollection({
          name: 'Test',
          pathname: 'existing',
        })
      }).toThrow('Collection pathname already exists.')
    })

    it('should use provided filterString when creating new collection', () => {
      saveCollection({
        name: 'Test',
        pathname: 'test',
        filterString: 't=tag1,tag2&d=example.com&q=keyword',
      })

      const result = get(collections)
      expect(result[0].filterString).toBe('t=tag1,tag2&d=example.com&q=keyword')
    })
  })

  describe('persistence', () => {
    it('should persist collections to localStorage', () => {
      const testData = [
        {
          id: '1',
          name: 'Test',
          pathname: 'test',
          filterString: '',
          created: Date.now(),
          updated: Date.now(),
        },
      ]

      collections.set(testData)

      const stored = localStorage.getItem(STORAGE_KEY_COLLECTIONS)
      expect(stored).toBe(JSON.stringify(testData))
    })

    it('should load collections from localStorage on init', () => {
      const testData = [
        {
          id: '2',
          name: 'Test',
          pathname: 'test',
          filterString: '',
          created: Date.now(),
          updated: Date.now(),
        },
      ]

      localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(testData))

      expect(get(collections)).toEqual(testData)
    })
  })
})
