import { formatIconUrl, formatMapUrl } from '@thewakingsands/xivapi-v2'

export const NULL_ICON_GROUP = '000000'

export function getMapUrl(id: string) {
  return formatMapUrl(id)
}

export function getIconUrl(icon: string): string | null {
  if (parseIcon(icon).id === NULL_ICON_GROUP) return null
  return formatIconUrl(icon)
}

export function parseIcon(icon: string): IIconParseResult {
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
  '#': string
  id: string
  sizeFactor: number
  'placeName{Region}': string
  'placeName{Sub}': string
  'offset{X}': number
  'offset{Y}': number
  territoryType: string
  placeName: string
  mapMarkerRange: number
  hierarchy: number
}

export interface IMapMarker {
  '#': string
  x: number
  y: number
  icon: string
  'placeName{Subtext}': string
  subtextOrientation: number
  mapMarkerRegion: string
  type: number
  'data{Type}': number
  'data{Key}': string
}
