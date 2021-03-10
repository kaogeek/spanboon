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
export class RecommendFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public getRecommend(limit: number, offset?: number, isRandomPage?: boolean, isRandomUser?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      let queryParams: string = "";
      let url: string = this.baseURL + '/recommend';
      let options = this.getDefaultOptions();

      if (limit !== undefined && limit !== null) {
        queryParams += "&limit=" + limit
      }

      if (offset !== undefined && offset !== null) {
        queryParams += "&offset=" + offset
      }

      if(isRandomPage){
        queryParams += "&isRandomPage=" + isRandomPage
      }

      if(isRandomUser){
        queryParams += "&isRandomUser=" + isRandomUser
      }

      if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
        queryParams = queryParams.substring(1, queryParams.length);
      }
  
      if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
        url += "?" + queryParams;
      }

      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }


}
