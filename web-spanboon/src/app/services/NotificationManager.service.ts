/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { ObservableManager } from './ObservableManager.service';
import { AbstractFacade } from './facade/AbstractFacade';
import { AuthenManager } from './AuthenManager.service';
import { NotificationFacade } from './facade/NotificationFacade.service';


@Injectable()
export class NotificationManager extends AbstractFacade {

    public static readonly USER_NOTIFICATION_SUBJECT: string = 'user.notification';

    private notificationMap: any; // key = userId & value = array
    protected baseURL: string;
    protected http: HttpClient;
    protected observManager: ObservableManager;
    protected notificationFacade: NotificationFacade;

    constructor(http: HttpClient, authMgr: AuthenManager, observManager: ObservableManager, notificationFacade: NotificationFacade) {
        super(http, authMgr);
        this.http = http;
        this.baseURL = environment.apiBaseURL;
        this.observManager = observManager;
        this.notificationMap = {};
        this.notificationFacade = notificationFacade;
    }

    private createSubject(userId: string): Subject<any> {
        const userSubjectName = this.getUserSubjectName(userId);

        let subject = this.observManager.getSubject(userSubjectName);
        if (subject !== undefined) {
            return subject;
        }

        subject = this.observManager.createSubject(userSubjectName);
        this.notificationMap[userId] = [];

        return subject;
    }

    private getSubject(userId: string): Subject<any> {
        const userSubjectName = this.getUserSubjectName(userId);

        return this.observManager.createSubject(userSubjectName);
    }

    private getUserSubjectName(userId: string): string {
        return NotificationManager.USER_NOTIFICATION_SUBJECT + '.' + userId;
    }

    private subscribe(userId: string, handler: any, errorHandler?: any, completeHandler?: any): Subscription {
        if (userId === undefined || userId === '') {
            throw 'User Id is Required';
        }

        const userSubject = this.getUserSubjectName(userId);
        return this.observManager.subscribe(userSubject, handler, errorHandler, completeHandler);
    }

    private unsubscribe(userId: string): void {
        if (userId === undefined || userId === '') {
            throw 'User Id is Required';
        }

        const userSubject = this.getUserSubjectName(userId);
        const subject = this.getSubject(userSubject);
        if (subject !== undefined) {
            subject.unsubscribe();
        }
    }

    public subscribeCurrentUser(handler: any, errorHandler?: any, completeHandler?: any): Subscription {
        const currentUser = this.authMgr.getCurrentUser();

        if (currentUser === undefined) {
            throw 'Current User was not found';
        }

        return this.subscribe(currentUser.id, handler, errorHandler, completeHandler);
    }

    public unSubscribeCurrentUser(): void {
        const currentUser = this.authMgr.getCurrentUser();

        if (currentUser === undefined) {
            throw 'Current User was not found';
        }

        this.unsubscribe(currentUser.id);
    }

    public getCurrentUserNotification(): any[] {
        const currentUser = this.authMgr.getCurrentUser();

        if (currentUser === undefined) {
            throw 'Current User was not found';
        }

        const userId = currentUser.id;
        if (this.notificationMap[userId] === undefined) {
            return [];
        }

        return this.notificationMap[userId];
    }

    public loadCurrentUserNotification(): Promise<any> {
        const currentUser = this.authMgr.getCurrentUser(); 
        
        if (currentUser === undefined) {
            throw 'Current User was not found';
        }

        const userId = currentUser && currentUser.id;
        this.notificationMap[userId] = [];

        return new Promise((resolve: any, reject: any) => {
            this.notificationFacade.listNotification().then((result: any) => {
                // if (result.data !== undefined) {
                //     this.notificationMap[userId] = result.data;
                // }

                resolve(result);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public clearCurrentUserNotification(): void {
        const currentUser = this.authMgr.getCurrentUser();

        if (currentUser === undefined) {
            throw 'Current User was not found';
        }

        const userId = currentUser && currentUser.id;
        if (this.notificationMap[userId] === undefined) {
            return;
        }

        this.notificationMap[userId] = [];
    }
}
