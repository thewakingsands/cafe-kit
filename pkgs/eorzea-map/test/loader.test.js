import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getIconUrl,
  getMapUrl,
  setIconUrlResolver,
  setMapUrlResolver,
} from '../src/scripts/loader.ts'

test('numeric icons reconstruct padded texture paths and omit empty icons', () => {
  for (const [id, path] of [
    [60442, 'ui/icon/060000/060442.tex'],
    [63300, 'ui/icon/063000/063300.tex'],
    [1, 'ui/icon/000000/000001.tex'],
  ]) {
    assert.equal(new URL(getIconUrl(id)).searchParams.get('path'), path)
    assert.equal(getIconUrl(id), getIconUrl(path))
  }
  for (const id of [undefined, 0, -1, 1.5, NaN, 1000000]) {
    assert.equal(getIconUrl(id), null)
  }
})

test('map URL resolver receives the map ID and can restore the default', (t) => {
  t.after(() => setMapUrlResolver())
  const original = getMapUrl('world/00')
  assert.equal(new URL(original).searchParams.get('format'), 'webp')
  setMapUrlResolver((id) => `https://maps.example.com/${id}.png`)
  assert.equal(getMapUrl('world/00'), 'https://maps.example.com/world/00.png')
  setMapUrlResolver()
  assert.equal(getMapUrl('world/00'), original)
})

test('icon URL resolver receives numeric IDs for both input forms and supports hiding icons', (t) => {
  t.after(() => setIconUrlResolver())
  const original = getIconUrl(60442)
  const ids = []
  setIconUrlResolver((id) => {
    ids.push(id)
    return `/icons/${id}.webp`
  })
  assert.equal(getIconUrl(60442), '/icons/60442.webp')
  assert.equal(getIconUrl('ui/icon/060000/060442.tex'), '/icons/60442.webp')
  assert.equal(getIconUrl(63300), '/icons/63300.webp')
  assert.deepEqual(ids, [60442, 60442, 63300])
  assert.equal(getIconUrl(0), null)
  assert.equal(getIconUrl('invalid'), null)
  assert.equal(ids.length, 3)
  setIconUrlResolver(() => null)
  assert.equal(getIconUrl(60442), null)
  setIconUrlResolver()
  assert.equal(getIconUrl(60442), original)
})
