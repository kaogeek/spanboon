/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material';


@Component({
    selector: 'card-concerned',
    templateUrl: './CardConcerned.component.html'
})
export class CardConcerned {

    @ViewChild('checkbox', { static: false }) checkbox: MatCheckbox;

    public isSelect: boolean;
    public index: number;
    @Input()
    public dataStoryHashtag: any;

    public likeCount: number;
    public shareCount: number;

    constructor() {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }


}
