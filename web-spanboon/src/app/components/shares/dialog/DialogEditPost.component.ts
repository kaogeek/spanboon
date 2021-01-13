/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-edit-post',
    templateUrl: './DialogEditPost.component.html'

})
export class DialogEditPost implements OnInit {


    @ViewChild('displayName', { static: false }) private displayName: ElementRef;

    private dateAdapter: DateAdapter<Date>
    private isActionBtn: boolean;
    public isConfirm: boolean;
    public isCheck: boolean;
    public dataUser: any;

    minDate = new Date(1800, 0, 1);
    maxDate = new Date();
    startDate: Date;

    constructor(public dialogRef: MatDialogRef<DialogEditPost>, @Inject(MAT_DIALOG_DATA) public data: any, dateAdapter: DateAdapter<Date>) {
        this.dataUser = {};
        this.dataUser.birthday = new Date();  
        this.minDate.setDate(this.minDate.getDate());
        this.minDate.setFullYear(this.minDate.getFullYear() - 200);
        this.maxDate.setDate(this.maxDate.getDate());
        this.maxDate.setFullYear(this.maxDate.getFullYear());

        this.dateAdapter = dateAdapter;
        this.dateAdapter.setLocale('th-TH');
        this.startDate = this.maxDate;
        if (this.data !== undefined && this.data !== null) {
            this.dataUser = this.data;
        }
    }

    public ngOnInit(): void { 
    }

    public onClose(): void {
        this.dialogRef.close();
    }

    public editProfile() {
        if (this.data.displayName === "" || this.data.displayName === null) {
            this.isCheck = true;
            document.getElementById("displayName").focus();
        } else {
            this.dialogRef.close(this.data);
        }
    }


}

