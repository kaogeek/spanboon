/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchFilter } from '../../../models/SearchFilter';
import { EmergencyEvent } from '../../../models/EmergencyEvent';
import { Today } from '../../../models/Today';
import { EmergencyEventFacade } from '../../../services/facade/EmergencyEventFacade.service';
import { HashTagFacade } from '../../../services/facade/HashTagFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { TodayPageFacade } from '../../../services/facade/TodayPageFacade.service';

const PAGE_NAME: string = "today";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;


@Component({
    selector: 'admin-today-page',
    templateUrl: './TodayPage.component.html'
})
export class TodayPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    @ViewChild('myInput') myInputVariable: ElementRef;
    @ViewChild('inputOrder') public inputOrder: ElementRef;

    public emergencyEventFacade: EmergencyEventFacade;
    public todayPageFacade: TodayPageFacade;
    public hashTagFacade: HashTagFacade;
    private authenManager: AuthenManager;
    private router: Router;


    public imagesAvatar: any;
    public dataForm: EmergencyEvent;
    public valueBool: boolean;
    public hashtagList: any;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: EmergencyEvent;
    public submitted = false;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public value: string = '';
    public imageName: any;
    public ordering: number;
    public isSave: boolean = false;
    public position: any = [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }];
    public typeBucket: any = [{ value: 'page' }, { value: 'post' }, { value: 'hashtag' }];
    public titleBucket: any = [{ value: 'ก้าวไกลวันนี้' }, { value: 'ก้าวไกลทั่วไทย' }, { value: 'สภาก้าวไกล' }, { value: 'ก้าวไกลรอบด้าน' }];
    public fieldBucket: any[] = [];
    public formType: FormGroup;
    public todayForm: FormGroup;
    public selectedValueType: string;
    public selectedValueField: string;
    public selectedValueTitle: string;
    public selectedPosition: number;
    public bucketList: any[] = [];
    public valueList1: any[] = [];
    public valueList2: any[] = [];
    public valueList3: any[] = [];
    public isShowClose: boolean = true;
    public num: number = 0;
    public isBucket1: boolean = false;
    public isBucket2: boolean = false;
    public isBucket3: boolean = false;
    public dataInput: Today;

    constructor(emergencyEventFacade: EmergencyEventFacade, todayPageFacade: TodayPageFacade, hashTagFacade: HashTagFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager, private fb: FormBuilder) {
        super(PAGE_NAME, dialog);
        this.emergencyEventFacade = emergencyEventFacade;
        this.todayPageFacade = todayPageFacade;
        this.hashTagFacade = hashTagFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.imagesAvatar = {}
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
            isBan: true,
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
        this.setForm();
        this.formType = new FormGroup({
            'id': new FormControl(null, { validators: [Validators.required] })
        });
        this.search();
    }

    setForm() {
        this.todayForm = this.fb.group({
            bucket: this.fb.array([]),
        });
    }

    buckets(): FormArray {
        return this.todayForm.get('bucket') as FormArray;
    }

    newEmployee(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required]],
            values: this.fb.array([]),
        });
    }

    clickAdd() {
        this.buckets().push(this.newEmployee());
    }

    removeEmployee(empIndex: number) {
        this.buckets().removeAt(empIndex);
    }

    employeeSkills(empIndex: number): FormArray {
        return this.buckets().at(empIndex).get('values') as FormArray;
    }

    newSkill(): FormGroup {
        return this.fb.group({
            value: ['', [Validators.required]],
        });
    }

    addEmployeeSkill(empIndex: number) {
        this.employeeSkills(empIndex).push(this.newSkill());
    }

    removeEmployeeSkill(empIndex: number, skillIndex: number) {
        this.employeeSkills(empIndex).removeAt(skillIndex);
    }

    public search() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.count = false;
        filter.orderBy = {}
        this.todayPageFacade.search(filter).then((res: any) => {
            if (res) {
            }
        }).catch((err: any) => {
        })
    }

    private setFields(): void {
        this.dataForm = new EmergencyEvent();
        this.dataForm.title = "";
        this.dataForm.detail = "";
        this.dataForm.coverPageURL = "";
        this.dataForm.hashTag = "";
        this.selectedValueField = "";
        this.selectedValueTitle = "";
        this.selectedValueType = "";
        this.selectedPosition = undefined;
        this.dataForm.ordering = undefined;
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
        // this.myInputVariable.nativeElement.value = "";
        this.drawer.toggle();
    }

    public clickEditForm(data: any): void {
        this.selectedPosition = data.position;
        this.setFields();
        this.drawer.toggle();
        if (data.type === 'page') {
            this.fieldBucket = [{ value: 'id' }, { value: 'group' }, { value: 'province' }];
        } else if (data.type === 'post') {
            this.fieldBucket = [{ value: 'emergencyEvent' }, { value: 'objective' }, { value: 'score' }, { value: 'hashtag' }];
        } else {
            this.fieldBucket = [{ value: 'count' }];
        }

        this.selectedPosition = data.position;
        this.selectedValueTitle = data.title;
        this.selectedValueType = data.type;
        this.selectedValueField = data.field;
        let bucket: any[] = [];
        let buckets: any[] = [];
        for (let item of data.buckets) {
            bucket.push(item);
            this.buckets().push(this.newEmployee())
        }
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

    public clickSaveTest(): void {
        if (!this.isSave) {
            this.isSave = true;
            this.submitted = true;
            if (this.dataForm.title.trim() === "") {
                this.isSave = false;
                return;
            }
            if (this.dataForm.detail.trim() === "") {
                this.isSave = false;
                return;
            }
            if (this.dataForm.hashTag === "") {
                this.isSave = false;
                return;
            }
            if (this.orinalDataForm.title !== "" && this.orinalDataForm.title !== undefined) {
                if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                    this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
                } else {
                    this.dataForm.asset = null;
                }
                let index = this.dataForm.hashTag.indexOf('#');
                if (index < 0) {
                } else {
                    var str = this.dataForm.hashTag
                    this.dataForm.hashTag = str.substring(1, 50)
                }
                this.emergencyEventFacade.edit(this.dataForm.id, this.dataForm).then((res: any) => {
                    this.table.searchData();
                    this.submitted = false;
                    this.isSave = false;
                    this.drawer.toggle();
                }).catch((err: any) => {
                    this.isSave = false;
                    this.dialogWarning(err.error.message);
                });
            } else {
                let index = this.dataForm.hashTag.indexOf('#');
                if (index < 0) {
                } else {
                    var str = this.dataForm.hashTag
                    this.dataForm.hashTag = str.substring(1, 50)
                }
                if (this.fileToUpload !== undefined && this.fileToUpload !== null) {
                    this.dataForm.asset = { size: this.fileToUpload[0].size, data: this.imageSrc, mimeType: this.fileToUpload[0].type }
                } else {
                    this.dataForm.asset = null;
                }
                this.emergencyEventFacade.create(this.dataForm).then((res: any) => {
                    this.table.searchData();
                    this.submitted = false;
                    this.isSave = false;
                    this.drawer.toggle();
                }).catch((err: any) => {
                    this.isSave = false;
                    this.dialogWarning(err.error.message);
                });
            }
        }
    }

    public clickDelete(data: any): void {
        this.emergencyEventFacade.delete(data.id).then((res) => {
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

    public clickSave() {
        const bucketList = this.buckets().value;
        let bucket: any[] = [];
        let buckets: any[] = [];
        for (let index = 0; index < bucketList.length; index++) {
            bucket.push(bucketList[index]);
        }

        for (let index = 0; index < bucket.length; index++) {
            let val: any = {
                name: '',
                values: []
            };
            val['name'] = bucket[index].name;
            bucket[index].values.map((res: any) => {
                val['values'].push(res.value);
            });

            buckets.push(val);
        }

        let data = {
            title: this.selectedValueTitle,
            type: this.selectedValueType,
            field: this.selectedValueField,
            position: this.selectedPosition,
            buckets
        }
        if (this.todayForm.invalid) {
            return;
        }
        if (this.selectedValueTitle === '') {
            return;
        }
        this.todayPageFacade.create(data).then((res) => {
            if (res) {
                this.table.searchData();
                this.drawer.toggle();
            }
        })
    }

    public selectData(data) {
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
}
