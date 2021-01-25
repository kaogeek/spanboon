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
    selector: 'create-title-text',
    templateUrl: './CardCreateStoryTitleText.component.html'
})
export class CardCreateStoryTitleText {

    @Input()
    protected title: any;
    @Input()
    protected dataParam: any;
    @Input()
    protected hashtag: any;
    @Input()
    protected value: any;
    @Output()
    public submit: EventEmitter<any> = new EventEmitter();

    public textAlign: string = "left"
    public textH: string = "12px"
    public textB: string = "500"
    public H: string = "h3"

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    public keyUp(key) {
        // var status = document.getElementById('phrase').innerText
        // var newStatus = status.replace(/#([^ ]+)/g, '<span class="hashtag">#$1</span>');
        // $("#phrase").html(newStatus);
        // var log = document.getElementById('phrase').innerText
    }

    public textStyleAlign(value: string) {
        this.textAlign = value
    }

    public textStyleH(value: string) {
        this.H = value
        if (value === "h1") {
            this.textH = "32px"
            this.textB = "600"
        } else if (value === "h2") {
            this.textH = "24px"
            this.textB = "600"
        } else if (value === "h3") {
            this.textH = "18px"
            this.textB = "600"
        } else if (value === "h4") {
            this.textH = "16px"
            this.textB = "600"
        } else if (value === "h5") {
            this.textH = "13px"
            this.textB = "600"
        } else if (value === "h6") {
            this.textH = "10px"
            this.textB = "600"
        }
    }

    public submits() {
        var unit = (<HTMLInputElement>document.getElementById("text-H")).value;
        this.submit.emit({ text: unit, textAlign: this.textAlign, textH: this.H });
        parseFloat((<HTMLInputElement>document.getElementById("text-H")).value = null);
    }

}
