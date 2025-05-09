import { get } from 'svelte/store'
import { settings } from './stores.js'
import { getCollections } from './collections.js'
import { filters } from './saved-filters.js'
import { releaseNotes } from '../data/release-notes'
import { releaseNotes as releaseNotesCN } from '../data/release-notes-zh-CN'
import { bookmarkStorage } from '../lib/bookmark-storage'

function initializeSettings() {
  console.log('initializing settings')
  const $settings = get(settings)
  console.log($settings.headerToolbarSettings)
  if (!$settings.headerToolbarSettings) {
    const headerToolbarSettings = {
      theme: false,
      sortBy: true,
      sidebarPosition: false,
      viewMode: true,
      skin: true,
      addButton: true,
    }
    settings.set({ ...$settings, headerToolbarSettings })
  }
}

function initializeBookmarks() {
  const releaseNotesBookmarks = Object.entries(releaseNotesCN)
  bookmarkStorage.updateBookmarks(releaseNotesBookmarks)
}

function initializeCollections() {
  const collections = getCollections()
  const $collections = get(collections)
  if ($collections.length === 0) {
    const now = Date.now()
    const collectionsPreset = [
      {
        id: crypto.randomUUID(),
        name: 'All',
        pathname: 'all',
        filterString: '',
        created: now,
        updated: now,
      },
      {
        id: crypto.randomUUID(),
        name: 'Unread',
        pathname: 'unread',
        filterString: 'is:unread',
        created: now,
        updated: now,
      },
    ]

    for (const preset of collectionsPreset) {
      $collections.push(preset)
    }

    collections.set($collections)
  }
}

function initializeFilters() {
  const $filters = get(filters)
  if ($filters.length === 0) {
    const now = Date.now()
    const filtersPreset = [
      {
        id: crypto.randomUUID(),
        name: 'All',
        description: 'all',
        filterString: '',
        created: now,
        updated: now,
      },
      {
        id: crypto.randomUUID(),
        name: 'Unread',
        description: 'unread',
        filterString: 'is:unread',
        created: now,
        updated: now,
      },
    ]

    for (const preset of filtersPreset) {
      $filters.push(preset)
    }

    filters.set($filters)
  }
}

export default function initializeStores() {
  const $settings = get(settings)

  initializeBookmarks()

  // only run once
  if ($settings.isFirstRun) {
    initializeCollections()
  }

  initializeFilters()

  // run every time when loading stores
  initializeSettings()
}
