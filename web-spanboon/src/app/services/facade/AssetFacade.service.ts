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
import { Asset } from '../../models/Asset';

@Injectable()
export class AssetFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public getPathFile(urlPath: any): Promise<Asset> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + urlPath;

      let body: any = {};
      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getPathFileSign(urlPath: any): Promise<Asset> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + urlPath + '/sign';

      let body: any = {};

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response as Asset);
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
}
