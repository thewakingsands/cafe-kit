import { LatLng, Point } from 'leaflet';
import { EoMap } from './EoMap.js';
export declare class XYPoint extends Point {
    constructor(x: number, y: number, round?: boolean);
}
export declare function xy(xy: [number, number]): [number, number];
export declare function xy(x: number, y: number): [number, number];
export declare function llXy(latlng: LatLng): [number, number];
export declare function eventToGame(e: any, map: EoMap): [number, number];
