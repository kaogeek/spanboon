/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetFacade, AuthenManager } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import * as $ from 'jquery';

const PAGE_NAME: string = 'fulfillallocate';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'dialog-fulfill-allocate',
    templateUrl: './DialogFulfillAllocate.component.html',
})


export class DialogFulfillAllocate extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    public redirection: string;
    private activatedRoute: ActivatedRoute;

    public listItem: any

    constructor(authenManager: AuthenManager, router: Router,
        dialog: MatDialog, activatedRoute: ActivatedRoute,) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.router = router;
        this.dialog = dialog;
        this.activatedRoute = activatedRoute;

        this.listItem = [
            {
                "label": "จัดการให้อัตโนมัติ",
                "detail": "จัดสรรเข้าโพสต์ให้อัตโนมัติ เรียงจากเก่าไปใหม่",
                "type": "AUTO"
            },
            {
                "label": "จัดการด้วยตัวคุณเอง",
                "detail": "จัดสรรเข้าเหตุการณ์ด่วนหรือสิ่งที่กำลังทำ ด้วยตัวคุณเอง",
                "type": "MANUAL"
            },
            {
                "label": "เข้าโพสต์มองหาทั่วไป",
                "detail": "จัดสรรเข้าโพสต์ที่ไม่ระบุเหตุการณ์ด่วนหรือสิ่งที่กำลังทำ",
                "type": "MANUALGENERAL"
            }
        ]

        this.activatedRoute.params.subscribe((param) => {
            this.redirection = param['redirection'];
        });
    }

    ngOnInit(): void {
        // this.checkLoginAndRedirection();

    }

    public ngAfterViewInit(): void {
    }

    public ngOnDestroy(): void {
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

    private checkLoginAndRedirection(): void {
        if (!this.isLogin()) {
            if (this.redirection) {
                this.router.navigateByUrl(this.redirection);
            } else {
                this.router.navigateByUrl("/home");
            }
        }
    }

}
