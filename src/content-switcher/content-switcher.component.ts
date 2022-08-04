import {
	Component,
	Input,
	ContentChildren,
	QueryList,
	Output,
	EventEmitter,
	AfterViewInit,
	HostListener,
	ElementRef
} from "@angular/core";
import { ContentSwitcherOption } from "./content-switcher-option.directive";
import { isFocusInLastItem, isFocusInFirstItem } from "carbon-components-angular/common";

/**
 * The content switcher can be used for toggling between distinct options.
 * Similar to tabs, but without an associated content panel
 *
 * [See demo](../../?path=/story/components-content-switcher--basic)
 *
 * ```html
 * <ibm-content-switcher (selected)="selected($event)">
 *		<button ibmContentOption>First section</button>
 *		<button ibmContentOption>Second section</button>
 *		<button ibmContentOption>Third section</button>
 *	</ibm-content-switcher>
 *	```
 *
 * <example-url>../../iframe.html?id=components-content-switcher--basic</example-url>
 */
@Component({
	selector: "ibm-content-switcher",
	template: `
		<div
			[attr.aria-label]="ariaLabel"
			class="bx--content-switcher"
			[class.bx--content-switcher--light]="theme === 'light'"
			role="tablist">
			<ng-content></ng-content>
		</div>
	`
})
export class ContentSwitcher implements AfterViewInit {
	@Input() ariaLabel = "content switcher";
	/**
	 * `light` or `dark` content switcher theme
	 */
	@Input() theme: "light" | "dark" = "dark";

	/**
	 * Emits the activated `ContentSwitcherOption`
	 */
	@Output() selected = new EventEmitter<ContentSwitcherOption>();

	// 父组件中 查询到全部的子组件
	@ContentChildren(ContentSwitcherOption) options: QueryList<ContentSwitcherOption>;

	constructor(protected elementRef: ElementRef) {}

	ngAfterViewInit() {
		const firstActive = this.options.find(option => option.active);
		// delay setting active until the DOM has settled
		if (!firstActive) {
			setTimeout(() => this.options.first.active = true);
		}
		// subscribe to each item, emit when one is selected, and reset the active states
		this.options.forEach(option => {
			option.selected.subscribe((_: boolean) => {
				const active = option;
				this.options.forEach(option => {
					if (option !== active) {
						option.active = false;
					}
				});
				// 本来是子组件选中，事件应该在 ContentSwitcherOption 中 emit
				// 如果这样，那么久需要在每个 ContentSwitcherOption 都绑定 select 回调，非常繁琐
				// 而此处，父组件监听了所有子组件的事件，处理后再次 emit 就方便很多
				this.selected.emit(active);
			});
		});
	}

	@HostListener("keydown", ["$event"])
	hostkeys(event: KeyboardEvent) {
		// 这里用原生js获取到全部的 ibmContentOption 元素
		const buttonList = Array.from<any>(this.elementRef.nativeElement.querySelectorAll("[ibmContentOption]"));

		switch (event.key) {
			case "Right": // IE specific value
			case "ArrowRight":
				event.preventDefault();
				if (!isFocusInLastItem(event, buttonList))  {
					const index = buttonList.findIndex(item => item === event.target);
					// 然后调用 ibmContentOption 的 focus 方法
					// ibmContentOption 中有监听 focus 事件
					buttonList[index + 1].focus();
				} else {
					buttonList[0].focus();
				}
				break;

			case "Left": // IE specific value
			case "ArrowLeft":
				event.preventDefault();
				if (!isFocusInFirstItem(event, buttonList))  {
					const index = buttonList.findIndex(item => item === event.target);
					buttonList[index - 1].focus();
				} else {
					buttonList[buttonList.length - 1].focus();
				}
				break;

			case "Home":
				event.preventDefault();
				buttonList[0].focus();
				break;

			case "End":
				event.preventDefault();
				buttonList[buttonList.length - 1].focus();
				break;
		}
	}
}
