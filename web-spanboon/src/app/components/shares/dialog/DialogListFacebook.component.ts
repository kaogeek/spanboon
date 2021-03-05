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
const PAGE_NAME: string = 'dialog-list-facebook';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'dialog-list-facebook',
    templateUrl: './DialogListFacebook.component.html',
})
export class DialogListFacebook extends AbstractPage {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public isProvideItem: boolean = false;

    public chooseFacebook: any;
    public index: number;

    @Output()
    public submitDialog: EventEmitter<any> = new EventEmitter();
    @Output()
    public submitCanCelDialog: EventEmitter<any> = new EventEmitter();

    public dataTest: any;

    constructor(public dialogRef: MatDialogRef<DialogListFacebook>, @Inject(MAT_DIALOG_DATA) public data: any,
        dialog: MatDialog, authenManager: AuthenManager, router: Router) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog;
        this.isProvideItem = this.data.isProvideItem;
        this.index = 0;
        this.dataTest = [{
            name: 'ssssss1',
            selected: true
        }, {
            name: 'tttt2'
        }]
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

    }

    public onClose() {
        this.dialogRef.close();
    }

    public onConfirm(): void {
        this.dialogRef.close(this.chooseFacebook);
    }

    public checkBoxBindingPageFacebook(text: any, i: number) { 
        if (typeof (this.index) === 'number') {
            if (this.index !== i) {
                Object.assign(this.data.data[this.index], { selected: false });
                this.index = i
            }
        } else {
            this.index = i
        }
        this.chooseFacebook = text;
    }
}
