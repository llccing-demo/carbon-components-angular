import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { EventHandler } from "./types";
import { getEventObservable } from "./event-observable";

@Injectable()
export class DocumentService implements OnDestroy {
	// 这里声明了全局事件的变量
	protected globalEvents = new Map<string, Observable<Event>>();

	protected documentRef = document;

	// 订阅集合
	protected subscriptions = new Subscription();

	handleEvent(eventType: string, callback: EventHandler) {
		// 当 globalEvents 中没有该事件时再添加
		if (!this.globalEvents.has(eventType)) {
			if (this.documentRef) {
				this.globalEvents.set(eventType, getEventObservable(this.documentRef as any, eventType));
			} else {
				this.globalEvents.set(eventType, new Observable());
			}
		}
		// 根据 eventType 获取 Observable
		const observable = this.globalEvents.get(eventType);
		// 向 订阅集合中 添加该事件订阅
		this.subscriptions.add(observable.subscribe(callback));
	}

	// 这个方法，相当于绑定 click 事件的快捷方式
	handleClick(callback: EventHandler) {
		this.handleEvent("click", callback);
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe();
		this.globalEvents = null;
	}
}
