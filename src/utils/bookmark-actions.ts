import { get } from 'svelte/store'
import { bookmarks } from '../stores/stores.js'
import { saveDeletedBookmark } from '../stores/deleted-bookmarks.js'

export function handleBookmarkDelete(href: string) {
  // eslint-disable-next-line no-alert
  if (!confirm('确定要删除这个书签吗？')) return

  const $bookmarks = get(bookmarks)
  // 保存已删除的书签
  saveDeletedBookmark([href, $bookmarks.data[href]], { actionType: 'delete' })
  // 从书签存储中删除
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete $bookmarks.data[href]
  bookmarks.set($bookmarks)

  // 触发UI更新
  bookmarks.update((b) => b)
}

export function handleBookmarkEdit(href: string) {
  const event = new CustomEvent('editBookmark', {
    detail: { href },
    bubbles: true,
  })
  globalThis.dispatchEvent(event)
}

/**
 * Handle AI summary request for the bookmark
 * Opens a new window with the LinkSumm service to summarize the URL
 *
 * @param {string} url - The URL to summarize
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function handleAISummary(url: string) {
  // Construct the LinkSumm URL with the target URL as a parameter
  const summaryUrl = `https://linksumm.aimerge.cc/?url=${encodeURIComponent(url)}`

  // Open the summary URL in a new window/tab
  window.open(summaryUrl, '_blank', 'noopener,noreferrer')
}

// TODO: add copy url action
// TODO: add show QR code action
