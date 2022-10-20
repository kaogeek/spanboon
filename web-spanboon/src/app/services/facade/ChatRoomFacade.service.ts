/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { Observable, Subject,BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";


@Injectable()
export class ChatRoomFacade extends AbstractFacade {

  public chatMessages: Subject<any> = new Subject();
  public message$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  // get message from API

  public getChatMessages(roomId: string, asPage?: string): Observable<any> {
    let url: string = this.baseURL + "/chatroom/" + roomId + "/message";
    if (asPage !== null && asPage !== undefined && asPage !== "") {
      url += "?asPage=" + asPage;
    }

    let options = this.getDefaultOptions();

    return this.http.get(url, options).pipe(
      tap(() => this.chatMessages.next())
    );
  }

  // get message from API
  
  public getChatMessage(roomId: string, asPage?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + "/chatroom/" + roomId + "/message";
      if (asPage !== null && asPage !== undefined && asPage !== "") {
        url += "?asPage=" + asPage;
      }

      let options = this.getDefaultOptions();

      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  // send message to API
  public sendChatMessage(roomId: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/chatroom/' + roomId + "/message";
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data);
      }

      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  };
 
}
