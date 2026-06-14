import XIVAPI, { formatIconUrl } from '@thewakingsands/xivapi-v2'
import type { ICKContext } from './CKContextProvider'

interface XivRow {
  row_id?: number
  fields?: Record<string, any>
  transient?: Record<string, any>
}

interface XivRelation extends XivRow {
  value?: number
  sheet?: string
}

interface XivIcon {
  path?: string
  path_hr1?: string
}

export function createXivApi(context: ICKContext) {
  return new XIVAPI({
    version: context.xivapiVersion || 'latest',
    language: context.xivapiLanguage || 'chs',
  })
}

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
  })

  return res.results[0]?.row_id || null
}

export function normalizeActionRow(row: XivRow) {
  return normalizeXivRow(row)
}

export function normalizeItemRow(row: XivRow) {
  const item = normalizeXivRow(row)
  const fields = row.fields || {}

  item.ID = row.row_id
  item.Icon = formatMaybeIcon(fields.Icon) || item.Icon

  if (isRelation(fields.LevelItem)) {
    item.LevelItem = fields.LevelItem.row_id || fields.LevelItem.value
  }

  expandIndexedRelations(item, 'BaseParam', fields.BaseParam)
  expandIndexedValues(item, 'BaseParamValue', fields.BaseParamValue)
  expandIndexedSpecials(item, fields.BaseParamSpecial)
  expandIndexedValues(
    item,
    'BaseParamValueSpecial',
    fields.BaseParamValueSpecial,
  )

  return item
}

function normalizeXivRow(row: XivRow) {
  const data = {
    ...normalizeFields(row.fields || {}),
    ...normalizeFields(row.transient || {}),
  }
  data.ID = row.row_id
  return data
}

function normalizeFields(fields: Record<string, any>) {
  const data: Record<string, any> = {}
  for (const key in fields) {
    data[key] = normalizeValue(fields[key])
  }
  return data
}

function normalizeValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map(normalizeValue)
  }

  if (isIcon(value)) {
    return formatMaybeIcon(value)
  }

  if (isRelation(value)) {
    return {
      ...normalizeFields(value.fields || {}),
      ID: value.row_id || value.value,
      TargetID: value.value,
      value: value.value,
    }
  }

  if (value && typeof value === 'object') {
    return normalizeFields(value)
  }

  return value
}

function expandIndexedRelations(
  target: Record<string, any>,
  prefix: string,
  values?: XivRelation[],
) {
  if (!Array.isArray(values)) {
    return
  }

  values.forEach((value, index) => {
    target[`${prefix}${index}`] = normalizeValue(value)
  })
}

function expandIndexedValues(
  target: Record<string, any>,
  prefix: string,
  values?: any[],
) {
  if (!Array.isArray(values)) {
    return
  }

  values.forEach((value, index) => {
    target[`${prefix}${index}`] = value
  })
}

function expandIndexedSpecials(
  target: Record<string, any>,
  values?: XivRelation[],
) {
  if (!Array.isArray(values)) {
    return
  }

  values.forEach((value, index) => {
    target[`BaseParamSpecial${index}TargetID`] = value.row_id || value.value
  })
}

function formatMaybeIcon(value?: string | XivIcon) {
  if (!value) {
    return value
  }

  if (typeof value === 'string') {
    return formatIconUrl(value)
  }

  const path = value.path_hr1 || value.path
  return path ? formatIconUrl(path) : ''
}

function isRelation(value: any): value is XivRelation {
  return (
    !!value && typeof value === 'object' && 'value' in value && 'sheet' in value
  )
}

function isIcon(value: any): value is XivIcon {
  return (
    !!value &&
    typeof value === 'object' &&
    ('path' in value || 'path_hr1' in value)
  )
}

function escapeQueryValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
