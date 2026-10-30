import { formatIconUrl, formatMapUrl } from '@thewakingsands/xivapi-v2'

export const NULL_ICON_GROUP = '000000'

export type MapUrlResolver = (id: string) => string
export type IconUrlResolver = (id: number) => string | null

let mapUrlResolver: MapUrlResolver | undefined
let iconUrlResolver: IconUrlResolver | undefined

export function setMapUrlResolver(resolver?: MapUrlResolver) {
  mapUrlResolver = resolver
}

export function setIconUrlResolver(resolver?: IconUrlResolver) {
  iconUrlResolver = resolver
}

export function getMapUrl(id: string) {
  if (mapUrlResolver) return mapUrlResolver(id)
  return formatMapUrl(id, { format: 'webp' })
}

export function getIconUrl(icon?: string | number): string | null {
  if (!icon) return null
  if (typeof icon === 'number') {
    if (!Number.isInteger(icon) || icon < 0 || icon > 999999) return null
    const group = String(Math.floor(icon / 1000) * 1000).padStart(6, '0')
    icon = `ui/icon/${group}/${String(icon).padStart(6, '0')}.tex`
  }
  const { id } = parseIcon(icon)
  if (id === NULL_ICON_GROUP) return null
  if (iconUrlResolver) return iconUrlResolver(Number(id))
  return formatIconUrl(icon)
}

export function parseIcon(icon?: string): IIconParseResult {
  const matches = icon?.match(/^ui\/icon\/(\d{6})\/(\d{6})(?:_hr1)?\.tex$/)
  return {
    group: matches?.[1] ?? NULL_ICON_GROUP,
    id: matches?.[2] ?? NULL_ICON_GROUP,
  }
}

export interface IIconParseResult {
  group: string
  id: string
}

export interface IMapInfo {
  rowId: number
  id: string
  sizeFactor: number
  placeNameSub?: string
  offsetX?: number
  offsetY?: number
  placeName?: string
  marker: number
}

export interface IMapMarker {
  x: number
  y: number
  icon?: number
  name?: string
  orientation?: number
  type?: number
  dataType?: number
  dataKey?: string
}
