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
    selector: 'create-image',
    templateUrl: './CardCreateStoryImage.component.html'
})
export class CardCreateStoryImage {

    @Input()
    public title: any;
    @Input()
    protected dataParam: any;
    @Input()
    protected hashtag: any;
    @Output()
    public submit: EventEmitter<any> = new EventEmitter();

    private files: any[] = []
    public image: any

    public disabled: boolean = false;
    public isNewteb: boolean = false;
    public gridsize: number = 50;
    public imgsize: string = '50%';
    public dis: string;

    constructor() {

    }

    updateSetting(event) {
        this.gridsize = event.value;
        this.imgsize = (event.value + '%')
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    public onFileSelect(event) {
        let file = event.target.files[0];
        if (file.length === 0) {
            return;
        }
        if (file) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                this.files.push({ file });
                var b64 = reader.result;
                this.image = b64
            }
            reader.readAsDataURL(file);
        }
    }

    public submits() {
        this.submit.emit({ image: this.image, deception: this.dis, title: this.title, isNewteb: this.isNewteb, files: this.files, size: this.gridsize });
        this.image = null
        this.dis = null
        this.title = null
        this.disabled = false
        this.isNewteb = false
        this.files = null
        this.gridsize = null
        var control = $("#file-input-image")
        control.replaceWith(control.val('').clone(true));
    }


}
