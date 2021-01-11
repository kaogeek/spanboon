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

@Injectable()
export class ChatFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public markReadChatMessage(chatIds: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/chat/read';
      let body: any = {};

      if (chatIds !== null && chatIds !== undefined && chatIds.length > 0) {
        body = chatIds;
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
