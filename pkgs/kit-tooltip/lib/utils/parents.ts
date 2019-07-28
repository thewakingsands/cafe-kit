export function parents(parent: HTMLElement, selector: string): HTMLElement[] {
  let node: HTMLElement = parent
  const results: HTMLElement[] = []

  do {
    if (node.matches(selector)) {
      results.push(node)
    }
    node = node.parentElement
  } while (node)

  return results
}
