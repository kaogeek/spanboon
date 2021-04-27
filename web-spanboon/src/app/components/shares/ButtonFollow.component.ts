/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input } from '@angular/core';


@Component({
  selector: 'button-follow',
  templateUrl: './ButtonFollow.component.html'
})
export class ButtonFollow {

  @Input()
  public text: string = "ข้อความ";
  @Input()
  public color: string;
  @Input()
  public bgColor: string = "#313f40";
  @Input()
  public border: string;
  @Input()
  public width: string = "76pt";
  @Input()
  public height: string = "26pt";
  @Input()
  public fontSize: string = "14px";
  @Input()
  public inputId: string;
  @Input()
  public link: string;
  @Input()
  public isRadius: boolean = true;
  @Input()
  public isDisable: boolean = false;
  @Input()
  public isNewTab: boolean = false;
  @Input()
  public class: string | [string];
  @Input()
  public param: string | [string];

  constructor() {
    if (this.link === undefined || this.link === 'undefined') {
      return;
    }
  }
}
