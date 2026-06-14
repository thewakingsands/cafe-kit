import * as Models from './models.js'

export { Models }

export interface Options {
  /**
   * The supported version of the game to use for the API.
   * @default "latest"
   */
  version?: string
  /**
   * Language to use for the API.
   */
  language?: keyof typeof Models.SchemaLanguage
  /**
   * Whether to enable verbose logging.
   * @default false
   */
  verbose?: boolean
}

/**
 * Query parameters accepted by the search endpoint.
 * @see https://v2.xivapi.com/api/docs#tag/search/get/search
 */
export type SearchParams = Models.SearchQuery &
  Models.VersionQuery &
  Models.RowReaderQuery & { verbose?: boolean }
