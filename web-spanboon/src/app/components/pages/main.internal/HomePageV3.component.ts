/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDatepickerInputEvent, MatDialog } from '@angular/material';
import { Gallery } from '@ngx-gallery/core';
import { AbstractPage } from '../AbstractPage';
import { Router, ActivatedRoute } from '@angular/router';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { PLATFORM_NAME_TH } from 'src/custom/variable';
import { SearchFilter } from '../../../models/SearchFilter';
import { environment } from 'src/environments/environment';
import { MainPageSlideFacade } from 'src/app/services/facade/MainPageSlideFacade.service';
import { HashTagFacade } from 'src/app/services/facade/HashTagFacade.service';
import { PageFacade } from 'src/app/services/facade/PageFacade.service';
import { AssetFacade } from 'src/app/services/facade/AssetFacade.service';
import { SeoService } from 'src/app/services/SeoService.service';
import { UserSubjectFacade } from 'src/app/services/facade/UserSubjectFacade.service';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { DialogCheckBox } from '../../shares/dialog/DialogCheckBox.component';
import { DialogPostCrad } from '../../shares/dialog/DialogPostCrad.component';
import { debounce } from '../../shares/directive/DebounceScroll.directive';
import { ObservableManager } from 'src/app/services/ObservableManager.service';

declare var $: any;

const PAGE_NAME: string = 'home';
const ANNOUNCE_DEFAULT: string = 'ต้องก้าวไกลให้ไทยก้าวหน้า เปลี่ยนรัฐบาลไม่พอ ต้องเปลี่ยนประเทศ';

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
  public isRes1: boolean = false;
  public isAnnounce: boolean = false;
  public isKaokai: boolean = false;
  public isOldContent: boolean = false;
  public windowWidth: any;
  public mainPageModelFacade: MainPageSlideFacade;
  public model: any = undefined;
  public modelBottom: any = undefined;
  private hashTagFacade: HashTagFacade;
  private pageFacade: PageFacade;
  private postFacade: PostFacade;
  private assetFacade: AssetFacade;
  private seoService: SeoService;
  private userSubject: UserSubjectFacade;
  private observManager: ObservableManager;
  public hashTag: any = [];
  public pageUser: any;
  public startDateLong: number;
  public user: any;
  public dateValues: any = undefined;
  public apiBaseURL = environment.apiBaseURL;
  public queryParamsUrl: any;
  public filterDate: any = [];
  public filterMonth: any = [];
  public announcement = ANNOUNCE_DEFAULT;
  public linkAnnounce = undefined;
  public listContent: any = [];
  public readContent: any[] = [];
  public hidebar: boolean = true;
  public isLoadingPost: boolean;
  public throttle = 150;
  public scrollDistance = 2;
  public offset: number = 0;
  public limit: number = 8;
  public followOffset: number = 0;
  public followLimit: number = 2;
  public isOnLoad: boolean;
  public loadingCount: number = 0;
  public loadContentCount: number = 0;
  public followingContent: any;
  public followingProvinces: any;
  public isFollowings: any;
  public isReadPost: any;

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
    private route: ActivatedRoute,
    observManager: ObservableManager
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
    this.postFacade = postFacade;
    this.mainPageModelFacade = mainPageModelFacade;
    this.assetFacade = assetFacade;
    this.hashTagFacade = hashTagFacade;
    this.seoService = seoService;
    this.userSubject = userSubject;
    this.showLoading = true;
    this.observManager = observManager;
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
    this._scrollIsRead();
    this._readHomeContent();
    this.stopIsloading();
    this.getScreenSize();
    this.getDateFilter();
    this.hidebar = this.authenManager.getHidebar();
    super.ngOnInit();
  }

  public ngOnDestroy(): void {
  }

  public async saveDate(event: any) {
    this.announcement = ANNOUNCE_DEFAULT;
    this.linkAnnounce = undefined;
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
      if (!!res.announcement) {
        this.announcement = res.announcement;
      }
      if (!!res.linkAnnounceMent) {
        this.linkAnnounce = res.linkAnnounceMent;
      }
      const dateFormat = new Date(date);
      const dateReal = dateFormat.setDate(dateFormat.getDate());
      this.dateValues = new Date(dateReal).toISOString(); // convert to ISO string
      localStorage.setItem('datetime', JSON.stringify(this.dateValues));
      this.isLoading = false;
    }).catch((err) => {
      const thaiDay = new Date(this.queryParamsUrl).toLocaleDateString('th-TH', {
        day: 'numeric',
      });
      const thaiMonth = new Date(this.queryParamsUrl).toLocaleDateString('th-TH', {
        month: 'long',
      });
      const thaiYear = new Date(this.queryParamsUrl).toLocaleDateString('th-TH', {
        year: 'numeric',
      });
      const dateNow = thaiDay + ' ' + thaiMonth + ' ' + thaiYear;
      this.isLoading = false;
      this.dateValues = new Date();
      this.dialog.open(DialogAlert, {
        disableClose: true,
        data: {
          text: 'ไม่พบหน้าหนึ่งฉบับวันที่ ' + dateNow,
          bottomText1: 'ตกลง',
          btDisplay1: "none"
        }
      });
      localStorage.removeItem('datetime')
    });
    this.router.navigate(['/home'], { queryParams: { date: formattedDate } });
  }

  public async getBottomContent(userId?) {
    const filter: any = {};
    filter.whereConditions = {};
    filter.orderBy = {};
    let post;
    if (this.loadingCount === 0) {
      post = 'isReadPost';
    } else if (this.loadingCount === 1) {
      post = 'isFollowings';
    } else if (this.loadingCount === 2) {
      post = 'followingProvinces';
    } else {
      post = 'followingContent';
      this.offset += this.limit;
      this.followOffset += this.followLimit;
    }
    this.mainPageModelFacade.bottomContent(userId, filter, this.offset, this.limit, this.followOffset, this.followLimit, post).then((res) => {
      if (res) {
        if (this.isOnLoad === true) {
          if (this.loadingCount === 0) {
            this.isReadPost = res;
          } else if (this.loadingCount === 1) {
            this.isFollowings = res;
          } else if (this.loadingCount === 2) {
            this.followingProvinces = res;
          } else if (this.loadingCount === 3) {
            if (res.followingContents.contents.length !== 0) {
              this.followingContent = res;
            }
            if (this.followingContent.contents.length !== 0) {
              this.loadContentCount++;
            }
          }
          if (post === 'followingContent') {
            this.loadingCount === 3;
            this.isOnLoad = false;
            this.isLoadingPost = false;
          } else {
            this.loadingCount++;
            this.isOnLoad = false;
            this.isLoadingPost = false;
          }
        } else {
          this.modelBottom = res;
        }
      }
    }).catch((err) => {
      if (err) {
        this.isOnLoad = false;
        this.isLoadingPost = false;
      }
    })
  }

  public async getMainPageModelV3(userId?) {
    // 1678726800000
    let testDate = JSON.parse(localStorage.getItem('datetime'));
    if (testDate !== null) {
      this.dateValues = testDate;
    }
    if (!!this.queryParamsUrl) {
      this.mainPageModelFacade.getMainPageModelV3(userId, (this.queryParamsUrl ? this.queryParamsUrl : null)).then((res) => {
        this.dateValues = new Date(this.queryParamsUrl).toISOString();
        this.model = res;
        if (!!res.announcement) {
          this.announcement = res.announcement;
        }
        if (!!res.linkAnnounceMent) {
          this.linkAnnounce = res.linkAnnounceMent;
        }
        for (let index = 0; index < this.model.postSectionModel.contents.length; index++) {
          if (this.model.postSectionModel.contents[index].post.type === "FULFILLMENT") {
            this.model.postSectionModel.contents.splice(index, 1);
          } else if (this.model.postSectionModel.contents[index].coverPageUrl === undefined) {
            this.model.postSectionModel.contents.splice(index, 1);
          }
        }
      }).catch((err) => {
        const thaiDay = new Date(this.queryParamsUrl).toLocaleDateString('th-TH', {
          day: 'numeric',
        });
        const thaiMonth = new Date(this.queryParamsUrl).toLocaleDateString('th-TH', {
          month: 'long',
        });
        const thaiYear = new Date(this.queryParamsUrl).toLocaleDateString('th-TH', {
          year: 'numeric',
        });
        const dateNow = thaiDay + ' ' + thaiMonth + ' ' + thaiYear;
        this.isLoading = false;
        this.dateValues = new Date();
        this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: 'ไม่พบหน้าหนึ่งฉบับวันที่',
            text2: dateNow,
            bottomText1: 'ตกลง',
            btDisplay1: "none"
          }
        });
        localStorage.removeItem('datetime')
        this.router.navigate(['/home']);
      })
    } else {
      if (!this.queryParamsUrl) {
        this.user = userId;
        this.isLoading = true;
        await this.mainPageModelFacade.getMainPageModelV3(userId, this.startDateLong).then((res) => {
          if (res) {
            this.model = res.data ? res.data : res;
            if (!!res.announcement || !!res.data.announcement) {
              this.announcement = res.announcement ? res.announcement : res.data.announcement;
            }
            if (!!res.linkAnnounceMent || !!res.data.linkAnnounceMent) {
              this.linkAnnounce = res.linkAnnounceMent ? res.linkAnnounceMent : res.data.linkAnnounceMent;
            }

            const dateFormat = new Date();
            const dateReal = dateFormat.setDate(dateFormat.getDate());
            this.dateValues = new Date(dateReal).toISOString(); // convert to ISO string
            localStorage.setItem('datetime', JSON.stringify(this.dateValues));
            for (let index = 0; index < this.model.postSectionModel.contents.length; index++) {
              if (this.model.postSectionModel.contents[index].post.type === "FULFILLMENT") {
                this.model.postSectionModel.contents.splice(index, 1);
              } else if (this.model.postSectionModel.contents[index].coverPageUrl === undefined) {
                this.model.postSectionModel.contents.splice(index, 1);
              }
            }
          }
        }).catch((err) => {
          console.log('err', err);
        })
      }
    }


    // if (this.isLogin) {
    //   this.getSubject();
    // }
    // if (this.isLogin()) {
    //   this.getBottomContent(this.userCloneDatas.id);
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

  dateFilt: any

  dateFilter: (dateFilt: Date | null) => boolean =
    (dateFilt: Date | null) => {
      const day = (dateFilt || new Date()).getDate().toString().padStart(2, '0');
      const month = (dateFilt.getMonth() + 1).toString().padStart(2, '0');
      const year = (dateFilt.getFullYear());
      const md = day + '-' + month + '-' + year;
      for (let d of this.filterDate) {
        if (md === d.toString()) {
          const split = d.split('-');
          const daySplit = split[0];
          if (Number(day) === Number(daySplit)) {
            return Number(day) === Number(daySplit);
          }
        }
      }
    }

  public getDateFilter() {
    this.mainPageModelFacade.getDate().then((res) => {
      if (res) {
        let listDay: any[] = [];
        let listMonth: any[] = [];
        for (let date of res) {
          let enddate = date.endDateTime;
          const split = enddate.split('-');
          const getDays = split[2];
          const getMonths = split[1];
          const getYear = split[0];
          const splitTime = getDays.split('T');
          const days = splitTime[0];
          const daymonth = days + '-' + getMonths + '-' + getYear;
          listMonth.push(getMonths);
          listDay.push(daymonth);
        }
        this.filterMonth = listMonth;
        this.filterDate = listDay;

      }
    }).catch((error) => {
      if (error) {
        console.log("error", error)
      }
    })
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

  private isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
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
    if (postId.type === 'USER') {
      this.router.navigate([]).then(() => {
        window.open('/profile/' + postId.userid + '/post/' + postId.idpost);
      });
    } else {
      this.router.navigate([]).then(() => {
        window.open('/post/' + postId);
      });
    }
  }

  public clickToPageUser(pageId: any, owner?: any) {
    this.router.navigate([]).then(() => {
      if (owner === 'objective') {
        window.open('/objective/' + pageId);
      } else if (owner === 'post') {
        window.open('/post/' + pageId);
      } else if (owner === 'USER') {
        window.open('/profile/' + pageId);
      } else if (owner === 'EMERGENCY') {
        window.open('/emergencyevent/' + pageId);
      } else if (owner === 'OBJECTIVE') {
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
      this.isAnnounce = true;
      this.isKaokai = true;
      this.isRes1 = true;
    } else {
      this.isPostNewTab = false;
      this.isAnnounce = false;
      this.isKaokai = false;
      this.isRes1 = false;
    }

    if (this.windowWidth <= 1024) {
      this.isRes = true;
    } else {
      this.isRes = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  @debounce(1000)
  scroll(event) {
    this._readHomeContent();
    window.addEventListener('scroll', (event) => {
      this._scrollIsRead();
      this._scrollAddPost();

    });
  }

  private _scrollAddPost() {
    setTimeout(() => {
      let list = document.getElementsByClassName("card-content");
      let leng = list.length;
      let div = document.getElementsByClassName("idpost");
      for (let index = 0; index < leng; index++) {
        if (div[index]) {
          let doc = div[index].innerHTML;
          this.listContent.push(doc)
          let array = this.listContent.filter((item, index) => this.listContent.indexOf(item) === index);
          this.listContent = array;
        }
      }
    }, 2000);
  }

  private _scrollIsRead() {
    const winH = window.innerHeight;
    const classCard: any = document.getElementsByClassName('card-content');
    if (!!classCard) {
      for (let index = 0; index < classCard.length; index++) {
        if (classCard[index].getBoundingClientRect().top <= winH) {
          const result = this.readContent.filter(res => res === this.listContent[index]);
          if (result.length <= 0) {
            this.readContent.push(this.listContent[index]);
          }
        }
      }
    }
  }

  private async _readHomeContent() {
    if (this.isLogin()) {
      let userId = this.userCloneDatas.id;
      if (this.readContent.length > 0) {
        try {
          await this.mainPageModelFacade.readContent(userId, this.readContent);
        } catch (error) {
          console.log("err", error);
        }
      }
    }
  }

  public async onScrollDown(ev) {
    if (this.isLogin() && !this.isLoadingPost) {
      this.isOnLoad = true;
      this.isLoadingPost = true;
      await this.getBottomContent(this.userCloneDatas.id);
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
