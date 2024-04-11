import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";

@Injectable()
export class PointEventFacade extends AbstractFacade {
  private authenManager: AuthenManager

  constructor(http: HttpClient, authMgr: AuthenManager, authenManager: AuthenManager) {
    super(http, authMgr);
    this.authenManager = authenManager;
  }

  public isLogin(): boolean {
    return this.authenManager.getCurrentUser() !== undefined && this.authenManager.getCurrentUser() !== null ? true : false;
  }

  public search(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/point/mfp/content';
      let options = this.authMgr.getDefaultOptions();
      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public accumulate(limit: number, offset: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/point/accumulate/search';
      let body: any = {
        limit: limit,
        offset: offset
      };
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public coupon(limit: number, offset: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/point/coupon/search';
      let body: any = {
        limit: limit,
        offset: offset
      };
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public sortAccumulate(limit: number, offset: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/point/sort/accumulate/search';
      let body: any = {
        limit: limit,
        offset: offset
      };
      let options = this.isLogin() ? this.authMgr.getDefaultOptions() : {};
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getCategoryProduct(id): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/point/category/product/' + id;
      let options = this.authMgr.getDefaultOptions();
      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
