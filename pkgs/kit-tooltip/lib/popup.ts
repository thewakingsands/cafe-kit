import { h, render } from 'preact'
import { CKAction, type ICKActionProps } from './CKAction'
import { CKContextProvider, type ICKContext } from './CKContextProvider'
import { CKItem, type ICKItemProps } from './CKItem'

const popupContainer = document.createElement('div')
popupContainer.style.position = 'fixed'
popupContainer.style.display = 'none'
popupContainer.className = 'cafekit ck-popup'

let hideTimer: any
let lastRef: HTMLElement

const handleUpdate = () => {
  setTimeout(resetPosition, 100)
}

export function popupItem(
  context: ICKContext,
  props: ICKItemProps,
  refEl: HTMLElement,
) {
  clearTimeout(hideTimer)

  props.onUpdate = handleUpdate

  render(
    h(CKContextProvider, context, [h(CKItem, props)]),
    popupContainer,
    popupContainer.children?.[0],
  )

  popupElement(refEl)
}

export function popupAction(
  context: ICKContext,
  props: ICKActionProps,
  refEl: HTMLElement,
) {
  clearTimeout(hideTimer)

  props.onUpdate = handleUpdate

  render(
    h(CKContextProvider, context, [h(CKAction, props)]),
    popupContainer,
    popupContainer.children?.[0],
  )

  popupElement(refEl)
}

export function hidePopup() {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (popupContainer.style.display = 'none'), 300)
}

popupContainer.addEventListener('mouseenter', () => clearTimeout(hideTimer))
popupContainer.addEventListener('mouseleave', () => hidePopup())

function resetPosition() {
  const ref = lastRef
  const refRect = ref.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const popRect = popupContainer.getBoundingClientRect()

  let left = refRect.right + 15
  let top: number | null = refRect.bottom + 10
  let bottom: number | null = null

  const popupWidth = popRect.width
  const popupHeight = popRect.height

  if (left + popupWidth > windowWidth) {
    left = Math.max(0, windowWidth - popupWidth)
  }

  if (top + popupHeight > windowHeight) {
    top = null
    bottom = 10
  }

  popupContainer.style.left = `${left}px`
  popupContainer.style.top = top === null ? '' : `${top}px`
  popupContainer.style.bottom = bottom === null ? '' : `${bottom}px`
}

function popupElement(ref: HTMLElement) {
  lastRef = ref
  const el = popupContainer
  resetPosition()

  el.style.display = 'block'

  if (!el.parentElement) {
    document.body.appendChild(el)
  }
}
