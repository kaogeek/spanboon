/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FULFILLMENT_STATUS } from '../../FulfillmentStatus';
import { AuthenManager, NotificationFacade, AssetFacade } from '../../services/services';

@Component({
    selector: 'fulfill-menu',
    templateUrl: './FulFillMenu.component.html'
})
export class FulFillMenu {

    @Input()
    public isMobileFulfill: boolean;
    @Input()
    public isCaseActive: boolean;
    @Output()
    public onClick: EventEmitter<any> = new EventEmitter();

    public fulfillStatus = [
        {
            type: FULFILLMENT_STATUS.INPROGRESS
        },
        {
            type: FULFILLMENT_STATUS.CONFIRM
        }
    ];

    private router: Router;
    public authenManager: AuthenManager;
    public assetFacade: AssetFacade;

    constructor(router: Router, authenManager: AuthenManager, assetFacade: AssetFacade, notificationFacade: NotificationFacade) {
        this.router = router;
        this.authenManager = authenManager;
        this.assetFacade = assetFacade;
    }

    public ngOnInit(): void {
    }

    public clickChangeTab(event) { 
        this.onClick.emit(event);
    }

}
