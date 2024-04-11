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
import { Asset } from '../../models/Asset';

@Injectable()
export class PointFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public search(): Promise<[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/point/event/search';
      let body = {}
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public create(data: any): Promise<[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/point/event';
      let body = data;
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public upload(data: any): Promise<Asset> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/file/temp';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public update(data: any, id: string): Promise<[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/point/event/' + id;
      let body = data;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
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
      let url: string = this.baseURL + '/admin/point/event/' + id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public addPoint(data: any): Promise<Asset> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/point/accumulate';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getAccumulate(id: any): Promise<Asset> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/point/accumulate/users';
      let body: any = {
        user: id
      };
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public createAccumulateUser(id: any): Promise<Asset> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/point/accumulate/new';
      let body: any = {
        userId: id
      };
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
