/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter } from '@angular/core';
import { AuthenManager, ObservableManager } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { NotificationManager } from '../../../services/NotificationManager.service';
import { AbstractPage } from '../AbstractPage';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

const PAGE_NAME: string = 'notification';

@Component({
    selector: 'notification-page',
    templateUrl: './NotificationAllPage.component.html',
})
export class NotificationAllPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    protected observManager: ObservableManager;
    private notificationMgr: NotificationManager;

    public notiisAll: any[] = [];
    public notiisAllPast: any[] = [];
    public notiisRead: any[] = [];
    public notiisTable: any[] = [];
    public notiisTablePast: any[] = [];


    public notiOffset: number = 0;
    public isNotiAll: boolean = true;
    public isScrollNoti: boolean = false;

    public apiBaseURL = environment.apiBaseURL;
    private mainPostLink: string = window.location.origin

    constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager, notificationMgr: NotificationManager, observManager: ObservableManager) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.notificationMgr = notificationMgr;
        this.observManager = observManager;

    }

    private getNotificationList(limit: number, offSet: number) {
        this.notificationMgr.loadCurrentUserNotification(limit, offSet === 0 ? 0 : offSet--).then((res) => {
            this.checkNotification(res)
        }).catch(() => {
        });
    }

    private checkNotification(notification) {
        if (this.notiisAll && this.notiisAll.length !== notification && notification !== undefined && notification !== null && notification.length) {
            for (let noti of notification) {
                var todaysDate = new Date();
                var date = new Date(noti.notification.createdDate);
                if (!noti.notification.isRead) {
                    this.notiisRead.push({ notification: { title: 'การแจ้งเตือนใหม่', body: noti.notification.title, image: (this.apiBaseURL + noti.sender.imageURL + '/image'), status: noti.notification.type, isRead: noti.notification.isRead, id: noti.notification.id, link: noti.notification.link, createdDate: noti.notification.createdDate } });
                }
                noti.notification.linkPath = (this.mainPostLink + noti.notification.link)
                if (date.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
                    this.notiisAll.push({ notification: { title: 'การแจ้งเตือนใหม่', body: noti.notification.title, image: (this.apiBaseURL + noti.sender.imageURL + '/image'), status: noti.notification.type, isRead: noti.notification.isRead, id: noti.notification.id, link: noti.notification.link, createdDate: noti.notification.createdDate } });
                } else {
                    this.notiisAllPast.push({ notification: { title: 'การแจ้งเตือนใหม่', body: noti.notification.title, image: (this.apiBaseURL + noti.sender.imageURL + '/image'), status: noti.notification.type, isRead: noti.notification.isRead, id: noti.notification.id, link: noti.notification.link, createdDate: noti.notification.createdDate } });
                }
                this.notiOffset++;
            }
            this.setNotification();
        }
    }

    public setNotification() {
        if (this.isNotiAll) {
            this.notiisTable = this.notiisAll;
            this.notiisTablePast = this.notiisAllPast
        } else {
            this.notiisTablePast = this.notiisRead;
        }
    }

    public scroll(event: any) {
        if (!this.isScrollNoti) {
            if (event.target.offsetHeight + event.target.scrollTop >= (event.target.scrollHeight - 400)) {
                this.isScrollNoti = true;
                setTimeout(() => {
                    this.getNotificationList(10, (this.notiisAll.length + this.notiisAllPast.length));
                    setTimeout(() => {
                        this.isScrollNoti = false;
                    }, 500);
                }, 1500);
            }
        }
    }

    public switeNotiType() {
        this.isNotiAll = !this.isNotiAll;
        this.setNotification();
    }

    public ngOnInit(): void {
        setTimeout(() => {
            this.getNotificationList(10, (this.notiisAll.length + this.notiisAllPast.length));
        }, 500);
    }

    isPageDirty(): boolean {
        return false;
    }

    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        return;
    }

    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        return;
    }
}




