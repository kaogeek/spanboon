/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { I } from '@angular/cdk/keycodes';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PostCommentFacade } from '../../../services/services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'comment-post',
  templateUrl: './CommentPost.component.html'
})
export class CommentPost {

  private postCommentFacade: PostCommentFacade;

  public user: any = { displayName: 'Natthaphong Ruengpanyawut', imageURL: undefined }

  public apiBaseURL = environment.apiBaseURL;

  @Input()
  public commentdata: any;
  @Input()
  public isNotAccess: boolean
  @Input()
  public isLogin: boolean;
  @Input()
  public isImgSing: boolean = false;
  @Input()
  public userId: string;
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();

  public commentEdit: any
  public editPost: boolean = false;

  constructor(postCommentFacade: PostCommentFacade) {
    this.postCommentFacade = postCommentFacade;
  }

  public ngOnInit(): void {
    this._checkNullPage();
  }

  private _checkNullPage() {
    for (let index = 0; index < this.commentdata.length; index++) {
      if (!!this.commentdata[index]!.commentAsPage) {
        if (!!this.commentdata[index]!.page && !!this.commentdata[index]!.commentAsPage) {
          continue;
        } else {
          this.commentdata.splice(index, 1);
        }
      }
    }
  }

  public commentAction(action: any, comment: any, index: number) {
    if (!this.editPost) {
      this.editPost = true;
      this.commentEdit = comment.comment;
      this.submit.emit({ action: action, commentdata: comment.id, index: index, commentEdit: this.commentEdit });
      if (action === 'EDIT') {
        setTimeout(() => {
          document.getElementById('textcomment').focus();
        }, 200);
        this.editPost = false;
      }
    }
    if (action === 'CANCEL') {
      this.submit.emit({ action: action, commentdata: comment.id, index: index, commentEdit: this.commentEdit });
      this.editPost = false;
    }
    if (action === 'LIKE') {
      // this.submit.emit({ action: action, commentdata: comment.id, index: index, commentEdit: this.commentEdit });
      this.editPost = false;
    }
    if (action === 'DELETE') {
      this.editPost = false;
    }
  }

  public commentActionSave(action: any, comment: any, index: number) {
    this.submit.emit({ action: action, commentdata: comment.id, index: index, commentEdit: this.commentEdit });
    this.editPost = false;
  }

  public testIimageURL(data: any): string {
    return data
  }

  public checkAccessCustom(uuId: string): boolean {
    return uuId === this.userId;
  }

  public clickToUser(data: any) {
    let pageId = data._id ? data._id : data.id;
    if (data.id) {
      window.open('/profile/' + pageId, '_blank');
    } else {
      window.open('/page/' + pageId, '_blank');
    }
  }

  public clickDeleteComment(data: any) {
    let pageId = data._id ? data._id : data.id;
  }

  public menuProfile(data: any) {
  }
}
