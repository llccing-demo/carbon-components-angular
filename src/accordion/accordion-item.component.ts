import {
	Component,
	Input,
	HostBinding,
	Output,
	TemplateRef,
	EventEmitter
} from "@angular/core";

@Component({
	selector: "ibm-accordion-item",
	template: `
		<button
			type="button"
			[attr.aria-expanded]="expanded"
			[attr.aria-controls]="id"
			(click)="toggleExpanded()"
			class="bx--accordion__heading">
			<svg ibmIcon="chevron--right" size="16" class="bx--accordion__arrow"></svg>
			<p *ngIf="!isTemplate(title)"
				class="bx--accordion__title"
				[ngClass]="{
					'bx--skeleton__text': skeleton
				}">
				{{!skeleton ? title : null}}
			</p>
			<!-- 这个写法已经在文章的 tips 中说明 -->
			<ng-template
				*ngIf="isTemplate(title)"
				[ngTemplateOutlet]="title"
				[ngTemplateOutletContext]="context">
			</ng-template>
		</button>
		<div [id]="id" class="bx--accordion__content">
			<ng-content *ngIf="!skeleton; else skeletonTemplate"></ng-content>
			<ng-template #skeletonTemplate>
				<p class="bx--skeleton__text" style="width: 90%"></p>
				<p class="bx--skeleton__text" style="width: 80%"></p>
				<p class="bx--skeleton__text" style="width: 95%"></p>
			</ng-template>
		</div>
	`
})
export class AccordionItem {
	// 这个静态属性很有意思，用于记录自己是第几个
  	// 如果一个页面引入了多组 Accordion 组件，每个下有几个 AccordionItem, 那这个值是怎么样的呢，待测试。
	static accordionItemCount = 0;
	// 表示同时支持 string 和 template 传入，方便自定义
	@Input() title: string | TemplateRef<any>;
	// 此处的 context 表示当 title 为 templateRef 时，设置的上下文
	@Input() context: Object | null = null;
	// 这个id通过这种方式实现很简单，不需要引入比如 uuid 之类的库
	@Input() id = `accordion-item-${AccordionItem.accordionItemCount}`;
	@Input() skeleton = false;
	@Output() selected = new EventEmitter();

	// 通过上面 HostBinding 的介绍，这里的写法也很清晰
  	// 给 host 元素设置该类名
	@HostBinding("class.bx--accordion__item") itemClass = true;
	// 给 host 元素设置类名，默认是 false，通过下面的逻辑来变更
  	// 同时这里的 expanded 是 @Input，所以是支持作为 props 传入到组件中
	@HostBinding("class.bx--accordion__item--active") @Input() expanded = false;
	// host 元素的 style display 设置为 list-item
	@HostBinding("style.display") itemType = "list-item";
	// host 元素的 role 属性设置为 heading
	@HostBinding("attr.role") role = "heading";
	// host 元素的 aria-level 属性设置 为 3，同时支持作为 props 传入
	@HostBinding("attr.aria-level") @Input() ariaLevel = 3;

	constructor() {
		// 每次实例化该组件时，默认加 1
		AccordionItem.accordionItemCount++;
	}

	public toggleExpanded() {
		if (!this.skeleton) {
			this.expanded = !this.expanded;
			this.selected.emit({id: this.id, expanded: this.expanded});
		}
	}

	public isTemplate(value) {
		// 这个判断能够知道 title props 是传入的字符串还是 template，很有参考意义
		return value instanceof TemplateRef;
	}
}
