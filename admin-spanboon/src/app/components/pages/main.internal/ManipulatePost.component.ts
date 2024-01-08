/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { Page } from '../../../models/Page';
import { PageFacade } from '../../../services/facade/PageFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { ManipulatePostFacade } from '../../../services/facade/ManipulatePostFacade.service';

const PAGE_NAME: string = "manipulatepost";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'manipulate-post',
    templateUrl: './ManipulatePost.component.html'
})
export class ManipulatePost extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public pageFacade: PageFacade;
    public manipulatePostFacade: ManipulatePostFacade;
    private authenManager: AuthenManager;
    private router: Router;
    public isSave: boolean = false;

    public valueBool: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: Page;
    public submitted = false;
    public isOfficialPage: {};
    public orderBy: any = {};
    public edit: boolean = false;

    constructor(pageFacade: PageFacade, manipulatePostFacade: ManipulatePostFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.pageFacade = pageFacade;
        this.manipulatePostFacade = manipulatePostFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.orderBy = { createdDate: -1 };
        this.fieldTable = [
            {
                name: "page",
                label: "ชื่อ",
                width: "270pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "type",
                label: "ประเภท",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "count",
                label: "จำนวนที่รายงาน",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
        ];
        this.actions = {
            isOfficial: false,
            isBan: false,
            isApprove: true,
            isUnApprove: true,
            isSelect: false,
            isCreate: false,
            isEdit: false,
            isDelete: false,
            isComment: false,
            isBack: false,
            isPreview: false,
        };
        this.setFields();
    }

    public ngOnInit() {
        this.table.isReport = true;
    }

    private setFields(): void {
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
    }

    public clickApprove(data) {
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณต้องการอนุมัติหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.manipulatePostFacade.approve(data).then((res) => {
                    this.table.searchData();
                });
            }
        });
    }

    public clickUnApprove(data) {
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณต้องการไม่อนุมัติหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.manipulatePostFacade.unapprove(data).then((res) => {
                    this.table.searchData();
                });
            }
        });
    }
}
