import { default as XIVAPI } from '@thewakingsands/xivapi-v2';
import { ComponentChildren } from 'preact';
export interface ICKContext {
    xivapiLanguage?: 'none' | 'en' | 'ja' | 'de' | 'fr' | 'chs' | 'tc' | 'ko';
    defaultHq: boolean;
    hideSeCopyright: boolean;
}
export declare const CKContext: import('preact').Context<ICKContext>;
export declare const XIVAPIContext: import('preact').Context<XIVAPI | undefined>;
export declare const CKContextProvider: (props: {
    value: ICKContext;
    children: ComponentChildren;
}) => import("preact").JSX.Element;
export declare const useXIVAPI: () => XIVAPI;
