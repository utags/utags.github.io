import type { BookmarkKeyValuePair } from '../../types/bookmarks.js';

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
