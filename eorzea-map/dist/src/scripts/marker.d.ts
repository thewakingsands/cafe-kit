import { Icon, Marker } from 'leaflet';
import { IMapMarker } from './loader.js';
export declare function isMinimap(icon: string): boolean;
export declare function getIcon(icon: string): Icon | null;
export declare function createMarker(markerInfo: IMapMarker): Marker | null;
