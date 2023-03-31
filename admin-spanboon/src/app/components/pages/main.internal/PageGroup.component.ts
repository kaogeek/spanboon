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
import { PageGroupFacade } from '../../../services/facade/PageGroupFacade.service';

const PAGE_NAME: string = "pagegroup";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-page-page',
    templateUrl: './PageGroup.component.html'
})
export class PageGroup extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public pageFacade: PageFacade;
    public pageGroupFacade: PageGroupFacade;
    private authenManager: AuthenManager;
    private router: Router;
    public isSave: boolean = false;

    public dataForm: Page;
    public valueBool: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: Page;
    public submitted = false;
    public isOfficialPage: {};
    public orderBy: any = {};

    constructor(pageFacade: PageFacade, pageGroupFacade: PageGroupFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.pageFacade = pageFacade;
        this.pageGroupFacade = pageGroupFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.orderBy = { createdDate: -1 };
        this.fieldTable = [
            {
                name: "name",
                label: "ชื่อกลุ่ม",
                width: "330pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "detail",
                label: "ประเภทกลุ่ม",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            }
        ];
        this.actions = {
            isOfficial: true,
            isBan: true,
            isApprove: false,
            isUnApprove: false,
            isSelect: false,
            isCreate: true,
            isEdit: true,
            isDelete: true,
            isComment: false,
            isBack: false
        };
        this.setFields();
    }

    public ngOnInit() {
        this.search();
    }

    private setFields(): void {
        this.dataForm = new Page();
        this.dataForm.name = "";
        this.dataForm.detail = "";
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
        this.orinalDataForm = JSON.parse(JSON.stringify(this.dataForm));
    }

    public clickCloseDrawer(): void {
        let pass = true;
        for (const key in this.orinalDataForm) {
            if (this.orinalDataForm[key] !== this.dataForm[key]) {
                pass = false;
                break;
            }
        }
        if (!pass) {
            let dialogRef = this.dialog.open(DialogWarningComponent, {
                data: {
                    title: "คุณมีข้อมูลที่ยังไม่ได้บันทึกต้องการปิดหรือไม่"
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.submitted = false;
                    this.drawer.toggle();
                }
            });
        } else {
            this.drawer.toggle();
        }
    }

    public clickCreateForm(): void {
        this.setFields();
        this.drawer.toggle();
    }

    public search() {
        this.pageGroupFacade.find().then((res: any) => {
        }).catch((err: any) => {
        })
    }

    public clickEditForm(data: any): void {
        this.drawer.toggle();
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
        this.dataForm = JSON.parse(JSON.stringify(data));
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
    }


    public clickDelete(data: any): void {
        this.pageGroupFacade.delete(data.id).then((res) => {
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
        if (!this.isSave) {
            this.isSave = true;
            this.submitted = true;
            if (this.orinalDataForm.name !== "" && this.orinalDataForm.name !== undefined) {
                this.pageGroupFacade.edit(this.dataForm.id, this.dataForm).then((res: any) => {
                    this.table.searchData();
                    this.submitted = false;
                    this.isSave = false;
                    this.drawer.toggle();
                }).catch((err: any) => {
                    this.isSave = false;
                    this.dialogWarning(err.error.message);
                });
            } else {

                this.pageGroupFacade.create(this.dataForm).then((res: any) => {
                    this.table.searchData();
                    this.submitted = false;
                    this.isSave = false;
                    this.drawer.toggle();
                }).catch((err: any) => {
                    this.isSave = false;
                    this.dialogWarning(err.error.message);
                });
            }
        }
    }
}
