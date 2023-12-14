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
import { Asset } from "src/app/models/Asset";

@Injectable()
export class VoteEventFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public search(filter: any, condition: any, keyword?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/vote/search/';
      let body: any = {
        filter: {},
        whereConditions: {},
        keyword: keyword ? keyword : "",
      };
      if (filter !== null && filter !== undefined) {
        Object.assign(body.filter, filter);
      }
      if (condition !== null && condition !== undefined) {
        Object.assign(body.whereConditions, condition);
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public searchOwn(filter: any, condition: any, keyword?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/own/search/';
      let body: any = {
        filter: {},
        whereConditions: {},
        keyword: keyword ? keyword : "",
      };
      if (filter !== null && filter !== undefined) {
        Object.assign(body.filter, filter);
      }
      if (condition !== null && condition !== undefined) {
        Object.assign(body.whereConditions, condition);
      }
      let options = this.authMgr.getDefaultOptions();
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
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getVoteChoice(id: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/item/vote/' + id;
      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getVotedOwn(id: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/voted/own/' + id;
      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getSupport(id: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/get/support/' + id;
      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getVoteHashtag(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/hashtag';
      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getTextUserVote(id: string, filter: any, condition: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/user/vote/text/' + id;
      let body: any = {
        filter: {},
        whereConditions: {},
      };
      if (filter !== null && filter !== undefined) {
        Object.assign(body.filter, filter);
      }
      if (condition !== null && condition !== undefined) {
        Object.assign(body.whereConditions, condition);
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public voting(id_vote: any, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/voted/' + id_vote;
      let body: any = {
        voteItem: data
      };
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public createVote(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/own';
      let body = data;
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public createVoteAsPage(data: any, id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/' + id + '/page';
      let body = data;
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public deleteVote(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/own/' + id;
      let options = this.authMgr.getDefaultOptions();

      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public voteSupport(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/support/' + id;
      let body = {};
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public unVoteSupport(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/voting/unsupport/';
      let body = {
        votingId: id
      };
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
