import { Subject } from "rxjs";
import { TemplateRef } from "@angular/core";

export interface NotificationContent {
	// 这应该属于留个自由扩展的口给使用者
	[key: string]: any;
	type: string;
	title: string;
	target?: string;
	duration?: number;
	smart?: boolean;
	closeLabel?: any;
	message?: string;
	showClose?: boolean;
	lowContrast?: boolean;
	template?: TemplateRef<any>;
	actions?: NotificationAction[];
	links?: NotificationLink[];
}

// 这里使用的 继承, 然后增加了额外的三个属性
export interface ToastContent extends NotificationContent {
	subtitle: string;
	caption: string;
	// 这个 template 在 父级接口已经声明了，不应该重复声明。
	template?: TemplateRef<any>;
}

export interface NotificationAction {
	text: string;
	click: Subject<{event: Event, action: any}> | ((event: {event: Event, action: any}) => any);
	[x: string]: any;
}

export interface NotificationLink {
	text: string;
	href: string;
}
