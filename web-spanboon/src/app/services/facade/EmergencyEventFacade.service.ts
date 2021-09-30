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

  public getEmergencyTimeline(emergencyId: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/emergency/' + emergencyId + '/timeline';
      let options = this.getDefaultOptions();

      this.http.get(url, options).toPromise().then((response: any) => {
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
      let options = this.getDefaultOptions();
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
