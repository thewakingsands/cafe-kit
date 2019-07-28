import { render, h } from 'preact'
import { CKItem, ICKItemProps } from './CKItem'
import { ICKContext, CKContextProvider } from './CKContextProvider'

const popupContainer = document.createElement('div')
popupContainer.style.position = 'fixed'
popupContainer.style.display = 'none'
popupContainer.className = 'cafekit ck-popup'

let hideTimer: any
let lastRef: HTMLElement

const handleUpdate = () => {
  setTimeout(resetPosition, 100)
}

export function popupItem(context: ICKContext, props: ICKItemProps, refEl: HTMLElement) {
  clearTimeout(hideTimer)

  props.onUpdate = handleUpdate

  render(
    h(CKContextProvider, context, [h(CKItem, props)]),
    popupContainer,
    popupContainer.children && popupContainer.children[0],
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

  const pos = {
    left: refRect.right + 15,
    top: refRect.bottom + 10,
    bottom: undefined,
  }

  const popupWidth = popRect.width
  const popupHeight = popRect.height

  if (pos.left + popupWidth > windowWidth) {
    pos.left = Math.max(0, windowWidth - popupWidth)
  }

  if (pos.top + popupHeight > windowHeight) {
    pos.top = undefined
    pos.bottom = 10
  }

  for (const name in pos) {
    popupContainer.style[name] = pos[name] == null ? '' : `${pos[name]}px`
  }
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
