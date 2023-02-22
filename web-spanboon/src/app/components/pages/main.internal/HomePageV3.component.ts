/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, EventEmitter, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Gallery } from '@ngx-gallery/core';
import { AuthenManager, MainPageSlideFacade, HashTagFacade, AssetFacade, PageFacade, SeoService } from '../../../services/services';
import { AbstractPage } from '../AbstractPage';
import { ActivatedRoute, Router } from '@angular/router';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { PLATFORM_NAME_TH } from 'src/custom/variable';
import { SearchFilter } from '../../../models/SearchFilter';

declare var $: any;

const PAGE_NAME: string = 'homeV3';

@Component({
    selector: 'home-page-v3',
    templateUrl: './HomePageV3.component.html',
})
export class HomePageV3 extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;
    public userCloneDatas: any;
    public isLoading: boolean;
    public isPostNewTab: boolean = false;
    public windowWidth: any;
    mainPageModelFacade: any;
    public model: any = undefined;
    private cacheConfigInfo: CacheConfigInfo;
    private postFacade: PostFacade;
    private hashTagFacade: HashTagFacade;
    private pageFacade: PageFacade;
    private assetFacade: AssetFacade;
    private seoService: SeoService;
    public hashTag: any = [];
    public pageUser: any;

    constructor(
        private gallery: Gallery, 
        router: Router, 
        authenManager: AuthenManager, 
        postFacade: PostFacade, 
        dialog: MatDialog, 
        cacheConfigInfo: CacheConfigInfo,
        mainPageModelFacade: MainPageSlideFacade, 
        pageFacade: PageFacade, 
        hashTagFacade: HashTagFacade, 
        assetFacade: AssetFacade, 
        seoService: SeoService
    ) {
        super(null, authenManager, dialog, router);
        this.pageFacade = pageFacade;
        this.mainPageModelFacade = mainPageModelFacade;
        this.assetFacade = assetFacade;
        this.hashTagFacade = hashTagFacade;
        this.seoService = seoService;
    }

    public ngOnInit(): void {
        let user = this.authenManager.getCurrentUser();
        this.userCloneDatas = JSON.parse(JSON.stringify(user));
        if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
          this.getMainPageModelV3(this.userCloneDatas.id);
          this.searchPageInUser(this.userCloneDatas.id);
        } else {
          this.getMainPageModelV3();
          this.searchPageInUser();
        }
        this.stopIsloading();
        this.getScreenSize();
        super.ngOnInit();
    }
    public async getMainPageModelV3(userId?) {
        this.isLoading = true;
        this.model = await this.mainPageModelFacade.getMainPageModelV3(userId);
        for (let index = 0; index < this.model.postSectionModel.contents.length; index++) {
          if (this.model.postSectionModel.contents[index].post.type === "FULFILLMENT") {
            this.model.postSectionModel.contents.splice(index, 1);
          } else if (this.model.postSectionModel.contents[index].coverPageUrl === undefined) {
            this.model.postSectionModel.contents.splice(index, 1);
          }
        }
        this.seoService.updateTitle(PLATFORM_NAME_TH);
        let filter: SearchFilter = new SearchFilter();
        filter.limit = 5;
        filter.offset = 0;
        filter.whereConditions = {};
        filter.orderBy = {};
        let data = {
          filter
        }
        this.hashTagFacade.searchTrend(data).then(res => {
          if (res.length > 0) {
            this.hashTag = res;
          }
        }).catch(error => {
          console.log(error);
        });
    }
    public async searchPageInUser(userId?) {
        if (userId) {
          let search: SearchFilter = new SearchFilter();
          search.limit = 2;
          search.count = false;
          search.whereConditions = { ownerUser: userId };
          await this.pageFacade.search(search).then((pages: any) => {
            this.pageUser = pages
            this.pageUser.push(this.userCloneDatas)
            this.pageUser.reverse();
          }).catch((err: any) => {
            console.log("err", err);
          });
          if (this.pageUser.length > 0) {
            for (let p of this.pageUser) {
              if (!p.signURL) {
                await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
                  p.img64 = res.data
                }).catch((err: any) => {
                  console.log("err", err);
                });
              }
            }
          }
        }
    
    }
    public ngAfterViewInit(): void {

    }

    public ngOnDestroy(): void {

    }
    @HostListener('window:resize', ['$event'])
    public getScreenSize(event?) {
      this.windowWidth = window.innerWidth;
  
      if (this.windowWidth <= 479) {
        this.isPostNewTab = true;
      } else {
        this.isPostNewTab = false;
      }
    }
    public stopIsloading() {
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
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
}
