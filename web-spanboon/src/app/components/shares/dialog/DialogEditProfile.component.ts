/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import * as moment from 'moment';
import { ObservableManager, ProfileFacade } from 'src/app/services/services';

@Component({
    selector: 'dialog-edit-profile',
    templateUrl: './DialogEditProfile.component.html'

})
export class DialogEditProfile implements OnInit {


    @ViewChild('displayName', { static: false }) private displayName: ElementRef;

    private dateAdapter: DateAdapter<Date>
    private isActionBtn: boolean;
    private profileFacade: ProfileFacade;
    private observManager: ObservableManager;
    public isConfirm: boolean;
    public isCheck: boolean;
    public isSend: boolean;
    public dataUser: any;
    public user: any;
    public isClose: boolean = false;

    minDate = new Date(1800, 0, 1);
    maxDate = new Date();
    startDate: Date;

    constructor(public dialogRef: MatDialogRef<DialogEditProfile>, @Inject(MAT_DIALOG_DATA) public data: any, dateAdapter: DateAdapter<Date>, profileFacade: ProfileFacade, observManager: ObservableManager) {
        this.dataUser = {};
        this.dataUser.birthday = new Date();
        this.minDate.setDate(this.minDate.getDate());
        this.minDate.setFullYear(this.minDate.getFullYear() - 200);
        this.maxDate.setDate(this.maxDate.getDate());
        this.maxDate.setFullYear(this.maxDate.getFullYear());

        this.dateAdapter = dateAdapter;
        this.dateAdapter.setLocale('th-TH');
        this.profileFacade = profileFacade;
        this.observManager = observManager;
        this.startDate = this.maxDate;
        if (this.data !== undefined && this.data !== null) {
            this.dataUser = this.data;
        }
    }

    public ngOnInit(): void {
        this._checkSendEmail();
        this._checkSubNoti();
    }

    public onClose(): void {
        this.dialogRef.close();
        this.observManager.complete('setting.account');
    }

    public editProfile() {
        if (this.data.displayName === "" || this.data.displayName === null) {
            this.isCheck = true;
            document.getElementById("displayName").focus();
        } else {
            this.dialogRef.close(this.data);
        }
    }

    private _checkSendEmail() {
        let subscribe = JSON.parse(localStorage.getItem('pageUser'));
        if (subscribe.subscribeEmail) {
            if (subscribe.subscribeEmail === true) {
                return true;
            } else {
                return false;
            }
        }
    }

    private _checkSubNoti() {
        let noti = JSON.parse(localStorage.getItem('pageUser'));
        if (noti.subscribeNoti) {
            if (noti.subscribeNoti === true) {
                return true;
            } else {
                return false;
            }
        }
    }

    public eventCheckClose(event: any) {
        this.isClose = event;
    }
}

