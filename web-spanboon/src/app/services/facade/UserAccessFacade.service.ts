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

@Injectable()
export class UserAccessFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public getPageAccess(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/useraccess/page/';

            let option = this.getDefaultOptions();
            this.http.get(url, option).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
    public getPageAccessUser(pageId: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/page/' + pageId + '/access/';

            let option = this.getDefaultOptions();
            this.http.get(url, option).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public deleteInfoAdmin(id: string, accessId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/page/' + id + '/access/' + accessId;
            let option = this.getDefaultOptions(); 

            this.http.delete(url, option).toPromise().then((response: any) => {
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
