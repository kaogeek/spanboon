/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { Config } from '../../../models/Config';
import { BanRequest } from '../../../models/BanRequest';
import { PageUserFacade } from '../../../services/facade/PageUserFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { PageUser } from '../../../models/PageUser';
import { Router } from '@angular/router';

const PAGE_NAME: string = "useradmin";

@Component({
    selector: 'admin-user-Admin-page',
    templateUrl: './UserAdminPage.component.html'
})
export class UserAdminPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public pageUserFacade: PageUserFacade;
    private authenManager: AuthenManager;
    private router: Router;

    public fieldSearch: string[];

    public dataForm: PageUser;
    public valueBool: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: PageUser;
    public submitted = false;

    constructor(pageUserFacade: PageUserFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.pageUserFacade = pageUserFacade;
        this.router = router;
        this.authenManager = authenManager;
        this.fieldSearch = [
            "email",
        ]
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
                name: "email",
                label: "อีเมล",
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
                width: "200pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "lastName",
                label: "นามสกุล",
                width: "200pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
        ];
        this.actions = {
            isOfficial: false,
            isBan: true,
            isApprove: false,
            isUnApprove: false,
            isSelect: false,
            isCreate: true,
            isEdit: false,
            isDelete: false,
            isComment: false,
            isBack: false
        };
        this.setFields();
    }

    public ngOnInit() {
    }

    private setFields(): void {
        this.dataForm = new PageUser();
        this.dataForm.email = "";
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

    public clickSave(): void {
        this.submitted = true;
        this.dataForm.email = this.dataForm.email.trim();
        this.pageUserFacade.register(this.dataForm).then((res: any) => {
            this.table.data.push(res);
            this.table.searchData;
            this.submitted = false;
            this.drawer.toggle();
        }).catch((err: any) => {
            this.dialogWarning(err.error.message);
        });

    }

    public clickCreateForm(): void {
        this.setFields();
        this.drawer.toggle();
    }

    public clickBan(data: any): void {
        let bp = new BanRequest();

        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: data.banned ? "คุณต้องการยกเลิกระงับการใช้งานหรือไม่" : "คุณต้องการระงับการใช้งานหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (data.banned === null || data.banned === undefined || data.banned === '' || data.banned === false) {
                    bp.banned = true
                    this.pageUserFacade.ban(data.id, bp).then((res: any) => {
                        this.table.searchData();
                        this.dialogWarning("ระงับการใช้งานสำเร็จ");
                    }).catch((err: any) => {
                        this.dialogWarning(err.error.message);
                    });
                } else {
                    bp.banned = false
                    this.pageUserFacade.ban(data.id, bp).then((res: any) => {
                        this.table.searchData();
                        this.dialogWarning("ยกเลิกระงับการใช้งานสำเร็จ");
                    }).catch((err: any) => {
                        this.dialogWarning(err.error.message);
                    });
                }
            }
        });
    }
}
