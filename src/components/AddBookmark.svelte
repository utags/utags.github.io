<script lang="ts">
  import { splitTags, trimTitle } from 'utags-utils'
  import {
    bookmarks,
    checkBookmarksDataReady,
    settings,
  } from '../stores/stores'
  import { saveMergedBookmark } from '../stores/merged-bookmarks'
  import Modal from './Modal.svelte'
  import InputField from './ui/InputField.svelte'
  import BaseInputField from './ui/BaseInputField.svelte'
  import TagInput from './TagInput.svelte'
  import type { BookmarksStore, BookmarkEntry } from '../types/bookmarks'

  interface Props {
    show: boolean
    initialData?: {
      href?: string
      title?: string
      tags?: string[]
      description?: string
      note?: string
      favicon?: string
      coverImage?: string
    }
  }

  let { show = $bindable(), initialData }: Props = $props()

  let url = $state<string>('')
  let title = $state<string>('')
  let title2 = $state<string>('')
  let tagsArray = $state<string[]>([])
  let tagsArray2 = $state<string[]>([])
  let error = $state<string>('')
  let tagError = $state<string>('')
  let lastUrl = $state<string | undefined>()
  let description = $state<string>('')
  let description2 = $state<string>('')
  let note = $state<string>('')
  let note2 = $state<string>('')
  let showAdvancedFields = $derived($settings.alwaysShowAdvancedFields)
  let favicon = $state<string>('')
  let favicon2 = $state<string>('')
  let coverImage = $state<string>('')
  let coverImage2 = $state<string>('')
  let faviconError = $state<string>('')
  let coverImageError = $state<string>('')
  let isMergeMode = $state<boolean>(false)

  $effect(() => {
    if (show) {
      console.log('show', initialData)
      if (initialData?.href) {
        url = initialData?.href
        setTimeout(() => {
          validateUrl(true)
        })
      }
    } else {
      console.log('hide')
      reset()
    }
  })

  function isEditMode(): boolean {
    return !!initialData?.href
  }

  function validateFavicon(): void {
    if (!favicon) {
      faviconError = ''
      return
    }
    try {
      new URL(favicon)
      faviconError = ''
    } catch {
      faviconError = '请输入有效的URL格式'
    }
  }

  function validateCoverImage(): void {
    if (!coverImage) {
      coverImageError = ''
      return
    }
    try {
      new URL(coverImage)
      coverImageError = ''
    } catch {
      coverImageError = '请输入有效的URL格式'
    }
  }

  function validateUrl(isFirst = false): boolean {
    if (!url) {
      return false
    }
    try {
      url = new URL(url).href
      error = ''
      if (url === lastUrl) {
        return true
      }

      const entry = $bookmarks.data[url]
      isMergeMode = false
      if (entry) {
        if (isEditMode() && !isFirst && url !== initialData?.href) {
          // 编辑模式修改 URL 并已存在另一个书签时
          console.log('edit mode', url, entry)
          error = '该书签已存在，请手动合并后保存或更改为其他 URL。'
          isMergeMode = true
          title2 = entry.meta.title || ''
          description2 = entry.meta.description || ''
          note2 = entry.meta.note || ''
          favicon2 = entry.meta.favicon || ''
          coverImage2 = entry.meta.coverImage || ''
          tagsArray2 = entry.tags
        } else {
          // 添加模式或编辑模式开始时
          if (entry && url !== lastUrl) {
            if (!isEditMode()) {
              error = '该书签已存在，您可以编辑后保存或更改为其他 URL。'
            }
            title = entry.meta.title || ''
            description = entry.meta.description || ''
            note = entry.meta.note || ''
            favicon = entry.meta.favicon || ''
            coverImage = entry.meta.coverImage || ''
            tagsArray = entry.tags
            showAdvancedFields =
              $settings.alwaysShowAdvancedFields ||
              !!description ||
              !!note ||
              !!favicon ||
              !!coverImage
          }
        }
      } else {
        // 编辑模式下，未找到该书签
        if (isEditMode() && isFirst) {
          error =
            '未找到该书签，可能已被删除。\n您可以输入标签等信息后添加新的书签，或刷新页面重试。'
        }
      }

      lastUrl = url
      return true
    } catch {
      lastUrl = undefined
      error = '请输入有效的URL格式（例如: https://example.com）'
      return false
    }
  }

  function validateTags(): boolean {
    if (tagsArray.length === 0) {
      tagError = '至少需要输入一个标签，请使用逗号分隔多个标签'
      return false
    }

    tagError = ''
    return true
  }

  function addBookmark(): void {
    checkBookmarksDataReady()
    title = trimTitle(title)
    if (!validateUrl() || !validateTags()) {
      return
    }

    const entry = $bookmarks.data[url]
    if (entry) {
      const clonedEntry = JSON.parse(JSON.stringify(entry))
      entry.tags = tagsArray
      entry.meta = {
        ...entry.meta,
        title: title || undefined,
        description: description || undefined,
        note: note || undefined,
        favicon: favicon || undefined,
        coverImage: coverImage || undefined,
        updated: Date.now(),
      }

      if (isMergeMode) {
        const orgUrl = initialData?.href
        if (orgUrl) {
          const message = `确定要将 '${orgUrl}' 合并到 '${url}' 吗？`
          if (!confirm(message)) {
            return
          }

          saveMergedBookmark(
            { key: orgUrl, entry: $bookmarks.data[orgUrl] },
            { key: url, entry: clonedEntry },
            { key: url, entry: entry },
            { actionType: 'edit' }
          )

          delete $bookmarks.data[orgUrl]
        }
      }
    } else {
      const newEntry: BookmarkEntry = {
        tags: tagsArray,
        meta: {
          title: title || undefined,
          description: description || undefined,
          note: note || undefined,
          favicon: favicon || undefined,
          coverImage: coverImage || undefined,
          updated: Date.now(),
          created: Date.now(),
        },
      }
      $bookmarks.data[url] = newEntry

      const orgUrl = initialData?.href
      if (orgUrl && orgUrl !== url) {
        delete $bookmarks.data[orgUrl]
      }
    }

    console.log('addBookmark', $bookmarks.data[url])
    bookmarks.set($bookmarks)
    close()
    // 是否应该显示全部书签？当前筛选结果可能不会显示新添加的书签或修改的书签。如果显示全部书签，当前筛选条件会被重置。
    // location.hash = '#'
  }

  function reset(): void {
    url =
      title =
      title2 =
      description =
      description2 =
      note =
      note2 =
      favicon =
      favicon2 =
      coverImage =
      coverImage2 =
      error =
      tagError =
      faviconError =
      coverImageError =
        ''

    showAdvancedFields = $settings.alwaysShowAdvancedFields
    lastUrl = undefined
    initialData = undefined
    isMergeMode = false
    tagsArray = []
    tagsArray2 = []
  }

  function close(): void {
    show = false

    // 因为 onblur 事件发生时会校验，所以需要延迟重置表单
    setTimeout(reset)
    setTimeout(reset, 300)
  }
</script>

<Modal
  title="添加新书签"
  isOpen={show}
  onOpen={() => {
    document.getElementById('url-input')?.focus()
  }}
  onClose={close}
  onInputEnter={addBookmark}
  onConfirm={addBookmark}
  disableConfirm={!url || tagsArray.length === 0}
  confirmText="保存">
  <InputField
    id="url-input"
    bind:value={url}
    classNames={isMergeMode ? 'merge-mode-input-element' : ''}
    placeholder="https://example.com"
    {error}
    onBlur={() => setTimeout(validateUrl)}>
    URL:
  </InputField>
  <div class="mb-4">
    <label
      for="tags-input"
      class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
      标签（逗号分隔）:
    </label>
    <TagInput
      id="tags-input"
      bind:tags={tagsArray}
      placeholder="输入标签，按回车添加"
      disabled={!url} />
    {#if tagError && tagsArray.length === 0}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{tagError}</p>
    {/if}
  </div>
  {#if isMergeMode}
    <div class="mb-4">
      <TagInput
        id="tags-input-2"
        bind:tags={tagsArray2}
        placeholder=""
        class="merge-mode-input-element !cursor-default !opacity-70"
        disabled />
    </div>
  {/if}

  <BaseInputField
    id="title-input"
    bind:value={title}
    disabled={!url}
    placeholder="输入标题（可选）">
    标题:
  </BaseInputField>
  <BaseInputField
    show={isMergeMode}
    id="title-input-2"
    bind:value={title2}
    classNames="merge-mode-input-element"
    disabled
    placeholder="">
  </BaseInputField>

  <div class="mt-4 flex items-center justify-between">
    <button
      type="button"
      class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      onclick={() => (showAdvancedFields = !showAdvancedFields)}>
      {showAdvancedFields ? '隐藏高级选项' : '显示高级选项'}
    </button>

    <label
      class="flex items-center text-sm text-gray-500 select-none dark:text-gray-400">
      <input
        type="checkbox"
        class="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-600"
        bind:checked={$settings.alwaysShowAdvancedFields} />
      总是显示
    </label>
  </div>

  {#if showAdvancedFields}
    <BaseInputField
      id="description-input"
      bind:value={description}
      disabled={!url}
      placeholder="输入描述（可选）"
      type="textarea"
      rows={3}>
      描述:
    </BaseInputField>
    <BaseInputField
      show={isMergeMode}
      id="description-input-2"
      bind:value={description2}
      classNames="merge-mode-input-element"
      disabled
      placeholder=""
      type="textarea"
      rows={3}>
    </BaseInputField>
    <BaseInputField
      id="note-input"
      bind:value={note}
      disabled={!url}
      placeholder="输入备注（可选）"
      type="textarea"
      rows={3}>
      备注:
    </BaseInputField>
    <BaseInputField
      show={isMergeMode}
      id="note-input-2"
      bind:value={note2}
      classNames="merge-mode-input-element"
      disabled
      placeholder=""
      type="textarea"
      rows={3}>
    </BaseInputField>
  {/if}

  <!-- 在高级选项部分添加图片上传字段 -->
  {#if showAdvancedFields}
    <InputField
      id="favicon-input"
      bind:value={favicon}
      disabled={!url}
      placeholder="输入 favicon URL（可选）"
      error={faviconError}
      onBlur={validateFavicon}>
      Favicon URL:
    </InputField>
    {#if favicon}
      <div class="mt-1 flex items-center">
        <img
          src={favicon}
          alt="favicon preview"
          class="h-6 w-6"
          onerror={() => (faviconError = '图片加载失败')} />
      </div>
    {/if}
    <BaseInputField
      show={isMergeMode}
      id="favicon-input-2"
      bind:value={favicon2}
      classNames="merge-mode-input-element"
      disabled
      placeholder="">
    </BaseInputField>
    {#if favicon2}
      <div class="mt-1 flex items-center">
        <img src={favicon2} alt="favicon preview" class="h-6 w-6" />
      </div>
    {/if}

    <InputField
      id="cover-image-input"
      bind:value={coverImage}
      disabled={!url}
      placeholder="输入封面图 URL（可选）"
      error={coverImageError}
      onBlur={validateCoverImage}>
      封面图 URL:
    </InputField>
    {#if coverImage}
      <div class="mt-1">
        <img
          src={coverImage}
          alt="封面图预览"
          class="h-32 w-full object-cover"
          onerror={() => (coverImageError = '图片加载失败')} />
        <!-- {#if coverImageError}
          <span class="text-sm text-red-500">{coverImageError}</span>
        {/if} -->
      </div>
    {/if}
    <BaseInputField
      show={isMergeMode}
      id="cover-image-input-2"
      bind:value={coverImage2}
      classNames="merge-mode-input-element"
      disabled
      placeholder="">
    </BaseInputField>
    {#if coverImage2}
      <div class="mt-1">
        <img
          src={coverImage2}
          alt="封面图预览"
          class="h-32 w-full object-cover" />
      </div>
    {/if}
  {/if}
</Modal>
