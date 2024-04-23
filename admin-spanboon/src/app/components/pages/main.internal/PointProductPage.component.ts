/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { Page } from '../../../models/Page';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { PointMFP } from '../../../models/PointMFP';
import { PointFacade } from '../../../services/facade/PointFacade.service';
import { PointProductFacade } from '../../../services/facade/PointProductFacade.service';
import { PointCategoryFacade } from '../../../services/facade/PointCategoryFacade.service';
import { Asset } from '../../../models/Asset';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

const PAGE_NAME: string = "pointproduct";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'point-product-page',
    templateUrl: './PointProductPage.component.html'
})
export class PointProductPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    protected baseURL: string;
    private authenManager: AuthenManager;
    private router: Router;
    public pointFacade: PointFacade;
    public pointProductFacade: PointProductFacade;
    public pointCategoryFacade: PointCategoryFacade;
    public isSave: boolean = false;
    public isLoading: boolean = false;

    public dataForm: PointMFP;
    public orinalDataForm: Page;
    public submitted = false;
    public orderBy: any = {};
    public edit: boolean = false;
    public coverPageUrl: any;
    public imageCoverSize: number;
    public image: any = {};
    public listCondition: any[] = [];
    public form: FormGroup;
    // public category: any[] = [];
    public categoryGroup: FormGroup;
    public dataCategory: any[] = [];

    constructor(router: Router,
        dialog: MatDialog,
        authenManager: AuthenManager,
        pointFacade: PointFacade,
        pointProductFacade: PointProductFacade,
        pointCategoryFacade: PointCategoryFacade,
        private fb: FormBuilder,) {
        super(PAGE_NAME, dialog);
        this.router = router;
        this.authenManager = authenManager;
        this.pointFacade = pointFacade;
        this.pointProductFacade = pointProductFacade;
        this.pointCategoryFacade = pointCategoryFacade;
        this.orderBy = { createdDate: -1 };
        this.baseURL = environment.apiBaseURL;
        this.fieldTable = [
            {
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
                name: "title",
                label: "หัวข้อ",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "detail",
                label: "รายละเอียด",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "point",
                label: "จำนวนพอยท์",
                width: "60pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "maximumLimit",
                label: "ลิมิตการแลก",
                width: "60pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            }
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
        this._getCategory();
        this.form = this.fb.group({
            conditions: this.fb.array([])
        });
        this.categoryGroup = this.fb.group({
            category: [null, Validators.required]
        });
    }

    private setFields(data?): void {
        if (!!data) {
            this.dataForm.id = data.id;
            this.dataForm.title = data.title;
            this.dataForm.detail = data.detail;
            this.dataForm.point = data.point;
            this.dataForm.limit = data.maximumLimit;
            this.dataForm.expiredDate = data.expiringDate;
            this.dataForm.activeDate = data.activeDate;
            this.dataForm.coverPageURL = data.coverPageURL;
            this.dataForm.pin = data.pin;
            const toSelect = this.dataCategory.find((value) => value.title === data.categoryName);
            this.categoryGroup.get('category').setValue(toSelect);
            this.image = {
                assetId: data.assetId,
                coverPageURL: data.coverPageURL,
                s3CoverPageURL: data.s3CoverPageURL
            };
            if (data.condition.length > 0) {
                for (const item of data.condition) {
                    this.addCondition(item);
                }
            }
        } else {
            this.dataForm = new PointMFP();
            this.dataForm.title = "";
            this.dataForm.detail = "";
            this.dataForm.point = null;
            this.dataForm.limit = null;
            this.dataForm.coverPageURL = "";
            this.dataForm.pin = false;
            this.image = {};
        }
        this.orinalDataForm = JSON.parse(JSON.stringify(this.dataForm));
    }

    public conditions() {
        return this.form.get('conditions') as FormArray;
    }

    public addCondition(value?) {
        this.conditions().push(this.newCondition(!!value ? value : ''));
    }

    public newCondition(value?): FormGroup {
        return this.fb.group({
            value: [!!value ? value : ''],
        });
    }

    public removeCondition(index: number) {
        this.conditions().removeAt(index);
    }

    public clickCloseDrawer(): void {
        let pass = true;
        for (const key in this.orinalDataForm) {
            if (this.orinalDataForm[key] !== this.dataForm[key]) {
                pass = false;
                break;
            }
        }
        if (this.dataForm.title === "" ||
            this.dataForm.detail === "" ||
            this.dataForm.point === null ||
            this.dataForm.limit === null ||
            this.dataForm.coverPageURL === "") {
            pass = true;
        }
        if (!pass) {
            let dialogRef = this.dialog.open(DialogWarningComponent, {
                data: {
                    title: "คุณมีข้อมูลที่ยังไม่ได้บันทึกต้องการปิดหรือไม่"
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    if (result) {
                        this.setFields();
                        this._removeFormConditions();
                        this.edit = false;
                        this.drawer.toggle();
                    }
                }
            });
        } else {
            this.setFields();
            this._removeFormConditions();
            this.edit = false;
            this.drawer.toggle();
        }
    }

    private _removeFormConditions() {
        while (this.conditions().value.length > 0) {
            this.conditions().removeAt(0);
        }
        this.categoryGroup.get('category').setValue('');
    }

    public clickCreateForm(): void {
        this.setFields();
        this.drawer.toggle();
    }

    public clickEditForm(data: any): void {
        this.setFields(data);
        this.drawer.toggle();
        this.edit = true;
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
    }

    public clickDelete(data: any): void {
        this.pointProductFacade.delete(data.id).then((res) => {
            let index = 0;
            let dataTable = this.table.data;
            for (let d of dataTable) {
                if (d.id == data.id) {
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

    public clickSave(): void {
        if (!this.image.assetId) {
            return this.dialogWarning('กรุณาเพิ่มรูปภาพหน้าปก');
        }
        if (!this.dataForm.title || this.dataForm.title.trim() === '') {
            return this.dialogWarning('กรุณาใส่หัวข้อ');
        }
        if (!this.dataForm.detail || this.dataForm.detail.trim() === '') {
            return this.dialogWarning('กรุณาใส่รายละเอียด');
        }
        if (!this.dataForm.point) {
            return this.dialogWarning('กรุณาใส่จำนวนพอยท์');
        }
        if (!this.dataForm.limit) {
            return this.dialogWarning('กรุณาใส่ลิมิตการแลก');
        }
        if (!this.categoryGroup.get('category').value) {
            return this.dialogWarning('กรุณเลือกหมวกหมู่');
        }
        if (this.conditions().value.length === 0) {
            return this.dialogWarning('กรุณาเพิ่มเงื่อนไข');
        } else {
            for (let index = 0; index < this.conditions().value.length; index++) {
                if (this.conditions().value[index].value === '' || this.conditions().value[index].value.trim() === '') {
                    return this.dialogWarning('กรุณาระบุเงื่อนไขข้อที่ ' + (index + 1));
                }
            }
        }

        let condition: any[] = [];
        if (!!this.conditions().value) {
            for (let item of this.conditions().value) {
                condition.push(item.value);
            }
        }

        let value = {
            title: this._trimValue(this.dataForm.title),
            detail: this._trimValue(this.dataForm.detail),
            point: this.dataForm.point,
            maximumLimit: this.dataForm.limit,
            condition: condition,
            assetId: this.image.assetId,
            coverPageURL: this.image.coverPageURL,
            s3CoverPageURL: this.image.s3CoverPageURL,
            categoryName: this.categoryGroup.get('category').value.title,
            categoryId: this.categoryGroup.get('category').value.id,
            expiringDate: this.dataForm.expiredDate,
            activeDate: this.dataForm.activeDate,
            pin: this.dataForm.pin ? true : false,
            couponExpire: -1,
            receiver: 0
        };
        if (this.edit) {
            this.pointProductFacade.update(value, this.dataForm.id).then((res) => {
                if (res) {
                    this.setFields();
                    this._removeFormConditions();
                    this.table.searchData();
                    this.edit = false;
                    this.drawer.toggle();
                }
            }).catch((err) => {
                if (err) { }
            });
        } else {
            this.pointProductFacade.create(value).then((res) => {
                if (res) {
                    this.setFields();
                    this._removeFormConditions();
                    this.table.searchData();
                    this.edit = false;
                    this.drawer.toggle();
                }
            }).catch((err) => {
                if (err) { }
            });
        }
    }

    private _trimValue(text) {
        const data = text;
        const trimData = data.trim().replace(/\s+/g, ' ');
        return trimData;
    }

    public onFileSelect(event) {
        this.isLoading = true;
        let files = event.target.files[0];
        if (files.length === 0) {
            return;
        }
        if (files) {
            const reader = new FileReader();
            reader.onload = (events: any) => {
                this.imageCoverSize = files.size;
                let img64 = events.target.result;
                let datas = img64.split(',');
                const asset = new Asset();
                asset.mimeType = files.type;
                asset.data = datas[1];
                asset.size = files.size;
                asset.fileName = files.name;
                let temp = {
                    asset
                }
                this.pointFacade.upload(temp).then((res: any) => {
                    if (res) {
                        this.image.assetId = res.data.id;
                        this.image.coverPageURL = '/file/' + res.data.id;
                        this.image.s3CoverPageURL = res.data.s3FilePath;
                        this.isLoading = false;
                    }
                }).catch((err: any) => {
                    this.isLoading = false;
                })
            }
            reader.readAsDataURL(files);
        }
    }

    private async _getCategory() {
        this.dataCategory = await this.pointCategoryFacade.search();
    }

    public onChange($event) {
        this.dataForm.category = {
            id: $event.value.id,
            title: $event.value.title
        }
    }

    public saveDate(event: any, type: any): void {
        const inputDate = new Date(event.value);
        const isoDateString = inputDate.toISOString();
        if (type === 'active') {
            this.dataForm.activeDate = isoDateString;
        } else {
            this.dataForm.expiredDate = isoDateString;
        }
    }
}
