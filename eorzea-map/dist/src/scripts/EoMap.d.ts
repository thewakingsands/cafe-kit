import { Map as LFMap, Marker } from 'leaflet';
import { IRegion } from './fetchData.js';
import { IMapInfo } from './loader.js';
export declare class EoMap extends LFMap {
    mapInfo: IMapInfo;
    private markers;
    private overlays;
    private tileLayer;
    private markersLayerGroup;
    private tooltipsLayerGroup;
    private gridOverlay;
    private layersControl;
    private previousMapInfo;
    private updateInfoHandlers;
    private el;
    init(regions: IRegion[], el: HTMLElement): void;
    private onZoomEnd;
    private loadMapLayer;
    loadMapInfo(mapInfo: IMapInfo): Promise<this>;
    loadMapKey(mapKey: number): Promise<this>;
    loadMapId(mapId: string): Promise<this>;
    addMaker(marker: Marker): Marker<any>;
    addMarker(marker: Marker): Marker<any>;
    onUpdateInfo(handler: (info: IMapInfo) => void): void;
    offUpdateInfo(handler: (info: IMapInfo) => void): void;
    /**
     * 从解包数据的 2D 坐标点数据换算成 UI 用的地图坐标 XY 数据
     * @param x X 坐标
     * @param y Y 坐标
     */
    toMapXY2D(x: number, y: number): [number, number];
    /**
     * 从解包数据的 2D 坐标换算成经纬度
     * @param x X 坐标
     * @param y Y 坐标
     */
    mapToLatLng2D(x: number, y: number): [number, number];
    /**
     * 从解包数据的 3D 坐标点换算成 UI 用的地图坐标 XY 数据
     * @param x X 坐标
     * @param z Y 坐标
     */
    toMapXY3D(x: number, z: number): [number, number];
    /**
     * 从 UI 上的坐标 XY 数据换算成解包数据的 2D 坐标点
     * @param x X 坐标
     * @param y Y 坐标
     */
    fromMapXY2D(x: number, y: number): [number, number];
    /**
     * 从解包的 3D 数据换算为解包数据的 2D 坐标点
     * @param x X 坐标
     * @param z Z 坐标
     */
    from3D(x: number, z: number): [number, number];
}
