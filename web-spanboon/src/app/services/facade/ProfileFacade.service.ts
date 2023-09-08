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

@Injectable()
export class ProfileFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public getProfile(id: any): Promise<any> {
    if (id === undefined || id === null || id === '') {
      new Error("id is required.");
    }

    let option = this.authMgr.getDefaultOptions();

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/profile/' + id;

      this.http.get(url, option).toPromise().then((response: any) => {
        resolve(response);
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

  public getProvince() {
    return new Promise((resolve, reject) => {
      let url: string = "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json";
      let data = [];
      this.http.get(url).toPromise().then((response: any) => {
        for (let index = 0; index < response.length; index++) {
          const element = response[index].province;
          data.push(element)
        }
        var dataProvince = data.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        });
        resolve(dataProvince);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public setEmailPushNotification(email: boolean, noti: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/notification/settings';
      let body = {
        "sendEmail": email,
        "subscribeNoti": noti
      }

      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public searchType(data: any, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/profile/' + userId + '/post/search';
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public saveImageProfile(id: any, data: any): Promise<any> {
    if (id === undefined || id === null || id === '') {
      new Error("id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/profile/' + id + '/image';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public updateMember(userId: any, status?: boolean): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let url: string = this.baseURL + '/profile/' + userId;

      let body: any = {
        membership: status,
        token: localStorage.getItem('token')
      };
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public saveCoverImageProfile(id: any, data: any): Promise<any> {
    if (id === undefined || id === null || id === '') {
      new Error("id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/profile/' + id + '/cover';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  // public edit(id: any, data: any){
  // let options = this.authMgr.getDefaultOptions();
  //  let url: string = this.baseURL + '/profile/'+id;
  // let body: any = {};
  //   if (data !== null && data !== undefined) {
  //     body = Object.assign(data)
  //   }
  //   this.http.put(url, body,options).pipe(map((response: any) => response.json()))
  //   .subscribe((groups) => this.groupSource.next(groups));


  //   return new Promise((resolve, reject) => {
  //     let url: string = this.baseURL + '/profile/'+id;
  //     let body: any = {};
  //     if (data !== null && data !== undefined) {
  //       body = Object.assign(data)
  //     }
  //     let options = this.authMgr.getDefaultOptions()
  //     this.http.put(url, body,options).toPromise().then((response: any) => {
  //       resolve(response.data);
  //     }).catch((error: any) => {
  //       reject(error);
  //     });
  //   });
  // }
  public edit(id: any, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/profile/' + id;
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions()
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public follow(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/user/' + userId + '/follow';
      let body: any = {};
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/delete';
      let body: any = {
        banned: true
      };
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
