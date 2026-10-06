export interface ICKItemProps {
    name?: string;
    id?: number | string;
    hq?: boolean;
    onUpdate?: () => void;
}
export declare function CKItem(props: ICKItemProps): import("preact").JSX.Element;
