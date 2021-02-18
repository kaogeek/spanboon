/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, HostListener, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ObservableManager } from '../../services/ObservableManager.service';
import * as $ from 'jquery';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AbstractPage } from './AbstractPage';
import { MatDialog } from '@angular/material';
import { DialogPost } from '../shares/shares';
import { AuthenManager } from '../../services/AuthenManager.service';

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

  public redirection: string;

  private observManager: ObservableManager;
  private routeActivated: ActivatedRoute;
  loadLogin: boolean = false;

  @ViewChild("mainpage", { static: true }) mainpage: ElementRef;

  constructor(observManager: ObservableManager, router: Router, routeActivated: ActivatedRoute, authenManager: AuthenManager, dialog: MatDialog) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.observManager = observManager;
    this.authenManager = authenManager;
    this.routeActivated = routeActivated;
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

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url: string = decodeURI(this.router.url);
        const path = url.split('/')[1];
        if (url === "/home" || '/' + path === "/page" || '/' + path === "/profile" || url === "/recommend") {
          this.isPost = true;
        }
        if (url === '/login' || (path === "fulfill")) {
          this.isPost = false;
        }
      }
    });


    this.observManager.createSubject('scroll.buttom');
    this.observManager.createSubject('scroll.fix');
    this.observManager.createSubject('scroll');
    this.observManager.createSubject('menu.click');
  }


  public ngOnInit(): void {
    this.isLogin();

    const dev = sessionStorage.getItem('isDev');
    if (dev) {
      this.isDev = false;
    } else {
      this.isDev = true;
    }
  }

  ngAfterViewInit(): void {
    var prev = 0;
    // var spanboonHome = $('#menubottom');
    var spanboonHome = $(window).scrollTop();
    // console.log('spanboonHome ',spanboonHome.scrollTop())
    $(window).scroll(() => {
      this.scrollTop();
      var scrollTop = $(window).scrollTop();
      // var scrollTop = spanboonHome.scrollTop(); 
      $('.footer-mobile').toggleClass('hidden', scrollTop > prev);
      $('.header-top').toggleClass('hidden', scrollTop > prev);
      $('.fix-hompage-bar').toggleClass('hidden', scrollTop > prev);
      $('.spanboon-main-page').toggleClass('hidescroll', scrollTop > prev);
      $('.icon-post-bottom').toggleClass('hidden', scrollTop > prev);
      prev = scrollTop;
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

    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
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
      if ($(window).scrollTop() + $(window).height() == $(document).height()) {
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
    // var scrolltotop = document.getElementById("menubottom");
    var scrolltotop = this.mainpage.nativeElement;
    scrolltotop.scrollTop = 0
  }

  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
  }

  public dialogPost() {
    if (this.isLogin()) {
      let dataName;
      if (this.user && this.user.name) {
        dataName = this.user.name
      } else if (this.user && this.user.uniqueId) {
        dataName = this.user.uniqueId
      } else if (this.user.displayName) {
        dataName = this.user.displayName
      }
      this.data.name = dataName;
      this.data.isListPage = true;
      this.data.isHeaderPage = true;
      this.data.isEdit = false;
      this.data.isFulfill = false;
      this.data.modeDoIng = true;
      this.data.isMobileButton = true;
      this.data.id = this.user.id;

      const dialogRef = this.dialog.open(DialogPost, {
        width: 'auto',
        data: this.data,
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe(result => {
        // if (result === undefined) { 
        //   this.data.topic = '';
        //   this.data.content = '';
        //   // this.imageIcon.push(result);
        // }
        this.stopLoading();
      });
    } else {
      this.router.navigateByUrl('/login')
    }
  }

  private stopLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}



export * from './main.internal/HomePage.component';
export * from './main.internal/Redirect.component';
export * from './main.internal/LoginPage.component';
export * from './main.internal/ForgotPasswordPage.component';
export * from './main.internal/ProfilePage.component';
export * from './main.internal/FanPage.component';
export * from './main.internal/StoryPage.component';
export * from './main.internal/PostPage.component';
export * from './main.internal/PageHashTag.component';
export * from './main.internal/PageRecommended.component';
export * from './main.internal/Policy.component';
export * from './main.internal/register.internal/MenuRegister.component';
export * from './main.internal/register.internal/RegisterPage.component';
export * from './main.internal/profile.internal/profile';
export * from './main.internal/fanpage.internal/fanpage';
export * from './main.internal/fulfill.internal/fulfill'; 