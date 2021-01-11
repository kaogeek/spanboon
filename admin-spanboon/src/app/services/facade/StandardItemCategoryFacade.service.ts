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
import { StandardItemCategory } from "../../models/StandardItemCategory";
import { SearchFilter } from "../../models/SearchFilter";
import { ValidateStandardItemCategoryRequest } from "../../models/ValidateStandardItemCategoryRequest";

@Injectable()
export class StandardItemCategoryFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(body: StandardItemCategory): Promise<StandardItemCategory> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_category';
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public edit(id: any, body: StandardItemCategory): Promise<StandardItemCategory> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_category/' + id;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public find(name: string): Promise<StandardItemCategory> {
    if (name === undefined || name === null || name === '') {
      new Error("Name is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/item_category/' + name;

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(searchFilter: SearchFilter): Promise<StandardItemCategory[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_category/search';
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
        resolve(response.data as StandardItemCategory[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public validateStandardItemCategory(validate: ValidateStandardItemCategoryRequest): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_category/validate';
      let body: any = {};
      if (validate !== null && validate !== undefined) {
        body = Object.assign(validate)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(id: any): Promise<StandardItemCategory[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/item_category/' + id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data as StandardItemCategory[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
