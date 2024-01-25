/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
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
import { DialogDropdown } from '../../shares/dialog/DialogDropdown.component';
import {
  getSupportedInputTypes,
  Platform,
  supportsPassiveEventListeners,
  supportsScrollBehavior,
} from '@angular/cdk/platform';

declare var $: any;

const PAGE_NAME: string = 'home';
const TIMESTAMP_SNAPSHOT: string = 'snapshotTimestamp';
const SNAPSHOT_ID: string = 'listSnapshotId';

@Component({
  selector: 'home-page-v3',
  templateUrl: './HomePageV3.component.html',
})
export class HomePageV3 extends AbstractPage implements OnInit {
  supportedInputTypes = Array.from(getSupportedInputTypes()).join(', ');
  supportsPassiveEventListeners = supportsPassiveEventListeners();
  supportsScrollBehavior = supportsScrollBehavior();

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
  public announcement: any;
  public linkAnnounce = undefined;
  public listContent: any = [];
  public readContent: any[] = [];
  public hidebar: boolean = true;
  public isLoadingPost: boolean;
  // public throttle = 150;
  public scrollDistance = 3;
  public offset: number = 0;
  public limit: number = 4;
  public isOnLoad: boolean;
  public loadingCount: number = 0;
  public loadContentCount: number = 0;
  public followingContent: any;
  public followingProvinces: any;
  public pageFollowings: any;
  public emergencyFollowings: any;
  public objectiveFollowings: any;
  public userFollowings: any;
  public isReadPost: any;
  public readPost: any = [];
  public readedPost: any = [];
  public isConfirmTosUa: boolean = false;
  public isGetBottom: boolean = false;
  public countBlockBottom: number = 0;
  public paramToken: string;
  public paramUserId: string;
  public paramMode: string;

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
    observManager: ObservableManager,
    public platform: Platform
  ) {

    super(null, authenManager, dialog, router);
    this.route.queryParams.subscribe(params => {
      const rawDate = params['date'];
      const tokens = params['token'];
      const userid = params['userid'];
      const mode = params['mode'];
      if (tokens) {
        this.paramToken = tokens;
        localStorage.setItem('token', this.paramToken);
        sessionStorage.setItem('token', this.paramToken);
      }
      if (userid) this.paramUserId = userid;
      if (mode) {
        this.paramMode = mode;
        localStorage.setItem('mode', this.paramMode);
        sessionStorage.setItem('mode', this.paramMode);
      }
      if (tokens && mode) {
        this.authenManager.checkAccountStatus(tokens, mode, { updateUser: true });
      }
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

    this.observManager.subscribe('tos_ua_check', (result: any) => {
      if (result === true) {
        let pageUser = JSON.parse(localStorage.getItem('pageUser'));
        pageUser.tosVersion = 'v2';
        pageUser.uaVersion = 'v2';
        localStorage.setItem('pageUser', JSON.stringify(pageUser));
        this.isConfirmTosUa = true;
        this._selectProvince();
      }
    });
  }

  public ngOnInit(): void {
    this._getConfigAdminAnnouncement();
    this.hidebar = this.authenManager.getHidebar();
    let user = this.authenManager.getCurrentUser();
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      this.searchPageInUser(this.userCloneDatas.id);
      this.getMainPageModelV3(this.userCloneDatas.id);
    } else {
      this.searchPageInUser();
      this.getMainPageModelV3();
    }
    if (this.isLogin()) {
      this._getReadPost();
    }
    this._scrollIsRead();
    this._readHomeContent();
    this.stopIsloading();
    this.getScreenSize();
    this.getDateFilter();
    this._downloadApp();
    this._bindingMember();
    super.ngOnInit();
  }

  public ngOnDestroy(): void {
    this.observManager.complete('tos_ua_check');
  }

  private _getConfigAdminAnnouncement() {
    this.mainPageModelFacade.getConfigAnnouncement().then((res: any) => {
      if (res) {
        if (res.value === "true") {
          this.mainPageModelFacade.getAnnouncement().then((res: any) => {
            this.linkAnnounce = res.value;
          });
          this.mainPageModelFacade.getDefaultAnnouncement().then((res: any) => {
            this.announcement = res.value;
          });
        } else {
          this.linkAnnounce = undefined;
          this.mainPageModelFacade.getDefaultAnnouncement().then((res: any) => {
            this.announcement = res.value;
          });
        }
      }
    }).catch((err) => {
      if (err) { }
    });
  }

  private _getReadPost() {
    this.mainPageModelFacade.getReadPost().then((res) => {
      if (res) {
        this.readedPost = res;
      }
    }).catch((err) => {
      if (err) { }
    })
  }

  public async saveDate(event: any) {
    this.announcement;
    this.isLoading = true;
    this.user;
    this.startDateLong = new Date(event.value).getTime();
    const date = new Date(event.value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let formattedDate = `${day}-${month}-${year}`;
    this.mainPageModelFacade.getMainPageModelV3(this.user, this.startDateLong).then((res) => {
      if (res) {
        this.model = res.data.data;
        if (!!res.announcement) {
          this.announcement = res.announcement;
        }
        if (!!res.linkAnnounceMent) {
          this.linkAnnounce = res.linkAnnounceMent;
        }
        this._engageSnapshot(res.data.id ? res.data.id : res.data._id ? res.data._id : res._id ? res._id : res.id);
        const dateFormat = new Date(date);
        const dateReal = dateFormat.setDate(dateFormat.getDate());
        this.dateValues = new Date(dateReal).toISOString(); // convert to ISO string
        this.isLoading = false;
      }
    }).catch((err) => {
      if (err) {
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
        let dialog = this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: 'ไม่พบหน้าหนึ่งฉบับวันที่ ' + dateNow,
            bottomText1: 'ตกลง',
            btDisplay1: "none"
          }
        });
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            this.router.navigate(['/home']);
          }
        });
      }
      localStorage.removeItem('datetime')
    });
    if (!!this.paramToken && !!this.paramUserId && !!this.paramMode) {
      this.router.navigate(['/home'], { queryParams: { date: formattedDate, token: this.paramToken, userid: this.paramUserId, mode: this.paramMode } });
    } else {
      this.router.navigate(['/home'], { queryParams: { date: formattedDate } });
    }
  }

  public async getBottomContent(userId?) {
    const filter: any = {};
    filter.whereConditions = {};
    filter.orderBy = {};
    let post;
    if (userId) {
      if (this.loadContentCount > 0) {
        this.offset += this.limit;
      }
      if (this.loadingCount === 0) {
        post = 'isReadPost';
      } else if (this.loadingCount === 1) {
        post = 'pageFollowings';
      } else if (this.loadingCount === 2) {
        post = 'emergencyFollowings';
      } else if (this.loadingCount === 3) {
        post = 'objectiveFollowings';
      } else if (this.loadingCount === 4) {
        post = 'userFollowings';
      } else if (this.loadingCount === 5) {
        post = 'followingProvinces';
      } else {
        post = 'followingContent';
      }
      this.mainPageModelFacade.bottomContent(userId, this.offset, this.limit, post, filter).then((res) => {
        if (res) {
          if (this.isOnLoad === true) {
            if (this.loadingCount === 0) {
              this.isReadPost = res;
            } else if (this.loadingCount === 1) {
              this.pageFollowings = res;
            } else if (this.loadingCount === 2) {
              this.emergencyFollowings = res;
            } else if (this.loadingCount === 3) {
              this.objectiveFollowings = res;
            } else if (this.loadingCount === 4) {
              this.userFollowings = res;
            } else if (this.loadingCount === 5) {
              this.followingProvinces = res;
            } else if (this.loadingCount === 6) {
              if (res.followingContents.contents.length === 0) {
                this.countBlockBottom++;
              }
              if (this.countBlockBottom === 3) {
                this.isGetBottom = true;
              }
              if (res.followingContents.contents.length !== 0) {
                if (this.loadContentCount > 0) {
                  let data = this.followingContent.followingContents.contents.concat(res.followingContents.contents);
                  this.followingContent.followingContents.contents = data;
                } else {
                  this.followingContent = res;
                  this.loadContentCount++;
                }
              }
            }
            if (post === 'followingContent') {
              this.loadingCount === 6;
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
    } else {
      if (this.loadContentCount > 0) {
        this.offset += this.limit;
      }
      if (this.loadingCount === 0) {
        post = 'isReadPost';
      } else {
        post = 'followingContent';
      }
      this.mainPageModelFacade.bottomContent(null, this.offset, this.limit, post).then((res) => {
        if (res) {
          if (this.isOnLoad === true) {
            if (this.loadingCount === 0) {
              this.isReadPost = res;
            } else if (this.loadingCount === 1) {
              if (res.followingContents.contents.length === 0) {
                this.countBlockBottom++;
              }
              if (this.countBlockBottom === 3) {
                this.isGetBottom = true;
              }
              if (res.followingContents.contents.length !== 0) {
                if (this.loadContentCount > 0) {
                  let data = this.followingContent.followingContents.contents.concat(res.followingContents.contents);
                  this.followingContent.followingContents.contents = data;
                } else {
                  this.followingContent = res;
                  this.loadContentCount++;
                }
              }
            }
            if (post === 'followingContent') {
              this.loadingCount === 1;
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
  }

  public async getMainPageModelV3(userId?) {
    // 1678726800000
    let testDate = JSON.parse(localStorage.getItem('datetime'));
    if (testDate !== null) {
      this.dateValues = testDate;
    }
    if (!!this.queryParamsUrl) {
      this.mainPageModelFacade.getMainPageModelV3(userId, (this.queryParamsUrl ? this.queryParamsUrl : null)).then((res) => {
        if (res) {
          this.dateValues = new Date(this.queryParamsUrl).toISOString();
          this.model = res.data.data;
          if (!this.isConfirmTosUa) {
            this._selectProvince();
          }
          this._engageSnapshot(res.data.id ? res.data.id : res.data._id ? res.data._id : res._id ? res._id : res.id);
          for (let index = 0; index < this.model.postSectionModel.contents.length; index++) {
            if (this.model.postSectionModel.contents[index].post.type === "FULFILLMENT") {
              this.model.postSectionModel.contents.splice(index, 1);
            } else if (this.model.postSectionModel.contents[index].coverPageUrl === undefined) {
              this.model.postSectionModel.contents.splice(index, 1);
            }
          }
        }
      }).catch((err) => {
        if (err) {
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
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: 'ไม่พบหน้าหนึ่งฉบับวันที่',
              text2: dateNow,
              bottomText1: 'ตกลง',
              btDisplay1: "none"
            }
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.router.navigate(['/home']);
            }
          });
          localStorage.removeItem('datetime')
          this.router.navigate(['/home']);
        }
      });
    } else {
      if (!this.queryParamsUrl) {
        this.user = userId;
        this.isLoading = true;
        await this.mainPageModelFacade.getMainPageModelV3(userId, this.startDateLong).then((res) => {
          if (res) {
            this.model = res.data.data ? res.data.data : res.data;
            if (!this.isConfirmTosUa) {
              this._selectProvince();
            }
            this._engageSnapshot(res.data.id ? res.data.id : res.data._id ? res.data._id : res._id ? res._id : res.id);
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
        });
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

  private _engageSnapshot(snapshot) {
    const dateFormat = new Date();
    const dateReal = dateFormat.setDate(dateFormat.getDate());
    const dates = new Date(dateReal).toISOString(); // convert to ISO string
    this.mainPageModelFacade.snapshot(snapshot, dates).then((res) => {

    }).catch((err) => {
      if (err) { }
    })
  }

  private _selectProvince() {
    let pageUser = JSON.parse(localStorage.getItem('pageUser'));
    if (this.isLogin() && this.hidebar) {
      if (!!pageUser && pageUser!!.tosVersion && pageUser!!.uaVersion && !this.isConfirmTosUa) {
        this._getProvince();
        let array = [];
        for (let page of this.pageUser) {
          if ((!page.province || !page.group) && page.ownerUser) {
            let data = {
              id: page.id,
              name: page.pageUsername ? page.pageUsername : page.name,
              province: page.province ? true : false,
              group: page.group ? true : false,
            }
            array.push(data);
          }
        }
        if (array.length > 0) {
          this._getProvince(array);
        }
      } else if (this.isConfirmTosUa) {
        this._getProvince();
        let array = [];
        for (let page of this.pageUser) {
          if ((!page.province || !page.group) && page.ownerUser) {
            let data = {
              id: page.id,
              name: page.pageUsername ? page.pageUsername : page.name,
              province: page.province ? true : false,
              group: page.group ? true : false,
            }
            array.push(data);
          }
        }
        if (array.length > 0) {
          this._getProvince(array);
        }
      }
    }
  }

  public searchPageInUser(userId?) {
    if (userId) {
      let search: SearchFilter = new SearchFilter();
      search.limit = 2;
      search.count = false;
      search.whereConditions = { ownerUser: userId };
      this.pageFacade.search(search).then((pages: any) => {
        this.pageUser = pages;
        this.pageUser.push(this.userCloneDatas);
        this.pageUser.reverse();
        if (this.pageUser.length > 0) {
          for (let p of this.pageUser) {
            if (!p.signURL) {
              this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
                p.img64 = res.data;
              }).catch((err: any) => {
                console.log("err", err);
              });
            }
          }
        }
      }).catch((err: any) => {
        console.log("err", err);
      });
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

  private _getProvince(data?) {
    if (!data) {
      let pageUser = JSON.parse(localStorage.getItem('pageUser'));
      if (!pageUser!.province) {
        let dialog = this.dialog.open(DialogDropdown, {
          disableClose: true,
          data: {
            text: 'กรุณาเลือกจังหวัดของคุณ',
            pageId: pageUser.id,
            type: 'USER',
            isProvince: false,
            bottomColorText2: "black"
          }
        });
      }
    } else {
      let dialog = this.dialog.open(DialogDropdown, {
        disableClose: true,
        data: {
          data
        }
      });
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

  public isEmptyObject(obj) {
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
      } else if (owner === 'USER' || pageId.type === 'USER') {
        if (pageId.type) {
          window.open('/profile/' + pageId.ownerid);
        } else {
          window.open('/profile/' + pageId);
        }
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

  private _checkWebView() {
    let isCheck: boolean;
    if (!!this.paramMode && !!this.paramToken && !!this.paramUserId) {
      isCheck = true;
    } else {
      isCheck = false;
    }

    return isCheck;
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
            if (this.listContent[index] !== undefined) {
              this.readContent.push(this.listContent[index]);
            }
          }
        }
      }
    }
  }

  private async _readHomeContent() {
    if (this.isLogin() || this._checkWebView()) {
      let userId = !this._checkWebView() ? this.userCloneDatas.id : this.paramUserId;
      if (this.readContent.length > 0) {
        if (this.readPost.length !== 0) {
          for (var i = this.readContent.length - 1; i >= 0; i--) {
            for (var j = 0; j < this.readPost.length; j++) {
              if (this.readContent[i] === this.readPost[j]) {
                this.readContent.splice(i, 1);
              }
            }
          }
          for (var i = this.readContent.length - 1; i >= 0; i--) {
            for (var j = 0; j < this.readedPost.length; j++) {
              if (this.readContent[i] === this.readedPost[j]) {
                this.readContent.splice(i, 1);
              }
            }
          }
        }
        if (this.readContent.length > 0) {
          await this.mainPageModelFacade.readContent(userId, this.readContent, this.paramMode, this.paramToken).then((res: any) => {
            if (res) {
              for (let index = 0; index < res.isReadPost.length; index++) {
                this.readPost.push(res.isReadPost[index]._id);
                let array = this.readPost.filter((item, index) => this.readPost.indexOf(item) === index);
                this.readPost = array;
              }
            }
          }).catch((err) => {
            if (err) { }
          });
        }
      }
    }
  }

  public async onScrollDown(ev) {
    if (this.isLogin() && !this.isLoadingPost && !this.isGetBottom && this.hidebar) {
      this.isOnLoad = true;
      this.isLoadingPost = true;
      await this.getBottomContent(this.userCloneDatas.id);
    } else if (!this.isLogin() && !this.isLoadingPost && !this.isGetBottom && this.hidebar) {
      this.isOnLoad = true;
      this.isLoadingPost = true;
      await this.getBottomContent();
    }

  }

  private _downloadApp() {
    if ((this.platform.IOS || this.platform.ANDROID) && this.hidebar) {
      let dateStamp = localStorage.getItem('timeStampAppEx');
      let date = Date.now();
      let daysDiff = date - Number(dateStamp);
      const dayCal = 24 * 60 * 60 * 1000
      const daysCalDiff = Math.round(daysDiff / dayCal)
      let appEx = localStorage.getItem('appExperience');
      let platform;
      if (this.platform.IOS) {
        platform = 'ios';
      }
      if (this.platform.ANDROID) {
        platform = 'android';
      }
      if (appEx !== 'downloaded' && daysCalDiff >= 30) {
        this.dialog.open(DialogAlert, {
          disableClose: true,
          maxWidth: '100%',
          data: {
            text: '',
            bottomText1: 'ไม่ใช่ตอนนี้',
            bottomText2: 'ดาวน์โหลดเลย',
            options: 'download',
            type: platform ? platform : 'browser'
          },
          position: this.isRes1 ? { bottom: '0' } : { top: '' },
        });
      }
    }
  }

  private _bindingMember() {
    let isMember = this.authenManager.getUserMember();
    let askBinding = localStorage.getItem('notShowMemberDialog');
    if (askBinding === null) {
      localStorage.setItem('notShowMemberDialog', String(false));
      askBinding = String(false);
    }
    if (this.isLogin() && this.hidebar && !isMember && askBinding === 'false') {
      this.showDialogMember();
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
