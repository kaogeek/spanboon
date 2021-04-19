/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SearchFilter, Asset } from '../../../models/models';
import { PageFacade, AuthenManager, AssetFacade, PostFacade, PostCommentFacade } from '../../../services/services';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AbstractPage } from '../../pages/AbstractPage';
import { DialogReboonTopic } from '../../shares/dialog/DialogReboonTopic.component';
import { Router } from '@angular/router';
import { FileHandle } from '../directive/DragAndDrop.directive';
import * as moment from 'moment';
import * as $ from 'jquery';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RePost } from '../../../models/RePost';
import { CommentPosts } from '../../../models/CommentPosts';
import { DomSanitizer } from '@angular/platform-browser';

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

  public isLoading: boolean;
  public isShowCheckboxTag: boolean;
  public imageCover: any;
  public config: any;
  public setTimeoutAutocomp: any;
  public resDataObjective: any[] = [];

  public Editor = ClassicEditor;

  files: FileHandle[] = [];

  constructor(public dialogRef: MatDialogRef<DialogPostCrad>, @Inject(MAT_DIALOG_DATA) public data: any, postCommentFacade: PostCommentFacade, pageFacade: PageFacade, assetFacade: AssetFacade, postFacade: PostFacade,
    dialog: MatDialog, authenManager: AuthenManager, router: Router) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.postCommentFacade = postCommentFacade;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;
    this.postFacade = postFacade;
    this.imageCover = {}

  }

  ngOnInit() {
  }
  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public async actionComment(action: any, index?: number) {
    console.log('action', action)
    this.isLoginCh();
    // this.postId = action.postData.pageId
    let pageInUser: any[]
    let data: RePost = new RePost();
    let dataPost: any
    let userAsPage: any
    if (action.mod === 'REBOON') {
      if (action.userAsPage !== undefined && action.userAsPage !== null) {
        userAsPage = action.userAsPage.id;
      } else {
        userAsPage = null;
      }

      if (userAsPage !== null && userAsPage !== undefined && userAsPage !== '') {
        data.postAsPage = userAsPage;
        data.pageId = userAsPage;
      } else {
        data.postAsPage = null;
        data.pageId = null;
      }

      if (action.type === "TOPIC") {
        let search: SearchFilter = new SearchFilter();
        search.limit = 10;
        search.count = false;
        search.whereConditions = { ownerUser: this.data.user.id };
        var aw = await this.pageFacade.search(search).then((pages: any) => {
          pageInUser = pages
        }).catch((err: any) => {
        })
        for (let p of pageInUser) {
          var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
            p.img64 = res.data
          }).catch((err: any) => {
          });
        }
        const dialogRef = this.dialog.open(DialogReboonTopic, {
          width: '550pt',
          data: { options: { post: action.post, page: pageInUser, userAsPage: userAsPage, pageUserAsPage: action.userAsPage } }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (!result) {
            return
          }
          if (result.isConfirm) {
            if (result.pageId === 'แชร์เข้าไทมไลน์ของฉัน') {
              data.pageId = null
              if (result.text === "") {
                if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                  dataPost = action.post.referencePost._id
                } else {
                  dataPost = action.post._id
                }
              } else {
                dataPost = action.post._id
              }
            } else {
              data.pageId = result.pageId
              if (result.text === "") {
                if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                  dataPost = action.post.referencePost._id
                } else {
                  dataPost = action.post._id
                }
              } else {
                dataPost = action.post._id
              }
            }
            data.detail = result.text
            if (action.userAsPage.id !== undefined && action.userAsPage.id !== null) {
              data.postAsPage = action.userAsPage.id
            }
            if (result.hashTag !== undefined && result.hashTag !== null) {
              data.hashTag = result.hashTag
            }
            this.postFacade.rePost(dataPost, data).then((res: any) => {
              this.data.post[index].repostCount++
              this.data.post[index].isRepost = false;
            }).catch((err: any) => {
              console.log(err)
            })
          }
        });
      } else if (action.type === "NOTOPIC") {
        dataPost = action.post._id;
        this.postFacade.rePost(dataPost, data).then((res: any) => {
          this.data.post[index].repostCount++;
          this.data.post[index].isRepost = true;
        }).catch((err: any) => {
          console.log(err);
        })
      } else if (action.type === "UNDOTOPIC") {
        this.postFacade.undoPost(action.post._id).then((res: any) => {
          this.data.post[index].repostCount--;
          this.data.post[index].isRepost = false;
        }).catch((err: any) => {
          console.log(err);
        })
      }
    } else if (action.mod === 'LIKE') {
      this.postLike(action, index);
    } else if (action.mod === 'SHARE') {
    } else if (action.mod === 'COMMENT') {
    } else if (action.mod === 'POST') {
      this.router.navigateByUrl('/post/' + action.pageId);
    }
  }

  public postLike(data: any, index: number) {
    let userId: any;
    if (data.userAsPage !== undefined && data.userAsPage !== null) {
      userId = data.userAsPage.id
    } else {
      userId = this.data.user.id
    }
    this.postFacade.like(data.postData._id, userId).then((res: any) => {
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
    });
  }

  public createComment(comment: any, index?: number) {
    console.log('comment', comment)
    let commentPosts = new CommentPosts
    // if (comment.userAsPage.id !== undefined && comment.userAsPage.id !== null) {
    //   commentPosts.commentAsPage = comment.userAsPage.id
    // }
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
      this.showAlertLoginDialog("/homeV2/");
      return
    }
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
