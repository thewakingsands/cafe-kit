import {
  type Direction,
  DivIcon,
  Icon,
  Marker,
  Point,
  type Tooltip,
} from 'leaflet'
import {
  getIconUrl,
  type IMapMarker,
  NULL_ICON_GROUP,
  parseIcon,
} from './loader.js'
import { xy } from './XYPoint.js'

const ICON_STORAGE = new Map<string, Icon | null>()

export function isMinimap(icon: string) {
  const { id } = parseIcon(icon)
  const intId = Number(id)
  return intId > 63200 && intId < 63500
}

export function getIcon(icon: string): Icon | null {
  const cached = ICON_STORAGE.get(icon)
  if (cached !== undefined) return cached
  const { group } = parseIcon(icon)
  if (group === NULL_ICON_GROUP) {
    ICON_STORAGE.set(icon, null)
    return null
  }
  // Minimap textures are rendered as image overlays by EoMap.
  if (isMinimap(icon)) {
    return null
  }
  const iconSize = new Point(32, 32)
  const iconUrl = getIconUrl(icon)
  if (!iconUrl) return null
  const mapIcon = new Icon({
    iconSize,
    iconUrl,
  })
  ICON_STORAGE.set(icon, mapIcon)
  return mapIcon
}

const orientationMap: Record<number, Direction> = {
  1: 'left',
  2: 'right',
  3: 'bottom',
  4: 'top',
}

const typeMap: Record<number, string> = {
  0: 'normal',
  1: 'travel',
  3: 'aetheryte',
  4: 'tooltip',
}

const emptyIcon = new DivIcon({
  iconSize: new Point(0, 0),
})

export function createMarker(markerInfo: IMapMarker): Marker | null {
  if (markerInfo.subtextOrientation === 0) {
    return null
  }

  let icon: Icon | DivIcon | null = getIcon(markerInfo.icon)
  const extraClass = []

  let type = typeMap[markerInfo['data{Type}']] || 'unkown'
  if (markerInfo.type === 1) {
    type = 'area'
  }
  const text =
    type === 'tooltip'
      ? markerInfo['data{Key}']
      : markerInfo['placeName{Subtext}']

  if (!icon && !text) {
    return null
  }

  let direction = orientationMap[markerInfo.subtextOrientation] || 'auto'
  if (!icon) {
    icon = emptyIcon
    direction = 'center'
    extraClass.push('no-icon')
  }

  const label = document.createElement('span')
  label.textContent = text
  label.style.whiteSpace = 'pre'

  const marker = new Marker(xy(markerInfo.x, markerInfo.y), {
    icon,
    interactive:
      type === 'aetheryte' || type === 'travel' || !!markerInfo['data{Key}'],
  })

  marker.on('add', () => {
    const el = marker.getElement()
    if (!el) return
    el.dataset.dataKey = markerInfo['data{Key}']
    el.dataset.dataType = `${markerInfo['data{Type}']}`
  })
  ;(marker as any).on('tooltipopen', ({ tooltip }: { tooltip: Tooltip }) => {
    const el = tooltip.getElement()
    if (!el) return
    el.dataset.dataKey = markerInfo['data{Key}']
    el.dataset.dataType = `${markerInfo['data{Type}']}`
  })

  if (!text) {
    return marker
  }

  const className = [type, direction]
    .concat(extraClass)
    .map((x) => `eorzea-map-label-${x}`)
    .concat(['eorzea-map-label'])
    .join(' ')

  marker.bindTooltip(label, {
    permanent: type !== 'tooltip',
    className,
    direction: type === 'tooltip' ? 'auto' : direction,
    interactive: type === 'aetheryte' || type === 'travel',
  })

  if (type !== 'tooltip') {
    marker.openTooltip()
  }
  return marker
}
