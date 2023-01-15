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
import { ActionLog } from "../../models/ActionLog";

@Injectable()
export class ActionLogFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public createActionLog(contentId: string, contentType: string, action?: string): Promise<ActionLog> {
    if (contentId === null || contentId === undefined) {
      return Promise.reject('contentId is null');
    }

    if (contentType === null || contentType === undefined) {
      return Promise.reject('contentType is null');
    }

    if (action === null || action === undefined) {
      action = 'view';
    }

    const data: any = {
      'contentId': contentId,
      'contentType': contentType,
      'action': action
    }
    return this.create(data);
  }


  public create(data: ActionLog): Promise<ActionLog> {
    if (data === undefined || data === null) {
      new Error("data is required.");
    }

    if (data.contentId === undefined || data.contentId === null) {
      new Error("content Id is required.");
    }

    // if (data.contentType === undefined || data.contentType === null || data.contentType === '') {
    //   new Error("content Type is required.");
    // }

    if (data.action === undefined || data.action === null || data.action === '') {
      new Error("action is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/actionlog/addlog';
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }

      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data as ActionLog);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
