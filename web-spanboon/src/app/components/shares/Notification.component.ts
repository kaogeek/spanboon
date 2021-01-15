/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, NotificationFacade, AssetFacade } from '../../services/services';
import { AbstractPage } from '../pages/AbstractPage';

@Component({
  selector: 'btn-notification',
  templateUrl: './Notification.component.html'
})
export class Notification extends AbstractPage implements OnInit {

  @Input()
  protected text: string = "ข้อความ";
  @Input()
  protected time: string = "3 นาทีที่แล้ว";
  @Input()
  protected color: string = "#ffffff";
  @Input()
  protected bgColor: string = "";
  @Input()
  protected class: string | [string];
  @Input()
  protected crColor: string = "";
  @Input()
  protected link: string = "#";
  @Input()
  public noti: any;

  public notiisRead: any[] = []
  public linkPost: string;
  public notiOrigin: any[] = [];

  private mainPostLink: string = window.location.origin

  public router: Router;
  public authenManager: AuthenManager;
  public assetFacade: AssetFacade;
  public notificationFacade: NotificationFacade;

  constructor(router: Router, authenManager: AuthenManager, dialog: MatDialog, assetFacade: AssetFacade, notificationFacade: NotificationFacade) {
    super(null, authenManager, dialog, router);

    this.router = router;
    this.authenManager = authenManager;
    this.assetFacade = assetFacade;
    this.notificationFacade = notificationFacade;
    var that = this;
    var myVar = setInterval(function () {
      if (that.notiOrigin.length !== that.noti && that.noti !== undefined && that.noti !== null && that.noti.length) {
        that.notiisRead = []
        for (let noti of that.noti) {
          that.assetFacade.getPathFile(noti.sender.imageURL).then((res: any) => {
            noti.sender.avatarURL = res.data
          }).catch((err: any) => {
          });
          if (!noti.notification.isRead) {
            that.notiisRead.push(noti)
            noti.notification.linkPath = (that.mainPostLink + noti.notification.link)
          }
        }
        that.notiOrigin = that.noti
      }
    }, 31000);

  }

  public ngOnInit(): void {
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

  isActive(): boolean {
    let notification = document.getElementsByClassName("wrapper-notification");
    return notification && notification.length > 0;
  }
  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  public markReadNoti(data) {
    this.notificationFacade.markRead(data)
  }

  public markReadNotiAll() {
    // this.notificationFacade.clearAll()
    this.showAlertDevelopDialog();
  }
}
