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
import { Observable, of } from 'rxjs';

@Injectable()
export class UserFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public search(filter: any): Promise<any> {

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/tag/';

      let body: any = {};
      // if (searchFilter !== null && searchFilter !== undefined) {
      body = Object.assign(filter);
      // }

      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public checkUniqueId(uuid : any): Promise<any> { 
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/uniqueid/check';

      let body: any = {}; 
      body = Object.assign(uuid); 

      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  getItems(filter): Observable<any[]> {
    console.log('getItems:', filter);
    if (!filter) {
      // if the search term is empty, return an empty array
      return of([]);
    }
    let url: string = this.baseURL + '/user/tag/';

    let body: any = { name: filter };

    
    // return of([
    //   {
    //     displayName: "ploy",
    //     firstName: "",
    //     id: "5ed9fadbe31c9d4a14ff2b81",
    //     lastName: ""
    //   },
    //   {
    //     displayName: "ploy",
    //     firstName: "",
    //     id: "5ed9fadbe31c9d4a14ff2b81",
    //     lastName: ""
    //   },
    //   {
    //     displayName: "ploy",
    //     firstName: "",
    //     id: "5ed9fadbe31c9d4a14ff2b81",
    //     lastName: ""
    //   },
    //   {
    //     displayName: "ploy",
    //     firstName: "",
    //     id: "5ed9fadbe31c9d4a14ff2b81",
    //     lastName: ""
    //   }
    // ])
    return this.http.post<any[]>(url, body, { headers: this.getDefaultHeader() });
    // this.http.post<any[]>(url, body, { headers: this.getDefaultHeader() }).subscribe((res: any) => {
    //   let data = Object.keys(res.data);
    //   if (data && data.length) {
    //     return of(data);
    //   }
    //   else {
    //     return of([]);
    //   }
    // }); 
  }  

}
