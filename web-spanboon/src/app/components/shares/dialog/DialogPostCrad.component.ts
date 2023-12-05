/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PageFacade, AuthenManager, AssetFacade, PostFacade, PostCommentFacade, PostActionService } from '../../../services/services';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { FileHandle } from '../directive/DragAndDrop.directive';
import { RePost } from '../../../models/RePost';
import { CommentPosts } from '../../../models/CommentPosts';
import { DialogShare } from './DialogShare.component';
import { DialogAlert } from './DialogAlert.component';

const PAGE_NAME: string = 'postcard';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
  selector: 'dialog-postcard',
  templateUrl: './DialogPostCrad.component.html',
})
export class DialogPostCrad extends AbstractPage {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public dialog: MatDialog;

  private postFacade: PostFacade;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private postCommentFacade: PostCommentFacade;
  private postActionService: PostActionService;

  public isLoading: boolean;
  public isShowCheckboxTag: boolean;
  public showLoading: boolean = true;
  public isRepost: boolean = false;

  public imageCover: any;
  public config: any;
  public content: any;
  public datas: any;
  public setTimeoutAutocomp: any;
  public resDataObjective: any[] = [];
  public prefix: any;

  public Editor = ClassicEditor;

  files: FileHandle[] = [];

  constructor(public dialogRef: MatDialogRef<DialogPostCrad>, @Inject(MAT_DIALOG_DATA) public data: any, postCommentFacade: PostCommentFacade, postActionService: PostActionService, pageFacade: PageFacade, assetFacade: AssetFacade, postFacade: PostFacade,
    dialog: MatDialog, authenManager: AuthenManager, router: Router) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.postCommentFacade = postCommentFacade;
    this.postActionService = postActionService;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;
    this.postFacade = postFacade;
    this.imageCover = {}
    this.prefix = {};


  }

  ngOnInit() {
    setTimeout(() => {
      this.showLoading = false
    }, 1500);
  }
  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public async actionComment(action: any, index?: number) {
    this.isLoginCh();
    let Arr: any = { posts: [this.data.post] };
    let pageInUser: any[];
    let data: RePost = new RePost();
    let dataPost: any;
    let userAsPage: any;
    this.prefix.header = 'header';
    this.prefix.detail = 'post';
    if (action.mod === 'REBOON') {
      this.showLoading = true;
      this.postActionService.actionPost(action, 0, Arr, "PAGE", true).then((res: any) => {
        this.onClose('');
        // if (res.isDialog) {
        //   this.isRepost = true;
        //   this.datas = res;
        //   this.content = res.options;
        //   this.showLoading = false;
        // } else {
        //   this.showLoading = false;
        // }
      }).catch((err: any) => {
      });
    } else if (action.mod === 'LIKE') {
      this.postLike(action, index);
    } else if (action.mod === 'SHARE') {
      let dialog = this.dialog.open(DialogShare, {
        disableClose: true,
        autoFocus: false,
        data: {
          title: "แชร์",
          text: action.linkPost
        }
      });
    } else if (action.mod === 'COMMENT') {
    } else if (action.mod === 'POST') {
      this.router.navigateByUrl('/post/' + action.pageId);
    }
  }

  public postLike(data: any, index: number) {
    if (!this.isLogin()) {
      return
    }
    let userId: any;

    this.data.post.isLike = !this.data.post.isLike;
    if (this.data.post.isLike) {
      this.data.post.likeCount = this.data.post.likeCount + 1
    } else {
      this.data.post.likeCount = this.data.post.likeCount - 1
    }
    if (data.userAsPage !== undefined && data.userAsPage !== null) {
      userId = data.userAsPage.id
    } else {
      userId = this.data.user.id
    }
    this.postFacade.like(data.postData._id, data.userAsPage.username ? null : userId).then((res: any) => {
      if (res.isLike) {
        if (data.postData._id === res.posts.id) {
          this.data.post.likeCount = res.likeCount;
          this.data.post.isLike = res.isLike;
        }
      } else {
        // unLike 
        if (data.postData._id === res.posts.id) {
          this.data.post.likeCount = res.likeCount;
          this.data.post.isLike = res.isLike;
        }
      }
    }).catch((err: any) => {
      console.log(err)
      if (err.error.message === 'You cannot like this post type MFP.') {
        this.showDialogEngagementMember();
      } else if (err.error.message === 'Page cannot like this post type MFP.') {
        this.showAlertDialog('เพจไม่สามารถกดไลค์ได้');
      }
    });
  }

  public createComment(comment: any, index?: number) {
    let commentPosts = new CommentPosts
    if (comment.userAsPage.id !== undefined && comment.userAsPage.id !== null) {
      commentPosts.commentAsPage = comment.userAsPage.id
    }
    commentPosts.comment = comment.value
    commentPosts.asset = undefined
    this.postCommentFacade.create(commentPosts, comment.pageId).then((res: any) => {
      this.data.post.commentCount++
      this.data.post.isComment = true
    }).catch((err: any) => {
    })
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  private isLoginCh() {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/home/");
      this.onClose('');
      return
    }
  }

  public dataRepost(data?: any) {
    this.isRepost = false;
  }

  isPageDirty(): boolean {
    // throw new Error('Method not implemented.');
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }

  onClose(data) {
    this.dialogRef.close(false);
  }

  onFileSelect() { }

  onConfirm() { }
}
