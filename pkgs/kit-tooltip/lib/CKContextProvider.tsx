import { type ComponentChildren, createContext } from 'preact'

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

export const CKContextProvider = (props: {
  value: ICKContext
  children: ComponentChildren
}) => {
  return (
    <CKContext.Provider value={props.value || defaultContext}>
      {props.children}
    </CKContext.Provider>
  )
}
