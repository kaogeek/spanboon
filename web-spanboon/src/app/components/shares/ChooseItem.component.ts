/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, ViewChild, ElementRef, Inject, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { PageCategoryFacade, PageFacade, AssetFacade, ObservableManager, AuthenManager, NeedsFacade } from 'src/app/services/services';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { SearchFilter } from '../../../app/models/models';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AbstractPage } from '../pages/AbstractPage';
import { environment } from '../../../environments/environment';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { map, distinctUntilChanged } from 'rxjs/operators';

declare var $: any;
const PAGE_NAME: string = 'dialog-doing';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'choose-item',
    templateUrl: './ChooseItem.component.html'
})
export class ChooseItem extends AbstractPage implements OnInit {

    @ViewChild('pageName', { static: false }) pageName: ElementRef;
    @ViewChild('itemName', { static: false }) itemNameCustomize: ElementRef;
    // @ViewChild('itemName ', { static: false }) itemName : ElementRef;
    @ViewChild('itemQuantity', { static: false }) itemQty: ElementRef;
    @ViewChild('itemUnit', { static: false }) itemUnit: ElementRef;
    @ViewChild('searchAll', { static: false }) search: ElementRef;

    @ViewChild('choose', { static: false }) choose: ElementRef;
    @ViewChild('top', { static: false }) top: ElementRef;
    @ViewChild('tab', { static: false }) tabSelect: ElementRef;
    @ViewChild('bottomConfirm', { static: false }) bottomConfirm: ElementRef;
    @ViewChild('bodyList', { static: false }) bodyList: ElementRef;

    @Input()
    public data: any;
    @Input()
    public statusLabel: string;
    @Output()
    public onSubmit: EventEmitter<any> = new EventEmitter();
    @Output()
    public onClosed: EventEmitter<any> = new EventEmitter();
    @Output()
    public submitDialog: EventEmitter<any> = new EventEmitter();
    @Output()
    public submitCanCelDialog: EventEmitter<any> = new EventEmitter();


    public pageCategoryFacade: PageCategoryFacade;
    private pageFacade: PageFacade;
    private assetFacade: AssetFacade;
    private needsFacade: NeedsFacade;
    public dialog: MatDialog;
    private observManager: ObservableManager;

    public apiBaseURL = environment.apiBaseURL;

    public title: string;
    public content: string;
    public folderId: string;
    public itemId: any;
    public msgError: boolean;
    public isUnit: boolean;
    public isUnitSelect: boolean;
    public isName: boolean;
    public resStandardItem: any;
    public resItemCategory: any;
    public labelHeader: any;
    public itemCategoryCounter: any[] = [];
    public resProfilePage: any;
    public arrListItem: any[] = [];
    public pathFolder: any[] = [];
    public isLoading: boolean;
    public isOpenFolder: boolean;
    public isIndexFolder: number;
    public isAddItem: boolean;
    public isListItem: boolean;
    public isOpen: boolean;
    public isDisable: boolean;
    public isSearchAll: boolean;
    public isActiveCss: boolean;
    public itemAmount: number;
    public userPage: any;
    public itemOriginal: any;
    public itemCategoryCounterOriginal: any;
    public resNeedsOriginal: any;
    public resStandardItemOriginal: any;
    public parrentCategoryMapSelect = {};
    public parrentCategoryMap = {}; // key parrentCat, value= array child category 
    public resultDialog: any;
    public setTimeSearch: any;
    public resNeeds: any;
    public query_conversation: any;
    public isTabClick: string;
    public fontSize: any;
    public heightBtn: any;
    public widthBtn: any;
    public isFirst: any;

    public dataList: any = [{ name: 'มองหา', id: 'defaultOpen1' }, { name: 'รายการ', id: 'defaultOpen2' }];

    constructor(pageCategoryFacade: PageCategoryFacade, pageFacade: PageFacade,
        dialog: MatDialog, authenManager: AuthenManager, router: Router, assetFacade: AssetFacade, observManager: ObservableManager, needsFacade: NeedsFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog;
        this.pageCategoryFacade = pageCategoryFacade;
        this.pageFacade = pageFacade;
        this.assetFacade = assetFacade;
        this.needsFacade = needsFacade;
        this.observManager = observManager;
        this.isOpenFolder = true;
        this.isListItem = false;
        this.isDisable = true;
        this.isSearchAll = false;
        this.isUnit = false;
        this.isUnitSelect = false;
        this.isName = false;
        this.msgError = false;
        this.isActiveCss = false;
        this.resultDialog = {};
        this.resItemCategory = [];
        this.resStandardItem = [];
        this.parrentCategoryMap = {};
        this.parrentCategoryMapSelect = {};

        this.labelHeader = 'รายการมองหาทั้งหมด';
        this.isTabClick = this.dataList[0].id;
    }

    public ngOnInit(): void {

        if (this.data && this.data.arrListItem !== undefined && this.data.arrListItem.length > 0) {
            this.arrListItem = this.data.arrListItem;
            this.readdChildSelectMap();
        }
        this.searchPageCategory();

        if (this.data && this.data.resNeeds !== undefined && this.data.resNeeds.length > 0) {
            this.resNeeds = this.data.resNeeds
            this.resNeedsOriginal = JSON.parse(JSON.stringify(this.resNeeds));
        }
        this.getNeedsLastest();
        this.itemOriginal = JSON.parse(JSON.stringify(this.arrListItem));
        console.log('window.outerHeight >> ', window.outerHeight)

    }

    ngAfterViewInit(): void {

        fromEvent(this.search.nativeElement, 'keyup').pipe(
            // get value
            map((event: any) => {
                return event.target.value.trim();
            })
            // if character length greater then 2
            // , filter(res => res.length > 2)
            // Time in milliseconds between key events
            // , debounceTime(1000)
            // If previous query is diffent from current
            , distinctUntilChanged()
            // subscription for response
        ).subscribe((text: string) => {
            this.isLoading = true;
            this.keyUpSearchAll(text);
        });


        // setTimeout(() => {
        //     document.getElementById("defaultOpen1").click();
        // }, 0); 
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

    public getUser() {
        return this.data.name
    }

    public getDateTime() {
        return moment().locale("th").format('LLLL');
    }

    private isEmptyString(value: string): boolean {
        if (value === undefined || value === '') {
            return true;
        }

        const regEx = /^\s+$/;
        if (value.match(regEx)) {
            return true;
        }

        return false;
    }

    public getNeedsLastest() {
        let pageId = this.data && this.data.pageId;
        this.needsFacade.getNeedsLastest(pageId).then((res: any) => {
            this.resNeeds = res;
            if (this.arrListItem.length > 0 || this.resNeeds.length > 0) {
                for (let item of this.arrListItem) {
                    if (item && item.isAddItem === undefined) {
                        const isNeed = this.resNeeds.findIndex(needs => {
                            return needs.value.id === item.standardItemId
                        });
                        if (isNeed !== -1) {
                            this.resNeeds[isNeed].checked = true;
                        }
                    }

                }
            }
        }).catch((err) => {
            console.log(err)
        });
    }

    public searchPageCategory() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [];
        filter.whereConditions = {};
        filter.count = false;
        filter.orderBy = {
            createdDate: "DESC",
        }
        this.pageCategoryFacade.searchItemCategory(filter, null, null).then((res: any) => {
            this.resStandardItem = [];
            if (res) {
                this.resStandardItem = res;
                this.isLoading = true;
                this.readdParrentMap();

                setTimeout(() => {
                    this.isLoading = false;
                }, 1000);
                // if (window.innerWidth <= 1024) {
                //     var i, tabcontent, tablinks;
                //     tabcontent = document.getElementsByClassName("mongha");
                //     tabcontent[0].style.display = "flex";
                //     tabcontent[1].style.display = "none";
                // }
                this.onResize();
            }
        }).catch((err: any) => {
            console.log(err)
        });
    }

    private readdParrentMap(): void {
        if (this.resStandardItem.length > 0) {
            for (let pItem of this.resStandardItem) {
                this.addParrentCategoryMap(pItem);
            }
        }
    }

    private addParrentCategoryMap(resStandardItem: any): void {
        if (resStandardItem === undefined) {
            return;
        }

        if (this.parrentCategoryMap === undefined) {
            this.parrentCategoryMap = {};
        }

        if (resStandardItem.type === 'STANDARDITEM_CATEGORY' || resStandardItem.parent !== '') {
            if (this.parrentCategoryMap[resStandardItem.parent]) {
                let isContainInArray = this.parrentCategoryMap[resStandardItem.parent].map(function (x) { return x.id; }).indexOf(resStandardItem.id);
                if (isContainInArray <= -1) {
                    this.parrentCategoryMap[resStandardItem.parent].push(resStandardItem);
                }

            } else {
                this.parrentCategoryMap[resStandardItem.parent] = [];
                this.parrentCategoryMap[resStandardItem.parent].push(resStandardItem);
            }
        }
    }

    private readdChildSelectMap(): void {
        if (this.arrListItem.length > 0) {
            for (let item of this.arrListItem) {
                this.addCategorySelect(item);
            }
        }
    }

    private addCategorySelect(item: any): void {
        if (item === undefined) {
            return;
        }

        if (this.parrentCategoryMapSelect === undefined) {
            this.parrentCategoryMapSelect = {};
        }

        if (item.category || (item.category && item.category.id)) {
            let id = item.category.id || item.category;
            if (this.parrentCategoryMapSelect[id]) {
                if (this.parrentCategoryMapSelect[id].indexOf(item) <= -1) {
                    this.parrentCategoryMapSelect[id].push(item);
                }
            } else {
                this.parrentCategoryMapSelect[id] = [];
                this.parrentCategoryMapSelect[id].push(item);
            }
        }
    }

    private removeChildSelectMap(): void {
        if (this.arrListItem.length > 0) {
            for (let item of this.arrListItem) {
                this.removeCategorySelect(item);
            }
        }
    }

    private removeCategorySelect(item: any): void {
        if (item === undefined) {
            return;
        }

        if (this.parrentCategoryMapSelect === undefined) {
            this.parrentCategoryMapSelect = {};
        }
        if (item.category || (item.category && item.category.id)) {
            let id = item.category.id || item.category;
            if (this.parrentCategoryMapSelect[id]) {
                let isContainInArray = this.parrentCategoryMapSelect[id].map(function (x) { return x.standardItemId; }).indexOf(item.standardItemId);
                if (isContainInArray !== -1) {
                    this.parrentCategoryMapSelect[id].splice(isContainInArray, 1)
                }
            } else {
                this.parrentCategoryMapSelect[id] = [];
                this.parrentCategoryMapSelect[id].push(item);
            }

        }

    }

    public countItem(resStandardItem: any) {
        // check item or category
        // if item return undefine
        // if category  
        if (this.arrListItem.length > 0) {

            let selfCount;
            if (this.parrentCategoryMapSelect[resStandardItem.id]) {
                selfCount = this.parrentCategoryMapSelect[resStandardItem.id].length;
            }

            let childCategoryArray = this.parrentCategoryMap[resStandardItem.id];
            if (childCategoryArray !== undefined) {
                for (let cid of childCategoryArray) {
                    if (this.isEmptyObject(this.parrentCategoryMapSelect)) {
                        if (this.parrentCategoryMapSelect[cid.id]) {
                            selfCount += this.parrentCategoryMapSelect[cid.id].length;
                        }
                    }
                }
            }
            return selfCount;
        }
    }

    public selectFolderData(data: any, isBack: boolean, index?: number) {
        this.folderId = data.id;
        if (!isBack) {
            this.isIndexFolder = index;
            this.pathFolder.push(data);
        } else {
            this.isIndexFolder = index;
        }

        this.pageCategoryFacade.getItemCategory(this.folderId).then((res: any) => {
            this.resItemCategory = [];
            if (res) {
                this.resItemCategory = res.result;
                this.isLoading = true;

                for (const itemSelect of this.arrListItem) {
                    let index = 0;
                    for (const item of this.resItemCategory) {
                        if (itemSelect.standardItemId === item.value.id) {
                            this.resItemCategory[index].checked = true;
                            break;
                        }
                        index++;
                    }
                    if (this.resNeeds.length > 0) {
                        for (let needs of this.resNeeds) {
                            if (needs.checked) {
                                const isIndex = this.resNeeds.findIndex(folder => {
                                    return folder.value.id === needs.value.id
                                });
                                if (isIndex !== -1) {
                                    this.resNeeds[isIndex].checked = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                this.isLoading = false;
                if (!isBack) {
                    if (window.innerWidth <= 1024) {
                        var i, tabcontent, tablinks;
                        tabcontent = document.getElementsByClassName("mongha");
                        tabcontent[0].style.display = "flex";
                        tabcontent[0].style.width = "100%";
                        tabcontent[1].style.display = "none";
                    }
                }
            }

        }).catch((err: any) => {
            console.log(err)
        })
        this.isOpenFolder = false
    }

    public isEmptyObject(obj) {
        return (obj && (Object.keys(obj).length > 0));
    }

    public closeSearch(data) {
        this.search.nativeElement.value = '';
        this.isSearchAll = false;
        this.searchPageCategory();
    }

    public keyUpSearchAll(data) {
        if (!this.isSearchAll) {
            $('.folder').css({
                'padding-top': 'unset'
            });
        }
        if (data === '') {
            this.isSearchAll = false;
            this.searchPageCategory();
            this.labelHeader = 'สิ่งที่มองหาล่าสุด';
            return;
        }

        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [];
        filter.whereConditions = {
            keyword: data
        };
        filter.count = false;
        filter.orderBy = {};
        this.query_conversation = data
        this.isSearchAll = true;
        this.pageCategoryFacade.searchItemCategoryMerge(filter, this.data.id, true).then((res: any) => {
            this.resItemCategory = res;
            if (this.resItemCategory.length === 0) {
                this.labelHeader = 'ไม่พบรายการที่ค้นหา';
            } else {
                this.labelHeader = 'ผลลัพธ์การมองหา';
            }
            for (const itemSelect of this.arrListItem) {
                let index = 0;
                for (const item of this.resItemCategory) {
                    if (itemSelect.standardItemId === item.value.id) {
                        this.resItemCategory[index].checked = true;
                        break;
                    }
                    index++;
                }
            }
            this.stopLoading();

        }).catch((err: any) => {
            console.log('err.error ', err)
            if (err.error.status === 0) {
                if (err.error.message === 'Cannot search StandardItem') {
                    this.resItemCategory = [];
                    this.labelHeader = 'ไม่พบรายการมองหา';
                }
            }
            this.stopLoading();
        });
    }

    public onConfirm(): void {
        if (this.arrListItem.length > 0) {
            let isVaild = false;
            let countDatalength = 0;
            for (let [indexData, data] of this.arrListItem.entries()) {
                if (data.isAddItem) {
                    if (data.itemName === undefined || data.itemName === '' || data.itemName === null) {
                        this.isName = true;
                        document.getElementById('itemNameCustomize' + indexData).style.border = "1px solid red";
                        return document.getElementById('itemNameCustomize' + indexData).focus();

                    } else {
                        this.isName = false;
                        document.getElementById('itemNameCustomize' + indexData).style.border = "unset";
                    }

                    if (data.unit === undefined || data.unit === '' || data.unit === null) {
                        this.isUnit = true;
                        document.getElementById('itemUnit' + indexData).style.border = "1px solid red";
                        return document.getElementById('itemUnit' + indexData).focus();

                    } else {
                        this.isUnit = false;
                        document.getElementById('itemUnit' + indexData).style.border = "unset";
                    }
                } else {
                    if (data.unit === undefined || data.unit === '' || data.unit === null) {
                        this.isUnitSelect = true;
                        document.getElementById('itemUnitPrice' + indexData).style.border = "1px solid red";
                        return document.getElementById('itemUnitPrice' + indexData).focus();
                    } else {
                        this.isUnitSelect = false;
                        document.getElementById('itemUnitPrice' + indexData).style.border = "unset";
                    }
                }
                countDatalength++;

                if (this.arrListItem.length === countDatalength) {
                    isVaild = true;
                }
            }
            if (isVaild) {
                if (this.resNeeds !== undefined) {
                    this.resNeedsOriginal = JSON.parse(JSON.stringify(this.resNeeds));
                }
                this.resultDialog.resNeeds = this.resNeedsOriginal
                this.resultDialog.arrListItem = this.arrListItem;
                this.onSubmit.emit(this.resultDialog);
            }
        } else {
            this.onSubmit.emit(this.resultDialog);
        }
    }

    public selectedDataItem(data: any, index: number, isFirst?: boolean) {
        this.itemId = data.value.id;
        var isSelected = true;
        var indexItem = 0;

        for (const item of this.arrListItem) {
            if (item.standardItemId === data.value.id) {
                isSelected = false;
                break;
            }
            indexItem++;
        }
        if (isSelected) {

            if (this.resNeeds && this.resNeeds.length > 0) {
                const isNeeds = this.resNeeds.findIndex(needs => {
                    return needs.value.id === data.value.id
                });
                if (isNeeds !== -1) {
                    this.resNeeds[isNeeds].checked = true;
                }
            }

            if (this.resItemCategory.length > 0) {
                const isStandard = this.resItemCategory.findIndex(standard => {
                    return standard.value.id === data.value.id
                });
                if (isStandard !== -1) {
                    this.resItemCategory[isStandard].checked = true;
                }

            }

            this.arrListItem.push({
                standardItemId: data.value.id,
                itemName: data.value.name,
                quantity: 1,
                unit: data.value.unit,
                category: data.value.category,
                imageURL: data.value.imageURL || data.imageURL
            });
            this.needsFacade.nextMessage(this.arrListItem);

            this.readdChildSelectMap();

        } else {
            if (this.resNeeds && this.resNeeds.length > 0) {
                const isNeeds = this.resNeeds.findIndex(needs => {
                    return needs.value.id === data.value.id
                });
                if (isNeeds !== -1) {
                    this.resNeeds[isNeeds].checked = false;
                }
            }

            if (this.resItemCategory.length > 0) {
                let i = 0;
                for (let item of this.resItemCategory) {
                    if (item.value.id === data.value.id) {
                        this.resItemCategory[i].checked = false;
                        break
                    }
                    i++;
                }
            }

            this.removeCategorySelect(this.arrListItem[indexItem]);
            this.arrListItem.splice(indexItem, 1);
            if (this.arrListItem.length === 0) {
                this.isListItem = false;
            }

        }
        // if (window.innerWidth <= 1024) {
        //     var i, tabcontent, tablinks;
        //     tabcontent = document.getElementsByClassName("mongha");
        //     tabcontent[0].style.display = "none";
        //     tabcontent[1].style.display = "none";
        //     document.getElementById("defaultOpen2").click();
        // }
    }

    public keyUpText(text: string, index: number, type: string) {
        for (let [i, data] of this.arrListItem.entries()) {
            if (i === index) {
                if (type === 'name') {
                    data.itemName = text;
                } else if (type === 'qty') {
                    data.quantity = Number(text);
                } else if (type === 'unit') {
                    data.unit = text;
                }
            }
        }
    }

    public openListItem() {
        this.isListItem = !this.isListItem;
        // this.isActive = true;
        this.isUnit = false;
        // if (window.innerWidth <= 1024) {
        //     var i, tabcontent, tablinks;
        //     tabcontent = document.getElementsByClassName("mongha");
        //     tabcontent[0].style.display = "none";
        //     tabcontent[1].style.display = "none";
        //     document.getElementById("defaultOpen2").click();
        // }
        this.arrListItem.push({
            isAddItem: true,
            standardItemId: "",
            itemName: "",
            quantity: 1,
            unit: ""
        });
        this.needsFacade.nextMessage(this.arrListItem);
    }

    public deleteItem(listItem, index) {
        if (listItem.standardItemId === '') {
            this.arrListItem.splice(index, 1);
        } else {
            var isSelected = true;
            var indexItem = 0;
            for (const item of this.resItemCategory) {
                if (item.id === listItem.standardItemId) {
                    isSelected = false;
                    break;
                }
                indexItem++;
            }
            if (!isSelected) {
                this.resItemCategory[indexItem].checked = false;
            }

            if (this.resNeeds && this.resNeeds.length > 0) {
                const isNeed = this.resNeeds.findIndex(needs => {
                    return needs.value.id === listItem.standardItemId
                })
                if (isNeed) {
                    this.resNeeds[isNeed].checked = false;
                }
            }
            this.removeCategorySelect(listItem);
            this.arrListItem.splice(index, 1);
            if (this.arrListItem.length === 0) {
                // this.isListItem = false;
                // this.isActive = false;
            }
        }
    }

    public deleteRowItem(index: number) {
        this.arrListItem.splice(index, 1);
        if (this.arrListItem.length === 0) {
            this.isListItem = false;
        }
    }

    public backCard() {
        if (this.pathFolder.length === 1) {
            this.isOpenFolder = true;
            this.pathFolder = [];
            this.isSearchAll = false
            this.searchPageCategory();

        } else {
            this.pathFolder.pop();
            this.selectFolderData(this.pathFolder[this.pathFolder.length - 1], true);
        }
    }

    public folderRoot() {
        this.isOpenFolder = true;
        this.pathFolder = [];
        this.searchPageCategory();
    }

    public folderLink(index) {
        // this.indexFolder = this.pathFolder.length - 1;
        this.pathFolder.splice(index + 1);
        this.selectFolderData(this.pathFolder[this.pathFolder.length - 1], true);
    }

    dropToList(event: CdkDragDrop<number[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
    }

    public onClose(): void {
        let body = {
            data: this.arrListItem,
            isClose: true
        }
        this.onClosed.emit(body);
    }

    private stopLoading(): void {
        setTimeout(() => {
            this.isLoading = false;
        }, 250);
    }

    public getHeigthBody() {
        let tab = this.tabSelect.nativeElement.offsetHeight;
        let top = this.top.nativeElement.offsetHeight;
        let bottom = this.bottomConfirm.nativeElement.offsetHeight;
        let body = this.bodyList.nativeElement.offsetHeight;
        return tab + top + bottom + body;
    }

    public onResize() {
        if (window.innerWidth <= 1024) {
            //centerleft 
            if (this.isTabClick === 'defaultOpen1') {
                $('#defaultOpen1').addClass('active');
            } else {
                // centerright
                this.isActiveCss = false;
                var data = document.getElementById('centerleft');
                data.style.display = 'none';
            }
        } else {
            if (window.innerWidth > 1024) {
                var data = document.getElementById('centerleft');
                data.style.display = 'flex';
                this.isActiveCss = false;
            }
        }
        if (window.innerWidth <= 768) {
            if (this.tabSelect && this.top && this.bottomConfirm) {
                let tab = this.tabSelect.nativeElement.offsetHeight;
                let top = this.top.nativeElement.offsetHeight;
                let bottom = this.bottomConfirm.nativeElement.offsetHeight;
                let body = this.bodyList.nativeElement.offsetHeight;
                let x = top + tab + bottom;
                var chromeH = window.outerHeight - window.innerHeight;
                var isLandscape = window.innerWidth > window.innerHeight, height;
                let land = isLandscape ? 32 : 44;
                if (window.innerHeight <= 1024 && 768 < window.innerHeight) {
                    x = x + chromeH;
                } else {
                    if (window.innerHeight <= 768 && 479 < window.innerHeight) {
                        // x = x + land - chromeH;
                        x = x + chromeH;
                        // console.log('total ', x)
                        // x = x + 70;
                    }
                }
                this.bodyList.nativeElement.style.height = "calc(100vh - " + x + "px)";
            }

        }
    }
    // public onResize() {
    //     if (window.innerWidth <= 1024) {
    //         if (this.isTabClick === 'centerleft') {
    //             document.getElementById("defaultOpen1").click();
    //         } else {
    //             document.getElementById("defaultOpen2").click();
    //         }
    //     } else {

    //     }
    //     if (window.innerWidth <= 768) { 
    //         if (this.tabSelect && this.top && this.bottomConfirm) {
    //             let tab = this.tabSelect.nativeElement.offsetHeight;
    //             let tab1 = this.choose.nativeElement.offsetHeight;
    //             let top = this.top.nativeElement.offsetHeight;
    //             let bottom = this.bottomConfirm.nativeElement.offsetHeight;
    //             let body = this.bodyList.nativeElement.offsetHeight;
    //             let x;
    //             // let x; 
    //             if(window.outerHeight === 1024){
    //                 x = top + tab + bottom;
    //             } else if(window.outerHeight === 798){

    //             }
    //             console.log('document.documentElement.clientHeight ',document.documentElement.clientHeight)
    //             var chromeH = window.outerHeight - window.innerHeight;
    //             console.log('1 ', window.outerHeight) 
    //             console.log('2 ', window.innerHeight) 
    //             console.log('chromeH ', chromeH) 
    //             var isLandscape = window.innerWidth > window.innerHeight, height; 
    //             let land = isLandscape ? 32 : 44 ;
    //             if (window.innerHeight <= 1024 && 768 < window.innerHeight) { 

    //                 x =  chromeH + land ; 
    //             } else {
    //                 if (window.innerHeight <= 768 && 479 < window.innerHeight) {
    //                     // x = x + chromeH;
    //                     // console.log('total ', x)
    //                     // x = x + 70;
    //                     x =   chromeH + land;
    //                 }
    //             }

    //             // this.bodyList.nativeElement.style.height = "calc(100vh - " + x + "px)";
    //             this.choose.nativeElement.style.height = "calc(100vh - " + x + "px)";
    //         }

    //     }
    // }
    public clickData(event, text) {
        if (event.isTrusted) {
            if (text === 'defaultOpen1') {
                $('#defaultOpen2').removeClass('active');
                $('#defaultOpen1').addClass('active');
                var data = document.getElementById('centerleft');
                data.style.display = 'flex';
                this.isListItem = false;
                this.isTabClick = text;
                // document.getElementById("defaultOpen1").click();
            } else {
                $('#defaultOpen1').removeClass('active');
                $('#defaultOpen2').addClass('active');
                var data = document.getElementById('centerleft');
                data.style.display = 'none';
                this.isListItem = true;
                this.isTabClick = text;
                // document.getElementById("defaultOpen2").click();
            }
        }
    }
}
