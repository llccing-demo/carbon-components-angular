import {
	Component,
	Input,
	Output,
	EventEmitter,
	HostBinding,
	OnDestroy
} from "@angular/core";

import { I18n } from "carbon-components-angular/i18n";
import { FileItem } from "./file-item.interface";

@Component({
	selector: "ibm-file",
	template: `
		<p class="bx--file-filename">{{fileItem.file.name}}</p>
		<!--
		这里的写法 remove.emit()，省去了在ts中再次声明一个仅包含 emit 的逻辑方法
		-->
		<span
			*ngIf="fileItem.state === 'edit'"
			class="bx--file__state-container"
			(click)="remove.emit()"
			(keyup.enter)="remove.emit()"
			(keyup.space)="remove.emit()">
			<!-- 
				引入了 carbon-components-angular/icon module 后，这里需要注意的一点是，使用 icon 是需要先注册的
				只不过 当前用的 icon 已经在 icon module 中集中注册过了。
				在模板中的使用方式如下。
			-->
			<svg
				*ngIf="isInvalidText"
				ibmIcon="warning--filled"
				class="bx--file--invalid"
				size="16"
				tabindex="0">
			</svg>
			<svg
				ibmIcon="close"
				size="16"
				class="bx--file-close"
				[ariaLabel]="translations.REMOVE_BUTTON"
				tabindex="0">
			</svg>
		</span>
		<span *ngIf="fileItem.state === 'upload'">
			<div class="bx--inline-loading__animation">
				<ibm-loading size="sm"></ibm-loading>
			</div>
		</span>
		<span
			*ngIf="fileItem.state === 'complete'"
			class="bx--file__state-container"
			tabindex="0">

			<svg
				ibmIcon="checkmark--filled"
				size="16"
				class="bx--file-complete"
				[ariaLabel]="translations.CHECKMARK">
			</svg>
		</span>
	`
})
export class FileComponent implements OnDestroy {
	/**
	 * Accessible translations for the close and complete icons
	 */
	@Input() translations = this.i18n.get().FILE_UPLOADER;
	/**
	 * A single `FileItem` from the set of `FileItem`s
	 */
	@Input() fileItem: FileItem;

	@Output() remove = new EventEmitter();

	@HostBinding("class.bx--file__selected-file") selectedFile = true;

	@HostBinding("class.bx--file__selected-file--invalid") get isInvalidText() {
		return this.fileItem.invalidText;
	}

	constructor(protected i18n: I18n) {}

	ngOnDestroy() {
		this.remove.emit();
	}
}
