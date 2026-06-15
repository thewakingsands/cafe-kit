import type XIVAPI from '@thewakingsands/xivapi-v2'

export async function findXivRowId(
  api: XIVAPI,
  sheet: string,
  name: string,
  filters: string[] = [],
) {
  const res = await api.search({
    sheets: sheet,
    limit: 1,
    query: [`Name="${escapeQueryValue(name)}"`, ...filters].join(' '),
    fields: null,
  })

  return res.results[0]?.row_id || null
}

function escapeQueryValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
