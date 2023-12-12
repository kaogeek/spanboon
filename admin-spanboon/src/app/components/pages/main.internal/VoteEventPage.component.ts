/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchFilter } from '../../../models/SearchFilter';
import { EmergencyEvent } from '../../../models/EmergencyEvent';
import { EmergencyEventFacade } from '../../../services/facade/EmergencyEventFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { VoteEventFacade } from '../../../services/facade/VoteEventFacade.service';


const PAGE_NAME: string = "vote";

const SEARCH_LIMIT: number = 10;
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
    public valueClosed: boolean = false;
    public valueApproved: boolean = false;
    public valuePin: boolean = false;
    public valueShowed: boolean = false;
    public valueStatus: any;
    public _id: any;
    public listStatus: any[] = ['vote', 'support'];
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
            isApprove: false,
            isUnApprove: false,
            isSelect: false,
            isCreate: false,
            isEdit: true,
            isDelete: true,
            isComment: false,
            isBack: false
        };
        this.setFields();

    }

    public ngOnInit() {
    }

    private setFields(): void {

    }
    public clickCloseDrawer(): void {
        this.drawer.toggle();
    }

    public clickEditForm(data: any): void {
        this._id = data._id;
        this.valueClosed = data.closed;
        this.valueApproved = data.approved;
        this.valueStatus = data.status;
        this.valuePin = data.pin;
        this.valueShowed = data.showed;
        this.drawer.toggle();
    }

    public clickSave(): void {
        const result: any = {};
        result.closed = this.valueClosed;
        result.approved = this.valueApproved;
        result.pin = this.valuePin;
        result.showed = this.valueShowed;
        result.status = this.valueStatus;
        this.voteEventFacade.edit(this._id, result).then((res) => {
            this.table.searchData();
            this.valueShowed = undefined;
            this.valuePin = undefined;
            this.valueApproved = undefined;
            this.valueClosed = undefined;
            this.valueStatus = undefined;
            this.edit = false;
            this.drawer.toggle();
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
                    // alert("success");
                    this.dialogWarning("ลบข้อมูลสำเร็จ");
                    break;
                }
                index++;
            }
        }).catch((err) => {
            this.dialogWarning(err.error.message);
        });
    }
}
