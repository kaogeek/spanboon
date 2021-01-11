/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input } from '@angular/core';


@Component({
  selector: 'spanboon-button',
  templateUrl: './SpanBoonButton.component.html'
})
export class SpanBoonButton {

  @Input()
  public voteId: any;
  @Input()
  public text: string = "ข้อความ";
  @Input()
  public color: string = "#ffffff";
  @Input()
  public rippleColor: string = "#1d1c1c26";
  // public rippleColor: string = "#ffffff38";
  @Input()
  public bgColor: string = "#313f40";
  @Input()
  public border: string = "#FD545A";
  @Input()
  public radius: string = "25pt";
  @Input()
  public width: string = "100%";
  @Input()
  public height: string = "26pt";
  @Input()
  public fontSize: string = "14px";
  @Input()
  public link: string;
  @Input()
  public isRadius: boolean = true;
  @Input()
  public isPost: boolean = false;
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
