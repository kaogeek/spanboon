/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { Hashtag } from "../../models/Hashtag";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class ManipulatePostFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }



    public search(searchFilter: SearchFilter): Promise<Hashtag[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/report/';
            let body: any = {};
            if (searchFilter !== null && searchFilter !== undefined) {
                body = Object.assign(searchFilter)
            }
            let options = this.getDefaultOptions();
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data as Hashtag[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public approve(data: any): Promise<Hashtag[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/report/' + data._id + '/approve';
            let body: any = {
                id: data._id,
                type: data.type,
                ban: true,
            };

            let options = this.getDefaultOptions();
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data as Hashtag[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public unapprove(data: any): Promise<Hashtag[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/report/' + data._id + '/unapprove';
            let body: any = {
                id: data._id,
                type: data.type,
                ban: false,
            };

            let options = this.getDefaultOptions();
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data as Hashtag[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
