/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Config } from '../models/models';
import { AbstractFacade } from './facade/AbstractFacade';
import { AuthenManager } from './AuthenManager.service';

const TOKEN_KEY: string = 'token';
const TOKEN_MODE_KEY: string = 'mode';

// only page user can login
@Injectable()
export class CacheConfigInfo extends AbstractFacade {

  public static readonly TOKEN_KEY: string = TOKEN_KEY;
  public static readonly TOKEN_MODE_KEY: string = TOKEN_MODE_KEY;

  protected baseURL: string;
  protected http: HttpClient;
  protected cachedConfig: any;

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
    this.http = http;
    this.baseURL = environment.apiBaseURL;
    this.cachedConfig = {};
  }

  public getConfig(configName: string): Promise<Config> {
    if (configName === null || configName === undefined) {
      throw new Error("configName is required.");
    }

    return new Promise((resolve, reject) => {
      if (this.cachedConfig[configName] !== undefined) {
        return resolve(this.cachedConfig[configName]);
      }

      let url: string = this.baseURL + '/config/' + configName;

      this.http.get(url).toPromise().then((response: any) => {
        this.cachedConfig[configName] = response.data;

        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public clearCache(): void {
    this.cachedConfig = {};
  }

  public clearConfigCache(configName: string): void {
    if (configName == null || configName === '') {
      return;
    }

    if (this.cachedConfig[configName] !== undefined) {
      delete this.cachedConfig[configName];
    }
  }

  public reloadConfig(configName: string): Promise<any> {
    // reset hot core
    this.clearConfigCache(configName);

    return this.getConfig(configName);
  }
}
