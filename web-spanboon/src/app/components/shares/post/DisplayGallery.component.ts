/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment'; 

@Component({
  selector: 'display-gallery',
  templateUrl: './DisplayGallery.component.html'
})
export class DisplayGallery {

  @Input()
  public gallery: any;
  @Output()
  public clickShowImage: EventEmitter<any> = new EventEmitter();

  public apiBaseURL = environment.apiBaseURL;

  constructor() {

  }

  public showDialogGallery(index: any) {  
    this.clickShowImage.emit({index: index, gallerys: this.gallery});
  }
}
