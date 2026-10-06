import { default as XIVAPI, Models } from '@thewakingsands/xivapi-v2';
export interface Bonus {
    ID: number;
    Name: string;
    Max?: number;
    MaxHQ?: number;
    Relative: boolean;
    Value?: number;
    ValueHQ?: number;
}
export interface ItemData {
    Name: string;
    Description: string;
    Icon: Models.Icon;
    Block: number;
    BlockRate: number;
    Delayms: number;
    DamageMag: number;
    DamagePhys: number;
    DefenseMag: number;
    DefensePhys: number;
    IsUnique: boolean;
    IsUntradable: boolean;
    PriceLow: number;
    Rarity: number;
    MateriaSlotCount: number;
    CanBeHq: boolean;
    IsAdvancedMeldingPermitted: boolean;
    BaseParam: Models.RowReference<{
        Name: string;
    }>[];
    'BaseParamSpecial@as(raw)': number[];
    BaseParamSpecial: Models.RowReference<{
        Name: string;
    }>[];
    BaseParamValue: number[];
    BaseParamValueSpecial: number[];
    ItemUICategory: Models.RowReference<{
        Name: string;
    }>;
    EquipSlotCategory: Models.RowReference<{
        MainHand: number;
        OffHand: number;
    }>;
    ClassJobCategory: Models.RowReference<{
        Name: string;
    }>;
    ClassJobRepair: Models.RowReference<{
        Name: string;
    }>;
    ItemRepair: Models.RowReference<{
        Item: Models.RowReference<{
            Name: string;
        }>;
    }>;
    LevelEquip: number;
    'LevelItem@as(raw)': number;
    ItemAction: Models.RowReference<{
        'Action@as(raw)': number;
        Data: number[];
    }>;
    Bonuses?: Bonus[];
    DyeCount: number;
    IsCrestWorthy: boolean;
    MaterializeType: number;
    Desynth: number;
}
export type ItemRow = Models.RowResponse<ItemData, unknown>;
export declare function queryItem(api: XIVAPI, itemId: number): Promise<ItemRow>;
