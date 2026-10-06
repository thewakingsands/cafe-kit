import {
  type Direction,
  DivIcon,
  Icon,
  Marker,
  Point,
  type Tooltip,
} from 'leaflet'
import { getIconUrl, type IMapMarker } from './loader.js'
import { xy } from './XYPoint.js'

const ICON_STORAGE = new Map<number, Icon | null>()

export function isMinimap(icon: number) {
  return icon > 63200 && icon < 63500
}

export function getIcon(icon?: number): Icon | null {
  if (!icon) return null
  const cached = ICON_STORAGE.get(icon)
  if (cached !== undefined) return cached
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
  if ((markerInfo.orientation ?? 0) === 0) {
    return null
  }

  let icon: Icon | DivIcon | null = getIcon(markerInfo.icon)
  const extraClass = []

  let type = typeMap[markerInfo.dataType ?? 0] || 'unkown'
  if (markerInfo.type === 1) {
    type = 'area'
  }
  const text = type === 'tooltip' ? markerInfo.dataKey : markerInfo.name

  if (!icon && !text) {
    return null
  }

  let direction = orientationMap[markerInfo.orientation ?? 0] || 'auto'
  if (!icon) {
    icon = emptyIcon
    direction = 'center'
    extraClass.push('no-icon')
  }

  const label = document.createElement('span')
  label.textContent = text ?? ''
  label.style.whiteSpace = 'pre'

  const marker = new Marker(xy(markerInfo.x, markerInfo.y), {
    icon,
    interactive:
      type === 'aetheryte' || type === 'travel' || !!markerInfo.dataKey,
  })

  marker.on('add', () => {
    const el = marker.getElement()
    if (!el) return
    el.dataset.dataKey = markerInfo.dataKey ?? ''
    el.dataset.dataType = `${markerInfo.dataType ?? 0}`
  })
  ;(marker as any).on('tooltipopen', ({ tooltip }: { tooltip: Tooltip }) => {
    const el = tooltip.getElement()
    if (!el) return
    el.dataset.dataKey = markerInfo.dataKey ?? ''
    el.dataset.dataType = `${markerInfo.dataType ?? 0}`
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
