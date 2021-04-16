/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { SwiperConfigInterface, SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { AuthenManager, MainPageSlideFacade } from '../../../services/services';
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
import { AbstractPage } from '../AbstractPage';
import { Router } from '@angular/router';
import { DialogPostCrad } from '../../shares/dialog/DialogPostCrad.component';
declare var $: any;

const PAGE_NAME: string = 'homeV2';
const PAGE_SIZE: number = 6;

@Component({
  selector: 'home-page-v2',
  templateUrl: './HomePageV2.component.html',
})
export class HomePageV2 extends AbstractPage implements OnInit {

  private mainPageModelFacade: MainPageSlideFacade;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  public static readonly PAGE_NAME: string = PAGE_NAME;
  @ViewChild("paginator", { static: false }) public paginator: MatPaginator;

  // Data User
  private userCloneDatas: any;

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

  constructor(router: Router, authenManager: AuthenManager, mainPageModelFacade: MainPageSlideFacade, dialog: MatDialog) {
    super(null, authenManager, dialog, router);

    this.mainPageModelFacade = mainPageModelFacade;

  }

  public async ngOnInit(): Promise<void> {
    let user = this.authenManager.getCurrentUser();
    this.userCloneDatas = JSON.parse(JSON.stringify(user));

    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      await this.getMainPageModel(this.userCloneDatas.id);
    } else {
      await this.getMainPageModel();
    }

    setTimeout(() => {
      this.isLoding = false;

    }, 3500);

  }

  ///  PRIVATE

  private async getMainPageModel(userId?) {

    let model = await this.mainPageModelFacade.getMainPageModel(userId);

    console.log('model', model);

    this.pageModel = this.jsonParseData(model);
    this.sectionModels = this.jsonParseData(this.pageModel.sectionModels);
    this.emergencyEvents = this.jsonParseData(this.pageModel.emergencyEvents.contents);
    this.postSectionModel = this.jsonParseData(this.pageModel.postSectionModel);

    this.needsSectionModels = this.jsonParseData(this.pageModel.lastest);
    this.lookingSectionModels = this.jsonParseData(this.pageModel.looking);
    this.viewSectionModels = this.jsonParseData(this.pageModel.viewSection);

    if (this.pageModel.objectiveEvents.contents.length > 0) {
      this.isDoing = true
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


  public clickDataSearch(data) {
    this.router.navigateByUrl('/search?hashtag=' + data);
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
      }
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  public async getMore(length, type,) {

    let userId = undefined;
    let arrData: any[] = [];

    if (this.userCloneDatas !== undefined) {
      userId = this.userCloneDatas.id;
    }

    let getMoreModel: any = await this.mainPageModelFacade.getMainPageModel(userId, length, type);

    if (type === 'RECOMMEND') {
      if (getMoreModel.contents.length > 0) {
        arrData = this.viewSectionModels.contents
        for await (const post of getMoreModel.contents) {
          arrData.push(post)
        }
      }
    }
    if (type === 'STILLLOOKING') {
      console.log('getMoreModel', getMoreModel)
      if (getMoreModel.contents.length > 0) {
        arrData = this.lookingSectionModels.contents
        for await (const post of getMoreModel.contents) {
          arrData.push(post)
        }
      }
    }
    if (type === 'LASTEST') {
      if (getMoreModel.contents.length > 0) {
        arrData = this.needsSectionModels.contents
        for await (const post of getMoreModel.contents) {
          arrData.push(post)
        }
      }
    }


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
