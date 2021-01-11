/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchFilter } from '../../../models/SearchFilter';
import { PageCategory } from '../../../models/PageCategory';
import { PageCategoryFacade } from '../../../services/facade/PageCategoryFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';

const PAGE_NAME: string = "pagecategory";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-pagecategory-page',
    templateUrl: './PageCategoryPage.component.html'
})
export class PageCategoryPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public pageCategoryFacade: PageCategoryFacade;

    @ViewChild('myInput')
    myInputVariable: ElementRef;
    public dataForm: PageCategory;
    public valueBool: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: PageCategory;
    public submitted = false;


    public imagesAvatar: any;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public imageName: string = '';
    public value: string = '';

    constructor(pageCategoryFacade: PageCategoryFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.pageCategoryFacade = pageCategoryFacade;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.fieldTable = [
            {
                name: "image",
                label: "รูปภาพ",
                width: "60pt",
                class: "", formatColor: false, formatImage: true,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "name",
                label: "ชื่อ",
                width: "200pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "description",
                label: "รายละเอียด",
                width: "500pt",
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
        this.dataForm = new PageCategory();
        this.dataForm.name = "";
        this.valueBool = true;
        this.dataForm.iconURL = "";
        this.imageName = '';
        this.valuetring = "";
        this.valueNum = 0;
        this.fileToUpload = null
        this.orinalDataForm = JSON.parse(JSON.stringify(this.dataForm));
    }

    public handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
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
        this.pageCategoryFacade.search(filter).then((res: any) => {
        }).catch((err: any) => {
        })
    }

    public clickEditForm(data: any): void {
        this.drawer.toggle();
        this.myInputVariable.nativeElement.value = "";
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
        this.dataForm.name = this.dataForm.name;
        if (this.orinalDataForm.name !== "") {
            if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
            } else {
                this.dataForm.asset = null;
            }
            this.pageCategoryFacade.edit(this.dataForm.id, this.dataForm).then((res: any) => {
                this.table.searchData();
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        } else {
            if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
            } else {
                this.dataForm.asset = null;
            }
            this.pageCategoryFacade.create(this.dataForm).then((res: any) => {
                this.table.searchData();
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        }
        this.setFields();
    }

    public clickDelete(data: any): void {
        this.pageCategoryFacade.delete(data.id).then((res) => {
            let index = 0;
            let dataTable = this.table.data;
            for (let d of dataTable) {
                if (d.name == data.name) {
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
