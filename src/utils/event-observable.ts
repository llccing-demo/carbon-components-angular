import { Observable, fromEvent } from "rxjs";

// 这里的事件监听用的是 rxjs 的 fromEvent，和 rxjs 深度结合
export const getEventObservable = (targetElement: HTMLElement | Element, eventType: string): Observable<Event> => {
	switch (eventType) {
		case "scroll":
		case "resize":
		case "touchstart":
		case "touchmove":
		case "touchend":
			// https://stackoverflow.com/questions/37721782/what-are-passive-event-listeners
      		// https://github.com/ReactiveX/rxjs/pull/1845/files#diff-b66649012c6589d424eccfd864157c59R57
      		// 这里的 passive 是优化性能的操作
			return fromEvent(targetElement, eventType, { passive: true });
		default:
			return fromEvent(targetElement, eventType);
	}
};
