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
import { SearchFilter } from '../../models/SearchFilter';
import { PageUser } from '../../models/PageUser';
import { BanRequest } from '../../models/BanRequest';

@Injectable()
export class PageUserFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public search(searchFilter: SearchFilter): Promise<PageUser[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/user/search';
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
        resolve(response.data as any[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public searchUserAdmin(): Promise<PageUser[]> {
    let search: SearchFilter = new SearchFilter();
    search.orderBy = {};
    search.whereConditions = { isAdmin: 'true' };
    search.count = false;
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/user/search';
      let body: any = {};
      if (search !== null && search !== undefined) {
        body = Object.assign(search)
      }

      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data as any[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public ban(id: any, banRequest: BanRequest): Promise<PageUser> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/user/' + id + '/ban/';

      let options = this.getDefaultOptions();
      this.http.post(url, banRequest, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public register(body: PageUser): Promise<PageUser> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/user/register';
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
