/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'null-data',
  templateUrl: './NullPostData.component.html'
})
export class NullPostData {

  @Input()
  public isRepost: boolean
  @Input()
  protected gallery: any;
  @Input()
  protected itemPost: any;
  @Input()
  protected user: any;
  @Input()
  protected commentPost: any;

  public value: any
  public isLoading: Boolean;

  constructor() {
  }
}
