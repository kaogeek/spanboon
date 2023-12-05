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
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { tap } from "rxjs/operators";
import { ObservableManager } from "../ObservableManager.service";
import { LoginPage } from "src/app/components/components";
import { environment } from "src/environments/environment";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
const PAGE_USER: string = 'pageUser';
const TOKEN_KEY: string = 'token';
const TOKEN_MODE_KEY: string = 'mode';
const REGISTERED_SUBJECT: string = 'authen.registered';

@Injectable()
export class CheckMergeUserFacade extends AbstractFacade {

  public router: Router;
  public redirection: string;
  public loginPage: LoginPage;
  protected baseURL: string;
  protected http: HttpClient;
  protected token: string;
  protected user: any;
  protected facebookMode: boolean;
  protected twitterMode: boolean;
  protected googleMode: boolean;
  protected observManager: ObservableManager;

  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;
  constructor(http: HttpClient, authMgr: AuthenManager,
    observManager: ObservableManager,
  ) {
    super(http, authMgr);
    this.http = http;
    this.observManager = observManager;
    this.baseURL = environment.apiBaseURL;
    this.facebookMode = false;
    this.twitterMode = false;
    this.googleMode = false;
    // create obsvr subject
    this.observManager.createSubject(REGISTERED_SUBJECT);


  }

  // check merge user
  public checkMergeUser(mode: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';

      let url: string = this.baseURL + '/check_email_user';
      let body;
      if (mode === 'MFP') {
        body = {
          "email": data.email,
          "identification_number": data.identification_number,
          "id": data.id,
          "mobile": data.mobile,
          "tokenFCM": tokenFCM
        }
        // body = {
        //   "email": data.email,
        //   "created_at": data.created_at,
        //   "updated_at": data.updated_at,
        //   "id": data.id,
        //   "mobile": data.mobile,
        // }
      } else {
        body = {
          "email": data.email,
          "password": data.password,
          "tokenFCM": tokenFCM
        };
      }

      let headers = new HttpHeaders({
        "mode": mode
      });

      let httpOptions = {
        headers: headers
      };

      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        let result: any = {
          token: response.data.token,
          user: response.data.user,
          data: response
        };

        this.token = result.token;
        this.user = result.user;
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(TOKEN_MODE_KEY, undefined);
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(TOKEN_MODE_KEY, undefined);

        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  };

  public confirmMergeOtp(email: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/send_otp';
      let body: any = {
        "email": email
      };

      let headers = this.getDefaultHeader();

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
  public loginWithFacebook(token: string, mode?: string, res?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/check_email_user';
      let body: any = {
        "token": token,
        "mode": mode,
        "email": res
      };
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }
      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        let result: any = {
          token: response.data.token,
          user: response.data.user,
          data: response,
          pic: response.picture ? response.picture[0] : ''
        };

        this.token = result.token;
        this.user = result.user;
        this.facebookMode = true;

        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(TOKEN_MODE_KEY, 'FB');
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(TOKEN_MODE_KEY, 'FB');

        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public loginWithGoogle(idToken: string, authToken: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/check_email_user';
      let body: any = {
        idToken,
        authToken,
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = { headers };

      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        let result: any = {
          token: response.data.token,
          user: response.data.user,
          data: response,
          pic: response.picture ? response.picture[0] : ''
        };

        this.token = result.token;
        this.user = result.user;
        this.googleMode = true;


        localStorage.setItem(TOKEN_KEY, this.token);
        localStorage.setItem(TOKEN_MODE_KEY, 'GG');
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(TOKEN_MODE_KEY, 'GG');

        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public loginWithTwitter(data: any, mode?: string, res?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/check_email_user';
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';

      let body: any = {
        "twitterOauthToken": data.twitterOauthToken,
        "twitterOauthTokenSecret": data.twitterOauthTokenSecret,
        "twitterUserId": data.twitterUserId,
        "tokenFCM": tokenFCM,
        "deviceName": "Chrome",
        "email": res
      };

      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }
      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {

        let result: any = {
          token: response.data.token,
          user: response.data.user,
          data: response,
          pic: response.picture ? response.picture[0] : ''
        };

        this.token = result.token;
        this.user = result.user;
        this.twitterMode = true;

        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(TOKEN_MODE_KEY, 'TW');
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(TOKEN_MODE_KEY, 'TW');
        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  // check merge user
  public checkOtp(email: any, otp: number, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/check_otp';
      let body: any = {
        "email": email,
        "otp": Number(otp),
        "authToken": mode
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  };
  public checkOtpGG(email: any, idToken?: string, authToken?: string, otp?: number, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/check_otp';
      let body: any = {
        "email": email,
        "otp": Number(otp),
        "idToken": idToken,
        "authToken": authToken
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  };
  public checkOtpTW(data: any, email: any, otp?: number, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/check_otp';
      let body: any = {
        "twitterOauthToken": data.twitterOauthToken,
        "twitterOauthTokenSecret": data.twitterOauthTokenSecret,
        "twitterUserId": data.twitterUserId,
        "email": email,
        "otp": Number(otp)
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  };
  public checkOtpFB(email: any, facebookObject: any, otp: number, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/check_otp';
      let body: any = {
        "email": email,
        "facebook": facebookObject,
        "otp": Number(otp),
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }
      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  };
  public checkAccountStatus(token: string, mode?: string, options?: any): Promise<any> {
    if (token === undefined || token === null || token === '') {
      throw 'Token is required.';
    }
    return new Promise((resolve, reject) => {
      let isUpdateUser = false;
      if (options !== undefined && options !== null) {
        isUpdateUser = options.updateUser;
      }

      if (mode === "TW") {
        token = token.replace(/&/gi, ';');
      }

      let url: string = this.baseURL + '/check_status?token=' + token;
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });
      let fbMode = false;
      let twMode = false;
      let ggMode = false;
      if (mode && mode === 'FB') {
        fbMode = true;
        headers = headers.set('mode', mode);
      } else if (mode && mode === 'TW') {
        twMode = true;
        headers = headers.set('mode', mode);
      } else if (mode && mode === 'GG') {
        ggMode = true;
        headers = headers.set('mode', mode);
      }

      let httpOptions = {
        headers: headers,
      };
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        if (mode === "TW") {
          token = token.replace(/;/gi, '&');
        }
        let result: any = {
          token: response.data.token,
          user: response.data.user
        };

        if (response.data.mode === 'FB') {
          fbMode = true;
          this.facebookMode = true;
        }
        if (response.data.mode === 'GG') {
          ggMode = true;
          this.googleMode = true;
        }

        if (isUpdateUser) {
          this.token = result.token;
          this.user = result.user;
          this.facebookMode = fbMode;
          this.twitterMode = twMode;
          this.googleMode = ggMode;
          localStorage.setItem(PAGE_USER, JSON.stringify(result.user));
          sessionStorage.setItem(PAGE_USER, JSON.stringify(result.user));
          localStorage.setItem(TOKEN_KEY, result.token);
          sessionStorage.setItem(TOKEN_KEY, result.token);
          if (fbMode) {
            localStorage.setItem(TOKEN_MODE_KEY, 'FB');
            sessionStorage.setItem(TOKEN_MODE_KEY, 'FB');
          } else if (twMode) {
            localStorage.setItem(TOKEN_MODE_KEY, 'TW');
            sessionStorage.setItem(TOKEN_MODE_KEY, 'TW');
          } else if (ggMode) {
            localStorage.setItem(TOKEN_MODE_KEY, 'GG');
            sessionStorage.setItem(TOKEN_MODE_KEY, 'GG');
          } else {
            localStorage.removeItem(TOKEN_MODE_KEY);
            sessionStorage.removeItem(TOKEN_MODE_KEY);
          }
        }
        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public getDefaultOptions(): any {
    let header = this.getDefaultHeader();

    let httpOptions = {
      headers: header
    };

    return httpOptions;
  }

  public getDefaultHeader(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + this.getUserToken()
    });
    if (this.isFacebookMode()) {
      headers = headers.set('mode', 'FB');
    } else if (this.isTwitterMode()) {
      headers = headers.set('mode', 'TW');
    } else if (this.isGoogleMode()) {
      headers = headers.set('mode', 'GG');
    }
    return headers;
  }
  public getCurrentUser(): any {
    let user;
    if (this.user) {
      user = this.user;
    } else {
      user = JSON.parse(sessionStorage.getItem(PAGE_USER));
      if (!user) {
        user = JSON.parse(localStorage.getItem(PAGE_USER));
      }
    }
    return user;
  }

  // return current login user admin status
  public isAdminUser(): boolean {
    return false;
  }

  public getUserToken(): string {
    return this.token;
  }

  public isFacebookMode(): boolean {
    return this.facebookMode;
  }
  public isTwitterMode(): boolean {
    return this.twitterMode;
  }
  public isGoogleMode(): boolean {
    return this.googleMode;
  }
}
