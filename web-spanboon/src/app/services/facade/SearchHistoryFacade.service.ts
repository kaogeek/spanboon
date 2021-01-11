/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade"; 
import { SearchFilter } from "../../models/SearchFilter"; 
import { SearchHistory } from '../../models/models'; 

@Injectable()
export class SearchHistoryFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public search(filter: SearchFilter): Promise<SearchHistory[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/history/search/';
            let body: any = {};
            if (filter !== null && filter !== undefined) {
                body = Object.assign(filter)
            }
            let option = this.getDefaultOptions();
            this.http.post(url, body, option).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public create(data: any): Promise<SearchHistory[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/history/';
            let body: any = {};
            if (data !== null && data !== undefined) {
                body = Object.assign(data)
            }
            let option = this.getDefaultOptions(); 
            this.http.post(url, body, option).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public getDefaultOptions(): any {
        let header = this.getDefaultHeader();
        let userId = this.authMgr.getCurrentUser(); 
        header = header.append('userId', userId ? userId.id : '')

        let httpOptions = {
            headers: header
        }; 

        return httpOptions;
    }

    public clearHistory(historyId: string, data: any): Promise<SearchHistory[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/history/' + historyId + '/clear/';
            let body: any = {};
            if (data !== null && data !== undefined) {
                body = Object.assign(data)
            }
            this.http.post(url, body).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
