import { ICKContext } from './CKContextProvider'
import { isSupportPassive } from './utils/isSupportPassive'
import { closest } from './utils/closest'
import { parents } from './utils/parents'
import { popupItem, hidePopup } from './popup'
import { ICKItemProps } from './CKItem'

export interface ITooltipOptions {
  context: ICKContext
  links: {
    detectWikiLinks: boolean
    itemNameAttribute: string
    itemIdAttribute: string
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
  props: ICKItemProps
  element: HTMLElement
}

function getMouseOverHandler(options: ITooltipOptions): EventListenerOrEventListenerObject {
  return event => {
    let props: IRenderProps
    if (options.links.detectWikiLinks) {
      props = handleWiki(event.target as HTMLElement)
    }

    if (props) {
      popupItem(options.context, props.props, props.element)

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
