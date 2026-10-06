import crel from 'crel'
import { Control, type ControlOptions } from 'leaflet'
import type { EoMap } from '../EoMap.js'
import type { IRegion } from '../fetchData.js'
import type { IMapInfo } from '../loader.js'

export class AreaControl extends Control {
  public declare regions: IRegion[]

  private declare map: EoMap
  private declare rootContainer: HTMLElement
  private declare placeNameContainer: HTMLElement
  private declare select: HTMLSelectElement

  constructor(options: INavigateControlOptions) {
    super(options)
    this.regions = options.regions
  }

  public onAdd(map: EoMap) {
    this.map = map
    this.map.onUpdateInfo(this.onUpdateInfo)

    this.rootContainer = crel('nav', { class: 'eorzea-map-nav' }, [
      crel('div', { class: 'eorzea-map-bg' }),
      crel('div', { class: 'eorzea-map-nav-aside' }, [
        crel(
          'div',
          { class: 'eorzea-map-place-name', for: 'eroza-map-place-select' },
          '？？？？',
        ),
        crel('div', { class: 'eorzea-map-place-select-container' }),
      ]),
    ])

    const placeNameContainer = this.rootContainer.querySelector<HTMLElement>(
      '.eorzea-map-place-name',
    )
    if (!placeNameContainer) throw new Error('Missing place name container')
    this.placeNameContainer = placeNameContainer

    this.select = document.createElement('select')
    this.select.id = 'eroza-map-place-select'
    this.select.addEventListener('change', this.onSelectChange, {
      passive: true,
    })

    for (const group of this.regions) {
      const optGroup = document.createElement('optgroup')
      optGroup.label = group.placeNameRegion
      this.select.appendChild(optGroup)

      for (const area of group.maps) {
        const option = document.createElement('option')
        option.value = `${area.rowId}`
        option.text = `${area.placeName}`
        if (area.placeNameSub) {
          option.text += ` - ${area.placeNameSub}`
        }
        optGroup.appendChild(option)
      }
    }

    this.rootContainer
      .querySelector('.eorzea-map-place-select-container')
      ?.appendChild(this.select)

    for (const eventName of 'mousedown pointerdown mouseup pointerup click mousemove pointermove dblclick'.split(
      ' ',
    )) {
      this.rootContainer.addEventListener(eventName, (e) => e.stopPropagation())
    }

    return this.rootContainer
  }

  private onSelectChange = () => {
    if (String(this.map.mapInfo?.rowId) !== this.select.value) {
      this.map.loadMapKey(Number(this.select.value)).catch(console.error)
    }
  }

  public onRemove() {
    this.map.offUpdateInfo(this.onUpdateInfo)
  }

  private onUpdateInfo = (mapInfo: IMapInfo) => {
    let text = mapInfo.placeName ?? mapInfo.id
    if (mapInfo.placeNameSub) {
      text += `\n${mapInfo.placeNameSub}`
    }
    if (mapInfo.id.startsWith('region')) {
      text += '\n区域地图显示信息可能有所缺失\n可点击上面地名选择地图'
    }
    this.placeNameContainer.textContent = text
    this.placeNameContainer.style.whiteSpace = 'pre-line'
    this.select.value = String(mapInfo.rowId)
  }
}

export interface INavigateControlOptions extends ControlOptions {
  regions: IRegion[]
}
