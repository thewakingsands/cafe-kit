import type { Models, Options } from '../types/index.js'
import { CustomError, endpoint, request } from '../utils.js'

/**
 * Endpoints for accessing game data on a file-by-file basis. Commonly useful for fetching icons or other textures to display on the web.
 * @see https://v2.xivapi.com/api/docs#tag/assets
 */
export class Assets {
  constructor(private readonly options: Options = {}) {}

  /**
   * Read an asset from the game at the specified path, converting it into a usable format. If no valid conversion between the game file type and specified format exists, an error will be returned.
   * @param {Models.AssetQuery} params Query parameters accepted by the asset endpoint.
   * @returns {Promise<ArrayBuffer>} An image of the asset.
   * @see https://v2.xivapi.com/api/docs#tag/assets/get/asset
   */
  async get(params: Models.AssetQuery): Promise<ArrayBuffer> {
    const { data, errors } = await request({
      path: '/asset',
      params: params as unknown as Record<string, unknown>,
      options: this.options,
    })
    if (errors) throw new CustomError(errors[0].message)
    return data as ArrayBuffer
  }

  /** Retrieve a composed map using the Map sheet's Id, e.g. s1d1/00. */
  async map(id: string, params: Models.MapQuery = {}): Promise<ArrayBuffer> {
    const { data, errors } = await request({
      path: formatMapUrl(id, params),
    })
    if (errors) throw new CustomError(errors[0].message)
    return data as ArrayBuffer
  }
}

/** URL suitable for an img element or a Leaflet image overlay. */
export function formatMapUrl(id: string, params: Models.MapQuery = {}): string {
  if (!/^[a-zA-Z0-9_-]+\/\d{2}$/.test(id)) {
    throw new TypeError(`Invalid map ID: ${id}`)
  }
  const url = new URL(`${endpoint}/api/asset/map/${id}`)
  if (params.format) url.searchParams.set('format', params.format)
  return url.toString()
}

export const formatIconUrl = (input: string | Models.Icon) => {
  const path = typeof input === 'string' ? input : input.path_hr1 || input.path
  if (path.startsWith('/i/')) {
    return `${endpoint}${path}`
  }

  return `${endpoint}/api/asset?path=${encodeURIComponent(path)}`
}
