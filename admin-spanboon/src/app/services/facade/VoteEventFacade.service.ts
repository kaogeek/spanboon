/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { VoteEvent } from "../../models/VoteEvent";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class VoteEventFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public edit(id: any, body: VoteEvent): Promise<VoteEvent> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/' + id;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(searchFilter: SearchFilter): Promise<VoteEvent[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/all/search';
      let body: any = {};
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        for (let r of response.data) {
          if (r.coverPageURL != null && r.coverPageURL != undefined) {
            this.getPathFile(r.coverPageURL).then((res: any) => {
              r.image = res.data
            }).catch((err: any) => {
            });
          }
        }
        resolve(response.data as VoteEvent[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public update(id: any, data: any): Promise<VoteEvent[]> {
    if (id === undefined || id === null) {
      new Error("id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/' + id;
      let body = {};
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(id: any): Promise<VoteEvent[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/' + id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data as VoteEvent[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public approve(id: any, body: any): Promise<VoteEvent[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/' + id;
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public reject(id: any, body: any): Promise<VoteEvent[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/reject/' + id;
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getVoteChoice(id: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/voted/item/' + id;
      let httpOptions = this.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
