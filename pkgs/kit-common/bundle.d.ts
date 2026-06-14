declare module "@thewakingsands/kit-common" {
	import {
		Component,
		type ComponentChildren,
		h,
		type JSX,
		render,
	} from "preact";

	export interface ICKStatProps {
		name: string;
		value: ComponentChildren;
		style?: string | JSX.CSSProperties;
	}

	export interface ICKAttributesProps {
		attrs: {
			name: string;
			value?: string | number;
			titleClass?: string;
			style: "half" | "full" | "header" | "half-full";
		}[];
	}

	export interface ICKItemNameProps {
		name: string;
		rarity: number;
		iconSrc?: string;
		type?: string;
		style?: string | JSX.CSSProperties;
		size?: "big" | "medium" | "small";
	}

	export class CKBox extends Component {}
	export class CKBoxBottom extends Component {}
	export class CKComment extends Component {}
	export class CKContainer extends Component<{
		style?: string | JSX.CSSProperties;
		className?: string;
	}> {}
	export class CKStat extends Component<ICKStatProps> {}
	export class CKStatGroup extends Component {}
	export class CKAction extends Component<{
		style?: string | JSX.CSSProperties;
		className?: string;
	}> {}
	export class CKActionIcon extends Component<{
		src: string;
		size: number | string;
	}> {}
	export class CKAttributes extends Component<ICKAttributesProps> {}
	export class CKItemName extends Component<ICKItemNameProps> {}

	export { h, render };
}
