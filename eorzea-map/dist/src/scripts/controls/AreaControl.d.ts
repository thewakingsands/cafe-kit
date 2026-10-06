import { Control, ControlOptions } from 'leaflet';
import { EoMap } from '../EoMap.js';
import { IRegion } from '../fetchData.js';
export declare class AreaControl extends Control {
    regions: IRegion[];
    private map;
    private rootContainer;
    private placeNameContainer;
    private select;
    constructor(options: INavigateControlOptions);
    onAdd(map: EoMap): HTMLElement;
    private onSelectChange;
    onRemove(): void;
    private onUpdateInfo;
}
export interface INavigateControlOptions extends ControlOptions {
    regions: IRegion[];
}
