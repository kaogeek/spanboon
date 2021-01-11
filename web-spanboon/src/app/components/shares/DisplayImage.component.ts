/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'display-image',
    templateUrl: './DisplayImage.component.html'
})
export class DisplayImage {

    @Input()
    public isLoaded: any;
    @Input()
    public base64: any;
    @Input()
    public class: string;
    @Input()
    public isPreload: boolean;
    @Output()
    public clickShowImage: EventEmitter<any> = new EventEmitter();

    constructor() {

    }
    
    ngOnInit(): void {
    }

    public showDialogGallery(data : any){
        this.clickShowImage.emit(data)
      } 
}
