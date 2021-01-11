/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';

const PAGE_NAME: string = 'card-fulfill-item';

@Component({
    selector: 'card-fulfill-item',
    templateUrl: './CardFulfillItem.component.html'
})
export class CardFulfillItem extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public itemName: string = "ยาแก้ปวด";
    @Input()
    public itemUnit: string = "กล่อง";
    @Input()
    public itemQuantity: number = 100;
    @Input()
    public imageURL: string = "";
    @Input()
    public class: string | [string];
    @Input()
    public item: any;

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.authenManager = authenManager;
        this.dialog = dialog;
        this.router = router;
    }

    public ngOnInit(): void { }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public isPageDirty(): boolean {
        // throw new Error('Method not implemented.');
        return false;
    }

    public onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        // throw new Error('Method not implemented.');
        return;
    }

    public onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        // throw new Error('Method not implemented.');
        return;
    }
}
