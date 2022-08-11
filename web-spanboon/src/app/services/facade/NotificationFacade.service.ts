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
import { SearchFilter } from '../../models/SearchFilter';

@Injectable()
export class NotificationFacade extends AbstractFacade {
    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public listNotification(limit?, offset?): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = (this.baseURL + '/notification') + (limit ? "?limit=" + limit : "?limit=20") + (offset ? "&offset=" + offset : "");
            let options = this.getDefaultOptions();

            this.http.get(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public findNotification(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/notification/' + id;
            let options = this.getDefaultOptions();

            this.http.get(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public markRead(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/notification/' + id + '/read';
            let options = this.getDefaultOptions();
            let body: any = {};

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public clearAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/notification/clear';
            let options = this.getDefaultOptions();
            let body: any = {};

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public deleteNotification(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/notification/' + id;
            let options = this.getDefaultOptions();

            this.http.delete(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public deleteAll(): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/notification/all';
            let options = this.getDefaultOptions();

            this.http.delete(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public search(searchFilter: SearchFilter): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/notification/search';
            let options = this.getDefaultOptions();

            let body: any = {};
            if (searchFilter !== null && searchFilter !== undefined) {
                body = Object.assign(searchFilter)
            }

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
