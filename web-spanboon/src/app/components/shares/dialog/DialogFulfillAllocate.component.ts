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

    public listItem: any;
    public listItemNeed: any;
    public wizardConfig: any;
    public selectNeedItem: any[] = [];

    public listBoxDisplay: string = 'none';
    public listItemBoxDisplay: string = 'none';
    public listGeneralBoxDisplay: string = 'none';

    public textHrader: string = 'จัดการรายการเติมเต็ม';

    constructor(authenManager: AuthenManager, router: Router,
        dialog: MatDialog, activatedRoute: ActivatedRoute,) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.router = router;
        this.dialog = dialog;
        this.activatedRoute = activatedRoute;

        this.listBoxDisplay = "block"

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

        this.listItemNeed = [
            {
                "active": true,
                "createdDate": "2020-10-22T04:19:24.469Z",
                "customItemId": "5f91084ca23f15136bd56350",
                "fulfillQuantity": 0,
                "id": "วัตถุดิบ(ปลาหมึก)",
                "name": "วัตถุดิบ(ปลาหมึก)",
                "pageId": "5f8e6b11a554f760422bc347",
                "pendingQuantity": 0,
                "post": "5f91084ca23f15136bd5634c",
                "quantity": 50,
                "unit": "กิโล",
            },
            {
                "active": true,
                "createdDate": "2020-10-22T04:19:24.469Z",
                "customItemId": "5f91084ca23f15136bd56350",
                "fulfillQuantity": 0,
                "id": "วัตถุดิบ(ปลาทู)",
                "name": "วัตถุดิบ(ปลาทู)",
                "pageId": "5f8e6b11a554f760422bc347",
                "pendingQuantity": 0,
                "post": "5f91084ca23f15136bd5634c",
                "quantity": 50,
                "unit": "กิโล",
            },
            {
                "active": true,
                "createdDate": "2020-10-22T04:19:24.469Z",
                "customItemId": "5f91084ca23f15136bd56350",
                "fulfillQuantity": 0,
                "id": "วัตถุดิบ(ไก่)",
                "name": "วัตถุดิบ(ไก่)",
                "pageId": "5f8e6b11a554f760422bc347",
                "pendingQuantity": 0,
                "post": "5f91084ca23f15136bd5634c",
                "quantity": 50,
                "unit": "กิโล",
            },
            {
                "active": true,
                "createdDate": "2020-10-22T04:19:24.469Z",
                "customItemId": "5f91084ca23f15136bd56350",
                "fulfillQuantity": 0,
                "id": "วัตถุดิบ(นมสด)",
                "name": "วัตถุดิบ(นมสด)",
                "pageId": "5f8e6b11a554f760422bc347",
                "pendingQuantity": 0,
                "post": "5f91084ca23f15136bd5634c",
                "quantity": 50,
                "unit": "กิโล",
            },
            {
                "active": true,
                "createdDate": "2020-10-22T04:19:24.469Z",
                "customItemId": "5f91084ca23f15136bd56350",
                "fulfillQuantity": 0,
                "id": "วัตถุดิบ(ไข่)",
                "name": "วัตถุดิบ(ไข่)",
                "pageId": "5f8e6b11a554f760422bc347",
                "pendingQuantity": 0,
                "post": "5f91084ca23f15136bd5634c",
                "quantity": 50,
                "unit": "กิโล",
            }
        ]

        this.wizardConfig = {
            "quantity": 4
        }

        this.activatedRoute.params.subscribe((param) => {
            this.redirection = param['redirection'];
        });

        for (let arr of this.listItemNeed) {
            arr.isSelect = false
        }

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

    public getQuantity(num): any {
        let arrWizard: any[] = []

        for (let index = 0; index < this.wizardConfig.quantity; index++) {
            arrWizard.push(index);
        }
        return arrWizard

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

    public checkedClick(event) {

        if (event.type === "AUTO") {

        } else if (event.type === "MANUAL") {

            this.listBoxDisplay = "none";
            this.listItemBoxDisplay = "block";
            this.textHrader = 'เลือกรายการที่ต้องการจัดสรร';

        } else if (event.type === "MANUALGENERAL") {

        }

    }

    public back() {

        this.listBoxDisplay = "block";
        this.listItemBoxDisplay = "none";
        this.textHrader = 'จัดการรายการเติมเต็ม';

    }

    public next() {

        this.listBoxDisplay = "none";
        this.listItemBoxDisplay = "none";
        this.textHrader = 'เลือกรายการที่ต้องการจัดสรร';

    }

    public selectItem(index) {

        this.selectNeedItem = []
        this.listItemNeed[index].isSelect = !this.listItemNeed[index].isSelect;

        for (let arr of this.listItemNeed) {

            if (arr.isSelect) {
                this.selectNeedItem.push(arr)
            }

        }

    }


}
