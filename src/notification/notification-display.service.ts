import {
	Injectable,
	ApplicationRef
} from "@angular/core";

@Injectable()
export class NotificationDisplayService {
	constructor(protected applicationRef: ApplicationRef) {}

	/**
	 * Programatically closes notification based on `notificationRef`.	 *
	 */
	close(notificationRef: any) {
		if (notificationRef.hostView) {
			setTimeout( () => {
				// 整个 angular 应用的 ref
				this.applicationRef.detachView(notificationRef.hostView);
				notificationRef.destroy();
			}, 200);
		}
	}
}
