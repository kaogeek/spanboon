/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { PLATFORM_FULFILL_TEXT, PLATFORM_NEEDS_TEXT } from '../../../../custom/variable';

let fulfill: any[] = [];

@Component({
    selector: 'dialog-confirm-fulfill',
    templateUrl: './DialogConfirmFulfill.component.html'
})

export class DialogConfirmFulfill {

    private isbottom: boolean
    public displayedColumns: string[] = ['imageURL', 'name', 'currentQuantity', 'fulfillQuantity', 'remainQuantity'];
    public dataSource: MatTableDataSource<any> = undefined;

    public apiBaseURL = environment.apiBaseURL;
    public PLATFORM_FULFILL_TEXT: string = PLATFORM_FULFILL_TEXT;
    public PLATFORM_NEEDS_TEXT: string = PLATFORM_NEEDS_TEXT;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    constructor(public dialogRef: MatDialogRef<DialogConfirmFulfill>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        if (this.data.item !== null && this.data.item !== undefined) {
            for (const item of this.data.item) {
                const name = item.name;
                const unit = item.unit;
                const imageURL = item.imageURL;
                const needsQuantity = item.needs.quantity;
                const currentQuantity = needsQuantity - item.needs.fulfillQuantity;
                const fulfillQuantity = item.quantity;
                const remainQuantity = currentQuantity - fulfillQuantity;

                const result = { name, unit, imageURL, needsQuantity, currentQuantity, fulfillQuantity, remainQuantity };
                fulfill.push(result);
            }

            this.dataSource = new MatTableDataSource<any>(fulfill);
        }
    }

    public onConfirm(): void {
        fulfill = [];
        this.isbottom = true
        this.dialogRef.close(this.isbottom);

        if (this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined) {
            this.data.confirmClickedEvent.emit(true);
        }
    }

    public onClose(): void {
        fulfill = [];
        this.isbottom = false
        this.dialogRef.close(this.isbottom);

        if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
            this.data.cancelClickedEvent.emit(false);
        }
    }

    public ngOnInit(): void { }

    public ngOnDestroy(): void {
        fulfill = [];
    }
}
