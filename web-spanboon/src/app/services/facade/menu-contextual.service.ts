/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable, ViewContainerRef, Host, Optional, asNativeElements, ViewChild, ElementRef } from "@angular/core";
import {
	Overlay,
	ConnectionPositionPair,
	PositionStrategy,
	OverlayConfig
} from "@angular/cdk/overlay";
import {
	PortalInjector,
	ComponentPortal,
	TemplatePortal
} from "@angular/cdk/portal";
import { fromEvent, Subscription, Subject } from "rxjs";
import { filter, take } from "rxjs/operators";

declare var $: any;

@Injectable({
	providedIn: 'root',
})
export class MenuContextualService {
	overlayRef: any;
	sub: Subscription;
	private afterClosed = new Subject<any>();
	onClosed = this.afterClosed.asObservable();

	constructor(
		private overlay: Overlay) { }

	open(origin: any, component: any, viewContainerRef: ViewContainerRef, data: any, isRight?: boolean) {
		this.close(null); 
		this.overlayRef = this.overlay.create(
			this.getOverlayConfig({ origin: origin }, isRight)
		);

		const ref = this.overlayRef.attach(new ComponentPortal(component, viewContainerRef));
		for (let key in data)
			ref.instance[key] = data[key]

		this.sub = fromEvent<MouseEvent>(document, "click")
			.pipe(
				filter(event => {
					const clickTarget = event.target as HTMLElement;
					return (
						clickTarget != origin &&
						(!!this.overlayRef &&
							!this.overlayRef.overlayElement.contains(clickTarget))
					);
				}),
				take(1)

			)

			.subscribe(() => {
				this.close(null);
			});

		return this.onClosed.pipe(take(1))
	}

	close = (data: any) => {
		this.sub && this.sub.unsubscribe();
		if (this.overlayRef) {
			this.overlayRef.dispose();
			this.overlayRef = null;
			this.afterClosed.next(data)
		}
	}
	private getOverlayPosition(origin: any, isRight?: boolean): PositionStrategy { 
		const positionStrategy = this.overlay
			.position()
			.flexibleConnectedTo(origin)
			.withPositions(this.getPositions(isRight))
			.withPush(false);
		return positionStrategy;
	}
	private getOverlayConfig({ origin }, isRight?: boolean): OverlayConfig {
		return new OverlayConfig({
			hasBackdrop: false,
			backdropClass: "popover-backdrop",
			positionStrategy: this.getOverlayPosition(origin, isRight),
			scrollStrategy: this.overlay.scrollStrategies.close()
		});
	}
	private getPositions(isRight?: boolean): ConnectionPositionPair[] {
		this.setArrow();

		if (isRight) {
			return [
				// {
				// 	originX: "center",
				// 	originY: "bottom",
				// 	overlayX: "center",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "start",
				// 	originY: "bottom",
				// 	overlayX: "start",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "end",
				// 	originY: "bottom",
				// 	overlayX: "end",
				// 	overlayY: "top"
				// }
				// {
				// 	originX: "center",
				// 	originY: "top",
				// 	overlayX: "center",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "center",
				// 	originY: "bottom",
				// 	overlayX: "center",
				// 	overlayY: "top"
				// },
				// -----------------------
				// {
				// 	originX: "start",
				// 	originY: "top",
				// 	overlayX: "start",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "start",
				// 	originY: "bottom",
				// 	overlayX: "start",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "center",
				// 	originY: "top",
				// 	overlayX: "center",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "center",
				// 	originY: "bottom",
				// 	overlayX: "center",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "end",
				// 	originY: "top",
				// 	overlayX: "start",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "end",
				// 	originY: "bottom",
				// 	overlayX: "start",
				// 	overlayY: "top"
				// },
				// -----------------------
				{
					originX: "end",
					originY: "center",
					overlayX: "end",
					overlayY: "center"
				},
				{
					originX: "end",
					originY: "center",
					overlayX: "end",
					overlayY: "center"
				},
			];
		} else {
			return [
				// {
				// 	originX: "center",
				// 	originY: "bottom",
				// 	overlayX: "center",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "start",
				// 	originY: "bottom",
				// 	overlayX: "start",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "end",
				// 	originY: "bottom",
				// 	overlayX: "end",
				// 	overlayY: "top"
				// }
				// {
				// 	originX: "center",
				// 	originY: "top",
				// 	overlayX: "center",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "center",
				// 	originY: "bottom",
				// 	overlayX: "center",
				// 	overlayY: "top"
				// },
				// -----------------------
				// {
				// 	originX: "start",
				// 	originY: "top",
				// 	overlayX: "start",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "start",
				// 	originY: "bottom",
				// 	overlayX: "start",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "center",
				// 	originY: "top",
				// 	overlayX: "center",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "center",
				// 	originY: "bottom",
				// 	overlayX: "center",
				// 	overlayY: "top"
				// },
				// {
				// 	originX: "end",
				// 	originY: "top",
				// 	overlayX: "start",
				// 	overlayY: "bottom"
				// },
				// {
				// 	originX: "end",
				// 	originY: "bottom",
				// 	overlayX: "start",
				// 	overlayY: "top"
				// },
				// -----------------------
				{
					originX: "center",
					originY: "top",
					overlayX: "center",
					overlayY: "bottom"
				},
				{
					originX: "center",
					originY: "bottom",
					overlayX: "center",
					overlayY: "top"
				},
			];
		}


	}

	public setArrow() {
		setTimeout(() => {
			$('.back-drop-tool').mousemove(function () {
				$(".cdk-overlay-connected-position-bounding-box").remove();
			});
		}, 1000);

		setTimeout(() => {
			var x = $('.cdk-overlay-connected-position-bounding-box')[0];
			var arrowTop = $('.arrow-top');
			var arrowBottom = $('.arrow-bottom');
			var y = x.style.cssText;
			// console.log('y', y);
			// console.log('x.style', x.style);

			if (y !== null && y !== undefined) {
				if ((y.includes('bottom') > 0)) {
					arrowTop.css({ display: 'none' });
					arrowBottom.css({ display: 'block', opacity: 1 });

					if (arrowBottom.css('display') === 'block') {
						arrowBottom.css({ display: 'block' });
					}

					if (arrowBottom.css('opacity') === '1') {
						arrowBottom.css({ opacity: '1' });
					}
				}

				if ((y.includes('top') > 0)) {
					arrowBottom.css({ display: 'none' });
					arrowTop.css({ display: 'block', opacity: 1 });

					if (arrowTop.css('display') === 'block') {
						arrowBottom.css({ display: 'block' });
					}

					if (arrowTop.css('opacity') === '1') {
						arrowBottom.css({ opacity: '1' });
					}
				}
			}
		}, 10);

		return;
	}
}