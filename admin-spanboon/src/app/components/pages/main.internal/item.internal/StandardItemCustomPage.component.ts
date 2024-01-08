/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchFilter } from '../../../../models/SearchFilter';
import { StandardItemCustom } from '../../../../models/StandardItemCustom';
import { StandardItemReqApproveRequest } from '../../../../models/StandardItemReqApproveRequest';
import { StandardItemFacade } from '../../../../services/facade/StandardItemFacade.service';
import { StandardCustomItemFacade } from '../../../../services/facade/StandardCustomItemFacade.service';
import { StandardItemCategoryFacade } from '../../../../services/facade/StandardItemCategoryFacade.service';
import { AbstractPage } from '../../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../../services/AuthenManager.service';
import { Router } from '@angular/router';

const PAGE_NAME: string = "itemcustomer";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-StandardItemRE-page',
    templateUrl: './StandardItemCustomPage.component.html'
})
export class StandardItemCustomPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    @ViewChild('table')
    myInputVariable: ElementRef;

    public standardItemFacade: StandardItemFacade;
    public standardCustomItemFacade: StandardCustomItemFacade;
    public standardItemCategoryFacade: StandardItemCategoryFacade;

    public dataForm: StandardItemCustom;
    public valueBool: boolean;
    public cat: boolean;
    public valuetring: string;
    public valueNum: number;
    public hashtagList: any[];
    public StandardItemList: any[];
    public standardItemIds: any[];
    public orinalDataForm: StandardItemCustom;
    public submitted = false;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public imageName: string = '';

    constructor(standardCustomItemFacade: StandardCustomItemFacade, standardItemFacade: StandardItemFacade, standardItemCategoryFacade: StandardItemCategoryFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.standardItemFacade = standardItemFacade;
        this.standardCustomItemFacade = standardCustomItemFacade;
        this.standardItemCategoryFacade = standardItemCategoryFacade;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.fieldTable = [
            {
                name: "select",
                label: "เลือก",
                width: "10pt",
                class: "",
                select: true,
                formatColor: false,
                formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "name",
                label: "ชื่อ",
                width: "100pt",
                class: "",
                formatColor: false,
                formatImage: false,
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
                align: "center"
            },
            {
                name: "unit",
                label: "หน่วย",
                width: "100pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "stName",
                label: "จัดอยู่ใน",
                width: "100pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
        ];
        this.actions = {
            isOfficial: false,
            isBan: true,
            isApprove: false,
            isUnApprove: false,
            isSelect: true,
            isCreate: false,
            isEdit: false,
            isDelete: false,
            isComment: false,
            isBack: false,
            isPreview: false,
        };
        this.setFields();
        this.cat = false
    }

    public ngOnInit() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.count = false;
        filter.orderBy = {}
        this.standardItemFacade.search(filter).then((res: any) => {
            this.StandardItemList = res
        }).catch((err: any) => {
        })
        this.standardItemCategoryFacade.search(filter).then((res: any) => {
            this.hashtagList = res
        }).catch((err: any) => {
        })
    }

    public handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
    }

    public clickSwits() {
        this.cat = !this.cat
    }

    public handleInputChange(e) {
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

    private setFields(): void {
        this.dataForm = new StandardItemCustom();
        this.dataForm.name = "";
        this.dataForm.description = "";
        this.fileToUpload = null
        this.orinalDataForm = JSON.parse(JSON.stringify(this.dataForm));
    }

    public search() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.orderBy = {}
        this.standardCustomItemFacade.search(filter).then((res: any) => {
        }).catch((err: any) => {
        })
    }

    public create(data: any) {
        console.log('this.myInputVariable >>> ', this.myInputVariable);
        this.standardItemIds = data
        // this.myInputVariable.nativeElement.value = "";
        this.setFields();
        this.drawer.toggle();
    }

    public clickSave(): void {
        this.submitted = true;
        if (this.dataForm.name === "") {
            return;
        }
        this.dataForm.name = this.dataForm.name;
        this.dataForm.items = this.standardItemIds;
        this.dataForm.description = this.dataForm.description;
        if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
            this.dataForm.imageURL = "/file/5f1003e1c8503530c0ec31f10"
            this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
        } else {
            this.dataForm.asset = null;
        }
        this.standardCustomItemFacade.create(this.dataForm).then((res: any) => {
            this.table.data.push(res);
            this.table.searchData();
            this.table.setTableConfig(this.table.data);
            this.submitted = false;
            this.drawer.toggle();
        }).catch((err: any) => {
            this.dialogWarning(err.error.message);
        });
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

    public clickDelete() {

    }
}
