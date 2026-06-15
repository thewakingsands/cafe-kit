import { Assets, formatIconUrl } from './lib/assets.js'
import { Sheet, Sheets } from './lib/sheets.js'
import type { Models, Options, SearchParams } from './types/index.js'
import { CustomError, request } from './utils.js'

export * from './types/index.js'
export { formatIconUrl }

export default class XIVAPI {
  public readonly options: Options

  public readonly achievements: Sheet<'Achievement'>
  public readonly minions: Sheet<'Companion'>
  public readonly mounts: Sheet<'Mount'>
  public readonly items: Sheet<'Item'>

  /**
   * Raw endpoints for the API. Please consider using the typed endpoints instead.
   * @see https://v2.xivapi.com/api/docs
   * @since 0.5.0
   */
  public readonly data = {
    /**
     * @see https://v2.xivapi.com/api/docs#tag/sheets
     * @since 0.5.0
     */
    sheets: () => new Sheets(this.options),
    /**
     * @see https://v2.xivapi.com/api/docs#tag/assets
     * @since 0.5.0
     */
    assets: () => new Assets(),
  }

  /**
   * A wrapper for the XIVAPI v2 API.
   * @param {Options} [options] The client options to fetch with.
   * @see https://v2.xivapi.com/api/docs
   * @since 0.5.0
   */
  constructor(
    options: Options = {
      version: 'latest',
      language: 'en',
      verbose: false,
    },
  ) {
    this.achievements = new Sheet('Achievement', options)
    this.minions = new Sheet('Companion', options)
    this.mounts = new Sheet('Mount', options)
    this.items = new Sheet('Item', options)

    this.options = options
  }

  /**
   * Fetch information about rows and their related data that match the provided search query.
   * @param {Models.SearchQuery} params Query paramters accepted by the search endpoint.
   * @returns {Promise<Models.SearchResponse>} Response structure for the search endpoint.
   * @see https://v2.xivapi.com/api/docs#tag/search/get/search
   * @since 0.5.0
   */
  public async search<Fields = object, Transient = object>(
    params: SearchParams,
  ): Promise<Models.SearchResponse<Fields, Transient>> {
    const { data, errors } = await request({
      path: '/search',
      params: params as Record<string, unknown>,
    })
    if (errors) throw new CustomError(errors[0].message)
    return data as Models.SearchResponse<Fields, Transient>
  }

  /**
   * Format icon path to url. Supports following formats:
   * v1: `/i/030000/030000.png`
   * v2: `ui/icon/030000/030000_hr1.tex`
   */
  formatIconUrl = formatIconUrl
}
