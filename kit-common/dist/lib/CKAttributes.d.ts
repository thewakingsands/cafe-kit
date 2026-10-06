export interface ICKAttribute {
    name: string;
    value?: string | number;
    titleClass?: string;
    style: 'half' | 'full' | 'header' | 'half-full';
}
export interface ICKAttributesProps {
    attrs: ICKAttribute[];
}
export declare function CKAttributes(props: ICKAttributesProps): import("preact").JSX.Element;
