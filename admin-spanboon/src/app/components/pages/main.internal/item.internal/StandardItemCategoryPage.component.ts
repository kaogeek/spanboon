/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchFilter } from '../../../../models/SearchFilter';
import { ValidateStandardItemCategoryRequest } from '../../../../models/ValidateStandardItemCategoryRequest';
import { StandardItemCategory } from '../../../../models/StandardItemCategory';
import { StandardItemCategoryFacade } from '../../../../services/facade/StandardItemCategoryFacade.service';
import { AbstractPage } from '../../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

const PAGE_NAME: string = "itemcategory";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-standarditemcategory-page',
    templateUrl: './StandardItemCategoryPage.component.html'
})
export class StandardItemCategoryPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    @ViewChild('myInput')
    myInputVariable: ElementRef;

    public standardItemCategoryFacade: StandardItemCategoryFacade;

    public dataForm: StandardItemCategory;
    public validate: ValidateStandardItemCategoryRequest;
    public valueBool: boolean;
    public statusBool: boolean;
    public statusImg: boolean;
    public valuetring: string;
    public successText: string;
    public erorrText: string;
    public valueNum: number;
    public orinalDataForm: StandardItemCategory;
    public submitted = false;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public imageName: string = '';
    public value: string = '';

    myControl: FormControl = new FormControl();
    filteredOptions: Observable<string[]>;

    public options: any

    constructor(standardItemCategoryFacade: StandardItemCategoryFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.standardItemCategoryFacade = standardItemCategoryFacade;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.statusImg = true
        this.fieldTable = [{
            name: "image",
            label: "รูปภาพ",
            width: "60pt",
            class: "", formatColor: false, formatImage: true,
            link: [],
            formatDate: false,
            formatId: false,
            align: "center"
        },
        {
            name: "name",
            label: "ชื่อ",
            width: "400pt",
            class: "", formatColor: false, formatImage: false,
            link: [],
            formatDate: false,
            formatId: false,
            align: "left"
        },
        {
            name: "description",
            label: "รายละเอียด",
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
        setTimeout(() => {
            this.filteredOptions = this.myControl.valueChanges
                .pipe(
                    startWith(''),
                    map(val => this.filter(val))
                );

        }, 500);
    }

    filter(val: string): string[] {
        return this.options.map(x => x.name).filter(option =>
            option.toLowerCase().includes(val.toLowerCase()));
    }

    private setFields(): void {
        this.dataForm = new StandardItemCategory();
        this.dataForm.name = "";
        this.dataForm.description = "";
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
        this.statusBool = false
        this.successText = null
        this.erorrText = null
        this.fileToUpload = null
        this.statusImg = true;
        this.imageName = null
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
        this.myInputVariable.nativeElement.value = "";
        this.drawer.toggle();
    }

    public async search() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.orderBy = {}
        await this.standardItemCategoryFacade.search(filter).then((res: any) => {
            this.options = res
        }).catch((err: any) => {
        })
    }

    public clickEditForm(data: any): void {
        this.setFields();
        this.myInputVariable.nativeElement.value = "";
        this.search();
        this.drawer.toggle();
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
        this.dataForm = JSON.parse(JSON.stringify(data));
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
        if (this.dataForm.parent != null && this.dataForm.parent != undefined) {
            let index = this.options.map(function (e) { return e.id; }).indexOf(this.dataForm.parent);
            if (index < 0) {
                this.dataForm.parent = null
            } else {
                this.dataForm.parent = this.options[index].name
            }
        }
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

    public clickSave(): void {
        this.submitted = true;
        if (this.dataForm.name === "") {
            return;
        }
        if (this.statusImg === false) {
            return;
        }
        console.log('this.statusImg', this.statusImg)
        this.dataForm.name = this.dataForm.name;
        if (this.orinalDataForm.name !== "") {
            let va = this.testVaridate(this.dataForm.parent);
            if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
            } else {
                this.dataForm.asset = null;
            }
            this.standardItemCategoryFacade.edit(this.dataForm.id, this.dataForm).then((res: any) => {
                this.table.searchData();
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        } else {
            let index = this.options.map(function (e) { return e.id; }).indexOf(this.dataForm.parent);
            if (index < 0) {
                this.validateStandardItemCategory(null, this.dataForm.parent);
            } else {
                this.dataForm.parent = this.options[index].id
            }
            if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
            } else {
                this.dataForm.asset = null;
            }
            this.standardItemCategoryFacade.create(this.dataForm).then((res: any) => {
                this.table.searchData();
                this.submitted = false;
                this.drawer.toggle();
            }).catch((err: any) => {
                this.dialogWarning(err.error.message);
            });
        }
    }

    public validateStandardItemCategory(item, parent): any {
        this.validate = new ValidateStandardItemCategoryRequest
        this.validate.item = item
        let Arr = this.options.map(function (e) { return e.id; }).indexOf(parent);
        if (Arr < 0) {
            this.validate.parent = parent
        } else {
            this.validate.parent = parent
            parent = this.options[Arr].name
        }
        this.standardItemCategoryFacade.validateStandardItemCategory(this.validate).then((res: any) => {
            if (res) {
                this.erorrText = null
                this.successText = "สามารถเพิ่ม" + this.dataForm.name + "เข้า" + parent + "ได้"
            } else {
                this.successText = null
                this.erorrText = "ไม่สามารถเพิ่ม" + this.dataForm.name + "เข้า" + parent + "ได้"
            }
            return res
        }).catch((err) => {
            this.erorrText = "ไม่สามารถเพิ่ม" + this.dataForm.name + "เข้า" + parent + "ได้"
        });
    }

    public testVaridate(data?: any): void {
        let item
        let parent
        this.validate = new ValidateStandardItemCategoryRequest();
        let Arr = this.options.map(function (e) { return e.name; }).indexOf(data);

        if (Arr < 0) {
            parent = this.dataForm.parent
        } else {
            parent = this.options[Arr].id
            this.dataForm.parent = this.options[Arr].id
        }
        if (this.dataForm.id != null && this.dataForm.id != undefined) {
            if (this.dataForm.name != null && this.dataForm.name != undefined) {
                item = this.dataForm.id
                let vas = this.validateStandardItemCategory(item, parent);
            } else {
                let vas = this.validateStandardItemCategory(item, parent);
            }
        }

    }

    public clickDelete(data: any): void {
        this.standardItemCategoryFacade.delete(data.id).then((res) => {
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
