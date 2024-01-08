/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { UserFacade } from '../../../services/facade/UserFacade.service';
import { User } from '../../../models/User';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';

const PAGE_NAME: string = "admin";

@Component({
    selector: 'admin-user-page',
    templateUrl: './AdminPage.component.html'
})
export class AdminPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public userFacade: UserFacade;
    private authenManager: AuthenManager;
    private router: Router;

    public dataForm: User;
    public fieldSearch: string[];

    constructor(userFacade: UserFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.userFacade = userFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.fieldSearch = [
            "username",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "created_date"
        ];
        this.fieldTable = [
            {
                name: "username",
                label: "ชื่อผู้ใช้งาน",
                width: "200pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "firstName",
                label: "ชื่อ",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "lastName",
                label: "นามสกุล",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "email",
                label: "email",
                width: "250pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "phoneNumber",
                label: "เบอร์โทร",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "address",
                label: "ที่อยู่",
                width: "250pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
        ]
        this.actions = {
            isOfficial: false,
            isBan: false,
            isApprove: false,
            isUnApprove: false,
            isSelect: false,
            isCreate: true,
            isEdit: false,
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
        this.fields = [
            {
                name: "ชื่อผู้ใช้งาน",
                field: "username",
                type: "text",
                placeholder: "",
                required: true,
                disabled: false
            },
            {
                name: "รหัสผ่าน",
                field: "password",
                type: "password",
                placeholder: "",
                required: true,
                disabled: false
            },
            {
                name: "ชื่อ",
                field: "firstName",
                type: "text",
                placeholder: "",
                required: true,
                disabled: false
            },
            {
                name: "นามสกุล",
                field: "lastName",
                type: "text",
                placeholder: "",
                required: true,
                disabled: false
            },
            {
                name: "email",
                field: "email",
                type: "text",
                placeholder: "",
                required: true,
                disabled: false
            },
            {
                name: "เบอร์โทร",
                field: "phoneNumber",
                type: "integer",
                placeholder: "",
                required: false,
                disabled: false
            },
            {
                name: "ที่อยู่",
                field: "address",
                type: "textarea",
                placeholder: "",
                required: false,
                disabled: false
            }
        ];
        this.dataForm = new User();
        this.dataForm.password = "";
        this.dataForm.firstName = "";
        this.dataForm.lastName = "";
        this.dataForm.email = "";
    }

    public clickCreateForm(): void {
        this.drawer.toggle();
        this.setFields();
    }

    public clickEditForm(data: any): void {
        this.drawer.toggle();
        this.dataForm = JSON.parse(JSON.stringify(data));
    }

    public clickSave(): void {
        if (this.dataForm.id !== undefined && this.dataForm.id !== null) {
            this.userFacade.edit(this.dataForm.id, this.dataForm).then((res: any) => {
                let index = 0;
                let data = this.table.data;
                for (let d of data) {
                    if (d.id == res.id) {
                        data[index] = res;
                        break;
                    }
                    index++;
                }
                this.table.setTableConfig(data);
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        } else {
            this.userFacade.create(this.dataForm).then((res: any) => {
                this.table.data.push(res);
                this.table.setTableConfig(this.table.data);
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.data.message);
            });
        }
    }

    public clickDelete(data: any): void {
        let cloneData = JSON.parse(JSON.stringify(data));
        cloneData.deleteFlag = 1;
        this.userFacade.delete(cloneData.id).then((res) => {
            let index = 0;
            let dataTable = this.table.data;
            for (let d of dataTable) {
                if (d.id == cloneData.id) {
                    dataTable[index] = cloneData;
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
}
