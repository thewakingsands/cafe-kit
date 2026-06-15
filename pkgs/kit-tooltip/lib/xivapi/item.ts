import type XIVAPI from '@thewakingsands/xivapi-v2'
import type { Models } from '@thewakingsands/xivapi-v2'

export interface Bonus {
  ID: number
  Name: string

  Max?: number
  MaxHQ?: number
  Relative: boolean
  Value?: number
  ValueHQ?: number
}

export interface ItemData {
  Name: string
  Description: string
  Icon: Models.Icon
  Block: number
  BlockRate: number
  Delayms: number
  DamageMag: number
  DamagePhys: number
  DefenseMag: number
  DefensePhys: number
  IsUnique: boolean
  IsUntradable: boolean
  PriceLow: number
  Rarity: number
  MateriaSlotCount: number
  CanBeHq: boolean
  IsAdvancedMeldingPermitted: boolean
  BaseParam: Models.RowReference<{ Name: string }>[]
  'BaseParamSpecial@as(raw)': number[]
  BaseParamSpecial: Models.RowReference<{ Name: string }>[]
  BaseParamValue: number[]
  BaseParamValueSpecial: number[]
  ItemUICategory: Models.RowReference<{ Name: string }>
  EquipSlotCategory: Models.RowReference<{
    MainHand: number
    OffHand: number
  }>
  ClassJobCategory: Models.RowReference<{ Name: string }>
  ClassJobRepair: Models.RowReference<{ Name: string }>
  ItemRepair: Models.RowReference<{
    Item: Models.RowReference<{ Name: string }>
  }>
  LevelEquip: number
  'LevelItem@as(raw)': number
  ItemAction: Models.RowReference<{
    'Action@as(raw)': number
    Data: number[]
  }>

  Bonuses?: Bonus[]

  DyeCount: number
  IsCrestWorthy: boolean
  MaterializeType: number
  Desynth: number
}

export type ItemRow = Models.RowResponse<ItemData, unknown>
const itemColumns = [
  'Name',
  'Description',
  'Icon',
  'Block',
  'BlockRate',
  'Delayms',
  'DamageMag',
  'DamagePhys',
  'DefenseMag',
  'DefensePhys',
  'IsUnique',
  'IsUntradable',
  'PriceLow',
  'Rarity',
  'MateriaSlotCount',
  'CanBeHq',
  'IsAdvancedMeldingPermitted',
  'BaseParam[].Name',
  'BaseParamSpecial@as(raw)',
  'BaseParamValue',
  'BaseParamValueSpecial',
  'ItemUICategory',
  'EquipSlotCategory.MainHand',
  'EquipSlotCategory.OffHand',
  'ClassJobCategory.Name',
  'ClassJobRepair.Name',
  'ItemRepair.Item.Name',
  'LevelEquip',
  'LevelItem@as(raw)',
  'DyeCount',
  'IsCrestWorthy',
  'MaterializeType',
  'Desynth',
  'ItemAction.Action@as(raw)',
  'ItemAction.Data',
]

const bonusActions = [844, 845, 846]
export async function queryItem(api: XIVAPI, itemId: number) {
  const itemRow = (await api.items.get(itemId, {
    fields: itemColumns,
  })) as ItemRow

  const { 'Action@as(raw)': actionId, Data: actionData } =
    itemRow.fields.ItemAction.fields
  if (bonusActions.includes(actionId)) {
    const foodId = actionData[1]
    if (foodId) {
      itemRow.fields.Bonuses = await queryItemFoodBouns(api, foodId)
    }
  }
  return itemRow as ItemRow
}

async function queryItemFoodBouns(api: XIVAPI, foodId: number) {
  const bonuses: Bonus[] = []
  const res = await api.data.sheets().get('ItemFood', `${foodId}`, {
    fields: [
      'BaseParam[].Name',
      'IsRelative',
      'Value',
      'ValueHQ',
      'Max',
      'MaxHQ',
    ],
  })
  const { BaseParam, IsRelative, Value, ValueHQ, Max, MaxHQ } = res.fields as {
    BaseParam: Models.RowReference<{ Name: string }>[]
    IsRelative: boolean[]
    Value: number[]
    ValueHQ: number[]
    Max: number[]
    MaxHQ: number[]
  }

  for (let i = 0; i < BaseParam.length; ++i) {
    const {
      value: ID,
      fields: { Name },
    } = BaseParam[i]
    if (ID === 0) continue

    const relative = IsRelative[i]
    const entry: Bonus = {
      ID,
      Name,
      Relative: relative,
    }

    const value = Value[i]
    if (value > 0) {
      entry.Value = value
      entry.ValueHQ = ValueHQ[i]

      if (relative) {
        entry.Max = Max[i]
        entry.MaxHQ = MaxHQ[i]
      }
    }

    bonuses.push(entry)
  }

  return bonuses
}
