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
import { StandardItem } from "../../models/StandardItem";
import { Asset } from "../../models/Asset";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class StandardItemFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(body: StandardItem): Promise<StandardItem> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item';
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public edit(id: any, body: StandardItem): Promise<StandardItem> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item/' + id;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public find(name: string): Promise<StandardItem> {
    if (name === undefined || name === null || name === '') {
      new Error("Name is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/item/' + name;

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getPathFile(urlPath: any): Promise<Asset> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + urlPath;

      let body: any = {};


      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(searchFilter: SearchFilter): Promise<StandardItem[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        for (let r of response.data) {
          if (r.imageURL != null && r.imageURL != undefined) {
            this.getPathFile(r.imageURL).then((res: any) => {
              r.image = res.data
            }).catch((err: any) => {
            });
          }
        }
        resolve(response.data as StandardItem[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(id: any): Promise<StandardItem[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item/' + id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data as StandardItem[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
