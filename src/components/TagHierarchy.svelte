<script lang="ts">
  // 层级标签组件 - 用于展示以'/'分隔的标签层级结构
  // Folder And Hierarchy Tags
  import type { TagHierarchyItem } from '../types/bookmarks.js'
  import FolderItem from './FolderItem.svelte'
  import ExpandIcon from './ui/ExpandIcon.svelte'
  import GroupSeparator from './ui/GroupSeparator.svelte'
  import ExpandableContainer from './ui/ExpandableContainer.svelte'

  let {
    tagHierarchyItems = [],
  }: {
    tagHierarchyItems: TagHierarchyItem[]
  } = $props()

  let folders = $derived(tagHierarchyItems)
  let expanded = $state(true)
</script>

{#if folders.length > 0}
  <GroupSeparator />
  <div class="group">
    <div class="group-title" onclick={() => (expanded = !expanded)}>
      <span class="flex-1 text-left font-semibold">层级标签</span>
      <div class="group-title-button {expanded ? '' : 'opacity-100'}">
        <ExpandIcon {expanded} />
      </div>
    </div>

    <ExpandableContainer {expanded}>
      {#each folders as folder}
        <FolderItem {...folder} />
      {/each}
    </ExpandableContainer>
  </div>
{/if}
