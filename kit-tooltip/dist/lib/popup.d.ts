import { ICKActionProps } from './CKAction';
import { ICKContext } from './CKContextProvider';
import { ICKItemProps } from './CKItem';
export declare function popupItem(context: ICKContext, props: ICKItemProps, refEl: HTMLElement): void;
export declare function popupAction(context: ICKContext, props: ICKActionProps, refEl: HTMLElement): void;
export declare function hidePopup(): void;
