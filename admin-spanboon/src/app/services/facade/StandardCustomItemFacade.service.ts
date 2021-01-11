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
import { StandardItemCustom } from "../../models/StandardItemCustom";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class StandardCustomItemFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(body: StandardItemCustom): Promise<StandardItemCustom> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/customitem/standard';
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  // public edit(id: any, body: StandardItemCustom): Promise<StandardItemCustom> {
  //   if (id === undefined || id === null) {
  //     new Error("Id is required.");
  //   }
  //   return new Promise((resolve, reject) => {
  //     let url: string = this.baseURL + '/admin/customitem/' + id;
  //     let options = this.getDefaultOptions();
  //     this.http.put(url, body, options).toPromise().then((response: any) => {
  //       resolve(response.data);
  //     }).catch((error: any) => {
  //       reject(error);
  //     });
  //   });
  // }

  public find(id: string): Promise<StandardItemCustom> {
    if (id === undefined || id === null || id === '') {
      new Error("id is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/customitem/' + id;

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(searchFilter: SearchFilter): Promise<StandardItemCustom[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/customitem/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        for (let item of response.data) {
          if (item.standardItems != null && item.standardItems != undefined) {
            item.stName = item.standardItems.name
          }
        }
        resolve(response.data as StandardItemCustom[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  // public delete(id: any): Promise<StandardItemCustom[]> {
  //   if (id === undefined || id === null) {
  //     new Error("Id is required.");
  //   }
  //   return new Promise((resolve, reject) => {
  //     let url: string = this.baseURL + '/admin/customitem/' + id;
  //     let options = this.getDefaultOptions();
  //     this.http.delete(url, options).toPromise().then((response: any) => {
  //       resolve(response.data as StandardItemCustom[]);
  //     }).catch((error: any) => {
  //       reject(error);
  //     });
  //   });
  // }
}
