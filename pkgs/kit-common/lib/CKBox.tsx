import type { ComponentChildren } from 'preact'

export function CKBox(props: { children?: ComponentChildren }) {
  return <div class="ck-box">{props.children}</div>
}
