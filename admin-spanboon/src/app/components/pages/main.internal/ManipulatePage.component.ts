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
import { ManipulateFacade } from '../../../services/facade/ManipulateFacade.service';

const PAGE_NAME: string = "manipulatepage";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'manipulate-page',
    templateUrl: './ManipulatePage.component.html'
})
export class ManipulatePage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public pageFacade: PageFacade;
    public manipulateFacade: ManipulateFacade;
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
    public typeReport: any;
    public detailReport: any;
    public report = ['REPORT_PAGE', 'REPORT_POST', 'REPORT_USER'];
    public _id: string;

    constructor(pageFacade: PageFacade, manipulateFacade: ManipulateFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.pageFacade = pageFacade;
        this.manipulateFacade = manipulateFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.orderBy = { createdDate: -1 };
        this.fieldTable = [
            {
                name: "type",
                label: "ประเภท",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "detail",
                label: "รายละเอียด",
                width: "150pt",
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
            isCreate: true,
            isEdit: true,
            isDelete: true,
            isComment: false,
            isBack: false,
            isPreview: false,
        };
        this.setFields();
    }

    public ngOnInit() {
    }

    private setFields(): void {
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
    }

    public clickCloseDrawer(): void {
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณมีข้อมูลที่ยังไม่ได้บันทึกต้องการปิดหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.submitted = false;
                this.edit = false;
                this.typeReport = undefined;
                this.detailReport = undefined;
                this.drawer.toggle();
            }
        });
    }

    public clickCreateForm(): void {
        this.setFields();
        this.drawer.toggle();
    }

    public clickEditForm(data: any): void {
        this.drawer.toggle();
        this.edit = true;
        this._id = data.id;
        this.typeReport = data.type;
        this.detailReport = data.detail;
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
    }


    public clickDelete(data: any): void {
        this.manipulateFacade.delete(data.id).then((res) => {
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
    public clickSave() {
        const result: any = {};
        result.type = this.typeReport;
        result.detail = this.detailReport;
        if (!this.edit) {
            this.manipulateFacade.create(result).then((res) => {
                this.table.searchData();
                this.typeReport = undefined;
                this.detailReport = undefined;
                this.edit = false;
                this.drawer.toggle();
            });
        } else {
            this.manipulateFacade.edit(this._id, result).then((res) => {
                this.table.searchData();
                this.typeReport = undefined;
                this.detailReport = undefined;
                this.edit = false;
                this.drawer.toggle();
            });
        }
    }
}
