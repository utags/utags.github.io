import { STORAGE_KEY_BOOKMARKS_DELETED } from '../config/constants.js'
import {
  type BookmarkKeyValuePair,
  type BookmarkTagsAndMetadata,
} from '../types/bookmarks.js'

export function saveDeletedBookmark(
  bookmarkKeyValuePair: BookmarkKeyValuePair,
  options: {
    actionType: 'delete' | 'import' | 'sync'
  }
) {
  const bookmarkTagsAndMetadata: BookmarkTagsAndMetadata =
    bookmarkKeyValuePair[1]
  bookmarkTagsAndMetadata.deletedMeta = {
    deleted: Date.now(),
    actionType: options.actionType,
  }

  // 从localStorage获取现有数据或初始化空数组
  const existingData = localStorage.getItem(STORAGE_KEY_BOOKMARKS_DELETED)
  const deletedBookmarks = existingData
    ? (JSON.parse(existingData) as BookmarkKeyValuePair[])
    : []

  // 添加新条目到数组
  deletedBookmarks.push(bookmarkKeyValuePair)

  // 保存回localStorage
  localStorage.setItem(
    STORAGE_KEY_BOOKMARKS_DELETED,
    JSON.stringify(deletedBookmarks)
  )
}
