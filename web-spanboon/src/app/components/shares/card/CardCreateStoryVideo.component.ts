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
    selector: 'create-video',
    templateUrl: './CardCreateStoryVideo.component.html'
})
export class CardCreateStoryVideo {

    @Input()
    protected title: any;
    @Input()
    protected dataParam: any;
    @Input()
    protected hashtag: any;
    @Output()
    public submit: EventEmitter<any> = new EventEmitter();

    private files: any[] = []
    public video: any
    public linkvideo: any
    public dis: any
    public autoPlay: boolean = false

    public path: string = "https://www.youtube.com/embed/"

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    public getLinkVideo() {
        var unit = (<HTMLInputElement>document.getElementById("link-video")).value;
        var index1 = unit.indexOf('v=')
        var index2 = unit.indexOf('&')
        if (index2 > 0) {
            this.video = (this.path + unit.substring(index1 + 2, index2));
        } else {
            this.video = (this.path + unit.substring(index1 + 2));

        }
        var div = document.getElementById("iframeV");
        div.setAttribute("src", this.video);
        if (document.getElementById("video").firstChild) {
        }
        document.getElementById("video").appendChild(div);
    }

    public submits() {
        this.submit.emit({ link: this.video, autoPlay: this.autoPlay, dis: this.dis });
        var div = document.getElementById("iframeV");
        div.removeAttribute("src");
    }

}
