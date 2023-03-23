/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ObservableManager } from '../../services/ObservableManager.service';
import * as $ from 'jquery';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AbstractPage } from './AbstractPage';
import { MatDialog } from '@angular/material';
import { AuthenManager } from '../../services/AuthenManager.service';
import { UserAccessFacade } from '../../services/facade/UserAccessFacade.service';
import { filter } from 'rxjs/internal/operators/filter';
import { DialogPost } from '../shares/dialog/DialogPost.component';
import { DialogPoliciesAndTerms } from '../shares/dialog/DialogPoliciesAndTerms.component';

declare var $: any;
const PAGE_NAME: string = '';

@Component({
  selector: 'spanboon-main-page',
  templateUrl: './MainPage.component.html',
})
export class MainPage extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public hide = true;
  public url: any;
  public indexPage: any;
  public email: string = '';
  public password: string = '';
  public isclickmenu: boolean;
  public isdivtop: boolean = false;
  public isPost: boolean = false;
  public isprofile: boolean = false;
  public isLoading: boolean;
  public user: any;
  public data: any;
  public isDev: boolean = true;
  public isDirty: boolean = false;
  public hidebar: boolean = true;
  public isLock: boolean = false;

  public redirection: string;

  private observManager: ObservableManager;
  private routeActivated: ActivatedRoute;
  private userAccessFacade: UserAccessFacade;
  loadLogin: boolean = false;

  @ViewChild("mainpage", { static: true }) mainpage: ElementRef;

  constructor(observManager: ObservableManager, router: Router, private route: ActivatedRoute, routeActivated: ActivatedRoute, authenManager: AuthenManager, dialog: MatDialog, userAccessFacade: UserAccessFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.observManager = observManager;
    this.authenManager = authenManager;
    this.routeActivated = routeActivated;
    this.userAccessFacade = userAccessFacade;
    this.data = {};

    this.observManager.subscribe('menu.click', (clickmenu) => {
      this.isclickmenu = clickmenu.click;

      if (window.innerWidth >= 1074) {

      } else {
        if (clickmenu.click === true) {
          // var element = document.getElementById("menubottom");
          var element = this.mainpage.nativeElement;
          element.classList.add("scroll-mainpage");

        } else {
          // var element = document.getElementById("menubottom");
          var element = this.mainpage.nativeElement;
          element.classList.remove("scroll-mainpage");
        }
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(async (event: NavigationEnd) => {
      if (event instanceof NavigationEnd) {
        const url: string = decodeURI(this.router.url);
        const path = url.split('/')[1];
        if (url === "/home" || '/' + path === "/page" || '/' + path === "/profile" || url === "/recommend") {
          this.isPost = true;
        }
        if (url === '/login' || (path === "fulfill")) {
          this.isPost = false;
        }

        if (this.isLogin()) {
          const policy = this.authenManager.checkVersionPolicy('v2');
          const tos = this.authenManager.checkVersionTos('v2');

          if (!policy || await this.authenManager.getParams('policy')) {
            this._dialogPolicy();
          }

          if (!tos || await this.authenManager.getParams('tos')) {
            this._dialogTerms();
          }
        }
      }
    });

    this.observManager.createSubject('scroll.buttom');
    this.observManager.createSubject('scroll.fix');
    this.observManager.createSubject('scroll');
    this.observManager.createSubject('menu.click');
  }

  public ngOnInit(): void {
    this.hidebar = this.authenManager.getHidebar();
    const isLogin: boolean = this.isLogin();

    // if (isLogin) {
    //   this.searchAccessPage();
    // }


    // const dev = sessionStorage.getItem('isDev');
    // if (dev) {
    //   this.isDev = false;
    // } else {
    //   this.isDev = true;
    // }
  }

  public ngAfterViewInit(): void {
    var prev = 0;
    // var spanboonHome = $('#menubottom'); 
    $(window).scroll(() => {
      this.scrollTop();
      var scrollTop = $(window).scrollTop();
      // var scrollTop = spanboonHome.scrollTop();   
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // you're at the bottom of the page
        $('.header-top').addClass('hidden');
        $('.footer-mobile').addClass('hidden');
      } else {
        if (window.scrollY === 0) {
          $('.icon-post-bottom').removeClass('hidden');
        } else {
          $('.footer-mobile').toggleClass('hidden', scrollTop > prev);
          $('.header-top').toggleClass('hidden', scrollTop > prev);
          // $('.hompage-title').toggleClass('hidden', scrollTop > prev);
          $('.fix-hompage-bar').toggleClass('hidden', scrollTop > prev);
          // $('.spanboon-main-page').toggleClass('hidescroll', scrollTop > prev);
          $('.icon-post-bottom').toggleClass('hidden', scrollTop > prev);
        }
      }

      prev = scrollTop;
      if (scrollTop < 10) {
        $('.header-top').removeClass('hidden');
        $('.footer-mobile').removeClass('hidden');
      }

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

  public isShowFooter(): boolean {
    return !this.router.url.includes('profile') && !this.router.url.includes('page');
  }

  public scrollTop(event?) {

    // if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
    //   this.observManager.publish('scroll.buttom', null);
    // }
    // var scrolltotop = document.getElementById("menubottom"); 

    if ($(window).scrollTop() + $(window).height() > ($(document).height() - 250)) {
      this.observManager.publish('scroll.buttom', null);
    }

    var scrolltotop = this.mainpage.nativeElement;
    this.observManager.publish('scroll', scrolltotop.scrollTop);
    var postBottom = $(".icon-post-bottom");
    const path = this.router.url.split('/')[1];

    if ((this.router.url === "/login") || (this.router.url === "/register/menu") || (this.router.url === "/register") || (this.router.url === '/register?mode=normal') || (this.router.url === "/forgotpassword") || (path === "fulfill")) {
      this.isdivtop = false;
      this.isPost = false;
    } else {
      this.isPost = true;
      if ($(window).scrollTop() > 1) {
        if (window.innerWidth > 1024) {
          postBottom.addClass("active");
          this.isdivtop = true;
        } else {
          postBottom.removeClass("active");
          this.isdivtop = false;
        }
      } else {
        postBottom.removeClass("active");
        this.isdivtop = false;
      }
    }

    // profile---------------------------------------------
    if (window.innerWidth > 1440) {

      if (scrolltotop.scrollTop > 86.32957) {
        this.isprofile = true;
      } else {
        this.isprofile = false;
      }

    } else if (window.innerWidth <= 1440) {

      if (scrolltotop.scrollTop > 79.688834) {
        this.isprofile = true;
      } else {
        this.isprofile = false;
      }

    } else if (window.innerWidth <= 1200) {

      if (scrolltotop.scrollTop > 73.048098) {
        this.isprofile = true;
      } else {
        this.isprofile = false;
      }

    } else if (window.innerWidth <= 1024) {

      if (scrolltotop.scrollTop > 66.407362) {
        this.isprofile = true;
      } else {
        this.isprofile = false;
      }

    } else if (window.innerWidth <= 768) {

      if (scrolltotop.scrollTop > 53.125889) {
        this.isprofile = true;
      } else {
        this.isprofile = false;
      }
    } else {
      this.isprofile = false;
    }

    // ----------------------------

    this.observManager.publish('scroll.fix', {
      fix: scrolltotop.scrollTop
    })

    this.isDev = false;
  }

  public clickCloseDev() {
    sessionStorage.setItem('isDev', 'false');
    this.isDev = false;
  }

  public clicktotop() {
    if ($(window).scrollTop() > 1) {
      $(window).scrollTop(0);
    }
  }

  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
  }

  public async dialogPost() {
    if (!this.isLock) {
      if (this.isLogin()) {
        let dataName;
        if (this.user && this.user.name) {
          dataName = this.user.name
        } else if (this.user && this.user.uniqueId) {
          dataName = this.user.displayName
        } else if (this.user.displayName) {
          dataName = this.user.displayName
        }
        this.isLock = true;
        this.data.isListPage = true;
        this.data.isHeaderPage = true;
        this.data.isEdit = false;
        this.data.isFulfill = false;
        this.data.isMobileButton = true;
        this.data.id = this.user.id;
        // this.data.accessDataPage = await this.searchAccessPage();
        if (this.router.url.split('/')[1] === 'page') {
          this.data.name = this.router.url.split('/')[2];
          this.data.isSharePost = true;
          this.data.modeDoIng = true;
        } else {
          this.data.name = dataName;
          this.data.isSharePost = false;
          this.data.modeDoIng = false;
        }
        const dialogRef = this.dialog.open(DialogPost, {
          width: 'auto',
          data: this.data,
          panelClass: 'customize-dialog',
          disableClose: false,
        });

        dialogRef.afterClosed().subscribe(result => {
          this.stopLoading();
        });
      } else {
        this.router.navigateByUrl('/login')
      }
      setTimeout(() => {
        this.isLock = false;
      }, 1000);
    }
  }

  public async searchAccessPage() {
    return await this.userAccessFacade.getPageAccess();
  }

  private stopLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  private _dialogPolicy() {
    const dialogRef = this.dialog.open(DialogPoliciesAndTerms, {
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data: {
        mode: 'policy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authenManager.setPolicy('v2');
      }
    });
  }

  private _dialogTerms() {
    const dialogRef = this.dialog.open(DialogPoliciesAndTerms, {
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data: {
        mode: 'terms'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authenManager.setTos('v2');
      }
    });
  }
}



export * from './main.internal/HomePage.component';
export * from './main.internal/HomePageV3.component';
export * from './main.internal/Redirect.component';
export * from './main.internal/LoginPage.component';
export * from './main.internal/ForgotPasswordPage.component';
export * from './main.internal/ProfilePage.component';
export * from './main.internal/FanPage.component';
export * from './main.internal/StoryPage.component';
export * from './main.internal/PostPage.component';
export * from './main.internal/PageHashTag.component';
export * from './main.internal/PageRecommended.component';
export * from './main.internal/register.internal/MenuRegister.component';
export * from './main.internal/register.internal/RegisterPage.component';
export * from './main.internal/profile.internal/profile';
export * from './main.internal/fanpage.internal/fanpage';
export * from './main.internal/fulfill.internal/fulfill';
export * from './main.internal/timeline.internal/timeline';
export * from './main.internal/NotificationAllPage.component';
export * from './main.internal/PolicyPage.component';
export * from './main.internal/TermsOfServicePage.component';