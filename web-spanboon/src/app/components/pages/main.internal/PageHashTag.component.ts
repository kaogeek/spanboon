/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PostCommentFacade, PageFacade, HashTagFacade, MainPageSlideFacade, EmergencyEventFacade, PageCategoryFacade, PostFacade, AccountFacade, Engagement, UserEngagementFacade } from '../../../services/services';
import { DateAdapter, MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { FileHandle } from '../../shares/directive/directives';
import * as $ from 'jquery';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BoxPost, DialogReboonTopic } from '../../shares/shares';
import { ChangeContext, LabelType, Options, PointerType } from 'ng5-slider';
import { SearchFilter } from '../../../../app/models/SearchFilter';
import { environment } from '../../../../environments/environment';
import { CommentPosts } from '../../../models/CommentPosts';
import { POST_TYPE, SORT_BY } from '../../../TypePost';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { RePost } from '../../../models/RePost';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { UserEngagement } from '../../../models/UserEngagement';

const PAGE_NAME: string = 'search';
const SEARCH_LIMIT: number = 20;
const SEARCH_OFFSET: number = 0;
const URL_PATH_HASHTAG: string = '?hashtag';

declare var $: any;

@Component({
  selector: 'page-hashtag',
  templateUrl: './PageHashTag.component.html',
})
export class PageHashTag extends AbstractPageImageLoader implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  protected isIconPage: boolean;
  @Input()
  protected text: string = "ข้อความ";

  public links = [{ label: 'ทั้งหมด', keyword: 'timeline' }, { label: this.PLATFORM_GENERAL_TEXT, keyword: 'general' }, { label: this.PLATFORM_NEEDS_TEXT, keyword: 'needs' }, { label: this.PLATFORM_FULFILL_TEXT, keyword: 'fulfillment' }];
  public activeLink = this.links[0].label;

  filterType: 'เฉพาะที่คุณติดตาม' | 'ทั้งหมด' | 'กำหนดเอง' = 'ทั้งหมด';

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild("recommendedRight", { static: true }) recommendedRight: ElementRef;
  @ViewChild("recommendedLeft", { static: true }) recommendedLeft: ElementRef;
  @ViewChild("feedbodysearch", { static: false }) feedbodysearch: ElementRef;
  @ViewChild("inputAutocomp", { static: true }) inputAutocomp: ElementRef;

  @Output()
  public submitRemove: EventEmitter<any> = new EventEmitter();

  private objectiveFacade: ObjectiveFacade;
  private assetFacade: AssetFacade;
  private routeActivated: ActivatedRoute;
  private searchHashTagFacade: HashTagFacade;
  private postCommentFacade: PostCommentFacade;
  private postFacede: PostFacade;
  private emergencyEventFacade: EmergencyEventFacade;
  private mainPageFacade: MainPageSlideFacade;
  private accountFacade: AccountFacade;
  private hashTagFacade: HashTagFacade;
  protected observManager: ObservableManager;
  private pageCategoryFacade: PageCategoryFacade;
  private pageFacade: PageFacade;
  private dateAdapter: DateAdapter<Date>;
  private engagementService: Engagement;
  private userEngagementFacade: UserEngagementFacade;

  public resDataPage: any;
  public resObjective: any;
  public url: string;
  public subPage: string;
  public isLoading: boolean;
  public isOpen: boolean;
  public isAdvance: boolean;
  public isAdvanceRich: boolean;
  public isRowCard: boolean;
  public msgPageNotFound: boolean;
  public isBackdrop: boolean;
  public scrollMobile: boolean;
  public showLoading: boolean;
  public isLoadMorePageCategory: boolean;
  public isLoadMorePageEmergency: boolean;
  public isLoadMoreObjective: boolean;
  public isLoadMoreHashTag: boolean;
  public isLoadingClickTab: boolean;
  public imageCoverSize: number;
  public position: number;
  public dataTrend: any[] = [];
  public resHashTag: any;
  public whereConditions: string[];
  public urlHashTag: string;
  public searchHashtag: string;
  public matHashTag: any[] = []
  public resEmergency: any[] = []
  public resPageType: any[] = []
  public dataListTag: any;
  public test: any;
  public sorting: any;
  public rowUser: any;
  public userId: any;
  public keyword: string[] = [];
  public dataUser: any;
  public resPost: any;
  public page: any;
  public pageCateUrl: any;
  public type: string;
  public createdName: any;
  public emergency: any;
  public emergencyUrl: any;
  public objective: any;
  public objectiveUrl: any;
  public location: any;
  public startDate: any;
  public endDate: any;
  public startDateLong: number;
  public endDateLong: number;
  public startCommentCount: number;
  public endCommentCount: number;
  public startViewCount: number;
  public endViewCount: number;
  public startActionCount: number;
  public endActionCount: number;
  public startRepostCount: number;
  public endRepostCount: number;
  public startLikeCount: number;
  public endLikeCount: number;
  public startShareCount: number;
  public endShareCount: number;
  public pageCategories: number;
  public countEngagement: number;
  public prevOld: number = 0;
  public userCloneDatas: any
  public follow: boolean;
  public isLoadingPost: boolean;
  public isMaxLoadingPost: boolean;

  public postId: any
  public isFollow: boolean = true;
  public item: any;
  public sort: any;
  public widthBtn: any;
  public heightBtn: any;
  public fontSize: any;

  mySubscription: any;
  selectedDate: any;

  minDate = new Date(1800, 0, 1);
  maxDate = new Date();

  public apiBaseURL = environment.apiBaseURL;
  public selectable: any;
  public removable: any;
  public isNotAccess: any;
  public pageUser: any;
  public userImage: any;
  public index: any;

  sortingBy = [{
    name: 'วันที่ล่าสุด',
    type: SORT_BY.LASTEST_DATE
  }, {
    name: 'ที่ได้รับความนิยม',
    type: SORT_BY.POPULAR
  }, {
    name: 'ที่เกี่ยวข้อง',
    type: SORT_BY.RELATED
  }];
  public sortBy = this.sortingBy[0].name

  public advance: any;
  value: number = 0;
  highValue: number = 60;
  highValueShare: number = 0;
  minView: number = 0;
  maxView: number;
  minEngagment: number = 0;
  maxEngagment: number = 0;

  options: Options = {
    floor: 0,
    ceil: 100,
  };
  optionsView: Options = {
    floor: 0,
    ceil: 100
  };
  optionsEngagment: Options = {
    floor: 0,
    ceil: 0
  };

  public engagement = [{
    topic: 'โพสต์',
    floor: 0,
    value: 0,
    highValue: 0,
    ceil: 0
  }, {
    topic: 'คลิก',
    floor: 0,
    value: 0,
    highValue: 0,
    ceil: 0
  }];

  files: FileHandle[] = [];
  constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager, pageFacade: PageFacade, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade, hashTagFacade: HashTagFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute, postCommentFacade: PostCommentFacade, searchHashTagFacade: HashTagFacade, mainPageFacade: MainPageSlideFacade, dateAdapter: DateAdapter<Date>, emergencyEventFacade: EmergencyEventFacade,
    pageCategoryFacade: PageCategoryFacade, postFacede: PostFacade, accountFacade: AccountFacade, engagementService: Engagement, userEngagementFacade: UserEngagementFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog
    this.objectiveFacade = objectiveFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.postCommentFacade = postCommentFacade;
    this.routeActivated = routeActivated;
    this.searchHashTagFacade = searchHashTagFacade;
    this.mainPageFacade = mainPageFacade;
    this.emergencyEventFacade = emergencyEventFacade;
    this.hashTagFacade = hashTagFacade;
    this.postFacede = postFacede;
    this.pageCategoryFacade = pageCategoryFacade;
    this.accountFacade = accountFacade;
    this.pageFacade = pageFacade;
    this.engagementService = engagementService;
    this.userEngagementFacade = userEngagementFacade;
    this.isOpen = false;
    this.isAdvance = false;
    this.isAdvanceRich = false;
    this.isRowCard = false;
    this.isLoadingPost = false;
    this.whereConditions = ["name"];
    this.isBackdrop = false;
    this.showLoading = true;

    this.page = [];
    this.pageCateUrl = [];
    this.rowUser = [];
    this.userId = [];
    this.startDate = {};
    this.resObjective = [];
    this.resHashTag = [];
    this.resPost = [];
    this.userImage = {};

    this.dateAdapter = dateAdapter;
    this.dateAdapter.setLocale('th-TH');

    this.minDate.setDate(this.minDate.getDate());
    this.minDate.setFullYear(this.minDate.getFullYear() - 200);
    this.maxDate.setDate(this.maxDate.getDate());
    this.maxDate.setFullYear(this.maxDate.getFullYear());

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.url = decodeURI(this.router.url);
        this.urlHashTag = undefined;

        if (this.url.indexOf(PAGE_NAME) >= 0) {
          let substringPath: string = this.url.substring(this.url.indexOf(PAGE_NAME), this.url.length);

          if (substringPath.startsWith('?')) {
            substringPath = substringPath.substring(1, substringPath.length);
          } else if (substringPath.includes('/search')) {
            this.searchTrendTag();
          }
          const splitText = substringPath.split('&');
          for (let text of splitText) {
            if (text.includes('hashtag')) {
              const dataHashtag = text.split('=')[1].split(',');
              if (dataHashtag.length > 0) {
                for (let data of dataHashtag) {
                  if (data.includes('#')) {
                    this.matHashTag.push(data.substring(1, data.length));
                  } else {
                    this.matHashTag = text.split('=')[1].split(',');
                  }
                }
              }
            } else if (text.includes('keyword')) {
              this.keyword = text.split('=')[1].split(',');
            } else if (text.includes('follow')) {
              this.follow = Boolean(JSON.parse(text.split('=')[1].toLowerCase()));
              if (this.follow) {
                this.filterType = 'เฉพาะที่คุณติดตาม';
              } else {
                this.filterType = 'ทั้งหมด';
              }
            } else if (text.includes('createdby')) {
              this.filterType = 'กำหนดเอง';
              this.createdName = text.split('=')[1];
            } else if (text.includes('pagecategory')) {
              this.pageCateUrl = text.split('=')[1].split(',');
            } else if (text.includes('location')) {
              this.location = text.split('=')[1];
            } else if (text.includes('startdate')) {
              const convertDate = Number(text.split('=')[1]);
              let date = new Date(convertDate);
              this.startDate = { begin: date }
            } else if (text.includes('enddate')) {
              const convertDate = Number(text.split('=')[1]);
              this.endDate = new Date(convertDate);
              Object.assign(this.startDate, { end: this.endDate })
            } else if (text.includes('emergency')) {
              this.emergencyUrl = text.split('=')[1].split(',');
              this.emergencyUrl = this.emergencyUrl.pop();
            } else if (text.includes('objective')) {
              this.objectiveUrl = text.split('=')[1].split(',');
              // this.objectiveUrl = this.objectiveUrl.pop();
            } else if (text.includes('startcommentcount')) {
              this.startCommentCount = Number(text.split('=')[1]);
            } else if (text.includes('endcommentcount')) {
              this.endCommentCount = Number(text.split('=')[1]);
            } else if (text.includes('startRepostCount')) {
              this.startRepostCount = Number(text.split('=')[1]);
            } else if (text.includes('endRepostCount')) {
              this.endRepostCount = Number(text.split('=')[1]);
            } else if (text.includes('startlikecount')) {
              this.startLikeCount = Number(text.split('=')[1]);
            } else if (text.includes('endlikecount')) {
              this.endLikeCount = Number(text.split('=')[1]);
            } else if (text.includes('startShareCount')) {
              this.startShareCount = Number(text.split('=')[1]);
            } else if (text.includes('endShareCount')) {
              this.endShareCount = Number(text.split('=')[1]);
            } else if (text.includes('startactioncount')) {
              this.startActionCount = Number(text.split('=')[1]);
            } else if (text.includes('endactioncount')) {
              this.endActionCount = Number(text.split('=')[1]);
            } else if (text.includes('type')) {
              const typeCate = text.split('=')[1];
              if (typeCate.toUpperCase() === POST_TYPE.NEEDS) {
                this.type = text.split('=')[1];
                this.activeLink = this.PLATFORM_NEEDS_TEXT;
              } else if (typeCate.toUpperCase() === POST_TYPE.FULFILLMENT) {
                this.type = text.split('=')[1];
                this.activeLink = this.PLATFORM_FULFILL_TEXT;
              } else if (typeCate.toUpperCase() === POST_TYPE.GENERAL) {
                this.type = text.split('=')[1];
                this.activeLink = this.PLATFORM_GENERAL_TEXT;
              } else {
                this.type = text.split('=')[1];
                this.activeLink = 'ทั้งหมด';
              }
            }
          }
          // this.searchTrendTag();
          // const splitText = substringPath.split('=');
          // console.log('splitText ',splitText)
          // let hashtag: string = '';
          // if (splitText.length > 1) {
          //   // [0] must be text as 'hashtag'
          //   // [1] must be hashtag name 
          //   if (splitText[1].includes('#')) {
          //     hashtag = splitText[1].substring(1);
          //     this.searchHashtag = hashtag;
          //   }
          // }

          // if (this.matHashTag) {
          //   // search for hashtag with REST '/main/content/search'
          //   const keywordFilter = {
          //     hashtag: this.matHashTag
          //   };
          //   this.mainPageFacade.searchMainContent(keywordFilter).then((res: any) => {
          //     this.resHashTag = res.result
          //     console.log(this.resHashTag);
          //   }).catch((error: any) => {
          //   });
          // }
        }
      }
    });

    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.heightWindow();
      this.heightWindowLeft();
      var scrollTop = scrollTop.fix;
      var y = this.feedbodysearch && this.feedbodysearch.nativeElement && this.feedbodysearch.nativeElement.offsetHeight;
      var x = document.getElementsByClassName('header-top')[0].clientHeight;
      let top = x + y;
      if (this.prevOld > scrollTop) {
        if (this.feedbodysearch && this.feedbodysearch.nativeElement !== undefined) {
          if (window.innerWidth < 489) {
            this.feedbodysearch.nativeElement.style.top = 39 + 'pt';
          } else {
            this.feedbodysearch.nativeElement.style.top = 55 + 'pt';
          }
        }
      } else {
        if (this.feedbodysearch && this.feedbodysearch.nativeElement !== undefined) {
          this.feedbodysearch.nativeElement.style.top = - top + 'px';
        }
      }
      this.prevOld = scrollTop;
    });

    this.observManager.subscribe('scroll.buttom', (buttom) => {
      if (!this.isLoadingPost) {
        if (!this.isMaxLoadingPost) {
          this.isLoadingPost = true;
          if (this.resPost && this.resPost.length > 0) {
            this.searchTrendTag();
          }
        }
      }
    });
    this.observManager.subscribe('scroll', (scroll) => {
      if (window.innerWidth < 768) {
        this.scrollMobile = $('.footer-mobile').hasClass('hidden');
      }
    });

    /* // this is for query param check
    this.routeActivated.queryParams.subscribe(params => {
      console.log('---> show hashtag'+params['hashtag']);
    });*/
  }

  public ngOnInit(): void {
    this.searchEmergency();
    this.searchObjective();
    this.searchHashTag();
    this.searchPageCategory();
    this.getCount();
  }

  ngAfterViewInit(): void {
    this.minEngagment = 0;
    this.maxEngagment = 0;

    this.postFacede.getMaxData().then((res) => {

      this.countEngagement = res.data.commentCount + res.data.repostCount + res.data.likeCount + res.data.shareCount;
      this.options = {
        floor: 0,
        ceil: this.countEngagement + 1,
        translate: (value: number, label: LabelType): string => {
          let count = this.countEngagement + 1;
          if (value !== count) {
            return '' + value;
          } else {
            return '&#9854;';
          }
        }
      }
      this.highValue = 0;
      this.value = 0;

      this.optionsView = {
        floor: 0,
        ceil: res.data.viewCount
      }
      if (typeof (res.data.viewCount) === 'number') {
        this.maxView = res.data.viewCount;
      }

    }).catch((err) => {
      console.log(err)
    });
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

  public keyUpAutoComp(text) {
    this.isLoading = true;
    let data = {
      keyword: text.target.value
    }
    this.accountFacade.search(data).then((res) => {
      this.dataUser = res;
      this.isLoading = false;
    }).catch((err) => {
      this.isLoading = false;
      console.log(err)
    });
  }

  public saveDate(event: any) {
    // this.startDate = { begin: new Date(event.value.begin), end: new Date(event.value.end) }
    this.startDateLong = new Date(event.value.begin).getTime();
    this.endDateLong = new Date(event.value.end).getTime();
    // this.searchTrendTag();
  }

  public checkPath(): boolean {
    return this.router.url.includes('hashtag');
  }

  public openCalendar() {
    this.isOpen = true;
  }

  public autocomp(keyword) {
    var autocomp = (document.getElementById("autocompSearch") as HTMLInputElement).value;
    var key = keyword.keyCode || keyword.charCode;
    if (autocomp.includes('#')) {
      const hashTag: string[] = autocomp.match(/#[\wก-๙]+/g) || [];
      if (hashTag.length > 0) {
        let index = 0;
        for (let lTag of hashTag) {
          if (key === 32 || key === 13) {
            const isData = this.matHashTag.find(tag => {
              return tag === lTag
            });
            if (!isData) {
              this.matHashTag.push(lTag.substring(1));
            }
            autocomp = autocomp.replace(lTag, '');
            (document.getElementById("autocompSearch") as HTMLInputElement).value = autocomp;
            this.searchTrendTag();
          }
          index++;
        }
      }
    } else {
      if (key === 32 || key === 13) {
        this.keyword = autocomp.split(' ');
        const index = this.keyword.indexOf('', 0);
        if (index > -1) {
          this.keyword.splice(index, 1);
        }
        this.searchTrendTag(true);
      }
    }
  }

  public clickSorting(data: any, index: number) {
    this.sortBy = data.name;
    this.sorting = data.type;
    this.searchTrendTag();
  }

  public clickDataSearch(data) {
    this.router.navigateByUrl('/search')
    // this.router.navigateByUrl('/search'+data.label)
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    if (user) {
      this.userCloneDatas = JSON.parse(JSON.stringify(user));
    }
    return user !== undefined && user !== null;
  }

  public selectAutoComp(data) {
    this.isRowCard = true;
    var isPass = false;
    if (this.rowUser && this.rowUser.length > 0) {
      for (let user of this.rowUser) {
        if (user.id === data.id) {
          isPass = true;
        }
      }
      if (!isPass) {
        this.rowUser.push(data);
        this.userId.push({
          id: data.id,
          type: data.type
        });
      }
    } else {
      this.rowUser.push(data);
      this.userId.push({
        id: data.id,
        type: data.type
      });
    }

    this.resetAutocomp();
    this.searchTrendTag()
  }

  public radioChange(event) {
    if (event.value === 'เฉพาะที่คุณติดตาม') {
      this.follow = true;
      this.searchTrendTag();
    } else if (event.value === 'กำหนดเอง') {
      this.follow = false;
    } else if (event.value === 'ทั้งหมด') {
      this.follow = undefined;
      this.searchTrendTag();
    }
  }

  public heightWindow() {
    if (window.innerWidth > 1024) {
      var resizeWin = window.innerHeight;
      var recommended = this.recommendedRight.nativeElement.offsetHeight;
      var maxrecommended = recommended + 100;
      var count = recommended - resizeWin;
      var maxcount = count + 60;

      if (maxrecommended > resizeWin) {
        this.recommendedRight.nativeElement.style.top = '-' + maxcount + 'px';

      } else {
        this.recommendedRight.nativeElement.style.top = '55pt';
      }
    }
  }

  public heightWindowLeft() {
    if (window.innerWidth > 1024) {
      var resizeWin = window.innerHeight;
      var recommended = this.recommendedLeft.nativeElement.offsetHeight;
      var maxrecommended = recommended + 100;
      var count = recommended - resizeWin;
      var maxcount = count + 60;
      if (maxrecommended > resizeWin) {
        if (this.recommendedLeft) {
          this.recommendedLeft.nativeElement.style.top = '-' + maxcount + 'px';
        }
      } else {
        if (this.recommendedLeft) {
          this.recommendedLeft.nativeElement.style.top = '55pt';
        }
      }
    }

  }

  public loadMore(event) {
    if (event === 'อยู่ในกระแส') {
      this.searchHashTag();
    } else if (event === 'ประเภทเพจ') {
      this.searchPageCategory();
    } else if (event === 'เหตุการณ์ด่วน') {
      this.searchEmergency();
    } else if (event === 'สิ่งที่กำลังทำ') {
      this.searchObjective();
    }
  }

  public async searchEmergency() {
    this.isLoading = true;
    this.isLoadMorePageEmergency = true;
    const keywordFilter: any = {
      filter: {
        limit: 5,
        offset: SEARCH_OFFSET + (this.resEmergency && this.resEmergency.length > 0 ? this.resEmergency.length : 0),
        relation: [],
        whereConditions: {},
        count: false,
        orderBy: {}
      },
    };
    let cloneEmergency: any[] = [];
    await this.emergencyEventFacade.searchEmergency(keywordFilter).then((res: any) => {
      if (res) {
        for (let emer of res) {
          cloneEmergency.push(emer);
        }
        this.resEmergency = cloneEmergency;
        if (this.emergencyUrl) {
          for (let data of this.resEmergency) {
            if (this.emergencyUrl === data.hashTag) {
              this.emergency = data.id;
            }
          }
          this.searchTrendTag();
        }
        if (this.emergency) {
          for (let [index, tag] of cloneEmergency.entries()) {
            if (tag.value === this.objective) {
              Object.assign(cloneEmergency[index], { selected: true })
            }
          }
        }
        this.isLoadMorePageEmergency = false;
      }

      this.isLoading = false;
    }).catch((err: any) => {
      console.log(err)
    });
  }

  public async searchObjective() {
    const keywordFilter: any = {
      filter: {
        limit: 5,
        offset: SEARCH_OFFSET + this.resObjective && this.resObjective.length > 0 ? this.resObjective.length : 0,
        relation: [],
        whereConditions: {},
        count: false,
        orderBy: {
          createdDate: "DESC"
        }
      },
    };
    let cloneObject: any[] = this.resObjective;
    this.isLoadMoreObjective = true;
    await this.objectiveFacade.searchObjective(keywordFilter).then((result: any) => {
      if (result.data) {
        for (let object of result.data) {
          cloneObject.push(object);
        }
        this.resObjective = cloneObject;
        if (this.objectiveUrl) {
          for (let data of this.resObjective) {
            if (this.objectiveUrl === data.hashTag) {
              this.objective = data.id;
            }
          }
          this.searchTrendTag();
        }
        if (this.objective) {
          for (let [index, tag] of cloneObject.entries()) {
            if (tag.value === this.objective) {
              Object.assign(cloneObject[index], { selected: true })
            }
          }
        }
      }
      this.isLoadMoreObjective = false;
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public searchHashTag() {
    let filter: SearchFilter = new SearchFilter();
    filter.limit = 5;
    filter.offset = SEARCH_OFFSET + this.resHashTag && this.resHashTag.length ? this.resHashTag.length : 0;
    filter.whereConditions = {};
    filter.orderBy = {};
    let cloneHashtag: any[] = this.resHashTag;
    this.isLoadMoreHashTag = true;
    let data = {
      filter
    }
    this.hashTagFacade.searchTrend(data).then(res => {
      if (res && res.length > 0) {
        for (let hashtag of res) {
          cloneHashtag.push(hashtag);
        }
        if (this.matHashTag) {
          for (let [index, tag] of cloneHashtag.entries()) {
            for (let hashtag of this.matHashTag) {
              if (tag.value === hashtag) {
                Object.assign(cloneHashtag[index], { selected: true })
              }
            }
          }
        }
      }
      this.isLoadMoreHashTag = false;
      // this.resHashTag = cloneHashtag;
    }).catch(error => {
      console.log(error);
      this.isLoadMoreHashTag = false;
    });
  }

  public getObjective(data) {
    if (data.item.selected) {
      this.objective = data.item.hashTag;
    } else {
      this.objective = '';
    }
    this.searchTrendTag();

    // const dataEngagement: UserEngagement = this.engagementService.engagementPost("objective", data.item.id, data.event.source._elementRef.nativeElement.innerText);
    // this.createEngagement(dataEngagement);

  }

  public getEmergency(data) {
    if (data.item.selected) {
      this.emergency = data.item.id;
    } else {
      this.emergency = '';
    }
    this.searchTrendTag();

    // const dataEngagement: UserEngagement = this.engagementService.engagementPost("emergency", data.item.id, data.event.source._elementRef.nativeElement.innerText);
    // this.createEngagement(dataEngagement);
  }

  public createEngagement(dataEngagement: UserEngagement) {
    return this.userEngagementFacade.create(dataEngagement).then((res: any) => {
    }).catch((err: any) => {
      console.log('err ', err)
    });
  }

  public getPagecategory(data) {
    if (data.selected) {
      this.page.push(data.id);
    } else {
      let i = 0;
      for (let [index, listData] of this.page.entries()) {
        if (listData === data.id) {
          this.page.splice(index, 1);
        }
        i++;
      }
    }
    this.searchTrendTag();
  }

  public getTypeSearch(link) {
    this.type = link.keyword.toUpperCase();
    if (this.type === 'TIMELINE') {
      this.type = ''
    }
    this.isLoadingClickTab = true;
    setTimeout(() => {
      this.searchTrendTag(true);
    }, 1000);
  }

  public checkBoxMutiple(data) {
    if (data.item.selected) {
      this.matHashTag.push(data.item.value)
    } else {
      const isHashtag = this.matHashTag.findIndex(lTag => {
        return lTag === data.item.value
      });
      if (isHashtag !== -1) {
        this.matHashTag.splice(isHashtag, 1)
      }
    }
    this.searchTrendTag();

    // const dataEngagement: UserEngagement = this.engagementService.engagementPost("hashTag", data.item.value, data.event.source._elementRef.nativeElement.innerText);
    // this.createEngagement(dataEngagement);
  }

  public searchTrendTag(offset?: boolean) {
    // search for hashtag with REST '/main/content/search';     
    if (this.sortBy === 'วันที่ล่าสุด') {
      this.sorting = SORT_BY.LASTEST_DATE;
    } else if (this.sortBy === 'ที่ได้รับความนิยม') {
      this.sorting = SORT_BY.POPULAR;
    } else if (this.sortBy === 'ที่เกี่ยวข้องมากที่สุด') {
      this.sorting = SORT_BY.RELATED;
    }

    let count = this.countEngagement + 1;
    if (this.endActionCount === count) {
      this.endActionCount = undefined;
    } else {
      this.endActionCount = this.countEngagement
    }

    const keywordFilter: any = {
      keyword: this.keyword,
      hashtag: this.matHashTag,
      onlyFollowed: this.follow ? this.follow : undefined,
      type: this.type ? this.type : '',
      createBy: this.userId,
      objective: this.objective ? this.objective : '',
      emergencyEvent: this.emergency,
      startDate: this.startDate && this.startDate.begin,
      endDate: this.startDate && this.startDate.end,
      startViewCount: this.startViewCount,
      endViewCount: this.endViewCount,
      startActionCount: this.startActionCount,
      endActionCount: this.endActionCount,
      startCommentCount: this.startCommentCount,
      endCommentCount: this.endCommentCount,
      startRepostCount: this.startRepostCount,
      endRepostCount: this.endRepostCount,
      startLikeCount: this.startLikeCount,
      endLikeCount: this.endLikeCount,
      startShareCount: this.startShareCount,
      endShareCount: this.endShareCount,
      locations: this.location,
      pageCategories: this.page,
      sortBy: this.sorting,
      filter: {
        limit: 5,
      }
    };

    if (offset) {
      this.resPost = [];
      keywordFilter.filter.offset = 0;
      this.isLoadingPost = true;
    } else {
      keywordFilter.filter.offset = this.resPost && this.resPost.length ? this.resPost.length : SEARCH_OFFSET
    }
    let originalPost: any[] = this.resPost;

    this.mainPageFacade.searchMainContent(keywordFilter).then((resultData: any) => {
      setTimeout(() => {
        this.showLoading = false;
        this.isLoadingPost = false;
      }, 1500);
      if (resultData && resultData.length > 0) {
        if (resultData && resultData.length !== 5) {
          this.isMaxLoadingPost = true;
          this.isLoadingPost = false;
        }
        for (let posts of resultData) {
          let index = 0;
          if (posts && posts.page !== undefined && posts.page !== null && posts.page !== '') {
            if (posts.page.imageURL !== undefined && posts.page.imageURL !== '' && posts.page.imageURL !== null) {
              Object.assign(posts.post, { page: posts.page });
            }
          } else {
            Object.assign(posts.post, { user: posts.user })
          }
          originalPost.push(posts);
          index++;
        }
        this.resPost = originalPost;
        for (let posts of this.resPost) {
          if (posts && posts.post && posts.post.referencePost !== null && posts.post.referencePost !== undefined && posts.post.referencePost !== '') {
            let search: SearchFilter = new SearchFilter();
            search.limit = 5;
            search.offset = SEARCH_OFFSET + this.resPost && this.resPost.length > 0 ? this.resPost.length : 0;
            search.count = false;
            search.whereConditions = { _id: posts.post && posts.post.referencePost };
            this.postFacede.search(search).then((res: any) => {
              if (res.length !== 0) {
                posts.post.referencePostObject = res[0]
              } else {
                posts.post.referencePostObject = 'UNDEFINED PAGE'
              }
            }).catch((err: any) => {
            });
          }
        }
        this.isLoadingClickTab = false;

      } else {
        this.isMaxLoadingPost = true;
        this.isLoadingPost = false;
        this.isLoadingClickTab = false;
        this.resPost = [];
        // console.log('offset ',offset)
        // if (offset) {
        //   this.resPost = [];
        // }
      }
    }).catch((error: any) => {
      console.log(error);
    });
  }

  public getCount() {
    this.postFacede.getMaxData().then((res) => {
      this.advance = [{
        topic: 'แสดงความคิดเห็น',
        floor: 0,
        value: this.endCommentCount ? this.endCommentCount : 0,
        highValue: this.startCommentCount ? this.startCommentCount : 0,
        ceil: res.data.commentCount
      }, {
        topic: 'บอกต่อ',
        floor: 0,
        value: this.endRepostCount ? this.endRepostCount : 0,
        highValue: this.startRepostCount ? this.startRepostCount : 0,
        ceil: res.data.repostCount
      }, {
        topic: 'ไลค์',
        floor: 0,
        value: this.endLikeCount ? this.endLikeCount : 0,
        highValue: this.startLikeCount ? this.startLikeCount : 0,
        ceil: res.data.likeCount
      }, {
        topic: 'แชร์',
        floor: 0,
        value: this.endShareCount ? this.endShareCount : 0,
        highValue: this.startShareCount ? this.startShareCount : 0,
        ceil: res.data.shareCount
      }];
      for (let data of this.advance) {
        if (data.ceil === 0) {
          delete data.highValue;
        }
      }

    }).catch((err) => {
      console.log(err)
    })
  }

  public copyLink() {
    let url = window.location.origin;
    url += decodeURI(this.router.url).split('?')[0];
    let queryParams: string = "";

    if (this.matHashTag.length > 0) {
      queryParams += '&hashtag=' + this.matHashTag.join(",");
    }
    if (this.objective) {
      queryParams += '&objective=' + this.objective;
    }
    if (this.emergency) {
      queryParams += '&emergency=' + this.emergency;
    }
    if (this.page.length > 0) {
      queryParams += '&pagecategory=' + this.page;
    }
    if (this.keyword.length > 0) {
      queryParams += '&keyword=' + this.keyword;
    }
    if (this.follow !== undefined) {
      if (this.follow) {
        queryParams += '&follow=' + this.follow;
      } else {
        queryParams += '&follow=' + this.follow;
      }
    }
    if (this.userId) {
      let pageName: any[] = [];
      for (let user of this.userId) {
        pageName.push(user.id)
      }
      queryParams += '&createdby=' + pageName;
    }
    if (Object.keys(this.startDate).length > 0) {
      queryParams += '&startdate=' + this.startDateLong;
      queryParams += '&enddate=' + this.endDateLong;
    }
    if (this.isAdvance) {

      if (typeof (this.startCommentCount) === 'number') {
        queryParams += '&startcommentcount=' + this.startCommentCount;
        queryParams += '&endcommentcount=' + this.endCommentCount;
      }
      if (typeof (this.startRepostCount) === 'number') {
        queryParams += '&startstartRepostCount=' + this.startRepostCount;
        queryParams += '&endstartRepostCount=' + this.endRepostCount;
      }
      if (typeof (this.startLikeCount) === 'number') {
        queryParams += '&startlikecount=' + this.startLikeCount;
        queryParams += '&endlikecount=' + this.endLikeCount;
      }
      if (typeof (this.startShareCount) === 'number') {
        queryParams += '&startstartShareCount=' + this.startShareCount;
        queryParams += '&endstartShareCount=' + this.endShareCount;
      }
    } else {
      if (typeof (this.startActionCount) === 'number') {
        queryParams += '&startactioncount=' + this.startActionCount
      } else {
        queryParams += '&startactioncount=' + 0
      }
      if (typeof (this.endActionCount) === 'number') {
        queryParams += '&endactioncount=' + this.endActionCount;
      } else {
        queryParams += '&endactioncount=' + this.countEngagement;
      }
    }

    if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
      queryParams = queryParams.substring(1, queryParams.length);
    }

    if (queryParams !== null && queryParams !== undefined && queryParams !== '') {
      url += "?" + queryParams;
    }

    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (url));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');

  }

  public resetAutocomp() {
    this.createdName = '';
  }

  public resetRow() {
    this.rowUser = [];
  }

  public valueChangeSlide(event, item) {
    this.startCommentCount = item.value
    this.endCommentCount = item.highValue
  }

  public sliderOptions(slider: any): Options {
    return {
      floor: slider.floor,
      ceil: slider.ceil,
    };
  }

  public async searchPageCategory(page?: any) {
    let filter = new SearchFilter();
    filter.limit = 5;
    filter.offset = SEARCH_OFFSET + (this.resPageType && this.resPageType.length > 0 ? this.resPageType.length : 0);
    filter.relation = [];
    filter.whereConditions = {};
    filter.count = false;
    filter.orderBy = {
      createdDate: "DESC",
    }
    this.isLoading = true;
    this.isLoadMorePageCategory = true;

    let clonePageCategory: any[] = this.resPageType;
    await this.pageCategoryFacade.search(filter).then((res: any) => {
      if (res && res.length > 0) {
        for (let hashtag of res) {
          clonePageCategory.push(hashtag);
        }
        if (this.pageCateUrl) {
          for (let data of this.resPageType) {
            for (let list of this.pageCateUrl) {
              if (list === data.name) {
                this.page.push(data.id);
              }
            }
          }
          this.searchTrendTag();
        }
      }
      this.isLoadMorePageCategory = false;
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public onChangeSlide(event, isAdvance: boolean) {
    if (isAdvance) {
      if (event.checked) {
        this.isAdvance = event.checked
      }
    } else {
      if (event.checked) {
        this.isAdvanceRich = event.checked
      }
    }
  }

  onSelect(event) {
    this.selectedDate = event;
  }

  public remove(tag) {
    this.test = tag
    const index = this.matHashTag.indexOf(tag);
    if (index >= 0) {
      this.matHashTag.splice(index, 1);
      this.searchTrendTag();
    }
  }

  public removeCard(card: any, index: number) {
    const indexCard = this.rowUser.indexOf(card);
    if (indexCard >= 0) {
      this.rowUser.splice(index, 1);
    }
    for (let [i, user] of this.userId.entries()) {
      if (user.id === card.id) {
        this.userId.splice(i, 1);
        break;
      }
    }
    this.searchTrendTag();
  }

  onUserChangeStart(changeContext: ChangeContext, item: any): void {
    this.getChangeContextString(changeContext, item);
  }

  onUserChange(changeContext: ChangeContext, item: any): void {
    this.getChangeContextString(changeContext, item);
  }

  onUserChangeEnd(changeContext: ChangeContext, item: any): void {
    this.getChangeContextString(changeContext, item);
  }

  getChangeContextString(changeContext: ChangeContext, item: any): any {
    if (item && item.topic === 'แสดงความคิดเห็น') {
      this.startCommentCount = changeContext.value;
      this.endCommentCount = changeContext.highValue;
    } else if (item && item.topic === 'บอกต่อ') {
      this.startRepostCount = changeContext.value;
      this.endRepostCount = changeContext.highValue;
    } else if (item && item.topic === 'ไลค์') {
      this.startLikeCount = changeContext.value;
      this.endLikeCount = changeContext.highValue;
    } else if (item && item.topic === 'แชร์') {
      this.startShareCount = changeContext.value;
      this.endShareCount = changeContext.highValue;
    } else if (item === 1) { // view count share
      this.startViewCount = changeContext.value;
      this.endViewCount = changeContext.highValue;
    } else if (item === 2) { // comment+like+view+repoet
      this.startActionCount = changeContext.value;
      this.endActionCount = changeContext.highValue;
    } else if (item === 3) { // comment+like+view+repoet
      this.minEngagment = changeContext.value;
      this.maxEngagment = changeContext.highValue;
    }
    // open 
    if (this.isAdvance) {
      this.startActionCount = undefined;
      this.endActionCount = undefined;
    }
    this.searchTrendTag();
    return changeContext;
  }

  public clearDate() {
    this.startDate = {}
    this.searchTrendTag();
  }

  public clickfilter() {
    var postion = $(".slide-left");
    postion.addClass("active");
    this.isBackdrop = true;
    if (this.scrollMobile) {
      this.recommendedLeft.nativeElement.style.height = 'auto';
    }
    $("#menubottom").css({
      'overflow-y': "hidden"
    });
  }

  public async actionComment(action: any, index: number) {
    if (this.isLogin()) {
      this.postId = action.pageId
      let pageInUser: any[]
      let data: RePost = new RePost();
      let dataPost: any
      let userAsPage: any
      let search: SearchFilter = new SearchFilter();
      search.limit = 10;
      search.count = false;
      search.whereConditions = { ownerUser: this.userCloneDatas.id };
      if (action.mod === 'REBOON') {
        this.isLoginCh();
        if (action.userAsPage !== undefined && action.userAsPage !== null) {
          userAsPage = action.userAsPage.id
        } else {
          userAsPage = null
        }
        if (action.type === "TOPIC") {
          var aw = await this.pageFacade.search(search).then((pages: any) => {
            pageInUser = pages
          }).catch((err: any) => {
          })
          for (let p of pageInUser) {
            var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
              p.img64 = res.data
            }).catch((err: any) => {
            });
          }
          const dialogRef = this.dialog.open(DialogReboonTopic, {
            width: '450pt',
            data: { options: { post: action.post, page: pageInUser, userAsPage: userAsPage, pageUserAsPage: action.userAsPage } }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (!result) {
              return
            }
            if (result.isConfirm) {
              if (result.pageId === 'แชร์เข้าไทมไลน์ของฉัน') {
                data.pageId = null
                if (result.text === "") {
                  if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                    dataPost = action.post.referencePost._id
                  } else {
                    dataPost = action.post._id
                  }
                } else {
                  dataPost = action.post._id
                }
              } else {
                data.pageId = result.pageId
                if (result.text === "") {
                  if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                    dataPost = action.post.referencePost._id
                  } else {
                    dataPost = action.post._id
                  }
                } else {
                  dataPost = action.post._id
                }
              }
              data.detail = result.text
              if (action.userAsPage.id !== undefined && action.userAsPage.id !== null) {
                data.postAsPage = action.userAsPage.id
              }
              if (result.hashTag !== undefined && result.hashTag !== null) {
                data.hashTag = result.hashTag
              }
              this.postFacede.rePost(dataPost, data).then((res: any) => {
                this.resPost[index].post.repostCount++
              }).catch((err: any) => {
                console.log(err)
              })
            }
          });
        } else if (action.type === "NOTOPIC") {
          data.pageId = null
          dataPost = action.post._id
          this.postFacede.rePost(dataPost, data).then((res: any) => {
            this.resPost[index].post.repostCount++
            this.resPost[index].post.isRepost = true
          }).catch((err: any) => {
            console.log(err)
          })
        } else if (action.type === "UNDOTOPIC") {
          this.postFacede.undoPost(action.post._id).then((res: any) => {
          }).catch((err: any) => {
          })
        }

      } else if (action.mod === 'LIKE') {
        this.isLoginCh();
        this.postLike(action, index);
      } else if (action.mod === 'SHARE') {
        this.isLoginCh();
      } else if (action.mod === 'COMMENT') {
        this.isLoginCh();
      } else if (action.mod === 'POST') {
        this.router.navigateByUrl('/post/' + action.pageId);
      }
    } else {
      return this.showAlertLoginDialog(this.url);
    }
  }

  private isLoginCh() {
    if (!this.isLogin()) {
      return this.showAlertLoginDialog(this.url);
    }
  }

  public postLike(data: any, index: number) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog(this.url);
    } else {
      this.postFacede.like(data.postData._id).then((res: any) => {
        if (res.isLike) {
          if (data.postData._id === res.posts.id) {
            this.resPost[index].post.likeCount = res.likeCount;
            this.resPost[index].post.isLike = res.isLike;
          }
        } else {
          // unLike 
          if (data.postData._id === res.posts.id) {
            this.resPost[index].post.likeCount = res.likeCount;
            this.resPost[index].post.isLike = res.isLike;
          }
        }
      }).catch((err: any) => {
        console.log(err)
      });
    }
  }

  public createComment(comment: any, index?: number) {
    console.log('comment', comment)
    let commentPosts = new CommentPosts
    if (comment.userAsPage !== undefined && comment.userAsPage !== null) {
      commentPosts.commentAsPage = comment.userAsPage.id
    }
    commentPosts.comment = comment.value
    commentPosts.asset = undefined
    this.postCommentFacade.create(commentPosts, comment.pageId).then((res: any) => {
      this.resPost.posts[index].commentCount++
      this.resPost.posts[index].isComment = true
      this.resPost.posts[index]
    }).catch((err: any) => {
    })
  }

  public deletePost(event: any, index: number): any { }

  public focusout() {
    var postion = $(".slide-left");
    postion.removeClass("active");
    this.isBackdrop = false;
    $("#menubottom").css({
      'overflow-y': "auto"
    });
    const scroll = this.recommendedLeft.nativeElement.scrollTop;
    if (scroll > 0) {
      this.recommendedLeft.nativeElement.scrollTop = 0
    }
    super.clicktotop();
  }

  public getImageSelector(): string[] {
    return [".checkload"];
  }

  public onSelectorImageElementLoaded(imageElement: any[]): void {
  }

  public onImageElementLoadOK(imageElement: any): void {
  }

  public onImageElementLoadError(imageElement: any): void {
  }

  public onImageLoaded(imageElement: any[]): void {
    setTimeout(() => {
      this.showLoading = false
    }, 3000);
  }

  public onResize() {
    if (window.innerWidth <= 1024) {
      var postion = $(".slide-left");
      postion.addClass("active");
    }
  }
}