import { CKActionIcon } from './CKActionIcon'

export interface ICKItemNameProps {
  name: string
  rarity: number
  iconSrc?: string
  type?: string
  style?: any
  size?: 'big' | 'medium' | 'small'
}

export function CKItemName(props: ICKItemNameProps) {
  return (
    <div
      class={`ck-item-name ck-item-name-size-${props.size}`}
      style={props.style}
    >
      {props.iconSrc ? (
        <div className="ck-item-name-icon">
          <CKActionIcon src={props.iconSrc} size="" />
        </div>
      ) : null}

      <div className="ck-item-name-meta">
        <div class={`ck-item-name-name ck-rarity-${props.rarity}`}>
          {props.name}
        </div>
        {props.type ? <div class="ck-item-name-type">{props.type}</div> : null}
      </div>
    </div>
  )
}
