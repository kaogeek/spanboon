/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Gallery } from '@ngx-gallery/core';
import { AuthenManager, MainPageSlideFacade, HashTagFacade, AssetFacade, PageFacade, SeoService, UserSubjectFacade } from '../../../services/services';
import { AbstractPage } from '../AbstractPage';
import { Router, ActivatedRoute } from '@angular/router';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { PLATFORM_NAME_TH } from 'src/custom/variable';
import { SearchFilter } from '../../../models/SearchFilter';
import { environment } from 'src/environments/environment';
import { DialogCheckBox, DialogPostCrad, DialogAlert } from '../../components';


declare var $: any;

const PAGE_NAME: string = 'home';

@Component({
  selector: 'home-page-v3',
  templateUrl: './HomePageV3.component.html',
})
export class HomePageV3 extends AbstractPage implements OnInit {
  startDate: Date;
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public userCloneDatas: any;
  public isLoading: boolean;
  public showLoading: boolean;
  public isPostNewTab: boolean = false;
  public isRes: boolean = false;
  public windowWidth: any;
  public mainPageModelFacade: MainPageSlideFacade;
  public model: any = undefined;
  private hashTagFacade: HashTagFacade;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private seoService: SeoService;
  private userSubject: UserSubjectFacade;
  public hashTag: any = [];
  public pageUser: any;
  public startDateLong: number;
  public user: any;
  public testValues: any = undefined;
  public apiBaseURL = environment.apiBaseURL;
  public queryParamsUrl: any;

  maxDate = new Date();

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
    seoService: SeoService,
    userSubject: UserSubjectFacade,
    private route: ActivatedRoute
  ) {

    super(null, authenManager, dialog, router);
    this.route.queryParams.subscribe(params => {
      const rawDate = params['date'];
      if (rawDate) {
        const dateParts = rawDate.split('-');
        this.queryParamsUrl = new Date(`${dateParts[1]}-${dateParts[0]}-${dateParts[2]}`).getTime();
      }
      // You can use the value of the 'date' parameter here
    });
    this.startDate = new Date();
    this.pageFacade = pageFacade;
    this.mainPageModelFacade = mainPageModelFacade;
    this.assetFacade = assetFacade;
    this.hashTagFacade = hashTagFacade;
    this.seoService = seoService;
    this.userSubject = userSubject;
    this.showLoading = true;
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
  public async saveDate(event: any) {
    this.isLoading = true;
    this.user;
    this.startDateLong = new Date(event.value).getTime();
    const date = new Date(event.value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    this.mainPageModelFacade.getMainPageModelV3(this.user, this.startDateLong).then((res) => {
      this.model = res;
      this.testValues = new Date(this.startDateLong).toISOString(); // convert to ISO string
      localStorage.setItem('datetime', JSON.stringify(this.testValues));
      this.isLoading = false;
    }).catch((err) => {
      this.isLoading = false;
      this.testValues = new Date();
      this.dialog.open(DialogAlert, {
        disableClose: true,
        data: {
          text: 'ไม่พบหน้าหนึ่งฉบับวันที่',
          bottomText1: 'ตกลง',
          btDisplay1: "none"
        }
      });
      localStorage.removeItem('datetime')
    });
    this.router.navigate(['/home'], { queryParams: { date: formattedDate } });
  }
  public async getMainPageModelV3(userId?) {
    // 1678726800000
    let testDate = JSON.parse(localStorage.getItem('datetime'));
    if (testDate !== null) {
      this.testValues = testDate;
    }
    if (this.queryParamsUrl !== undefined) {
      this.mainPageModelFacade.getMainPageModelV3(userId, this.queryParamsUrl).then((res) => {
        this.testValues = new Date(this.queryParamsUrl).toISOString();
        this.model = res;
        for (let index = 0; index < this.model.postSectionModel.contents.length; index++) {
          if (this.model.postSectionModel.contents[index].post.type === "FULFILLMENT") {
            this.model.postSectionModel.contents.splice(index, 1);
          } else if (this.model.postSectionModel.contents[index].coverPageUrl === undefined) {
            this.model.postSectionModel.contents.splice(index, 1);
          }
        }
      }).catch((err) => {
        this.isLoading = false;
        this.testValues = new Date();
        this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: 'ไม่พบหน้าหนึ่งฉบับวันที่',
            bottomText1: 'ตกลง',
            btDisplay1: "none"
          }
        });
        localStorage.removeItem('datetime')
        this.router.navigate(['/home']);
      })
    }
    this.user = userId;
    this.isLoading = true;
    this.mainPageModelFacade.getMainPageModelV3(userId, this.startDateLong).then((res) => {
      this.model = res;
      for (let index = 0; index < this.model.postSectionModel.contents.length; index++) {
        if (this.model.postSectionModel.contents[index].post.type === "FULFILLMENT") {
          this.model.postSectionModel.contents.splice(index, 1);
        } else if (this.model.postSectionModel.contents[index].coverPageUrl === undefined) {
          this.model.postSectionModel.contents.splice(index, 1);
        }
      }
    }).catch((err) => {
      console.log('err', err);
    })


    // if (this.isLogin) {
    //   this.getSubject();
    // }
    this.showLoading = false;
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

  public getSubject() {
    this.userSubject.getSubject().then((res) => {
      if (res) {
        let dialog = this.dialog.open(DialogCheckBox, {
          disableClose: false,
          data: {
            title: 'Suggested Topics',
            subject: res,
            bottomText2: 'ตกลง',
            bottomColorText2: "black",
          }
        });
        dialog.afterClosed().subscribe((res) => {
          if (res) {
          }
        });
      }
    }).catch((err) => {
      if (err) {
        console.log("err", err)
      }
    })
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
          panelClass: 'dialog-postcard',
          backdropClass: 'dialog-postcard',
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

  public clickToPost(postId: any) {
    this.router.navigate([]).then(() => {
      window.open('/post/' + postId);
    });
  }

  public clickToPageUser(pageId: any, owner?: any) {
    this.router.navigate([]).then(() => {
      if (owner === 'objective') {
        window.open('/objective/' + pageId);
      } else {
        window.open('/page/' + pageId);
      }
    });
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

  @HostListener('window:resize', ['$event'])
  public getScreenSize(event?) {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth <= 479) {
      this.isPostNewTab = true;
    } else {
      this.isPostNewTab = false;
    }

    if (this.windowWidth <= 1024) {
      this.isRes = true;
    } else {
      this.isRes = false;
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
