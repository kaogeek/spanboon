/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, ViewChild, ElementRef, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { ObjectiveFacade, MainPageSlideFacade, AuthenManager, SearchHistoryFacade, AssetFacade, HashTagFacade } from '../../services/services';
import { SearchFilter } from '../../models/SearchFilter';
import { AbstractPage } from '../pages/AbstractPage';
import { MatDialog } from '@angular/material';
import { fromEvent, Subject } from 'rxjs';
import { map, distinctUntilChanged, debounceTime, takeUntil } from 'rxjs/operators';
import { CookieUtil } from '../../utils/CookieUtil';
import { ValidBase64ImageUtil } from '../../utils/ValidBase64ImageUtil';
import { environment } from 'src/environments/environment';
import { CountdownConfig } from 'ngx-countdown';

declare var $: any;
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;
const UUID: string = 'UUID'

@Component({
  selector: 'header-search',
  templateUrl: './HeaderSearch.component.html'
})
export class HeaderSearch extends AbstractPage implements OnInit {
  private destroy = new Subject<void>();
  @Input()
  public text: string = "ข้อความ";
  @Input()
  public count: string = "0";
  @Input()
  public color: string = "#212721";
  @Input()
  public bgColor: string = "";
  @Input()
  public class: string | [string];
  @Input()
  public crColor: string = "";
  @Input()
  public link: string = "#";
  @Output()
  public aboutUs: EventEmitter<any> = new EventEmitter();

  @ViewChild('search', { static: false }) public search: ElementRef;
  @ViewChild('buttonSearch', { static: false }) public buttonSearch: ElementRef;

  public router: Router;
  private mainPageFacade: MainPageSlideFacade;
  private searchHistoryFacade: SearchHistoryFacade;
  private searchHashTagFacade: HashTagFacade;
  private assetFacade: AssetFacade;
  public authenManager: AuthenManager;

  public filled: boolean;
  public isOpen: boolean;
  public isLoading: boolean;
  public isMouseEnter: boolean;
  public isMouseLeave: boolean;
  public isMsgHistory: boolean;
  public isLoadingMore: boolean;
  public searchRecent: any[] = [];
  public searchRecentName: any[] = [];
  public dataTrend: any[] = [];
  public resSearch: any[] = [];
  public SearchShow: boolean = false;
  public heightSearch: boolean = false;
  @Input()
  public isHideButton: boolean = false;
  public apiBaseURL = environment.apiBaseURL;
  public isTabClick: string;
  public isLimit: boolean = false;

  public configCountdown: CountdownConfig = { leftTime: 180, format: 'mm:ss' };

  @ViewChild('tabs', { static: false }) private tabs: ElementRef;
  @ViewChild('wrapperBodyTag', { static: false }) private wrapperBodyTag: ElementRef;

  constructor(router: Router, mainPageFacade: MainPageSlideFacade, searchHashTagFacade: HashTagFacade,
    authenManager: AuthenManager, dialog: MatDialog, searchHistoryFacade: SearchHistoryFacade, assetFacade: AssetFacade) {
    super(null, authenManager, dialog, router);
    this.router = router;
    this.authenManager = authenManager;
    this.mainPageFacade = mainPageFacade;
    this.searchHistoryFacade = searchHistoryFacade;
    this.searchHashTagFacade = searchHashTagFacade;
    this.assetFacade = assetFacade;
    this.isMsgHistory = false;
    this.isLoadingMore = false;
  }

  public ngOnInit() {
    // setTimeout(() => {
    if (this.SearchShow === true) {
      setTimeout(() => {
        document.getElementById("defaultOpen1").click();
      }, 0);
    }
    this.checkDivided();
    // }, 10);
  }

  public ngAfterViewInit(): void {
    fromEvent(this.search && this.search.nativeElement, 'keyup').pipe(
      debounceTime(500)
      , distinctUntilChanged()
    ).subscribe((text: any) => {
      this.keyUpAutoComp(this.search.nativeElement.value);
    });

    fromEvent(this.buttonSearch.nativeElement, 'click').pipe(
      debounceTime(500)
      , distinctUntilChanged()
    ).subscribe((text: any) => {
      if (!this.isLimit) {
        this.clickShowSearch('hide');
      } else {
        let dialog = this.showAlertDialogWarming("กรุณารอ 15นาที เพื่อค้นหาอีกครั้ง", "none");
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            this.SearchShow = false;
          }
        });
      }
    });
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.destroy.next();
    this.destroy.complete();
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

  private stopIsloading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 250);
  }

  public searchShow() {
    this.SearchShow = true;
  }

  public clickShowSearch(value: string) {
    if (value === 'hide') {
      this.aboutUs.emit(value);
    }
    // $("#menubottom").css({
    //   'overflow-y': "hidden"
    // });
    this.filled = true;
    this.searchPageRecent();
    this.searchRecentNames();
    this.searchTrendTag();

    this.isTabClick = 'popular';
    if (document.getElementById("defaultOpen1") !== null && document.getElementById("defaultOpen2") !== undefined) {
      setTimeout(() => {
        document.getElementById("defaultOpen1").click();
      }, 10);
    }
    this.checkMenu(event);
  }

  public checkMenu($event) {
    if (window.innerWidth > 1024) {
      if (this.SearchShow === true) {
        $("#menuCenter").css({
          display: "none"
        });
      } else {
        $("#menuCenter").css({
          display: "flex"
        });
      }
    } else {
      $("#menuCenter").css({
        display: "none"
      });
    }

    if (window.innerWidth > 1440) {
      this.heightSearch = false;

      if (this.heightSearch === false) {
        setTimeout(() => {
          $("#popular").css({
            // height: "100%",
            display: "flex"
          });

          $("#history").css({
            // height: "100%",
            display: "flex"
          });
        }, 0);
      }

    } else {
      this.heightSearch = true;

      if (this.heightSearch === true) {
        setTimeout(() => {
          if (this.isTabClick === 'popular') {
            if (document.getElementById("defaultOpen1") !== null && document.getElementById("defaultOpen1") !== undefined) {
              document.getElementById("defaultOpen1").click();
            }
          } else {
            if (document.getElementById("defaultOpen2") !== null && document.getElementById("defaultOpen2") !== undefined) {
              document.getElementById("defaultOpen2").click();
            }
          }
        }, 50);
      }
    }

    if (this.SearchShow === true) {
      setTimeout(() => {
        // $(".wrapper-body-tag").css("max-height", "calc(100vh - " + $(".header-top")[0].offsetHeight + "px - " + $(".header-search")[0].offsetTop + "px)");

        if (window.innerWidth < 1024) {
          // $(".wrapper-body-tag").css("height", "calc(100vh - " + $(".header-top")[0].offsetHeight + "px - " + $(".header-search")[0].offsetTop + "px)");
        }
      }, 0);
    }
  }

  public clickHideSearch(value: string) {
    if (value === 'show') {
      this.aboutUs.emit(value);
    }
    // $("#menubottom").css({
    //   'overflow-y': "auto"
    // });

    this.SearchShow = false;
    this.filled = false;
    this.checkMenu(event);
  }

  public focusOut() {
    // $("#menuCenter").css({
    //   display: "none"
    // });
  }

  public searchPageRecent() {
    let userId = this.getCurrentUserId();
    let filter = new SearchFilter();
    filter.limit = 4;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {
      type: ["PAGE", "USER"],
      userId: userId
    };
    if (!this.isLogin()) {
      delete filter.whereConditions.userId
    }
    filter.count = false;
    filter.orderBy = {}
    this.isLoading = true;
    this.searchHistoryFacade.search(filter).then((res: any) => {
      this.searchRecent = res
      if (this.searchRecent.length > 0) {
        let index = 0;
        for (let dataImage of res) {
          if (dataImage.imageURL !== "" && dataImage.imageURL !== undefined && dataImage.imageURL !== null) {
            this.getDataIcon(dataImage.imageURL, "image", index)
          } else {
            this.searchRecent[index].isLoadingImage = false;
          }

          index++;
        }
      }
    }).catch((err: any) => {
      if (err.error.status === 0) {
        if (err.error.message === 'History Not Found') {
          this.isMsgHistory = true;
        }
      }
    })
  }

  public loadHistory() {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET + (this.searchRecentName && this.searchRecentName.length > 0 ? this.searchRecent.length : 0);;
    filter.whereConditions = {
      type: ["KEYWORD"],
      userId: this.getCurrentUserId()
    };
    if (!this.isLogin()) {
      delete filter.whereConditions.userId
    }
    filter.count = false;
    filter.orderBy = {}
    this.isLoading = true;
    let originalRecentName: any[] = this.searchRecentName;
    this.searchHistoryFacade.search(filter).then((res: any) => {
      this.isLoadingMore = false;
      if (originalRecentName.length > 0) {
        for (let history of res) {
          const isHistory = this.searchRecentName.find(h => {
            return h.label === history.label
          });
          if (isHistory) {
            continue;
          } else {
            originalRecentName.push(history);
          }
        }
      }
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public searchRecentNames() {
    let userId = this.getCurrentUserId();
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {
      type: ["KEYWORD"],
      userId: userId
    };
    filter.count = false;
    filter.orderBy = {}
    if (!this.isLogin()) {
      delete filter.whereConditions.userId
    }
    this.searchHistoryFacade.search(filter).then((res: any) => {
      this.isLimit = false;
      this.searchRecentName = res
    }).catch((err: any) => {
      if (err.error.message === "Too many requests") {
        this.isLimit = true;
      }
      if (err.error.status === 0) {
        if (err.error.message === 'History Not Found') {
          this.isMsgHistory = true;
        }
      }
    })
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
    if (!this.getCurrentUserId()) {
      delete data.userId
    }
    this.searchHashTagFacade.searchTopTrend(data).then((res: any) => {
      this.dataTrend = res;
    }).catch((err: any) => {
      console.log(err)
    })
  }

  private getDataIcon(imageURL: any, myType?: string, index?: number): void {
    Object.assign(this.searchRecent[index], { isLoadingImage: true });
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (!ValidBase64ImageUtil.validBase64Image(res.data)) {
          Object.assign(this.searchRecent[index], { imageBase64: null });
        } else {
          Object.assign(this.searchRecent[index], { imageBase64: res.data });
        }
        this.searchRecent[index].isLoadingImage = false;
      }
      this.isLoading = false;
    }).catch((err: any) => {
      console.log(err)
    });
  }

  public keyUpAutoComp(value: string): void {
    let userId = this.getCurrentUserId();
    let search: any;
    if (userId !== undefined) {
      search = {
        keyword: value,
        userId: userId
      }
    } else {
      search = {
        keyword: value,
        user: CookieUtil.getCookie(UUID)
      }
    }
    this.isLoading = true;
    this.mainPageFacade.getSearchAll(search).then((res: any) => {
      this.resSearch = res.result;
      event.stopPropagation();
      this.stopIsloading();
      this.checkMenu(event);
    }).catch((err: any) => {
      this.stopIsloading();
    })
  }

  public onClickSearchLink(event) {
    // ?????
    let data = this.search.nativeElement.value;
    this.clickOpenLink(data, true);
  }

  public clickOpenLink(data: any, isEnter?: boolean) {
    let result;
    let isPass, dataList;
    if (isEnter) {
      if (this.resSearch && this.resSearch.length > 0) {
        const isData = this.resSearch.find(keyword => {
          return keyword.label === data
        });
        if (isData) {
          if (isData.type === "PAGE") {
            isPass = isData.type;
            dataList = isData.value;
          } else if (isData.type === "USER") {
            isPass = isData.type;
            data = isData;
          } else if (isData.type === "KEYWORD") {
            isPass = isData.type;
            data = isData;
            dataList = isData.value;
          } else {
            isPass = isData.type;
            dataList = isData.value;
          }
        } else {
          isPass = "KEYWORD";
          dataList = data;
        }
        result = {
          resultType: '',
          resultId: '',
          keyword: isData === undefined ? data : data.label
        }
      }
    } else {
      isPass = data.type;
      dataList = data.type === 'HASHTAG' ? data.label : data.value;
      result = {
        resultType: data.type,
        resultId: data.value,
        keyword: data.label
      }
    }
    if (isPass === 'USER') {
      if (data.uniqueId !== '' && data.uniqueId !== undefined && data.uniqueId !== null) {
        this.router.navigateByUrl('/profile/' + data.uniqueId);
      } else {
        this.router.navigateByUrl('/profile/' + data.value);
      }
      this.search.nativeElement.value = ''
      this.filled = false;
    } else if (isPass === 'TAG') {
      this.router.navigateByUrl('/search?hashtag=' + dataList);
    } else if (isPass === 'PAGE') {
      this.router.navigateByUrl('/page/' + dataList);
    } else if (isPass === 'KEYWORD') {
      this.router.navigateByUrl('/search?keyword=' + dataList);
    } else if (isPass === 'HASHTAG') {
      this.router.navigateByUrl('/search?hashtag=' + dataList);
    } else {
      this.router.navigateByUrl('/search');
    }
    this.clickHideSearch('show');
    this.search.nativeElement.value = ''
    this.filled = false;

    this.searchHistoryFacade.create(result).then((res: any) => {
      // this.filled = false;
      this.clickHideSearch('show');
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public searchHashTag(dataHashTag: any, index: number) {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {};
    filter.count = false;
    filter.orderBy = {}

    // $("#menubottom").css({
    //   'overflow-y': "auto"
    // });

    this.searchHashTagFacade.search(filter, dataHashTag.value).then((res: any) => {
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public onDeleteHistory(item: any, index: number): void {
    let userId;
    let data;
    if (this.isLogin()) {
      data = {
        resultId: item.value,
        userId: this.getCurrentUserId()
      }
    } else {
      data = {
        resultId: item.value,
      }
    }
    this.searchHistoryFacade.clearHistory(item.historyId, data).then((res: any) => {
      if (res) {
        this.resSearch.splice(index, 1);
      }
    }).catch((err: any) => {
      console.log(err)
    })
  }
  public loadMoreHashTag(): void {
    this.checkDivided();
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET + (this.dataTrend && this.dataTrend.length > 0 ? this.dataTrend.length : 0);;
    filter.whereConditions = {};
    filter.count = false;
    filter.orderBy = {}
    let data = {
      filter,
      userId: this.getCurrentUserId()
    }
    if (!this.getCurrentUserId()) {
      delete data.userId
    }
    this.isLoadingMore = true;
    let originalTrend: any[] = this.dataTrend;
    this.searchHashTagFacade.searchTopTrend(data).then((res: any) => {
      this.isLoadingMore = false;
      if (originalTrend.length > 0) {
        for (let hashtag of res) {
          const isHashtag = this.dataTrend.find(h => {
            return h.value === hashtag.value
          });
          if (isHashtag) {
            continue;
          } else {
            originalTrend.push(hashtag);
          }

        }
      }
    }).catch((err: any) => {
      console.log(err)
    })
  }
  public scrollEnter() {
    this.isMouseEnter = true;
    this.isMouseLeave = false;
  }

  public scrollLeave() {
    this.isMouseEnter = false;
    this.isMouseLeave = true;
  }

  public tabSearch($event, items) {
    var i, tabcontent, tablinks;
    this.isTabClick = items;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(items).style.display = "flex";
    $event.currentTarget.className += " active";
  }

  public checkDivided() {
    let dataLength = this.dataTrend.length;
    if (dataLength % 5 != 0) {
      this.isHideButton = true;
    } else {
      this.isHideButton = false;
    }
  }
}
