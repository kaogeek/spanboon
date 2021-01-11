/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, FulfillFacade } from 'src/app/services/services';
import { environment } from 'src/environments/environment';
import { isArray } from 'util';
import { AbstractPage } from '../pages/AbstractPage';
import { DialogFulfill } from './dialog/DialogFulfill.component';
import * as $ from 'jquery';

const PAGE_NAME: string = 'fulfill-item';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'fulfill-item',
    templateUrl: './FulfillItem.component.html'
})
export class FulfillItem extends AbstractPage implements OnInit {

    @Input()
    public statusLabel: string = "สิ่งที่คุณต้องการเติมเต็ม";
    @Input()
    public data: any;
    @Output()
    public onSubmit: EventEmitter<any> = new EventEmitter();
    @Output()
    public onClosed: EventEmitter<any> = new EventEmitter();
    @Output()
    public submitDialog: EventEmitter<any> = new EventEmitter();
    @Output()
    public submitCanCelDialog: EventEmitter<any> = new EventEmitter();
    @ViewChild('itemQty', { static: false })
    public itemQty: ElementRef;

    @ViewChild('top', { static: false }) top: ElementRef;
    @ViewChild('tab', { static: false }) tabSelect: ElementRef;
    @ViewChild('bottomConfirm', { static: false }) bottomConfirm: ElementRef;
    @ViewChild('bodyList', { static: false }) bodyList: ElementRef;

    public apiBaseURL = environment.apiBaseURL;
    public dataList: any = [{ name: 'เติมเต็ม', id: 'defaultOpen1' }, { name: 'รายการ', id: 'defaultOpen2' }];
    // Facade
    private fulfillFacade: FulfillFacade;
    // Variable
    public arrListItem: any[] = [];
    public resFulfill: any[] = [];
    public resFulfillOriginal: any;
    public itemOriginal: any;
    public resultDialog: any;
    public itemId: string;
    public tabClick: string = 'centerleft';
    public isListItem: boolean;
    public isUnit: boolean;
    public isUnitSelect: boolean;
    public isName: boolean;
    public isLoading: boolean;
    public isActiveCss: boolean;
    public query_conversation: any;
    public isFirst: any;
    public msgError: any;
    public index: any;
    public isFrom: any;
    public isAddItem: any;

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router, fulfillFacade: FulfillFacade, public dialogRef: MatDialogRef<DialogFulfill>) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.fulfillFacade = fulfillFacade;
        this.dialog = dialog;
        this.router = router;
        this.isListItem = false;
        this.isUnit = false;
        this.isUnitSelect = false;
        this.isName = false;
        this.isActiveCss = false; 
        this.resultDialog = {};

        this.tabClick = this.dataList[0].id;
    }

    public ngOnInit(): void {
        if (this.data && this.data.arrListItem !== undefined && this.data.arrListItem.length > 0) {
            this.arrListItem = this.data.arrListItem;
            this.readdChildSelectMap();
        }

        if (this.data && this.data.fulfill !== undefined && this.data.fulfill.length > 0) {
            this.resFulfill = this.data.fulfill;

            if (this.data.isFrom !== null && this.data.isFrom !== undefined && this.data.isFrom !== '') {
                this.isFrom = this.data.isFrom;

                if (this.data.isFrom === 'POST') {
                    this.selectedDataItem(this.data.currentPostItem, this.data.isFrom);
                } else if (this.data.isFrom === 'FULFILL') {
                    for (const currentFulfillItem of this.data.currentFulfillItem) {
                        this.disableCurrentItem(currentFulfillItem, this.data.isFrom);
                    }
                }
            } 
            this.resFulfillOriginal = JSON.stringify(this.resFulfill);
        }
        
        this.itemOriginal = JSON.parse(JSON.stringify(this.arrListItem)); 
        setTimeout(() => {
            this.onResize(); 
        }, 0);
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

    public selectedDataItem(fulfillItem: any, isFrom: any) {
        if (fulfillItem !== null && fulfillItem !== undefined) {
            // this.isListItem = true;
            let isSelected = true;
            let indexItem = 0;
            let pendingQty: number = 0;

            if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                if (isFrom === 'POST') {
                    this.itemId = fulfillItem._id;
                } else if (isFrom === 'FULFILL') {
                    this.itemId = fulfillItem.id;
                }
            }

            for (const item of this.arrListItem) {
                if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                    if (isFrom === 'POST') {
                        if ((item._id === fulfillItem._id) === true) {
                            isSelected = false;
                            break;
                        }
                    } else if (isFrom === 'FULFILL') {
                        if ((item.id === fulfillItem.id) === true) {
                            isSelected = false;
                            break;
                        }
                    }
                }

                indexItem++;
            }

            if (isSelected) {

                if (this.resFulfill.length > 0) {
                    const isFulfill = this.resFulfill.findIndex(fulfill => {
                        if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                            if (isFrom === 'POST') {
                                if ((fulfill._id === fulfillItem._id) === true) {
                                    return fulfill._id === fulfillItem._id;
                                }
                            } else if (isFrom === 'FULFILL') {
                                if ((fulfill.id === fulfillItem.id) === true) {
                                    return fulfill.id === fulfillItem.id;
                                }
                            }
                        }
                    });

                    if (isFulfill !== -1) {
                        this.resFulfill[isFulfill].checked = true;
                    }
                }

                if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                    if (isFrom === 'POST') {
                        pendingQty = fulfillItem.quantity - fulfillItem.fulfillQuantity;

                        this.arrListItem.push({
                            _id: fulfillItem._id,
                            pageId: fulfillItem.pageId,
                            postId: fulfillItem.post,
                            name: fulfillItem.name,
                            quantity: pendingQty,
                            unit: fulfillItem.unit,
                            category: fulfillItem.category,
                            imageURL: fulfillItem.imageURL,
                            isFrom
                        });
                    } else if (isFrom === 'FULFILL') {
                        if (isArray(fulfillItem)) {
                            for (const item of fulfillItem) {
                                pendingQty = item.quantity - item.fulfillQuantity;

                                this.arrListItem.push({
                                    id: item.id,
                                    pageId: item.pageId,
                                    postId: item.post,
                                    name: item.name,
                                    quantity: pendingQty,
                                    unit: item.unit,
                                    category: item.category,
                                    imageURL: item.imageURL,
                                    isFrom
                                });
                            }
                        } else {
                            pendingQty = fulfillItem.quantity - fulfillItem.fulfillQuantity;

                            this.arrListItem.push({
                                id: fulfillItem.id,
                                pageId: fulfillItem.pageId,
                                postId: fulfillItem.post,
                                name: fulfillItem.name,
                                quantity: pendingQty,
                                unit: fulfillItem.unit,
                                category: fulfillItem.category,
                                imageURL: fulfillItem.imageURL,
                                isFrom
                            });
                        }
                    }
                }

                this.fulfillFacade.nextMessage(this.arrListItem);
                this.readdChildSelectMap();
            } else {
                if (this.resFulfill.length > 0) {
                    const isFulfill = this.resFulfill.findIndex(fulfill => {
                        if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                            if (isFrom === 'POST') {
                                if ((fulfill._id === fulfillItem._id) === true) {
                                    return fulfill._id === fulfillItem._id;
                                }
                            } else if (isFrom === 'FULFILL') {
                                if ((fulfill.id === fulfillItem.id) === true) {
                                    return fulfill.id === fulfillItem.id;
                                }
                            }
                        }
                    });

                    if (isFulfill !== -1) {
                        this.resFulfill[isFulfill].checked = false;
                    }
                }

                this.arrListItem.splice(indexItem, 1);

                if (this.arrListItem.length === 0) {
                    // this.isListItem = false; 
                }
            }

            // if (window.innerWidth <= 1024) {
            //     var i, tabcontent, tablinks;
            //     tabcontent = document.getElementsByClassName("fulfill");
            //     tabcontent[0].style.display = "none";
            //     tabcontent[1].style.display = "none";
            //     document.getElementById("defaultOpen2").click();
            // }
        } 
        this.onResize();
    }

    public onQuantityChange(listItem: any, index: number, isFrom: string) {
        const overFulfill = this.resFulfill.findIndex(fulfill => {
            let pendingQty: number = fulfill.quantity - fulfill.fulfillQuantity;
            if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                if (listItem.quantity > pendingQty) {
                    if (isFrom === 'POST') {
                        if ((fulfill.id === listItem.id) === true) {
                            return fulfill._id === listItem._id;
                        }
                    } else if (isFrom === 'FULFILL') {
                        return fulfill.id === listItem.id;
                    }
                }
            }
        });

        if (overFulfill !== -1) {
            this.arrListItem[index].isOverFulfill = true;
        } else {
            this.arrListItem[index].isOverFulfill = false;
        }
    }

    private disableCurrentItem(currentFulfillItem: any, isFrom: any) {
        let isSelected = true;

        if ((this.resFulfill !== null && this.resFulfill !== undefined) && (currentFulfillItem !== null && currentFulfillItem !== undefined)) {
            for (const item of this.arrListItem) {
                if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                    if (isFrom === 'FULFILL') {
                        if ((item.id === currentFulfillItem.needsId) === true) {
                            isSelected = false;
                            break;
                        }
                    }
                }
            }

            if (isSelected) {
                if (this.resFulfill.length > 0) {
                    const isFulfill = this.resFulfill.findIndex(fulfill => {
                        if (isFrom === 'FULFILL') {
                            if ((fulfill.id === currentFulfillItem.needsId) === true) {
                                return fulfill.id === currentFulfillItem.needsId;
                            }
                        }
                    });

                    if (isFulfill !== -1) {
                        this.resFulfill[isFulfill].disabled = true;
                    }
                }
            }
        }
    }

    private readdChildSelectMap(): void {
        if (this.arrListItem.length > 0) {
            for (let item of this.arrListItem) {
                if (item.isAddItem) {
                    break;
                }
            }
        }
    }

    public onResize() {
        if (window.innerWidth <= 1024) {   
            //centerleft 
            if (this.tabClick === 'defaultOpen1') { 
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
                // console.log('elementHeight ', elementHeight)
                if (window.innerHeight <= 1024 && 768 < window.innerHeight) {
                    // x = x + window.outerHeight;
                    // console.log('1 ',x)
                    // x = x + 31;
                    x = x + chromeH;
                } else {
                    if (window.innerHeight <= 768 && 479 < window.innerHeight) {
                        x = x + chromeH;
                        // console.log('total ', x)
                        // x = x + 70;
                    }
                }
                console.log('a ',x)
                this.bodyList.nativeElement.style.height = "calc(100vh - " + x + "px)";
            } 
        }
    }

    public clickData(event, text) {  
        if (event.isTrusted) {
            if (text === 'defaultOpen1') {
                $('#defaultOpen2').removeClass('active');
                $('#defaultOpen1').addClass('active');
                var data = document.getElementById('centerleft');
                data.style.display = 'flex';
                this.isListItem = false;
                this.tabClick = text;
                
                // document.getElementById("defaultOpen1").click();
            } else {
                $('#defaultOpen1').removeClass('active');
                $('#defaultOpen2').addClass('active');
                var data = document.getElementById('centerleft');
                data.style.display = 'none';
                this.isListItem = true;
                this.tabClick = text;
                // document.getElementById("defaultOpen2").click();
            }
        } 
    }


    public deleteItem(listItem: any, index: number, isFrom: string) {
        if ((listItem._id === null || listItem._id === undefined || listItem._id === '') && (listItem.id === null || listItem.id === undefined || listItem.id === '')) {
            this.arrListItem.splice(index, 1);
        } else {
            if (this.resFulfill.length > 0) {
                const isFulfill = this.resFulfill.findIndex(fulfill => {
                    if (isFrom !== null && isFrom !== undefined && isFrom !== '') {
                        if (isFrom === 'POST') {
                            if ((fulfill._id === listItem._id) === true) {
                                return fulfill._id === listItem._id;
                            }
                        } else if (isFrom === 'FULFILL') {
                            if ((fulfill.id === listItem.id) === true) {
                                return fulfill.id === listItem.id;
                            }
                        }
                    }
                });

                if (isFulfill !== -1) {
                    this.resFulfill[isFulfill].checked = false;
                }
            }

            this.arrListItem.splice(index, 1);
            if (this.arrListItem.length === 0) {
                this.isListItem = false;
            }
        }
    }

    public deleteRowItem(index: number) {
        this.arrListItem.splice(index, 1);
        if (this.arrListItem.length === 0) {
            this.isListItem = false;
        }
    }

    public dropToList(event: CdkDragDrop<number[]>): void {
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

    public onConfirm(isFrom: any): void {
        if (this.arrListItem !== null && this.arrListItem !== undefined && this.arrListItem.length > 0) {
            const needsResult = [];

            for (let item of this.arrListItem) {
                if (item !== null && item !== undefined) {
                    let needsData = {}

                    if (isFrom === 'POST') {
                        needsData = {
                            id: item._id,
                            postId: item.postId,
                            name: item.name,
                            quantity: item.quantity,
                            unit: item.unit,
                            imageURL: item.imageURL
                        };

                        needsResult.push(needsData);
                    } else if (isFrom === 'FULFILL') {
                        needsData = {
                            id: item.id,
                            postId: item.postId,
                            name: item.name,
                            quantity: item.quantity,
                            unit: item.unit,
                            imageURL: item.imageURL
                        };

                        needsResult.push(needsData);
                    }
                }
            }

            if (needsResult !== null && needsResult !== undefined && needsResult.length > 0) {
                if (isFrom === 'POST') {
                    this.dialogRef.close();
                    this.router.navigateByUrl('/fulfill', { state: { data: needsResult } });
                } else if (isFrom === 'FULFILL') {
                    this.dialogRef.close(needsResult);
                }
            }
        }
    }

    public onClose(): void {
        let body = {
            data: this.data.fulfill,
            isClose: true
        }

        this.onClosed.emit(body);

        this.arrListItem = [];
        this.resFulfill = [];
        this.data = undefined;
    }
}