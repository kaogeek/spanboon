/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { AbstractFacade } from "./AbstractFacade"; 
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { Injectable } from '@angular/core';

@Injectable()
export class PageContentHasTagFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  // public find(id: string,showHasTag?: boolean): Promise<PageContentHasTag> {
  //   if (id === undefined || id === null || id === '') {
  //     new Error("Id is required.");
  //   }
  //   return new Promise((resolve, reject) => {
  //     let url: string = this.baseURL + '/content/hastag/' + id;
  //     if(showHasTag){
  //       url += '?show_hasTag=true';
  //     }

  //     this.http.get(url).toPromise().then((response: any) => {
  //       resolve(response.data);
  //     }).catch((error: any) => {
  //       reject(error);
  //     });
  //   });
  // }
  // public searchHasTag(searchFilter: SearchFilter, showArticle?: boolean): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let url: string = this.baseURL + '/content/hastag/search' ;
  //     if(showArticle){
  //       url += '?show_article=true';
  //     }
  //     let body: any = {};
  //     if (searchFilter !== null && searchFilter !== undefined) {
  //       body = Object.assign(searchFilter)
  //     }

  //     this.http.post(url,body).toPromise().then((response: any) => {
  //       resolve(response.data);
  //     }).catch((error: any) => {
  //       reject(error);
  //     });
  //   });
  // }
}
