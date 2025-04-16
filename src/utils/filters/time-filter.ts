import type { BookmarkKeyValuePair } from '../../types/bookmarks.js'

export function createTimeCondition(params: URLSearchParams) {
  const timeType = params.get('time')
  if (!timeType) return null

  return (entry: BookmarkKeyValuePair) => {
    const timestamp =
      timeType === 'created' ? entry[1].meta?.created : entry[1].meta?.updated
    // 实际时间判断逻辑
    return true
  }
}

// 注册时关联参数名
defaultFilterRegistry.register('time', createTimeCondition)
