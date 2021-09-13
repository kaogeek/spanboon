/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, Renderer2, EventEmitter, Output } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, PostCommentFacade, PostFacade } from '../../../services/services';
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
  public pageUser: any;
  public url: string;

  public apiBaseURL = environment.apiBaseURL;

  constructor(router: Router, postCommentFacade: PostCommentFacade, private renderer: Renderer2, postFacade: PostFacade, dialog: MatDialog, myElement: ElementRef, authenManager: AuthenManager, pageFacade: PageFacade, cacheConfigInfo: CacheConfigInfo, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.observManager = observManager;
    this.assetFacade = assetFacade;
    this.pageFacade = pageFacade;
    this.routeActivated = routeActivated;
    this.postCommentFacade = postCommentFacade;
    this.postFacade = postFacade;



    let user = this.authenManager.getCurrentUser()
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      this.searchPageInUser(this.userCloneDatas.id);
    } else {
      this.searchPageInUser();
    }
    this.routeActivated.params.subscribe((params) => {
      this.url = params['postId']
    })
    let search: SearchFilter = new SearchFilter();
    search.limit = 5;
    search.count = false;
    search.whereConditions = { _id: '6128b4d7949e111314c2a648' };
    this.postFacade.searchPostStory(search).then(async (res: any) => {
      this.STORY = res;
      console.log('this.STORY', this.STORY);
      this.TimeoutRuntimeSet();
      this.getRecommendedHashtag(this.STORY[0]._id);
      this.getRecommendedStory(this.STORY[0]._id);
      this.getRecommendedStorys(this.STORY[0]._id, this.STORY[0].pageId);
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


  public getRecommendedHashtag(id: string) {
    this.postFacade.recommendedHashtag(id).then((res: any) => {
      this.recommendedHashtag = res.data
      console.log('recommendedHashtag', res);
    }).catch((err: any) => {
    })
  }

  public getRecommendedStory(id: string) {
    this.postFacade.recommendedStory(id).then((res: any) => {
      this.recommendedStory = res.data
      console.log('recommendedStory', res);
    }).catch((err: any) => {
    })
  }

  public getRecommendedStorys(id: string, pageId: string) {
    this.postFacade.recommendedStorys(id, pageId).then((res: any) => {
      this.recommendedStorys = res.data
      console.log('recommendedStorys', res);
    }).catch((err: any) => {
    })
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
      search.limit = 2;
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




