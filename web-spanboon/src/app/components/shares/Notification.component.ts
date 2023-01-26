/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit, SimpleChanges } from "@angular/core";
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

  public preload: boolean;
  public apiBaseURL = environment.apiBaseURL;

  public isNotiAll: boolean = true;
  public message: any = null;
  public router: Router;
  public authenManager: AuthenManager;
  public notificationFacade: NotificationFacade;

  constructor(router: Router,
    authenManager: AuthenManager,
    dialog: MatDialog, notificationFacade: NotificationFacade, observManager: ObservableManager) {
    super(null, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.notificationFacade = notificationFacade;
    this.observManager = observManager;

    this.preload = true;
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
        this.switeNotiType();
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.switeNotiType();
  }

  public isOpened() {
  }

  public clickNotification() {
    this.isNotiAll = !this.isNotiAll;
    this.switeNotiType();
  }

  public ngOnDestroy(): void {
    this.observManager.complete('notification');
  }

  public switeNotiType() {
    let dataRead: any[] = [];
    for (const notiRead of this.noti) {
      if (!notiRead.notification.isRead) {
        dataRead.push(notiRead);
      }
    }

    this.dataNotiRead = dataRead;
  }

  public clickIsRead(index: number) {
    this.notificationFacade.markRead(this.isNotiAll ? this.noti[index].notification.id : this.dataNotiRead[index].notification.id).then((res) => {
      if (res) {
        if (this.isNotiAll) {
          this.noti[index].notification.isRead = true;
        } else {
          this.dataNotiRead[index].notification.isRead = true;
          this.dataNotiRead.splice(index, 1);
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
}
