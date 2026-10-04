import { DomEvent, type LatLng, Point } from 'leaflet'
import { toMapXY2D } from './coordinate.js'
import type { EoMap } from './EoMap.js'

export class XYPoint extends Point {
  constructor(x: number, y: number, round?: boolean) {
    super(2048 - y, x, round)
  }
}

export function xy(xy: [number, number]): [number, number]
export function xy(x: number, y: number): [number, number]
export function xy(
  arg1: number | [number, number],
  arg2?: number,
): [number, number] {
  if (!Array.isArray(arg1) && arg2 === undefined)
    throw new TypeError('Missing Y coordinate')
  const [x, y] = Array.isArray(arg1) ? arg1 : [arg1, arg2 ?? 0]
  return [2048 - y, x]
}

export function llXy(latlng: LatLng): [number, number] {
  return [latlng.lng, 2048 - latlng.lat]
}

export function eventToGame(e: any, map: EoMap): [number, number] {
  const c = llXy(
    map.containerPointToLatLng(
      DomEvent.getMousePosition(e, (map as any)._container),
    ),
  )
  return toMapXY2D(map.mapInfo, ...c)
}
