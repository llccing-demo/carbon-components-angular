import {
	Component,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef,
	Input
} from "@angular/core";


/**
 * Component for the overlay object that acts as a backdrop to the `Modal` component.
 *
 * The main purpose for this component is to be able to handle click events that fall outside
 * the bounds of the `Modal` component.
 * 
 * 这个组件的主要作用是处理 modal 组件外的点击事件
 */
@Component({
	selector: "ibm-overlay",
	template: `
		<section
			class="bx--modal bx--modal-tall"
			[ngClass]="{
				'bx--modal--danger': theme === 'danger',
				'is-visible': open
			}"
			(click)="overlayClick($event)"
			#overlay>
			<ng-content></ng-content>
		</section>
	`
})
export class Overlay {
	/**
	 * Classification of the modal.
	 */
	@Input() theme: "default" | "danger" = "default";
	@Input() open = false;
	/**
	 * To emit the event where the user selects the overlay behind the `Modal`.
	 */
	@Output() overlaySelect = new EventEmitter();
	/**
	 * Maintains a reference to the view DOM element of the `Overlay`.
	 */
	// @ts-ignore
	@ViewChild("overlay", { static: true }) overlay: ElementRef;

	/**
	 * Handles the user clicking on the `Overlay` which resides outside the `Modal` object.
	 */
	overlayClick(event) {
		if (event.target !== this.overlay.nativeElement) { return; }
		event.stopPropagation();
		this.overlaySelect.emit(event);
	}

}
