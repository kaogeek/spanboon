/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthenManager } from '../AuthenManager.service';
import { ActivatedRoute } from '@angular/router';

export abstract class AbstractFacade {

  protected baseURL: string;
  protected http: HttpClient;
  protected authMgr: AuthenManager;
  protected route: ActivatedRoute;

  public hidebar: boolean = true;

  constructor(http: HttpClient, authMgr: AuthenManager, baseURL?: string, route?: ActivatedRoute) {
    this.http = http;
    this.baseURL = baseURL;
    this.authMgr = authMgr;
    this.route = route;

    if (this.baseURL === undefined || this.baseURL === null) {
      this.baseURL = environment.apiBaseURL;
    }
  }

  public getHttp(): HttpClient {
    return this.http;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }
}
