import { IMapInfo, IMapMarker } from './loader.js';
export declare function setApiUrl(url: string): void;
export declare function getMapMarkers(map: IMapInfo): Promise<IMapMarker[]>;
export declare function getMap(mapKey: number): Promise<IMapInfo>;
export declare function getMapKeyById(mapId: string): Promise<number>;
export declare function getRegion(): Promise<IRegion[]>;
export interface IRegion {
    regionName: string;
    maps: Array<{
        id: string;
        key: number;
        hierarchy: number;
        name: string;
        subName: string;
    }>;
}
