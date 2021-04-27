/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
@Component({
  selector: 'spinners',
  templateUrl: './Spinners.component.html'
})
export class Spinners implements OnInit {

  @Input("color")
  public color: string;
  @Input("height")
  public height: string;
  @Input("size")
  public size: string;

  constructor() {
  }

  public ngOnInit() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
  }

  public ngAfterViewInit(): void {
  }
}
