import {
	HostBinding,
	Component,
	Input,
	ElementRef,
	Output,
	EventEmitter,
	AfterViewInit
} from "@angular/core";

/**
 * Available HTML anchor targets
 */
export enum Target {
	self = "_self",
	blank = "_blank",
	parent = "_parent",
	top = "_top"
}

/**
 * Security HTML anchor rel when target is set
 */
const REL = "noreferrer noopener";

/**
 * `OverflowMenuOption` represents a single option in an overflow menu
 *
 * Presently it has three possible states - normal, disabled, and danger:
 * ```
 * <ibm-overflow-menu-option>Simple option</ibm-overflow-menu-option>
 * <ibm-overflow-menu-option disabled="true">Disabled</ibm-overflow-menu-option>
 * <ibm-overflow-menu-option type="danger">Danger option</ibm-overflow-menu-option>
 * ```
 *
 * For content that expands beyond the overflow menu `OverflowMenuOption` automatically adds a title attribute.
 */
@Component({
	selector: "ibm-overflow-menu-option",
	template: `
		<button
			*ngIf="!href"
			class="bx--overflow-menu-options__btn {{innerClass}}"
			role="menuitem"
			[tabindex]="tabIndex"
			(focus)="onFocus()"
			(blur)="onBlur()"
			(click)="onClick()"
			[disabled]="disabled"
			[attr.title]="title">
			<ng-container *ngTemplateOutlet="tempOutlet"></ng-container>
		</button>

		<a
			*ngIf="href"
			class="bx--overflow-menu-options__btn {{innerClass}}"
			role="menuitem"
			[tabindex]="tabIndex"
			(focus)="onFocus()"
			(blur)="onBlur()"
			(click)="onClick()"
			[attr.disabled]="disabled"
			[href]="href"
			[attr.target]="target"
			[attr.rel]="rel"
			[attr.title]="title">
			<!-- 这里的 ng-container 和 ng-template、ng-content 的组合使用 -->
			<ng-container *ngTemplateOutlet="tempOutlet"></ng-container>
		</a>

		<ng-template #tempOutlet>
			<div class="bx--overflow-menu-options__option-content">
				<ng-content></ng-content>
			</div>
		</ng-template>
	`
})
export class OverflowMenuOption implements AfterViewInit {
	@HostBinding("class.bx--overflow-menu-options__option") optionClass = true;
	@HostBinding("attr.role") role = "presentation";

	@HostBinding("class.bx--overflow-menu-options__option--danger")
	public get isDanger(): Boolean {
		return this.type === "danger";
	}

	@HostBinding("class.bx--overflow-menu-options__option--disabled")
	public get isDisabled(): Boolean {
		return this.disabled;
	}
	/**
	 * Set to `true` to display a dividing line above this option
	 */
	@HostBinding("class.bx--overflow-menu--divider") @Input() divider = false;
	/**
	 * toggles between `normal` and `danger` states
	 */
	@Input() type: "normal" | "danger" = "normal";
	/**
	 * disable/enable interactions
	 */
	@Input() disabled = false;
	/**
	 * If it's an anchor, this is its location
	 */
	@Input() href: string;
	/**
	 * Allows to add a target to the anchor
	 */
	@Input() set target(value: Target) {
		if (!Object.values(Target).includes(value)) {
			console.warn(
`\`target\` must have one of the following values: ${Object.values(Target).join(", ")}.
Please use the \`Target\` enum exported by carbon-components-angular`);
			return;
		}

		this._target = value;
	}
	/**
	 * Apply a custom class to the inner button/anchor
	 */
	@Input() innerClass = "";

	get target() {
		return this._target;
	}
	/**
	 * rel only returns its value if target is defined
	 */
	get rel() {
		return this._target ? REL : null;
	}

	@Output() selected: EventEmitter<any> = new EventEmitter();

	public tabIndex = -1;
	// note: title must be a real attribute (i.e. not a getter) as of Angular@6 due to
	// change after checked errors
	public title = null;

	protected _target: Target;

	constructor(protected elementRef: ElementRef) {}

	onClick() {
		this.selected.emit();
	}

	onFocus() {
		setTimeout(() => this.tabIndex = 0);
	}

	onBlur() {
		setTimeout(() => this.tabIndex = -1);
	}

	ngAfterViewInit() {
		const button = this.elementRef.nativeElement.querySelector("button, a");
		const textContainer = button.querySelector(".bx--overflow-menu-options__option-content");
		// https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
		// scrollWidth > offsetWidth 说明内容比较多，出现滚动条。这时设置了 title 属性
		if (textContainer.scrollWidth > textContainer.offsetWidth) {
			this.title = button.textContent;
		}
	}
}
