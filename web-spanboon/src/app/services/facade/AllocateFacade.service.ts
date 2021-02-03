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
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AllocateFacade extends AbstractFacade {

    private message = new BehaviorSubject('');
    public sharedMessage = this.message.asObservable();

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public nextMessage(message: any) {
        this.message.next(message);
    }

    public async calculateAllocate(data): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/allocate/calculate";
            let body: any = {};
            let options = this.getDefaultOptions();

            body = Object.assign(data)
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public async confirmAllocateFulfillmentCase(caseId, pageId, data): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/fulfillment_case/" + caseId + "/allocate_confirm?asPage=" + pageId;
            let body: any = {};
            let options = this.getDefaultOptions();

            body = Object.assign(data)
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public async searchAllocate(data, filter?): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/allocate/search";
            let body: any = {};
            let options = this.getDefaultOptions();

            body = Object.assign(data)
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

}