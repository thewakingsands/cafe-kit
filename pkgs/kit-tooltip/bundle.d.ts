declare module '@thewakingsands/kit-tooltip' {
  interface ICKContext {
    apiBaseUrl: string
    iconBaseUrl: string
    defaultHq: boolean
    hideSeCopyright: boolean
  }

  interface ITooltipOptions {
    context: ICKContext
    links: {
      detectWikiLinks: boolean
      itemNameAttribute: string
      itemIdAttribute: string
      itemHqAttribute: string
      rootContainer: HTMLElement
    }
  }

  export function initTooltip(opts?: Partial<ITooltipOptions>): void
}
