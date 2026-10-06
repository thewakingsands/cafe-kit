export interface ICKActionProps {
    name?: string;
    id?: number | string;
    jobId?: number;
    pvp?: boolean;
    onUpdate?: () => void;
}
export declare function CKAction(props: ICKActionProps): import("preact").JSX.Element;
