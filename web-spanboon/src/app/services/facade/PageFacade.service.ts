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
import { PageSocailTW } from "../../models/PageSocailTW";

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
      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(filter: SearchFilter): Promise<Page> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/search';
      let body: any = {};
      if (filter !== null && filter !== undefined) {
        body = Object.assign(filter)
      }
      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public searchType(data: any, pageId: string): Promise<Page> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/post/search';
      let body: any = {}
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.getDefaultOptions();

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
      let options = this.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getDefaultOptions(): any {
    let header = this.getDefaultHeader();
    let userId = this.authMgr.getCurrentUser();
    header = header.append('userId', userId ? userId.id : '')

    let httpOptions = {
      headers: header
    };

    return httpOptions;
  }

  public createPost(pageId: string, data: Post): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/page/' + pageId + '/post';

      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.getDefaultOptions();

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
      let body: any = {};
      let options = this.getDefaultOptions();

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

      let option = this.getDefaultOptions();
      this.http.get(url, option).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public updateProfilePage(pageId: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId;
      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }

      let option = this.getDefaultOptions();
      this.http.put(url, body, option).toPromise().then((response: any) => {
        resolve(response);
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
      let options = this.getDefaultOptions();
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
      let options = this.getDefaultOptions();
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
      let options = this.getDefaultOptions();

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
      let options = this.getDefaultOptions();

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
      let options = this.getDefaultOptions();
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
      let options = this.getDefaultOptions();

      this.http.get(url, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public deletePost(pageId: string, postId: string): Promise<Post> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + '/post/' + postId;

      let options = this.getDefaultOptions();

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

      let options = this.getDefaultOptions();

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
      let options = this.getDefaultOptions();
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

  public checkPageUsername(pageUsername: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/uniqueid/check';
      let options = this.getDefaultOptions();
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
      let options = this.getDefaultOptions();

      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response as Post[]);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialBindingFacebook(pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + 'social/facebook';
      let options = this.getDefaultOptions();
      let body: any = {};


      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public socialBindingTwitter(pageId: string, data: PageSocailTW): Promise<PageSocailTW> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/page/' + pageId + 'social/twitter';
      let options = this.getDefaultOptions();
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
}
