/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, NgZone, OnInit, ViewChild, HostListener } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AbstractPage } from '../AbstractPage';
import { Subject, fromEvent } from 'rxjs';
import { VoteEventFacade } from 'src/app/services/facade/VoteEventFacade.service';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { SearchFilter } from 'src/app/models/SearchFilter';
import { DialogCreateVote } from '../../shares/dialog/DialogCreateVote.component';
import { DialogPostCrad } from '../../shares/dialog/DialogPostCrad.component';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { SeoService } from 'src/app/services/SeoService.service';

const PAGE_NAME: string = 'vote';
const PAGE_TITLE: string = 'ก้าวไกลโหวต';
@Component({
  selector: 'vote-page',
  templateUrl: './VotePage.component.html',
})
export class VotePage extends AbstractPage implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild('searchInput', { static: false })
  searchInput: ElementRef;
  @ViewChild('pinContent', { static: false })
  pinContent: ElementRef;
  @ViewChild('myVoteContent', { static: false })
  myVoteContent: ElementRef;
  @ViewChild('supportContent', { static: false })
  supportContent: ElementRef;
  @ViewChild('scrollDiv', { static: false })
  scrollDiv: ElementRef;

  private destroy = new Subject<void>()
  private voteFacade: VoteEventFacade;

  public activeUrl: any;
  public apiBaseURL = environment.apiBaseURL;
  public mode: string;
  public voteData: any;
  public voteModel: any = {};
  public activeMenu: string = '';
  public userId: string;

  public isLoading: boolean = false;
  public isScrollLoading: boolean = false;
  public isCantLoad: boolean = false;
  public isSearch: boolean = false;
  public isEmpty: boolean = false;
  public isHashTagAll: boolean = false;
  public isRes: boolean = false;
  public isAllowCreate: boolean = false;
  public isOpenDialog: boolean = false;

  public searchInputValue: string;
  public typeAll: string;
  public scrollAll: any;
  public windowWidth: any;
  public paramsKey: any;
  public model: any;
  public limit: number = 8;
  public offset: number = 0;
  public limitLoad: number = 1;
  public scrollDistance = 2;
  public positionY: number;
  public menuList: any[] = [
    {
      name: 'โหวตทั้งหมด',
      status: '',
      icon: '../../../../assets/img/icons/votepage/block.svg',
      icon2: '../../../../assets/img/icons/votepage/block-active.svg',
      isLogin: false,
    },
    {
      name: 'ที่ฉันมีส่วนร่วม',
      status: 'my-vote',
      icon: '../../../../assets/img/icons/votepage/user.svg',
      icon2: '../../../../assets/img/icons/votepage/user-active.svg',
      isLogin: true,
    },
    {
      name: 'เปิดโหวต',
      status: 'open',
      icon: '../../../../assets/img/icons/votepage/openvote.svg',
      icon2: '../../../../assets/img/icons/votepage/openvote-active.svg',
      isLogin: false,
    },
    {
      name: 'ล่ารายชื่อ',
      status: 'support',
      icon: '../../../../assets/img/icons/votepage/like.svg',
      icon2: '../../../../assets/img/icons/votepage/like-active.svg',
      isLogin: false,
    },
    {
      name: 'ดูผลโหวต',
      status: 'result',
      icon: '../../../../assets/img/icons/votepage/statistic.svg',
      icon2: '../../../../assets/img/icons/votepage/statistic-active.svg',
      isLogin: false,
    },
  ]
  public checkOpenDialog: boolean = false;
  constructor(
    authenManager: AuthenManager,
    router: Router,
    _ngZone: NgZone,
    dialog: MatDialog,
    voteFacade: VoteEventFacade,
    private activeRoute: ActivatedRoute,
    private seoService: SeoService,
  ) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.voteFacade = voteFacade;

    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd), takeUntil(this.destroy))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute.children.forEach(async child => {
          child.params.subscribe(params => {
            this.activeUrl = params;
            if (this._checkRouting(this.activeUrl)) {
              if (!this.isLogin() && this.activeUrl['name'] === 'my-vote') {
                this.router.navigate(['', 'vote']);
              } else {
                this.activeMenu = this.activeUrl['name'];
              }
            } else {
              this.router.navigate(['', 'vote']);
              this.activeMenu = '';
              if (!this.paramsKey) {
                this.setValueChangeMenu();
                this._searchContent();
              }
            }
          })

          if (!!this.activeUrl['id'] && !this.checkOpenDialog) {
            const data = await this.voteFacade.getVote(this.activeUrl['id']);
            if (!!data) {
              this.openDialogPost(data);
            }
          }

          this.seoService.updateTitle(PAGE_TITLE);
        });
      });

    this.activeRoute.queryParams
      .pipe(takeUntil(this.destroy))
      .subscribe(queryParams => {
        if (!!queryParams['key']) {
          this.paramsKey = queryParams['key'];
          if (this.paramsKey === 'ปักหมุด' ||
            this.paramsKey === 'ใกล้ปิดโหวต' ||
            this.paramsKey === 'ใกล้ปิดล่ารายชื่อ') {
            this._searchContent(null, this.paramsKey);
          } else if (this.paramsKey === 'โหวตที่ฉันสร้าง' ||
            this.paramsKey === 'โหวตที่ฉันสร้างและเปิดล่ารายชื่ออยู่' ||
            this.paramsKey === 'ที่ฉันเคยโหวต' ||
            this.paramsKey === 'ที่ฉันลงชื่อให้การสนับสนุน') {
            this._searchContent(null, this.paramsKey, false, true);
          } else {
            this.isHashTagAll = true;
            this._searchContent(this.paramsKey, this.paramsKey);
          }
        } else {
          this.paramsKey = null;
        }
      });
  }

  public async ngOnInit() {
    if (this.isLogin()) {
      const updateMenu = [0, 2, 3, 4];
      updateMenu.forEach(index => {
        this.menuList[index].isLogin = true;
      });
      this._getPermissible();
    }
    this.userId = this.authenManager.getCurrentUser() ? this.authenManager.getCurrentUser().id : '';
    if (this.activeMenu === undefined || this.activeMenu === '') {
      this._searchContent();
    } else {
      this.searchValue();
    }
    this.getScreenSize();
  }

  public ngAfterViewInit(): void {
    fromEvent(this.searchInput && this.searchInput.nativeElement, 'keyup').pipe(
      debounceTime(400),
      filter((e: KeyboardEvent) => e.keyCode === 13),
      distinctUntilChanged()
    ).subscribe((text: any) => {
      this.offset = 0;
      if (this.activeUrl['name'] === undefined || this.activeUrl['name'] === '') {
        this._searchContent(null, null, null, null, text.target.value);
      } else {
        this.searchValue(text.target.value);
      }
    });

    this._triggerScroll();
  }

  public ngOnDestroy(): void {
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

  private _getPermissible() {
    this.voteFacade.getPermissible().then((res) => {
      this.isAllowCreate = true;
    });
  }

  private _searchContent(keyword?, type?, isScroll?, isOwn?, inputKeyword?) {
    this.isLoading = true;
    this.isSearch = true;
    if (inputKeyword === undefined || inputKeyword === '') this.isSearch = false;
    if (type === 'ปักหมุด') this.typeAll = 'pin';
    else if (type === 'ใกล้ปิดโหวต') this.typeAll = 'closeDate';
    else if (type === 'ใกล้ปิดล่ารายชื่อ') this.typeAll = 'closeSupport';
    else if (!!keyword && this.typeAll !== 'pin' && this.typeAll !== 'closeDate' && this.typeAll !== 'closeSupport') {
      this.typeAll = 'hashTagVote';
      this.isHashTagAll = true;
    } else {
      this.typeAll = type;
    }
    if (isOwn) {
      if (type === 'โหวตที่ฉันสร้าง') this.typeAll = 'myVote';
      if (type === 'โหวตที่ฉันสร้างและเปิดล่ารายชื่ออยู่') this.typeAll = 'myVoterSupport';
      if (type === 'ที่ฉันเคยโหวต') this.typeAll = 'myVoted';
      if (type === 'ที่ฉันลงชื่อให้การสนับสนุน') this.typeAll = 'mySupported';
    }
    let key = {};
    if (!!type) {
      if (isOwn) {
        key = {
          myVote: this.typeAll === 'myVote' ? true : false,
          myVoterSupport: this.typeAll === 'myVoterSupport' ? true : false,
          myVoted: this.typeAll === 'myVoted' ? true : false,
          mySupported: this.typeAll === 'mySupported' ? true : false,
        };
      } else {
        key = {
          pin: type === 'pin' || type === 'ปักหมุด' ? true : false,
          closeVote: type === 'closeDate' || type === 'ใกล้ปิดโหวต' ? true : false,
          closetSupport: type === 'closeSupport' || type === 'ใกล้ปิดล่ารายชื่อ' ? true : false,
          hashTagVote: this.typeAll !== 'pin' && this.typeAll !== 'closeDate' && this.typeAll !== 'closeSupport' ? true : false
        };
      }
    } else {
      if (isOwn) {
        key = {
          myVote: true,
          myVoterSupport: true,
          myVoted: true,
          mySupported: true,
        };
      } else {
        key = {
          pin: true,
          closeVote: true,
          closetSupport: true,
          hashTagVote: true,
        };
      }
    }
    if (!!isScroll) this.offset += this.limit;
    if (!!inputKeyword) {
      this.searchInputValue = inputKeyword;
      keyword = inputKeyword;
    }
    if (this.isHashTagAll) keyword = this.paramsKey;
    this.isEmpty = false;
    if (isOwn) {
      this.voteFacade.searchOwn(key, keyword, this.limit, this.offset).then((res: any) => {
        if (res) {
          if (!!type && isScroll) {
            this.model[type] = this.model[type].concat(res[type]);
          } else {
            this.model = res;
            if (res.closeDate.length === 0 &&
              res.hashTagVote.length === 0 &&
              res.pin.length === 0 && !type) this.isEmpty = true;
          }
          if (res[type].length === 0) {
            this.limitLoad++;
          }
          if (this.limitLoad === 2) this.isCantLoad = true;
          this.isLoading = false;
        }
      }).catch((err) => {
        if (err) {
          this.isLoading = false;
        }
      });
    } else {
      this.voteFacade.searchAll(this.isLogin(), key, keyword, this.limit, this.offset).then((res: any) => {
        if (res) {
          if (!!type && isScroll) {
            if (this.typeAll !== 'pin' && this.typeAll !== 'closeDate' && this.typeAll !== 'closeSupport' && this.typeAll === 'hashTagVote') {
              if (res[type].length > 1) {
                const indexModel = this.model.hashTagVote.findIndex(item => item._id === this.paramsKey);
                const index = res.hashTagVote.findIndex(item => item._id === this.paramsKey);
                this.model[type][indexModel].votingEvent = this.model[type][indexModel].votingEvent.concat(res[type][index].votingEvent);
              } else {
                this.model[type][0].votingEvent = this.model[type][0].votingEvent.concat(res[type][0].votingEvent);
              }
            } else {
              this.model[type] = this.model[type].concat(res[type]);
            }
          } else {
            this.model = res;
            if (res.closeDate.length === 0 &&
              res.hashTagVote.length === 0 &&
              res.closetSupport.length === 0 &&
              res.pin.length === 0 && !type) {
              this.isEmpty = true;
            }
          }
          if (res[type].length === 0 || res[type][0].votingEvent.length === 0) {
            this.limitLoad++;
          }
          if (this.limitLoad === 2) this.isCantLoad = true;
          this.isLoading = false;
        }
      }).catch((err) => {
        if (err) {
          this.isLoading = false;
        }
      });
    }
  }

  public searchVoteContent(condition?, isOwn?, keyword?) {
    this.isLoading = true;
    let search: SearchFilter = new SearchFilter();
    search.limit = 8;
    search.offset = 0;
    let whereConditions = {};
    if (!!condition) {
      whereConditions = condition;
    } else {
      search.limit = 8;
      whereConditions = {}
    }
    let key = {
      myVote: true,
      myVoterSupport: true,
      myVoted: true,
      mySupported: true,
    }
    if (isOwn) {
      this.voteFacade.searchOwn(key, keyword, this.limit, this.offset).then((res: any) => {
        if (res) {
          if (!!keyword) this.voteData = [];
          this.voteData = res;
          if (res.mySupported.length === 0 &&
            res.myVote.length === 0 &&
            res.myVoted.length === 0 &&
            res.myVoterSupport.length === 0) {
            this.isEmpty = true;
          } else {
            this.isEmpty = false;
          }
          this.isLoading = false;
        }
      }).catch((err) => {
        if (err) {
          this.isLoading = false;
        }
      });
    } else {
      this.voteFacade.search(search, whereConditions, keyword ? keyword : null).then((res) => {
        if (res) {
          if (!!keyword) this.voteData = [];
          this.voteData = res;
          if (this.voteData.length === 0) {
            this.isEmpty = true;
          } else {
            this.isEmpty = false;
          }
          this.isLoading = false;
          if (res.length >= this.limit) this._scrollSearchContent(condition);
        }
      }).catch((err) => {
        if (err) {
          this.isLoading = false;
        }
      });
    }
  }

  public searchValue(value?) {
    // this.isLoading = true;
    this.isSearch = true;
    if (value === undefined || value === '') this.isSearch = false;
    this.searchInputValue = value;
    if (this.activeUrl['name'] === 'support') {
      this.searchVoteContent({
        "status": 'support'
      }, false, value);
    } else if (this.activeUrl['name'] === 'open') {
      this.searchVoteContent({
        "status": 'vote',
      }, false, value);
    } else if (this.activeUrl['name'] === 'my-vote') {
      this.searchVoteContent({
      }, true, value);
    } else if (this.activeUrl['name'] === 'result') {
      this.searchVoteContent({
        "closed": true,
      }, false, value);
    } else if (this.activeUrl['name'] === undefined) {
      this.searchVoteContent({
        "approved": true,
        "pin": true,
      }, false, value);
      this.searchVoteContent({
        "status": 'vote',
      }, false, value);
      this.searchVoteContent({}, true, value);
    }
  }

  public setValueChangeMenu() {
    this.isEmpty = false;
    this.searchInputValue = '';
    this.isSearch = false;
    this.isHashTagAll = false;
    this.offset = 0;
    this.limitLoad = 1;
    this.isCantLoad = false;
    this.scrollAll = undefined;
  }

  public changeMenu(menu, isLoad?, text?) {
    this.isLoading = true;
    this.setValueChangeMenu();
    this.searchInput.nativeElement.value = "";
    if ((menu === 'support' && this.activeUrl['name'] !== 'support') || (menu === 'support' && isLoad)) {
      this.voteData = [];
      this.searchVoteContent({
        "status": 'support'
      });
    } else if (menu === 'open' && this.activeUrl['name'] !== 'open' || (menu === 'open' && isLoad)) {
      this.voteData = [];
      this.searchVoteContent({
        "status": 'vote',
      });
    } else if (menu === 'my-vote' && this.activeUrl['name'] !== 'my-vote' || (menu === 'my-vote' && isLoad)) {
      this.voteData = [];
      this.searchVoteContent({
      }, true);
    } else if (menu === 'result' && this.activeUrl['name'] !== 'result' || (menu === 'result' && isLoad)) {
      this.voteData = [];
      this.searchVoteContent({
        "closed": true,
      });
    } else if (menu === '' && this.activeUrl['name'] !== undefined || isLoad) {
      this.model = [];
      this._searchContent();
    } else if (menu === 'all' || menu === 'own') {
      this.voteData = [];
      this.model = [];
      this.setValueChangeMenu();
      this.router.navigate(['', 'vote', menu], { queryParams: { key: text } });
    } else {
      this.isLoading = false;
    }
  }

  private _checkRouting(id: any): boolean {
    const menu = this.menuList.filter((item) => item.status === id.name || id.name === 'event' || id.name === 'all' || id.name === 'own');
    return menu.length != 0 ? true : false;
  }

  public openDialogCreateVote() {
    let dialog = this.dialog.open(DialogCreateVote, {
      panelClass: 'panel-backgroud-list',
      disableClose: true,
      autoFocus: false,
      data: {}
    });
    dialog.afterClosed().subscribe((res) => {
      if (res === 'create') {
        this.changeMenu('support', true);
        this.router.navigate(['/vote/support']);
      }
    });
  }

  public openDialogPost($event) {
    if (!this.isOpenDialog) {
      this.isOpenDialog = true;
      sessionStorage.setItem('posY', this.positionY.toString());
      let posY = sessionStorage.getItem('posY');
      if (!$event.approved && $event.status === 'support') {
        this.voteFacade.getSupport($event._id).then((res) => {
          if (res) {
            if (this.activeUrl['name'] === undefined || this.activeUrl['name'] === '') {
              this.router.navigate([this.router.url + '/event/' + $event._id]);
            } else if (this.activeUrl['name'] === 'my-vote') {
              this.router.navigate([this.router.url.replace('/my-vote', '/event/' + $event._id)]);
            } else if (this.activeUrl['name'] === 'support') {
              this.router.navigate([this.router.url.replace('/support', '/event/' + $event._id)]);
            } else if (this.activeUrl['name'] === 'all') {
              this.router.navigate([this.router.url.replace(/\/all.*$/, '/event/' + $event._id)]);
            }
            const dialogRef = this.dialog.open(DialogPostCrad, {
              backdropClass: 'backdrop-overlay',
              panelClass: 'panel-backgroud',
              hasBackdrop: false,
              disableClose: true,
              autoFocus: false,
              data: {
                post: $event,
                choice: [],
                support: res,
                vote: true,
                isAllow: this.isAllowCreate,
                menu: !!this.paramsKey ? this.activeMenu + '?key=' + this.paramsKey : this.activeMenu
              }
            });
            dialogRef.afterClosed().subscribe((res) => {
              this.checkOpenDialog = false;
              if (res) {
                let pattern = /key=(.+)/;
                let match = res.match(pattern);
                if (match && match[1]) {
                  if (this.router.url.includes($event._id)) {
                    this.offset = 0;
                    this.limitLoad = 1;
                    this.isCantLoad = false;
                    this.router.navigate(['', 'vote', 'all'], { queryParams: { key: match[1] } });
                    this.paramsKey = match[1];
                  }
                }
              }
              if (res === 'my-vote') {
                if (this.router.url.includes($event._id)) {
                  this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '/my-vote')]);
                  this.activeMenu = res;
                }
              } else if (res === 'support') {
                if (this.router.url.includes($event._id)) {
                  this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '/support')]);
                  this.activeMenu = res;
                }
              } else if (res === 'event') {
                if (this.router.url.includes($event._id)) {
                  this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '')]);
                  this._searchContent();
                  this.activeMenu = '';
                }
              } else if (!res) {
                if (this.router.url.includes($event._id)) {
                  this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '')]);
                  this.activeMenu = '';
                }
              }

              if (!!posY) {
                setTimeout(() => {
                  this._scrollToHeightSmooth(Number(posY));
                  sessionStorage.removeItem('posY');
                }, 300);
              }
            });
            this.isOpenDialog = false;
          }
        }).catch((err) => {
          if (err) {
          }
        });
      } else {
        this.voteFacade.getVoteChoice($event._id).then((res => {
          if (res) {
            if (this.activeUrl['name'] === undefined || this.activeUrl['name'] === '') {
              this.router.navigate([this.router.url + '/event/' + $event._id]);
            } else if (this.activeUrl['name'] === 'my-vote') {
              this.router.navigate([this.router.url.replace('/my-vote', '/event/' + $event._id)]);
            } else if (this.activeUrl['name'] === 'open') {
              this.router.navigate([this.router.url.replace('/open', '/event/' + $event._id)]);
            } else if (this.activeUrl['name'] === 'result') {
              this.router.navigate([this.router.url.replace('/result', '/event/' + $event._id)]);
            } else if (this.activeUrl['name'] === 'all') {
              this.router.navigate([this.router.url.replace(/\/all.*$/, '/event/' + $event._id)]);
            }
            if (!!res) {
              const dialogRef = this.dialog.open(DialogPostCrad, {
                backdropClass: 'backdrop-overlay',
                panelClass: 'panel-backgroud',
                hasBackdrop: false,
                disableClose: false,
                autoFocus: false,
                data: {
                  post: $event,
                  choice: res,
                  vote: true,
                  isAllow: this.isAllowCreate,
                  menu: !!this.paramsKey ? this.activeMenu + '?key=' + this.paramsKey : this.activeMenu
                }
              });
              dialogRef.afterClosed().subscribe((res) => {
                if (res) {
                  let pattern = /key=(.+)/;
                  let match = res.match(pattern);
                  if (match && match[1]) {
                    if (this.router.url.includes($event._id)) {
                      this.offset = 0;
                      this.limitLoad = 1;
                      this.isCantLoad = false;
                      this.router.navigate(['', 'vote', 'all'], { queryParams: { key: match[1] } });
                      this.paramsKey = match[1];
                    }
                  }
                }
                if (res === 'my-vote') {
                  if (this.router.url.includes($event._id)) {
                    this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '/my-vote')]);
                    this.activeMenu = res;
                  }
                } else if (res === 'open') {
                  if (this.router.url.includes($event._id)) {
                    this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '/open')]);
                    this.activeMenu = res;
                  }
                } else if (res === 'event') {
                  if (this.router.url.includes($event._id)) {
                    this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '')]);
                    this._searchContent();
                    this.activeMenu = '';
                  }
                } else if (res === 'result') {
                  if (this.router.url.includes($event._id)) {
                    this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '/result')]);
                    this.activeMenu = res;
                  }
                } else if (res === 'all') {
                  if (this.router.url.includes($event._id)) {
                    this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '/all')]);
                    this.activeMenu = res;
                  }
                } else if (!res) {
                  if (this.router.url.includes($event._id)) {
                    this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '')]);
                    this.activeMenu = '';
                  }
                }
                if (!!posY) {
                  setTimeout(() => {
                    this._scrollToHeightSmooth(Number(posY));
                    sessionStorage.removeItem('posY');
                  }, 300);
                }
              });
            }
            this.isOpenDialog = false;
          }
        })).catch((err) => {
          if (err) {
            if (err.error.message === "Not found Vote Item.") {
              const dialogRef = this.dialog.open(DialogPostCrad, {
                backdropClass: 'backdrop-overlay',
                panelClass: 'panel-backgroud',
                hasBackdrop: false,
                disableClose: false,
                autoFocus: false,
                data: {
                  post: $event,
                  choice: [],
                  vote: true,
                  isAllow: this.isAllowCreate,
                  menu: !!this.paramsKey ? this.activeMenu + '?key=' + this.paramsKey : this.activeMenu
                }
              });
            }
            this.isOpenDialog = false;
          }
        });
      }
    }
  }

  public checkLengthPin(className?: string) {
    let element;
    if (className === 'pin') element = this.pinContent;
    return element === undefined ? false : true;
  }
  public checkLengthMyVote(className?: string) {
    let element;
    if (className === 'my-vote') element = this.myVoteContent;
    return element === undefined ? false : true;
  }
  public checkLengthSupport(className?: string) {
    let element;
    if (className === 'support') element = this.supportContent;
    return element === undefined ? false : true;
  }

  public deleteDataVote($event) {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: 'คุณต้องการลบโหวตนี้ใช่หรือไม่',
        bottomText2: 'ใช่',
        bottomText1: 'ไม่',
        isDelete: true,
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;
        this.voteFacade.deleteVote($event._id).then((res) => {
          if (res) {
            if (res.message === "delete vote event is success.") {
              if (this.activeMenu === undefined || this.activeMenu === '') {
                this._searchContent();
              } else if (this.activeMenu === 'my-vote') {
                this.searchValue();
              } else {
                const index = this.voteData.findIndex(item => item._id === $event._id);
                this.voteData.splice(index, 1);
              }
            }
            this.isLoading = false;
          }
        }).catch((err) => {
          if (err) {
            this.isLoading = false;
          }
        });
      }
    });
  }

  public editVote($event) {
    this.voteFacade.getVoteChoice($event._id).then((res) => {
      let dialog = this.dialog.open(DialogCreateVote, {
        panelClass: 'panel-backgroud-list',
        disableClose: true,
        autoFocus: false,
        data: {
          post: $event,
          edit: true,
          support: res,
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res === 'edit') {
          this.changeMenu(this.activeMenu, true);
        }
      });
    });
  }

  public async onScrollDown(ev) {
    if (!this.isCantLoad) {
      if (this.activeUrl['name'] === 'open') {
        this._scrollSearchContent({ "status": 'vote' });
      } else if (this.activeUrl['name'] === 'result') {
        this._scrollSearchContent({ "closed": true });
      } else if (this.activeUrl['name'] === 'support') {
        this._scrollSearchContent({ "status": 'support' });
      } else if (this.activeUrl['name'] === 'result') {
        this._scrollSearchContent({ "closed": true });
      } else if (this.activeUrl['name'] === 'all') {
        this._searchContent(!!this.searchInputValue ? this.searchInputValue : null, this.typeAll, true);
      } else if (this.activeUrl['name'] === 'own') {
        this._searchContent(!!this.searchInputValue ? this.searchInputValue : null, this.typeAll, true, true);
      }
    }
  }

  private _scrollSearchContent(condition?) {
    // this.activeMenu
    this.isScrollLoading = true;
    let search: SearchFilter = new SearchFilter();
    search.limit = this.limit;
    search.offset = this.offset += this.limit;
    let whereConditions = condition;
    this.voteFacade.search(search, whereConditions, !!this.searchInputValue ? this.searchInputValue : null).then((res: any) => {
      if (res) {
        if (res.length === 0) this.limitLoad++;
        if (this.limitLoad === 2) this.isCantLoad = true;
        this.voteData = this.voteData.concat(res);
        this.isScrollLoading = false;
        this.isLoading = false;
      }
    }).catch((err) => {
      if (err) {
        this.isScrollLoading = false;
        this.isLoading = false;
      }
    });
  }

  private _triggerScroll(): void {
    const scrollContainerElement = this.scrollDiv.nativeElement;

    const event = new Event('scroll', { bubbles: true });
    scrollContainerElement.dispatchEvent(event);
  }

  @HostListener('window:resize', ['$event'])
  public getScreenSize(event?) {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth <= 768) {
      this.isRes = true;
    } else {
      this.isRes = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  WindowScrollEvent(event: KeyboardEvent) {
    this.positionY = window.scrollY;
  }

  private _scrollToHeightSmooth(position) {
    window.scrollTo({
      top: position,
      behavior: 'smooth'
    });
  }
}
