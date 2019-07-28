import { h, Component } from 'preact'

export interface ICKAttributesProps {
  attrs: {
    name: string
    value?: string | number
    titleClass?: string
    style: 'half' | 'full' | 'header' | 'half-full'
  }[]
}

export class CKAttributes extends Component<ICKAttributesProps> {
  public render() {
    return (
      <div class="ck-attrs">
        {this.props.attrs.map(attr => (
          <div class={`ck-attrs-${attr.style} ${attr.name ? '' : 'ck-attrs-empty'}`}>
            <div class={['ck-attrs-name', attr.titleClass == null ? 'ck-hl' : attr.titleClass].join(' ')}>
              {attr.name}
            </div>
            {attr.value ? <div class="ck-attrs-value">{attr.value}</div> : null}
          </div>
        ))}
      </div>
    )
  }
}
