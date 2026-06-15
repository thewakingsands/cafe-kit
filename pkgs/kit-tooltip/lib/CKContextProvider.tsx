import XIVAPI from '@thewakingsands/xivapi-v2'
import { type ComponentChildren, createContext } from 'preact'
import { useContext, useMemo } from 'preact/hooks'

export interface ICKContext {
  xivapiVersion?: string
  xivapiLanguage?: 'none' | 'en' | 'ja' | 'de' | 'fr' | 'chs' | 'tc' | 'ko'
  defaultHq: boolean
  hideSeCopyright: boolean
}

const defaultContext: ICKContext = {
  xivapiVersion: 'latest',
  xivapiLanguage: 'chs',
  defaultHq: true,
  hideSeCopyright: false,
}
export const CKContext = createContext<ICKContext>(defaultContext)
export const XIVAPIContext = createContext<XIVAPI | undefined>(undefined)

export const CKContextProvider = (props: {
  value: ICKContext
  children: ComponentChildren
}) => {
  const context = props.value || defaultContext
  const xivapi = useMemo(
    () =>
      new XIVAPI({
        version: context.xivapiVersion || 'latest',
        language: context.xivapiLanguage || 'chs',
      }),
    [context.xivapiLanguage, context.xivapiVersion],
  )

  return (
    <CKContext.Provider value={context}>
      <XIVAPIContext.Provider value={xivapi}>
        {props.children}
      </XIVAPIContext.Provider>
    </CKContext.Provider>
  )
}

export const useXIVAPI = () => {
  const xivapi = useContext(XIVAPIContext)
  if (!xivapi) {
    throw new Error('Missing XIVAPI Context')
  }

  return xivapi
}
