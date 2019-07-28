import { h, Component } from 'preact'
import { CKActionIcon } from './CKActionIcon'

export interface ICKItemNameProps {
  name: string
  rarity: number
  iconSrc?: string
  type?: string
  style?: any
  size?: 'big' | 'medium' | 'small'
}

export class CKItemName extends Component<ICKItemNameProps> {
  public render() {
    return (
      <div class={'ck-item-name ck-item-name-size-' + this.props.size} style={this.props.style}>
        {this.props.iconSrc ? (
          <div className="ck-item-name-icon">
            <CKActionIcon src={this.props.iconSrc} size="" />
          </div>
        ) : null}

        <div className="ck-item-name-meta">
          <div class={'ck-item-name-name ck-rarity-' + this.props.rarity}>{this.props.name}</div>
          {this.props.type ? <div class="ck-item-name-type">{this.props.type}</div> : null}
        </div>
      </div>
    )
  }
}
