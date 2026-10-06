import { IMapInfo } from './loader.js';
export declare function toMapCoordinate2D(value: number, sizeFactor: number, offset: number): number;
export declare function fromMapCoordinate2D(coord: number, sizeFactor: number, _offset: number): number;
export declare function toMapCoordinate3D(value: number, sizeFactor: number, offset: number): number;
export declare function toMapXY2D(mapInfo: IMapInfo, x: number, y: number): [number, number];
export declare function toMapXY3D(mapInfo: IMapInfo, x: number, y: number): [number, number];
export declare function fromMapXY2D(mapInfo: IMapInfo, x: number, y: number): [number, number];
