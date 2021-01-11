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
export class FulfillFacade extends AbstractFacade {

    private message = new BehaviorSubject('');
    public sharedMessage = this.message.asObservable();

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public nextMessage(message: any) {
        this.message.next(message);
    }

    public listFulfillmentCase(status?: string, asPage?: string, orderBy?: any, groupBy?: any, filterType?: any, limit?: number, offset?: number): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/fulfillment_case/list";
            let queryParams: string = "";

            if (status !== null && status !== undefined && status !== "") {
                queryParams += "&status=" + status;
            }

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                queryParams += "&asPage=" + asPage;
            }

            if (orderBy !== null && orderBy !== undefined && orderBy !== "") {
                queryParams += "&orderBy=" + orderBy;
            }

            if (groupBy !== null && groupBy !== undefined && groupBy !== "") {
                queryParams += "&groupBy=" + groupBy;
            }

            if (filterType !== null && filterType !== undefined && filterType !== "") {
                queryParams += "&filterType=" + filterType;
            }

            if (limit !== null && limit !== undefined) {
                queryParams += "&limit=" + limit;
            }

            if (offset !== null && offset !== undefined) {
                queryParams += "&offset=" + offset;
            }

            if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
                queryParams = queryParams.substring(1, queryParams.length);
            }

            if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
                url += "?" + queryParams;
            }

            let options = this.getDefaultOptions();

            this.http.get(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public getFulfillmentCase(caseId: string, asPage?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/fulfillment_case/" + caseId;

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let options = this.getDefaultOptions();

            this.http.get(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public getFulfillmentRequest(caseId: string, asPage?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/fulfillment_case/" + caseId + "/request";

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let options = this.getDefaultOptions();

            this.http.get(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public createFulfillmentRequest(caseId: string, data: any, asPage?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/fulfillment_case/" + caseId + "/request";
            let body: any = {};

            if (data !== null && data !== undefined) {
                body = Object.assign(data);

                if (asPage !== null && asPage !== undefined && asPage !== "") {
                    body = Object.assign(data, { asPage });
                }
            }

            let options = this.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public getFulfillmentFromPost(postId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/fulfillment_case/post/' + postId;
            let options = this.getDefaultOptions();

            this.http.get(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public createFulfillmentCase(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/fulfillment_case';
            let body: any = {};

            if (data !== null && data !== undefined) {
                body = Object.assign(data)
            }

            let options = this.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public createFulfillmentPostFromCase(caseId: string, data: any, asPage?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/fulfillment_case/' + caseId + '/fulfill';

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let body: any = {};
            if (data !== null && data !== undefined) {
                body = Object.assign(data)
            }

            let options = this.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public confirmFulfillmentCase(caseId: string, asPage?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/fulfillment_case/' + caseId + '/confirm';

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let body: any = {};

            let options = this.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public cancelConfirmFulfillmentCase(caseId: string, asPage?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/fulfillment_case/' + caseId + '/confirm';

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let options = this.getDefaultOptions();

            this.http.delete(url, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public cancelFulfillmentCase(caseId: string, asPage?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + "/fulfillment_case/" + caseId + "/cancel";

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let body: any = {};

            let options = this.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public editFulfillmentRequest(caseId: string, requestId: string, data: any, asPage?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/fulfillment_case/' + caseId + "/request/" + requestId;

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let body: any = {};
            if (data !== null && data !== undefined) {
                body = Object.assign(data)
            }

            let option = this.getDefaultOptions();

            this.http.put(url, body, option).toPromise().then((response: any) => {
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public deletetFulfillmentRequest(caseId: string, requestId: string, asPage?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/fulfillment_case/' + caseId + "/request/" + requestId;

            if (asPage !== null && asPage !== undefined && asPage !== "") {
                url += "?asPage=" + asPage;
            }

            let options = this.getDefaultOptions();

            this.http.delete(url, options).toPromise().then((response: any) => {
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}