/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, Input } from '@angular/core';

declare var $: any;

@Component({
  selector: 'image-card',
  templateUrl: './ImageCard.component.html'
})
export class ImageCard {

  @Input()
  public data: any;
  @Input()
  public marginPerAction: string;
  @Input()
  public marginIcon: string;
  @Input()
  public widthBtnAction: string;
  @Input()
  public images: string = "https://thestandard.co/wp-content/uploads/2020/02/COVER-WEB-53.jpg";
  @Input()
  public hashTag: string = "# กราดยิงโคราช";
  @Input()
  public name: string = "Natthapong";
  @Input()
  public countTwitter: number;
  @Input()
  public countFacebook: number;
  @Input()
  public countSpanboon: number;
  @Input()
  public linkMore: string = "/";
  @Input()
  public comment: string;
  @Input()
  public isWhite: boolean = false;
  @Input()
  public reboon: string;
  @Input()
  public like: string;
  @Input()
  public share: string;
  @Input()
  public widthImg: string;
  @Input()
  public heightImg: string;
  @Input()
  public isPin: boolean = false;
  @Input()
  public isAction: boolean;
  @Input()
  public showsocial: boolean = true;
  @Input()
  public showLoading: boolean = false;
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();

  // -----------------
  @Input()
  public showDefault: boolean = true;
  @Input()
  public isComment: boolean = true;
  @Input()
  public isReboon: boolean = true;
  @Input()
  public isLike: boolean = true;
  @Input()
  public isShare: boolean = true;

  // -----------------
  @Input()
  public showSottomSocial: boolean = false;
  @Input()
  public isShowtext: boolean = false;
  @Input()
  public isShowtext2: boolean = false;
  @Input()
  public isShowtextcomment: boolean = true;
  @Input()
  public isShowtextreboon: boolean = true;
  @Input()
  public isShowtextlike: boolean = true;
  @Input()
  public isShowtextshare: boolean = true;
  @Input()
  public isShowtextPlusAll: boolean = true;

  public Allcount: number;

  private mainPostLink: string = 'https://localhost:4200/post/'
  private mainPageLink: string = 'https://localhost:4200/page/'

  public linkPost: string
  public linkPage: string

  constructor() {

  }

  public ngOnInit(): void {
    this.valueSub();
  }

  public action(even) {
    this.submit.emit();
  }

  public valueSub(){
    var Tw = Number(this.countTwitter);
    var Fb = Number(this.countFacebook);
    var Sb = Number(this.countSpanboon);
    this.Allcount = Tw + Fb + Sb;
  }
}
