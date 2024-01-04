/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
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
    @Output()
    public editVote: EventEmitter<any> = new EventEmitter();

    public userId: any;
    public apiBaseURL = environment.apiBaseURL;
    private authenManager: AuthenManager;

    constructor(authenManager: AuthenManager) {
        this.authenManager = authenManager;
    }

    ngOnInit(): void {
        let user = JSON.parse(localStorage.getItem('pageUser'));
        this.userId = !!user ? user.id : undefined;
        if (this.model.status === 'support') {
            this.model.endVoteDay = this._calculateDate(this.model.endSupportDatetime, true);
            this.model.endVoteHour = this._calculateDate(this.model.endSupportDatetime, false);
            this.model.endVoteMinute = this._calculateDate(this.model.endSupportDatetime, false, true);
        } else {
            this.model.endVoteDay = this._calculateDate(this.model.endVoteDatetime, true);
            this.model.endVoteHour = this._calculateDate(this.model.endVoteDatetime, false);
            this.model.endVoteMinute = this._calculateDate(this.model.endVoteDatetime, false, true);
        }
    }
    public clickDialog(itempost?) {
        this.openDialog.emit(itempost);
    }

    public clickDeleteVote() {
        this.deleteVote.emit(this.model);
    }

    public clickEditVote() {
        this.editVote.emit(this.model);
    }

    private _calculateDate(end, isDay, isMinute?) {
        var countDownDate = new Date(end).getTime();
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        return isDay ? days : (isMinute ? minutes : hours);
    }
}
