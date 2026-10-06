import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getMap,
  getMapKeyById,
  getMapMarkers,
  getRegion,
  setApiUrl,
} from '../src/scripts/fetchData.ts'

test('map lookup uses row IDs rather than array indexes; changing the source resets caches', async (t) => {
  const urls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(url)
    return Response.json([
      { '#': '92', id: 'world/00' },
      { '#': '100', id: 'region/00' },
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

test('marker range matching does not mix similarly prefixed IDs', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json([{ '#': '13.0' }, { '#': '136.0' }, { '#': '136.1' }]),
  )
  setApiUrl('/markers')
  assert.deepEqual(
    (await getMapMarkers({ mapMarkerRange: 136 })).map((m) => m['#']),
    ['136.1', '136.0'],
  )
})

test('legacy region data omits locations without map assets and preserves valid entries', async (t) => {
  const validMap = {
    id: 'f1e6/00',
    key: 180,
    hierarchy: 1,
    name: '黑衣森林东部林区',
    subName: '十二神大圣堂',
    regionName: '黑衣森林',
  }
  const missingMap = {
    ...validMap,
    id: '',
    key: 181,
    name: '黑衣森林南部林区',
    subName: '码头小屋',
  }
  const regions = [
    { regionName: '黑衣森林', maps: [validMap, missingMap] },
    { regionName: 'Empty', maps: [missingMap] },
  ]
  t.mock.method(globalThis, 'fetch', async () => Response.json(regions))
  setApiUrl('/legacy')
  assert.deepEqual(await getRegion(), [
    { regionName: '黑衣森林', maps: [validMap] },
  ])
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
