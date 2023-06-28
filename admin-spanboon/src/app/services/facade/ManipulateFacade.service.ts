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
export class ManipulateFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public create(body: Hashtag): Promise<Hashtag> {
        if (body === undefined || body === null) {
            new Error("body is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/manipulate/';
            let options = this.getDefaultOptions();
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public edit(id: any, body: Hashtag): Promise<Hashtag> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/manipulate/';
            let options = this.getDefaultOptions();
            this.http.put(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public search(searchFilter: SearchFilter): Promise<Hashtag[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/manipulate/search';
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

    public delete(id: any): Promise<Hashtag[]> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/manipulate/';
            let options = this.getDefaultOptions();
            this.http.delete(url, options).toPromise().then((response: any) => {
                resolve(response.data as Hashtag[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
