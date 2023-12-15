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

  public activeUrl: string;
  public apiBaseURL = environment.apiBaseURL;
  public mode: string;
  public voteData: any[] = [];
  public voteModel: any = {};
  public activeMenu: string = '';
  public userId: string;
  public isLoading: boolean = false;
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
      isLogin: true,
    },
    {
      name: 'โหวตที่ฉันสร้าง',
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
      isLogin: true,
    },
    {
      name: 'ล่ารายชื่อ',
      status: 'support',
      icon: '../../../../assets/img/icons/votepage/like.svg',
      icon2: '../../../../assets/img/icons/votepage/like-active.svg',
      isLogin: true,
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
            this.activeUrl = params['id'];
            if (this._checkRouting(this.activeUrl)) {
              this.activeMenu = this.activeUrl;
            } else {
              this.router.navigate(['', 'vote']);
            }
          })
        });
      });
  }

  public ngOnInit() {
    if (this.isLogin()) {
      this.menuList[4].isLogin = true;
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
      this.searchValue(text.target.value);
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

  public _searchContent() {
    this.isLoading = true;
    this.voteFacade.searchAll().then((res) => {
      if (res) {
        this.model = res;
        this._getEndVoteTime(res, 'model');
        this.isLoading = false;
      }
    }).catch((err) => {
      if (err) {
        this.isLoading = false;
      }
    });
  }

  public searchVoteContent(condition?, isOwn?, keyword?) {
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
      this.voteFacade.searchOwn(search, whereConditions, keyword ? keyword : null).then((res) => {
        if (res) {
          if (!!keyword) {
            this.voteData = [];
          }
          if (!condition) {
            this.voteData = res;
          } else {
            this.voteData = [...this.voteData, ...res];
          }
          setTimeout(() => {
            this._getEndVoteTime(res, 'voteData');
            let data = this._removeDuplicateIds(this.voteData);
            this.voteData = data;
            this.isLoading = false;
          }, 100);
        }
      }).catch((err) => {
        if (err) {
          this.isLoading = false;
        }
      });
    } else {
      this.voteFacade.search(search, whereConditions, keyword ? keyword : null).then((res) => {
        if (res) {
          if (!!keyword) {
            this.voteData = [];
          }
          if (!condition) {
            this.voteData = res;
          } else {
            this.voteData = [...this.voteData, ...res];
          }
          setTimeout(() => {
            this._getEndVoteTime(res, 'voteData');
            let data = this._removeDuplicateIds(this.voteData);
            this.voteData = data;
            this.isLoading = false;
          }, 100);
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
    this.isLoading = true;
    if (this.activeUrl === 'support') {
      this.searchVoteContent({
        "status": 'support',
        "approved": false,
        "pin": false,
      }, false, value);
    } else if (this.activeUrl === 'open') {
      this.searchVoteContent({
        "status": 'vote',
      }, false, value);
    } else if (this.activeUrl === 'my-vote') {
      this.searchVoteContent({
      }, true, value);
    } else if (this.activeUrl === 'result') {
      this.searchVoteContent({
        "approved": true,
        "status": 'vote',
      }, false, value);
    } else if (this.activeUrl === undefined) {
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
    if ((menu === 'support' && this.activeUrl !== 'support') || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
        "status": 'support',
        "approved": false,
        "pin": false,
      });
    } else if (menu === 'open' && this.activeUrl !== 'open' || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
        "status": 'vote',
      });
    } else if (menu === 'my-vote' && this.activeUrl !== 'my-vote' || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
      }, true);
    } else if (menu === 'result' && this.activeUrl !== 'result' || isLoad) {
      this.voteData = [];
      this.searchVoteContent({
        "approved": true,
      });
    } else if (menu === '' && this.activeUrl !== undefined || isLoad) {
      this._searchContent();
    } else {
      this.isLoading = false;
    }
  }

  private _checkRouting(id: string): boolean {
    const menu = this.menuList.filter((item) => item.status === id);
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
          const dialogRef = this.dialog.open(DialogPostCrad, {
            backdropClass: 'backdrop-overlay',
            panelClass: 'panel-backgroud',
            hasBackdrop: false,
            disableClose: false,
            autoFocus: false,
            data: {
              post: $event,
              choice: [],
              support: res,
              vote: true,
              menu: this.activeMenu
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
                  menu: this.activeMenu
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

  private _getEndVoteTime(data: any, type: string) {
    if (type === 'voteData') {
      for (let index = 0; index < data.length; index++) {
        this.voteData[index].endVoteDay = this._formatEndVote(data[index].endVoteDatetime, true);
        this.voteData[index].endVoteHour = this._formatEndVote(data[index].endVoteDatetime, false);
      }
    } else {
      for (let index = 0; index < data.pin.length; index++) {
        this.model.pin[index].endVoteDay = this._formatEndVote(data.pin[index].endVoteDatetime, true);
        this.model.pin[index].endVoteHour = this._formatEndVote(data.pin[index].endVoteDatetime, false);
      }
      for (let index = 0; index < data.supporter.length; index++) {
        this.model.supporter[index].endVoteDay = this._formatEndVote(data.supporter[index].endVoteDatetime, true);
        this.model.supporter[index].endVoteHour = this._formatEndVote(data.supporter[index].endVoteDatetime, false);
      }
      for (let index = 0; index < data.myVote.length; index++) {
        this.model.myVote[index].endVoteDay = this._formatEndVote(data.myVote[index].endVoteDatetime, true);
        this.model.myVote[index].endVoteHour = this._formatEndVote(data.myVote[index].endVoteDatetime, false);
      }
      for (let index = 0; index < data.closeDate.length; index++) {
        this.model.closeDate[index].endVoteDay = this._formatEndVote(data.closeDate[index].endVoteDatetime, true);
        this.model.closeDate[index].endVoteHour = this._formatEndVote(data.closeDate[index].endVoteDatetime, false);
      }


    }
  }

  private _formatEndVote(date, isDay) {
    var countDownDate = new Date(date).getTime();
    var now = new Date().getTime();
    var distance = countDownDate - now;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return isDay ? days : hours;
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
        this.voteFacade.deleteVote($event._id).then((res) => {
          if (res) {
            if (res.message === "delete vote event is success.") {
              if (this.activeMenu === undefined || this.activeMenu === '') {
                this._searchContent();
              } else {
                const index = this.voteData.findIndex(item => item._id === $event._id);
                this.voteData.splice(index, 1);
              }
              // this.showAlertDialog("ลบโหวตเสร็จสิ้น");
            }
          }
        }).catch((err) => {
          if (err) {
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
