/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit } from '@angular/core';
import { getMessaging, onMessage } from 'firebase/messaging';
import { AuthenManager } from '../../services/AuthenManager.service';
import { ObservableManager } from '../../services/ObservableManager.service';

const PAGE_NAME: string = 'authen_check';
const AUTHEN_CHECK_SUBJECT: string = 'authen.check';
const NOTI_CHECK_SUBJECT: string = 'noti.check';
const NOTI_CHECK_LOAD_SUBJECT: string = 'noti.load.check';

@Component({
  selector: 'authen-check-page',
  templateUrl: 'AuthenCheckPage.component.html'
})
export class AuthenCheckPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;
  public static readonly AUTHEN_CHECK_SUBJECT: string = AUTHEN_CHECK_SUBJECT;
  public static readonly NOTI_CHECK_SUBJECT: string = NOTI_CHECK_SUBJECT;
  public static readonly NOTI_CHECK_LOAD_SUBJECT: string = NOTI_CHECK_LOAD_SUBJECT;

  private authenMgr: AuthenManager;
  private observManager: ObservableManager;
  public isLoaded: boolean;

  constructor(authenMgr: AuthenManager, observManager: ObservableManager) {
    this.authenMgr = authenMgr;
    this.observManager = observManager;

    this.observManager.createSubject(AUTHEN_CHECK_SUBJECT);
    this.reCheck();
  }

  public ngOnInit(): void {
  }

  public listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      this.reCheck();
    });
  }

  public reCheck(): void {
    this.isLoaded = false;

    let mode = this.authenMgr.getToken().mode;

    if (mode === undefined) {
      let storageMode = sessionStorage.getItem(AuthenManager.TOKEN_MODE_KEY);

      if (storageMode === undefined || storageMode === null) {
        storageMode = localStorage.getItem(AuthenManager.TOKEN_MODE_KEY);
      }

      if (storageMode !== undefined) {
        mode = storageMode;
      }
    }

    let token = this.authenMgr.getToken().token;
    if (token === undefined) {
      token = sessionStorage.getItem(AuthenManager.TOKEN_KEY);

      if (token === undefined || token === null) {
        token = localStorage.getItem(AuthenManager.TOKEN_KEY);
      }
    }

    if (token !== undefined && token !== null) {
      this.authenMgr.checkAccountStatus(token, mode, { updateUser: true }).then((res) => {
        if (!res.user) {
          this.authenMgr.clearStorage();
        }
        this.isLoaded = true;
        this.observManager.publish(AUTHEN_CHECK_SUBJECT, {
          valid: true
        });
        return;
      }).catch(() => {
        // there is an error so remove storageSession.
        this.authenMgr.clearStorage();
        this.isLoaded = true;
        this.observManager.publish(AUTHEN_CHECK_SUBJECT, {
          valid: false
        });
        return;
      })
    } else {
      this.isLoaded = true;
      this.observManager.publish(AUTHEN_CHECK_SUBJECT, {
        valid: false
      });
      return;
    }
  }
}
