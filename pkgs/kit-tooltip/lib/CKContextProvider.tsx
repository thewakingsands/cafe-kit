import { Component } from 'preact'

export interface ICKContext {
  apiBaseUrl: string
  iconBaseUrl: string
  defaultHq: boolean
  hideSeCopyright: boolean
}

export class CKContextProvider extends Component<ICKContext> {
  public getChildContext() {
    return this.props
  }

  public render() {
    return this.props.children[0]
  }
}
