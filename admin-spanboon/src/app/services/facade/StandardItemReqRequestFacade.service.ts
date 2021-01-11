/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { StandardItemRequest } from "../../models/StandardItemRequest";
import { StandardItemReqApproveRequest } from "../../models/StandardItemReqApproveRequest";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class StandardItemReqRequestFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(body: StandardItemRequest): Promise<StandardItemRequest> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_request';
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public edit(id: any, body: StandardItemRequest): Promise<StandardItemRequest> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_request/' + id;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public find(name: string): Promise<StandardItemRequest> {
    if (name === undefined || name === null || name === '') {
      new Error("Name is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/item_request/' + name;

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(searchFilter: SearchFilter): Promise<StandardItemRequest[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_request/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data as StandardItemRequest[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(id: any): Promise<StandardItemRequest[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_request/' + id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data as StandardItemRequest[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public approve(id: any, itemRequest: StandardItemReqApproveRequest): Promise<StandardItemRequest[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_request/approve';
      let options = this.getDefaultOptions();
      this.http.post(url, itemRequest, options).toPromise().then((response: any) => {
        resolve(response.data as StandardItemRequest[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
