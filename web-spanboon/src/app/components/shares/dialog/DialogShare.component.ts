/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogData } from '../../../models/models';

@Component({
    selector: 'dialog-share',
    templateUrl: './DialogShare.component.html'

})

export class DialogShare {
    public mainPostLink: string;

    private isbottom: boolean
    private routing: Router;

    constructor(public dialogRef: MatDialogRef<DialogShare>, private _snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: DialogData, routing: Router) {
        this.routing = routing;
        this.mainPostLink = window.location.origin;

    }
    horizontalPosition: MatSnackBarHorizontalPosition = 'start';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';

    onConfirm(): void {
        this.isbottom = true
        this.dialogRef.close(this.isbottom);

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

    public ngOnInit(): void {

    }

    public clickCopy() {
        navigator.clipboard.writeText(this.data.text);
        this.openSnackBar();
        this.dialogRef.close(true);
    }

    public openSnackBar() {
        this._snackBar.open('คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2000,
            panelClass: ['blue-snackbar']
        });
    }
}
