import type { BookmarkKeyValuePair } from '../../types/bookmarks.js';

export const timeCondition: FilterCondition = (entry, params) => {
  const timeType = params.get('time')
  if (!timeType) return true

  const timestamp = timeType === 'created'
    ? entry[1].meta?.created
    : entry[1].meta?.updated
  return true // 实际条件判断
}

export function timeFilter(
  entries: BookmarkKeyValuePair[],
  params: URLSearchParams
) {
  const timeType = params.get('time');
  if (!timeType) return entries;

  // ... 保留原有的时间过滤逻辑 ...
  return entries.filter(([_, entry]) => {
    // ... 原有过滤条件 ...
  });
}
