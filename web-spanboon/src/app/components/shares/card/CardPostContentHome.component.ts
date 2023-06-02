/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'card-content-home',
    templateUrl: './CardPostContentHome.component.html'
})
export class CardPostContentHome implements OnInit {

    @Input()
    public modelBottom: any;
    @Input()
    public itempost: any;
    @Input()
    public kaokaiProvince: any;
    @Input()
    public kaokaiHashTag: any;
    @Input()
    public kaokaiContent: any;
    @Input()
    public isReadPosts: any;
    @Input()
    public isFollowing: any;
    @Input()
    public title: any;
    @Input()
    public image: any;
    @Input()
    public ownername: any;
    @Input()
    public ownerid: any;
    @Input()
    public pageId: any;
    @Input()
    public titlepost: any;
    @Input()
    public idpost: any;
    @Input()
    public postdate: any;
    @Input()
    public comment: any;
    @Input()
    public repost: any;
    @Input()
    public like: any;
    @Input()
    public share: any;
    @Input()
    public signUrl: boolean;
    @Input()
    public isDialog: boolean;
    @Input()
    public followingProvince: any;
    @Output()
    public clickToPost: EventEmitter<any> = new EventEmitter();
    @Output()
    public clickToPage: EventEmitter<any> = new EventEmitter();
    @Output()
    public openDialog: EventEmitter<any> = new EventEmitter();

    public hidebar: boolean = true;
    public isRes1: boolean = false;
    public apiBaseURL = environment.apiBaseURL;

    constructor() {
    }

    ngOnInit(): void {
    }

    public clickPost(idpost) {
        if (!!this.pageId) {
            this.clickToPost.emit(idpost);
        } else {
            this.clickToPost.emit({ idpost: idpost, userid: this.ownerid, type: 'USER' });
        }
    }

    public clickUser(ownerid) {
        this.clickToPage.emit(ownerid);
    }

    public clickDialog(itempost) {
        this.openDialog.emit(itempost);
    }
}
