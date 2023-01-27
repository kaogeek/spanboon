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

@Component({
  selector: "btn-notification",
  templateUrl: "./Notification.component.html",
})
export class Notification extends AbstractPage implements OnInit {
  @Input()
  public noti: any;

  private observManager: ObservableManager;
  public dataNotiRead: any[] = [];
  public apiBaseURL = environment.apiBaseURL;
  public isNotiAll: boolean = false;
  public router: Router;
  public authenManager: AuthenManager;
  public notificationFacade: NotificationFacade;
  public isLoading: boolean = false;
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

  public clickNotification() {
    this.isLoading = true;
    this.notiScroll!.nativeElement!.scrollTop = 0;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.isNotiAll = !this.isNotiAll;
  }

  public ngOnDestroy(): void {
    this.observManager.complete('notification');
  }

  public clickIsRead(index: number) {
    this.notificationFacade.markRead(this.isNotiAll ? this.noti!.all[index].id : this.noti!.unread[index].id).then((res) => {
      if (res) {
        if (this.isNotiAll) {
          this.noti.all[index].isRead = true;
        } else {
          this.noti.unread[index].isRead = true;
          this.noti.splice(index, 1);
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
      if (!!count) {
        this.observManager.publish('scrollLoadNotification', {
          data: {
            isReadAll: this.isNotiAll,
            offset: count
          }
        });
      }
    }
  }
}
