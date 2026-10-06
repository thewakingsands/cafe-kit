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
  'PlaceName.Name',
  'PlaceNameRegion.Name',
  'PlaceNameSub.Name',
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

const compact = (record) =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => value != null && value !== ''),
  )

function number(value, field) {
  if (!Number.isFinite(value)) throw new Error(`Missing or invalid ${field}`)
  return value
}

export function convertMap({ row_id, fields }) {
  if (typeof fields.Id !== 'string') throw new Error(`Map ${row_id} has no Id`)
  return compact({
    rowId: row_id,
    id: fields.Id,
    sizeFactor: number(fields.SizeFactor, 'Map.SizeFactor'),
    placeNameRegion: name(fields.PlaceNameRegion),
    placeNameSub: name(fields.PlaceNameSub),
    offsetX: number(fields.OffsetX, 'Map.OffsetX') || undefined,
    offsetY: number(fields.OffsetY, 'Map.OffsetY') || undefined,
    placeName: name(fields.PlaceName),
    marker: number(fields.MapMarkerRange, 'Map.MapMarkerRange'),
  })
}

export function convertMarker({ fields }) {
  const data = fields.DataKey
  let key = data?.value ? String(data.value) : undefined
  if (fields.DataType === 1) {
    key = data?.fields?.Id ?? ''
  } else if (fields.DataType === 4) {
    key = data?.fields?.Name ?? ''
  }
  return compact({
    x: number(fields.X, 'MapMarker.X'),
    y: number(fields.Y, 'MapMarker.Y'),
    icon:
      Number(fields.Icon?.path?.match(/\/(\d{6})(?:_hr1)?\.tex$/)?.[1]) ||
      undefined,
    name: name(fields.PlaceNameSubtext),
    orientation:
      number(fields.SubtextOrientation, 'MapMarker.SubtextOrientation') ||
      undefined,
    type: number(fields.Type, 'MapMarker.Type') || undefined,
    dataType: number(fields.DataType, 'MapMarker.DataType') || undefined,
    dataKey: key,
  })
}

function isEmptyMarker(marker) {
  return (
    marker.x === 0 &&
    marker.y === 0 &&
    !marker.icon &&
    !marker.name &&
    !marker.orientation &&
    !marker.type &&
    !marker.dataType &&
    !marker.dataKey
  )
}

export function createRegions(maps) {
  const regions = new Map()
  for (const map of maps) {
    const regionName = map.placeNameRegion
    // These rows are duplicate/internal maps, retained for direct row lookups.
    if (
      !map.id ||
      !regionName ||
      !map.placeName ||
      [487, 534].includes(map.rowId)
    )
      continue
    if (!regions.has(regionName))
      regions.set(regionName, { placeNameRegion: regionName, maps: [] })
    regions.get(regionName).maps.push(
      compact({
        rowId: map.rowId,
        placeName: map.placeName,
        placeNameSub: map.placeNameSub,
      }),
    )
  }
  // Unrecognised/localised region names retain their original order.
  const priority = (name) => {
    const index = ['艾欧泽亚', '东方地域', '诺弗兰特'].indexOf(name)
    return index >= 0 ? index : name === '？？？？' ? 4 : 3
  }
  return [...regions.values()].sort(
    (a, b) => priority(a.placeNameRegion) - priority(b.placeNameRegion),
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
  const regionMaps = mapRows.map(convertMap).filter((map) => map.id)
  // Subrow IDs are only needed for pagination; retain marker order within each row.
  const markers = {}
  let markerCount = 0
  for (const row of markerRows) {
    const marker = convertMarker(row)
    if (isEmptyMarker(marker)) continue
    markers[row.row_id] ??= []
    markers[row.row_id].push(marker)
    markerCount++
  }
  const regions = createRegions(regionMaps)
  // Region names are stored once per group, not repeated in map metadata.
  const maps = regionMaps.map(({ placeNameRegion: _, ...map }) => map)
  await mkdir(output, { recursive: true })
  for (const [filename, data] of Object.entries({
    'map.json': maps,
    'marker.json': markers,
    'region.json': regions,
    'manifest.json': {
      language,
      ...reader,
      maps: maps.length,
      markers: markerCount,
    },
  })) {
    await writeFile(resolve(output, filename), `${JSON.stringify(data)}\n`)
  }
  return {
    maps: maps.length,
    markers: markerCount,
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
