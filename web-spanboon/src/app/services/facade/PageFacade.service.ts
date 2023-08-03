/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { SearchFilter } from "../../models/SearchFilter";
import { Page } from '../../models/Page';
import { Post } from '../../models/Post';
import { PageSocialTW } from "../../models/PageSocialTW";
import { Config } from "src/app/models/Config";
import { PageSoialFB } from "src/app/models/PageSocialFB";

@Injectable()
export class PageFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(data: any): Promise<Page> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(filter: SearchFilter): Promise<Page[]> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/search';
      let body: any = {};
      if (filter !== null && filter !== undefined) {
        body = Object.assign(filter)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public groups(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page';
      let body: any = {}
    })
  }
  public searchType(data: any, pageId: string): Promise<Page> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/post/search';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public searchPostType(data: any, pageId: string): Promise<Page> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/post/search';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getDefaultOptions(): any {
    let header = this.authMgr.getDefaultHeader();
    let userId = this.authMgr.getCurrentUser();
    header = header.append('userid', userId ? userId.id : '')

    let httpOptions = {
      headers: header
    };

    return httpOptions;
  }

  public createPost(pageId: string, data: Post, postSocialTW?: any, postSocialFB?: any): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/post';
      let queryParams: string = "";

      if (postSocialTW && postSocialTW !== undefined && postSocialTW !== null) {
        queryParams += "&twitterPost=true"
      }
      if (postSocialFB && postSocialFB !== undefined && postSocialFB !== null) {
        queryParams += "&facebookPost=true"
      }

      if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
        queryParams = queryParams.substring(1, queryParams.length);
      }

      if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
        url += "?" + queryParams;
      }

      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public follow(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/follow';
      const tokenFCM = localStorage.getItem('currenToken');
      let body: any = {
        "tokenFCM": tokenFCM
      };
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getProfilePage(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId;
      let body: any = {};

      let option = this.authMgr.getDefaultOptions();
      this.http.get(url, option).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public updateProfilePage(pageId: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId;

      let option = this.authMgr.getDefaultOptions();
      this.http.put(url, body, option).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public updateProvincePage(pageId: string, province?: string, group?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId;
      let body: any = {
        province: province,
        group: group
      };

      let option = this.authMgr.getDefaultOptions();
      this.http.put(url, body, option).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getProvince() {
    return new Promise((resolve, reject) => {
      let url: string = "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json";
      let data = [];
      this.http.get(url).toPromise().then((response: any) => {
        for (let index = 0; index < response.length; index++) {
          const element = response[index].province;
          data.push(element)
        }
        var dataProvince = data.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        });
        resolve(dataProvince);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public saveImagePage(id: string, data: any): Promise<any> {
    if (id === undefined || id === null || id === '') {
      new Error("id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + id + '/image';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public saveCoverImagePage(id: string, data: any): Promise<any> {
    if (id === undefined || id === null || id === '') {
      new Error("id is required.");
    }
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + id + '/cover';
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public findPagePost(pageId: string, postId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/post/' + postId;
      let options = this.authMgr.getDefaultOptions();

      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getAccessLevel(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/accesslv';
      let options = this.authMgr.getDefaultOptions();

      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public addAccess(pageId: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/access';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getAccess(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/access';
      let options = this.authMgr.getDefaultOptions();

      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public deletePermission(pageId: string, id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/delete/' + id;
      let options = this.authMgr.getDefaultOptions();

      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public deletePage(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/delete';
      let options = this.authMgr.getDefaultOptions();

      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public deletePost(pageId: string, postId: string): Promise<Post> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/post/' + postId;

      let options = this.authMgr.getDefaultOptions();

      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public editPost(pageId: any, postId: string, data: any): any {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/post/' + postId;
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response as Post[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public checkUniqueId(pageId: string, pageUsername: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/uniqueid/check';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};

      if (pageUsername !== null && pageUsername !== undefined) {
        body = Object.assign(pageUsername)
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public manipulatePost(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/manipulate';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getManipulate(type: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string;
      if (type === 'user') {
        url = this.baseURL + '/user/report/manipulate';
      } else if (type === 'page') {
        url = this.baseURL + '/page/report/manipulate';
      } else if (type === 'post') {
        url = this.baseURL + '/post/report/manipulate';
      }

      this.http.get(url).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public blockPage(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/content/block';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public reportPage(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/report';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};

      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public hidePost(postId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/user/report/hide';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {
        postId: [postId],
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public checkPageUsername(pageUsername: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/uniqueid/check';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};

      if (pageUsername !== null && pageUsername !== undefined) {
        body = Object.assign(pageUsername)
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public updateSettingPage(pageId: any, data: any, accessid: any): any {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/access/' + accessid;
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response as Post[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialBindingFacebook(pageId: string, facebookPageId: PageSoialFB): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/social/facebook';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};
      if (facebookPageId !== undefined && facebookPageId !== null) {
        body = Object.assign(facebookPageId);
      }
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialUnBindingFacebook(pageId: string): Promise<PageSocialTW> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/social/facebook';
      let options = this.authMgr.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialGetBindingFacebook(pageId: string): Promise<PageSocialTW> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/social/facebook/check';
      let options = this.authMgr.getDefaultOptions();
      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialBindingTwitter(pageId: string, data: PageSocialTW): Promise<PageSocialTW> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/social/twitter';
      let options = this.authMgr.getDefaultOptions();
      let body: any = {};
      if (data !== undefined && data !== null) {
        body = Object.assign(data);
      }
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialUnBindingTwitter(pageId: string): Promise<PageSocialTW> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/social/twitter';
      let options = this.authMgr.getDefaultOptions();
      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialGetBindingTwitter(pageId: string): Promise<PageSocialTW> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/social/twitter/check';
      let options = this.authMgr.getDefaultOptions();
      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getConfigByPage(pageId: string, configName: string): Promise<Config> {
    if (configName === null || configName === undefined) {
      throw new Error("configName is required.");
    }

    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/config/' + configName;
      let option = this.authMgr.getDefaultOptions();
      this.http.get(url, option).toPromise().then((response: any) => {

        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getEditConfig(pageId: string, config: any, configName: string): Promise<Config> {
    if (configName === null || configName === undefined) {
      throw new Error("configName is required.");
    }

    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/config/' + configName;
      let body = {};
      let option = this.authMgr.getDefaultOptions();
      if (config !== undefined && config !== null) {
        body = Object.assign(config);
      }
      this.http.put(url, body, option).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public fetchFeedTwitter(pageId: string, config: any): Promise<Config> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/twitter_fetch_enable';
      let body = {};
      let option = this.authMgr.getDefaultOptions();
      if (config !== undefined && config !== null) {
        body = Object.assign(config);
      }
      this.http.post(url, body, option).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
  public getFetchFeedTwitter(pageId: string): Promise<Config> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/twitter_fetch_enable';
      let option = this.authMgr.getDefaultOptions();
      this.http.get(url, option).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }


  // Facebook

  public fetchFeedFacebook(pageId: string, config: any): Promise<Config> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/facebook_fetch_enable';
      let body = {};
      let option = this.authMgr.getDefaultOptions();
      if (config !== undefined && config !== null) {
        body = Object.assign(config);
      }
      this.http.post(url, body, option).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getFetchFeedFacebook(pageId: string): Promise<Config> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/facebook_fetch_enable';
      let option = this.authMgr.getDefaultOptions();
      this.http.get(url, option).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
