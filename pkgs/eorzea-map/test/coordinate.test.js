import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fromMapXY2D, toMapXY2D, toMapXY3D } from '../src/scripts/coordinate.ts'

test('omitted offsets behave like zero offsets without losing nonzero offsets', () => {
  const map = { rowId: 1, id: 'test/00', sizeFactor: 100, marker: 0 }
  const explicit = { ...map, offsetX: 0, offsetY: 0 }
  for (const convert of [fromMapXY2D, toMapXY2D, toMapXY3D]) {
    assert.deepEqual(convert(map, 0, 0), convert(explicit, 0, 0))
    assert.ok(convert(map, 0, 0).every(Number.isFinite))
  }
  assert.notDeepEqual(
    toMapXY3D({ ...map, offsetX: -10, offsetY: 20 }, 0, 0),
    toMapXY3D(map, 0, 0),
  )
})
