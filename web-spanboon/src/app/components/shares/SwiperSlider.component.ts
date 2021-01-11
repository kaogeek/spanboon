/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

@Component({
    selector: 'newcon-swiper-slider',
    templateUrl: './SwiperSlider.component.html',
})
export class SwiperSlider implements OnInit {

    @Input()
    protected data: any;
    @Input()
    protected slidesPerView: number;
    @Input()
    protected spaceBetween: number;
    @Input()
    protected loop: boolean;
    @Input()
    public index: number;

    constructor() {
    }

    ngOnInit() {
    }

    public configSwiper: SwiperConfigInterface = {
        direction: 'horizontal',
        slidesPerView: 3,
        spaceBetween: 15,
        keyboard: false,
        mousewheel: false,
        scrollbar: false,
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    };

    public getHeightNoneListSlider(): string {
        if (this.data.length == 0) {
            return "";
        } else {
            var x = document.getElementById("swiper-slider");
            return x.offsetHeight + "px";
        }
    }
}
