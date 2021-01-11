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
import { PageCategory } from '../../models/models'; 

@Injectable()
export class PageCategoryFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public search(searchFilter: SearchFilter): Promise<PageCategory[]> {

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page_category/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  } 
  public searchItemCategory(searchFilter: SearchFilter, pageId? : string, isTrend?: boolean ): Promise<PageCategory[]> {

    return new Promise((resolve, reject) => { 
      let url: string = this.baseURL + '/item_category/search';

      if(isTrend !== undefined && isTrend !== null){ 
        url += '?isTrend=' + isTrend;
      }

      if(pageId !== undefined && pageId !== null){ 
        url += '&pageId=' + pageId;
      } 
      
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  } 
  public searchItemCategoryMerge(searchFilter: SearchFilter, pageId? : string, isTrend?: boolean ): Promise<PageCategory[]> {

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/item/searchmerge';
      // let url: string = this.baseURL + '/item_category/search';

      if(isTrend !== undefined && isTrend !== null){ 
        url += '?isTrend=' + isTrend;
      }

      if(pageId !== undefined && pageId !== null){ 
        url += '&pageId=' + pageId;
      }  

      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      this.http.post(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  } 

  public getItemCategory(id:any): Promise<PageCategory[]> {

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL +'/item_category/'+id+'/item';
      let body: any = {};
      // if (searchFilter !== null && searchFilter !== undefined) {
      //   body = Object.assign(searchFilter)
      // }
      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  } 
}
