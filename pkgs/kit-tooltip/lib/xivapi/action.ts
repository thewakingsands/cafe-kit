import type XIVAPI from '@thewakingsands/xivapi-v2'
import type { Models } from '@thewakingsands/xivapi-v2'

export interface ActionData {
  Name: string
  Icon: Models.Icon
  ActionCategory: Models.RowReference<{ Name: string }>
  ClassJob: Models.RowReference<{ Name: string }>
  ClassJobCategory: Models.RowReference<{ Name: string }>
  MaxCharges: number
  Range: number
  Cast100ms: number
  Recast100ms: number
  ClassJobLevel: number
  EffectRange: number
}

export interface ActionTransient {
  Description: string
}

export type ActionRow = Models.RowResponse<ActionData, ActionTransient>

const actionColumns = [
  'Icon',
  'Name',
  'Description',
  'ActionCategory.Name',
  'ClassJob.Name',
  'ClassJobCategory.Name',
  'MaxCharges',
  'Range',
  'Cast100ms',
  'Recast100ms',
  'ClassJobLevel',
  'EffectRange',
]

export async function queryAction(
  api: XIVAPI,
  actionId: number,
): Promise<ActionRow> {
  return api.data
    .sheets()
    .get<ActionData, ActionTransient>('Action', actionId.toString(), {
      fields: actionColumns,
    })
}
