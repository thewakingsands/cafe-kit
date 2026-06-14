import type { ComponentChildren } from 'preact'

export function CKComment(props: { children?: ComponentChildren }) {
  return <div class="ck-comment">{props.children}</div>
}
