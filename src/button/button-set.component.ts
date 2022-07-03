import { Component, HostBinding } from "@angular/core";

@Component({
	selector: "ibm-button-set",
	// 这个模板的内容就只有一个内容投影的位置，然后通过 HostBinding 装饰器将 Host 元素的 class 设置为 b--btn-set.
	template: "<ng-content></ng-content>"
})
export class ButtonSet {
	@HostBinding("class.bx--btn-set") buttonSetClass = true;
}
