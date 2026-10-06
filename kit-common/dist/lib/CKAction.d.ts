import { ComponentChildren, CSSProperties } from 'preact';
export interface ICKActionProps {
    style?: CSSProperties;
    className?: string;
    children?: ComponentChildren;
}
export declare function CKAction(props: ICKActionProps): import("preact").JSX.Element;
