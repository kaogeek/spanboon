/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit } from '@angular/core';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service'; 

@Component({
  selector: 'spanboon-footer',
  templateUrl: './Footer.component.html',

})
export class Footer {

  public isProfile: boolean = false;
  public isLogout: boolean = false;
  public instagramurl: string;
  public twitterurl: string;
  public lineurl: string;
  public facebookurl: string;

  public isShowInstagramurl: boolean;
  public isShowTwitterurl: boolean;
  public isShowLineurl: boolean;
  public isShowFacebookurl: boolean;
  public isShowFollow: boolean;

  private cacheConfigInfo: CacheConfigInfo;

  constructor(cacheConfigInfo: CacheConfigInfo) {
    this.cacheConfigInfo = cacheConfigInfo;
    this.isShowInstagramurl = false;
    this.isShowFollow = true; 
  }
}
