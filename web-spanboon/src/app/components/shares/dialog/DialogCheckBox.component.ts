/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import {
    Component, Input, Inject, ViewChild, ElementRef, EventEmitter, NgZone,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuthenManager } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { DialogData } from '../../../models/models';

const PAGE_NAME: string = 'checkbox';

@Component({
    selector: 'dialog-check-box',
    templateUrl: './DialogCheckBox.component.html',
})
export class DialogCheckBox extends AbstractPage {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    @Input()
    public redirection: string;
    public dialog: MatDialog;
    public apiBaseURL = environment.apiBaseURL;
    private isbottom: boolean;
    public isPreLoadIng: boolean;
    public isLoading: boolean;
    public spamTopic: any;
    public spamDetail: any;

    constructor(public dialogRef: MatDialogRef<DialogCheckBox>,
        dialog: MatDialog, authenManager: AuthenManager, router: Router,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        _ngZone: NgZone) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog;
        this.authenManager = authenManager;

    }

    public ngOnInit(): void {
    }

    public ngAfterViewInit(): void {
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    onConfirm(): void {
        this.isbottom = false
        let detail: any = document.getElementsByClassName('text-detail');
        let data;
        if (detail.length > 0) {
            this.spamDetail = detail[0].value;
        }
        if (!!this.spamTopic) {
            data = {
                topic: this.spamTopic,
                detail: this.spamDetail
            }
        }
        this.dialogRef.close(data);
        if (this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined) {
            this.data.confirmClickedEvent.emit(true);
        }
    }

    onClose(): void {
        this.isbottom = false
        this.dialogRef.close(this.isbottom);
        if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
            this.data.cancelClickedEvent.emit(false);
        }
    }
    isPageDirty(): boolean {
        // throw new Error('Method not implemented.');
        return false;
    }
    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        // throw new Error('Method not implemented.');
        return;
    }
    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        // throw new Error('Method not implemented.');
        return;
    }

    public selectTopic(topic: string, detail: string) {
        this.spamTopic = topic;
    }

    public backToSelect() {
        this.spamTopic = undefined;
    }

}
