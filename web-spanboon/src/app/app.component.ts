/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { SeoService } from './services/SeoService.service';
import { environment } from "../environments/environment";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { ObservableManager } from './services/ObservableManager.service';
import { ToastrService } from 'ngx-toastr';

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
  private toastr: ToastrService;
  public static readonly NOTI_CHECK_SUBJECT: string = NOTI_CHECK_SUBJECT;

  constructor(router: Router, observManager: ObservableManager,toastr: ToastrService) {
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
      this.slideNotiTimeout = setTimeout(() => { this.slideNoti = false; }, 1500);
      this.timeoutMessageTimeOut = setTimeout(() => { this.message = null; this.timeOut = false; }, 3000);
    };
  }

  public requestPermission() {
    const messaging = getMessaging();
    getToken(messaging,
      { vapidKey: environment.firebase.vapidKey }).then(
        (tokenFCM) => {
          if (tokenFCM) {
            localStorage.setItem('tokenFCM', tokenFCM);
          } else {
          }
        }).catch((err) => {
          console.log(err);
        });
  }



  public listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('payload',this.apiBaseURL + payload.data["gcm.notification.image_url"] + '/image');
      
      this.setData({ notification: { title: 'การแจ้งเตือนใหม่', body: payload.notification.title, image: this.apiBaseURL + payload.data["gcm.notification.image_url"] + '/image', status: payload.data["gcm.notification.notificationType"], isRred: true, link: payload.data["gcm.notification.link_noti"], displayName: payload.data["gcm.notification.displayFCM"] } });
      this.observManager.publish(NOTI_CHECK_SUBJECT, {
        data: payload.notification
      });
    });
  }

}
