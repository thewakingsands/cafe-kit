import crel from 'crel'
import { Control } from 'leaflet'

export class RightLayerControl extends Control.Layers {
  protected _addItem(...args: any[]) {
    const label: HTMLLabelElement = (
      Control.Layers.prototype as any
    )._addItem.apply(this, args)

    label.children[0].appendChild(label.children[0].children[0])
    label.children[0].appendChild(crel('i', { class: 'input-after' }))

    return label
  }
}
