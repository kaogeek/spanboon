/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { SwiperConfigInterface, SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { AuthenManager, MainPageSlideFacade, PageFacade, AssetFacade } from '../../../services/services';
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
import { AbstractPage } from '../AbstractPage';
import { SearchFilter } from '../../../models/SearchFilter';
import { Router } from '@angular/router';
import { DialogPostCrad } from '../../shares/dialog/DialogPostCrad.component';
declare var $: any;

const PAGE_NAME: string = 'home';
const PAGE_SIZE: number = 6;

@Component({
  selector: 'home-page-v2',
  templateUrl: './HomePageV2.component.html',
})
export class HomePageV2 extends AbstractPage implements OnInit {

  private mainPageModelFacade: MainPageSlideFacade;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  public static readonly PAGE_NAME: string = PAGE_NAME;
  @ViewChild("paginator", { static: false }) public paginator: MatPaginator;

  // Data User
  private userCloneDatas: any;
  public pageUser: any;

  // Data Page
  public pageModel: any;
  public emergencyEvents: any;
  public emergencyEventsArrTitle: any;

  public doingEventsNo1: any;
  public doingEventsNo2: any;
  public doingEventsNo3: any;

  public aroundSectionModels: any;
  public needsSectionModels: any;
  public sectionModels: any;

  public lookingSectionModels: any;
  public viewSectionModels: any;
  public postSectionModel: any;

  public isLoding: boolean = true;
  public isDoing: boolean;
  public isNotAccess: boolean;
  public isLodingMore: boolean = false;

  constructor(router: Router, authenManager: AuthenManager, pageFacade: PageFacade, mainPageModelFacade: MainPageSlideFacade, assetFacade: AssetFacade, dialog: MatDialog) {
    super(null, authenManager, dialog, router);

    this.mainPageModelFacade = mainPageModelFacade;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;

  }

  public async ngOnInit(): Promise<void> {
    let user = this.authenManager.getCurrentUser();
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      await this.getMainPageModel(this.userCloneDatas.id);
      this.searchPageInUser(this.userCloneDatas.id);
    } else {
      await this.getMainPageModel();
      this.searchPageInUser();
    }

    setTimeout(() => {
      this.isLoding = false;

    }, 3500);

  }

  ///  PRIVATE

  private async getMainPageModel(userId?) {

    let model = await this.mainPageModelFacade.getMainPageModel(userId);

    // console.log('model', model)

    this.pageModel = this.jsonParseData(model);
    this.sectionModels = this.jsonParseData(this.pageModel.sectionModels);
    this.emergencyEvents = this.jsonParseData(this.pageModel.emergencyEvents.contents);
    this.postSectionModel = this.jsonParseData(this.pageModel.postSectionModel);

    for (let m of this.sectionModels) {
      m.isLodingMore = false;
    }

    if (this.pageModel.objectiveEvents.contents.length > 0) {
      this.isDoing = false
      this.aroundSectionModels = this.jsonParseData(this.pageModel.objectiveEvents);

      let dataAroundSection = this.postInDoing(this.pageModel.objectiveEvents.contents);

      if (dataAroundSection.length > 0) {
        this.doingEventsNo1 = this.setDoingEventsFormat(this.jsonParseData(dataAroundSection), 0);

      } if (dataAroundSection.length > 1) {
        this.doingEventsNo2 = this.setDoingEventsFormat(this.jsonParseData(dataAroundSection), 1);

      } if (dataAroundSection.length > 2) {
        this.doingEventsNo3 = this.setDoingEventsFormat(this.jsonParseData(dataAroundSection), 2);

      }

    }

    this.emergencyEventsArrTitle = this.getEmergencyEventsTitle(this.pageModel.emergencyEvents.contents);

  }

  public async searchPageInUser(userId?) {
    if (userId) {
      let search: SearchFilter = new SearchFilter();
      search.limit = 10;
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


  public clickDataSearch(data) {
    this.router.navigate([]).then(() => {
      window.open('/search?hashtag=' + data, '_blank');
    });
  }

  public clickDataSearchTodo(data) {
    this.router.navigate([]).then(() => {
      window.open('/search?hashtag=' + data, '_blank');
    });
  }

  public smallType(data): boolean {
    if (data === "SMALL") {
      return true
    } else {
      return false
    }
  }

  public mediumType(data): boolean {
    if (data === "MEDIUM" || data === undefined) {
      return true
    } else {
      return false
    }
  }

  public hashtagUrl(data): string {
    return ('/search?hashtag=' + data)
  }

  public testCrad($event) {
    const dialogRef = this.dialog.open(DialogPostCrad, {
      width: 'auto',
      disableClose: false,
      data: {
        post: $event.post,
        isNotAccess: this.isNotAccess,
        user: this.userCloneDatas,
        pageUser: this.pageUser,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  public checkAccessPage(pageId: string) {
    this.pageFacade.getAccess(pageId).then((res: any) => {
      for (let dataPage of res.data) {
        if (dataPage.level === 'OWNER') {
          this.isNotAccess = true;
        }
      }

    }).catch((err: any) => {
      if (err.error.message === 'Unable to get User Page Access List') {
        this.isNotAccess = false;
      }
    })
  }

  public async getMore(length: string, type: string, index: number) {

    this.sectionModels[index].isLodingMore = true;
    let userId = undefined;
    let arrData: any[] = [];

    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      userId = this.userCloneDatas.id;
    }

    let getMoreModel: any = await this.mainPageModelFacade.getMainPageModel(userId, length, type);

    if (getMoreModel.contents.length > 0) {
      arrData = this.sectionModels[index].contents
      for (const post of getMoreModel.contents) {
        arrData.push(post)
      }
    }

    setTimeout(() => {
      if (getMoreModel.contents.length === 0) {
        this.sectionModels[index].isMax = true;
      }
      this.sectionModels[index].isLodingMore = false;
    }, 5000);

  }

  private postInDoing(arr): any {
    let doings: any[] = []

    for (let h of arr) {

      if (h.post.length > 0) {

        doings.push(h)

      }

    }

    return doings

  }

  private setDoingEventsFormat(arr, index?): any {

    let arrDoingEvents: any[] = []


    let data: any = {
      hashtag: {
        "coverPageUrl": arr[index].iconUrl,
        "title": arr[index].title
      },
      page: arr[index].owner,
      posts: arr[index].post,
    }

    arrDoingEvents = data

    // for (let item of arr) {

    // }

    return arrDoingEvents;

  }

  private getEmergencyEventsTitle(EmergencyEvents): any {

    let titles: any[] = []

    for (let item of EmergencyEvents) {
      titles.push(item.title)
    }

    return titles;

  }

  private jsonParseData(data): any {
    return JSON.parse(JSON.stringify(data))
  }

  /// PUBLIC

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
}
