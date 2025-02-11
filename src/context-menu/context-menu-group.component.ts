import {
	Component,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from "@angular/core";
import { Subscription } from "rxjs";
import { ContextMenuSelectionService } from "./context-menu-selection.service";

@Component({
	selector: "ibm-context-menu-group",
	template: `
		<ul role="group" [attr.aria-label]="label">
			<ng-content></ng-content>
		</ul>
	`,
	styles: [`
		:host {
			display: list-item;
			list-style: none;
		}
	`],
	providers: [ContextMenuSelectionService]
})
export class ContextMenuGroupComponent implements OnInit, OnChanges, OnDestroy {
	@HostBinding("attr.role") role = "none";

	@Input() label = null;
	@Input() value: any[] = [];
	@Input() type: null | "radio" | "checkbox" = null;
	@Output() valueChange = new EventEmitter<any[]>();

	// 这个写法把所有的订阅放到一个里，最终一起 unsubscribe() 非常简洁
	private subscription = new Subscription();

	constructor(protected contextMenuSelectionService: ContextMenuSelectionService) { }

	ngOnInit() {
		const { selectionObservable } = this.contextMenuSelectionService;
		const subscription = selectionObservable.subscribe(value => {
			this.valueChange.emit(value);
		});
		this.subscription.add(subscription);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.value) {
			if (this.type === "radio") {
				this.contextMenuSelectionService.selectRadio(changes.value.currentValue);
			}

			if (this.type === "checkbox") {
				this.contextMenuSelectionService.selectCheckboxes(changes.value.currentValue);
			}
		}
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}
