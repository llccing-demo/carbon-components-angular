import {
	Component,
	Input,
	ContentChildren,
	QueryList,
	AfterContentInit,
	TemplateRef,
	Optional,
	Output,
	EventEmitter
} from "@angular/core";

import { BreadcrumbItem } from "./breadcrumb-item.interface";
import { BreadcrumbItemComponent } from "./breadcrumb-item.component";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";

/**
 * 最小溢出阈值
 * so, what this value stand for
 * Todo
 */
const MINIMUM_OVERFLOW_THRESHOLD = 4;

/**
 *  [See demo](../../?path=/story/components-breadcrumb--basic)
 *
 * <example-url>../../iframe.html?id=components-breadcrumb--basic</example-url>
 */
@Component({
	selector: "ibm-breadcrumb",
	template: `
	<nav #nav class="bx--breadcrumb"
		[ngClass]="{
			'bx--skeleton' : skeleton,
			'bx--breadcrumb--no-trailing-slash' : noTrailingSlash
		}"
		[attr.aria-label]="ariaLabel">
		<ng-template [ngIf]="shouldShowContent">
			<ng-content></ng-content>
		</ng-template>
		<ng-template [ngIf]="!shouldShowOverflow">
			<ibm-breadcrumb-item
				*ngFor="let item of items"
				[href]="item.href"
				[route]="item.route"
				[routeExtras]="item.routeExtras"
				[current]="item.current"
				[ariaCurrent]="item.ariaCurrent"
				(navigation)="navigation.emit($event)">
				<ng-container *ngIf="!item.template">{{item.content}}</ng-container>
				// 这里可以看到 content 支持传入模板
				// 并且 context 绑定了 item 值。
				// ngTemplateOutlet 的介绍可以参考 Accordion 组件解析
				<ng-template
					*ngIf="item.template"
					[ngTemplateOutlet]="item.template"
					[ngTemplateOutletContext]="{ $implicit: item }">
				</ng-template>
			</ibm-breadcrumb-item>
		</ng-template>
		<ng-template [ngIf]="shouldShowOverflow">
			<ibm-breadcrumb-item
				// 这里的 ? 号语法可以处理 first 是 null 的情况
				// https://github.com/e2tox/blog/issues/9
				// ? 安全链式调用
				// ! 强制链式调用, 确信某个字段一定存在
				[href]="first?.href"
				[route]="first?.route"
				[routeExtras]="first?.routeExtras"
				[current]="first?.current"
				[ariaCurrent]="first?.ariaCurrent"
				(navigation)="navigation.emit($event)">
				<ng-container *ngIf="!first?.template">{{first?.content}}</ng-container>
				<ng-template
					*ngIf="first?.template"
					[ngTemplateOutlet]="first?.template"
					[ngTemplateOutletContext]="{ $implicit: first }">
				</ng-template>
			</ibm-breadcrumb-item>
			<ibm-breadcrumb-item>
				<ibm-overflow-menu>
					<li class="bx--overflow-menu-options__option"
						*ngFor="let item of overflowItems">
						<a class="bx--overflow-menu-options__btn"
							href="{{item?.href}}"
							// a 标签的点击事件传入了 $event
							// 从 navigate 函数中可以看到, 使用 event.preventDefault() 阻止了 a 标签默认行为 -- 打开新的标签。
							(click)="navigate($event, item)"
							style="text-decoration: none;">
							<ng-container *ngIf="!item?.template">{{item?.content}}</ng-container>
							<ng-template
								*ngIf="item?.template"
								[ngTemplateOutlet]="item?.template"
								[ngTemplateOutletContext]="{ $implicit: item }">
							</ng-template>
						</a>
					</li>
				</ibm-overflow-menu>
			</ibm-breadcrumb-item>
			<ibm-breadcrumb-item
				[href]="secondLast?.href"
				[route]="secondLast?.route"
				[routeExtras]="secondLast?.routeExtras"
				[current]="secondLast?.current"
				[ariaCurrent]="secondLast?.ariaCurrent"
				(navigation)="navigation.emit($event)">
				<ng-container *ngIf="!secondLast?.template">{{secondLast?.content}}</ng-container>
				<ng-template
					*ngIf="secondLast?.template"
					[ngTemplateOutlet]="secondLast?.template"
					[ngTemplateOutletContext]="{ $implicit: secondLast }">
				</ng-template>
			</ibm-breadcrumb-item>
			<ibm-breadcrumb-item
				[href]="last?.href"
				[route]="last?.route"
				[routeExtras]="last?.routeExtras"
				[current]="last?.current"
				[ariaCurrent]="last?.ariaCurrent"
				(navigation)="navigation.emit($event)">
				<ng-container *ngIf="!last?.template">{{last?.content}}</ng-container>
				<ng-template
					*ngIf="last?.template"
					[ngTemplateOutlet]="last?.template"
					[ngTemplateOutletContext]="{ $implicit: last }">
				</ng-template>
			</ibm-breadcrumb-item>
		</ng-template>
	</nav>`
})
export class Breadcrumb implements AfterContentInit {
	// 获取到 host (内容投影的 item 组件) 的所有 breadcrumbitem 组件，放到 chilren 数组中
	@ContentChildren(BreadcrumbItemComponent) children: QueryList<BreadcrumbItemComponent>;

	@Input() items: Array<BreadcrumbItem>;

	@Input() noTrailingSlash = false;

	@Input() ariaLabel: string;

	@Input()
	set skeleton(value: any) {
		this._skeleton = value;
		this.updateChildren();
	}

	get skeleton(): any {
		return this._skeleton;
	}

	@Input()
	set threshold(threshold: number) {
		this._threshold = threshold;
		if (isNaN(threshold) || threshold < MINIMUM_OVERFLOW_THRESHOLD) {
			this._threshold = MINIMUM_OVERFLOW_THRESHOLD;
		}
	}

	get threshold(): number {
		return this._threshold;
	}

	/**
	 * Emits the navigation status promise when the link is activated
	 */
	@Output() navigation = new EventEmitter<Promise<boolean>>();

	get shouldShowContent(): boolean {
		return !this.items;
	}

	get shouldShowOverflow(): boolean {
		if (!this.items) {
			return false;
		}
		return this.items.length > this.threshold;
	}
	// 取了第一个元素
	get first(): BreadcrumbItem {
		return this.shouldShowOverflow ? this.items[0] : null;
	}
	// 取第二个 到 倒数第三个
	get overflowItems(): Array<BreadcrumbItem> {
		return this.shouldShowOverflow ? this.items.slice(1, this.items.length - 2) : [];
	}
	// 倒数第二个
	get secondLast(): BreadcrumbItem {
		return this.shouldShowOverflow ? this.items[this.items.length - 2] : null;
	}
	// 最后一个
	get last(): BreadcrumbItem {
		return this.shouldShowOverflow ? this.items[this.items.length - 1] : null;
	}

	protected _threshold: number;
	protected _skeleton = false;

	constructor(protected domSanitizer: DomSanitizer, @Optional() protected router: Router) { }

	ngAfterContentInit() {
		this.updateChildren();
	}

	navigate(event, item: BreadcrumbItem) {
		if (this.router && item.route) {
			event.preventDefault();
			// 这里返回了 navigate 的结果
      		// 参考 https://angular.io/api/router/Router Router 的 API
      		// navigate(commands: any[], extras: NavigationExtras = { skipLocationChange: false }): Promise<boolean>
      		// 返回的是 Promise<boolean>，异步的
			const status = this.router.navigate(item.route, item.routeExtras);
			this.navigation.emit(status);
		}
	}

	protected updateChildren() {
		if (this.children) {
			this.children.toArray().forEach(child => child.skeleton = this.skeleton);
		}
	}
}
