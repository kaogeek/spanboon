/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ChatRoomFacade, FulfillFacade } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { DialogInput } from '../dialog/dialog';

const PAGE_NAME: string = 'fulfill-item-card';

@Component({
    selector: 'fulfill-item-card',
    templateUrl: './FulfillItemCard.component.html'
})
export class FulfillItemCard extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @ViewChild('cardFulFill', { static: false }) cardFulFill: ElementRef;

    @Input()
    public fulfillCaseId: string = "1590753";
    @Input()
    public requestId: string = "123456";
    @Input()
    public needsId: string = "987654";
    @Input()
    public pageId: string = "987654";
    @Input()
    public chatRoomId: string = "56456454";
    @Input()
    public name: string = "ยาแก้ปวด";
    @Input()
    public unit: string = "กล่อง";
    @Input()
    public quantity: number = 100;
    @Input()
    public imageURL: string = "";
    @Input()
    public class: string | [string];
    @Input()
    public asPage: string;
    @Input()
    public item: any;
    @Input()
    public canEdit: boolean;
    @Input()
    public isCaseConfirmed: boolean;
    @Output()
    public onFulfillItemClick: EventEmitter<any> = new EventEmitter();
    @Output()
    public onFulfillItemChange: EventEmitter<any> = new EventEmitter();

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router, fulFillFacade: FulfillFacade, chatRoomFacade: ChatRoomFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.authenManager = authenManager;
        this.dialog = dialog;
        this.router = router;
    }

    public ngOnInit(): void { 
     
    } 
    
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

    public editFulfillQuantity() {
        let dialog = this.dialog.open(DialogInput, {
            width: 'auto',
            data: {
                fulfillCaseId: this.fulfillCaseId,
                pageId: this.pageId,
                requestId: this.item.requestId,
                name: this.item.name,
                quantity: this.item.quantity,
                unit: this.item.unit,
                imageURL: this.item.imageURL
            },
            disableClose: false,
        });

        dialog.afterClosed().subscribe((result) => {
            if (result !== null && result !== undefined) {
                this.onFulfillItemChange.emit(result);
            }
        });
    }

    public deleteFulfillRequest(event: any) {
        this.onFulfillItemClick.emit(this.item);
    }
}
