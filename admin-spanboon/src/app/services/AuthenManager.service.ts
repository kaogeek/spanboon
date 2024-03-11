/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

// only page user can login
@Injectable()
export class AuthenManager {

  protected baseURL: string;
  protected http: HttpClient;
  protected token: string;
  protected user: any;

  constructor(http: HttpClient) {
    this.http = http;
    this.baseURL = environment.apiBaseURL;
  }

  public login(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login';
      let body: any = {
        "username": username,
        "password": password,
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
        let result: any = {
          token: response.data.token,
          user: response.data.user
        };
        // console.log('response.data.user', response.data.user)
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", result.user);
        this.token = result.token;
        this.user = result.username;

        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public loginAdmin(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/login/admin';
      let body: any = {
        "username": username,
        "password": password,
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
        let result: any = {
          token: response.data.token,
          user: response.data.user
        };
        // console.log('response.data.user', response.data.user)
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", result.user);
        this.token = result.token;
        this.user = result.username;

        resolve(result);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      // !implement logout from API

      // reset token
      this.token = undefined;
      this.user = undefined;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      // resolve();
    });
  }

  public createUserWithEmailAndPassword(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // resolve();
    });
  }

  // ! implement token check
  public isTokenValid(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  // return current login
  public getCurrentUser(): any {
    return sessionStorage.getItem("user");
  }

  // return current login
  public isCurrentUserType(): boolean {
    return sessionStorage.getItem("rootAdmin") === "1" ? true : false;
  }

  // return current login user admin status
  public isAdminUser(): boolean {
    return false;
  }

  public getUserToken(): string {
    // console.log("token "+sessionStorage.getItem("token"));
    // return this.token;
    return sessionStorage.getItem("token");
  }
}
