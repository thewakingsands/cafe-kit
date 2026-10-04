import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateData } from '../pkgs/eorzea-map/scripts/generate-data.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'dist', 'pages')

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await cp(join(root, 'pages', 'index.html'), join(output, 'index.html'))

for (const name of ['kit-common', 'kit-tooltip', 'eorzea-map']) {
  const source = join(root, 'pkgs', name)
  const target = join(output, name)
  await cp(join(source, 'example'), join(target, 'example'), {
    recursive: true,
  })
  await cp(join(source, 'dist'), join(target, 'dist'), { recursive: true })
}

// Serve the UMD build as .js so static hosts send a JavaScript content type.
const mapRoot = join(output, 'eorzea-map')
await cp(
  join(mapRoot, 'dist', 'map.umd.cjs'),
  join(mapRoot, 'dist', 'map.umd.js'),
)
const mapExample = join(mapRoot, 'example', 'index.html')
const html = await readFile(mapExample, 'utf8')
await writeFile(
  mapExample,
  html.replace('../dist/map.umd.cjs', '../dist/map.umd.js'),
)

console.log(await generateData({ output: join(mapRoot, 'generated', 'data') }))
console.log(`Pages site written to ${output}`)
