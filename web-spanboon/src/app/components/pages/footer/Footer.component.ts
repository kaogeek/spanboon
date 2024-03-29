/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component } from '@angular/core';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { PLATFORM_NAME_TH } from '../../../../custom/variable';

@Component({
  selector: 'spanboon-footer',
  templateUrl: './Footer.component.html',

})
export class Footer {

  public PLATFORM_NAME_TH: string = PLATFORM_NAME_TH

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
