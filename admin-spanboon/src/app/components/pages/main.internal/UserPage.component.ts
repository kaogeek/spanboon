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
import { UserFacade } from '../../../services/facade/UserFacade.service'
const PAGE_NAME: string = "user";

@Component({
    selector: 'admin-user-page',
    templateUrl: './UserPage.component.html'
})
export class UserPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public pageUserFacade: PageUserFacade;
    private authenManager: AuthenManager;
    private router: Router;
    private userFacade: UserFacade;
    public fieldSearch: string[];

    public dataForm: PageUser;
    public valueBool: boolean;
    public DisplayName: any;
    public Passw: any;
    public isGender: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: PageUser;
    public submitted = false;
    public url: any;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public imageName: string = '';
    public value: string = '';

    constructor(pageUserFacade: PageUserFacade,
        router: Router,
        dialog: MatDialog,
        authenManager: AuthenManager,
        userFacade: UserFacade) {
        super(PAGE_NAME, dialog);
        this.pageUserFacade = pageUserFacade;
        this.router = router;
        this.isGender = false
        this.authenManager = authenManager;
        this.userFacade = userFacade;
        this.fieldSearch = [
            "username"
        ]
        this.fieldTable = [
            {
                name: "image",
                label: "รูป",
                width: "60pt",
                class: "", formatColor: false, formatImage: true,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
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
                name: "isAdmin",
                label: "Admin",
                width: "50pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
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
            isDelete: true,
            isComment: false,
            isBack: false
        };
        this.setFields();
    }

    public ngOnInit() {
    }

    public handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
    }

    public handleInputChange(e) {
        if (e.target.files && e.target.files[0]) {
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]); // read file as data url
            reader.onload = (e) => { // called once readAsDataURL is completed
                this.url = (<FileReader>e.target).result;
            }
        }
        this.fileToUpload = e.target.files;
        this.imageName = e.target.files[0].name
        var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        var pattern = /image-*/;
        var reader = new FileReader();
        if (!file.type.match(pattern)) {
            alert('invalid format');
            return;
        }
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsDataURL(file);
    }
    public _handleReaderLoaded(e) {
        let reader = e.target;
        this.imageSrc = reader.result.substr(reader.result.indexOf(',') + 1);
    }

    onGender(event) {
        if (event.value === "opGender") {
            this.isGender = true
        } else {
            this.isGender = false
            this.dataForm.gender = event.value
        }
    }

    private setFields(): void {
        this.dataForm = new PageUser();
        this.dataForm.email = "";
        this.dataForm.displayName = "";
        this.dataForm.password = "";
        this.imageName = null
        this.url = null
        this.fileToUpload = null
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
        if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
            this.dataForm.imageURL = "/file/5f1003e1c8503530c0ec31f10"
            this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
        } else {
            this.dataForm.asset = null;
        }
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
    public clickDelete(data: any): void {
        this.userFacade.deleteuser(data.id).then((res) => {
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
