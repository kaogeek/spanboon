/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { PLATFORM_NAME_TH, PLATFORM_NAME_ENG, PLATFORM_SOPPORT_EMAIL, PLATFORM_URL, PLATFORM_FULFILL_TEXT } from '../../../../custom/variable';
import { environment } from 'src/environments/environment';

let needs: any[] = [];

@Component({
    selector: 'dialog-check-fulfill',
    templateUrl: './DialogCheckFulfill.component.html'
})

export class DialogCheckFulfill {

    private isbottom: boolean
    public apiBaseURL = environment.apiBaseURL;
    public displayedColumns: string[] = ['imageURL', 'name', 'quantity', 'unit'];
    public dataSource: MatTableDataSource<any> = undefined;
    public PLATFORM_FULFILL_TEXT: string = PLATFORM_FULFILL_TEXT

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    constructor(public dialogRef: MatDialogRef<DialogCheckFulfill>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        if (this.data.item !== null && this.data.item !== undefined) {
            for (const item of this.data.item) {
                const name = item.name;
                const quantity = item.quantity;
                const unit = item.unit;
                const imageURL = item.imageURL;

                const result = { name, unit, quantity, imageURL };
                needs.push(result);
            }

            this.dataSource = new MatTableDataSource<any>(needs);
        }
    }

    public onConfirm(): void {
        this.isbottom = true
        this.closeDialog(this.isbottom);

        if (this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined) {
            this.data.confirmClickedEvent.emit(true);
        }
    }

    public onClose(): void {
        needs = [];
        this.isbottom = false
        this.closeDialog(this.isbottom);

        if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
            this.data.cancelClickedEvent.emit(false);
        }
    }

    public onCancel(): void {
        this.closeDialog();
    }

    public ngOnInit(): void { }

    private closeDialog(data?: any) {
        needs = [];

        if (data !== null && data !== undefined) {
            this.dialogRef.close(data);
        } else {
            this.dialogRef.close();
        }
    }

    public ngOnDestroy(): void {
        needs = [];
    }
}
