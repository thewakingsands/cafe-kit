import { CKAction } from './CKAction'

export interface ICKActionIconProps {
  src: string
  size: number | string
}

export function CKActionIcon(props: ICKActionIconProps) {
  return (
    <CKAction style={{ width: props.size, height: props.size }}>
      <img src={props.src} />
    </CKAction>
  )
}
