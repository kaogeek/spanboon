/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { SearchFilter } from '../../../models/SearchFilter';
import { Config } from '../../../models/Config';
import { ConfigFacade } from '../../../services/facade/ConfigFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';

const PAGE_NAME: string = "config";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-config-page',
    templateUrl: './ConfigPage.component.html'
})
export class ConfigPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public configFacade: ConfigFacade;
    private authenManager: AuthenManager;
    private router: Router;

    public dataForm: Config;
    public valueBool: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: Config;
    public submitted = false;

    constructor(configFacade: ConfigFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.configFacade = configFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.fieldTable = [
            {
                name: "name",
                label: "ชื่อ Config",
                width: "200pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "type",
                label: "ประเภท Config",
                width: "200pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "value",
                label: "ค่า Config",
                width: "300pt",
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
        this.search();
    }

    private setFields(): void {
        this.dataForm = new Config();
        this.dataForm.name = "";
        this.dataForm.type = "boolean";
        this.dataForm.value = "";
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
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.count = false;
        filter.orderBy = {}
        this.configFacade.search(filter).then((res: any) => {
        }).catch((err: any) => {
        })
    }

    public clickEditForm(data: any): void {
        this.drawer.toggle();
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
        this.dataForm = JSON.parse(JSON.stringify(data));
        if (data.type === "boolean") {
            this.valueBool = JSON.parse(this.dataForm.value);
        }
        if (data.type === "string") {
            this.valuetring = this.dataForm.value;
        }
        if (data.type === "number") {
            this.valueNum = JSON.parse(this.dataForm.value);
        }
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
    }

    public clickSave(): void {
        this.submitted = true;
        if (this.dataForm.name.trim() === "") {
            return;
        }
        if (this.dataForm.type === "boolean") {
            this.dataForm.value = JSON.stringify(this.valueBool);
        }
        if (this.dataForm.type === "string") {
            this.dataForm.value = this.valuetring;
        }
        if (this.dataForm.type === "number") {
            this.dataForm.value = JSON.stringify(this.valueNum);
        }
        this.dataForm.name = this.dataForm.name.trim();
        if (this.orinalDataForm.name.trim() !== "") {
            this.configFacade.edit(this.dataForm.name, this.dataForm).then((res: any) => {
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
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        } else {
            this.configFacade.create(this.dataForm).then((res: any) => {
                this.table.data.push(res);
                this.table.setTableConfig(this.table.data);
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        }
    }

    public clickDelete(data: any): void {
        this.configFacade.delete(data.name).then((res) => {
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
