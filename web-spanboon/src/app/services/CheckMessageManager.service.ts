/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ObservableManager } from './ObservableManager.service';
import { SearchFilter, User, Asset } from '../models/models';
import { AuthenManager } from './AuthenManager.service';
import { AbstractFacade } from './facade/AbstractFacade';

const PAGE_USER: string = 'pageUser';
const TOKEN_KEY: string = 'token';
const TOKEN_MODE_KEY: string = 'mode';
const MESSAGE_SUBJECT: string = 'authen.message';

@Injectable()
export class CheckMessageManager extends AbstractFacade {

    public static readonly TOKEN_KEY: string = TOKEN_KEY;
    public static readonly TOKEN_MODE_KEY: string = TOKEN_MODE_KEY;

    protected baseURL: string;
    protected http: HttpClient;
    protected user: any;
    protected observManager: ObservableManager;

    public time: number = 4;
    public interval;
    public subscribeTimer: any;
    public pageId: any;
    public roomId: any;

    constructor(http: HttpClient, observManager: ObservableManager, authMgr: AuthenManager) {
        super(http, authMgr);
        this.http = http;
        this.observManager = observManager;
        this.baseURL = environment.apiBaseURL;

        // create obsvr subject
        this.observManager.createSubject(MESSAGE_SUBJECT);
        this.observManager.subscribe('selected.page', (page: any) => {
            this.pageId = page;
        });
        this.observManager.subscribe('chatroom.id', (room: any) => {
            this.roomId = room;
        });
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.interval)
        this.interval = setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                if (this.time === 0) {
                    const id = this.authMgr.getCurrentUser() && this.authMgr.getCurrentUser().id;
                    let data = {
                        userId: id,
                        fetchUserRoom: true,
                        fetchPageRoom: true,
                    }
                    if (this.pageId !== '' && this.pageId !== undefined) {
                        Object.assign(data, { asPage: this.pageId })
                    }
                    if (this.roomId !== '' && this.roomId !== undefined) {
                        Object.assign(data, { roomId: this.roomId })
                    }
                    this.checkUnreadMessage(data);
                }
                this.time = 4;
            }
        }, 1000);
    }

    public checkUnreadMessage(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/chatroom/check_unread';
            let body: any = {};
            if (data !== null && data !== undefined) {
                body = Object.assign(data);
            }

            let options = this.authMgr.getDefaultOptions();

            this.http.post(url, body, options).toPromise().then((response: any) => {
                this.observManager.publish(MESSAGE_SUBJECT, response.data);
                resolve(response);
            }).catch((error: any) => {
                if (error.error.name === 'AccessDeniedError') {
                    this.authMgr.clearStorage();
                }
                reject(error);
            });
        });
    };

}
