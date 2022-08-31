/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { SeoService } from './services/SeoService.service';
import { environment } from "../environments/environment";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { ObservableManager } from './services/ObservableManager.service';

const NOTI_CHECK_SUBJECT: string = 'noti.check';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'newconsensus-web';
  public message: any = null;
  public messagelist: any[] = [];
  public router: Router;
  public slideNoti: boolean;
  public timeOut: boolean;
  public timeoutMessageTimeOut: any;
  public slideNotiTimeout: any;
  public apiBaseURL = environment.apiBaseURL;
  private observManager: ObservableManager;

  public static readonly NOTI_CHECK_SUBJECT: string = NOTI_CHECK_SUBJECT;

  public mockmessage4: object[] = [
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'comment', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'comment', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'comment', isRred: false, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'like', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'like', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'like', isRred: false, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: false, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: false, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'page', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'page', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'page', isRred: false, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: false, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } },
  ]

  constructor(router: Router, observManager: ObservableManager) {
    this.router = router;
    this.observManager = observManager;
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      window.scroll(0, 0);
    });
    this.observManager.createSubject(NOTI_CHECK_SUBJECT);
  }

  ngOnInit(): void {
    this.requestPermission();
    this.listen();
  }

  public playAudio() {
    let audio = new Audio();
    audio.src = "../assets/Notification.mp3";
    audio.load();
    audio.play();
  }

  public setData(data: any) {
    // this.messagelist.push(this.mockmessage4[Math.floor(Math.random() * this.mockmessage4.length)]);
    this.messagelist.push(data);
    setInterval(() => {
      this.mockMessage();
    }, 1000);
  }

  public mockMessage() {
    if (this.timeOut) return;
    if (this.messagelist.length !== 0) {
      this.timeOut = true;
      this.playAudio();
      clearTimeout(this.slideNotiTimeout);
      clearTimeout(this.timeoutMessageTimeOut);
      this.message = this.messagelist[0];
      this.messagelist.splice(0, 1);
      this.slideNoti = true;
      this.slideNotiTimeout = setTimeout(() => { this.slideNoti = false; }, 4000);
      this.timeoutMessageTimeOut = setTimeout(() => { this.message = null; this.timeOut = false; }, 5000);
    };
  }

  public requestPermission() {
    const messaging = getMessaging();
    getToken(messaging,
      { vapidKey: environment.firebase.vapidKey }).then(
        (currentToken) => {
          if (currentToken) {
            localStorage.setItem('currentToken', currentToken);
          } else {
          }
        }).catch((err) => {
          console.log(err);
        });
  }
  public listen() {
    const messaging = getMessaging();
    console.log('messaging',messaging);
    onMessage(messaging, (payload) => {
      this.setData({ notification: { title: 'การแจ้งเตือนใหม่', body: payload.notification.title, image: (this.apiBaseURL + payload.data["gcm.notification.image_url"] + '/image'), status: payload.data["gcm.notification.notificationType"], isRred: true, link: "/page/tesssss/post/62cf933f61ea6e01944d7bf6" } });
      this.observManager.publish(NOTI_CHECK_SUBJECT, {
        data: payload.notification
      });
    });
  }

}
