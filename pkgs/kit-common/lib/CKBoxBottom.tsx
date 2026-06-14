import type { ComponentChildren } from 'preact'

export function CKBoxBottom(props: { children?: ComponentChildren }) {
  return (
    <div class="ck-box-bottom-wrapper">
      <div class="ck-box-bottom">{props.children}</div>
    </div>
  )
}
