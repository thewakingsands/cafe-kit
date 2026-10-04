import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import XIVAPI from '@thewakingsands/xivapi-v2'

export const MAP_FIELDS = [
  'Id',
  'SizeFactor',
  'OffsetX',
  'OffsetY',
  'MapMarkerRange',
  'MapType@as(raw)',
  'PlaceName.Name',
  'PlaceNameRegion.Name',
  'PlaceNameSub.Name',
  'TerritoryType.Name',
]
export const MARKER_FIELDS = [
  'X',
  'Y',
  'Icon',
  'PlaceNameSubtext.Name',
  'SubtextOrientation',
  'Type',
  'DataType',
  'DataKey.Id',
  'DataKey.Name',
  'MapMarkerRegion@as(raw)',
]

/** Pin the schema after the first page; retain subrow IDs in cursors. */
export async function readSheet(sheets, sheet, fields, reader, limit = 500) {
  const rows = []
  let after
  const cursors = new Set()
  for (;;) {
    const page = await sheets.list(sheet, {
      fields,
      limit,
      ...reader,
      ...(after === undefined ? {} : { after }),
    })
    if (!Array.isArray(page.rows)) throw new Error(`Invalid ${sheet} response`)
    if (page.schema) reader.schema = page.schema
    if (page.rows.length === 0) return rows
    rows.push(...page.rows)
    const last = page.rows.at(-1)
    after =
      last.subrow_id == null
        ? String(last.row_id)
        : `${last.row_id}:${last.subrow_id}`
    if (cursors.has(after))
      throw new Error(`${sheet} pagination did not advance: ${after}`)
    cursors.add(after)
  }
}

const name = (reference) => reference?.fields?.Name ?? ''

function number(value, field) {
  if (!Number.isFinite(value)) throw new Error(`Missing or invalid ${field}`)
  return value
}

export function convertMap({ row_id, fields }) {
  if (typeof fields.Id !== 'string') throw new Error(`Map ${row_id} has no Id`)
  return {
    '#': String(row_id),
    id: fields.Id,
    sizeFactor: number(fields.SizeFactor, 'Map.SizeFactor'),
    'placeName{Region}': name(fields.PlaceNameRegion),
    'placeName{Sub}': name(fields.PlaceNameSub),
    'offset{X}': number(fields.OffsetX, 'Map.OffsetX'),
    'offset{Y}': number(fields.OffsetY, 'Map.OffsetY'),
    territoryType: name(fields.TerritoryType),
    placeName: name(fields.PlaceName),
    mapMarkerRange: number(fields.MapMarkerRange, 'Map.MapMarkerRange'),
    hierarchy: number(fields['MapType@as(raw)'], 'Map.MapType'),
  }
}

export function convertMarker({ row_id, subrow_id, fields }) {
  const data = fields.DataKey
  let key = String(data?.value ?? 0)
  if (fields.DataType === 1) {
    key = data?.fields?.Id ?? ''
  } else if (fields.DataType === 4) {
    key = data?.fields?.Name ?? ''
  }
  return {
    '#': `${row_id}.${subrow_id ?? 0}`,
    x: number(fields.X, 'MapMarker.X'),
    y: number(fields.Y, 'MapMarker.Y'),
    icon: fields.Icon?.path ?? 'ui/icon/000000/000000.tex',
    'placeName{Subtext}': name(fields.PlaceNameSubtext),
    subtextOrientation: number(
      fields.SubtextOrientation,
      'MapMarker.SubtextOrientation',
    ),
    mapMarkerRegion: String(fields['MapMarkerRegion@as(raw)'] ?? 0),
    type: number(fields.Type, 'MapMarker.Type'),
    'data{Type}': number(fields.DataType, 'MapMarker.DataType'),
    'data{Key}': key,
  }
}

export function createRegions(maps) {
  const regions = new Map()
  for (const map of maps) {
    const regionName = map['placeName{Region}']
    // These rows are duplicate/internal maps, retained for direct row lookups.
    if (
      !map.id ||
      !regionName ||
      !map.placeName ||
      ['487', '534'].includes(map['#'])
    )
      continue
    if (!regions.has(regionName))
      regions.set(regionName, { regionName, maps: [] })
    regions.get(regionName).maps.push({
      id: map.id,
      key: Number(map['#']),
      hierarchy: map.hierarchy,
      name: map.placeName,
      subName: map['placeName{Sub}'],
      regionName,
    })
  }
  // Unrecognised/localised region names retain their original order.
  const priority = (name) => {
    const index = ['艾欧泽亚', '东方地域', '诺弗兰特'].indexOf(name)
    return index >= 0 ? index : name === '？？？？' ? 4 : 3
  }
  return [...regions.values()].sort(
    (a, b) => priority(a.regionName) - priority(b.regionName),
  )
}

export async function generateData({
  output = fileURLToPath(new URL('../generated/data/', import.meta.url)),
  language = 'chs',
  schema,
  sheets = new XIVAPI({ language }).data.sheets(),
} = {}) {
  const reader = schema ? { schema } : {}
  const mapRows = await readSheet(sheets, 'Map', MAP_FIELDS, reader)
  const markerRows = await readSheet(sheets, 'MapMarker', MARKER_FIELDS, reader)
  if (mapRows.length === 0 || markerRows.length === 0)
    throw new Error('Empty map dataset')
  const maps = mapRows.map(convertMap)
  const markers = markerRows.map(convertMarker)
  const regions = createRegions(maps)
  await mkdir(output, { recursive: true })
  for (const [filename, data] of Object.entries({
    'map.json': maps,
    'mapMarker.json': markers,
    'region.json': regions,
    'manifest.json': {
      language,
      ...reader,
      maps: maps.length,
      markers: markers.length,
    },
  })) {
    await writeFile(
      resolve(output, filename),
      `${JSON.stringify(data, null, 2)}\n`,
    )
  }
  return {
    maps: maps.length,
    markers: markers.length,
    regions: regions.length,
    output,
    ...reader,
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      output: { type: 'string' },
      language: { type: 'string', default: 'chs' },
      schema: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    console.log(
      'node scripts/generate-data.js [--output DIR] [--language chs] [--schema SPECIFIER]',
    )
    return
  }
  console.log(await generateData(values))
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
