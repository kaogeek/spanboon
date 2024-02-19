/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { DialogImagePreview } from '../../shares/DialogImagePreview.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { VoteEventFacade } from '../../../services/facade/VoteEventFacade.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


const PAGE_NAME: string = "vote";

const SEARCH_LIMIT: number = 20;
const SEARCH_OFFSET: number = 0;


@Component({
    selector: 'admin-vote-page',
    templateUrl: './VoteEventPage.component.html'
})
export class VoteEventPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    @ViewChild('myInput') myInputVariable: ElementRef;
    @ViewChild('inputOrder') public inputOrder: ElementRef;

    public voteEventFacade: VoteEventFacade;
    private authenManager: AuthenManager;
    private router: Router;

    public edit: boolean = false;
    public preview: boolean = false;
    public valueClosed: boolean = false;
    public valueApproved: boolean = false;
    public valuePin: boolean = false;
    public valueShowName: boolean = false;
    public valueShowResult: boolean = false;
    public valueStatus: any;
    public valueStartSupport: any;
    public valueEndSupport: any;
    public valueStartVote: any;
    public valueEndVote: any;
    public valueTitle: any;
    public valueDetail: any;
    public valueHashtag: any;
    public valueHide: any;
    public previewData: any;
    public imageCover: any;
    public _id: any;
    public listStatus: any[] = ['vote', 'support', 'close'];
    public listHashtag: any[] = [];

    public hashTag = new FormControl();
    public filteredOptions: Observable<string[]>;

    constructor(voteEventFacade: VoteEventFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.voteEventFacade = voteEventFacade;
        this.router = router;
        this.authenManager = authenManager;
        this.fieldTable = [
            {
                name: "isPin",
                label: "ปักหมุด",
                width: "50pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "coverPageURL",
                label: "รูปภาพ",
                width: "60pt",
                class: "", formatColor: false, formatImage: true,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "title",
                label: "หัวข้อ",
                width: "300pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "detail",
                label: "รายละเอียด",
                width: "300pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            }
        ];
        this.actions = {
            isOfficial: false,
            isBan: false,
            isApprove: true,
            isUnApprove: true,
            isSelect: false,
            isCreate: false,
            isEdit: true,
            isDelete: true,
            isComment: false,
            isBack: false,
            isPreview: true,
        };
        this._setFields();

    }

    public ngOnInit() {
        this._getHashTag();

        this.filteredOptions = this.hashTag.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value))
            );
    }

    private _filter(value: string): string[] {
        const filterValue = value;

        return this.listHashtag.filter(option => option.includes(filterValue));
    }

    private _getHashTag() {
        this.voteEventFacade.getVoteHashtag().then((res) => {
            if (res) {
                this.listHashtag = res;
            }
        }).catch((err) => {
            if (err) { }
        });
    }

    private _setFields(): void {
        this.valueShowName = undefined;
        this.valueShowResult = undefined;
        this.valuePin = undefined;
        this.valueApproved = undefined;
        this.valueClosed = undefined;
        this.valueStatus = undefined;
        this.valueStartSupport = undefined;
        this.valueEndSupport = undefined;
        this.valueStartVote = undefined;
        this.valueEndVote = undefined;
        this.valueHide = undefined;
    }
    public clickCloseDrawer(): void {
        this.edit = false;
        this.preview = false;
        this.drawer.toggle();
    }

    public clickEditForm(data: any): void {
        this._id = data._id;
        this.valueClosed = data.closed;
        this.valueApproved = data.approved;
        this.valueStatus = data.status;
        this.valuePin = data.pin;
        this.valueShowName = data.showVoterName;
        this.valueShowResult = data.showVoteResult;
        this.valueStartSupport = data.startSupportDatetime;
        this.valueEndSupport = data.endSupportDatetime;
        this.valueStartVote = data.startVoteDatetime;
        this.valueEndVote = data.endVoteDatetime;
        this.valueTitle = data.title;
        this.valueDetail = data.detail;
        this.valueHide = data.hide;
        this.hashTag.setValue(data.hashTag);
        this.drawer.toggle();
    }

    public changeClosed($event) {
        if ($event.checked) {
            this.valueClosed = false;
        } else {
            this.valueClosed = true;
        }
    }

    public clickPreview(data: any): void {
        this.imageCover = data.coverPageURL;
        this.valueHashtag = data.hashTag;
        this.voteEventFacade.getVoteChoice(data._id).then((res: any) => {
            if (res) {
                this.previewData = res.voteItem;
                this.preview = true;
                this.clickEditForm(data);
            }
        });
    }

    public clickSave(): void {
        const result: any = {};
        result.closed = this.valueClosed;
        result.pin = this.valuePin;
        result.title = this.valueTitle;
        result.detail = this.valueDetail;
        result.showVoterName = this.valueShowName;
        result.showVoteResult = this.valueShowResult;
        result.hashTag = this.hashTag.value;

        if (!!this.valueStartVote && !!this.valueEndVote) {
            result.startSupportDatetime = this.valueStartSupport;
            result.endSupportDatetime = this.valueEndSupport;
            result.startVoteDatetime = this.valueStartVote;
            result.endVoteDatetime = this.valueEndVote;
        } else {
            result.startSupportDatetime = this.valueStartSupport;
            result.endSupportDatetime = this.valueEndSupport;
            result.startVoteDatetime = null;
            result.endVoteDatetime = null;
        }
        this.voteEventFacade.edit(this._id, result).then((res) => {
            this.table.searchData();
            this._setFields();
            this.edit = false;
            this.drawer.toggle();
        }).catch((err) => {
            if (err) {
                if (err.error.message === "Cannot update: status is approved.") {
                    this.dialogWarning("ไม่สามารถแก้ไขได้เนื่องจากอนุมัติแล้ว");
                }
            }
        });
    }

    public clickDelete(data: any): void {
        this.voteEventFacade.delete(data._id).then((res) => {
            let index = 0;
            let dataTable = this.table.data;
            for (let d of dataTable) {
                if (d.id == data.id) {
                    dataTable.splice(index, 1);
                    this.table.setTableConfig(dataTable);
                    this.dialogWarning("ลบข้อมูลสำเร็จ");
                    break;
                }
                index++;
            }
        }).catch((err) => {
            this.dialogWarning(err.error.message);
        });
    }

    public clickShowVote() {
        const voteData: any = {};
        voteData.hide = !this.valueHide;
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: this.valueHide ? "คุณต้องการปิดการแสดงโหวตนี้ใช่หรือไม่" : "คุณต้องการแสดงโหวตนี้ใช่หรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.voteEventFacade.showHide(this._id, voteData).then((res) => {
                    this.valueHide = !this.valueHide;
                    this.table.searchData();
                });
            }
        });
    }

    public clickApprove(data) {
        const voteData: any = {};
        voteData.closed = false;
        voteData.approved = true;
        voteData.pin = true;
        voteData.status = "vote";
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณต้องการอนุมัติโหวตนี้ใช่หรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.voteEventFacade.approve(data._id, voteData).then((res) => {
                    this.table.searchData();
                });
            }
        });
    }

    public clickUnApprove(data) {
        const voteData: any = {};
        voteData.closed = true;
        voteData.approved = false;
        voteData.pin = false;
        voteData.status = "close";
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณต้องการไม่อนุมัติโหวตนี้ใช่หรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.voteEventFacade.reject(data._id, voteData).then((res) => {
                    this.table.searchData();
                });
            }
        });
    }

    public saveDate(event: any, type: any, mode): void {
        const inputDate = new Date(event.value);
        const isoDateString = inputDate.toISOString();
        if (type === 'start') {
            if (mode === 'support') {
                this.valueStartSupport = isoDateString;
            } else {
                this.valueStartVote = isoDateString;
            }
        } else {
            if (mode === 'support') {
                this.valueEndSupport = isoDateString;
            } else {
                this.valueEndVote = isoDateString;
            }
        }
    }

    public imagePreview(image) {
        let img = image.replace('/image', '');
        let dialogRef = this.dialog.open(DialogImagePreview, {
            data: img
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
            }
        });
    }
}
