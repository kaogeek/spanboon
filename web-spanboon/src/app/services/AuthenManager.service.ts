/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * 
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ObservableManager } from './ObservableManager.service';
import { SearchFilter, User, Asset } from '../models/models';
import { BaseLoginProvider, SocialUser } from 'angularx-social-login';
import { resolve } from 'url';


const PAGE_USER: string = 'pageUser';
const TOKEN_KEY: string = 'token';
const TOKEN_MODE_KEY: string = 'mode';
const REGISTERED_SUBJECT: string = 'authen.registered';

// only page user can login
@Injectable()
export class AuthenManager {
  
  public static readonly TOKEN_KEY: string = TOKEN_KEY;
  public static readonly TOKEN_MODE_KEY: string = TOKEN_MODE_KEY;

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
  constructor(http: HttpClient, observManager: ObservableManager) {
    this.http = http;
    this.observManager = observManager;
    this.baseURL = environment.apiBaseURL;
    this.facebookMode = false;
    this.twitterMode = false;
    this.googleMode = false;
    // create obsvr subject
    this.observManager.createSubject(REGISTERED_SUBJECT);

  }

  public login(username: string, password: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body: any = {
        "username": username,
        "password": password,
        "tokenFCM": tokenFCM,
        "deviceName": "Chrome",
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });

      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = {
        headers: headers
      };

      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {

        let result: any = {
          token: response.data.token,
          user: response.data.user
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
  }


  public loginWithGoogle(idToken: string, authToken: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body: any = { idToken, authToken,
        "tokenFCM": tokenFCM,
        "deviceName": "Chrome",
       };
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = { headers };

      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        let result: any = {
          token: response.data.token,
          user: response.data.user
        };

        this.token = result.token;
        this.user = result.user;
        this.googleMode = true;

        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(TOKEN_MODE_KEY, 'GG');
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(TOKEN_MODE_KEY, 'GG');

        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public loginWithTwitter(data: any, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body: any = {
        "tokenFCM": tokenFCM,
        "deviceName": "Chrome",
      };
      if (data !== null && data !== undefined) {
        body = Object.assign(data);
      }
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {

        let result: any = {
          token: response.data.token,
          user: response.data.user
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


  public loginWithFacebook(token: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      let body: any = {
        "token":token
      };
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }
      let httpOptions = { headers };
      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        console.log('response',response.data.user);
        let result: any = {
          token: response.data.token,
          user: response.data.user
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
        console.log('error',error);
        reject(error);
      });
    });
  }

  public loginWithFacebookTest(token: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login/test';
      let body: any = {
        "token": token
      };

      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });

      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = {
        headers: headers
      };

      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        let result: any = {
          token: response.data.token,
          user: response.data.user
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

  public registerSocial(registSocial: User, mode?: string): Promise<any> {
    console.log('registSocial',registSocial);
    if (registSocial === undefined || registSocial === null) {
      throw 'RegisterSocial is required.';
    }

    if (mode === 'facebook') {
      if (registSocial.fbToken === undefined || registSocial.fbToken === '') {
        throw 'Facebook Token is required.';
      }
    } else if (mode === 'google') {
      if (registSocial.authToken === undefined || registSocial.authToken === '') {
        throw 'Google Token is required.';
      }
    } else if (mode === 'twitter') {
      if (registSocial.twitterTokenSecret === undefined || registSocial.twitterTokenSecret === '') {
        throw 'Twitter Token is required.';
      }
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (mode !== undefined || mode !== "") {
      headers = headers.set('mode', mode);
    }

    let httpOptions = {
      headers: headers
    };

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/register';

      this.http.post(url, registSocial, httpOptions).toPromise().then((response: any) => {

        if (response.data !== null && response.data !== undefined) {
          let result: any = {
            token: response.data.token,
            user: response.data.user,
            status: response.status
          };

          this.token = result.token;
          this.user = result.user;

          let social: string;
          if (mode === 'FACEBOOK') {
            social = 'FB';
            this.facebookMode = true;
          } else if (mode === 'TWITTER') {
            social = 'TW';
            this.twitterMode = true;
          } else if (mode === 'GOOGLE') {
            social = 'GG';
          }
          localStorage.setItem(PAGE_USER, JSON.stringify(result.user));
          sessionStorage.setItem(PAGE_USER, JSON.stringify(result.user));
          localStorage.setItem(TOKEN_KEY, result.token);
          localStorage.setItem(TOKEN_MODE_KEY, social);
          sessionStorage.setItem(TOKEN_KEY, result.token);
          sessionStorage.setItem(TOKEN_MODE_KEY, social);

          this.observManager.publish(REGISTERED_SUBJECT, result);

          resolve(result);
        } else {
          resolve(response);
        }

      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public register(registEmail: any, mode?: string): Promise<any> {

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/register';

      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });

      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = {
        headers: headers
      };

      this.http.post(url, registEmail, httpOptions).toPromise().then((response: any) => {
        resolve(response);
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


  public logout(user: any): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + "/user/logout";
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body = {
        "tokenFCM": tokenFCM
      };
      // if(user !== null && user !== undefined){
      //   body = Object.assign(user);
      // }
      // !implement logout from API 
      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);

        // reset token
        this.token = undefined;
        this.user = undefined;
        this.facebookMode = false;
        this.twitterMode = false;
        this.googleMode = false;
        this.clearStorage();

      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public clearStorage(): void {
    this.token = undefined;
    this.user = undefined;
    localStorage.removeItem(PAGE_USER);
    sessionStorage.removeItem(PAGE_USER);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_MODE_KEY);
    sessionStorage.removeItem(TOKEN_MODE_KEY);
  }

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

        if (isUpdateUser) {
          this.token = result.token;
          this.user = result.user;
          this.facebookMode = fbMode;
          this.twitterMode = twMode;
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

  // return current login
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
