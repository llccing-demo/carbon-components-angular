import {
	Component,
	Input,
	ContentChildren,
	QueryList,
	AfterContentInit
} from "@angular/core";
import { AccordionItem } from "./accordion-item.component";

/**
 * [See demo](../../?path=/story/components-accordion--basic)
 *
 * <example-url>../../iframe.html?id=components-accordion--basic</example-url>
 */
@Component({
	selector: "ibm-accordion",
	template: `
		<ul class="bx--accordion"
			[class.bx--accordion--end]="align == 'end'"
			[class.bx--accordion--start]="align == 'start'">
			<ng-content></ng-content>
		</ul>
	`
})
export class Accordion implements AfterContentInit {
	@Input() align: "start" | "end" = "end";

	// 获取全部的 accordion-item 组件，便于后面统一设置 skeleton 属性
	@ContentChildren(AccordionItem) children: QueryList<AccordionItem>;

	protected _skeleton = false;

	@Input()
	/**
	 * 这里使用了 _skeleton set 方式，方便当传入的 skeleton 属性变化时，做其他逻辑
	 * 如本组件的 skeleton 属性更新时，子组件也同步更新
	 */
	set skeleton(value: any) {
		this._skeleton = value;
		this.updateChildren();
	}

	get skeleton(): any {
		return this._skeleton;
	}

	ngAfterContentInit() {
		this.updateChildren();
	}

	protected updateChildren() {
		if (this.children) {
			this.children.toArray().forEach(child => child.skeleton = this.skeleton);
		}
	}
}
