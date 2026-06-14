import type { ComponentChildren } from 'preact'

export interface ICKContainerProps {
  style?: any
  className?: any
  children?: ComponentChildren
}

export function CKContainer(props: ICKContainerProps) {
  return (
    <div class={`ck-container ${props.className || ''}`} style={props.style}>
      {props.children}
    </div>
  )
}
