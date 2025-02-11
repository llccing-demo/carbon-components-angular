import {
	AfterContentInit,
	ContentChildren,
	Component,
	EventEmitter,
	forwardRef,
	Input,
	Output,
	QueryList,
	HostBinding,
	AfterViewInit,
	HostListener
} from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { Radio } from "./radio.component";
import { RadioChange } from "./radio-change.class";

/**
 * [See demo](../../?path=/story/components-radio--basic)
 *
 * class: RadioGroup
 *
 * selector: `ibm-radio-group`
 *
 * source: `src/forms/radio.component.ts`
 *
 *
 * Ex:
 * ```html
 * <ibm-radio-group [(ngModel)]="radio">
 * 	<ibm-radio *ngFor="let one of manyRadios" [value]="one">
 *		Radio {{one}}
 * 	</ibm-radio>
 * </ibm-radio-group>
 *
 * Radio selected: {{radio}}
 * ```
 *
 * ```typescript
 * manyRadios = ["one", "two", "three", "four", "five", "six"];
 * ```
 *
 * Also see: [`Radio`](#ibm-radio)
 *
 * <example-url>../../iframe.html?id=components-radio--basic</example-url>
 */
@Component({
	selector: "ibm-radio-group",
	template: `
		<div
			class="bx--radio-button-group"
			[attr.aria-label]="ariaLabel"
			[attr.aria-labelledby]="ariaLabelledby"
			[ngClass]="{
				'bx--radio-button-group--vertical': orientation === 'vertical',
				'bx--radio-button-group--label-left': orientation === 'vertical' && labelPlacement === 'left'
			}">
			<ng-content></ng-content>
		</div>
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: RadioGroup,
			multi: true
		}
	]
})
export class RadioGroup implements AfterContentInit, AfterViewInit, ControlValueAccessor {
	/**
	 * Used for creating the `RadioGroup` 'name' property dynamically.
	 */
	static radioGroupCount = 0;

	@Input() orientation: "horizontal" | "vertical" = "horizontal";

	@Input() labelPlacement: "right" | "left" =  "right";

	/**
	 * Used to set the `aria-label` attribute on the radio group element.
	 */
	// tslint:disable-next-line:no-input-rename
	@Input() ariaLabel: string;
	/**
	 * Used to set the `aria-labelledby` attribute on the radio group element.
	 */
	// tslint:disable-next-line:no-input-rename
	@Input() ariaLabelledby: string;

	/**
	 * Emits event notifying other classes of a change using a `RadioChange` class.
	 */
	@Output() change: EventEmitter<RadioChange> = new EventEmitter<RadioChange>();

	/**
	 * The `Radio` input items in the `RadioGroup`.
	 */
	// tslint:disable-next-line:no-forward-ref
	@ContentChildren(forwardRef(() => Radio)) radios: QueryList<Radio>;

	/**
	 * Sets the passed in `Radio` item as the selected input within the `RadioGroup`.
	 */
	@Input()
	set selected(selected: Radio | null) {
		const alreadySelected = (this._selected && this._selected.value) === (selected && selected.value);
		if (alreadySelected) {
			// no need to redo
			return;
		}

		if (this._selected) {
			this._selected.checked = false;
		}
		this._selected = selected;
		this.value = selected ? selected.value : null;
		this.checkSelectedRadio();
	}

	/**
	 * Returns the `Radio` that is selected within the `RadioGroup`.
	 */
	get selected() {
		return this._selected;
	}

	/**
	 * Sets the value/state of the selected `Radio` within the `RadioGroup` to the passed in value.
	 */
	@Input()
	set value(newValue: any) {
		if (this._value !== newValue) {
			this._value = newValue;

			this.updateSelectedRadioFromValue();
			this.checkSelectedRadio();
		}
	}

	/**
	 * Returns the value/state of the selected `Radio` within the `RadioGroup`.
	 */
	get value() {
		return this._value;
	}

	/**
	 * Replaces the name associated with the `RadioGroup` with the provided parameter.
	 */
	@Input()
	set name(name: string) {
		this._name = name;
		this.updateRadios();
	}
	/**
	 * Returns the associated name of the `RadioGroup`.
	 */
	get name() {
		return this._name;
	}

	/**
	 * Set to true to disable the whole radio group
	 */
	@Input()
	set disabled(disabled: boolean) {
		this._disabled = disabled;
		this.updateRadios();
	}
	/**
	 * Returns the disabled value for the `RadioGroup`.
	 */
	get disabled(): boolean {
		return this._disabled;
	}

	/**
	 * Returns the skeleton value in the `RadioGroup` if there is one.
	 */
	@Input()
	get skeleton(): any {
		return this._skeleton;
	}

	/**
	 * Sets the skeleton value for all `Radio` to the skeleton value of `RadioGroup`.
	 */
	set skeleton(value: any) {
		this._skeleton = value;
		this.updateChildren();
	}

	/**
	 * Binds 'bx--form-item' value to the class for `RadioGroup`.
	 */
	@HostBinding("class.bx--form-item") radioButtonGroupClass = true;

	/**
	 * To track whether the `RadioGroup` has been initialized.
	 */
	protected isInitialized = false;
	/**
	 * Reflects whether or not the input is disabled and cannot be selected.
	 */
	protected _disabled = false;
	/**
	 * Reflects whether or not the dropdown is loading.
	 */
	protected _skeleton = false;
	/**
	 * The value of the selected option within the `RadioGroup`.
	 */
	protected _value: any = null;
	/**
	 * The `Radio` within the `RadioGroup` that is selected.
	 */
	protected _selected: Radio = null;
	/**
	 * The name attribute associated with the `RadioGroup`.
	 */
	protected _name = `radio-group-${RadioGroup.radioGroupCount++}`;

	/**
	 * Updates the selected `Radio` to be checked (selected).
	 */
	checkSelectedRadio() {
		if (this.selected && !this._selected.checked) {
			this.selected.checked = true;
		}
	}

	/**
	 * Use the value of the `RadioGroup` to update the selected radio to the right state (selected state).
	 */
	updateSelectedRadioFromValue() {
		let alreadySelected = this._selected != null && this._selected.value === this._value;
		if (this.radios && !alreadySelected) {
			if (this.selected && this.value) {
				this.selected.checked = false;
			}
			this._selected = null;
			this.radios.forEach(radio => {
				if (radio.checked || radio.value === this._value) {
					this._selected = radio;
				}
			});
			if (this.selected && !this.value) {
				this._value = this.selected.value;
			}
		}
	}

	/**
	 * `ControlValueAccessor` method to programmatically disable the `RadioGroup`.
	 *
	 * ex: `this.formGroup.get("myRadioGroup").disable();`
	 *
	 * @param isDisabled `true` to disable the inputs
	 */
	setDisabledState(isDisabled: boolean) {
		this.disabled = isDisabled;
	}

	/**
	 * Creates a class of `RadioChange` to emit the change in the `RadioGroup`.
	 */
	emitChangeEvent(event: RadioChange) {
		this.change.emit(event);
		this.propagateChange(event.value);
		this.onTouched();
	}

	/**
	 * Synchronizes radio properties.
	 */
	updateRadios() {
		if (this.radios) {
			setTimeout(() => {
				this.radios.forEach(radio => {
					radio.name = this.name;
					radio.setDisabledFromGroup(this.disabled);
					if (this.labelPlacement === "left") {
						radio.labelPlacement = "left";
					}
				});
			});
		}
	}

	/**
	 * Updates the value of the `RadioGroup` using the provided parameter.
	 */
	writeValue(value: any) {
		// 这里 writeValue 写入的值是 value 而不是 _value.
		this.value = value;
		setTimeout(() => {
			this.updateSelectedRadioFromValue();
			this.checkSelectedRadio();
		});
	}

	ngAfterContentInit() {
		this.radios.changes.subscribe(() => {
			this.updateRadios();
			this.updateRadioChangeHandler();
		});

		this.updateChildren();
		this.updateRadioChangeHandler();
	}

	ngAfterViewInit() {
		this.updateRadios();
	}

	/**
	 * Used to set method to propagate changes back to the form.
	 */
	public registerOnChange(fn: any) {
		this.propagateChange = fn;
	}

	/**
	 * Registers a callback to be triggered when the control has been touched.
	 * @param fn Callback to be triggered when the checkbox is touched.
	 */
	public registerOnTouched(fn: any) {
		this.onTouched = fn;
	}

	@HostListener("focusout")
	focusOut() {
		this.onTouched();
	}

	/**
	 * Needed to properly implement ControlValueAccessor.
	 */
	onTouched: () => any = () => {};

	/**
	 * Method set in registerOnChange to propagate changes back to the form.
	 */
	propagateChange = (_: any) => {};

	protected updateChildren() {
		if (this.radios) {
			this.radios.forEach(child => child.skeleton = this.skeleton);
		}
	}

	protected updateRadioChangeHandler() {
		this.radios.forEach(radio => {
			radio.registerRadioChangeHandler((event: RadioChange) => {
				if ((this.selected && this.selected.value) === event.value) {
					// no need to redo
					return;
				}
				// deselect previous radio
				if (this.selected) {
					this.selected.checked = false;
				}
				// update selected and value from the event
				this._selected = event.source;
				this._value = event.value;
				// bubble the event
				this.emitChangeEvent(event);
			});
		});
	}
}
