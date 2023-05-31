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
import { Today } from "../../models/Today";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class TodayPageFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public create(body: Today): Promise<Today> {
        if (body === undefined || body === null) {
            new Error("body is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/processor';
            let options = this.getDefaultOptions();
            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public edit(id: any, body: Today): Promise<Today> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/processor';
            let options = this.getDefaultOptions();
            this.http.put(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public editSelect(id: any, body: any): Promise<Today> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/processor/select/' + id;
            let options = this.getDefaultOptions();
            this.http.put(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        })
    }

    public find(name: string): Promise<Today> {
        if (name === undefined || name === null || name === '') {
            new Error("Name is required.");
        }

        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/processor/' + name;

            this.http.get(url).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public search(searchFilter: SearchFilter): Promise<Today[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/receive/bucket';
            let body: any = {
                'count': searchFilter.count,
                'limit': searchFilter.limit,
                'offset': searchFilter.offset,
                'orderBy': { 'createdDate': -1 },
                'relation': searchFilter.relation,
                'whereConditions': searchFilter.whereConditions
            };
            if (searchFilter !== null && searchFilter !== undefined) {
                body = Object.assign(searchFilter)
            }
            let options = this.getDefaultOptions();
            this.http.post(url, body,options).toPromise().then((response: any) => {
                for (let r of response.data) {
                    if (r.coverPageURL != null && r.coverPageURL != undefined) {
                        this.getPathFile(r.coverPageURL).then((res: any) => {
                            r.image = res.data
                        }).catch((err: any) => {
                        });
                    }
                }
                resolve(response.data as Today[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public searchObject(type: any, field: any, text: any, bucket?: object): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/request/search';
            let body: any = {
                'type': type,
                'field': field,
                'keyword': text,
                'values': bucket
            }
            this.http.post(url, body).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public searchComp(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/edit/search';
            let body = data;
            this.http.post(url, body).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public getProvince() {
        return new Promise((resolve, reject) => {
            let url: string = "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json";
            let data = [];
            this.http.get(url).toPromise().then((response: any) => {
                for (let index = 0; index < response.length; index++) {
                    const element = response[index].province;
                    data.push(element)
                }
                var dataProvince = data.filter(function (elem, index, self) {
                    return index === self.indexOf(elem);
                });
                resolve(dataProvince);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public delete(id: any): Promise<Today[]> {
        if (id === undefined || id === null) {
            new Error("Id is required.");
        }
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/' + id + '/processor/';
            let options = this.getDefaultOptions();
            this.http.delete(url, options).toPromise().then((response: any) => {
                resolve(response.data as Today[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
