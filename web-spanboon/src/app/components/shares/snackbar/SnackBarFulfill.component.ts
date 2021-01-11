/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material';
import { SnackbarData } from '../../../models/models';

@Component({
    selector: 'snackbar-fulfill',
    templateUrl: './SnackBarFulfill.component.html'
})

export class SnackBarFulfill {

    constructor(public snackbarRef: MatSnackBarRef<SnackBarFulfill>,
        @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData) {

    }

    onConfirm(): void {
        this.snackbarRef.dismiss();

        if (this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined) {
            this.data.confirmClickedEvent.emit(true);
        }
    }

    onClose(): void {
        this.snackbarRef.dismiss();

        if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
            this.data.cancelClickedEvent.emit(false);
        }
    }

    public ngOnInit(): void {
    }
}
