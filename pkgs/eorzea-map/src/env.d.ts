declare const __LIB_VERSION__: string

declare module 'crel' {
  function crel(tag: string, ...children: any[]): HTMLElement
  export default crel
}
