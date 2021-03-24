/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AbstractFacade } from './facade/AbstractFacade';
import { AuthenManager } from './AuthenManager.service';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_ACTION } from '../UserTypeEngagement';

// only page user can login
@Injectable()
export class Engagement extends AbstractFacade {

    protected baseURL: string;
    protected http: HttpClient;

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
        this.http = http;
        this.baseURL = environment.apiBaseURL;
    }

    public getDom(event: any) { 
        return event.target.outerHTML || event.srcElement.outerHTML || event.currentTarget.outerHTML;
    } 

    public getEngagement(event: any, id: string, contentType: string) {
        return {
            dom: this.getDom(event),
            contentId: id,
            contentType: contentType,
        }

    }

    public checkAction(contentType: string) {
        let action;
        if (contentType === "profile") {
            contentType = "USER";
            action = ENGAGEMENT_ACTION.CLICK;
        } else if (contentType === "page") {
            contentType = "PAGE";
            action = ENGAGEMENT_ACTION.CLICK;
        } else if (contentType === "post") {
            contentType = "POST";
            action = ENGAGEMENT_ACTION.CLICK;
        } else if (contentType === "fulfillment") {
            contentType = "POST";
            action = ENGAGEMENT_ACTION.FULFILLMENT;
        } else if (contentType === "objective") {
            contentType = "OBJECTIVE";
            action = ENGAGEMENT_ACTION.CLICK;
        } else if (contentType === "emergency") {
            contentType = "EMERGENCY_EVENT";
            action = ENGAGEMENT_ACTION.CLICK;
        } else if(contentType === 'hashTag'){
            contentType = "HASHTAG";
            action = ENGAGEMENT_ACTION.CLICK;
        }
        return {
            contentType: contentType,
            action: action
        };
    }

    public engagementPost(contentType: string, contentId: string, reference: string) {
        const dataEngagement = new UserEngagement();
        dataEngagement.contentId = contentId;
        dataEngagement.contentType = this.checkAction(contentType).contentType;
        dataEngagement.action = this.checkAction(contentType).action;
        dataEngagement.reference = reference;
        return dataEngagement;
    }

    public engagementStory(contentType: string, contentId: string, reference: string) {
        const dataEngagement = new UserEngagement();
        dataEngagement.contentId = contentId;
        dataEngagement.contentType = contentType;
        // dataEngagement.action = action;
        dataEngagement.reference = reference;
        return dataEngagement;
    }


}
