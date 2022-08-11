/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { MainPageModel } from '../../models/models';

@Injectable()
export class MainPageSlideFacade extends AbstractFacade {

  public cacheImageAutoScaleMainPage: number;

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public getMainPageModel(userId?: string, offset?: string, section?: string, date?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/main/content';
      if (offset !== undefined) {
        url = (url + '?offset=' + offset)
      }
      if (section !== undefined) {
        url = (url + '&section=' + section)
      }
      if (date !== undefined) {
        url = (url + '&date=' + date)
      }
      let option = this.getDefaultOptions();
      let httpOptions
      if (userId !== null && userId !== undefined) {
        let headers = new HttpHeaders({
          'userid': userId
        });
        httpOptions = {
          headers: headers
        };
      } else {
        httpOptions = {
          headers: option
        };
      }
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data as MainPageModel[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  // public getDefaultOptions(): any {
  //   let header = this.getDefaultHeader();
  //   let userId = this.authMgr.getCurrentUser();
  //   header = header.append('userId', userId ? userId.id : '')

  //   let httpOptions = {
  //     headers: header
  //   };

  //   return httpOptions;
  // } 

  public getSearchAll(search: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/main/search';
      let body: any = {};
      if (search !== null && search !== undefined) {
        body = Object.assign(search)
      }

      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  // search obj pattern
  /*
  * {
  *   hashtag: string
  *   keyword: string
  *   filter: any 
  * }
  */
  public searchMainContent(search: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/main/content/search';
      let body: any = {};
      let option = this.getDefaultOptions();
      if (search !== null && search !== undefined) {
        body = Object.assign(search)
      }

      this.http.post(url, body, option).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  // getCacheImageAutoScaleMainPage() {
  //   return this.cacheImageAutoScaleMainPage;
  // }
  // setCacheImageAutoScaleMainPage(sizeImage: number) {
  //   this.cacheImageAutoScaleMainPage = sizeImage;
  // }

  // like post 
  /*
  * {
  *   userid: string
  * }
  */

  public likePost(userId: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/main/content';
      let headers = new HttpHeaders({
        'userid': userId
      });
      let httpOptions = {
        headers: headers
      };
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data as MainPageModel[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public account(data: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/main/account/?id=' + data;
      let body = {};
      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
