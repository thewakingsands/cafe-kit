import { LatLngBoundsLiteral } from 'leaflet';
import { EoMap } from './EoMap.js';
export declare function initMap(el: HTMLElement): Promise<EoMap>;
export declare const MAP_SIZE = 2048;
export declare const MAP_BOUNDS: LatLngBoundsLiteral;
