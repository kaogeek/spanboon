/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, FulfillFacade } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { PLATFORM_NAME_TH, PLATFORM_NAME_ENG, PLATFORM_SOPPORT_EMAIL, PLATFORM_URL, PLATFORM_FULFILL_TEXT } from '../../../../custom/variable';

const PAGE_NAME: string = 'dialog-fulfill';

@Component({
    selector: 'dialog-fulfill',
    templateUrl: './DialogFulfill.component.html',
})
export class DialogFulfill extends AbstractPage {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Output()
    public onSubmitFulfillDialog: EventEmitter<any> = new EventEmitter();
    @Output()
    public onCancelFulfillDialog: EventEmitter<any> = new EventEmitter();

    //Facade
    private fulfillFacade: FulfillFacade;
    // Variable
    private dataMessage: any;
    private cloneItem: any;

    public PLATFORM_FULFILL_TEXT: string = PLATFORM_FULFILL_TEXT

    constructor(public dialogRef: MatDialogRef<DialogFulfill>, @Inject(MAT_DIALOG_DATA) public data: any,
        dialog: MatDialog, authenManager: AuthenManager, router: Router, fulfillFacade: FulfillFacade) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.dialog = dialog;
        this.fulfillFacade = fulfillFacade;

        if (this.data && this.data.fulfill && this.data.fulfill !== undefined && this.data.fulfill !== null && this.data.fulfill !== '') {
            this.cloneItem = JSON.parse(JSON.stringify(this.data.fulfill));
        }
    }

    public ngOnInit(): void { }
    public ngOnDestroy(): void {
        super.ngOnDestroy();
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
    public ngAfterViewInit(): void {
        this.fulfillFacade.sharedMessage.subscribe(message => {
            this.dataMessage = message;

            if (this.dataMessage) {
                Object.assign(this.data, { arrListItem: this.dataMessage });
            }
        });

        this.dialogRef.backdropClick().subscribe((res) => {
            if (!this.dataMessage) {
                this.dialogRef.close();
                return;
            }
            if (this.dataMessage || (this.dataMessage !== this.cloneItem && this.cloneItem.arrListItem && this.cloneItem.arrListItem !== undefined)) {
                var isVaild = false;
                let message: string;
                for (let item of this.dataMessage) {
                    if (item.isAddItem) {
                        if (item.itemName === '' || item.quantity === '') {
                            isVaild = true;
                            message = 'กรุณากรอกข้อมูลให้ครบ';
                            break;
                        } else if (item.itemName !== '' && item.quantity) {
                            isVaild = false;
                            break;
                        }
                    } else {
                        isVaild = true;
                        message = 'กรุณายืนยันการทำรายการ';
                        break;
                    }
                }
                if (isVaild) {
                    let dialog = this.showAlertDialogWarming(message, "none");
                    dialog.afterClosed().subscribe((res) => {
                        if (res) {
                        }
                    });
                } else {
                    this.dialogRef.close(this.data);
                }
            } else {
                this.dialogRef.close(this.data);
            }
        });
    }

    public onClose(event) {
        if (event === undefined) {
            this.dialogRef.close();
            return;
        }
        if (event.data !== this.cloneItem && this.cloneItem.arrListItem) {
            const confirmEventEmitter = new EventEmitter<any>();
            confirmEventEmitter.subscribe(() => {
                this.onSubmitFulfillDialog.emit();
            });
            const canCelEventEmitter = new EventEmitter<any>();
            canCelEventEmitter.subscribe(() => {
                this.onCancelFulfillDialog.emit();
            });
            let dialog = this.showDialogWarming("คุณต้องการปิดรายการ" + this.PLATFORM_FULFILL_TEXT + " ใช่หรือไม่ ?", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
            dialog.afterClosed().subscribe((res) => {
                if (res) {
                    this.dialogRef.close(this.cloneItem);
                }
            });
        } else {
            this.dialogRef.close();
        }
    }

    public onConfirm(data): void {
        this.dialogRef.close(data);
    }
}