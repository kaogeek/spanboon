/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetFacade, AuthenManager, AllocateFacade } from '../../../services/services';
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
    private allocateFacade: AllocateFacade;

    public listItem: any;
    public listItemNeed: any;
    public wizardConfig: any;
    public originalPost: any;
    public groupsArr: any;
    public selectNeedItem: any[] = [];
    public postFulfillAllocate: any[] = [];

    public indexWizardPage: number = 0;
    public indexItem: number = 0;

    public typePage: string;

    constructor(authenManager: AuthenManager, allocateFacade: AllocateFacade, router: Router,
        dialog: MatDialog, activatedRoute: ActivatedRoute,) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.router = router;
        this.dialog = dialog;
        this.activatedRoute = activatedRoute;
        this.allocateFacade = allocateFacade;

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
                "standardItemId": "5f4349d1669c480f8bb67f20",
                "fulfillQuantity": 10,
                "id": "ข้าวสาร",
                "name": "ข้าวสาร",
                "pageId": "5f8e6b11a554f760422bc347",
                "pendingQuantity": 0,
                "post": "5f91084ca23f15136bd5634c",
                "quantity": 10,
                "amount": 10,
                "unit": "กิโล",
            },
            {
                "active": true,
                "createdDate": "2020-10-22T04:19:24.469Z",
                "standardItemId": "5f4349e8669c480f8bb67f23",
                "fulfillQuantity": 10,
                "id": "ปลากระป๋อง",
                "name": "ปลากระป๋อง",
                "pageId": "5f8e6b11a554f760422bc347",
                "pendingQuantity": 0,
                "post": "5f91084ca23f15136bd5634c",
                "quantity": 10,
                "amount": 10,
                "unit": "กิโล",
            }
        ]

        this.wizardConfig = {
            "quantity": 4
        }

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
            this.selectNeedItem = this.listItemNeed
            this.groupPostByItem(this.selectNeedItem);
            this.indexWizardPage = 2

        } else if (event.type === "MANUAL") {

            this.indexWizardPage++

        } else if (event.type === "MANUALGENERAL") {
            
            this.showAlertDevelopDialog();

        }

        this.typePage = event.type

    }

    public back(isAllocate?) {

        if (isAllocate) {

            if (this.indexItem === 0) {

                this.indexWizardPage--

            } else {

                this.indexItem--

            }

        } else {

            if (this.indexWizardPage > 0) {
                this.indexWizardPage--
            }

        }

    }

    public next(isAllocate?) {

        if (isAllocate) {

            if (this.indexItem === (this.selectNeedItem.length - 1)) {

                this.indexWizardPage++

            } else {

                this.indexItem++

            }

        } else {

            if (this.indexWizardPage < 5) {
                this.indexWizardPage++
                if (this.indexWizardPage === 2) {
                    this.groupPostByItem(this.selectNeedItem);
                }
            }
        }

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

    public indexItemName(): string {
        return this.selectNeedItem[this.indexItem].name
    }

    public indexItemQuantity(): string {
        return this.selectNeedItem[this.indexItem].quantity
    }

    public indexItemAllocateQuantity(): string {
        return this.selectNeedItem[this.indexItem].fulfillQuantity
    }

    public indexItemUnit(): string {
        return this.selectNeedItem[this.indexItem].unit
    }

    public getTypePost(type): string {
        if (type === "NEEDS") {
            return "มองหา"
        } else if (type === "GENERAL") {
            return "ทั่วไป"
        } else {
            return "ไม่ระบุประเภท"
        }
    }

    private resetDataPage() {
        console.log('resetDataPage')
        this.selectNeedItem = []
        this.typePage = ''
    }

    private groupPostByItem(item?) {

        let data: any = [{ pageId: item[0].pageId, items: item }]
        var groups: any[] = []

        for (let item of this.selectNeedItem) {

            groups.push({ groupName: item.name, posts: [] })

        }

        this.allocateFacade.calculateAllocate(data).then((res: any) => {

            this.originalPost = res
            for (let post of this.originalPost) {

                for (let group of post.items) {
                    for (let g of groups) {
                        if (g.groupName === group.itemName) {
                            g.posts.push(group)
                        }
                    }
                }

            }

        }).catch((err: any) => {
            console.log('err', err)
        })

        this.groupsArr = groups;

    }

}
