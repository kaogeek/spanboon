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

const PAGE_NAME: string = 'vote';
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
  public isSearch: boolean = false;
  public isEmpty: boolean = false;
  public searchInputValue: string;
  public windowWidth: any;
  public isRes: boolean = false;
  public isAllowCreate: boolean = false;
  public model: any;
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
  constructor(
    authenManager: AuthenManager,
    router: Router,
    _ngZone: NgZone,
    dialog: MatDialog,
    voteFacade: VoteEventFacade,
    private activeRoute: ActivatedRoute
  ) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.voteFacade = voteFacade;

    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd), takeUntil(this.destroy))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute.children.forEach(child => {
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
            }
          })
        });
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
    let isOpenDialog: boolean = false;
    if (!!this.activeUrl['id']) {
      const data = await this.voteFacade.getVote(this.activeUrl['id']);
      if (!!data) {
        this.openDialogPost(data);
        isOpenDialog = true;
      }
    }
    this.userId = this.authenManager.getCurrentUser() ? this.authenManager.getCurrentUser().id : '';
    if (this.activeMenu === undefined || this.activeMenu === '') {
      this._searchContent();
    } else {
      // if (!isOpenDialog) 
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
      if (this.activeUrl['name'] === undefined || this.activeUrl['name'] === '') {
        this._searchContent(text.target.value);
      } else {
        this.searchValue(text.target.value);
      }
    });
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

  public _searchContent(keyword?) {
    this.isLoading = true;
    this.voteFacade.searchAll(this.isLogin(), keyword).then((res) => {
      if (res) {
        this.model = res;
        this.isLoading = false;
      }
    }).catch((err) => {
      if (err) {
        this.isLoading = false;
      }
    });
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
    if (isOwn) {
      this.voteFacade.searchOwn(search, keyword ? keyword : null).then((res: any) => {
        if (res) {
          this.voteData = res;
          if (!!keyword) this.voteData = [];
          if (this.voteData.length === 0) this.isEmpty = true;
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
          this.voteData = !condition ? res : [...this.voteData, ...res];
          if (this.voteData.length === 0) this.isEmpty = true;
          this.isLoading = false;
        }
      }).catch((err) => {
        if (err) {
          this.isLoading = false;
        }
      });
    }
  }

  private _removeDuplicateIds(array) {
    const uniqueIds = [];
    return array.filter(item => {
      if (!uniqueIds.includes(item._id)) {
        uniqueIds.push(item._id);
        return true;
      }
      return false;
    });
  }

  public searchValue(value?) {
    // this.isLoading = true;
    this.isSearch = value !== undefined || value !== '' ? true : false;
    this.isEmpty = false;
    this.searchInputValue = value;
    if (this.activeUrl['name'] === 'support') {
      this.searchVoteContent({
        "status": 'support',
        "approved": false,
        "pin": false,
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
        "approved": true,
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

  public changeMenu(menu, isLoad?) {
    this.isLoading = true;
    this.searchInputValue = '';
    this.isSearch = false;
    this.isEmpty = false;
    this.searchInput.nativeElement.value = "";
    if ((menu === 'support' && this.activeUrl['name'] !== 'support') || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
        "status": 'support',
        "approved": false,
        "pin": false,
      });
    } else if (menu === 'open' && this.activeUrl['name'] !== 'open' || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
        "status": 'vote',
      });
    } else if (menu === 'my-vote' && this.activeUrl['name'] !== 'my-vote' || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
      }, true);
    } else if (menu === 'result' && this.activeUrl['name'] !== 'result' || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
        "approved": true,
      });
    } else if (menu === '' && this.activeUrl['name'] !== undefined || isLoad) {
      this._searchContent();
    } else {
      this.isLoading = false;
    }
  }

  private _checkRouting(id: any): boolean {
    const menu = this.menuList.filter((item) => item.status === id.name || id.name === 'event');
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
        this.activeMenu = 'support';
      }
    });
  }

  public openDialogPost($event) {
    if (!$event.approved) {
      this.voteFacade.getSupport($event._id).then((res) => {
        if (res) {
          if (this.activeUrl['name'] === undefined || this.activeUrl['name'] === '') {
            this.router.navigate([this.router.url + '/event/' + $event._id]);
          } else if (this.activeUrl['name'] === 'my-vote') {
            this.router.navigate([this.router.url.replace('/my-vote', '/event/' + $event._id)]);
          } else if (this.activeUrl['name'] === 'support') {
            this.router.navigate([this.router.url.replace('/support', '/event/' + $event._id)]);
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
              menu: this.activeMenu
            }
          });
          dialogRef.afterClosed().subscribe((res) => {
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
          });
        }
      }).catch((err) => {
        if (err) {
        }
      });
    } else {
      if (!$event.closed) {
        this.voteFacade.getVoteChoice($event._id).then((res => {
          if (res) {
            if (this.activeUrl['name'] === undefined || this.activeUrl['name'] === '') {
              this.router.navigate([this.router.url + '/event/' + $event._id]);
            } else if (this.activeUrl['name'] === 'my-vote') {
              this.router.navigate([this.router.url.replace('/my-vote', '/event/' + $event._id)]);
            } else if (this.activeUrl['name'] === 'open') {
              this.router.navigate([this.router.url.replace('/open', '/event/' + $event._id)]);
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
                  menu: this.activeMenu
                }
              });
              dialogRef.afterClosed().subscribe((res) => {
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
                } else if (!res) {
                  if (this.router.url.includes($event._id)) {
                    this.router.navigate([this.router.url.replace(`/event/${$event._id}`, '')]);
                    this.activeMenu = '';
                  }
                }
              });
            }
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
                  menu: this.activeMenu
                }
              });
            }
          }
        });
      } else {
        this.voteFacade.getVoteChoice($event._id).then((res) => {
          if (res) {
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
                menu: this.activeMenu
              }
            });
          }
        }).catch((err) => {
          if (err) {
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
        text: 'จะลบโหวตหรือไม่',
        bottomText2: 'ใช่',
        bottomText1: 'ไม่',
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

  @HostListener('window:resize', ['$event'])
  public getScreenSize(event?) {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth <= 768) {
      this.isRes = true;
    } else {
      this.isRes = false;
    }
  }
}
