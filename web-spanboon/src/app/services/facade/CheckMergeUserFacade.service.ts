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
import { Observable, Subject,BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";

import { LoginPage } from "src/app/components/components";

import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";


@Injectable()
export class CheckMergeUserFacade extends AbstractFacade {

    public router: Router;
    public redirection: string;
    public loginPage: LoginPage;


  constructor(http: HttpClient, authMgr: AuthenManager,
    ) {
    super(http, authMgr);

    
  }

  // check merge user
  public checkMergeUser(mode: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';

      let url: string = this.baseURL + '/check_email_user';
      let body: any = {
        "email": data.email,
        "password": data.password,
        "tokenFCM": tokenFCM
      };

      let headers = new HttpHeaders({
        "Access-Control-Allow-Origin": "http://localhost:4300",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        // "Access-Control-Request-Method": "GET,PUT,OPTIONS,POST",
        "mode": mode
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

  public checkMergeUserFB(mode: string, data: any,tokenFCM_FB): Promise<any> {
    return new Promise((resolve, reject) => {
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';

      let url: string = this.baseURL + '/check_email_user';
      let body: any = {
        "token": data,
        tokenFCM_FB
      };

      let headers = new HttpHeaders({
        "Access-Control-Allow-Origin": "http://localhost:4300",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        // "Access-Control-Request-Method": "GET,PUT,OPTIONS,POST",
        "mode": mode
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
