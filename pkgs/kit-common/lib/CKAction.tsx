import type { ComponentChildren, CSSProperties } from 'preact'

export interface ICKActionProps {
  style?: CSSProperties
  className?: string
  children?: ComponentChildren
}

export function CKAction(props: ICKActionProps) {
  return (
    <div class={`ck-action ${props.className || ''}`} style={props.style}>
      <div class="ck-action-cover" />
      {props.children}
    </div>
  )
}
