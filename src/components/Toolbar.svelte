<script lang="ts">
  import { getContext } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { type NestedFilterExpression } from '../types/filters'
  import Statistics from './Statistics.svelte'
  import DropdownMenu from './DropdownMenu.svelte'
  import MoreVertIcon from './svg/MoreVertIcon.svelte'
  import FilterChips from './FilterChips.svelte'

  interface Stats {
    bookmarksCount: number
    tagsCount: number
    domainsCount: number
  }

  let { stats }: { stats: Stats } = $props()

  // Event dispatcher
  const dispatch = createEventDispatcher()

  let menuOpen = $state(false)
  // Selection mode state
  let selectionMode = $state(false)

  // Indicate if viewing deleted bookmarks
  let isViewingDeleted = $derived(
    getContext('sharedStatus').isViewingDeleted as boolean
  )

  let nestedFilterExpression: NestedFilterExpression = [
    [
      [
        {
          value: 'abcd',
          type: 'keyword',
        },
      ],
      [
        {
          value: '111',
          type: 'tag',
        },
        {
          value: '222',
          type: 'tag',
        },
        {
          value: '111',
          type: 'tag',
        },
        {
          value: '222',
          type: 'tag',
        },
      ],
      [
        {
          value: 'example.com',
          type: 'domain',
        },
        {
          value: 'example2.com',
          type: 'domain',
        },
        {
          value: 'example.com',
          type: 'domain',
        },
        {
          value: 'example2.com',
          type: 'domain',
        },
      ],
    ],
    [
      [
        {
          value: 'abcd',
          type: 'keyword',
        },
      ],
      [
        {
          value: '111',
          type: 'tag',
        },
        {
          value: '222',
          type: 'tag',
        },
      ],
      [
        {
          value: 'example.com',
          type: 'domain',
        },
        {
          value: 'example2.com',
          type: 'domain',
        },
        {
          value: 'example.com',
          type: 'domain',
        },
        {
          value: 'example2.com',
          type: 'domain',
        },
      ],
    ],
    [
      [
        {
          value: 'abcd',
          type: 'keyword',
        },
      ],
      [
        {
          value: '111',
          type: 'tag',
        },
        {
          value: '222',
          type: 'tag',
        },
        {
          value: '222',
          type: 'tag',
        },
        {
          value: '222',
          type: 'tag',
        },
      ],
      [
        {
          value: 'example.com',
          type: 'domain',
        },
        {
          value: 'example2.com',
          type: 'domain',
        },
      ],
    ],
  ]

  // nestedFilterExpression = []

  function handleFilterRemove(
    groupIndex: number,
    filterSetIndex: number,
    filterItemIndex: number
  ) {
    console.log('Remove filter', {
      groupIndex,
      filterSetIndex,
      filterItemIndex,
    })
    // 实际删除逻辑实现
  }

  /**
   * Toggle selection mode
   */
  function toggleSelectionMode() {
    selectionMode = !selectionMode
    dispatch('selectionModeChange', { selectionMode })
  }
</script>

<div
  class="toolbar z-40 flex h-11.25 flex-none items-center justify-between border-b border-(color:--seperator-line-color) bg-white/95 px-5 backdrop-blur-sm dark:bg-gray-900/95">
  <div class="left-tools flex flex-none items-center gap-2 py-1">
    <!-- 左侧工具按钮区域 -->
    <Statistics
      bookmarksCount={stats.bookmarksCount}
      tagsCount={stats.tagsCount}
      domainsCount={stats.domainsCount} />
  </div>
  <div
    class="right-tools flex flex-grow-1 flex-nowrap items-center justify-end gap-2 py-1 pl-5">
    <!-- <div
      class="filters-container flex flex-grow-1 flex-wrap items-center gap-1">
      <FilterChips {nestedFilterExpression} onRemove={handleFilterRemove} />
    </div> -->
    <!-- 右侧工具按钮区域 -->
    <div class="ml-auto flex items-center">
      <!-- Add selection mode toggle button -->
      <button
        class="toolbar-button ml-auto flex items-center"
        class:active={selectionMode}
        onclick={toggleSelectionMode}
        title="批量选择模式">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span class="ml-1">选择</span>
      </button>
    </div>
    <div class="relative flex flex-none">
      <button
        class="rounded-full p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        onclick={() => {
          if (!menuOpen) {
            setTimeout(() => {
              menuOpen = true
            })
          }
        }}>
        <MoreVertIcon />
      </button>

      <DropdownMenu
        bind:open={menuOpen}
        items={isViewingDeleted
          ? [
              { value: 'selectMode', label: '选择' },
              { value: 'openAll', label: '打开所有书签' },
            ]
          : [
              { value: 'selectMode', label: '选择' },
              { value: 'openAll', label: '打开所有书签' },
              { value: 'bookmarksExportCurrent', label: '导出当前筛选结果' },
              { value: 'bookmarksExportAll', label: '导出所有书签' },
            ]}
        selectedValue=""
        onSelect={(value) => {
          if (value === 'openAll') {
            // 打开所有书签的逻辑
            window.dispatchEvent(new CustomEvent('openAllBookmarks'))
            alert('Comming soon! 功能还未完成，敬请期待！')
          } else if (value === 'selectMode') {
            // 选择逻辑
            toggleSelectionMode()
            window.dispatchEvent(new CustomEvent('enterSelectionMode'))
          } else if (value === 'bookmarksExportCurrent') {
            window.dispatchEvent(
              new CustomEvent('bookmarksExport', {
                detail: { type: 'current' },
              })
            )
          } else if (value === 'bookmarksExportAll') {
            window.dispatchEvent(
              new CustomEvent('bookmarksExport', { detail: { type: 'all' } })
            )
          } else {
            alert('Comming soon! 功能还未完成，敬请期待！')
          }
        }}
        width="w-45" />
    </div>
  </div>
</div>

<style>
  .left-tools {
    /* width: calc(var(--aside-area-width) + var(--sidebar-width) - 28px); */
    /* height: 100%; */
  }
  .right-tools {
    /* width: calc(100% - var(--aside-area-width) - 20px); */
    /* height: 100%; */
  }

  .toolbar-button.active {
    background-color: rgba(79, 70, 229, 0.2);
    color: rgb(79, 70, 229);
  }
</style>
