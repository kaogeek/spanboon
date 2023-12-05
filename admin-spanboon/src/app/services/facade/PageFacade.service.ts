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
import { Page } from "../../models/Page";
import { BanRequest } from '../../models/BanRequest';
import { PageApproveRequest } from "../../models/PageApproveRequest";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class PageFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public find(name: string): Promise<Page> {
    if (name === undefined || name === null || name === '') {
      new Error("Name is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + name;

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
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

  public search(searchFilter: SearchFilter): Promise<Page[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data as Page[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public approve(id: any, itemRequest: PageApproveRequest): Promise<Page[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page/' + id + '/approve';
      let options = this.getDefaultOptions();
      this.http.post(url, itemRequest, options).toPromise().then((response: any) => {
        resolve(response.data as Page[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public unapprove(id: any, itemRequest: PageApproveRequest): Promise<Page[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page/' + id + '/unapprove';
      let options = this.getDefaultOptions();
      this.http.post(url, itemRequest, options).toPromise().then((response: any) => {
        resolve(response.data as Page[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public ban(id: any, banRequest: BanRequest): Promise<Page[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page/' + id + '/ban';
      let options = this.getDefaultOptions();
      this.http.post(url, banRequest, options).toPromise().then((response: any) => {
        resolve(response.data as Page[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public delete(id: any): Promise<any> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page/' + id + '/delete/page';
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public edit(id: any, body: any): Promise<Page[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/page/' + id + '/roundrobin';
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
