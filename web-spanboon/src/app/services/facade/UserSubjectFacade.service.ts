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
export class UserSubjectFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public getSubject(): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/user/subject/search';
            let options = this.authMgr.getDefaultOptions();

            this.http.get(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public SubjectSelect(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/user/subject';

            let body: any = {};
            body = Object.assign(data);

            let options = this.authMgr.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

}
