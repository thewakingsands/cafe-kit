import {
  type ImageOverlay,
  imageOverlay,
  type Layer,
  LayerGroup,
  type Control as LFControl,
  Map as LFMap,
  type Marker,
} from 'leaflet'
import { AreaControl } from './controls/AreaControl.js'
import { NavigateControl } from './controls/NavigateControl.js'
import { PosControl } from './controls/PosControl.js'
import { RightLayerControl } from './controls/RightLayerControl.js'
import { fromMapXY2D, toMapXY2D, toMapXY3D } from './coordinate.js'
import {
  getMap,
  getMapKeyById,
  getMapMarkers,
  type IRegion,
} from './fetchData.js'
import { createSvgUrl } from './gridSvg.js'
import { getIconUrl, getMapUrl, type IMapInfo } from './loader.js'
import { MAP_BOUNDS, MAP_SIZE } from './map.js'
import { createMarker, isMinimap } from './marker.js'
import { xy } from './XYPoint.js'

export class EoMap extends LFMap {
  public declare mapInfo: IMapInfo

  private declare markers: Marker[]
  private declare overlays: ImageOverlay[]

  private declare tileLayer: Layer
  private declare markersLayerGroup: LayerGroup
  private declare tooltipsLayerGroup: LayerGroup
  private declare gridOverlay: ImageOverlay

  private declare layersControl: LFControl.Layers

  private declare previousMapInfo: IMapInfo | undefined
  private declare updateInfoHandlers: Map<any, any>

  private declare el: HTMLElement

  public init(regions: IRegion[], el: HTMLElement) {
    this.el = el

    this.markers = []
    this.overlays = []
    this.updateInfoHandlers = new Map()

    this.setMaxBounds([
      [-1024, -1024],
      [3072, 3072],
    ])
    this.fitBounds(MAP_BOUNDS)
    this.setZoom(-1)

    this.on('zoomend', this.onZoomEnd)
    this.onZoomEnd()

    new PosControl({
      position: 'topright',
      scaleFactor: 100,
    }).addTo(this)

    new AreaControl({
      position: 'topleft',
      regions,
    }).addTo(this)

    new NavigateControl({
      position: 'topleft',
    }).addTo(this)

    this.gridOverlay = imageOverlay(createSvgUrl(100), MAP_BOUNDS, {
      opacity: 0.3,
    }).addTo(this)
  }

  private onZoomEnd() {
    const zoom = this.getZoom()
    const classes = [
      'eorzea-map-zoom-s',
      'eorzea-map-zoom-m',
      'eorzea-map-zoom-l',
    ] as const
    const currentClass =
      zoom <= -3 ? classes[0] : zoom <= -2 ? classes[1] : classes[2]

    classes.map((cls) => this.el.classList.remove(cls))
    this.el.classList.add(currentClass)
  }

  private loadMapLayer(mapInfo: IMapInfo) {
    this.tileLayer = imageOverlay(getMapUrl(mapInfo.id), MAP_BOUNDS, {
      alt: mapInfo.placeName,
      zIndex: 0,
    })
    this.tileLayer.addTo(this)

    this.gridOverlay.setUrl(createSvgUrl(mapInfo.sizeFactor))

    this.layersControl.addOverlay(this.gridOverlay, '网格')

    return this
  }

  public async loadMapInfo(mapInfo: IMapInfo) {
    this.mapInfo = mapInfo
    if (this.markers.length > 0) {
      this.markers.map((m) => m.remove())
      this.markers = []
    }
    if (this.overlays.length > 0) {
      this.overlays.map((m) => m.remove())
      this.overlays = []
    }
    if (this.tileLayer) {
      this.tileLayer.remove()
    }
    if (this.layersControl) {
      this.layersControl.remove()
    }
    if (this.markersLayerGroup) {
      this.markersLayerGroup.remove()
    }
    if (this.tooltipsLayerGroup) {
      this.tooltipsLayerGroup.remove()
    }

    this.layersControl = new RightLayerControl(
      {},
      {},
      { collapsed: false, position: 'topright' },
    )
    this.loadMapLayer(mapInfo)

    this.markersLayerGroup = new LayerGroup()
    this.tooltipsLayerGroup = new LayerGroup()
    this.markersLayerGroup.addTo(this)
    this.tooltipsLayerGroup.addTo(this)
    this.layersControl.addTo(this)

    this.layersControl.addOverlay(this.markersLayerGroup, '标记')
    this.layersControl.addOverlay(this.tooltipsLayerGroup, '文本')

    const markers = await getMapMarkers(mapInfo)
    const previousId = this.previousMapInfo?.id
    let panPoint: [number, number] = xy(MAP_SIZE / 2, MAP_SIZE / 2)
    for (const marker of markers) {
      const mapMarker = createMarker(marker)
      if (mapMarker) {
        this.markers.push(mapMarker)
        this.markersLayerGroup.addLayer(mapMarker)

        const tt = mapMarker.getTooltip()
        if (tt?.isOpen()) {
          this.tooltipsLayerGroup.addLayer(tt)
        }

        if (marker['data{Type}'] === 1 && marker['data{Key}'] === previousId) {
          panPoint = xy(marker.x, marker.y)
          mapMarker.getElement()?.classList.add('eorzeamap-label-current')
        }
      }
      if (marker.icon && isMinimap(marker.icon)) {
        const url = getIconUrl(marker.icon)
        if (!url) continue
        const overlay = imageOverlay(
          url,
          [
            xy(marker.x - 512, marker.y - 512),
            xy(marker.x + 512, marker.y + 512),
          ],
          {
            interactive: true,
            opacity: 0.5,
          },
        )
        this.overlays.push(overlay)
        overlay.addTo(this)
      }
    }
    this.panTo(panPoint)
    this.previousMapInfo = mapInfo
    this.fire('updateInfo', { mapInfo })
    return this
  }

  public async loadMapKey(mapKey: number) {
    const mapInfo = await getMap(mapKey)
    this.fire('loadMapKey', { mapKey })
    return this.loadMapInfo(mapInfo)
  }

  public async loadMapId(mapId: string) {
    const mapKey = await getMapKeyById(mapId)
    return this.loadMapKey(mapKey)
  }

  public addMaker(marker: Marker) {
    console.warn(
      '[Deprecated] map.addMaker is a misspell, you should use map.addMarker instead.',
    )
    return this.addMarker(marker)
  }

  public addMarker(marker: Marker) {
    marker.addTo(this)
    this.markers.push(marker)
    return marker
  }

  public onUpdateInfo(handler: (info: IMapInfo) => void) {
    this.offUpdateInfo(handler)

    const realHandler = (e: any) => {
      handler(e.mapInfo)
    }
    this.on('updateInfo', realHandler)

    this.updateInfoHandlers.set(handler, realHandler)
  }

  public offUpdateInfo(handler: (info: IMapInfo) => void) {
    if (this.updateInfoHandlers.has(handler)) {
      this.off('updateInfo', this.updateInfoHandlers.get(handler))
      this.updateInfoHandlers.delete(handler)
    }
  }

  /**
   * 从解包数据的 2D 坐标点数据换算成 UI 用的地图坐标 XY 数据
   * @param x X 坐标
   * @param y Y 坐标
   */
  public toMapXY2D(x: number, y: number) {
    return toMapXY2D(this.mapInfo, x, y)
  }

  /**
   * 从解包数据的 2D 坐标换算成经纬度
   * @param x X 坐标
   * @param y Y 坐标
   */
  public mapToLatLng2D(x: number, y: number) {
    return xy(this.fromMapXY2D(x, y))
  }

  /**
   * 从解包数据的 3D 坐标点换算成 UI 用的地图坐标 XY 数据
   * @param x X 坐标
   * @param z Y 坐标
   */
  public toMapXY3D(x: number, z: number) {
    return toMapXY3D(this.mapInfo, x, z)
  }

  /**
   * 从 UI 上的坐标 XY 数据换算成解包数据的 2D 坐标点
   * @param x X 坐标
   * @param y Y 坐标
   */
  public fromMapXY2D(x: number, y: number) {
    return fromMapXY2D(this.mapInfo, x, y)
  }

  /**
   * 从解包的 3D 数据换算为解包数据的 2D 坐标点
   * @param x X 坐标
   * @param z Z 坐标
   */
  public from3D(x: number, z: number) {
    return this.fromMapXY2D(...this.toMapXY3D(x, z))
  }
}
