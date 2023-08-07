/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, ElementRef, EventEmitter, Input, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { AuthenManager } from "src/app/services/AuthenManager.service";
import { AbstractPage } from "../pages/AbstractPage";
import { environment } from "src/environments/environment";
import { NotificationFacade } from "src/app/services/facade/NotificationFacade.service";
import { ObservableManager } from "src/app/services/ObservableManager.service";

const NOTI_CHECK_SUBJECT: string = 'noti.check';
const NOTI_READ_SUBJECT: string = 'noti.read';
const NOTI_ACTION: string = 'noti.action';
@Component({
  selector: "btn-notification",
  templateUrl: "./Notification.component.html",
})
export class Notification extends AbstractPage implements OnInit {
  @Input()
  public noti: any;
  @Input()
  public notiObj: any;

  private observManager: ObservableManager;
  public dataNotiRead: any[] = [];
  public apiBaseURL = environment.apiBaseURL;
  public isNotiAll: number = 0;
  public router: Router;
  public authenManager: AuthenManager;
  public notificationFacade: NotificationFacade;
  public isLoading: boolean = false;
  public isRequestNoti: boolean = false;
  @ViewChild('notiScroll', { static: false }) public notiScroll!: ElementRef<HTMLDivElement>;
  public notiOffsetUnread: number = 0;
  public notiOffsetAll: number = 0;

  constructor(router: Router,
    authenManager: AuthenManager,
    dialog: MatDialog, notificationFacade: NotificationFacade, observManager: ObservableManager) {
    super(null, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.notificationFacade = notificationFacade;
    this.observManager = observManager;
  }


  isPageDirty(): boolean {
    // throw new Error('Method not implemented.');
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }

  public ngOnInit(): void {
    this.observManager.subscribe(NOTI_READ_SUBJECT, (result: any) => {
      if (result) {
        if (result.data.type !== 'OBJECTIVE') {
          let notiId = result.data.id ? result.data.id : null;
          let dataNoti = [
            { body: result.data.body, link: result.data.link, status: result.data.status }];

          let index = dataNoti.findIndex(res => res.body === result.data.body && res.link === result.data.link && res.status === result.data.status);
          this.notificationFacade.markRead(notiId ? notiId : this.noti!.unread[index].id).then((res) => {
            if (res) {
              if (index >= 0) {
                this.noti.all[index].isRead = true;
                this.noti.unread.splice(index, 1);
                this.noti.countUnread--;
              }
            }
          }).catch((error) => {
            if (error) {
              console.log(error);
            }
          });
        }
      }
    });

    this.observManager.subscribe(NOTI_ACTION, (result: any) => {
      if (result) {

      }
    });

    this.observManager.subscribe(NOTI_CHECK_SUBJECT, (result: any) => {
      if (result) {
        this.noti.unread.unshift(result.data);
        this.noti.all.unshift(result.data);
        this.noti.countUnread++;
        this.noti.countAll++;
      }
    });

    this.observManager.subscribe('notification', (result: any) => {
      if (result) {
        this.isLoading = false;
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = false;
    this.observManager.createSubject('scrollLoadNotification');
  }

  public clickNotification(value?) {
    this.isLoading = true;
    this.isRequestNoti = false;
    this.notiScroll!.nativeElement!.scrollTop = 0;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.isNotiAll = value;
  }

  public clickRequestNoti() {
    this.isNotiAll = 0;
    this.isRequestNoti = true;
  }

  public ngOnDestroy(): void {
    this.observManager.complete('notification');
    this.observManager.complete(NOTI_CHECK_SUBJECT);
    this.observManager.complete(NOTI_READ_SUBJECT);
    this.observManager.complete(NOTI_ACTION);
  }

  public clickIsRead(index: number, isObj?: boolean) {
    let value: any = (isObj ? this.notiObj[index].id : this.isNotiAll ? this.noti!.all[index].id : this.noti!.unread[index].id);
    this.notificationFacade.markRead(value).then((res) => {
      if (res) {
        if (this.isNotiAll) {
          this.noti.all[index].isRead = true;
        } else {
          this.noti.unread[index].isRead = true;
          this.noti.unread.splice(index, 1);
          if (!isObj) this.noti.countUnread--;
        }
      }
    }).catch((error) => {
      if (error) {
        console.log(error);
      }
    });
  }

  public isActive(): boolean {
    let notification = document.getElementsByClassName("wrapper-notification");
    return notification && notification.length > 0;
  }

  public scroll(event: any) {
    if ((event.target.scrollTop + event.target.offsetHeight) === event.target.scrollHeight) {
      this.isLoading = true;
      let count = this.isNotiAll ? (this.noti!.countAll >= this.notiOffsetAll ? this.notiOffsetAll += 30 : '') : (this.noti!.countUnread >= this.notiOffsetUnread ? this.notiOffsetUnread += 30 : '');
      // if (!!count) {
      //   this.observManager.publish('scrollLoadNotification', {
      //     data: {
      //       isReadAll: this.isNotiAll,
      //       offset: count
      //     }
      //   });
      // }
    }
  }

  public clickReadAll() {
    this.notificationFacade.clearAll().then((res) => {
      if (res) {
        this.noti.countUnread = 0;
        !!this.noti!.unread.map((unread) => {
          return unread.isRead = true;
        });

        !!this.noti!.all.map((unread) => {
          return unread.isRead = true;
        });
      }
    }).catch((error) => {
      if (error) {
        console.log(error);
      }
    });
  }
}
