/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'card-content-vote',
    templateUrl: './CardContentVote.component.html'
})
export class CardContentVote implements OnInit {

    @Input()
    public model: any;
    @Input()
    public image: any;
    @Input()
    public title: any;
    @Output()
    public openDialog: EventEmitter<any> = new EventEmitter();
    @Output()
    public deleteVote: EventEmitter<any> = new EventEmitter();

    public apiBaseURL = environment.apiBaseURL;

    constructor() {
    }

    ngOnInit(): void {
    }

    public clickDialog(itempost?) {
        this.openDialog.emit(itempost);
    }

    public clickDeleteVote() {
        this.deleteVote.emit(this.model);
    }
}
