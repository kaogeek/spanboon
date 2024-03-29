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
import { Page } from "../../models/Page";
import { BanRequest } from '../../models/BanRequest';
import { PageApproveRequest } from "../../models/PageApproveRequest";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class PageGroupFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public find(): Promise<Page> {

        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/group';

            this.http.get(url).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public finds(): Promise<any>{
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/group';

            this.http.get(url).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public search(): Promise<Page[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/group';

            this.http.get(url).toPromise().then((response: any) => {
                resolve(response.data as Page[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public create(body: any): Promise<Page[]> {
        if (body === undefined || body === null) {
            new Error("body is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/group';
            let options = this.getDefaultOptions();
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public approve(id: any, itemRequest: PageApproveRequest): Promise<Page[]> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }

        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/approve';
            let options = this.getDefaultOptions();
            this.http.post(url, itemRequest, options).toPromise().then((response: any) => {
                resolve(response.data as Page[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public unapprove(id: any, itemRequest: PageApproveRequest): Promise<Page[]> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }

        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/unapprove';
            let options = this.getDefaultOptions();
            this.http.post(url, itemRequest, options).toPromise().then((response: any) => {
                resolve(response.data as Page[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public ban(id: any, banRequest: BanRequest): Promise<Page[]> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }

        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/ban';
            let options = this.getDefaultOptions();
            this.http.post(url, banRequest, options).toPromise().then((response: any) => {
                resolve(response.data as Page[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
    public delete(id: any): Promise<any> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/delete/page';
            let options = this.getDefaultOptions();
            this.http.delete(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public edit(id: any, body: any): Promise<Page[]> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/roundrobin';
            let options = this.getDefaultOptions();
            this.http.put(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

}
