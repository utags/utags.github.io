import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FILTER_DELIMITER } from '../config/constants.js'
import {
  getHostName,
  humanizeUrl,
  cleanFilterString,
  parseFilterString,
  convertToFilterString,
  parseHashFiltersToSearchParams,
  mergeHashFiltersIntoSearchParams,
  transformCollectionPathToQueryParams,
  convertCollectionToFilterParams,
} from './url-utils.js'

/**
 * Tests for getHostName function
 */
describe('getHostName', () => {
  /**
   * Test with standard HTTP URLs
   */
  it('should extract hostname from standard HTTP URLs', () => {
    // Test with basic HTTP URL
    expect(getHostName('http://example.com')).toBe('example.com')

    // Test with subdomain
    expect(getHostName('http://sub.example.com')).toBe('sub.example.com')

    // Test with port
    expect(getHostName('http://example.com:8080')).toBe('example.com')

    // Test with path
    expect(getHostName('http://example.com/path/to/resource')).toBe(
      'example.com'
    )

    // Test with query parameters
    expect(getHostName('http://example.com?param=value')).toBe('example.com')

    // Test with hash fragment
    expect(getHostName('http://example.com#section')).toBe('example.com')
  })

  /**
   * Test with HTTPS URLs
   */
  it('should extract hostname from HTTPS URLs', () => {
    // Test with basic HTTPS URL
    expect(getHostName('https://example.com')).toBe('example.com')

    // Test with complex HTTPS URL
    expect(
      getHostName('https://sub.domain.example.co.uk:443/path?query=value#hash')
    ).toBe('sub.domain.example.co.uk')
  })

  /**
   * Test with FTP URLs
   */
  it('should extract hostname from FTP URLs', () => {
    // Test with basic FTP URL
    expect(getHostName('ftp://files.example.com')).toBe('files.example.com')

    // Test with authentication
    expect(getHostName('ftp://user:pass@ftp.example.com')).toBe(
      'ftp.example.com'
    )
  })

  /**
   * Test with non-standard protocols
   */
  it('should return protocol for non-standard URL protocols', () => {
    // Test with file protocol
    expect(getHostName('file:///path/to/file.txt')).toBe('file:')

    // Test with mailto protocol
    expect(getHostName('mailto:user@example.com')).toBe('mailto:')

    // Test with data URI
    expect(getHostName('data:text/plain;base64,SGVsbG8gV29ybGQ=')).toBe('data:')

    // Test with custom protocol
    expect(getHostName('custom-protocol://resource')).toBe('custom-protocol:')
  })

  /**
   * Test with international domain names
   */
  it('should handle international domain names correctly', () => {
    // Test with Chinese domain
    expect(getHostName('https://例子.测试')).toBe('xn--fsqu00a.xn--0zwm56d')

    // Test with Cyrillic domain
    expect(getHostName('https://пример.рф')).toBe('xn--e1afmkfd.xn--p1ai')
  })

  /**
   * Test with invalid inputs
   */
  it('should handle invalid inputs gracefully', () => {
    // Test with empty string
    expect(getHostName('')).toBe('')

    // Test with undefined
    expect(getHostName(undefined as unknown as string)).toBe('')

    // Test with invalid URL
    expect(getHostName('not-a-url')).toBe('')

    // Test with malformed URL
    expect(getHostName('http//example.com')).toBe('')
  })

  /**
   * Test with URLs containing authentication
   */
  it('should handle URLs with authentication correctly', () => {
    // Test with basic authentication
    expect(getHostName('https://user:password@example.com')).toBe('example.com')

    // Test with special characters in authentication
    expect(getHostName('https://user@name:p@ssw0rd@example.com')).toBe(
      'example.com'
    )
  })
})

describe('humanizeUrl', () => {
  it('should correctly handle URLs with tracking parameters', () => {
    const url =
      'https://www.example.com/path1/path2/path3?utm_source=test&valid=1#section'
    expect(humanizeUrl(url)).toBe('example.com/path1/.../path3?valid=1#section')
  })

  it('should preserve valid query parameters', () => {
    const url = 'http://example.com?foo=bar&gclid=123&valid=true'
    expect(humanizeUrl(url)).toBe('example.com/?foo=bar&valid=true')
  })

  it('should simplify long paths keeping first and last segments', () => {
    const url = 'https://example.com/a/b/c/d/e'
    expect(humanizeUrl(url)).toBe('example.com/a/.../e')
  })

  it('should preserve hash fragments', () => {
    const url = 'https://example.com#anchor'
    expect(humanizeUrl(url)).toBe('example.com/#anchor')
  })

  it('should return original value for invalid URLs', () => {
    const url = 'invalid-url'
    expect(humanizeUrl(url)).toBe('invalid-url')
  })

  it('should remove trailing slashes', () => {
    const url = 'https://example.com/path/'
    expect(humanizeUrl(url)).toBe('example.com/path')
  })
})

describe('cleanFilterString', () => {
  it('should trim trailing spaces and slashes', () => {
    expect(cleanFilterString('a,b,c/a.com/  ')).toBe('a,b,c/a.com')
  })

  it('should clean pure space endings', () => {
    expect(cleanFilterString('test/   ')).toBe('test')
  })

  it('should handle empty input returning empty string', () => {
    expect(cleanFilterString(undefined)).toBe('')
    expect(cleanFilterString('')).toBe('')
  })

  it('should preserve valid path slashes', () => {
    expect(cleanFilterString('a/b/c')).toBe('a/b/c')
  })

  it('should clean mixed ending delimiters', () => {
    expect(cleanFilterString('  x, y, z  /  /  ')).toBe('x, y, z')
    expect(cleanFilterString('  /  /  ')).toBe('')
  })
})

describe('parseFilterString', () => {
  it('should correctly parse complete parameters', () => {
    const result = parseFilterString(
      'tag1%2Ctag2/example.com%2Ctest.com/keyword%20test'
    )
    expect(result).toEqual({
      searchKeyword: 'keyword test',
      selectedTags: new Set(['tag1', 'tag2']),
      selectedDomains: new Set(['example.com', 'test.com']),
    })
  })

  it('should handle missing tag section', () => {
    const result = parseFilterString('/domain.com/ keyword   test ')
    expect(result).toEqual({
      searchKeyword: 'keyword test',
      selectedTags: new Set([]),
      selectedDomains: new Set(['domain.com']),
    })
  })

  it('should handle missing domain section', () => {
    const result = parseFilterString('tagA%2CtagB//domain.com')
    expect(result).toEqual({
      searchKeyword: 'domain.com',
      selectedTags: new Set(['tagA', 'tagB']),
      selectedDomains: new Set([]),
    })
  })

  it('should handle missing keyword section', () => {
    const result = parseFilterString('tagA%2CtagB/domain.com/')
    expect(result?.searchKeyword).toBe('')
  })

  it('should handle empty string input', () => {
    expect(parseFilterString('')).toBeUndefined()
  })

  it('should decode special characters', () => {
    const result = parseFilterString(
      '%E4%B8%AD%E6%96%87%20tag%2F%ED%95%9C%EA%B5%AD%EC%96%B4%20tag/%E4%B8%AD%E6%96%87.com/key'
    )
    expect(result).toEqual({
      searchKeyword: 'key',
      selectedTags: new Set(['中文 tag/한국어 tag']),
      selectedDomains: new Set(['中文.com']),
    })
  })

  it('should handle invalid URI encoding', () => {
    expect(parseFilterString('invalid%2/example.com/key')).toBeUndefined()
  })

  it('should return undefined when parsing fails', () => {
    expect(parseFilterString('invalid//@#$%^&*()')).toBeUndefined()
  })
})

describe('convertToFilterString', () => {
  it('should handle empty sets and empty keyword', () => {
    expect(convertToFilterString(new Set(), new Set(), '')).toBe('')
  })

  it('should handle tags only', () => {
    expect(
      convertToFilterString(new Set(['tag1', 'tag2']), new Set(), '')
    ).toBe(
      `tag1%2Ctag2${FILTER_DELIMITER}${FILTER_DELIMITER}`.replace(/[/#]+$/, '')
    )
  })

  it('should handle combination of tags and domains', () => {
    expect(
      convertToFilterString(
        new Set(['前端', 'bug']),
        new Set(['example.com', 'test.com']),
        ''
      )
    ).toBe(`%E5%89%8D%E7%AB%AF%2Cbug${FILTER_DELIMITER}example.com%2Ctest.com`)
  })

  it('should handle complete parameters with special characters', () => {
    // Normally tags shouldn't contain ',' or '/' characters
    expect(
      convertToFilterString(
        new Set(['tag,1', 'tag/2']),
        new Set(['domain.com', 'sub.domain']),
        'search keyword'
      )
    ).toBe(
      `tag%2C1%2Ctag%2F2${FILTER_DELIMITER}domain.com%2Csub.domain${FILTER_DELIMITER}search%20keyword`
    )
  })

  it('should trim trailing delimiters', () => {
    expect(convertToFilterString(new Set(), new Set(), '')).toBe('')
    expect(convertToFilterString(new Set(['tag']), new Set(), '')).toBe(`tag`)
  })

  it('should handle mixed empty parameters', () => {
    expect(
      convertToFilterString(new Set(), new Set(['domain']), 'keyword')
    ).toBe(`${FILTER_DELIMITER}domain${FILTER_DELIMITER}keyword`)
  })
})

describe('parseHashFiltersToSearchParams', () => {
  it('should return empty URLSearchParams for empty hash', () => {
    const result = parseHashFiltersToSearchParams('')
    expect(result.toString()).toBe('')
  })

  it('should return empty URLSearchParams for undefined hash', () => {
    const result = parseHashFiltersToSearchParams(undefined)
    expect(result.toString()).toBe('')
  })

  it('should parse single filter string correctly', () => {
    const result = parseHashFiltersToSearchParams(
      'tag1%2Ctag2/example.com/keyword'
    )
    expect(result.get('t')).toBe('tag1,tag2')
    expect(result.get('d')).toBe('example.com')
    expect(result.get('q')).toBe('keyword')
  })

  it('should handle multiple filter strings separated by hash delimiter', () => {
    const result = parseHashFiltersToSearchParams(
      'tag1%2Ctag2/example.com/keyword#tag3/example2.com/keyword2'
    )
    expect(result.getAll('t')).toEqual(['tag1,tag2', 'tag3'])
    expect(result.getAll('d')).toEqual(['example.com', 'example2.com'])
    expect(result.getAll('q')).toEqual(['keyword', 'keyword2'])
  })

  // Test case for Chinese tags and keywords
  it('should handle Chinese tags and keywords', () => {
    const result = parseHashFiltersToSearchParams(
      '%E5%89%8D%E7%AB%AF%2C%E6%B5%8B%E8%AF%95/example.com/%E4%B8%AD%E6%96%87%E5%85%B3%E9%94%AE%E5%AD%97#%E5%90%8E%E7%AB%AF/example.cn/%E6%90%9C%E7%B4%A2'
    )
    expect(result.getAll('t')).toEqual(['前端,测试', '后端'])
    expect(result.getAll('d')).toEqual(['example.com', 'example.cn'])
    expect(result.getAll('q')).toEqual(['中文关键字', '搜索'])
  })

  // Test case for mixed language tags
  it('should handle mixed language tags', () => {
    const result = parseHashFiltersToSearchParams(
      '前端%2Cbug%2C%E3%83%86%E3%82%B9%E3%83%88/example.com/keyword#%ED%95%9C%EA%B8%80/example.co.kr/%ED%82%A4%EC%9B%8C%EB%93%9C'
    )
    expect(result.getAll('t')).toEqual(['前端,bug,テスト', '한글'])
    expect(result.getAll('d')).toEqual(['example.com', 'example.co.kr'])
    expect(result.getAll('q')).toEqual(['keyword', '키워드'])
  })

  it('should handle missing tags section', () => {
    const result = parseHashFiltersToSearchParams('/example.com/keyword')
    expect(result.get('t')).toBeNull()
    expect(result.get('d')).toBe('example.com')
    expect(result.get('q')).toBe('keyword')
  })

  it('should handle missing domains section', () => {
    const result = parseHashFiltersToSearchParams('tag1%2Ctag2//keyword')
    expect(result.get('t')).toBe('tag1,tag2')
    expect(result.get('d')).toBeNull()
    expect(result.get('q')).toBe('keyword')
  })

  it('should handle missing keyword section', () => {
    const result = parseHashFiltersToSearchParams('tag1%2Ctag2/example.com/')
    expect(result.get('t')).toBe('tag1,tag2')
    expect(result.get('d')).toBe('example.com')
    expect(result.get('q')).toBeNull()
  })

  it('should handle empty sections', () => {
    const result = parseHashFiltersToSearchParams('//')
    expect(result.get('t')).toBeNull()
    expect(result.get('d')).toBeNull()
    expect(result.get('q')).toBeNull()
  })

  it('should handle whitespace-only hash', () => {
    const result = parseHashFiltersToSearchParams('   ')
    expect(result.toString()).toBe('')
  })

  it('should handle malformed filter strings', () => {
    const result = parseHashFiltersToSearchParams('///invalid-filter-string')
    expect(result.toString()).toBe('')
  })
})

/**
 * Tests for mergeHashFiltersIntoSearchParams function
 */
describe('mergeHashFiltersIntoSearchParams', () => {
  /**
   * Test with URL having no existing search parameters
   */
  it('should merge hash filters into empty search parameters', () => {
    // Test URL with hash filters but no search parameters
    const url = 'https://example.com#tag1%2Ctag2/example.com/keyword'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains the hash filters
    expect(result.get('t')).toBe('tag1,tag2')
    expect(result.get('d')).toBe('example.com')
    expect(result.get('q')).toBe('keyword')
  })

  /**
   * Test with URL having existing search parameters
   */
  it('should merge hash filters with existing search parameters', () => {
    // Test URL with both search parameters and hash filters
    const url =
      'https://example.com?existing=param#tag1%2Ctag2/example.com/keyword'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains both existing parameters and hash filters
    expect(result.get('existing')).toBe('param')
    expect(result.get('t')).toBe('tag1,tag2')
    expect(result.get('d')).toBe('example.com')
    expect(result.get('q')).toBe('keyword')
  })

  /**
   * Test with URL having multiple hash filters
   */
  it('should handle multiple hash filters separated by hash delimiter', () => {
    // Test URL with multiple hash filters
    const url =
      'https://example.com#tag1%2Ctag2/example.com/keyword1#tag3%2Ctag4/example.org/keyword2'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains all hash filters
    expect(result.getAll('t')).toEqual(['tag1,tag2', 'tag3,tag4'])
    expect(result.getAll('d')).toEqual(['example.com', 'example.org'])
    expect(result.getAll('q')).toEqual(['keyword1', 'keyword2'])
  })

  /**
   * Test with URL having both existing search parameters and multiple hash filters
   */
  it('should merge multiple hash filters with existing search parameters', () => {
    // Test URL with both search parameters and multiple hash filters
    const url =
      'https://example.com?existing=param&t=existing_tag#tag1%2Ctag2/example.com/keyword1#tag3%2Ctag4/example.org/keyword2'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains both existing parameters and all hash filters
    expect(result.get('existing')).toBe('param')
    expect(result.getAll('t')).toEqual([
      'existing_tag',
      'tag1,tag2',
      'tag3,tag4',
    ])
    expect(result.getAll('d')).toEqual(['example.com', 'example.org'])
    expect(result.getAll('q')).toEqual(['keyword1', 'keyword2'])
  })

  /**
   * Test with URL having no hash part
   */
  it('should return original search parameters when URL has no hash', () => {
    // Test URL with search parameters but no hash
    const url = 'https://example.com?param1=value1&param2=value2'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains only the original search parameters
    expect(result.get('param1')).toBe('value1')
    expect(result.get('param2')).toBe('value2')
    expect(result.has('t')).toBe(false)
    expect(result.has('d')).toBe(false)
    expect(result.has('q')).toBe(false)
  })

  /**
   * Test with URL having empty hash
   */
  it('should handle URL with empty hash', () => {
    // Test URL with empty hash
    const url = 'https://example.com?param=value#'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains only the original search parameters
    expect(result.get('param')).toBe('value')
    expect(result.has('t')).toBe(false)
    expect(result.has('d')).toBe(false)
    expect(result.has('q')).toBe(false)
  })

  /**
   * Test with URL having invalid hash filters
   */
  it('should handle URL with invalid hash filters', () => {
    // Test URL with invalid hash filters
    const url = 'https://example.com?param=value#///invalid-filter-format'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains only the original search parameters
    expect(result.get('param')).toBe('value')
    expect(result.has('t')).toBe(false)
    expect(result.has('d')).toBe(false)
    expect(result.has('q')).toBe(false)
  })

  /**
   * Test with URL having international characters in hash filters
   */
  it('should handle URL with international characters in hash filters', () => {
    // Test URL with international characters in hash filters
    const url =
      'https://example.com#%E6%B5%8B%E8%AF%95%2C%E6%A0%87%E7%AD%BE/%E4%BE%8B%E5%AD%90.%E6%B5%8B%E8%AF%95/%E5%85%B3%E9%94%AE%E8%AF%8D'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains the correctly decoded hash filters
    expect(result.get('t')).toBe('测试,标签')
    expect(result.get('d')).toBe('例子.测试')
    expect(result.get('q')).toBe('关键词')
  })

  /**
   * Test with URL having partial hash filters
   */
  it('should handle URL with partial hash filters', () => {
    // Test URL with only tags in hash filters
    const url1 = 'https://example.com#tag1%2Ctag2//'
    const result1 = mergeHashFiltersIntoSearchParams(url1)
    expect(result1.get('t')).toBe('tag1,tag2')
    expect(result1.has('d')).toBe(false)
    expect(result1.has('q')).toBe(false)

    // Test URL with only domains in hash filters
    const url2 = 'https://example.com#/example.com/'
    const result2 = mergeHashFiltersIntoSearchParams(url2)
    expect(result2.has('t')).toBe(false)
    expect(result2.get('d')).toBe('example.com')
    expect(result2.has('q')).toBe(false)

    // Test URL with only keyword in hash filters
    const url3 = 'https://example.com#//keyword'
    const result3 = mergeHashFiltersIntoSearchParams(url3)
    expect(result3.has('t')).toBe(false)
    expect(result3.has('d')).toBe(false)
    expect(result3.get('q')).toBe('keyword')
  })

  /**
   * Test with complex URL scenario
   */
  it('should handle complex URL scenario with multiple parameters and filters', () => {
    // Test complex URL with multiple search parameters and hash filters
    const url =
      'https://example.com/path?param1=value1&t=existing_tag&d=existing_domain&q=existing_keyword#tag1%2Ctag2/domain1%2Cdomain2/keyword1#tag3/domain3/keyword2'

    // Get merged search parameters
    const result = mergeHashFiltersIntoSearchParams(url)

    // Verify the result contains all parameters correctly merged
    expect(result.get('param1')).toBe('value1')
    expect(result.getAll('t')).toEqual(['existing_tag', 'tag1,tag2', 'tag3'])
    expect(result.getAll('d')).toEqual([
      'existing_domain',
      'domain1,domain2',
      'domain3',
    ])
    expect(result.getAll('q')).toEqual([
      'existing_keyword',
      'keyword1',
      'keyword2',
    ])
  })
})

describe('transformCollectionPathToQueryParams', () => {
  /**
   * Tests for basic collection URL patterns
   */
  describe('Basic collection URL patterns', () => {
    it('should transform /collections/{collection-id} to ?collection={collection-id}', () => {
      const input = 'https://example.com/collections/my-collection'
      const expected = 'https://example.com/?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should transform /c/{collection-id} to ?collection={collection-id}', () => {
      const input = 'https://example.com/c/my-collection'
      const expected = 'https://example.com/?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should handle collection with special characters', () => {
      const input =
        'https://example.com/collections/my-collection%20with%20spaces'
      const expected =
        'https://example.com/?collection=my-collection20with20spaces'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })
  })

  /**
   * Tests for visibility collection URL patterns
   */
  describe('Visibility collection URL patterns', () => {
    it('should transform /collections/shared/{collection-id} to ?collection={collection-id}&v=shared', () => {
      const input = 'https://example.com/collections/shared/shared-collection'
      const expected =
        'https://example.com/?collection=shared-collection&v=shared'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should transform /c/shared/{collection-id} to ?collection={collection-id}&v=shared', () => {
      const input = 'https://example.com/c/shared/shared-collection'
      const expected =
        'https://example.com/?collection=shared-collection&v=shared'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should transform /collections/public/{collection-id} to ?collection={collection-id}&v=public', () => {
      const input = 'https://example.com/collections/public/public-collection'
      const expected =
        'https://example.com/?collection=public-collection&v=public'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should transform /c/public/{collection-id} to ?collection={collection-id}&v=public', () => {
      const input = 'https://example.com/c/public/public-collection'
      const expected =
        'https://example.com/?collection=public-collection&v=public'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should transform /collections/private/{collection-id} to ?collection={collection-id}&v=private', () => {
      const input = 'https://example.com/collections/private/private-collection'
      const expected =
        'https://example.com/?collection=private-collection&v=private'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should transform /c/private/{collection-id} to ?collection={collection-id}&v=private', () => {
      const input = 'https://example.com/c/private/private-collection'
      const expected =
        'https://example.com/?collection=private-collection&v=private'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })
  })

  /**
   * Tests for URLs with existing query parameters
   */
  describe('URLs with existing query parameters', () => {
    it('should preserve existing query parameters', () => {
      const input =
        'https://example.com/collections/my-collection?sort=name&order=asc'
      const expected =
        'https://example.com/?collection=my-collection&sort=name&order=asc'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should place collection and shared parameters before existing parameters', () => {
      const input =
        'https://example.com/c/shared/shared-collection?sort=name&order=asc'
      const expected =
        'https://example.com/?collection=shared-collection&v=shared&sort=name&order=asc'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })
  })

  /**
   * Tests for URLs with remaining path segments
   */
  describe('URLs with remaining path segments', () => {
    it('should preserve remaining path segments', () => {
      const input = 'https://example.com/collections/my-collection/extra/path'
      const expected = 'https://example.com/extra/path?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should handle shared collections with remaining path segments', () => {
      const input = 'https://example.com/c/shared/shared-collection/extra/path'
      const expected =
        'https://example.com/extra/path?collection=shared-collection&v=shared'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should handle remaining path segments with existing query parameters', () => {
      const input =
        'https://example.com/collections/my-collection/extra/path?sort=name'
      const expected =
        'https://example.com/extra/path?collection=my-collection&sort=name'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })
  })

  /**
   * Tests for edge cases and non-matching URLs
   */
  describe('Edge cases and non-matching URLs', () => {
    it('should return original URL for non-matching paths', () => {
      const input = 'https://example.com/some/other/path'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(input)
    })

    it('should handle URLs with hash fragments', () => {
      const input = 'https://example.com/collections/my-collection#section1'
      const expected = 'https://example.com/?collection=my-collection#section1'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    /**
     * Tests for URLs with both query parameters and hash fragments
     */
    describe('URLs with both query parameters and hash fragments', () => {
      it('should handle URLs with both query parameters and hash fragments', () => {
        const input =
          'https://example.com/c/shared/shared-collection?sort=name#section1'
        const expected =
          'https://example.com/?collection=shared-collection&v=shared&sort=name#section1'

        const result = transformCollectionPathToQueryParams(input)

        expect(result).toBe(expected)
      })

      it('should handle URLs with public visibility, query parameters and hash fragments', () => {
        const input =
          'https://example.com/collections/public/public-collection?sort=name#section1'
        const expected =
          'https://example.com/?collection=public-collection&v=public&sort=name#section1'

        const result = transformCollectionPathToQueryParams(input)

        expect(result).toBe(expected)
      })
    })

    it('should handle URLs with empty collection IDs', () => {
      const input = 'https://example.com/collections/'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(input)
    })

    it('should handle URLs with collection parameter in singular form', () => {
      const input = 'https://example.com/collection/my-collection'
      const expected = 'https://example.com/?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })
  })

  /**
   * Tests for protocol and domain variations
   */
  describe('Protocol and domain variations', () => {
    it('should work with different protocols', () => {
      const input = 'http://example.com/collections/my-collection'
      const expected = 'http://example.com/?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should work with different domains', () => {
      const input = 'https://sub.domain.example.com/collections/my-collection'
      const expected =
        'https://sub.domain.example.com/?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should work with URLs that have ports', () => {
      const input = 'https://example.com:8080/collections/my-collection'
      const expected = 'https://example.com:8080/?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })
  })

  /**
   * Tests for complex scenarios
   */
  describe('Complex scenarios', () => {
    it('should handle complex collection IDs with special characters', () => {
      const input =
        'https://example.com/collections/my-collection+with@special_chars'
      const expected =
        'https://example.com/?collection=my-collectionwithspecial_chars'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should handle URLs with multiple path segments after collection ID', () => {
      const input =
        'https://example.com/collections/my-collection/segment1/segment2/segment3'
      const expected =
        'https://example.com/segment1/segment2/segment3?collection=my-collection'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })

    it('should handle URLs with multiple query parameters and complex values', () => {
      const input =
        'https://example.com/c/shared/my-collection?param1=value1&param2=value2&param3=value3'
      const expected =
        'https://example.com/?collection=my-collection&v=shared&param1=value1&param2=value2&param3=value3'

      const result = transformCollectionPathToQueryParams(input)

      expect(result).toBe(expected)
    })
  })
})

/**
 * Tests for convertCollectionToFilterParams function
 */
describe('convertCollectionToFilterParams', () => {
  // Mock the collections module
  vi.mock('../stores/collections', () => ({
    getFilterStringByPathname(collectionId: string) {
      if (collectionId === 'my-collection') {
        return 't=tag1,tag2&d=example.com&q=keyword'
      }

      if (collectionId === 'empty-collection') {
        return 'foo=bar'
      }

      return null // Collection doesn't exist
    },
  }))

  /**
   * Test with existing collection
   */
  it('should convert collection parameter to filter parameters when collection exists', () => {
    // Create search params with collection parameter
    const searchParams = new URLSearchParams('collection=my-collection')

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify filter parameters
    expect(result.get('t')).toBe('tag1,tag2')
    expect(result.get('d')).toBe('example.com')
    expect(result.get('q')).toBe('keyword')
    expect(result.has('collection')).toBe(false)
  })

  /**
   * Test with non-existent collection
   */
  it('should handle non-existent collection by adding special domain filters', () => {
    // Create search params with non-existent collection
    const searchParams = new URLSearchParams('collection=non-existent')

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify special domain filters are added
    expect(result.getAll('d')).toEqual([
      'unexisted-collection.com',
      'unexisted-collection.org',
    ])
    expect(result.has('collection')).toBe(false)
  })

  it('should not process filter string when collection is "deleted"', () => {
    const searchParams = new URLSearchParams('collection=deleted')

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify no filter parameters are added
    expect(result.has('t')).toBe(false)
    expect(result.has('d')).toBe(false)
    expect(result.has('q')).toBe(false)
    expect(result.has('collection')).toBe(false)
  })

  /**
   * Test with empty collection filter string
   */
  it('should handle empty collection filter string', () => {
    // Create search params with collection that returns empty filter string
    const searchParams = new URLSearchParams('collection=empty-collection')

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify no filter parameters are added
    expect(result.has('t')).toBe(false)
    expect(result.has('d')).toBe(false)
    expect(result.has('q')).toBe(false)
    expect(result.has('collection')).toBe(false)
  })

  /**
   * Test with shared collection
   */
  it('should preserve shared parameter when processing collection', () => {
    // Create search params with collection and shared parameters
    const searchParams = new URLSearchParams(
      'collection=my-collection&shared=true'
    )

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify filter parameters and shared parameter
    // expect(result.get('t')).toBe('tag1,tag2')
    // expect(result.get('d')).toBe('example.com')
    // expect(result.get('q')).toBe('keyword')
    expect(result.get('shared')).toBe('true')
    expect(result.has('collection')).toBe(false)
  })

  /**
   * Test with additional parameters
   */
  it('should preserve additional parameters when processing collection', () => {
    // Create search params with collection and additional parameters
    const searchParams = new URLSearchParams(
      'collection=my-collection&param1=value1&param2=value2'
    )

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify filter parameters and additional parameters
    expect(result.get('t')).toBe('tag1,tag2')
    expect(result.get('d')).toBe('example.com')
    expect(result.get('q')).toBe('keyword')
    expect(result.get('param1')).toBe('value1')
    expect(result.get('param2')).toBe('value2')
    expect(result.has('collection')).toBe(false)

    // Verify parameter order
    expect(Array.from(result.keys())).toEqual([
      't',
      'd',
      'q',
      'param1',
      'param2',
    ])
  })

  it('should handle empty collection parameter', () => {
    const searchParams = new URLSearchParams('collection=')
    const result = convertCollectionToFilterParams(searchParams)

    expect(result.has('t')).toBe(false)
    expect(result.has('d')).toBe(false)
    expect(result.has('q')).toBe(false)
    expect(result.has('collection')).toBe(false)
  })

  /**
   * Test with no collection parameter
   */
  it('should return empty URLSearchParams when no collection parameter is provided', () => {
    // Create search params without collection parameter
    const searchParams = new URLSearchParams('param=value')

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify original parameters are preserved
    expect(result.get('param')).toBe('value')
    expect(result.has('collection')).toBe(false)
  })

  /**
   * Test with empty URLSearchParams
   */
  it('should handle empty URLSearchParams', () => {
    // Create empty search params
    const searchParams = new URLSearchParams()

    // Convert collection to filter parameters
    const result = convertCollectionToFilterParams(searchParams)

    // Verify result is empty
    expect(Array.from(result.entries()).length).toBe(0)
  })
})
