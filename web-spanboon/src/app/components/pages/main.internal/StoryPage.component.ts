/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, Renderer2, EventEmitter, Output } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, PostActionService, PostCommentFacade, PostFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { SwiperConfigInterface, SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { AbstractPage } from '../AbstractPage';
import { FileHandle } from '../../shares/directive/directives';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { BoxPost, DialogMedia, DialogAlert, DialogReboonTopic } from '../../shares/shares';
import { MESSAGE } from '../../../../custom/variable';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { DialogPostCrad } from '../../shares/dialog/DialogPostCrad.component';
import { SearchFilter } from 'src/app/models/SearchFilter';
import { environment } from '../../../../environments/environment';
import { CommentPosts } from 'src/app/models/CommentPosts';

const PAGE_NAME: string = 'story';

declare var $: any;
@Component({
  selector: 'spanboon-story-page',
  templateUrl: './StoryPage.component.html',
})
export class StoryPage extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  protected isIconPage: boolean;
  @Input()
  protected text: string = "ข้อความ";

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: this.PLATFORM_GENERAL_TEXT, keyword: 'general' }, { label: 'กำลัง' + this.PLATFORM_NEEDS_TEXT, keyword: 'needs' }];
  public activeLink = this.links[0].label;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild('pagefixHeight', { static: false }) pagefixHeight: ElementRef;
  @ViewChild('sidefeedHeight', { static: false }) sidefeedHeight: ElementRef;

  protected observManager: ObservableManager;
  protected assetFacade: AssetFacade;
  protected myElement: ElementRef;
  protected pageFacade: PageFacade;
  protected postCommentFacade: PostCommentFacade;
  protected postFacade: PostFacade;
  protected postActionService: PostActionService;
  private routeActivated: ActivatedRoute;
  private mainPostLink: string = window.location.origin + '/post/'
  private mainPageLink: string = window.location.origin + '/page/'
  @Output()
  public action: EventEmitter<any> = new EventEmitter();

  mySubscription: any;
  files: FileHandle[] = [];

  public STORY: any;
  public userCloneDatas: any;
  public recommendedHashtag: any;
  public recommendedStory: any;
  public recommendedStorys: any;
  public commentList: any;
  public pageUser: any;
  public userAspage: any = null;
  public value: any
  public url: string;
  public isComments: boolean = false;
  public isShowUser: boolean = true;

  public apiBaseURL = environment.apiBaseURL;

  constructor(router: Router, postCommentFacade: PostCommentFacade, private renderer: Renderer2, postFacade: PostFacade, postActionService: PostActionService, dialog: MatDialog, myElement: ElementRef, authenManager: AuthenManager, pageFacade: PageFacade, cacheConfigInfo: CacheConfigInfo, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.observManager = observManager;
    this.assetFacade = assetFacade;
    this.pageFacade = pageFacade;
    this.routeActivated = routeActivated;
    this.postCommentFacade = postCommentFacade;
    this.postActionService = postActionService;
    this.postFacade = postFacade;

    this.isComments = this.isLogin();

    let user = this.authenManager.getCurrentUser()
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      this.searchPageInUser(this.userCloneDatas.id);
    } else {
      this.searchPageInUser();
    }
    this.routeActivated.params.subscribe((params) => {
      this.url = params['postId'];
      // this.url = '6128b4d7949e1113104c2a648';
    })
    let search: SearchFilter = new SearchFilter();
    search.limit = 5;
    search.count = false;
    search.whereConditions = { _id: this.url };
    this.postFacade.searchPostStory(search).then(async (res: any) => {
      this.STORY = res;
      this.TimeoutRuntimeSet();
      this.getRecommendedHashtag(this.STORY[0]._id);
      this.getRecommendedStory(this.STORY[0]._id);
      this.getRecommendedStorys(this.STORY[0]._id, this.STORY[0].pageId);
      this.getCommentList();
    }).catch((err: any) => {
      console.log(err)
    })


  }

  public TimeoutRuntimeSet() {
    setTimeout(() => {
      $('.comSelect').remove();
      $('.comDelet').remove();
    }, 400);
  }

  public getCommentList() {
    let search: SearchFilter = new SearchFilter();
    search.limit = 10;
    search.count = false;
    search.whereConditions = { _id: this.url };
    this.postCommentFacade.search(search, this.url).then((res: any) => {
      this.commentList = res;
    }).catch((err: any) => {
    })
  }

  public getRecommendedHashtag(id: string) {
    this.postFacade.recommendedHashtag(id).then((res: any) => {
      if (res.data.contents.length > 0) {
        this.recommendedHashtag = res.data
      }
    }).catch((err: any) => {
    })
  }

  public getRecommendedStory(id: string) {
    this.postFacade.recommendedStory(id).then((res: any) => {
      if (res.data.contents.length > 0) {
        this.recommendedStory = res.data
      }
    }).catch((err: any) => {
    })
  }

  public getRecommendedStorys(id: string, pageId: string) {
    this.postFacade.recommendedStorys(id, pageId).then((res: any) => {
      if (res.data.contents.length > 0) {
        this.recommendedStorys = res.data
      }
    }).catch((err: any) => {
    })
  }

  public async postAction(action: any, index: number) {
    let actions: any;
    let Arr: any = { posts: [this.STORY[0]] };
    if (action.mod === 'COMMENT') {
    } else if (action.mod === 'LIKE') {
      this.postFacade.like(this.STORY[0]._id, this.userAspage ? this.userAspage.id : this.userCloneDatas._id)
      if (this.STORY[0].isLike) {
        if (this.STORY[0].likeCount !== 0) {
          this.STORY[0].likeCount--
        }
      } else {
        this.STORY[0].likeCount++
      }
      this.STORY[0].isLike = !this.STORY[0].isLike
    } else if (action.mod === 'REBOON') {
      actions = { mod: action.mod, postData: this.STORY[0]._id, type: action.type, post: this.STORY[0], userAsPage: this.userAspage ? this.userAspage : this.userCloneDatas };
      await this.postActionService.actionPost(actions, index, Arr, "PAGE").then((res: any) => {
      }).catch((err: any) => {
        console.log('err ', err)
      });
    }

  }

  public postAspage(action: any) {

    this.userAspage = action;

  }

  public clickHashTags(data: any) {
    window.open('/search?hashtag=' + data, '_blank');
  }

  public clickToUser(data: any) {
    console.log('data', data);
    window.open('/page/' + data._id, '_blank');
  }

  public clickToPage(dataId: any, type?: any) {
    if (type !== null && type !== undefined) {
      this.router.navigate([]).then(() => {
        window.open('/search?hashtag=' + dataId, '_blank');
      });
    } else {
      if (typeof (dataId) === 'object') {
        const dialogRef = this.dialog.open(DialogPostCrad, {
          width: 'auto',
          disableClose: false,
          data: {
            post: dataId,
            isNotAccess: false,
            user: this.userCloneDatas,
            pageUser: this.pageUser,
          }
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {
        this.router.navigate([]).then(() => {
          window.open('/emergencyevent/' + dataId);
        });
      }
    }
  }

  public async searchPageInUser(userId?) {
    if (userId) {
      let search: SearchFilter = new SearchFilter();
      search.limit = 20;
      search.count = false;
      search.whereConditions = { ownerUser: userId };
      var aw = await this.pageFacade.search(search).then((pages: any) => {
        this.pageUser = pages
        this.pageUser.push(this.userCloneDatas)
        this.pageUser.reverse();
      }).catch((err: any) => {
      });
      if (this.pageUser.length > 0) {
        for (let p of this.pageUser) {
          var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
            p.img64 = res.data
          }).catch((err: any) => {
          });
        }
      }
    }

  }

  public onClickComment(data: any) {
    let comment = ({ value: this.value, pageId: this.STORY[0]._id, userAsPage: this.userAspage ? this.userAspage : this.userCloneDatas.id });
    this.createComment(comment);
    setTimeout(() => {
      this.STORY[0].isComment = true
      this.getCommentList();
      this.value = ''
    }, 100);
  }


  public createComment(comment: any, index?: number) {
    let commentPosts = new CommentPosts
    if (comment.userAsPage.id !== undefined && comment.userAsPage.id !== null) {
      commentPosts.commentAsPage = comment.userAsPage.id
    }
    commentPosts.comment = comment.value
    commentPosts.asset = undefined
    this.postCommentFacade.create(commentPosts, comment.pageId).then((res: any) => {
    }).catch((err: any) => {
    })
  }

  public commentAction(data: any) {

    if (data.action === "LIKE") {
      if (this.userCloneDatas.id !== undefined && this.userCloneDatas.id !== null) {
        this.postCommentFacade.like(this.STORY[0]._id, data.commentdata, this.userCloneDatas.id).then((res: any) => {
          this.commentList[data.index].likeCount = res.likeCount
          this.commentList[data.index].isLike = res.isLike
        }).catch((err: any) => {
        })
      } else {
        this.postCommentFacade.like(this.STORY[0]._id, data.commentdata).then((res: any) => {
          this.commentList[data.index].likeCount = res.likeCount
          this.commentList[data.index].isLike = res.isLike
        }).catch((err: any) => {
        })
      }
    } else if (data.action === "DELETE") {
      let dialog = this.dialog.open(DialogAlert, {
        disableClose: true,
        data: {
          text: MESSAGE.TEXT_TITLE_DELETE_COMMENT_CONFIRM,
          bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
          bottomColorText2: "black",
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.commentList.splice(data.index, 1);
          let index = this.commentList.map(function (e) { return e.user.id; }).indexOf(this.userCloneDatas.id);
          this.STORY[0].commentCount = this.STORY[0].commentCount - 1;
          if (index > 0) {
            this.STORY[0].isComment = false;
          }
          this.postCommentFacade.delete(this.STORY[0]._id, data.commentdata).then((res: any) => {
          }).catch((err: any) => {
          })
        }
      });
    } else if (data.action === "EDIT") {
      let cloneComment = JSON.parse(JSON.stringify(this.commentList));
      if (data.commentEdit !== cloneComment[data.index].comment) {
        this.postCommentFacade.edit(this.STORY[0]._id, data.commentdata, data.commentEdit).then((res: any) => {
          this.commentList[data.index].comment = res.comment
          this.commentList[data.index].isEdit = false;
        }).catch((err: any) => {
        })
      } else {
        this.commentList[data.index].isEdit = true;
      }
    } else if (data.action === 'CANCEL') {
      this.commentList[data.index].isEdit = false;
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  isPageDirty(): boolean {
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    return;
  }

}




