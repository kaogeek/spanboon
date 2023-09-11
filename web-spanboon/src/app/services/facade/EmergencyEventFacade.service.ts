/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { SearchFilter } from "../../models/SearchFilter";
import { EmergencyEvent } from 'src/app/models/models';

@Injectable()
export class EmergencyEventFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public searchEmergency(searchFilter: SearchFilter): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/emergency/search';

      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }

      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response.data as EmergencyEvent[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getEmergencyTimeline(emergencyId: string, dataMobile?: any, limit?: number, offset?: number, postObj?: any): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/emergency/' + emergencyId + '/timeline';
      let body: any = {
        postObjIds: postObj
      };
      if (limit !== null && limit !== undefined) {
        url += `?limit=${limit}&offset=${offset}`;
      }

      let options;
      if (!!dataMobile.token && !!dataMobile.mode && !!dataMobile.userid) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        headers = headers.set('Authorization', 'Bearer ' + dataMobile.token);
        headers = headers.set('mode', dataMobile.mode);
        headers = headers.set('userid', dataMobile.userid);

        options = { headers };
      } else {
        options = this.authMgr.getDefaultOptions();
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public followEmergency(emergencyId: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/emergency/' + emergencyId + '/follow';
      let body: any = {};
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }


  // public contentView(id: string): Promise<any> {
  //   if (id === undefined || id === null || id === '') {
  //     new Error("Id is required.");
  //   }

  //   return new Promise((resolve, reject) => {
  //     let url: string = this.baseURL + '/content/' + id + '/count';

  //     this.http.get(url).toPromise().then((response: any) => {
  //       resolve(response.data);
  //     }).catch((error: any) => {
  //       reject(error);
  //     });
  //   });
  // }
}
