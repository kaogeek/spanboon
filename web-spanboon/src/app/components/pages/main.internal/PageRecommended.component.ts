/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, HashTagFacade, Engagement, UserEngagementFacade, RecommendFacade, ProfileFacade, SeoService } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { FileHandle } from '../../shares/directive/directives';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BoxPost } from '../../shares/shares';
import { SearchFilter } from '../../../models/SearchFilter';
import { UserEngagement } from '../../../models/UserEngagement';
import { environment } from '../../../../environments/environment';

const PAGE_NAME: string = 'recommended';
const SEARCH_LIMIT: number = 20;
const SEARCH_OFFSET: number = 0;

declare var $: any;
@Component({
  selector: 'page-recommended',
  templateUrl: './PageRecommended.component.html',
})
export class PageRecommended extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  public isIconPage: boolean;
  @Input()
  public text: string = "ข้อความ";
  @Input()
  public data: any;
  @Input()
  public selectedIndex: number;
  @Output()
  public submitFollow: EventEmitter<any> = new EventEmitter();

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: this.PLATFORM_GENERAL_TEXT, keyword: 'general' }, { label: 'กำลัง' + this.PLATFORM_NEEDS_TEXT, keyword: 'needs' }];
  public activeLink = this.links[0].label;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild("recommendedRight", { static: true }) recommendedRight: ElementRef;

  private objectiveFacade: ObjectiveFacade;
  private assetFacade: AssetFacade;
  private routeActivated: ActivatedRoute;
  private searchHashTagFacade: HashTagFacade;
  private engagementService: Engagement;
  private userEngagementFacade: UserEngagementFacade;
  protected observManager: ObservableManager;
  private recommendFacade: RecommendFacade;
  private pageFacade: PageFacade;
  private profileFacade: ProfileFacade;
  private seoService: SeoService;

  public resDataPage: any;
  public resObjective: any;
  public dataRecommend: any;
  public url: string;
  public subPage: string;
  public isLoading: boolean;
  public msgPageNotFound: boolean;
  public imageCoverSize: number;
  public position: number;
  public dataTrend: any[] = [];
  public whereConditions: string[];

  public isFollow: boolean = false;
  public isloading: boolean;

  mySubscription: any;

  public apiBaseURL = environment.apiBaseURL;

  files: FileHandle[] = [];
  constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager, pageFacade: PageFacade, profileFacade: ProfileFacade, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute, searchHashTagFacade: HashTagFacade, engagementService: Engagement, userEngagementFacade: UserEngagementFacade,
    recommendFacade: RecommendFacade, seoService: SeoService) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog
    this.objectiveFacade = objectiveFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.routeActivated = routeActivated;
    this.searchHashTagFacade = searchHashTagFacade;
    this.engagementService = engagementService;
    this.userEngagementFacade = userEngagementFacade;
    this.recommendFacade = recommendFacade;
    this.pageFacade = pageFacade;
    this.profileFacade = profileFacade;
    this.whereConditions = ["name"]
    this.seoService = seoService;

    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.heightWindow();
    });
  }

  public ngOnInit(): void {
    this.searchTrendTag();
    this.openLoading();
    this.getRecommend();
    this.seoService.updateTitle("แนะนำสำหรับคุณ");
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
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

  public checkPath(): boolean {
    return this.router.url.includes('hashtag');
  }

  private openLoading() {
    this.isloading = true;
  }

  private closeLoading() {
    this.isloading = false;
  }

  public clickDataSearch(event: any, data) {
    this.router.navigateByUrl('/search?hashtag=' + data.label.substring(1));

    const result = this.engagementService.getEngagement(event, data.label, "hashTag");
    const dataEngagement: UserEngagement = this.engagementService.engagementPost(result.contentType, result.contentId, result.dom);
    this.userEngagementFacade.create(dataEngagement).then((res: any) => {
    }).catch((err: any) => {
      console.log('err ', err)
    });
  }
  public clickLoadmore() {

  }

  public heightWindow() {
    var resizeWin = window.innerHeight;
    var recommended = this.recommendedRight.nativeElement.offsetHeight;
    var maxrecommended = recommended + 100;
    var count = recommended - resizeWin;
    var maxcount = count + 60;

    if (maxrecommended > resizeWin) {
      this.recommendedRight.nativeElement.style.top = '-' + maxcount + 'px';

    } else {
      this.recommendedRight.nativeElement.style.top = '0pt';
    }
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  public searchTrendTag() {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {};
    filter.count = false;
    filter.orderBy = {}
    let data = {
      filter,
      userId: this.getCurrentUserId()
    }
    if (this.getCurrentUserId) {
      delete data.userId
    }
    this.searchHashTagFacade.searchTopTrend(data).then((res: any) => {
      setTimeout(() => {
        this.closeLoading();
      }, 1000);
      this.dataTrend = res
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public getRecommend() {
    let limit: number = 3;
    let offset: number = 0;
    this.recommendFacade.getRecommend(limit, offset).then(async (res) => {
      this.dataRecommend = res.data;
      for (let data of this.dataRecommend) {
        if (data.imageURL) {
          data.imageURL = await this.passSignUrl(data.imageURL);
        }
      }
    }).catch((err: any) => {
      console.log('err ', err)
    });
  }

  public async followPage(pageId: string) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/page/" + this.resDataPage.id);
    } else {
      return this.pageFacade.follow(pageId);
    }
  }

  public async followUser(userId: string) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/page/" + this.resDataPage.id);
    } else {
      return this.profileFacade.follow(userId);
    }
  }

  public async clickFollow(data: any) {
    if (data.recommed.type === 'USER') {
      const followUser = await this.followUser(data.recommed._id);
      if (followUser) {
        for (let [index, recommend] of this.dataRecommend.entries()) {
          if (recommend._id === data.recommed._id) {
            if (followUser.message === "Unfollow User Success") {
              let dialog = this.showAlertDialogWarming("คุณต้องการเลิกติดตาม " + data.recommed.displayName, "none");
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  Object.assign(this.dataRecommend[index], { isFollowed: followUser.data.isFollow });
                } else {
                  Object.assign(this.dataRecommend[index], { isFollowed: true });
                }
                this.dialog.closeAll();
              });
            } else {
              Object.assign(this.dataRecommend[index], { isFollowed: followUser.data.isFollow });
            }
          }
        }
        this.selectedIndex = data.index;
      }
    } else {
      const followPage = await this.followPage(data.recommed._id);
      if (followPage) {
        for (let [index, recommend] of this.dataRecommend.entries()) {
          if (recommend._id === data.recommed._id) {
            if (followPage.message === "Unfollow Page Success") {
              let dialog = this.showAlertDialogWarming("คุณต้องการเลิกติดตาม " + data.recommed.name, "none");
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  Object.assign(this.dataRecommend[index], { isFollowed: followPage.data.isFollow });
                } else {
                  Object.assign(this.dataRecommend[index], { isFollowed: true });
                }
                this.dialog.closeAll();
              });
            } else {
              Object.assign(this.dataRecommend[index], { isFollowed: followPage.data.isFollow });
            }
          }
        }

        this.selectedIndex = data.index;
      }
    }
  }

  public async passSignUrl(url?: any): Promise<any> {
    let signData: any = await this.assetFacade.getPathFileSign(url);
    return signData.data.signURL ? signData.data.signURL : ('data:image/png;base64,' + signData.data.data);
  }
}
