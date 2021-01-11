/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input } from '@angular/core';


@Component({
    selector: 'slider',
    templateUrl: './Slider.component.html'
})
export class Slider {

    @Input()
    public topic: string;
    
    public advance: any;
    public value: any;
    public highValue: any;
    public options: any;
    public isAdvance: any;
    public item: any;
    
    constructor() {
    }

    public sliderOptions(options: any): any {}

    public onUserChange(event: any, item: any): any {}

    public onUserChangeStart(event: any, item: any): any {}

    public onUserChangeEnd(event: any, item: any): any {}

    public onChangeSlide(event): any {}
}
