import { CRS, map as createLeafletMap, type LatLngBoundsLiteral } from 'leaflet'
import { EoMap } from './EoMap.js'
import { getRegion } from './fetchData.js'

export async function initMap(el: HTMLElement) {
  const lfMap = createLeafletMap(el, {
    crs: CRS.Simple,
    minZoom: -3,
    maxZoom: 4,
    attributionControl: false,
    zoomControl: false,
    inertiaMaxSpeed: 5000,
  })
  const map: EoMap = Object.setPrototypeOf(lfMap, EoMap.prototype)

  const regions = await getRegion()
  map.init(regions, el)

  return map
}

export const MAP_SIZE = 2048
export const MAP_BOUNDS: LatLngBoundsLiteral = [
  [0, 0],
  [MAP_SIZE, MAP_SIZE],
]
