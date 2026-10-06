import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  convertMap,
  convertMarker,
  createRegions,
  generateData,
  MAP_FIELDS,
  MARKER_FIELDS,
  readSheet,
} from '../scripts/generate-data.js'

test('pagination keeps subrows and schema without forwarding response versions', async () => {
  const calls = []
  const pages = [
    [
      { row_id: 2, subrow_id: 0 },
      { row_id: 2, subrow_id: 1 },
    ],
    [{ row_id: 2, subrow_id: 2 }],
    [],
  ]
  const reader = {}
  const rows = await readSheet(
    {
      async list(sheet, params) {
        calls.push({ sheet, ...params })
        return {
          rows: pages.shift(),
          version: 'server-reported',
          schema: 'schema@rev',
        }
      },
    },
    'MapMarker',
    ['X'],
    reader,
  )
  assert.equal(rows.length, 3)
  assert.equal(calls[0].after, undefined)
  assert.equal(calls[1].after, '2:1')
  assert.equal(calls[2].after, '2:2')
  for (const call of calls) assert.equal(Object.hasOwn(call, 'version'), false)
  assert.equal(calls[1].schema, 'schema@rev')
  assert.deepEqual(reader, { schema: 'schema@rev' })
})

test('pagination rejects a server that repeats the same page', async () => {
  await assert.rejects(
    readSheet({ list: async () => ({ rows: [{ row_id: 1 }] }) }, 'Map', [], {}),
    /did not advance/,
  )
})

const mapRow = {
  row_id: 92,
  fields: {
    Id: 'world/00',
    SizeFactor: 100,
    OffsetX: -10,
    OffsetY: 20,
    MapMarkerRange: 136,
    'MapType@as(raw)': 2,
    PlaceName: { fields: { Name: '艾欧泽亚' } },
    PlaceNameRegion: { fields: { Name: '艾欧泽亚' } },
    PlaceNameSub: { fields: { Name: '' } },
    TerritoryType: { fields: { Name: '' } },
  },
}
const markerRow = {
  row_id: 136,
  subrow_id: 3,
  fields: {
    X: 305,
    Y: 1244,
    Icon: { path: 'ui/icon/060000/060442.tex' },
    PlaceNameSubtext: { fields: { Name: '拉诺西亚' } },
    SubtextOrientation: 3,
    Type: 0,
    DataType: 1,
    DataKey: { value: 87, fields: { Id: 'region/00' } },
  },
}

test('generation produces map metadata, linked markers and a manifest without versions', async (t) => {
  const output = await mkdtemp(join(tmpdir(), 'eorzea-map-'))
  t.after(() => rm(output, { recursive: true, force: true }))
  const sheets = {
    async list(sheet, params) {
      assert.equal(Object.hasOwn(params, 'version'), false)
      if (sheet === 'MapMarker') assert.equal(params.schema, 'schema@rev')
      return {
        rows:
          params.after === undefined
            ? [sheet === 'Map' ? mapRow : markerRow]
            : [],
        version: 'server-reported',
        schema: 'schema@rev',
      }
    },
  }
  const result = await generateData({ output, sheets })
  assert.equal(result.maps, 1)
  const maps = JSON.parse(await readFile(join(output, 'map.json'), 'utf8'))
  assert.equal(maps[0].rowId, 92)
  assert.equal(maps[0].offsetX, -10)
  assert.equal(Object.hasOwn(maps[0], 'version'), false)
  assert.equal(Object.hasOwn(maps[0], 'assetVersion'), false)
  assert.equal(Object.hasOwn(maps[0], 'placeNameRegion'), false)
  assert.equal(Object.hasOwn(maps[0], 'placeNameSub'), false)
  const regions = JSON.parse(
    await readFile(join(output, 'region.json'), 'utf8'),
  )
  assert.deepEqual(regions, [
    {
      placeNameRegion: '艾欧泽亚',
      maps: [{ rowId: 92, placeName: '艾欧泽亚' }],
    },
  ])
  const markers = JSON.parse(
    await readFile(join(output, 'marker.json'), 'utf8'),
  )
  assert.deepEqual(Object.keys(markers), ['136'])
  assert.equal(markers[136][0].icon, 60442)
  assert.equal(
    markers[136][0].name,
    markerRow.fields.PlaceNameSubtext.fields.Name,
  )
  assert.equal(markers[136][0].orientation, 3)
  assert.equal(Object.hasOwn(markers[136][0], 'subrowId'), false)
  assert.equal(markers[136][0].dataKey, 'region/00')
  const manifest = JSON.parse(
    await readFile(join(output, 'manifest.json'), 'utf8'),
  )
  assert.deepEqual(manifest, {
    language: 'chs',
    schema: 'schema@rev',
    maps: 1,
    markers: 1,
  })
})

test('generation removes empty placeholders without dropping or reordering meaningful markers', async (t) => {
  const output = await mkdtemp(join(tmpdir(), 'eorzea-map-'))
  t.after(() => rm(output, { recursive: true, force: true }))
  const emptyFields = {
    X: 0,
    Y: 0,
    Icon: { path: 'ui/icon/000000/000000.tex' },
    PlaceNameSubtext: { fields: { Name: '' } },
    SubtextOrientation: 0,
    'MapMarkerRegion@as(raw)': 0,
    Type: 0,
    DataType: 0,
    DataKey: { value: 0 },
  }
  const rows = [
    {},
    { Icon: { path: 'ui/icon/060000/060561.tex' } },
    {},
    { DataType: 1, DataKey: { fields: { Id: 'region/00' } } },
    { DataType: 4, DataKey: { fields: { Name: 'Tooltip' } } },
    { PlaceNameSubtext: { fields: { Name: 'Area' } } },
    { X: 0, Y: 100 },
    { X: 100, Y: 0 },
    { 'MapMarkerRegion@as(raw)': 1 },
    { SubtextOrientation: 2 },
    { Type: 1 },
    { DataKey: { value: 42 } },
    { DataKey: { value: '' } },
  ].map((fields, subrow_id) => ({
    row_id: 136,
    subrow_id,
    fields: { ...emptyFields, ...fields },
  }))
  const result = await generateData({
    output,
    sheets: {
      list: async (sheet, params) => ({
        rows:
          params.after === undefined ? (sheet === 'Map' ? [mapRow] : rows) : [],
      }),
    },
  })
  const markers = JSON.parse(
    await readFile(join(output, 'marker.json'), 'utf8'),
  )
  const expected = rows
    .filter((_, i) => ![0, 2, 8, 12].includes(i))
    .map(convertMarker)
  assert.deepEqual(markers, { 136: expected })
  assert.equal(result.markers, 9)
  const manifest = JSON.parse(
    await readFile(join(output, 'manifest.json'), 'utf8'),
  )
  assert.equal(manifest.markers, 9)
})

test('a failed API request leaves existing generated data untouched', async (t) => {
  const output = await mkdtemp(join(tmpdir(), 'eorzea-map-'))
  t.after(() => rm(output, { recursive: true, force: true }))
  await writeFile(join(output, 'map.json'), 'existing')
  await assert.rejects(
    generateData({
      output,
      sheets: {
        list: async () => {
          throw new Error('offline')
        },
      },
    }),
    /offline/,
  )
  assert.equal(await readFile(join(output, 'map.json'), 'utf8'), 'existing')
})

test('marker text resolves polymorphic links and permits zero coordinates/icons', () => {
  const tooltip = convertMarker({
    ...markerRow,
    fields: {
      ...markerRow.fields,
      X: 0,
      Y: 0,
      Icon: undefined,
      DataType: 4,
      DataKey: { fields: { Name: 'First line\nSecond line' } },
    },
  })
  assert.equal(tooltip.dataKey, 'First line\nSecond line')
  assert.equal(tooltip.x, 0)
  assert.equal(Object.hasOwn(tooltip, 'icon'), false)
  assert.throws(
    () => convertMarker({ ...markerRow, fields: {} }),
    /MapMarker.X/,
  )
})

test('region sorting preserves all regions when preferred translated names are absent', () => {
  const map = {
    rowId: 92,
    id: 'world/00',
    placeName: 'Eorzea',
    placeNameRegion: 'Eorzea',
  }
  assert.deepEqual(
    createRegions([map]).map((r) => r.placeNameRegion),
    ['Eorzea'],
  )
  assert.deepEqual(createRegions([{ ...map, id: '' }]), [])
})

test('conversion uses camelCase names, omits empty defaults and keeps meaningful zero values', () => {
  assert.deepEqual(
    convertMap({
      ...mapRow,
      row_id: 0,
      fields: { ...mapRow.fields, OffsetX: 0, OffsetY: 0, MapMarkerRange: 0 },
    }),
    {
      rowId: 0,
      id: 'world/00',
      sizeFactor: 100,
      placeNameRegion: '艾欧泽亚',
      placeName: '艾欧泽亚',
      marker: 0,
    },
  )
  assert.deepEqual(
    convertMarker({
      row_id: 0,
      subrow_id: 0,
      fields: {
        X: 0,
        Y: 0,
        Icon: undefined,
        SubtextOrientation: 0,
        Type: 0,
        DataType: 0,
        DataKey: { value: 0 },
      },
    }),
    { x: 0, y: 0 },
  )
  assert.ok(!MAP_FIELDS.some((field) => /MapType|TerritoryType/.test(field)))
  assert.ok(!MARKER_FIELDS.some((field) => /MapMarkerRegion/.test(field)))
})
