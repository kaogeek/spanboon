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
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class ObjectiveFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }
  public searchObjective(searchFilter: SearchFilter): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/objective/search';

      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter);
      }

      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public getObjectivePage(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // https://10.1.0.22:9001/api/page/5ebf98a6f177d22d3aebb259/post

      let url: string = this.baseURL + '/page/' + pageId + '/objective';
      let body: any = {};

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public uploadImageObjective(data: any): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/objective';

      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public searchObjectiveCategory(searchFilter: SearchFilter): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/objective_category/search';

      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getPageObjectiveTimeline(objectiveId: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/objective/' + objectiveId + '/timeline';
      let body: any = this.getDefaultOptions();

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public followObjective(objectiveId: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/objective/' + objectiveId + '/follow';
      let body: any = {};
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
