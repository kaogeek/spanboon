/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { SimpleChanges } from '@angular/core';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material';
import * as $ from 'jquery';


@Component({
    selector: 'create-text-link',
    templateUrl: './CardCreateStoryTextLink.component.html'
})
export class CardCreateStoryTextLink {

    @Input()
    protected title: any;
    @Input()
    protected dataParam: any;
    @Input()
    protected hashtag: any;
    @Output()
    public submit: EventEmitter<any> = new EventEmitter();

    public link: any
    public keylink: any
    public titlelink: any
    public newTeb: boolean = false
    public textAlign: any


    constructor() {
    }

    ngOnInit(): void {
    }

    public textStyleAlign(data) {
        this.textAlign = data
    }

    public submits() {
        // var value = parseFloat((<HTMLInputElement>document.getElementById("link")).value);
        // var unit = (<HTMLInputElement>document.getElementById("key-link")).value;
        // parseFloat((<HTMLInputElement>document.getElementById("link")).value = null);
        // (<HTMLInputElement>document.getElementById("key-link")).value = null;
        this.submit.emit({ link: this.link, keyLink: this.keylink, titlelink: this.titlelink, newTeb: this.newTeb, textAlign: this.textAlign });
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

}
