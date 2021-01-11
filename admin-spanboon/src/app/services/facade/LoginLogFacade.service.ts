/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { LoginLog } from "../../models/LoginLog";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class LoginLogFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public search(searchFilter: SearchFilter): Promise<LoginLog[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/auth/log/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }

      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data as LoginLog[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
