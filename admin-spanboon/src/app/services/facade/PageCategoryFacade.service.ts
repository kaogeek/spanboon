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
import { PageCategory } from "../../models/PageCategory";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class PageCategoryFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(body: PageCategory): Promise<PageCategory> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page_category';
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public edit(id: any, body: PageCategory): Promise<PageCategory> {
    if (id === undefined || id === null) {
      new Error("id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page_category/' + id;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public find(name: string): Promise<PageCategory> {
    if (name === undefined || name === null || name === '') {
      new Error("Name is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page_category/' + name;

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(searchFilter: SearchFilter): Promise<PageCategory[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page_category/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        for (let r of response.data) {
          if (r.iconURL != null && r.iconURL != undefined) {
            this.getPathFile(r.iconURL).then((res: any) => {
              r.image = res.data
            }).catch((err: any) => {
            });
          }
        }
        resolve(response.data as PageCategory[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(id: any): Promise<PageCategory[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page_category/' + id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data as PageCategory[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getImg(iconURL: any): Promise<PageCategory[]> {
    if (iconURL === undefined || iconURL === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL  + iconURL;
      let options = this.getDefaultOptions();
      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response.data as PageCategory[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
