/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'dialog-delete',
    templateUrl: './DialogDeleteComponent.component.html'
})
export class DialogDeleteComponent {

    public isValidate: boolean;
    public nameFormControl = new FormControl('', [
        Validators.required
    ]);

    constructor(
        public dialogRef: MatDialogRef<DialogDeleteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.isValidate = false;
    }

    public clickDelete(): void {
        if (this.nameFormControl.value === this.data.name || this.nameFormControl.value === this.data.title) {
            this.dialogRef.close(true);
        } else {
            this.isValidate = true;
        }
    }

    public checkName(name: string): boolean {
        if (this.data.name === name || this.data.title === name) {
            this.isValidate = false;
            return false;
        } else {
            this.isValidate = true;
            return true;
        }
    }
}