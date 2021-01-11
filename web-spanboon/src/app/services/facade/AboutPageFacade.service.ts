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
import { AboutPages, SearchFilter } from '../../models/models'; 

@Injectable()
export class AboutPageFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public create(id: string , aboutPage : AboutPages[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/page/' + id + '/about'; 
            let body: any = {}; 

            if(aboutPage !== null && aboutPage !== undefined){
                body = Object.assign(aboutPage);
            }
            let options = this.getDefaultOptions();

            this.http.post(url, body , options).toPromise().then((response: any) => {
                resolve(response.data as AboutPages[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    } 

    public search(searchFilter : SearchFilter): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/page_about/search'; 
            let body: any = {}; 

            if(searchFilter !== null && searchFilter !== undefined){
                body = Object.assign(searchFilter);
            }
            let options = this.getDefaultOptions();

            this.http.post(url, body , options).toPromise().then((response: any) => {
                resolve(response.data as AboutPages[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public searchPageAbout(pageId: string, offset?: number, limit?: number): Promise<any[]> {
        let searchFilter = new SearchFilter;
        searchFilter.whereConditions = {
            pageId : pageId
        };
        searchFilter.offset = offset;
        searchFilter.limit = limit;

        return this.search(searchFilter);
    }
}
