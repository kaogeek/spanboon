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
  public apiBaseURL = environment.apiBaseURL;

  public messagelist: any[] = [];
  public messagelist2: any[] = [];
  public timeOut: boolean;
  public message: any = null;
  public slideNoti: boolean;

  public mockmessage4: object[] = [
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'COMMENT', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'COMMENT', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'COMMENT', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'LIKE', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'LIKE', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'LIKE', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'POST', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'POST', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'POST', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: false } },
  ]

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
    for (let index = 0; index < 3; index++) {
      this.setData();
    }
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
        if (!noti.notification.isRead) {
          this.notiisRead.push({ notification: { title: 'การแจ้งเตือนใหม่', body: noti.notification.title, image: (this.apiBaseURL + noti.sender.imageURL + '/image'), status: noti.notification.type, isRred: noti.notification.isRead, id: noti.notification.id } })
          noti.notification.linkPath = (this.mainPostLink + noti.notification.link)
        }
      }
      this.notiOrigin = [];
      for (let noti of this.noti) {
        this.notiOrigin.push({ notification: { title: 'การแจ้งเตือนใหม่', body: noti.notification.title, image: (this.apiBaseURL + noti.sender.imageURL + '/image'), status: noti.notification.type, isRred: noti.notification.isRead, id: noti.notification.id } })
      }
    }
  }

  public markReadNoti(data) {
    this.notificationFacade.markRead(data.notification.id)
  }

  public redirectNotification(data) {
    console.log('data', data);
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

  public setData() {
    this.messagelist.push(this.mockmessage4[Math.floor(Math.random() * this.mockmessage4.length)]);
    this.messagelist2.push(this.mockmessage4[Math.floor(Math.random() * this.mockmessage4.length)]);
    // this.messagelist.push(data);
    // setInterval(() => {
    //   this.mockMessage();
    // }, 1000);
  }

  // public mockMessage() {
  //   if (this.timeOut) return;
  //   if (this.messagelist.length !== 0) {
  //     this.timeOut = true;
  //     this.message = this.messagelist[0];
  //     this.messagelist.splice(0, 1);
  //     this.slideNoti = true;
  //   };
  // }


}
