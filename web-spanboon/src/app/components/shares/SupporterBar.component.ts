/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'supporter-bar',
  templateUrl: './SupporterBar.component.html'
})
export class SupporterBar implements OnInit {
 
  @Input()
  public supported: number = 0;
  @Input()
  public max: number = 500;
  @Input()
  public color: string = "#ffffff";
  @Input()
  public class: string | [string];

  constructor() {
  }

  ngOnInit() {

  }

  public getValue(): number {
    return (this.supported / this.max) * 100;
  }
}
