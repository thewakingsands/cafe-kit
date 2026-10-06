import { ICKContext } from './CKContextProvider';
export interface ITooltipLinks {
    detectWikiLinks: boolean;
    itemNameAttribute: string;
    itemIdAttribute: string;
    itemHqAttribute: string;
    actionNameAttribute: string;
    actionIdAttribute: string;
    actionJobIdAttribute: string;
    rootContainer: HTMLElement;
}
export interface ITooltipOptions {
    context: ICKContext;
    links: ITooltipLinks;
}
export declare function initTooltip(opts?: Partial<ITooltipOptions>): void;
