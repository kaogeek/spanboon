/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { I } from '@angular/cdk/keycodes';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PostCommentFacade } from '../../../services/services';

@Component({
  selector: 'comment-post',
  templateUrl: './CommentPost.component.html'
})
export class CommentPost {

  private postCommentFacade: PostCommentFacade;

  public user: any = { displayName: 'Natthaphong Ruengpanyawut', imageURL: undefined }

  @Input()
  public commentdata: any;
  @Input()
  public isLogin: boolean
  @Input()
  public userId: string
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();

  public commentEdit: any

  constructor(postCommentFacade: PostCommentFacade) {
    this.postCommentFacade = postCommentFacade;
  }

  public commentAction(action: any, comment: any, index: number) {
    this.commentEdit = comment.comment;
    this.submit.emit({ action: action, commentdata: comment.id, index: index, commentEdit: this.commentEdit });
    if (action === 'EDIT') {
      setTimeout(() => {
        document.getElementById('textcomment').focus();
      }, 200);
    }
  }

  public commentActionSave(action: any, comment: any, index: number) {
    this.submit.emit({ action: action, commentdata: comment.id, index: index, commentEdit: this.commentEdit });
  }

  public testIimageURL(data: any): string {
    return data
  }

  public checkAccessCustom(uuId: string): boolean {
    console.log('uuId', uuId);
    console.log('this.userId', this.userId);
    return uuId === this.userId;
  }

  public menuProfile(): void { }
}
