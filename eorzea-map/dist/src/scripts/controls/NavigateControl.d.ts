import { Control } from 'leaflet';
import { EoMap } from '../EoMap.js';
export declare class NavigateControl extends Control {
    private map;
    private rootContainer;
    private rangeInput;
    private rangeLock;
    onAdd(map: EoMap): HTMLElement;
    private onZoomEnd;
    onRemove(): void;
    private onButtonClick;
}
