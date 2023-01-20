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
import { User } from "../../models/User";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class UserFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(body: User): Promise<User> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    } 
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/auth/create-user';

      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public deleteuser(id: any): Promise<any> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/user/' + id + '/delete/user';
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public edit(id: any, body: User): Promise<User> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    if (body === undefined || body === null) {
      new Error("body is required.");
    } 
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/auth/update-user/' + id;

      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(id: any): Promise<User[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/auth/delete-user/'+id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data as User[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  } 

  public search(searchFilter: SearchFilter): Promise<User[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/auth/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }

      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data as User[]);
      }).catch((error: any) => {
        reject(error);
      }); 
    });
  } 

  public userlist(searchFilter: SearchFilter): Promise<User[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/auth/userlist';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }

      let options = this.getDefaultOptions();
      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response.data as User[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  } 

}
