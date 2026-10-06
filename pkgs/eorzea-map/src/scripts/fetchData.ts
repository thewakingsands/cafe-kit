import type { IMapInfo, IMapMarker } from './loader.js'

let apiUrl = 'https://map.ffcafe.cn/assets/data/'
const requests = new Map<string, Promise<unknown>>()

export function setApiUrl(url: string) {
  apiUrl = `${url.replace(/\/+$/, '')}/`
  requests.clear()
}

export async function getMapMarkers(map: IMapInfo): Promise<IMapMarker[]> {
  const markers = await fetchDataFile<IMapMarker[]>('mapMarker.json')
  return markers
    .filter((marker) => marker['#'].startsWith(`${map.mapMarkerRange}.`))
    .reverse()
}

export async function getMap(mapKey: number): Promise<IMapInfo> {
  const maps = await fetchDataFile<IMapInfo[]>('map.json')
  const map = maps.find((map) => map?.['#'] === String(mapKey))
  if (!map?.id) throw new Error(`Map ${mapKey} was not found`)
  return map
}

export async function getMapKeyById(mapId: string): Promise<number> {
  const maps = await fetchDataFile<IMapInfo[]>('map.json')
  const map = maps.find((map) => map?.id === mapId)
  if (!map) throw new Error(`Map ${mapId} was not found`)
  return Number(map['#'])
}

export async function getRegion(): Promise<IRegion[]> {
  const regions = await fetchDataFile<IRegion[]>('region.json')
  // Older datasets may list locations without a loadable map asset.
  return regions
    .map((region) => ({
      ...region,
      maps: region.maps.filter((map) => map.id),
    }))
    .filter((region) => region.maps.length > 0)
}

async function fetchDataFile<T>(filename: string): Promise<T> {
  const url = apiUrl + filename
  let request = requests.get(url)
  if (!request) {
    request = fetch(url, { mode: 'cors', credentials: 'omit' }).then(
      async (response) => {
        if (!response.ok)
          throw new Error(`Failed to load ${url}: HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error(`Invalid map data: ${url}`)
        return data
      },
    )
    requests.set(url, request)
  }
  try {
    return (await request) as T
  } catch (error) {
    if (requests.get(url) === request) requests.delete(url)
    throw error
  }
}

export interface IRegion {
  regionName: string
  maps: Array<{
    id: string
    key: number
    hierarchy: number
    name: string
    subName: string
  }>
}
