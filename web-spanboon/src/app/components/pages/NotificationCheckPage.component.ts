/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ObservableManager } from '../../services/ObservableManager.service';
import { NotificationManager } from '../../services/NotificationManager.service';
import { AuthenManager } from '../../services/AuthenManager.service';
import { AuthenCheckPage } from '../../components/pages/AuthenCheckPage.component';

const PAGE_NAME: string = 'notification_check';

@Component({
    selector: 'notification-check-page',
    templateUrl: 'NotificationCheckPage.component.html'
})
export class NotificationCheckPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Output()
    public noti: EventEmitter<any> = new EventEmitter();


    private authenMgr: AuthenManager;
    private notificationMgr: NotificationManager;
    private observManager: ObservableManager;
    public isLoaded: boolean;

    constructor(notificationMgr: NotificationManager, authenMgr: AuthenManager, observManager: ObservableManager) {
        this.authenMgr = authenMgr;
        this.notificationMgr = notificationMgr;
        this.observManager = observManager;
        this.isLoaded = false;

        this.observManager.subscribe(AuthenCheckPage.AUTHEN_CHECK_SUBJECT, (result: any) => {
            this.isLoaded = true;
            this.inTervalNoti(result, false);
        });

        this.observManager.subscribe(AuthenCheckPage.NOTI_CHECK_SUBJECT, (result: any) => {
            this.inTervalNoti(result, true);
        });

        this.observManager.subscribe(AuthenCheckPage.NOTI_CHECK_LOAD_SUBJECT, (result: any) => {
            this.inTervalNoti(result, false, (result.data--));
        });
    }

    public inTervalNoti(result, isObserv: boolean, offSet?) {
        if (result && result.valid !== null) {
            try {
                // valid
                this.notificationMgr.loadCurrentUserNotification((isObserv ? 1 : 10), offSet).then((res) => {
                    if (res) {
                        isObserv ? this.noti.emit({ noti: [res[0]] }) : this.noti.emit({ noti: res });
                        this.isLoaded = false;
                    }
                }).catch(() => {
                    this.isLoaded = false;
                });
            } catch (error) {
                console.log(error);
                this.isLoaded = false;
            }
        } else {
            try {
                this.notificationMgr.clearCurrentUserNotification();
                this.isLoaded = false;
            } catch (error) {
                console.log(error);
                this.isLoaded = false;
            }
        }
    }

    public ngOnInit(): void {
    }

    public ngOnDestroy() {
    }
}
