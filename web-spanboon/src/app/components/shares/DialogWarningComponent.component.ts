/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'dialog-warning',
    templateUrl: './DialogWarningComponent.component.html'
})
export class DialogWarningComponent {

    constructor(public dialogRef: MatDialogRef<DialogWarningComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }
}