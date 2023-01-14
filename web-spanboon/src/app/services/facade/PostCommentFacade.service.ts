import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { SearchFilter } from "../../models/SearchFilter";
import { CommentPosts } from '../../models/CommentPosts';

@Injectable()
export class PostCommentFacade extends AbstractFacade {

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
  }

  public create(comment: any, postId: any): Promise<CommentPosts> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/' + postId + '/comment';
      let body: any = {};
      if (comment !== null && comment !== undefined) {
        body = Object.assign(comment)
      }
      let options = this.authMgr.getDefaultOptions();

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public search(filter: SearchFilter, postId: any): Promise<CommentPosts> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/' + postId + '/comment/search';
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

  public getPostCommentStatus(postId: any, commentsArray: any, asPage?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/' + postId + '/comment/status';
      let body: any = {};
      let options = this.authMgr.getDefaultOptions();
      body = { comments: commentsArray, asPage: asPage }
      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public like(postId: string, commentId: string, likeAsPage?: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let url: string = this.baseURL + '/post/' + postId + '/comment/' + commentId + '/like';
      let body: any = {};
      let options = this.authMgr.getDefaultOptions();

      if (likeAsPage !== null && likeAsPage !== undefined) {
        body = { likeAsPage: likeAsPage }
      }

      this.http.post(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public delete(postId: string, commentId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let options = this.authMgr.getDefaultOptions();

      let url: string = this.baseURL + '/post/' + postId + '/comment/' + commentId;

      this.http.delete(url, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  public edit(postId: string, commentId: string, comment: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url: string = this.baseURL + '/post/' + postId + '/comment/' + commentId;
      let body: any = { comment: comment };
      let options = this.authMgr.getDefaultOptions();


      this.http.put(url, body, options).toPromise().then((response: any) => {
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

}
