import type { ComponentChildren } from 'preact'

export function CKStatGroup(props: { children?: ComponentChildren }) {
  return <div class="ck-stat-group">{props.children}</div>
}
