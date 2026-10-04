import XIVAPI from '@thewakingsands/xivapi-v2'
import { type ComponentChildren, createContext } from 'preact'
import { useContext, useMemo } from 'preact/hooks'

export interface ICKContext {
  xivapiLanguage?: 'none' | 'en' | 'ja' | 'de' | 'fr' | 'chs' | 'tc' | 'ko'
  defaultHq: boolean
  hideSeCopyright: boolean
}

const defaultContext: ICKContext = {
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
        language: context.xivapiLanguage || 'chs',
      }),
    [context.xivapiLanguage],
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
