/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { SwiperConfigInterface, SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
import { Gallery, GalleryRef } from '@ngx-gallery/core';
import { AuthenManager, MainPageSlideFacade, HashTagFacade, AssetFacade, PageFacade } from '../../../services/services';
import { AbstractPage } from '../AbstractPage';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { Router } from '@angular/router';
import { SearchFilter } from '../../../models/SearchFilter';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { DialogAlert } from '../../shares/dialog/dialog';
import { DialogPostCrad } from '../../shares/dialog/DialogPostCrad.component';
import { environment } from 'src/environments/environment';
import { MESSAGE } from '../../../../custom/variable';

declare var $: any;

const PAGE_NAME: string = 'homeV2';
const PAGE_SIZE: number = 6;

@Component({
  selector: 'newcon-home-page',
  templateUrl: './HomePage.component.html',
})
export class HomePage extends AbstractPage implements OnInit {

  private cacheConfigInfo: CacheConfigInfo;
  private postFacade: PostFacade;
  private hashTagFacade: HashTagFacade;
  private pageFacade: PageFacade;
  private mainPageModelFacade: MainPageSlideFacade;
  private assetFacade: AssetFacade;

  public static readonly PAGE_NAME: string = PAGE_NAME;
  @ViewChild("paginator", { static: false }) public paginator: MatPaginator;

  public userCloneDatas: any;
  public pageUser: any;
  public model: any = undefined;
  public hashTag: any = undefined;

  public apiBaseURL = environment.apiBaseURL;

  constructor(private gallery: Gallery, router: Router, authenManager: AuthenManager, postFacade: PostFacade, dialog: MatDialog, cacheConfigInfo: CacheConfigInfo,
    mainPageModelFacade: MainPageSlideFacade, pageFacade: PageFacade, hashTagFacade: HashTagFacade, assetFacade: AssetFacade) {
    super(null, authenManager, dialog, router);

    this.pageFacade = pageFacade;
    this.mainPageModelFacade = mainPageModelFacade;
    this.assetFacade = assetFacade;
    this.hashTagFacade = hashTagFacade;

  }

  public ngOnInit() {
    let user = this.authenManager.getCurrentUser()
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      this.getMainPageModel(this.userCloneDatas.id);
      this.searchPageInUser(this.userCloneDatas.id);
    } else {
      this.getMainPageModel();
      this.searchPageInUser();
    }
    super.ngOnInit();
  }

  private async getMainPageModel(userId?) {
    this.model = await this.mainPageModelFacade.getMainPageModel(userId);
    let filter: SearchFilter = new SearchFilter();
    filter.limit = 5;
    filter.offset = 0;
    filter.whereConditions = {};
    filter.orderBy = {};
    let data = {
      filter
    }
    this.hashTagFacade.searchTrend(data).then(res => {
      this.hashTag = res;
    }).catch(error => {
      console.log(error);
    });
    console.log('model', this.model);
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

  public clickToPage(dataId: any, type?: any) {
    if (type !== null && type !== undefined) {
      this.router.navigate([]).then(() => {
        window.open('/search?hashtag=' + dataId, '_blank');
      });
    } else {
      this.router.navigate([]).then(() => {
        window.open('/emergencyevent/' + dataId);
      });
    }
  }

  public clickToPost(postId: any) {
    this.router.navigate([]).then(() => {
      window.open('/post/' + postId);
    });
  }

  public clickToPageUser(pageId: any, owner?: any) {
    this.router.navigate([]).then(() => {
      if (owner !== undefined && owner !== null) {
        window.open('/objective/' + pageId);
      } else {
        window.open('/page/' + pageId);
      }
    });
  }

  public openDilogPost($event) {
    if ($event.post) {
      const dialogRef = this.dialog.open(DialogPostCrad, {
        width: 'auto',
        disableClose: false,
        data: {
          post: $event.post,
          isNotAccess: false,
          user: this.userCloneDatas,
          pageUser: this.pageUser,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    } else if ($event._id) {
      const dialogRef = this.dialog.open(DialogPostCrad, {
        width: 'auto',
        disableClose: false,
        data: {
          post: $event,
          isNotAccess: false,
          user: this.userCloneDatas,
          pageUser: this.pageUser,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    }

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
