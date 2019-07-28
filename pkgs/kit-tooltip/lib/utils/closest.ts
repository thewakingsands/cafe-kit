export function closest(parent: HTMLElement, selector: string | HTMLElement): HTMLElement {
  let node: HTMLElement = parent

  do {
    if (selector instanceof HTMLElement) {
      if (node === selector) {
        return node
      }
    } else if (node.matches(selector)) {
      return node
    }
    node = node.parentElement
  } while (node)

  return null
}
