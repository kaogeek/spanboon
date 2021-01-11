/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'spanboon-button-load-more',
  templateUrl: './NewConButtonLoadMore.component.html'
})
export class NewConButtonLoadMore {
 
    @Input()
    public isLoadingMore: boolean = false;
    @Input()
    public isShowLoadMore: boolean = true; 
    @Output()
    public clickLoadMore: EventEmitter<any> = new EventEmitter();

  constructor() {    

  }

  public onClickLoadMore(): void {
    this.clickLoadMore.emit();
  }
  
}
