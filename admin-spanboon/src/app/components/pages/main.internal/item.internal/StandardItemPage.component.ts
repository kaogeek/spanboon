/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchFilter } from '../../../../models/SearchFilter';
import { StandardItem } from '../../../../models/StandardItem';
import { StandardItemFacade } from '../../../../services/facade/StandardItemFacade.service';
import { StandardItemCategoryFacade } from '../../../../services/facade/StandardItemCategoryFacade.service';
import { AbstractPage } from '../../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../../services/AuthenManager.service';
import { Router } from '@angular/router';

const PAGE_NAME: string = "item";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-standarditem-page',
    templateUrl: './StandardItemPage.component.html'
})
export class StandardItemPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @ViewChild('myInput')
    myInputVariable: ElementRef;

    public standardItemFacade: StandardItemFacade;
    public standardItemCategoryFacade: StandardItemCategoryFacade;

    public dataForm: StandardItem;
    public valueBool: boolean;
    public statusImg: boolean;
    public valuetring: string;
    public valueNum: number;
    public hashtagList: any[]
    public orinalDataForm: StandardItem;
    public submitted = false;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public imageName: string = '';
    public value: string = '';

    constructor(standardItemFacade: StandardItemFacade, standardItemCategoryFacade: StandardItemCategoryFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.standardItemFacade = standardItemFacade;
        this.standardItemCategoryFacade = standardItemCategoryFacade;
        // if (!authenManager.isCurrentUserType()) {
        //     router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.statusImg = true
        this.fieldTable = [
            {
                name: "image",
                label: "รูปภาพ",
                width: "50pt",
                class: "",
                link: [],
                formatColor: false,
                formatImage: true,
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "name",
                label: "ชื่อ",
                width: "450pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "unit",
                label: "หน่วย",
                width: "10pt",
                class: "",
                link: [],
                formatColor: false,
                formatImage: false,
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
            isBack: false
        };
        this.setFields();
    }

    public ngOnInit() {
        this.search();
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.count = false;
        filter.orderBy = {}
        this.standardItemCategoryFacade.search(filter).then((res: any) => {
            this.hashtagList = res
        }).catch((err: any) => {
        })
    }

    private setFields(): void {
        this.dataForm = new StandardItem();
        this.dataForm.name = "";
        this.dataForm.unit = "";
        this.dataForm.category = '';
        this.valueBool = true;
        this.imageName = '';
        this.valuetring = "";
        this.statusImg = true;
        this.valueNum = 0;
        this.fileToUpload = null
        this.orinalDataForm = JSON.parse(JSON.stringify(this.dataForm));
    }

    public handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
    }

    public handleInputChange(e) {
        var _URL = window.URL;
        this.fileToUpload = e.target.files;
        var img = new Image();
        var objectUrl = _URL.createObjectURL(this.fileToUpload[0]);
        let self = this;
        img.onload = function () {
            if (img.width === 60 || img.height === 60) {
                self.statusImg = true
            } else {
                alert('กรุณาอัพรูปขนาด 60*60 เท่านั้น');
                self.statusImg = false
            }
        };
        img.src = objectUrl;
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
        this.myInputVariable.nativeElement.value = "";
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
        this.standardItemFacade.search(filter).then((res: any) => {
        }).catch((err: any) => {
        })
    }

    public clickEditForm(data: any): void {
        this.setFields();
        this.myInputVariable.nativeElement.value = "";
        this.drawer.toggle();
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
        this.dataForm = JSON.parse(JSON.stringify(data));
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
    }

    public clickSave(): void {
        this.submitted = true;
        if (this.dataForm.name === "") {
            return;
        }
        if (this.dataForm.unit === "") {
            return;
        }
        if (this.statusImg === false) {
            return;
        }
        this.dataForm.name = this.dataForm.name;
        this.dataForm.unit = this.dataForm.unit;
        this.imageName = this.imageName;
        if (this.orinalDataForm.name !== "") {
            if (Array.isArray(this.dataForm.category)) {
                this.dataForm.category = ''
            }
            if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                this.dataForm.imageURL = "/file/5f1003e1c8503530c0ec31f10"
                this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
            } else {
                this.dataForm.asset = null;
            }
            this.standardItemFacade.edit(this.dataForm._id, this.dataForm).then((res: any) => {
                this.table.searchData();
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        } else {
            if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                this.dataForm.imageURL = "/file/5f1003e1c8503530c0ec31f10"
                this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
            } else {
                this.dataForm.asset = null;
            }

            this.standardItemFacade.create(this.dataForm).then((res: any) => {
                this.table.searchData();
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        }
    }

    public clickDelete(data: any): void {
        this.standardItemFacade.delete(data._id).then((res) => {
            let index = 0;
            let dataTable = this.table.data;
            for (let d of dataTable) {
                if (d.name == data.name) {
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
