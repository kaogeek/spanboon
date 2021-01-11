/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input } from '@angular/core';


@Component({
  selector: 'button-social',
  templateUrl: './ButtonSocial.component.html'
})
export class ButtonSocial {

  @Input()
  public imgsize: string = "20pt";
  @Input()
  public btnName: string;
  @Input()
  public color: string = "#F8F7F2";
  @Input()
  public bgColor: string = "#2851a3";
  @Input()
  public iconSocial: string = "";
  @Input()
  public width: string;
  @Input()
  public fontSize: string;
  @Input()
  public height: string = "34pt";
  @Input()
  public link: string;
  @Input()
  public param: string | [string];
  @Input()
  public class: string | [string];

  public rippleColor: any;

  constructor() {
    if (this.link === undefined || this.link === 'undefined') {
      return;
    }
  }
}
