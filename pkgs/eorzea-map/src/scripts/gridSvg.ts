import { MAP_SIZE } from './map.js'

const urlMap = new Map<number, string>()

export function genSvgCode(gridSize: number) {
  return `
<svg width="${MAP_SIZE}px" height="${MAP_SIZE}px" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="${gridSize}px" height="${gridSize}px" patternUnits="userSpaceOnUse">
    <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="rgba(0, 0, 0, 0.5)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
</svg>
  `
}

export function createSvgUrl(scaleFactor: number) {
  const cached = urlMap.get(scaleFactor)
  if (cached) return cached
  const code = genSvgCode(scaleFactor / 2)
    .trim()
    .replace(/\n\s*/, '')

  const url = `data:image/svg+xml,${encodeURIComponent(code)}`
  urlMap.set(scaleFactor, url)
  return url
}
