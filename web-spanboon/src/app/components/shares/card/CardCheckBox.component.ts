/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { SimpleChanges } from '@angular/core';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material';


@Component({
    selector: 'card-checkbox',
    templateUrl: './CardCheckBox.component.html'
})
export class CardCheckBox {

    @ViewChild('checkbox', { static: false }) checkbox: MatCheckbox;

    @Input()
    public title: any;
    @Input()
    protected dataParam: any;
    @Input()
    protected hashtag: any;
    @Input()
    public data: any;
    @Input()
    protected matHashtag: any;
    @Input()
    protected typePage: any;
    @Input()
    protected pageName: any;
    @Input()
    protected label: string;
    @Input()
    protected statusLable: string;
    @Input()
    protected isPageName: boolean = false;
    @Input()
    protected isRemove: boolean = false;
    @Input()
    public isDetail: boolean = false;
    @Input()
    protected isObjectList: boolean = false;
    @Input()
    public isObjective: boolean = false;
    @Input()
    public isMutipleCheckbox: boolean = false;
    @Input()
    protected isDoIng: boolean = false;
    @Output()
    public submit: EventEmitter<any> = new EventEmitter();
    @Output()
    public click: EventEmitter<any> = new EventEmitter();
    @Output()
    public clickMutiple: EventEmitter<any> = new EventEmitter();
    @Output()
    public loadMore: EventEmitter<any> = new EventEmitter();

    public isSelect: boolean;
    public index: number;
    public removeHashTag: any;

    constructor() {

    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isRemove) {
            if (changes && changes.matHashtag) {
                this.removeHashTag = changes.matHashtag.currentValue;
                let i = 0;
                if (this.data) {
                    for (let [index, tag] of this.data.entries()) {
                        if (tag.value === this.removeHashTag) {
                            tag.selected = false;
                        }
                        i++;
                    }
                }
            }
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.dataParam !== undefined) {
                for (let [index, tag] of this.data.entries()) {
                    if (tag.id === this.dataParam) {
                        this.index = index
                        Object.assign(this.data[index], { selected: true })
                    }
                }
            }
            if (this.typePage !== undefined && this.typePage.length > 0) {
                let i = 0;
                for (let [index, tag] of this.data.entries()) {
                    for (let page of this.typePage) {
                        if (tag.id === page) {
                            // this.index = index
                            Object.assign(this.data[index], { selected: true })
                        }
                        i++;
                    }
                }
            }
            if (this.hashtag !== undefined && this.hashtag.length > 0) {
                if (this.data) {
                    for (let [index, tag] of this.data.entries()) {
                        for (let hashtag of this.hashtag) {
                            if (tag.value === hashtag) {
                                Object.assign(this.data[index], { selected: true })
                            }
                        }
                    }
                }
            }
        }, 500);
    }

    public optionClicked(event, item, i) {
        this.checkBoxMutiple(event, item, i)
    }

    public checkBoxvalue(event, item, i) { 
        if (typeof (this.index) === 'number') {
            if (this.index !== i) {
                Object.assign(this.data[this.index], { selected: false });
                this.index = i
            }
        } else {
            this.index = i
        }
        this.click.emit(item);
    }

    public checkBoxMutiple(event, item, i) {
        this.clickMutiple.emit(item);
    }

    public showDialogEdit() {
        this.submit.emit();
    }

    public loadMoreData($event) {
        this.loadMore.emit(this.title);
    }


}
