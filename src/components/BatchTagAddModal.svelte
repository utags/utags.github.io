<script lang="ts">
  import { bookmarks } from '../stores/stores'
  import { commandManager } from '../stores/command-store'
  import { AddTagCommand } from '../lib/tag-commands'
  import { bookmarkStorage } from '../lib/bookmark-storage'
  import TagInput from './TagInput.svelte'
  import Modal from './Modal.svelte'

  // Props
  let {
    selectedBookmarkUrls = [],
    isOpen = $bindable(false),
  }: {
    selectedBookmarkUrls: string[]
    isOpen: boolean
  } = $props()

  // State
  let tagsToAdd = $state<string[]>([])
  let isProcessing = $state(false)
  let errorMessage = $state('')
  let successMessage = $state('')

  /**
   * Close the modal and reset state
   */
  function closeModal() {
    resetState()
    isOpen = false
  }

  /**
   * Reset the component state
   */
  function resetState() {
    tagsToAdd = []
    errorMessage = ''
    successMessage = ''
    isProcessing = false
  }

  /**
   * Add tags to selected bookmarks
   */
  async function addTagsToBookmarks() {
    if (tagsToAdd.length === 0) {
      errorMessage = '请至少添加一个标签'
      return
    }

    if (selectedBookmarkUrls.length === 0) {
      errorMessage = '未选择书签'
      return
    }

    isProcessing = true
    errorMessage = ''
    successMessage = ''

    try {
      const bookmarksToUpdate =
        await bookmarkStorage.getBookmarksAsArrayByKeys(selectedBookmarkUrls)
      // Create and execute the add tag command for each bookmark
      const addTagCommand = new AddTagCommand(bookmarksToUpdate, tagsToAdd)
      await commandManager.executeCommand(addTagCommand, bookmarksToUpdate)

      successMessage = `成功添加 ${tagsToAdd.length} 个标签到 ${selectedBookmarkUrls.length} 个书签`

      // Reset tags input after successful operation
      tagsToAdd = []

      // Close modal after a short delay to show success message
      setTimeout(() => {
        closeModal()
      }, 1500)
    } catch (error) {
      errorMessage = `添加标签失败: ${error instanceof Error ? error.message : String(error)}`
    } finally {
      isProcessing = false
    }
  }
</script>

<Modal
  title="批量添加标签"
  {isOpen}
  onOpen={() => {
    document.getElementById('tags')?.focus()
  }}
  onClose={closeModal}
  onConfirm={addTagsToBookmarks}
  disableConfirm={isProcessing || tagsToAdd.length === 0}
  confirmText={isProcessing ? '处理中...' : '添加标签'}>
  <div class="mb-4">
    <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
      已选择 {selectedBookmarkUrls.length} 个书签
    </p>
    <div class="mb-4">
      <label
        for="tags"
        class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        添加标签
      </label>
      <TagInput
        id="tags"
        bind:tags={tagsToAdd}
        placeholder="输入标签，按回车添加多个标签" />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        提示：输入多个标签时请用回车键或逗号分隔
      </p>
    </div>
  </div>

  {#if errorMessage}
    <div
      class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
      {errorMessage}
    </div>
  {/if}

  {#if successMessage}
    <div
      class="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
      {successMessage}
    </div>
  {/if}
</Modal>
