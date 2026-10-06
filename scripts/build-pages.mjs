import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateData } from '../pkgs/eorzea-map/scripts/generate-data.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'dist', 'pages')

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await cp(join(root, 'pages', 'index.html'), join(output, 'index.html'))

for (const name of ['kit-common', 'kit-tooltip']) {
  const source = join(root, 'pkgs', name)
  const target = join(output, name)
  await cp(join(source, 'example'), join(target, 'example'), {
    recursive: true,
  })
  await cp(join(source, 'dist'), join(target, 'dist'), { recursive: true })
}

// Serve the UMD build as .js so static hosts send a JavaScript content type.
const mapRoot = join(output, 'eorzea-map')
const mapSource = join(root, 'pkgs', 'eorzea-map')
await mkdir(join(mapRoot, 'assets'), { recursive: true })
await cp(
  join(mapSource, 'dist', 'map.umd.cjs'),
  join(mapRoot, 'assets', 'map.umd.js'),
)
await cp(join(mapSource, 'dist', 'map.css'), join(mapRoot, 'assets', 'map.css'))
const html = await readFile(join(mapSource, 'example', 'index.html'), 'utf8')
await writeFile(
  join(mapRoot, 'index.html'),
  html
    .replace('../dist/map.umd.cjs', './assets/map.umd.js')
    .replace('../dist/map.css', './assets/map.css')
    .replace('../generated/data/', './data/'),
)

console.log(await generateData({ output: join(mapRoot, 'data') }))
console.log(`Pages site written to ${output}`)
