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
import { User } from '../models/models';
import { PageSoialFB } from '../models/models';
import { PageSocialTW } from '../models/models';
import { ActivatedRoute } from '@angular/router';
import { CookieUtil } from '../utils/CookieUtil';
import { GenerateUUIDUtil } from '../utils/GenerateUUIDUtil';

const PAGE_USER: string = 'pageUser';
const TOKEN_KEY: string = 'token';
const USER_MEMBERSHIP: string = 'membership';
const TOKEN_MODE_KEY: string = 'mode';
const REGISTERED_SUBJECT: string = 'authen.registered';
const TOKEN_FCM: string = 'tokenFCM';
const UUID: string = 'UUID';

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
  protected routeActivated: ActivatedRoute;

  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isTos: string;
  constructor(http: HttpClient, observManager: ObservableManager, routeActivated: ActivatedRoute) {
    this.http = http;
    this.observManager = observManager;
    this.baseURL = environment.apiBaseURL;
    this.facebookMode = false;
    this.twitterMode = false;
    this.googleMode = false;
    this.routeActivated = routeActivated;
    // create obsvr subject
    this.observManager.createSubject(REGISTERED_SUBJECT);
    this.observManager.createSubject('tos_ua_check');
  }

  public myBrowser() {
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
      return 'Opera';
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
      return 'Chrome';
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
      return 'Safari';
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
      return 'Firefox';
    } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.DOCUMENT_NODE == true)) {
      return 'IE';
    } else {
      return 'unknown';
    }
  }

  public getBrowserVersion() {
    var userAgent = navigator.userAgent, tem,
      matchTest = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(matchTest[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
      return 'IE ' + (tem[1] || '');
    }
    if (matchTest[1] === 'Chrome') {
      tem = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    matchTest = matchTest[2] ? [matchTest[1], matchTest[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = userAgent.match(/version\/(\d+)/i)) != null) matchTest.splice(1, 1, tem[1]);
    return matchTest.join(' ');
  }

  public login(username: string, password: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body: any = {
        username: username,
        password: password,
        tokenFCM: tokenFCM,
        deviceName: this.myBrowser(),
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
        localStorage.setItem(TOKEN_MODE_KEY, mode);
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(TOKEN_MODE_KEY, mode);

        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }


  public loginWithGoogle(idToken: string, authToken: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      const tokenFCM_GG = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body: any = {
        idToken,
        authToken,
        tokenFCM_GG,
        deviceName: this.myBrowser(),

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
          user: response.data.user
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
      let url: string = this.baseURL + '/login';
      const tokenFCM = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body: any = {
        twitterOauthToken: data.twitterOauthToken,
        twitterOauthTokenSecret: data.twitterOauthTokenSecret,
        twitterUserId: data.twitterUserId,
        tokenFCM: tokenFCM,
        deviceName: this.myBrowser(),
        email: res
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

  public loginMember(mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      let body: any = {};

      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });
      if (mode !== undefined || mode !== "") {
        headers = headers.set('mode', mode);
      }

      let httpOptions = {
        headers: headers
      };

      // const requestBody = {
      //   'grant_type': environment.memberShip.grantType,
      //   'client_id': environment.memberShip.clientId,
      //   'client_secret': environment.memberShip.clientSecret,
      //   'scope': environment.memberShip.scope
      // };

      // let url: string = environment.memberShip.webBaseURL + '/oauth/token';

      // let headers = new HttpHeaders({
      //   'Content-Type': 'application/json',
      // });

      // if (mode !== undefined || mode !== "") {
      //   headers = headers.set('mode', mode);
      // }

      // let httpOptions = {
      //   headers: headers
      // };

      this.http.post(url, body, httpOptions).toPromise().then((response: any) => {
        if (response) {
          this._getSSOAuth(response.data.access_token);
          resolve(response);
        }
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  private _getSSOAuth(token?: any) {
    return new Promise((resolve, reject) => {
      let url: string = environment.memberShip.webBaseURL + '/sso?';
      if (token !== undefined) {
        url += `client_id=${environment.memberShip.clientId}`;
      }
      if (token !== undefined) {
        url += `&token=${token}`;
      }

      let body: any = {};

      this.http.get(url, body).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public syncWithTwitter(twitter: PageSocialTW, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/sync/tw';
      let options = this.getDefaultOptions();
      let body: any = {
        "twitterOauthToken": twitter.twitterOauthToken,
        "twitterTokenSecret": twitter.twitterTokenSecret,
        "twitterUserId": twitter.twitterUserId,
        "twitterPageName": twitter.twitterPageName
      }
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    })
  }
  public syncWithFacebook(facebook: PageSoialFB, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/sync/fb';
      let options = this.getDefaultOptions();
      let body: any = {
        "facebookPageId": facebook.facebookPageId,
        "facebookPageName": facebook.facebookPageName,
        "pageAccessToken": facebook.pageAccessToken,
        "facebookCategory": facebook.facebookCategory
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public userIsSyncPage(isSyncpage: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/user/sync';
      let options = this.getDefaultOptions();
      let body: any = {
        "isSyncpage": isSyncpage,
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      })
    })
  }
  public loginWithFacebook(token: string, mode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      const tokenFCM_FB = localStorage.getItem('tokenFCM') ? localStorage.getItem('tokenFCM') : '';
      let body: any = {
        token: token,
        tokenFCM: tokenFCM_FB,
        deviceName: this.myBrowser(),
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
        console.log('error', error);
        reject(error);
      });
    });
  }

  public registerSocial(registSocial: User, mode?: string): Promise<any> {
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
        sessionStorage.removeItem(PAGE_USER);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public UserUA(tos: string, plc: string, date: any): Promise<any> {

    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/ua';
      let body = {
        "uaAcceptDate": date,
        "tosAcceptDate": date,
        "uaVersion": plc,
        "tosVersion": tos
      }

      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
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
    localStorage.removeItem(TOKEN_FCM);
    sessionStorage.removeItem(USER_MEMBERSHIP);
    localStorage.removeItem(USER_MEMBERSHIP);
  }

  public getDefaultOptions(id?: string): any {
    let header = this.getDefaultHeader();
    let userId = this.getCurrentUser();
    header = header.append('userid', userId ? userId.id : id ? id : '')

    let httpOptions = {
      headers: header
    };

    return httpOptions;
  }

  public getDefaultHeader(): HttpHeaders {
    //getCookie UUID
    let uuid: any = CookieUtil.getCookie(UUID);

    if (uuid === null || uuid === undefined) {
      uuid = GenerateUUIDUtil.getUUID();
      CookieUtil.setCookie(UUID, uuid);
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + this.getToken().token,
      'Client-Id': uuid,
    });

    if (this.getToken().mode === "FB" || this.getToken().mode === "TW" || this.getToken().mode === "GG") {
      headers = headers.set('mode', this.getToken().mode);
    } else {
      headers = headers.set('mode', 'EMAIL');
    }

    return headers;
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
          localStorage.setItem(USER_MEMBERSHIP, JSON.stringify(result.user.membership));
          sessionStorage.setItem(USER_MEMBERSHIP, JSON.stringify(result.user.membership));
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
    let tokenS = sessionStorage.getItem(TOKEN_KEY);
    let tokenL = localStorage.getItem(TOKEN_KEY);
    let user;
    if (this.user) {
      user = this.user;
    } else {
      user = JSON.parse(sessionStorage.getItem(PAGE_USER));
      if (!user) {
        user = JSON.parse(localStorage.getItem(PAGE_USER));
      }
    }
    if (tokenS === '' && tokenS === null && tokenS === undefined) {
      sessionStorage.setItem('token', tokenL);
    } else if (tokenL === '' && tokenL === null && tokenL === undefined) {
      this.logout(user);
    }

    return user;
  }

  public getUserMember(): any {
    let member = localStorage.getItem(USER_MEMBERSHIP);
    if (member === "false") {
      return false;
    } else {
      return true;
    }
  }

  public getToken(): any {
    let val: any = {};
    let token = localStorage.getItem(TOKEN_KEY);
    let mode = localStorage.getItem(TOKEN_MODE_KEY);
    val["token"] = token;
    val["mode"] = mode;

    return val;
  }

  public getParams(param: string): any {
    return new Promise(resolve => {
      this.routeActivated.queryParams.subscribe(params => {
        resolve(params[param]);
      });
    });
  }

  public getHidebar(): boolean {
    let isCheck: boolean = false;
    this.routeActivated.queryParams.subscribe(params => {
      let hidebars = params['hidebar'];
      let mfpapp = params['mfpapp'];
      if (hidebars === 'true' || mfpapp === 'true') {
        localStorage.setItem('hidebar', "true");
        isCheck = false;
      } else {
        localStorage.removeItem('hidebar');
        isCheck = true;
      }
    });

    return isCheck;
  }

  public setHidebar() {
    let hidebar = localStorage.getItem('hidebar');
    let mfpapp = localStorage.getItem('mfpapp');
    if (hidebar === "true" || mfpapp === "true") {
      return false;
    } else {
      return true;
    }
  }

  public getPolicy() {
    const plc = this.user.uaVersion;
    if (!!plc) {
      return plc;
    } else {
      return null;
    }
  }

  public setPolicy(policy: string) {
    const tos = this.isTos;
    const plc = policy;
    const date = new Date();
    if (!!tos && !!plc) {
      this.UserUA(tos, plc, date).then((res) => {
        if (res) {
          this.observManager.publish('tos_ua_check', true);
        }
      }).catch((err) => {
        if (err) {
        }
      })
    }
  }

  public checkVersionPolicy(version: string, user: any): boolean {
    let users = JSON.parse(localStorage.getItem('pageUser'));
    this.user = user ? user : users;
    if (this.getPolicy() === version) {
      return true;
    } else {
      return false;
    }
  }

  public getTos(): string {
    const tos = this.user.tosVersion;
    if (!!tos) {
      return tos;
    } else {
      return null;
    }
  }

  public setTos(tos: string) {
    this.isTos = 'v2';
  }

  public checkVersionTos(version: string, user: any): boolean {
    let users = JSON.parse(localStorage.getItem('pageUser'));
    this.user = user ? user : users;
    if (this.getTos() === version) {
      return true;
    } else {
      return false;
    }
  }

  // return current login user admin status
  public isAdminUser(): boolean {
    return false;
  }

  // public getUserToken(): string {
  //   return this.token;
  // }

  // public isFacebookMode(): boolean {
  //   return this.facebookMode;
  // }
  // public isTwitterMode(): boolean {
  //   return this.twitterMode;
  // }
  // public isGoogleMode(): boolean {
  //   return this.googleMode;
  // }
}
