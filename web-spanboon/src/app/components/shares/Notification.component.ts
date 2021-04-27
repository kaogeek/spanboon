/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { SimpleChanges } from '@angular/core';
import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CHAT_MESSAGE_TYPE } from '../../../app/ChatMessageTypes';
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
  public preload: boolean; 
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

    this.preload = true;

    var myVar;
    clearInterval(myVar);
    myVar = setInterval(() => {
      this.checkNotification();
    }, 31000);
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkNotification();
      setTimeout(() => {
        this.preload = false
      }, 1000);
    }, 1000);
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

  private checkNotification() {
    if (this.notiOrigin && this.notiOrigin.length !== this.noti && this.noti !== undefined && this.noti !== null && this.noti.length) {
      this.notiisRead = []
      for (let noti of this.noti) {
        if (noti.sender && noti.sender.imageURL !== '' && noti.sender.imageURL !== undefined && noti.sender.imageURL !== null) {
          this.assetFacade.getPathFile(noti.sender.imageURL).then((res: any) => {
            noti.sender.avatarURL = res.data
          }).catch((err: any) => {
          });
        }
        if (!noti.notification.isRead) {
          this.notiisRead.push(noti)
          noti.notification.linkPath = (this.mainPostLink + noti.notification.link)
        }
      }
      this.notiOrigin = this.noti; 
    }
  }

  public markReadNoti(data) {
    this.notificationFacade.markRead(data.notification.id)
  }

  public redirectNotification(data) {
    if (data.notification.type === CHAT_MESSAGE_TYPE.LIKE) {
      this.router.navigateByUrl(data.notification.link)
    } else if (data.notification.type === CHAT_MESSAGE_TYPE.CHAT) {
      this.router.navigateByUrl('/fulfill', { state: { room: data.notification.data } })
    }
  }

  public markReadNotiAll() {
    // this.notificationFacade.clearAll()
    this.showAlertDevelopDialog();
  }

  public isOpened() { 
    if (this.notiOrigin && this.notiOrigin.length > 0) {
      for (let msg of this.notiOrigin) {
        this.notificationFacade.markRead(msg.notification.id);
        this.notiisRead = [];
      }
    }
  }
}
