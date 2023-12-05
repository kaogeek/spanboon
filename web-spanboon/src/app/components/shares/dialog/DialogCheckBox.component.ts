/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import {
    Component, Input, Inject, ViewChild, ElementRef, EventEmitter, NgZone,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AssetFacade, AuthenManager, PageFacade } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { DialogData, SearchFilter } from '../../../models/models';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

const PAGE_NAME: string = 'checkbox';

@Component({
    selector: 'dialog-check-box',
    templateUrl: './DialogCheckBox.component.html',
})
export class DialogCheckBox extends AbstractPage {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @ViewChild('searchInputObjective', { static: false })
    searchInputObjective: ElementRef;

    private pageFacade: PageFacade;
    private assetFacade: AssetFacade;
    public pageGroup: FormGroup;

    @Input()
    public redirection: string;
    public dialog: MatDialog;
    public apiBaseURL = environment.apiBaseURL;
    private isbottom: boolean;
    public isPreLoadIng: boolean;
    public isLoading: boolean;
    public spamTopic: any;
    public spamDetail: any;
    public listPage: any[] = [];
    public pageSelectList: any[] = [];

    constructor(public dialogRef: MatDialogRef<DialogCheckBox>,
        pageFacade: PageFacade,
        assetFacade: AssetFacade,
        private formBuilder: FormBuilder,
        dialog: MatDialog, authenManager: AuthenManager, router: Router,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        _ngZone: NgZone) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog;
        this.authenManager = authenManager;
        this.pageFacade = pageFacade;
        this.assetFacade = assetFacade;

    }

    public ngOnInit(): void {
        if (this.data.title === 'เพิ่มผู้ร่วมแคมเปญ') {
            this.searchPage('');
        }
    }

    public ngAfterViewInit(): void {
        fromEvent(this.searchInputObjective && this.searchInputObjective.nativeElement, 'keyup').pipe(
            debounceTime(500)
            , distinctUntilChanged()
        ).subscribe((text: any) => {
            this.searchPage(this.searchInputObjective.nativeElement.value);
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    onConfirm(): void {
        let data;
        if (this.data.title === 'เพิ่มผู้ร่วมแคมเปญ') {
            this.isbottom = false
            if (this.pageSelectList.length > 0) {
                this.dialogRef.close(this.pageSelectList);
            }
        } else {
            this.isbottom = false
            let detail: any = document.getElementsByClassName('text-detail');
            if (detail.length > 0) {
                this.spamDetail = detail[0].value;
            }
            if (!!this.spamTopic) {
                data = {
                    topic: this.spamTopic,
                    detail: this.spamDetail
                }
            }
            this.dialogRef.close(data);
            if (this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined) {
                this.data.confirmClickedEvent.emit(true);
            }
        }
    }

    onClose(): void {
        this.isbottom = false
        this.dialogRef.close(this.isbottom);
        if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
            this.data.cancelClickedEvent.emit(false);
        }
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

    public selectTopic(topic: string, detail: string) {
        this.spamTopic = topic;
    }

    public backToSelect() {
        this.spamTopic = undefined;
    }

    public async searchPage(value?: string) {
        let search: SearchFilter = new SearchFilter();
        search.limit = 10;
        search.count = false;
        search.whereConditions = { banned: false };
        search.keyword = '';
        if (value) {
            search.keyword = value;
        }
        var aw = await this.pageFacade.search(search).then((pages: any) => {
            if (value) {
                this.listPage = [];
            }
            if (pages) {
                let array = [];
                // for (let index = 0; index < pages.length; index++) {
                //     if (pages[index].pageObjectiveJoiner.length === 0) {
                //         array.push(pages[index]);
                //     } else {
                //         for (const item of pages[index].pageObjectiveJoiner) {
                //             if (item.join === false) {
                //                 array.push(pages[index]);
                //             }
                //         }
                //     }
                // }
                this.listPage = pages;
            }
        }).catch((err: any) => {
            console.log("err", err);
        });
        if (this.listPage.length > 0) {
            for (let p of this.listPage) {
                if (!p.signURL) {
                    await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
                        p.img64 = res.data
                    }).catch((err: any) => {
                        console.log("err", err);
                    });
                }
            }
        }
    }

    public selectPage(data, index?) {
        this.listPage[index].check = true;
        if (data.check) {
            this.pageSelectList.push(data._id);
        }
    }

    public unselectPage(data, index?) {
        this.listPage[index].check = false;
        let result = this.pageSelectList.filter((res) => res === data._id);
        let indexOf = this.pageSelectList.indexOf(result[0]);
        this.pageSelectList.splice(indexOf, 1);
    }

}
