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
import { Asset } from '../../models/Asset';
import { Post } from '../../models/Post';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class PostFacade extends AbstractFacade {

  private message = new BehaviorSubject('');
  sharedMessage = this.message.asObservable();

  private messageTopic = new BehaviorSubject('');
  sharedMessageTopic = this.messageTopic.asObservable();

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  nextMessage(message: string) {
    this.message.next(message)
  }

  nextMessageTopic(message: string) {
    this.messageTopic.next(message)
  }


  public upload(data: any): Promise<Asset> {

    return new Promise((resolve, reject) => {
      // https://10.1.0.22:9001/api/page/5ebf98a6f177d22d3aebb259/post

      let url: string = this.baseURL + '/file/temp';

      let body: any = {};
      if (data !== null && data !== undefined) {
        body = Object.assign(data)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response as Asset);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }


  public getAaaPost(id: string, aspage?: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url: string
      if (aspage !== null && aspage !== undefined) {
        url = this.baseURL + '/post/' + id + '/count?aspage=' + aspage;
      } else {
        url = this.baseURL + '/post/' + id + '/count';
      }
      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }


  public async search(filter: SearchFilter): Promise<Post> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/search';
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

  public async searchPostStory(filter: SearchFilter): Promise<Post> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/search?isHideStory=false';
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


  public like(postId: string, asPage?: any): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/post/' + postId + '/like';
      let body: any;
      let options = this.authMgr.getDefaultOptions();

      if (asPage !== null && asPage !== undefined) {
        body = { likeAsPage: asPage }
      } else {
        body = {}
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public rePost(postId: string, repost: any): Promise<Post> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/post/' + postId + '/repost';
      let body: any = {};
      if (repost !== null && repost !== undefined) {
        body = Object.assign(repost)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public undoPost(postId: string): Promise<Post> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/post/' + postId + '/repost/undo';
      let body: any = {};
      let options = this.authMgr.getDefaultOptions();

      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getPostNeeds(postId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/' + postId + '/needs';

      let httpOptions = this.authMgr.getDefaultOptions();

      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public getMaxData(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string
      url = this.baseURL + '/post/count/max';

      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public recommendedStory(postId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string
      url = this.baseURL + '/post/' + postId + '/recommended_story';

      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public recommendedHashtag(postId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string
      url = this.baseURL + '/post/' + postId + '/recommended_hashtag';

      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public recommendedStorys(postId: string, pageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string
      url = this.baseURL + '/recommend/story?pageId=' + pageId;

      let httpOptions = this.authMgr.getDefaultOptions();
      this.http.get(url, httpOptions).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
