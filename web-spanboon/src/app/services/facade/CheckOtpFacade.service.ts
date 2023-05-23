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
import { LoginPage } from "src/app/components/components";
import { Router } from "@angular/router";

@Injectable()
export class CheckOtpFacade extends AbstractFacade {
    public router: Router;
    public redirection: string;
    public loginPage: LoginPage;

    constructor(http: HttpClient, authMgr: AuthenManager,
    ) {
        super(http, authMgr);
    }

    // check merge user
    public checkOtp(email: any, otp: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
            let url: string = this.baseURL + '/check_otp';
            let body: any = {
                "email": email,
                "otp": Number(otp),
                "tokenFCM": tokenFCM
            };
            let headers = new HttpHeaders({
                "Access-Control-Allow-Origin": "http://localhost:4300",
                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                // "Access-Control-Request-Method": "GET,PUT,OPTIONS,POST",
                "mode": "EMAIL"
            });

            let httpOptions = {
                headers: headers
            };

            this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    };
}
