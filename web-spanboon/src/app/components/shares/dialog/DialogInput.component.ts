/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as $ from 'jquery';
import { environment } from '../../../../environments/environment';

declare var $: any;

@Component({
    selector: 'dialog-input',
    templateUrl: './DialogInput.component.html'
})
export class DialogInput {

    public name: string;
    public quantity: number;
    public unit: string;
    public imageURL: string;
    @ViewChild('itemQuantity', { static: false })
    public itemQuantity: ElementRef;

    public apiBaseURL = environment.apiBaseURL;

    constructor(public dialogRef: MatDialogRef<DialogInput>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    public ngOnInit(): void {
        this.name = this.data.name;
        this.quantity = this.data.quantity;
        this.unit = this.data.unit;
        this.imageURL = this.data.imageURL;

        this.selectInput();
    }

    public onQuantityEdit(value) {
        this.data.quantity = value;
        this.onClose(this.data);
    }

    public onClose(data?: any) {
        if (data !== null && data !== undefined) {
            this.dialogRef.close(data);
        } else {
            this.dialogRef.close();
        }
    }

    public checkOverFulfillQty(value) {
    }

    public selectInput(event?: any) {
        const input = $("#quantity");

        if (input !== null && input !== undefined) {
            input.ready(function () {
                input.focus(function () {
                    $(this).select();
                });

                input.change(function () {
                    $(this).select();
                });
            });
        }
    }
}