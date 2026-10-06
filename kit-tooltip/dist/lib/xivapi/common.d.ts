import { default as XIVAPI } from '@thewakingsands/xivapi-v2';
export declare function findXivRowId(api: XIVAPI, sheet: string, name: string, filters?: string[]): Promise<number | null>;
