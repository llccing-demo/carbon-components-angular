import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { DocumentService } from "./document.service";
import { EventHandler } from "./types";
import { getEventObservable } from "./event-observable";

@Injectable()
export class EventService implements OnDestroy {
	protected subscriptions = new Subscription();

	protected targets = new WeakMap<HTMLElement | Element | Document, Map<string, Observable<Event>>>();

	constructor(protected documentService: DocumentService) {}

	on(targetElement: HTMLElement | Element, eventType: string, callback: EventHandler) {
		if (!this.targets.has(targetElement)) {
			this.targets.set(targetElement, new Map());
		}

		const eventMap = this.targets.get(targetElement);

		if (!eventMap.has(eventType)) {
			eventMap.set(eventType, getEventObservable(targetElement, eventType));
		}

		const subscription = eventMap.get(eventType).subscribe(callback);
		this.subscriptions.add(subscription);
	}

	onDocument(eventType: string, callback: EventHandler) {
		this.documentService.handleEvent(eventType, callback);
	}

	ngOnDestroy() {
		// 将事件独立为 service，然后注入到需要的组件中，这样在组件的使用完毕后，不需要手动移除事件监听，因为service的 ngOnDestroy 生命周期中，会取消全部的事件监听。
		this.subscriptions.unsubscribe();
	}
}
