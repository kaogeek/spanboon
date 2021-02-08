/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, Inject, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatPaginator, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { PageFacade, AuthenManager, AllocateFacade, NeedsFacade, EmergencyEventFacade, ObjectiveFacade } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { environment } from '../../../../environments/environment';
import * as $ from 'jquery';
import { count } from 'rxjs/operators';
import { L } from '@angular/cdk/keycodes';

const PAGE_NAME: string = 'fulfillallocate';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'dialog-fulfill-allocate',
    templateUrl: './DialogFulfillAllocate.component.html',
})


export class DialogFulfillAllocate extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    private activatedRoute: ActivatedRoute;
    private allocateFacade: AllocateFacade;
    private pageFacade: PageFacade;
    private needsFacade: NeedsFacade;
    private emergencyEventFacade: EmergencyEventFacade;
    private objectiveFacade: ObjectiveFacade;

    public mainPostLink: string = window.location.origin + '/post/'

    public apiBaseURL = environment.apiBaseURL;

    public redirection: string;
    public typePage: string;

    public pageId: string;
    public caseId: string;

    public linkPost: any
    public listItem: any;
    public wizardConfig: any;
    public originalPost: any;
    public groupsArr: any;
    public originalGroupsArr: any;

    public sortingByDateArr: any;
    public sortingByEmgArr: any = [];
    public sortingByObjArr: any = [];


    public sortingByDate: any;
    public sortingByEmg: any;
    public sortingByObj: any;

    public autoPosts: any[] = [];
    public mnPosts: any[] = [];
    public allocateItemtoPost: any[] = [];
    public selectNeedItem: any[] = [];
    public postFulfillAllocate: any[] = [];
    public confirmArrData: any[] = [];
    public listItemNeed: any[] = [];

    public indexWizardPage: number = 0;
    public indexItem: number = 0;
    public fulfillQuantityItem: number = 0;


    public isAuto: boolean = false;

    constructor(public dialogRef: MatDialogRef<DialogFulfillAllocate>, @Inject(MAT_DIALOG_DATA) public data: any, authenManager: AuthenManager, objectiveFacade: ObjectiveFacade, emergencyEventFacade: EmergencyEventFacade, needsFacade: NeedsFacade, pageFacade: PageFacade, allocateFacade: AllocateFacade, router: Router,
        dialog: MatDialog, activatedRoute: ActivatedRoute,) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.router = router;
        this.dialog = dialog;
        this.activatedRoute = activatedRoute;
        this.allocateFacade = allocateFacade;
        this.emergencyEventFacade = emergencyEventFacade;
        this.objectiveFacade = objectiveFacade;
        this.pageFacade = pageFacade;
        this.needsFacade = needsFacade;

        this.listItem = [
            {
                "label": "จัดสรรให้อัตโนมัติ",
                "detail": "จัดสรรเข้าโพสต์ให้อัตโนมัติ เรียงจากเก่าไปใหม่",
                "type": "AUTO"
            },
            {
                "label": "จัดสรรด้วยตัวคุณเอง",
                "detail": "จัดสรรเข้าเหตุการณ์ด่วนหรือสิ่งที่กำลังทำ ด้วยตัวคุณเอง",
                "type": "MANUAL"
            },
            // {
            //     "label": "เข้าโพสต์มองหาทั่วไป",
            //     "detail": "จัดสรรเข้าโพสต์ที่ไม่ระบุเหตุการณ์ด่วนหรือสิ่งที่กำลังทำ",
            //     "type": "MANUALGENERAL"
            // }
        ]

        this.sortingByDateArr = [
            {
                "name": "โพสต์เก่าไปใหม่",
                "detail": "OLD"
            },
            {
                "name": "โพสต์ใหม่ไปเก่า",
                "detail": "NEW"
            }
        ]


        this.getEmergencyEvent();
        this.getObjective();

        this.sortingByDate = this.sortingByDateArr[0];

        this.wizardConfig = {
            "quantity": 5
        }

        for (let arr of this.listItemNeed) {
            arr.isSelect = false
        }

        this.pageId = this.data.pogeId;
        this.caseId = this.data.fulfillCaseId;

    }

    ngOnInit(): void {
        this.getNeedsPage();
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

    public linkPosts(data) {

        console.log('data', data)

        // if (page.data.uniqueId !== undefined && page.data.uniqueId !== null) {
        //     this.linkPage = (this.mainPageLink + page.data.uniqueId)
        // } else if (page.data.id !== undefined && page.data.id !== null) {
        //     this.linkPage = (this.mainPageLink + page.data.id)
        // }

    }

    public getEmergencyEvent() {

        const keywordFilter: any = {
            filter: {
                limit: SEARCH_LIMIT,
                offset: SEARCH_OFFSET,
                relation: [],
                whereConditions: {},
                count: false,
                orderBy: {}
            },
        };

        this.emergencyEventFacade.searchEmergency(keywordFilter).then((emg: any) => {
            this.sortingByEmgArr.push({ hashTag: "ไม่มี", title: "NONE" })
            for (let i of emg) {
                this.sortingByEmgArr.push(i)
            }
            this.sortingByEmg = this.sortingByEmgArr[0];
        }).catch((err: any) => {
            console.log(err)
        });
    }

    public getObjective() {

        const keywordFilter: any = {
            filter: {
                limit: SEARCH_LIMIT,
                offset: SEARCH_OFFSET,
                relation: [],
                whereConditions: {},
                count: false,
                orderBy: {}
            },
        };

        this.objectiveFacade.searchObjective(keywordFilter).then((obj: any) => {
            this.sortingByObjArr.push({ hashTag: "ไม่มี", title: "NONE" })
            for (let i of obj.data) {
                this.sortingByObjArr.push(i)
            }
            this.sortingByObj = this.sortingByObjArr[0];
        }).catch((err: any) => {
            console.log(err)
        });
    }

    public getNeedsPage() {

        this.pageFacade.getProfilePage(this.pageId).then((res: any) => {
            let items: any = res;

            for (let item of items.data.needs) {

                if (item.standardItemId !== null && item.standardItemId !== undefined && item.standardItemId !== '') {
                    this.needsFacade.getNeeds(item.standardItemId).then((res: any) => {

                        item.imageURL = res.imageURL

                    }).catch((err: any) => {
                    })
                }

            }

            setTimeout(() => {

                for (let n of items.data.needs) {

                    var index = this.data.item.map(function (e) { return e.name; }).indexOf(n.name)

                    if (index > -1) {

                        this.listItemNeed.push({ createdDate: n.createdDate, imageURL: n.imageURL, fulfillQuantity: this.data.item[index].quantity, requestId: this.data.item[index].requestId, customItemId: n.customItemId, name: n.name, quantity: this.data.item[index].quantity, unit: n.unit, standardItemId: n.standardItemId, amount: this.data.item[index].quantity, })

                    }
                }

            }, 500);

        }).catch((err: any) => {
            console.log('err', err)
        })



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
            this.indexWizardPage = 3;
            this.selectNeedItem = this.listItemNeed;
            let data: any = [{ pageId: this.pageId, items: this.selectNeedItem }]
            this.groupPostByItem(data);
            this.autoAllocate(false);
            this.isAuto = true

        } else if (event.type === "MANUAL") {

            this.indexWizardPage++

        } else if (event.type === "MANUALGENERAL") {

            this.showAlertDevelopDialog();

        }

        this.typePage = event.type

    }

    public autoAllocate(isItme?) {
        let data: any
        let postsList: any[] = []
        // {standardItemId: string, amount: number} or {customItemId: string, amount: number}
        if (isItme) {

            if (this.selectNeedItem[this.indexItem].fulfillQuantity !== this.selectNeedItem[this.indexItem].quantity) {

                for (let post of this.allocateItemtoPost) {
                    var itemArr: any[] = []

                    for (let item of post.item) {
                        if (this.selectNeedItem[this.indexItem].name === item.itemName) {

                            if (item.amount !== 0) {

                                itemArr.push({ standardItemId: item.standardItemId, customItemId: item.customItemId, amount: item.amount })

                            }

                        }

                    }
                    if (itemArr.length !== 0) {

                        postsList.push({ postId: post.postsId, items: itemArr });

                    }
                }

            }

            if (this.selectNeedItem[this.indexItem].fulfillQuantity !== 0) {

                postsList.push({ pageId: this.pageId, items: [{ standardItemId: this.selectNeedItem[this.indexItem].standardItemId, customItemId: this.selectNeedItem[this.indexItem].customItemId, amount: this.selectNeedItem[this.indexItem].fulfillQuantity }] });

            }

            this.calculateAllocatePostByItem(postsList);

            this.selectNeedItem[this.indexItem].fulfillQuantity = 0;

        } else {
            const itemNeeds: any[] = [];
            const allocateItems: any[] = [];
            const postsList: any[] = []

            for (let item of this.selectNeedItem) {

                if (item.fulfillQuantity !== 0) {

                    itemNeeds.push(item);

                }
            }

            for (let item of this.allocateItemtoPost) {

                for (let i of item.item) {

                    for (let n of itemNeeds) {

                        if (n.name === i.itemName && i.amount !== 0) {
                            allocateItems.push({ postId: item.postsId, itemName: i.itemName, standardItemId: i.standardItemId, customItemId: i.customItemId, amount: i.amount })

                        }

                    }

                }

            }

            for (let item of itemNeeds) {

                postsList.push([{ pageId: this.pageId, itemName: item.name, items: [{ standardItemId: item.standardItemId, customItemId: item.customItemId, amount: item.fulfillQuantity }] }]);

            }

            for (let item of allocateItems) {

                for (let post of postsList) {

                    if (post[0].itemName === item.itemName) {

                        post.push({ postId: item.postId, items: [item] })

                    }

                }

            }

            for (let post of postsList) {

                this.calculateAllocatePostByItem(post, true);

            }


            for (let item of this.selectNeedItem) {

                item.fulfillQuantity = 0;

            }

            this.next();

        }
    }

    public back(isAllocate?) {

        if (this.isAuto) {
            this.resetDataPage();
            this.indexWizardPage = 0
            return
        }
        if (isAllocate) {

            if (this.indexItem === 0) {

                this.indexWizardPage--
                if (this.indexWizardPage === 1) {

                    this.allocateItemtoPost = []
                }

            } else {

                this.indexItem--

            }

        } else {

            if (this.indexWizardPage > 0) {
                this.indexWizardPage--
                if (this.indexWizardPage === 0) {
                    this.resetDataPage();
                }
            }

        }

    }

    public next(isAllocate?) {
        let data: any = [{ pageId: this.pageId, items: this.selectNeedItem }]

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
                    for (let d of data[0].items) {
                        d.amount = 999999;
                    }
                    this.groupPostByItem(data);
                }
                if (this.indexWizardPage === 3) {

                }
                if (this.indexWizardPage === 4) {
                    this.checkAuto();
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

    public indexItemAllocateQuantity(): number {
        return this.selectNeedItem[this.indexItem].fulfillQuantity
    }

    public indexItemUnit(): string {
        return this.selectNeedItem[this.indexItem].unit
    }

    public indexItemImage(): string {
        return this.selectNeedItem[this.indexItem].imageURL
    }

    public checkAuto() {

        const Posts: any[] = this.allocateItemtoPost;
        const autoPosts: any[] = [];
        const mnPosts: any[] = [];
        var index: number = 0;

        setTimeout(() => {

            for (let i of Posts) {

                if (i.item.length > 0) {

                    for (let item of i.item) {

                        if (item.isAuto && item.amount > 0) {

                            var indexPost = autoPosts.map(function (e) { return e.postsId; }).indexOf(i.postsId);

                            if (indexPost < 0) {

                                autoPosts.push({ post: i.post, item: [], postsId: i.postsId });

                            }

                        } else if (!item.isAuto && item.amount > 0) {

                            var indexPost = mnPosts.map(function (e) { return e.postsId; }).indexOf(i.postsId);

                            if (indexPost < 0) {

                                mnPosts.push({ post: i.post, item: [], postsId: i.postsId });

                            }

                        }


                    }

                }

                index++
            }

            this.autoPosts = autoPosts
            this.mnPosts = mnPosts

        }, 500);;

    }

    public checkFulfillQuantity(data?): boolean {
        if (data) {

            if (data.fulfillQuantity !== 0) {
                return false

            } else {

                return true

            }

        } else {

            for (let item of this.listItemNeed) {

                if (item.fulfillQuantity !== 0) {

                    return false

                } else {

                    return true

                }
            }
        }
    }

    public checkFulfillQuantitys(data?): boolean {

        if (data) {

            if (data.fulfillQuantity === 0) {

                return false

            } else {

                return true

            }

        } else {

            for (let item of this.listItemNeed) {

                if (item.fulfillQuantity === 0) {

                    return false

                } else {

                    return true

                }
            }

        }
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

    public allocate(post?, isAdd?, index?) {

        var indexPost = this.allocateItemtoPost.map(function (e) { return e.postsId; }).indexOf(post.post);
        var indexItem = this.allocateItemtoPost[indexPost].item.map(function (e) { return e.itemName; }).indexOf(this.selectNeedItem[this.indexItem].name);


        if (isAdd) {

            if (this.selectNeedItem[this.indexItem].fulfillQuantity > 0) {

                this.allocateItemtoPost[indexPost].item[indexItem].amount++;
                this.allocateItemtoPost[indexPost].item[indexItem].isMn = true;
                this.selectNeedItem[this.indexItem].fulfillQuantity--

                this.groupsArr[this.indexItem].posts[index].section = true;

            }

        } else {

            if (this.selectNeedItem[this.indexItem].fulfillQuantity !== this.selectNeedItem[this.indexItem].quantity) {

                this.allocateItemtoPost[indexPost].item[indexItem].amount--

                if (this.allocateItemtoPost[indexPost].item[indexItem].amount === 0) {

                    delete this.allocateItemtoPost[indexPost].item[indexItem].isMn;
                    this.groupsArr[this.indexItem].posts[index].section = false;

                }

                this.selectNeedItem[this.indexItem].fulfillQuantity++

            }

        }

    }

    public sectionMaxItem(item, index) {

        var indexPost = this.allocateItemtoPost.map(function (e) { return e.postsId; }).indexOf(item.post);
        var indexItem = this.allocateItemtoPost[indexPost].item.map(function (e) { return e.itemName; }).indexOf(this.selectNeedItem[this.indexItem].name);

        if (this.groupsArr[this.indexItem].posts[index].section) {

            this.selectNeedItem[this.indexItem].fulfillQuantity = this.allocateItemtoPost[indexPost].item[indexItem].amount;
            this.allocateItemtoPost[indexPost].item[indexItem].amount = 0;
            delete this.allocateItemtoPost[indexPost].item[indexItem].isMn;

        } else {

            if (this.selectNeedItem[this.indexItem].fulfillQuantity !== 0) {

                this.allocateItemtoPost[indexPost].item[indexItem].amount = this.selectNeedItem[this.indexItem].fulfillQuantity;
                this.allocateItemtoPost[indexPost].item[indexItem].isMn = true;
                this.selectNeedItem[this.indexItem].fulfillQuantity = 0;

            }

        }

    }

    public getItemByPost(data): any {

        if (typeof data.post !== 'object' && data.post !== undefined) {
            var index = this.allocateItemtoPost.map(function (e) { return e.postsId; }).indexOf(data.post)
        } else {
            var index = this.allocateItemtoPost.map(function (e) { return e.postsId; }).indexOf(data.postsId)
        }

        if (index > -1) {
            let item: any = this.allocateItemtoPost[index].item
            return item
        } else {
            return []
        }

    }

    public activeAdditemNext(): boolean {

        return this.selectNeedItem[this.indexItem].fulfillQuantity !== this.selectNeedItem[this.indexItem].quantity;

    }

    public clearItem() {

        for (let a of this.allocateItemtoPost) {
            for (let item of a.item) {
                if (item.itemName === this.selectNeedItem[this.indexItem].name) {
                    item.amount = 0;
                    delete item.isMn;
                    delete item.isAuto;
                }
            }
        }

        for (let post of this.groupsArr[this.indexItem].posts) {

            post.section = false;

        }

        this.selectNeedItem[this.indexItem].fulfillQuantity = this.selectNeedItem[this.indexItem].quantity

    }

    public resetDataPage() {
        this.selectNeedItem = [];
        this.allocateItemtoPost = []
        this.indexItem = 0
        this.indexWizardPage = 0;
        this.isAuto = false
        this.confirmArrData = [];
        this.autoPosts = [];
        this.originalPost = [];
        this.mnPosts = [];
        this.mnPosts = [];
        this.postFulfillAllocate = [];
        for (let arr of this.listItemNeed) {
            arr.isSelect = false;
            arr.fulfillQuantity = arr.quantity;
        }

    }

    private async groupPostByItem(data?) {
        const keywordFilter: any = {
            filter: {
                limit: SEARCH_LIMIT,
                offset: SEARCH_OFFSET,
                relation: [],
                whereConditions: {},
                count: false,
                orderBy: {}
            },
        };

        var groups: any[] = []

        for (let item of this.selectNeedItem) {

            groups.push({ groupName: item.name, posts: [] })

        }

        await this.allocateFacade.searchAllocate(data[0]).then((post: any) => {

            this.originalPost = post
            for (let group of post.items) {
                group.amount = 0;
                group.section = false;
                var index = this.allocateItemtoPost.map(function (e) { return e.postsId; }).indexOf(group.postsId)
                if (index < 0) {
                    this.allocateItemtoPost.push({ post: group.posts, postsId: group.post, item: [] })
                }
                for (let g of groups) {
                    if (g.groupName === group.name) {
                        g.posts.push(group)
                    }
                }
            }


        }).catch((err: any) => {
            console.log('err', err)
        })

        this.groupsArr = groups;
        this.originalGroupsArr = groups;

        this.setAllocatetoPost();

    }

    public confirmAllocate() {

        const data: any[] = []

        for (let item of this.allocateItemtoPost) {

            for (let i of item.item) {

                for (let n of this.listItemNeed) {

                    if (n.name === i.itemName) {

                        i.requestId = n.requestId

                    }

                }


            }

        }

        for (let item of this.allocateItemtoPost) {

            for (let i of item.item) {

                if (i.needsId !== undefined && i.needsId !== null) {
                    data.push({ needsId: i.needsId, amount: i.amount, fulfillmentReqId: i.requestId })

                }


            }

        }

        this.allocateFacade.confirmAllocateFulfillmentCase(this.caseId, this.pageId, data).then((res: any) => {

            this.dialogRef.close(res);

        }).catch((err: any) => {

            this.dialogRef.close(err);
            console.log('err', err)

        })

    }

    public onClose() {
        this.dialogRef.close(false);
    }

    private async calculateAllocatePostByItem(data?, auto?) {

        await this.allocateFacade.calculateAllocate(data).then((res: any) => {

            let itemNeeds: any[] = []
            let dataItem: any = data

            for (let r of res) {

                for (let item of r.items) {

                    var index = itemNeeds.map(function (e) { return e.postsId; }).indexOf(item.postsId)

                    if (index > -1) {

                        itemNeeds[index].amount = (itemNeeds[index].amount + item.amount);

                    } else {

                        itemNeeds.push(item)

                    }

                }

            }

            for (let a of this.allocateItemtoPost) {

                for (let i of itemNeeds) {

                    if (a.postsId === i.postsId) {
                        for (let item of a.item) {

                            if (item.itemName === i.itemName) {

                                for (let p of this.groupsArr[this.indexItem].posts) {

                                    if (p.posts._id === a.postsId) {

                                        p.section = true;

                                    }


                                }

                                if (auto) {

                                    if (!item.isMn) {

                                        item.isAuto = true;

                                    }


                                } else {

                                    item.isMn = true;

                                }

                                if (item.amount !== 0) {

                                    item.amount = i.amount;

                                } else {

                                    item.amount = i.amount;

                                }

                                item.needsId = i.needsId;
                            }

                        }
                    }

                }

            }

        }).catch((err: any) => {
            console.log('err', err)
        })

    }

    private setAllocatetoPost() {

        for (let post of this.originalPost.items) {


            var index = this.allocateItemtoPost.map(function (e) { return e.postsId; }).indexOf(post.post);


            if (index > -1) {

                if (post.standardItemId !== null && post.standardItemId !== undefined) {
                    const itemData: any = {
                        amount: post.amount,
                        itemName: post.name,
                        itemUnit: post.unit,
                        quantity: post.quantity,
                        customItemId: null,
                        imageURL: post.standardItem.imageURL,
                        standardItemId: post.standardItemId
                    };

                    this.allocateItemtoPost[index].item.push(itemData)

                } else if (post.customItemId !== null && post.customItemId !== undefined) {
                    const itemData: any = {
                        amount: post.amount,
                        itemName: post.name,
                        itemUnit: post.unit,
                        quantity: post.quantity,
                        customItemId: post.customItemId,
                        imageURL: post.customItem.imageURL,
                        standardItemId: null
                    };

                    this.allocateItemtoPost[index].item.push(itemData)

                }

            }

        }
    }

    public sortingDate() {

        this.groupsArr[this.indexItem].posts.reverse();

    }

    public sortingObj() {

        if (this.sortingByObj.title === "NONE") {

        } else {

        }

    }

    private isCheckUndefined(value): boolean {

        return (value !== null && value !== undefined && value !== '')

    }

}
