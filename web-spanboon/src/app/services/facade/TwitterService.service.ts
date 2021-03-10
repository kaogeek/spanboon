/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as oauthSignature from 'oauth-signature';
import { environment } from '../../../environments/environment';
import { AbstractFacade } from './AbstractFacade';
import { AuthenManager } from '../AuthenManager.service'; 

const twitterObj = {
    consumerKey: environment.consumerKeyTwitter,
    consumerSecret: environment.consumerSecretTwitter,
    accessToken: environment.accessTokenTwitter,
    accessTokenSecret: environment.accessTokenSecretTwitter,
};

@Injectable()
export class TwitterService extends AbstractFacade {

    protected http: HttpClient;
    protected oauthToken: string;
    protected oauthTokenSecret: string;
    protected oauthCallbackConfirm: string;

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
        this.http = http;
    }

    /*
    * https://api.twitter.com/oauth/request_token 
    */
    // 1. request for token  
    public requestToken(callback: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/twitter/request_token?callback=' + callback;
            let option = this.getDefaultOptions();
            let httpOptions: any = {
                headers: option,
                responseType: 'text'
            };

            this.http.post(url, {}, httpOptions).toPromise().then((result: any) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    public getAcessToKen(accessTokenLink: string) {
        let url: string = this.baseURL + '/twitter/access_token' + accessTokenLink;
        let option = this.getDefaultOptions();
        let httpOptions: any = {
            headers: option,
            responseType: 'text'
        };

        return new Promise((resolve, reject) => {
            this.http.get(url, httpOptions).toPromise().then((result: any) => {
                resolve(result);
            }).catch((error) => {
                console.log(error);
                reject(error);
            });
        });
    }

    /*
   * https://api.twitter.com/1.1/account/verify_credentials.json
   */
    // 1. token for information
    public accountVerify(data: any): Promise<any> {
        let url: string = this.baseURL + '/twitter/account_verify';
        let option = this.getDefaultOptions();
        let httpOptions: any = {
            headers: option,
            responseType: 'json'
        };  
        let body = {};
        if(data !== undefined && data !== null){
            body = Object.assign(data);
        }  
        return new Promise((resolve, reject) => {
            this.http.post(url, body, httpOptions).toPromise().then((result: any) => {
                resolve(result);
            }).catch((error) => {
                console.log(error);
                reject(error);
            });
        });
    } 

    public genNonce() {
        const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~'
        const result = [];
        window.crypto.getRandomValues(new Uint8Array(32)).forEach(c =>
            result.push(charset[c % charset.length]));
        return result.join('');
    }

}
