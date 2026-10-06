export declare const NULL_ICON_GROUP = "000000";
export declare function getMapUrl(id: string): string;
export declare function getIconUrl(icon: string): string | null;
export declare function parseIcon(icon: string): IIconParseResult;
export interface IIconParseResult {
    group: string;
    id: string;
}
export interface IMapInfo {
    '#': string;
    id: string;
    sizeFactor: number;
    'placeName{Region}': string;
    'placeName{Sub}': string;
    'offset{X}': number;
    'offset{Y}': number;
    territoryType: string;
    placeName: string;
    mapMarkerRange: number;
    hierarchy: number;
}
export interface IMapMarker {
    '#': string;
    x: number;
    y: number;
    icon: string;
    'placeName{Subtext}': string;
    subtextOrientation: number;
    mapMarkerRegion: string;
    type: number;
    'data{Type}': number;
    'data{Key}': string;
}
