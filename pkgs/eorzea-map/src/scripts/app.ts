import createElement from 'crel'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../stylesheets/index.styl'
import { fromMapXY2D } from './coordinate.js'
import type { EoMap } from './EoMap.js'
import { initEvents } from './events.js'
import { getRegion, setApiUrl } from './fetchData.js'
import * as loader from './loader.js'
import { initMap } from './map.js'
import { xy } from './XYPoint.js'

const { Icon, Marker, Point } = L
// Keep the public DOM helper typed without requiring an ambient crel declaration.
const crel: (tag: string, ...children: any[]) => HTMLElement = createElement

async function create(mapEl: HTMLElement) {
  mapEl.innerHTML = ''
  const map = await initMap(mapEl)
  initEvents(mapEl, map)
  return map
}

async function init() {
  untypedWindow.currentMapKey = 92
  const mapEl = document.querySelector('section.map') as HTMLElement
  const map = await create(mapEl)

  map.on('loadMapKey', (e: any) => {
    untypedWindow.currentMapKey = e.mapKey
    if (location.hash.toString().indexOf('f=mark') < 0) {
      history.replaceState('', '', `#f=area&id=${e.mapKey}`)
    }
  })

  if (!(await loadHash(map))) {
    await map.loadMapKey(untypedWindow.currentMapKey)
  }

  window.addEventListener('hashchange', () => {
    loadHash(map).catch(console.error)
  })
}

async function loadHash(map: EoMap) {
  const args = Object.fromEntries(new URLSearchParams(location.hash.slice(1)))
  if (args.f === 'area' && args.id) {
    if (Number(args.id) === untypedWindow.currentMapKey) {
      return true
    }
    await map.loadMapKey(Number(args.id))
    return true
  }
  if (args.f === 'mark' && args.id && args.x && args.y) {
    await map.loadMapKey(Number(args.id))
    const marker = simpleMarker(
      Number(args.x),
      Number(args.y),
      loader.getIconUrl('ui/icon/060000/060561.tex') ?? '',
      map.mapInfo,
    )
    map.addMarker(marker)
    setTimeout(() => {
      map.setView(map.mapToLatLng2D(Number(args.x), Number(args.y)), 0)
    }, 100)
    return true
  }
}

function simpleMarker(
  x: number,
  y: number,
  iconUrl: string,
  mapInfo: loader.IMapInfo,
) {
  const icon = new Icon({
    iconSize: new Point(32, 32),
    iconUrl,
  })
  const marker = new Marker(xy(fromMapXY2D(mapInfo, x, y)), {
    icon,
    zIndexOffset: 1000,
    pane: 'popupPane',
  })
  return marker
}

function setCdnUrl(url: string) {
  setApiUrl(`${url.replace(/\/+$/, '')}/data/`)
}

const untypedWindow = window as any

const version = __LIB_VERSION__

export type { EoMap } from './EoMap.js'
export type { IMapInfo, IMapMarker } from './loader.js'
export * from './markers/index.js'
export {
  create,
  crel,
  getRegion,
  L,
  loader,
  setApiUrl,
  setCdnUrl,
  simpleMarker,
  version,
  xy,
}

if (untypedWindow.standaloneEorzeaMap) {
  init().catch((e) => console.error(e))
}
