import assert from 'node:assert/strict'
import { test } from 'node:test'
import XIVAPI, { formatMapUrl } from '../dist/index.mjs'

test('map URLs preserve territory/index and support image formats', () => {
  const url = new URL(formatMapUrl('world/00', { format: 'png' }))
  assert.equal(url.pathname, '/api/asset/map/world/00')
  assert.equal(url.search, '?format=png')
  assert.equal(new URL(formatMapUrl('world/00')).search, '')
  assert.throws(() => formatMapUrl('../invalid'), /Invalid map ID/)
})

test('map requests return binary data and accept image formats', async (t) => {
  let requested
  t.mock.method(globalThis, 'fetch', async (url) => {
    requested = new URL(url)
    return new Response(new Uint8Array([1, 2, 3]), {
      headers: { 'content-type': 'image/jpeg' },
    })
  })
  const api = new XIVAPI({ language: 'chs' })
  const bytes = await api.data.assets().map('s1d1/00')
  assert.deepEqual([...new Uint8Array(bytes)], [1, 2, 3])
  assert.equal(requested.pathname, '/api/asset/map/s1d1/00')
  assert.equal(requested.search, '')
  assert.equal(
    api.formatMapUrl('region/01', { format: 'webp' }),
    formatMapUrl('region/01', { format: 'webp' }),
  )
  await api.data.assets().map('s1d1/00', { format: 'png' })
  assert.equal(requested.search, '?format=png')
})

test('data requests keep language and field filters without a game version', async (t) => {
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    requests.push(new URL(url))
    return Response.json({ rows: [], fields: {}, schema: 'schema@rev' })
  })
  await new XIVAPI().data.sheets().all()
  const api = new XIVAPI({ language: 'chs' })
  await api.data.sheets().list('Map', {
    fields: ['Id', 'SizeFactor'],
    schema: 'schema@rev',
  })
  await api.items.get(1, { fields: ['Name'] })
  await api.data.assets().get({
    path: 'ui/icon/060000/060561.tex',
    format: 'png',
  })
  await api.search({ sheets: 'Item', query: 'Name="Potion"', language: 'en' })

  assert.equal(requests.length, 5)
  for (const url of requests)
    assert.equal(url.searchParams.has('version'), false)
  assert.equal(requests[0].searchParams.get('language'), 'en')
  assert.equal(requests[1].searchParams.get('language'), 'chs')
  assert.equal(requests[1].searchParams.get('fields'), 'Id,SizeFactor')
  assert.equal(requests[1].searchParams.get('schema'), 'schema@rev')
  assert.equal(requests[2].pathname, '/api/sheet/Item/1')
  assert.equal(requests[2].searchParams.get('fields'), 'Name')
  assert.equal(
    requests[3].searchParams.get('path'),
    'ui/icon/060000/060561.tex',
  )
  assert.equal(requests[3].searchParams.get('format'), 'png')
  assert.equal(requests[4].searchParams.get('query'), 'Name="Potion"')
})

test('map requests propagate API errors', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ code: 404, message: 'map missing' }, { status: 404 }),
  )
  await assert.rejects(
    new XIVAPI().data.assets().map('missing/00'),
    /map missing/,
  )
})
