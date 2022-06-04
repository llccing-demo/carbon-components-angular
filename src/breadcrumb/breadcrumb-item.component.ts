import {
	Component,
	HostBinding,
	Input,
	Output,
	EventEmitter,
	Optional
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";

@Component({
	selector: "ibm-breadcrumb-item",
	template: `
	<a
		class="bx--link"
		[href]="(skeleton ? '/#' : href)"
		(click)="navigate($event)"
		[attr.aria-current]="(current ? ariaCurrent : null)"
		*ngIf="useTemplate(); else content">
		<ng-container *ngTemplateOutlet="content"></ng-container>
	</a>
	<ng-template #content>
		<ng-content></ng-content>
	</ng-template>`
})
export class BreadcrumbItemComponent {
	@Input() set href(v: string) {
		this._href = v;
	}

	get href() {
		// 这里做了转换，防止 xss 攻击。
		// Angular 内部了提供了这种过滤方法
		return this.domSanitizer.bypassSecurityTrustUrl(this._href) as string;
	}

	/**
	 * Array of commands to send to the router when the link is activated
	 * See: https://angular.io/api/router/Router#navigate
	 */
	@Input() route: any[];

	/**
	 * Router options. Used in conjunction with `route`
	 * See: https://angular.io/api/router/Router#navigate
	 */
	@Input() routeExtras: any;

	/**
	 * Emits the navigation status promise when the link is activated
	 */
	@Output() navigation = new EventEmitter<Promise<boolean>>();

	@Input() skeleton = false;

	@Input() ariaCurrent = "page";

	@HostBinding("class.bx--breadcrumb-item--current") @Input() current = false;
	// 给 host 元素增加类名
	@HostBinding("class.bx--breadcrumb-item") itemClass = true;

	protected _href: string;

	constructor(protected domSanitizer: DomSanitizer, @Optional() protected router: Router) { }

	useTemplate() {
		return this.skeleton || this._href || this.route;
	}

	navigate(event) {
		if (this.router && this.route) {
			event.preventDefault();
			const status = this.router.navigate(this.route, this.routeExtras);
			this.navigation.emit(status);
		}
	}
}
