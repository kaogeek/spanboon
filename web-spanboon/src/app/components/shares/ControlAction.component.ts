/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PLATFORM_STORY_TALE } from '../../../custom/variable';

@Component({
  selector: 'control-action',
  templateUrl: './ControlAction.component.html'
})
export class ControlAction {

  @Input()
  public marginPerAction: string = "10pt";
  // @Input()
  // public marginIcon: string = "3pt";
  @Input()
  public widthBtnAction: string = "12pt";
  @Input()
  public isRed: boolean = false;
  @Input()
  public comment: number = 10;
  @Input()
  public reboon: number = 10;
  @Input()
  public like: number = 10;
  @Input()
  public share: number = 10;
  @Input()
  public isComment: boolean = true;
  @Input()
  public isReboon: boolean = true;
  @Input()
  public isPage: boolean = false;
  @Input()
  public isLike: boolean = true;
  @Input()
  public userLike: boolean = false;
  @Input()
  public userReboon: boolean = false;
  @Input()
  public userComment: boolean = false;
  @Input()
  public isShowUser: boolean = true;
  @Input()
  public isShare: boolean = true;
  @Input()
  public isAction: boolean = false;
  @Input()
  public accessPage: any;
  @Input()
  public isBlack: boolean = false;
  @Input()
  public isWhite: boolean = false;
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();
  @Output()
  public reboonaction: EventEmitter<any> = new EventEmitter();
  @Output()
  public emitpage: EventEmitter<any> = new EventEmitter();
  @Input()
  public isShowtext: boolean = false;
  @Input()
  public isShowtextcomment: boolean = true;
  @Input()
  public isShowtextreboon: boolean = true;
  @Input()
  public isShowtextlike: boolean = true;
  @Input()
  public isShowtextshare: boolean = true;
  @Input()
  public isShowtextPlusAll: boolean = false;
  @Input()
  public isPostShareData: any;

  public Allcount: number;

  public selectedAccessPage: any
  public selectedAccessPageimges: any;
  public isImges: boolean
  public isDis: boolean
  public apiBaseURL = environment.apiBaseURL;
  public PLATFORM_STORY_TALE: string = PLATFORM_STORY_TALE;

  constructor() {
    setTimeout(() => {
      if (this.accessPage !== undefined && this.accessPage !== null) {
        if (this.accessPage[0].img64 !== undefined && this.accessPage[0].img64 !== null && this.accessPage[0].img64 !== '') {
          this.selectedAccessPageimges = this.accessPage[0]
          this.isImges = true
          this.isDis = false
        } else {
          this.selectedAccessPageimges = this.accessPage[0].displayName || this.accessPage[0].name;
          this.isImges = false
          this.isDis = true
        }
      }
    }, 1000);
  }

  public ngOnInit(): void {
    this.valueSub();
  }

  public selectAccessPage(page: any) {
    if (page.img64 !== undefined && page.img64 !== null && page.img64 !== '') {
      this.selectedAccessPageimges = page
      this.isImges = true
      this.isDis = false
      this.emitpage.emit(page);
    } else {
      this.selectedAccessPageimges = page.displayName || page.name;
      this.isImges = false
      this.isDis = true
      this.emitpage.emit(page);
    }
  }

  public postLike() {
    this.submit.emit({ mod: 'LIKE' });
  }
  public postComment() {
    this.submit.emit({ mod: 'COMMENT' });
  }
  public postReboon(type?: string) {
    this.submit.emit({ mod: 'REBOON', type: type });
  }
  public postShare() {
    this.submit.emit({ mod: 'SHARE' });
  }

  public valueSub() {
    var Cm = Number(this.comment);
    var Rb = Number(this.reboon);
    var Li = Number(this.like);
    var Sh = Number(this.share);
    this.Allcount = Cm + Rb + Li + Sh;
  }
}
