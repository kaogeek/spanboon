/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th > , Panupap-somprasong <panupap.s@absolute.co.th>
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager, EmergencyEventFacade, MainPageSlideFacade, PageFacade, PostCommentFacade, PostFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { DialogShare } from '../../shares/dialog/DialogShare.component';
import { CommentPosts } from 'src/app/models/CommentPosts';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { DialogCheckBox } from '../../shares/dialog/DialogCheckBox.component';
import { Location } from '@angular/common';

const PAGE_NAME: string = 'search';

@Component({
  selector: 'event-search',
  templateUrl: './EventSearch.component.html',
})
export class EventSearch extends AbstractPageImageLoader implements OnInit {
  public params: any;
  public route: ActivatedRoute;
  public url: any;
  private currentUrl: any;
  private mainPageFacade: MainPageSlideFacade;
  private emergencyEventFacade: EmergencyEventFacade;
  private postFacade: PostFacade;
  private postCommentFacade: PostCommentFacade;
  private pageFacade: PageFacade;
  private checkLike: boolean = false;

  public data: any;
  public dataId: any;
  public isNotAccess: any;
  public linkPost: any;
  public mainPostLink: string;

  constructor(
    router: Router,
    dialog: MatDialog,
    authenManager: AuthenManager,
    route: ActivatedRoute,
    mainPageFacade: MainPageSlideFacade,
    emergencyEventFacade: EmergencyEventFacade,
    postFacade: PostFacade,
    postCommentFacade: PostCommentFacade,
    pageFacade: PageFacade,
    private location: Location) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.pageFacade = pageFacade;
    this.postCommentFacade = postCommentFacade;
    this.postFacade = postFacade;
    this.emergencyEventFacade = emergencyEventFacade;
    this.mainPageFacade = mainPageFacade;
    this.route = route;

    this.url = this.router.url.split('/');
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length !== 0) {
        this.params = params;
        this.currentUrl = this.router.url;
      } else {
        this.location.replaceState(this.currentUrl);
      }
    });
  }

  public ngOnInit(): void {
    this._getEmergency(this.params['emertag']);
  }

  public ngOnDestroy(): void {

  }

  private _getEmergency(name: any) {
    const keywordFilter: any = {
      filter: {
        whereConditions: { hashTag: name },
      },
    };
    this.emergencyEventFacade.searchEmergency(keywordFilter).then((res) => {
      if (res) {
        this.dataId = res[0].hashTag;
        this._getContent(this.dataId);
      }
    })
  }

  private _getContent(id) {
    const keywordFilter: any = {
      keyword: [this.params['hashtag']],
      hashtag: [this.params['hashtag']],
      type: '',
      emergencyEventTag: this.params['emertag'],
      emergencyEvent: id,
      pageCategories: [],
      sortBy: "LASTEST_DATE",
      filter: {
        limit: 5,
        offset: 0,
      }
    };
    this.mainPageFacade.searchMainContent(keywordFilter).then((res: any) => {
      if (res) {
        this.data = res;
      }
    })
  }

  public async actionComment(action: any, index: number) {
    if (this.isLogin()) {
      // this.postId = action.pageId
      if (action.mod === 'LIKE') {
        this._isLoginCh();
        this.postLike(action, index);
      } else if (action.mod === 'SHARE') {
        this.mainPostLink = window.location.origin + '/post/';
        this.linkPost = (this.mainPostLink + this.data[index].post._id);
        this.dialogShare();
      } else if (action.mod === 'COMMENT') {
        this._isLoginCh();
      } else if (action.mod === 'POST') {
        this.router.navigateByUrl('/post/' + action.pageId);
      }
    } else {
      return this.showAlertLoginDialog(this.url);
    }
  }

  public postLike(data: any, index: number) {
    if (!this.checkLike) {
      this.checkLike = true;
      if (!this.isLogin()) {
        this.showAlertLoginDialog(this.url);
        this.checkLike = false;
      } else {
        this.postFacade.like(data.postData._id).then((res: any) => {
          if (res.isLike) {
            if (data.postData._id === res.posts.id) {
              this.data[index].post.likeCount = res.likeCount;
              this.data[index].post.isLike = res.isLike;
            }
            this.checkLike = false;
          } else {
            // unLike 
            if (data.postData._id === res.posts.id) {
              this.data[index].post.likeCount = res.likeCount;
              this.data[index].post.isLike = res.isLike;
            }
            this.checkLike = false;
          }
        }).catch((err: any) => {
          console.log(err)
          // this.isLoading = false;
          if (err.error.message === 'You cannot like this post type MFP.') {
            this.showAlertDialog('กดไลค์สำหรับสมาชิกพรรคเท่านั้น');
            this.checkLike = false;
          }
        });
      }
    }
  }

  public createComment(comment: any, index?: number) {
    let commentPosts = new CommentPosts;
    if (comment.userAsPage !== undefined && comment.userAsPage !== null) {
      commentPosts.commentAsPage = comment.userAsPage.id;
    }
    commentPosts.comment = comment.value;
    commentPosts.asset = undefined;
    this.postCommentFacade.create(commentPosts, comment.pageId).then((res: any) => {
      this.data[index].post.commentCount++;
    }).catch((err: any) => {
      // this.isLoading = false;
    })
  }

  public deletePost(event: any, index: number): any { }

  public hidePost(post: any, index: number) {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: false,
      data: {
        text: 'คุณต้องการซ่อนโพสต์นี้ใช่หรือไม่',
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.pageFacade.hidePost(post._id).then((res) => {
          if (res) {
            this.data.splice(index, 1);
          }
        }).catch((err) => {
          if (err) { }
        })
      }
    });
  }

  public reportPost(post: any, index: any) {
    let typeReport = 'post';
    let detail = ['คุกคามหรือข่มขู่ด้วยความรุนแรง', 'แสดงเนื้อหาล่อแหลมหรือรบกวนจิตใจ', 'ฉันถูกลอกเลียนแบบหรือแสดงตัวตนที่หลอกลวง', 'แสดงเนื้อหาที่เกี่ยวข้องหรือสนับสนุนให้ทำร้ายตัวเอง', 'สแปม'];
    this.pageFacade.getManipulate(typeReport).then((res) => {
      if (res) {
        detail = [];
        for (let data of res.data) {
          detail.push(data.detail);
        }
        this._openDialogReport(post, typeReport, detail)
      }
    }).catch((err) => {
      if (err.error.status === 0) {
        this._openDialogReport(post, typeReport, detail)
      }
    });
  }

  private _openDialogReport(page, typeReport, detail) {
    let title = '';
    if (typeReport === 'post') {
      title = 'รายงานโพสต์';
    }
    let dialog = this.dialog.open(DialogCheckBox, {
      disableClose: false,
      data: {
        title: title,
        subject: detail,
        bottomText2: 'ตกลง',
        bottomColorText2: "black",
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        let data = {
          typeId: page._id,
          type: typeReport.toUpperCase(),
          topic: res.topic,
          message: res.detail ? res.detail : '',
        }
        this.pageFacade.reportPage(data).then((res) => {
          if (res) {
          }
        }).catch((err) => {
          if (err) { }
        })
      }
    });
  }

  public dialogShare() {
    let dialog = this.dialog.open(DialogShare, {
      disableClose: true,
      autoFocus: false,
      data: {
        title: "แชร์",
        text: this.linkPost
      }
    });
  }

  private _isLoginCh() {
    if (!this.isLogin()) {
      return this.showAlertLoginDialog(this.url);
    }
  }

  public getImageSelector(): string[] {
    throw new Error('Method not implemented.');
  }
  public onSelectorImageElementLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadOK(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadError(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
  }
  isPageDirty(): boolean {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
}