import { ICKContext } from './CKContextProvider'
import { isSupportPassive } from './utils/isSupportPassive'
import { closest } from './utils/closest'
import { parents } from './utils/parents'
import { popupItem, popupAction, hidePopup } from './popup'
import { ICKItemProps } from './CKItem'

export interface ITooltipOptions {
  context: ICKContext
  links: {
    detectWikiLinks: boolean
    itemNameAttribute: string
    itemIdAttribute: string
    itemHqAttribute: string
    actionNameAttribute: string
    actionIdAttribute: string
    actionJobIdAttribute: string
    rootContainer: HTMLElement
  }
}

const defaultOptions: ITooltipOptions = {
  context: {
    apiBaseUrl: 'https://cafemaker.wakingsands.com',
    iconBaseUrl: 'https://cafemaker.wakingsands.com/i',
    defaultHq: true,
    hideSeCopyright: false,
  },
  links: {
    detectWikiLinks: true,
    itemNameAttribute: 'data-ck-item-name',
    itemIdAttribute: 'data-ck-item-id',
    itemHqAttribute: 'data-ck-item-hq',
    actionNameAttribute: 'data-ck-action-name',
    actionIdAttribute: 'data-ck-action-id',
    actionJobIdAttribute: 'data-ck-action-job-id',
    rootContainer: document.body,
  },
}

const listenOptions = isSupportPassive() ? { passive: true } : false

export function initTooltip(opts: Partial<ITooltipOptions> = {}) {
  const options: ITooltipOptions = {
    context: {
      ...defaultOptions.context,
      ...(opts.context || {}),
    },
    links: {
      ...defaultOptions.links,
      ...(opts.links || {}),
    },
  }

  const handler = getMouseOverHandler(options)
  options.links.rootContainer.addEventListener('mouseover', handler, listenOptions)
}

interface IRenderProps {
  props: any
  element: HTMLElement
}

function getMouseOverHandler(options: ITooltipOptions): EventListenerOrEventListenerObject {
  return event => {
    let props: IRenderProps
    let type = 'item'

    if (options.links.itemIdAttribute || options.links.itemNameAttribute) {
      props = props || handleAttrItem(event.target as HTMLElement, options)
    }
    if (options.links.detectWikiLinks) {
      props = props || handleWiki(event.target as HTMLElement)
    }
    if (options.links.actionIdAttribute || options.links.actionNameAttribute) {
      const actionP = handleAttrAction(event.target as HTMLElement, options)
      if (actionP) {
        type = 'action'
        props = actionP
      }
    }

    if (props) {
      if (type === 'item') {
        popupItem(options.context, props.props, props.element)
      } else {
        popupAction(options.context, props.props, props.element)
      }

      if (!hasFlag(props.element, 'leave')) {
        const leaveHandler = () => {
          hidePopup()
          props.element.removeEventListener('mouseleave', leaveHandler)
          removeFlag(props.element, 'leave')
        }
        props.element.addEventListener('mouseleave', leaveHandler, listenOptions)
        addFlag(props.element, 'leave')
      }
    }
  }
}

function addFlag(f: any, flag: string) {
  f['__ckflag_' + flag] = true
}

function removeFlag(f: any, flag: string) {
  delete f['__ckflag_' + flag]
}

function hasFlag(f: any, flag: string) {
  return f['__ckflag_' + flag] === true
}

function handleWiki(el: HTMLElement): IRenderProps {
  const a = closest(el, 'a') as HTMLAnchorElement
  if (!a) {
    return null
  }

  if (a.host !== 'ff14.huijiwiki.com') {
    return null
  }

  const matches = a.pathname.match(/^\/wiki\/(.*)$/)

  if (!matches) {
    return null
  }

  const [namespace, pageName] = decodeURIComponent(matches[1]).split(':')

  if (namespace !== '物品' && namespace.toLowerCase() !== 'item') {
    return null
  }

  return {
    props: { name: pageName },
    element: a,
  }
}

function parseBool(v: string): boolean |null {
  if (!v) {
    return null
  }
  if (v.toLowerCase() === 'true') {
    return true
  } else if (v.toLowerCase() === 'false') {
    return false
  }
  return null
}

function handleAttrItem(el: HTMLElement, options: ITooltipOptions): IRenderProps {
  const itemNameDom = closest(el, `[${options.links.itemNameAttribute}]`)
  const itemIdDom = closest(el, `[${options.links.itemIdAttribute}]`)

  if (itemIdDom) {
    const hq = itemIdDom.getAttribute(options.links.itemHqAttribute)
    return {
      props: { id: itemIdDom.getAttribute(options.links.itemIdAttribute), hq: parseBool(hq) },
      element: itemIdDom,
    }
  }

  if (itemNameDom) {
    const hq = itemNameDom.getAttribute(options.links.itemHqAttribute)
    const name = itemNameDom.getAttribute(options.links.itemNameAttribute) || itemNameDom.innerText.trim()

    return {
      props: { name, hq: parseBool(hq) },
      element: itemNameDom,
    }
  }

  return null
}

function handleAttrAction(el: HTMLElement, options: ITooltipOptions): IRenderProps {
  const actionNameDom = closest(el, `[${options.links.actionNameAttribute}]`)
  const actionIdDom = closest(el, `[${options.links.actionIdAttribute}]`)

  if (actionIdDom) {
    return {
      props: { id: actionIdDom.getAttribute(options.links.actionIdAttribute) },
      element: actionIdDom,
    }
  }

  if (actionNameDom) {
    const job = actionNameDom.getAttribute(options.links.actionJobIdAttribute) || null
    const name = actionNameDom.getAttribute(options.links.actionNameAttribute) || actionNameDom.innerText.trim()

    return {
      props: { name, jobId: job },
      element: actionNameDom,
    }
  }

  return null
}
