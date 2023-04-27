/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchFilter } from '../../../models/SearchFilter';
import { EmergencyEvent } from '../../../models/EmergencyEvent';
import { EmergencyEventFacade } from '../../../services/facade/EmergencyEventFacade.service';
import { HashTagFacade } from '../../../services/facade/HashTagFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { TodayPageFacade } from '../../../services/facade/TodayPageFacade.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { DialogAlert } from '../../shares/DialogAlert.component';

const PAGE_NAME: string = "todayV2";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;


@Component({
    selector: 'admin-today-page',
    templateUrl: './TodayPageV2.component.html'
})
export class TodayPageV2 extends AbstractPage implements OnInit {
    debouncedValue = "";
    public value_data = new FormControl();
    private unsubscriber = new Subject<void>();

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public emergencyEventFacade: EmergencyEventFacade;
    public todayPageFacade: TodayPageFacade;
    public hashTagFacade: HashTagFacade;
    private authenManager: AuthenManager;
    private router: Router;
    public createdName: any;
    public dataForm: EmergencyEvent;
    public valueBool: boolean;
    private imageSrc: string = '';
    public value: string = '';
    public ordering: number;
    public isSave: boolean = false;
    public position: number;
    public typeBucket: any = [{ value: 'page' }, { value: 'post' }, { value: 'hashtag' }];
    public titleBucket: any = [{ value: 'ก้าวไกลวันนี้' }, { value: 'ก้าวไกลทั่วไทย' }, { value: 'สภาก้าวไกล' }, { value: 'ก้าวไกลรอบด้าน' }];
    public fieldBucket: any = [{ value: 'id' }, { value: 'group' }, { value: 'province' }];
    public empForm: FormGroup;
    public selectedPosition: number;
    public stackValue: any = [];
    public countArray: number = 1;
    public title: string;
    public limit: number = 10;
    public edit: string;
    public _id: string;
    public provinces;
    public default_province;
    public orderBy: any = {};
    public selectedValueType: string;
    public selectedValueField: string;
    public selectedValueTitle: string;
    public isLoading: boolean;
    public autoComp: any;
    public length: number;
    public reset: FormArray;
    public isPin: boolean;

    constructor(
        emergencyEventFacade: EmergencyEventFacade,
        todayPageFacade: TodayPageFacade,
        hashTagFacade: HashTagFacade,
        router: Router,
        dialog: MatDialog,
        authenManager: AuthenManager,
        private fb: FormBuilder,
        private location: Location) {
        super(PAGE_NAME, dialog);
        this.emergencyEventFacade = emergencyEventFacade;
        this.todayPageFacade = todayPageFacade;
        this.hashTagFacade = hashTagFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.fieldTable = [
            {
                name: "title",
                label: "ก้าวไกลหน้าหนึ่ง",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "position",
                label: "ตำแหน่ง",
                width: "100pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "type",
                label: "ประเภท",
                width: "100pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "field",
                label: "ฟิลด์",
                width: "100pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "bucket1",
                label: "ถัง 1",
                width: "180pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "bucket2",
                label: "ถัง 2",
                width: "180pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            }, {
                name: "bucket3",
                label: "ถัง 3",
                width: "180pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
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
            isBack: false
        };
        this.setFields();

    }
    public clickClose() {
        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณมีข้อมูลที่ยังไม่ได้บันทึกต้องการปิดหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.empForm.reset();
                this.selectedValueTitle = undefined;
                this.selectedValueType = undefined;
                this.selectedValueField = undefined;
                this.selectedPosition = undefined;
                this.limit = undefined;
                this.edit = undefined;
                while (this.buckets().length !== 0) {
                    this.buckets().removeAt(0)
                }
                this.drawer.toggle();
            }
        });
    }

    public ngOnInit() {
        this.getProvince();
        this.empForm = this.fb.group({
            buckets: this.fb.array([])
        });
        this.value_data.valueChanges
            .pipe(
                debounceTime(500)
                , takeUntil(this.unsubscriber)
            ).subscribe((value: any) => {
                this.debouncedValue = value;
                if ((this.selectedValueField !== 'count') && (this.selectedValueField !== 'score') && (this.selectedValueField !== 'province')) {
                    this.keyUpAutoComp(this.debouncedValue);
                }
            });
        this.searchBucket();
    }

    buckets() {
        return this.empForm.get('buckets') as FormArray;
    }

    newBucket(): FormGroup {
        return this.fb.group({
            name: [''],
            values: this.fb.array([]),
        });
    }

    addBucket() {
        this.buckets().push(this.newBucket());
    }

    removeBucket(bucketIndex: number) {
        this.buckets().removeAt(bucketIndex);
    }

    valueBucket(bucketIndex: number) {
        return this.buckets().at(bucketIndex).get('values') as FormArray;
    }

    addValueBucket(bucketIndex: number) {
        let c = this.buckets().at(bucketIndex).get('values') as FormArray;
        c.push(new FormControl(''));
    }

    removeValueBucket(bucketIndex: number, valueI: number) {
        this.valueBucket(bucketIndex).removeAt(valueI);
    }

    public getProvince() {
        this.todayPageFacade.getProvince().then((res) => {
            if (res) {
                this.provinces = res;
                this.default_province = res;
            }
        })
    }

    public searchBucket() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.count = false;
        filter.orderBy = {}
        this.todayPageFacade.search(filter).then((res: any) => {
        })
    }

    private setFields(): void {
        this.dataForm = new EmergencyEvent();
        this.dataForm.title = "";
        this.dataForm.detail = "";
        this.dataForm.coverPageURL = "";
        this.limit = 10;
        this.isPin = false;
        this.selectedPosition = undefined;
        this.dataForm.ordering = undefined;
    }

    public clickSave() {
        const id = this._id;
        if (this.selectedPosition > 5) {
            let dialogRef = this.dialog.open(DialogAlert, {
                data: {
                    title: "ช่องตำแหน่งไม่สามารถใส่เกิน 5 ได้",
                    isClose: false,
                    isConfirm: true,
                    confirm: {
                        text: "ตกลง"
                    }
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                }
            });

            return;
        }

        const result: any = {};
        result.title = this.selectedValueTitle;
        result.type = this.selectedValueType;
        result.field = this.selectedValueField;
        result.flag = this.isPin;
        result.limit = this.limit;
        result.buckets = this.empForm.value.buckets;
        result.position = this.selectedPosition;

        if ((result.field === 'count') || (result.field === 'score')) {
            result.buckets = [];
        }

        if (result.title === '') {
            return;
        } else if (result.type === '') {
            return;
        } else if (result.field === '') {
            return;
        } else if (result.limit === '' || result.limit === null || result.limit === undefined) {
            return;
        }

        if (this.empForm.value.buckets.length === 0 &&
            this.selectedValueField !== 'score' &&
            this.selectedValueField !== 'count'
        ) {
            let dialogRef = this.dialog.open(DialogAlert, {
                data: {
                    title: "กรุณาเพิ่มกลุ่มข้อมูล",
                    isClose: false,
                    isConfirm: true,
                    confirm: {
                        text: "ตกลง"
                    }
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                }
            });

            return;
        }
        if (this.edit === undefined) {
            this.todayPageFacade.create(result).then((res) => {
                this.table.searchData();
                while (this.buckets().length !== 0) {
                    this.buckets().removeAt(0)
                }
                this.selectedValueTitle = undefined;
                this.selectedValueType = undefined;
                this.selectedValueField = undefined;
                this.selectedPosition = undefined;
                this.limit = undefined;
                this.edit = undefined;
                this.drawer.toggle();
            })
        } else {
            this.todayPageFacade.edit(id, result).then((res) => {
                this.table.searchData();
                while (this.buckets().length !== 0) {
                    this.buckets().removeAt(0)
                }
                this.selectedValueTitle = undefined;
                this.selectedValueType = undefined;
                this.selectedValueField = undefined;
                this.selectedPosition = undefined;
                this.limit = undefined;
                this.edit = undefined;
                this.drawer.toggle();
            })
        }
    }

    public clickEditForm(data: any): void {
        this.setFields();
        this.drawer.toggle();
        let clickEdit = 'edit';
        this.edit = clickEdit;
        if (data.type === 'page') {
            this.fieldBucket = [{ value: 'id' }, { value: 'group' }, { value: 'province' }];
        } else if (data.type === 'post') {
            this.fieldBucket = [{ value: 'emergencyEvent' }, { value: 'objective' }, { value: 'score' }, { value: 'hashtag' }];
        } else {
            this.fieldBucket = [{ value: 'count' }];
        }
        this._id = data.id;
        this.selectedValueTitle = data.title;
        this.selectedValueType = data.type;
        this.selectedValueField = data.field;
        this.selectedPosition = data.position;
        this.todayPageFacade.searchComp(data).then((res) => {
            if (res) {
                if (data.buckets.length > 0) {
                    for (let i = 0; i < data.buckets.length; i++) {
                        this.buckets().push(this.newBucket());
                        this.buckets().at(i).get('name').setValue(data.buckets[i].name)
                        let c = this.buckets().at(i).get('values') as FormArray;
                        if (data.buckets[i].values.length > 0) {
                            for (let index = 0; index < data.buckets[i].values.length; index++) {
                                c.push(new FormControl(data.buckets[i].values[index]))
                            }
                        }
                    }
                }
            }
        }).catch((err) => {
            if (err) {
                if (data.buckets.length > 0) {
                    for (let i = 0; i < data.buckets.length; i++) {
                        this.buckets().push(this.newBucket());
                        this.buckets().at(i).get('name').setValue(data.buckets[i].name)
                        let c = this.buckets().at(i).get('values') as FormArray;
                        if (data.buckets[i].values !== null && data.buckets[i].values.length > 0) {
                            for (let index = 0; index < data.buckets[i].values.length; index++) {
                                c.push(new FormControl(data.buckets[i].values[index]))
                            }
                        }
                    }
                }
            }
        })
    }

    public clickCreateForm(): void {
        this.setFields();
        this.drawer.toggle();
    }

    public clickDelete(data: any): void {
        this.todayPageFacade.delete(data.id).then((res) => {
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

    public async keyUpAutoComp(text) {
        try {
            this.isLoading = true;
            // await this.accountFacade.search(data);
            this.todayPageFacade.searchObject(this.selectedValueType, this.selectedValueField, text).then((res) => {
                if (res) {
                    this.autoComp = res.result ? res.result : res;
                }
            })
            this.isLoading = false;
        } catch (error) {
            this.isLoading = false;
            console.log(error)
        }
    }

    public seleceType(event) {
        if (event.value === 'page') {
            this.fieldBucket = [
                {
                    value: 'id'
                },
                {
                    value: 'group'
                },
                {
                    value: 'province'
                }
            ];
        } else if (event.value === 'post') {
            this.fieldBucket = [
                {
                    value: 'emergencyEvent'
                },
                {
                    value: 'objective'
                },
                {
                    value: 'score'
                },
                {
                    value: 'hashtag'
                }
            ];
        } else {
            this.fieldBucket = [{ value: 'count' }];
        }
    }

    public changeData() {
        while (this.buckets().length !== 0) {
            this.buckets().removeAt(0)
        }
    }
}
