/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, ViewChild, ElementRef, OnDestroy, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData, PageCategory, SearchFilter, Asset } from 'src/app/models/models';
import { BadWordUtils } from '../../../utils/BadWordUtils';
import { PageCategoryFacade, PageFacade, AuthenManager, AssetFacade, ObservableManager, NeedsFacade } from '../../../services/services';
import { DialogImage } from './dialog';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as $ from 'jquery';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ChooseItem } from '../ChooseItem.component';

declare var $: any;
const PAGE_NAME: string = 'dialog-doing';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'dialog-doing',
    templateUrl: './DialogDoIng.component.html',
})
export class DialogDoIng extends AbstractPage {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @ViewChild('dialog', { static: false }) dialogDoing: ElementRef;
    @ViewChild('bodyList', { static: false }) bodyList: ChooseItem;

    @Input()
    public isProvideItem: boolean = false;

    private needsFacade: NeedsFacade;
    private subscription: Subscription;

    public dataMessage: any;
    public cloneItem: any;

    @Output()
    public submitDialog: EventEmitter<any> = new EventEmitter();
    @Output()
    public submitCanCelDialog: EventEmitter<any> = new EventEmitter();


    constructor(public dialogRef: MatDialogRef<DialogDoIng>, @Inject(MAT_DIALOG_DATA) public data: any,
        dialog: MatDialog, authenManager: AuthenManager, router: Router, needsFacade: NeedsFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog;
        this.needsFacade = needsFacade;
        this.isProvideItem = this.data.isProvideItem;
        if (this.data && this.data.arrListItem.length > 0 && this.data.arrListItem !== undefined && this.data.arrListItem !== null && this.data.arrListItem !== '') {
            this.cloneItem = JSON.parse(JSON.stringify(this.data));
        }

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

    public ngAfterViewInit(): void {
        this.needsFacade.sharedMessage.subscribe(message => {
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
        this.onResize();
    }

    public onClose(event) {
        if ((event === undefined && this.cloneItem === undefined) || event.data && event.data.length === 0) {
            this.dialogRef.close();
            return;
        }
        if (event.data || (event.data !== this.cloneItem && this.cloneItem.arrListItem && this.cloneItem.arrListItem !== undefined)) {
            const confirmEventEmitter = new EventEmitter<any>();
            confirmEventEmitter.subscribe(() => {
                this.submitDialog.emit();
            });
            const canCelEventEmitter = new EventEmitter<any>();
            canCelEventEmitter.subscribe(() => {
                this.submitCanCelDialog.emit();
            });
            let dialog = this.showDialogWarming("คุณต้องการปิดรายการ" + this.PLATFORM_NEEDS_TEXT + " ใช่หรือไม่ ?", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
            dialog.afterClosed().subscribe((res) => {
                if (res) {
                    this.data.arrListItem = [];
                    this.needsFacade.nextMessage(this.data.arrListItem);
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

    public onResize() {
        // if (window.innerWidth <= 768) {
        //     if (this.dialogDoing && this.bodyList) { 
        //         let bottom = this.dialogDoing.nativeElement.offsetHeight;
        //         let body = this.bodyList.getHeigthBody();
        //         let x;
        //         // let x = window.outerHeight + bottom ;
        //         console.log('window.innerHeight ', window.innerHeight)
        //         console.log('window.outerHeight ', window.outerHeight)
        //         console.log('x ', x) 
        //         console.log('bottom ', bottom)
        //         console.log('body ', body)
        //         var chromeH = window.outerHeight - window.innerHeight;
        //         console.log('window.chromeH ', chromeH) 
        //         const elementHeight = document.getElementById('control-height').clientHeight;
        //         console.log('elementHeight ', elementHeight)
        //         if (window.innerHeight <= 1024 && 768 < window.innerHeight) {
        //             // x = x + window.outerHeight;
        //             // console.log('1 ',x)
        //             // x = x + 31;
        //         } else {
        //             if (window.innerHeight <= 768 && 479 < window.innerHeight) {
        //                 x = chromeH;
        //                 console.log('total ', x)
        //                 // x = x + 70;
        //             }
        //         }
        //         // this.dialogDoing.nativeElement.style.height = "calc(100% - " + x + "px)";
        //     }

        // }
    }
}
