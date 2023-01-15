/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { AbstractFacade } from "./AbstractFacade";
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { Injectable } from '@angular/core';
import { SearchFilter } from '../../models/SearchFilter';

@Injectable()
export class HashTagFacade extends AbstractFacade {
  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public search(searchFilter: SearchFilter, keyword?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/hashtag/search';

      if (keyword !== undefined && keyword !== null) {
        url += '?isTrend=' + keyword;
      }

      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }

      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public searchTrend(searchFilter: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/hashtag/trend/';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }

      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public searchTopTrend(filter: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/hashtag/trend/';

      let body: any = {};
      if (filter !== null && filter !== undefined) {
        body = Object.assign(filter)
      }
      let option = this.authMgr.getDefaultOptions();
      this.http.post(url, body, option).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getDefaultOptions(): any {
    let header = this.authMgr.getDefaultHeader();
    let userId = this.authMgr.getCurrentUser();
    header = header.append('userid', userId ? userId.id : '')

    let httpOptions = {
      headers: header
    };

    return httpOptions;
  }

}
