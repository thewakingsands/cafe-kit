import { default as XIVAPI, Models } from '@thewakingsands/xivapi-v2';
export interface ActionData {
    Name: string;
    Icon: Models.Icon;
    ActionCategory: Models.RowReference<{
        Name: string;
    }>;
    ClassJob: Models.RowReference<{
        Name: string;
    }>;
    ClassJobCategory: Models.RowReference<{
        Name: string;
    }>;
    MaxCharges: number;
    Range: number;
    Cast100ms: number;
    Recast100ms: number;
    ClassJobLevel: number;
    EffectRange: number;
}
export interface ActionTransient {
    'Description@as(html)': string;
}
export type ActionRow = Models.RowResponse<ActionData, ActionTransient>;
export declare function queryAction(api: XIVAPI, actionId: number): Promise<ActionRow>;
