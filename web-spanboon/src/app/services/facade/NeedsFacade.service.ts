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
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NeedsFacade extends AbstractFacade {

  private message = new BehaviorSubject('');
  sharedMessage = this.message.asObservable();
  
  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  nextMessage(message: any ) { 
    this.message.next(message)
  }

  public getNeedsPage(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/needs';
      let body: any = {};

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getNeeds(id: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/item/' + id;
      let body: any = {};

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getNeedsPost(id: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/needs/' + id;
      let body: any = {};

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getNeedsLastest(id: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/needs/lastest?pageId=' + id;
      let body: any = {};

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
