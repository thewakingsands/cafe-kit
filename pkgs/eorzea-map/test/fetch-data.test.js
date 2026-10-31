import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getMap,
  getMapKeyById,
  getMapMarkers,
  getRegion,
  setApiUrl,
  setDataProvider,
} from '../src/scripts/fetchData.ts'

test('map lookup uses row IDs rather than array indexes; changing the source resets caches', async (t) => {
  const urls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(url)
    return Response.json([
      { rowId: 92, id: 'world/00' },
      { rowId: 100, id: 'region/00' },
    ])
  })
  setApiUrl('/first')
  assert.equal((await getMap(92)).id, 'world/00')
  assert.equal(await getMapKeyById('region/00'), 100)
  assert.deepEqual(urls, ['/first/map.json'])
  setApiUrl('/second/')
  await getMap(92)
  assert.equal(urls[1], '/second/map.json')
  await assert.rejects(getMap(1), /was not found/)
})

test('grouped markers use exact ranges, preserve cached order and permit missing groups', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      13: [{ x: 13, y: 0 }],
      136: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    }),
  )
  setApiUrl('/markers')
  for (let i = 0; i < 2; i++) {
    assert.deepEqual(
      (await getMapMarkers({ marker: 136 })).map((m) => m.x),
      [2, 1],
    )
  }
  assert.deepEqual(await getMapMarkers({ marker: 999 }), [])
  assert.deepEqual(await getMapMarkers({ marker: 13 }), [{ x: 13, y: 0 }])
})

test('HTTP errors and invalid data are rejected and can be retried', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    if (calls === 1) return new Response('unavailable', { status: 503 })
    if (calls === 2) return Response.json({ error: 'wrong shape' })
    return Response.json([])
  })
  setApiUrl('/retry')
  await assert.rejects(getRegion(), /HTTP 503/)
  await assert.rejects(getRegion(), /Invalid map data/)
  assert.deepEqual(await getRegion(), [])
})

test('region loading permits omitted subnames', async (t) => {
  const regions = [
    {
      placeNameRegion: 'Eorzea',
      maps: [{ rowId: 92, placeName: 'Eorzea' }],
    },
  ]
  t.mock.method(globalThis, 'fetch', async () => Response.json(regions))
  setApiUrl('/schema')
  assert.deepEqual(await getRegion(), regions)
})

test('custom providers cover every data entry without HTTP and preserve marker order', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected HTTP')
  })
  const map = { rowId: 123, id: 'test/00', marker: 42 }
  const markers = [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ]
  let attempts = 0
  setDataProvider({
    getRegion: async () => [{ placeNameRegion: 'Local client', maps: [] }],
    getMap: async (id) => {
      assert.equal(id, 123)
      return map
    },
    getMapKeyById: async (id) => {
      assert.equal(id, 'test/00')
      return 123
    },
    getMapMarkers: async (value) => {
      assert.equal(value, map)
      if (++attempts === 1) throw new Error('retry')
      return markers
    },
  })
  try {
    setApiUrl('/does-not-override-provider')
    assert.equal((await getRegion())[0].placeNameRegion, 'Local client')
    assert.equal(await getMap(123), map)
    assert.equal(await getMapKeyById('test/00'), 123)
    await assert.rejects(getMapMarkers(map), /retry/)
    assert.deepEqual(
      (await getMapMarkers(map)).map((m) => m.x),
      [2, 1],
    )
    assert.deepEqual(
      markers.map((m) => m.x),
      [1, 2],
    )
  } finally {
    setDataProvider()
  }
  t.mock.method(globalThis, 'fetch', async () => Response.json([]))
  setApiUrl('/restored')
  assert.deepEqual(await getRegion(), [])
})
