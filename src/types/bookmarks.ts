/**
 * The metadata of a bookmark.
 */
export type BookmarkMetadata = {
  title?: string
  // TODO: add short title in addBookmark.svelte
  shortTitle?: string
  description?: string
  note?: string
  favicon?: string
  coverImage?: string
  mainUrl?: string
  /**
   * The timestamp of the creation of the bookmark.
   * This value is set once when the bookmark is first created and should not change.
   */
  created: number
  /**
   * The timestamp of the last manual edit of the bookmark by the user.
   * This includes changes to title, URL, tags, description, notes, etc., through the edit interface.
   * It does NOT update on automated processes like sync, import, or batch operations unless those operations explicitly mimic a user edit.
   */
  updated: number
  /**
   * The timestamp of the last modification of the bookmark, regardless of the source.
   * This field is updated on any change to the bookmark's data, including:
   * - Manual user edits (same as 'updated').
   * - Automated processes like synchronization with a remote server.
   * - Bulk operations (e.g., batch tagging, batch deletion/restoration).
   * - Import processes that might update existing bookmarks.
   * This timestamp is useful for determining the most recent state of a bookmark for sync conflict resolution or general data auditing.
   */
  updated2?: number
}

/**
 * The tags and metadata of a bookmark.
 */
export type BookmarkTagsAndMetadata = {
  tags: string[]
  meta: BookmarkMetadata
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
    actionType: DeleteActionType
  }
  importedMeta?: {
    /**
     * The timestamp of the import of the bookmark.
     */
    imported: number
    /**
     * The source of the import.
     */
    source: string
    /**
     * The type of the import.
     */
    type: string
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

/**
 * A tuple representing a bookmark entry with its URL and associated data.
 * The first element is the bookmark URL (key), and the second element contains tags and metadata.
 * Used primarily in array-based bookmark operations and data transformations.
 */
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
 * This is the main data structure that holds all bookmark information.
 * It contains both the actual bookmark data and metadata about the store itself.
 */
export type BookmarksStore = {
  /**
   * The collection of all bookmarks, organized as a record with URLs as keys.
   * Each entry contains tags and metadata for a specific bookmark.
   */
  data: BookmarksData
  /**
   * Metadata about the bookmarks store.
   * Contains version information and timestamps for tracking database state.
   */
  meta: {
    /**
     * The version number of the database schema.
     * Used to handle migrations between different data structure versions.
     */
    databaseVersion: number
    /**
     * The timestamp when the bookmarks store was initially created.
     * Stored as milliseconds since epoch.
     */
    created: number
    /**
     * The timestamp when the bookmarks store was last updated.
     * Stored as milliseconds since epoch.
     */
    updated?: number
    /**
     * The timestamp when the bookmarks were last exported.
     * Only used during bookmark export operations.
     * Stored as milliseconds since epoch.
     */
    exported?: number
  }
}

export type TagHierarchyItem = {
  name: string
  path: string
  query: string
  count: number
  children: TagHierarchyItem[]
  expanded: boolean
}

/**
 * Props interface for BookmarkListItem component
 */
export type BookmarkListItemProps = {
  href: string
  tags: string[]
  title: string
  description?: string
  note?: string
  formatedUpdated?: string
  dateTitleText: string
}

/**
 * Represents the type of delete action performed on a bookmark.
 */
/**
 * Represents the specific type of action that led to a bookmark's (soft) deletion.
 * This helps in understanding the context of the deletion, especially for undo operations or analytics.
 */
export type DeleteActionType =
  | 'DELETE' // Standard deletion action initiated by the user.
  | 'IMPORT' // Bookmark was part of an import process and might have been marked for deletion based on import rules.
  | 'SYNC' // Deletion occurred as a result of a synchronization process with another data source.
  | 'BATCH_DELETE_BOOKMARKS' // Bookmark was deleted as part of a batch operation to remove multiple bookmarks.
  | 'BATCH_REMOVE_TAGS' // Bookmark was (soft) deleted because all its tags were removed in a batch operation.
  | 'LAST_TAG_REMOVED' // Bookmark was (soft) deleted because its last remaining tag was removed.
