import { vi, describe, it, expect, afterEach } from 'vitest'
import type { BookmarkKeyValuePair } from '../types/bookmarks.js'
import { filterBookmarksByUrlParams } from './filter-bookmarks.js'

describe('filterBookmarksByUrlParams', () => {
  const mockBookmarks: BookmarkKeyValuePair[] = [
    [
      'https://example.com/1',
      {
        tags: ['tech'],
        meta: {
          title: 'Example 1',
          created: Date.parse('2023-01-15'),
          updated: Date.parse('2023-01-20'),
        },
      },
    ],
    [
      'https://example.com/2',
      {
        tags: ['news'],
        meta: {
          title: 'Example 2',
          created: Date.parse('2023-02-10'),
          updated: Date.parse('2023-02-15'),
        },
      },
    ],
    [
      'https://example.com/3',
      {
        tags: ['tech'],
        meta: {
          title: 'Example 3',
          created: Date.parse('2023-03-05'),
          updated: Date.parse('2023-03-10'),
        },
      },
    ],
  ]

  it('should return all bookmarks when no time filter is provided', () => {
    const result = filterBookmarksByUrlParams(mockBookmarks, '')
    expect(result.length).toBe(3)
  })

  it('should filter by created date with period (7d)', () => {
    const mockDate = new Date('2023-03-12')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)

    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=created&period=7d'
    )
    expect(result.length).toBe(1)
    expect(result[0][1].meta.title).toBe('Example 3')

    vi.useRealTimers()
  })

  it('should filter by updated date with period (30d)', () => {
    const mockDate = new Date('2023-03-12')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)

    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=updated&period=30d'
    )
    expect(result.length).toBe(2)
    expect(result.map((b) => b[1].meta.title)).toEqual([
      'Example 2',
      'Example 3',
    ])

    vi.useRealTimers()
  })

  it('should filter by created date with start and end dates', () => {
    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=created&start=2023-02-01&end=2023-02-28'
    )
    expect(result.length).toBe(1)
    expect(result[0][1].meta.title).toBe('Example 2')
  })

  it('should filter by updated date with start date only', () => {
    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=updated&start=2023-03-01'
    )
    expect(result.length).toBe(1)
    expect(result[0][1].meta.title).toBe('Example 3')
  })

  it('should filter by created date with end date only', () => {
    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=created&end=2023-02-01'
    )
    expect(result.length).toBe(1)
    expect(result[0][1].meta.title).toBe('Example 1')
  })

  it('should handle month (m) unit correctly', () => {
    const mockDate = new Date('2023-03-15')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)

    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=created&period=1m'
    )
    expect(result.length).toBe(1)
    expect(result[0][1].meta.title).toBe('Example 3')

    vi.useRealTimers()
  })

  it('should handle year (y) unit correctly', () => {
    const mockDate = new Date('2023-03-12')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)

    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=created&period=1y'
    )
    expect(result.length).toBe(3)

    vi.useRealTimers()
  })

  it('should return empty array when no bookmarks match the filter', () => {
    const result = filterBookmarksByUrlParams(
      mockBookmarks,
      '?time=created&start=2024-01-01'
    )
    expect(result.length).toBe(0)
  })

  it('should ignore invalid timeType', () => {
    const result = filterBookmarksByUrlParams(mockBookmarks, '?time=invalid')
    expect(result.length).toBe(3)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})
