/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, HostListener, EventEmitter } from '@angular/core';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import * as $ from 'jquery';
import { AbstractPage } from '../AbstractPage';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from '../../../services/services';

declare var $: any;
@Component({
  selector: 'spanboon-footer-mobile',
  templateUrl: './FooterMobile.component.html',

})
export class FooterMobile extends AbstractPage implements OnInit{

  public isProfile: boolean = false;
  public isLogout: boolean = false;
  public instagramurl: string;
  public twitterurl: string;
  public lineurl: string;
  public facebookurl: string;
  public user: any;

  public isShowInstagramurl: boolean;
  public isShowTwitterurl: boolean;
  public isShowLineurl: boolean;
  public isShowFacebookurl: boolean;
  public isShowFollow: boolean;

  private cacheConfigInfo: CacheConfigInfo;
  scrollTop = 0;
  hideNav = false;

  constructor(cacheConfigInfo: CacheConfigInfo ,authenManager: AuthenManager, dialog: MatDialog, router: Router) {
      super(null, authenManager, dialog, router);
    this.cacheConfigInfo = cacheConfigInfo;
    this.isShowInstagramurl = false;
    this.isShowFollow = true;

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
  
  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
  }
 
  public checkUniqueId() { 
    if (this.user && this.user.id !== '' && this.user.uniqueId && this.user.uniqueId !== "") {
      return '/profile/' + this.user.uniqueId;
    } else {
      return '/profile/' + this.user.id
    }
  }



  // @HostListener('window:scroll', ['$event'])
  // onScroll($event) {

    // console.debug("Scroll Event", window.pageYOffset);
    // if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
    //   document.body.classList.add("bottommenu");
    //   document.body.classList.remove("footer-mobile");
    // } else {
    //   document.body.classList.remove("bottommenu");
    //   document.body.classList.add("footer-mobile");
    //   document.getElementById("bottommenu").style.bottom = "0";
    // }
  // }

}
