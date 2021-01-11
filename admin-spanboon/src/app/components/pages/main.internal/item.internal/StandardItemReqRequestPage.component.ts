/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { SearchFilter } from '../../../../models/SearchFilter';
import { StandardItemRequest } from '../../../../models/StandardItemRequest';
import { StandardItemReqApproveRequest } from '../../../../models/StandardItemReqApproveRequest';
import { StandardItemReqRequestFacade } from '../../../../services/facade/StandardItemReqRequestFacade.service';
import { AbstractPage } from '../../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../../services/AuthenManager.service';
import { Router } from '@angular/router';

const PAGE_NAME: string = "itemreqrequest";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-StandardItemRE-page',
    templateUrl: './StandardItemReqRequestPage.component.html'
})
export class StandardItemReqRequestPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public standardItemReqRequestFacade: StandardItemReqRequestFacade;

    public dataForm: StandardItemRequest;
    public valueBool: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: StandardItemRequest;
    public submitted = false;

    constructor(standardItemReqRequestFacade: StandardItemReqRequestFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.standardItemReqRequestFacade = standardItemReqRequestFacade;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.fieldTable = [
            {
                name: "name",
                label: "ชื่อ",
                width: "100pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "description",
                label: "รายละเอียด",
                width: "300pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "approveUser",
                label: "อนุมัติโดย",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            }, {
                name: "approveDateTime",
                label: "เวลาอนุมัติ",
                width: "100pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
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
            isDelete: true,
            isComment: false,
            isBack: false
        };
    }

    public ngOnInit() {
    }

    public clickDelete(data: any): void {
        this.standardItemReqRequestFacade.delete(data.id).then((res) => {
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

    public clickApprove(data: any): void {
        let ap = new StandardItemReqApproveRequest();
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณต้องการอนุมัติหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                ap.id = data.id
                ap.isApprove = true
                ap.description = ''
                this.standardItemReqRequestFacade.approve(data.id, ap).then((res: any) => {
                    let index = 0;
                    let data = this.table.data;
                    for (let d of data) {
                        if (d.id == res.id) {
                            data.splice(index, 1);
                            break;
                        }
                        index++;
                    }
                    this.table.setTableConfig(data);
                }).catch((err: any) => {
                    this.dialogWarning(err.error.message);
                });
            }
        });
    }

    public clickUnApprove(data: any): void {
        let ap = new StandardItemReqApproveRequest();
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณต้องการไม่อนุมัติหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                ap.id = data.id
                ap.isApprove = false
                ap.description = ''
                this.standardItemReqRequestFacade.approve(data.id, ap).then((res: any) => {
                    let index = 0;
                    let data = this.table.data;
                    for (let d of data) {
                        if (d.id == res.id) {
                            data.splice(index, 1);
                            break;
                        }
                        index++;
                    }
                    this.table.setTableConfig(data);
                }).catch((err: any) => {
                    this.dialogWarning(err.error.message);
                });
            }
        });
    }

    public clickSave() {

    }
}
