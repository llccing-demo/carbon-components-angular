import {
	Injector,
	ComponentRef,
	ComponentFactory,
	ComponentFactoryResolver,
	Injectable,
	ViewContainerRef
} from "@angular/core";
import { CloseReasons, DialogConfig } from "./dialog-config.interface";
import { PlaceholderService } from "carbon-components-angular/placeholder";
import { Dialog } from "./dialog.component";
import { tabbableSelector } from "carbon-components-angular/common";

/**
 * `Dialog` object to be injected into other components.
 */
@Injectable()
export class DialogService {
	/**
	 * Used in `singletonClickListen`, don't count on its existence and values.
	 */
	protected static listeningForBodyClicks = false;

	/**
	 * A set of all known dialog components
	 */
	protected static dialogRefs = new Set<ComponentRef<Dialog>>();

	/**
	 * Closes all known `Dialog`s. Does not focus any previous elements, since we can't know which would be correct
	 */
	public static closeAll() {
		DialogService.dialogRefs.forEach(ref => ref.instance.doClose({
			reason: CloseReasons.programmatic
		}));
		DialogService.dialogRefs.clear();
	}

	/**
	 * The default component factory to use when creating dialogs
	 */
	public componentFactory: ComponentFactory<any>;

	/**
	 * Creates an instance of `DialogService`.
	 */
	constructor(
		protected componentFactoryResolver: ComponentFactoryResolver,
		protected injector: Injector,
		protected placeholderService: PlaceholderService
	) {}

	/**
	 * Set the context for the service. For example, the `component` property can be used to set the
	 * default component that should be created by the service, for a given instance of the service.
	 * @param options `{ component: any }` where `component` is a component that extends `dialog.component`
	 */
	setContext(options: { component: any }) {
		this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(options.component);
	}

	/**
	 * If `dialogRef` is defined, the Dialog is already open. If
	 * `dialogRef` is undefined, we create the `Dialog` component and reference to it.
	 * A subscription is created to track if the `Dialog` should close.
	 *
	 * @param viewContainer a `ViewContainerRef` to instantiate the component against.
	 * May be `null` if an `ibm-placeholder` exists and `dialogConfig.appendInline` is false
	 * @param dialogConfig the `DialogConfig` for the component
	 */
	open(viewContainer: ViewContainerRef, dialogConfig: DialogConfig, component?: any) {
		let componentFactory = this.componentFactory;
		if (component) {
			componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
		}

		let dialogRef;
		if (dialogConfig.appendInline) {
			// add our component to the view
			dialogRef = viewContainer.createComponent(componentFactory, 0, this.injector);
		} else if (!this.placeholderService.hasPlaceholderRef()) {
			dialogRef = viewContainer.createComponent(componentFactory, 0, this.injector);
			if (dialogRef) {
				setTimeout(() => {
					window.document.querySelector("body").appendChild(dialogRef.location.nativeElement);
				});
			}
		} else {
			dialogRef = this.placeholderService.createComponent(componentFactory, this.injector);
		}

		// keep track of all initialized dialogs
		DialogService.dialogRefs.add(dialogRef);

		// initialize some extra options
		// 这里记住了，当前点击的元素。document.activeElement 这个属性还是第一次见到
		dialogConfig["previouslyFocusedElement"] = document.activeElement;
		dialogRef.instance.dialogConfig = dialogConfig;

		// 实际业务中遇到一个现象是，每次 Dialog 显示时，总是自动 focus 到close icon，这种focus是不合理的行为。
		// 应该可以设置 focus 的对象，或者 focus 的优先级
		dialogRef.instance.elementRef.nativeElement.focus();

		return dialogRef as ComponentRef<Dialog>;
	}

	/**
	 * On close of `Dialog` item, sets focus back to previous item, unsets
	 * the current `dialogRef` item. Unsubscribes to the event of `Dialog` close.
	 *
	 * @param dialogRef the dialogRef to close
	 */
	close(dialogRef: ComponentRef<Dialog>) {
		// to handle the case where we have a null `this.dialogRef`
		if (!dialogRef) { return; }
		// 关闭的时候又拿到上次 open 时点击的元素，重新focus。
		const elementToFocus = dialogRef.instance.dialogConfig["previouslyFocusedElement"];

		dialogRef.destroy();

		// update the globally tracked dialogRefs
		if (DialogService.dialogRefs.has(dialogRef)) {
			DialogService.dialogRefs.delete(dialogRef);
		}

		// Keeps the focus on the dialog trigger if there are no focusable elements. Change focus to previously focused element
		// if there are focusable elements in the dialog.
		// tabableSelector 表示所有按 tab 键能够focus的元素。
		if (!dialogRef.location.nativeElement.querySelectorAll(tabbableSelector)) {
			elementToFocus.focus();
		}
	}

	/**
	 * Closes all known `Dialog`s. Does not focus any previous elements, since we can't know which would be correct
	 *
	 * @deprecated since v4. Use the static `DialogService.closeAll` instead
	 */
	closeAll() {
		DialogService.closeAll();
	}
	/**
	 * Fix for safari hijacking clicks.
	 *
	 * Runs on `ngOnInit` of every dialog. Ensures we don't have multiple listeners
	 * because having many of them could degrade performance in certain cases (and is
	 * not necessary for our use case)
	 *
	 * This is an internally used function, can change at any point (even get removed)
	 * and changes to it won't be considered a breaking change. Use at your own risk.
	 */
	singletonClickListen() {
		if (!DialogService.listeningForBodyClicks) {
			document.body.firstElementChild.addEventListener("click", () => null, true);
			DialogService.listeningForBodyClicks = true;
		}
	}
}
