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
import { EmergencyEvent } from "../../models/EmergencyEvent";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class EmergencyEventFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(body: EmergencyEvent): Promise<EmergencyEvent> {
    if (body === undefined || body === null) {
      new Error("body is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/emergency';
      let options = this.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public edit(id: any, body: EmergencyEvent): Promise<EmergencyEvent> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/emergency/' + id;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public editSelect(id: any, body: any): Promise<EmergencyEvent> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/emergency/select/' + id;
      let options = this.getDefaultOptions();
      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    })
  }

  public find(name: string): Promise<EmergencyEvent> {
    if (name === undefined || name === null || name === '') {
      new Error("Name is required.");
    }

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/emergency/' + name;

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(searchFilter: SearchFilter): Promise<EmergencyEvent[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/emergency/search';
      let body: any = {
        'count': searchFilter.count,
        'limit': searchFilter.limit,
        'offset': searchFilter.offset,
        'orderBy': { 'createdDate': -1 },
        'relation': searchFilter.relation,
        'whereConditions': searchFilter.whereConditions
      };
      if (searchFilter !== null && searchFilter !== undefined) {
        body = Object.assign(searchFilter)
      }
      let options = this.getDefaultOptions();
      console.log('body',body);
      this.http.post(url, body, options).toPromise().then((response: any) => {
        for (let r of response.data) {
          if (r.coverPageURL != null && r.coverPageURL != undefined) {
            this.getPathFile(r.coverPageURL).then((res: any) => {
              r.image = res.data
            }).catch((err: any) => {
            });
          }
        }
        resolve(response.data as EmergencyEvent[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(id: any): Promise<EmergencyEvent[]> {
    if (id === undefined || id === null) {
      new Error("Id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/admin/emergency/' + id;
      let options = this.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data as EmergencyEvent[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
