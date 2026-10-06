import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getIconUrl } from '../src/scripts/loader.ts'

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
