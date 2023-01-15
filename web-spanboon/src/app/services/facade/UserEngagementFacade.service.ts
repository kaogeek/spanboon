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
import { UserEngagement } from "../../models/UserEngagement";

@Injectable()
export class UserEngagementFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public create(data: UserEngagement): Promise<any> {

        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/engagement/';
            let body: any = {};
            if (data !== null && data !== undefined) {
                body = Object.assign(data);
            }
            let options = this.authMgr.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }


}
