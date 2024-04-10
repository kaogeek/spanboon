/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'dialog-input',
    templateUrl: './DialogInput.component.html'
})
export class DialogInput {

    public value: any;

    constructor(public dialogRef: MatDialogRef<DialogInput>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }
}