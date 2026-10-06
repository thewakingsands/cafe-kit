import { Control, ControlOptions } from 'leaflet';
import { EoMap } from '../EoMap.js';
export declare class PosControl extends Control {
    private rootContainer;
    private mapContainer;
    private map;
    private scaleFactor;
    constructor(options: IPosControlOptions);
    setScaleFactor(factor: number): void;
    onAdd(map: EoMap): HTMLElement;
    private onUpdateInfo;
    onRemove(): void;
    private onMouseMoveEvent;
    private onMouseLeaveEvent;
}
export interface IPosControlOptions extends ControlOptions {
    scaleFactor?: number;
}
