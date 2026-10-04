import { Icon, Marker, Point } from 'leaflet'
import { fromMapXY2D, toMapXY2D } from '../coordinate.js'
import type { IMapInfo } from '../loader.js'
import { xy } from '../XYPoint.js'

export function iconMarker(
  x: number,
  y: number,
  iconUrl: string,
  mapInfo: IMapInfo,
  axisType = 'map',
  w = 32,
  h = 32,
) {
  const icon = new Icon({
    iconSize: new Point(w, h),
    iconUrl,
  })

  if (axisType === '3d') {
    const tempXY = toMapXY2D(mapInfo, x, y)
    x = tempXY[0]
    y = tempXY[1]
  }

  const marker = new Marker(xy(fromMapXY2D(mapInfo, x, y)), {
    icon,
    zIndexOffset: 1000,
    pane: 'popupPane',
  })

  return marker
}
