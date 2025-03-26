/**
 * The tags and metadata of a bookmark.
 */
export type BookmarkTagsAndMetadata = {
  tags: string[]
  meta: {
    title?: string
    description?: string
    note?: string
    favicon?: string
    coverImage?: string
    mainUrl?: string
    /**
     * The timestamp of the creation of the bookmark.
     */
    created: number
    /**
     * The timestamp of the last update of the bookmark.
     */
    updated: number
  }
  // /**
  //  * The alternate URLs of the bookmark.
  //  */
  // urls?: string[]
  // relatedUrls: []
  /**
   * The hilights of the bookmark.
   */
  hilights?: [
    {
      /**
       * The timestamp of the creation of the hilight.
       */
      created: number
      /**
       * The timestamp of the last update of the hilight.
       */
      updated: number
      /**
       * The text of the hilight.
       */
      text: string
      color?: string
      /**
       * The note of the hilight.
       */
      note?: string
      /**
       * The type of the hilight.
       */
      type?: string
    },
  ]
  deletedMeta?: {
    /**
     * The timestamp of the deletion of the bookmark.
     */
    deleted: number
    actionType: 'delete' | 'import' | 'sync'
  }
}

/**
 * Alias for BookmarkTagsAndMetadata
 */
export type BookmarkEntry = BookmarkTagsAndMetadata

/**
 * The key is the URL of the bookmark.
 */
export type BookmarkKey = string

export type BookmarkKeyValuePair = [BookmarkKey, BookmarkTagsAndMetadata]

export type BookmarkObject = {
  key: BookmarkKey
  entry: BookmarkTagsAndMetadata
}

/**
 * The value is an object containing the tags and metadata of the bookmark.
 */
export type BookmarksData = Record<BookmarkKey, BookmarkTagsAndMetadata>

/**
 * The bookmarks store.
 */
export type BookmarksStore = {
  data: BookmarksData
  meta: {
    databaseVersion: number
    created: number
    exported?: number
  }
}
