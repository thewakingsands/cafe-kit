import { VNode } from 'preact';
export interface ICKItemNameProps {
    name: string | VNode;
    rarity: number;
    iconSrc?: string;
    type?: string;
    style?: any;
    size?: 'big' | 'medium' | 'small';
}
export declare function CKItemName(props: ICKItemNameProps): import("preact").JSX.Element;
