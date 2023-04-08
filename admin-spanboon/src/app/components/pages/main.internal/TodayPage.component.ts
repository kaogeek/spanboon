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
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { DialogAlert } from '../../shares/DialogAlert.component';

const PAGE_NAME: string = "today";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;


@Component({
    selector: 'admin-today-page',
    templateUrl: './TodayPage.component.html'
})
export class TodayPage extends AbstractPage implements OnInit {
    searchUser_first = new FormControl();
    searchUser_second = new FormControl();
    searchUser_third = new FormControl();

    searchTitle_first = new FormControl();
    searchTitle_second = new FormControl();
    searchTitle_third = new FormControl();
    private unsubscriber = new Subject<void>();
    debouncedValue = "";

    public static readonly PAGE_NAME: string = PAGE_NAME;
    @ViewChild('myInput') myInputVariable: ElementRef;
    @ViewChild('inputOrder') public inputOrder: ElementRef;

    public emergencyEventFacade: EmergencyEventFacade;
    public todayPageFacade: TodayPageFacade;
    public hashTagFacade: HashTagFacade;
    private authenManager: AuthenManager;
    private router: Router;
    public createdName: any;
    public imagesAvatar: any;
    public dataForm: EmergencyEvent;
    public valueBool: boolean;
    public hashtagList: any;
    public valuetring: string;
    public valueNum: number;
    public submitted = false;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public value: string = '';
    public imageName: any;
    public ordering: number;
    public isSave: boolean = false;
    public orderBy: any = {};
    public position: number;
    public typeBucket: any = [{ value: 'page' }, { value: 'post' }, { value: 'hashtag' }];
    public titleBucket: any = [{ value: 'ก้าวไกลวันนี้' }, { value: 'ก้าวไกลทั่วไทย' }, { value: 'สภาก้าวไกล' }, { value: 'ก้าวไกลรอบด้าน' }];
    public fieldBucket: any = [{ value: 'id' }, { value: 'group' }, { value: 'province' }];
    public formType: FormGroup;
    public todayForm: FormGroup;
    public selectedValueType: string;
    public selectedValueField: string;
    public selectedValueTitle: string;
    public selectedValueProvince1: string;
    public selectedValueProvince2: string;
    public selectedValueProvince3: string;
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
    public getType: any = undefined;
    public getField: any = undefined;
    public isLoading: boolean;
    public autoComp: any;
    public stackBuckets: any[] = [];
    public testBuckets_first: any = [];
    public testBuckets_second: any = [];
    public testBuckets_third: any = [];
    public stackValue: any = [];
    public countArray: number = 1;
    public title: string;
    public position_first: number = 1;
    public position_second: number = 2;
    public position_third: number = 3;
    public value_first: string = '';
    public value_second: string = '';
    public value_third: string = '';
    public value_stack_first: any = [];
    public value_stack_second: any = [];
    public value_stack_third: any = [];
    public nameOneTitle: string;
    public nameTwoTitle: string;
    public nameThreeTitle: string;
    public limit: number = 10;
    public edit: string;
    public _id: string;
    public provinces: any = [
        { value: 'นครราชสีมา', viewValue: 'นครราชสีมา' },
        { value: 'สมุทรสงคราม', viewValue: 'สมุทรสงคราม' },
        { value: 'กาญจนบุรี', viewValue: 'กาญจนบุรี' },
        { value: 'ตาก', viewValue: 'ตาก' },
        { value: 'อุบลราชธานี', viewValue: 'อุบลราชธานี' },
        { value: 'สุราษฎร์ธานี', viewValue: 'สุราษฎร์ธานี' },
        { value: 'ชัยภูมิ', viewValue: 'ชัยภูมิ' },
        { value: 'แม่ฮ่องสอน', viewValue: 'แม่ฮ่องสอน' },
        { value: 'เพชรบูรณ์', viewValue: 'เพชรบูรณ์' },
        { value: 'ลำปาง', viewValue: 'ลำปาง' },
        { value: 'อุดรธานี', viewValue: 'อุดรธานี' },
        { value: 'เชียงราย', viewValue: 'เชียงราย' },
        { value: 'น่าน', viewValue: 'น่าน' },
        { value: 'เลย', viewValue: 'เลย' },
        { value: 'ขอนแก่น', viewValue: 'ขอนแก่น' },
        { value: 'พิษณุโลก', viewValue: 'พิษณุโลก' },
        { value: 'บุรีรัมย์', viewValue: 'บุรีรัมย์' },
        { value: 'นครศรีธรรมราช', viewValue: 'นครศรีธรรมราช' },
        { value: 'สกลนคร', viewValue: 'สกลนคร' },
        { value: 'นครสวรรค์', viewValue: 'นครสวรรค์' },
        { value: 'ศรีสะเกษ', viewValue: 'ศรีสะเกษ' },
        { value: 'กำแพงเพชร', viewValue: 'กำแพงเพชร' },
        { value: 'ร้อยเอ็ด', viewValue: 'ร้อยเอ็ด' },
        { value: 'สุรินทร์', viewValue: 'สุรินทร์' },
        { value: 'อุตรดิตถ์', viewValue: 'อุตรดิตถ์' },
        { value: 'สงขลา', viewValue: 'สงขลา' },
        { value: 'สระแก้ว', viewValue: 'สระแก้ว' },
        { value: 'กาฬสินธุ์', viewValue: 'กาฬสินธุ์' },
        { value: 'อุทัยธานี', viewValue: 'อุทัยธานี' },
        { value: 'สุโขทัย', viewValue: 'สุโขทัย' },
        { value: 'แพร่', viewValue: 'แพร่' },
        { value: 'ประจวบคีรีขันธ์', viewValue: 'ประจวบคีรีขันธ์' },
        { value: 'จันทบุรี', viewValue: 'จันทบุรี' },
        { value: 'พะเยา', viewValue: 'พะเยา' },
        { value: 'เพชรบุรี', viewValue: 'เพชรบุรี' },
        { value: 'ลพบุรี', viewValue: 'ลพบุรี' },
        { value: 'ชุมพร', viewValue: 'ชุมพร' },
        { value: 'นครพนม', viewValue: 'นครพนม' },
        { value: 'สุพรรณบุรี', viewValue: 'สุพรรณบุรี' },
        { value: 'ฉะเชิงเทรา', viewValue: 'ฉะเชิงเทรา' },
        { value: 'มหาสารคาม', viewValue: 'มหาสารคาม' },
        { value: 'ราชบุรี', viewValue: 'ราชบุรี' },
        { value: 'ตรัง', viewValue: 'ตรัง' },
        { value: 'ปราจีนบุรี', viewValue: 'ปราจีนบุรี' },
        { value: 'กระบี่', viewValue: 'กระบี่' },
        { value: 'พิจิตร', viewValue: 'พิจิตร' },
        { value: 'ยะลา', viewValue: 'ยะลา' },
        { value: 'ลำพูน', viewValue: 'ลำพูน' },
        { value: 'นราธิวาส', viewValue: 'นราธิวาส' },
        { value: 'ชลบุรี', viewValue: 'ชลบุรี' },
        { value: 'มุกดาหาร', viewValue: 'มุกดาหาร' },
        { value: 'บึงกาฬ', viewValue: 'บึงกาฬ' },
        { value: 'พังงา', viewValue: 'พังงา' },
        { value: 'ยโสธร', viewValue: 'ยโสธร' },
        { value: 'หนองบัวลำภู', viewValue: 'หนองบัวลำภู' },
        { value: 'สระบุรี', viewValue: 'สระบุรี' },
        { value: 'ระยอง', viewValue: 'ระยอง' },
        { value: 'พัทลุง', viewValue: 'พัทลุง' },
        { value: 'ระนอง', viewValue: 'ระนอง' },
        { value: 'อำนาจเจริญ', viewValue: 'อำนาจเจริญ' },
        { value: 'หนองคาย', viewValue: 'หนองคาย' },
        { value: 'ตราด', viewValue: 'ตราด' },
        { value: 'พระนครศรีอยุธยา', viewValue: 'พระนครศรีอยุธยา' },
        { value: 'สตูล', viewValue: 'สตูล' },
        { value: 'ชัยนาท', viewValue: 'ชัยนาท' },
        { value: 'นครปฐม', viewValue: 'นครปฐม' },
        { value: 'นครนายก', viewValue: 'นครนายก' },
        { value: 'ปัตตานี', viewValue: 'ปัตตานี' },
        { value: 'กรุงเทพมหานคร', viewValue: 'กรุงเทพมหานคร' },
        { value: 'ปทุมธานี', viewValue: 'ปทุมธานี' },
        { value: 'สมุทรปราการ', viewValue: 'สมุทรปราการ' },
        { value: 'อ่างทอง', viewValue: 'อ่างทอง' },
        { value: 'สมุทรสาคร', viewValue: 'สมุทรสาคร' },
        { value: 'สิงห์บุรี', viewValue: 'สิงห์บุรี' },
        { value: 'นนทบุรี', viewValue: 'นนทบุรี' },
        { value: 'ภูเก็ต', viewValue: 'ภูเก็ต' },
        { value: 'สมุทรสงคราม', viewValue: 'สมุทรสงคราม' }
    ];

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
        if (
            !this.selectedValueTitle &&
            !this.selectedValueType &&
            !this.selectedValueField &&
            !this.selectedPosition &&
            this.limit === 10 &&
            this.value_stack_first.length === 0 &&
            this.value_stack_second.length === 0 &&
            this.value_stack_third.length === 0
        ) {
            this.drawer.toggle();
            return;
        }

        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: "คุณมีข้อมูลที่ยังไม่ได้บันทึกต้องการปิดหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (!!this.value_stack_first) {
                    this.value_stack_first.splice(0)
                }
                if (!!this.value_stack_second) {
                    this.value_stack_second.splice(0)
                }
                if (!!this.value_stack_third) {
                    this.value_stack_third.splice(0)
                }
                this.edit = undefined;
                this.drawer.toggle();
            }
        });
    }
    public ngOnInit() {
        this.setForm();
        this.formType = new FormGroup({
            'id': new FormControl(null, { validators: [Validators.required] })
        });
        this.searchBucket();
        this.searchUser_first.valueChanges
            .pipe(
                debounceTime(500)
                , takeUntil(this.unsubscriber)
            ).subscribe((value: any) => {
                const bucket_first = 1;
                this.debouncedValue = value;
                if ((this.selectedValueField !== 'count') && (this.selectedValueField !== 'score') && (this.selectedValueField !== 'province')) {
                    this.keyUpAutoComp(this.debouncedValue, bucket_first);
                }
                const test = this.autoComp;
            });
        this.searchUser_second.valueChanges
            .pipe(
                debounceTime(500)
                , takeUntil(this.unsubscriber)
            ).subscribe((value: any) => {
                const bucket_second = 2;
                this.debouncedValue = value;
                if ((this.selectedValueField !== 'count') && (this.selectedValueField !== 'score') && (this.selectedValueField !== 'province')) {
                    this.keyUpAutoComp(this.debouncedValue, bucket_second);
                }
            });
        this.searchUser_third.valueChanges
            .pipe(
                debounceTime(500)
                , takeUntil(this.unsubscriber)
            ).subscribe((value: any) => {
                const bucket_third = 3;
                this.debouncedValue = value;
                if ((this.selectedValueField !== 'count') && (this.selectedValueField !== 'score') && (this.selectedValueField !== 'province')) {
                    this.keyUpAutoComp(this.debouncedValue, bucket_third);
                }
            });
    }
    public selectAutoComp(data, position?: number) {
        let stackValues;
        let stackSecondValues;
        let stackThirdValues;
        if (position === 1) {
            if (this.selectedValueField === 'group') {
                stackValues = { 'index': this.testBuckets_first.length, 'value': data.detail, '_id': data.id };
            } else {
                stackValues = { 'index': this.testBuckets_first.length, 'value': data.label ? data.label : data.value, '_id': data.value };
            }
            this.value_first = data.label ? data.label : data.value ? data.value : data.detail;
            if (this.value_first !== undefined) {
                this.value_stack_first.push(stackValues);
                this.value_first = '';
            }
        } else if (position === 2) {
            if (this.selectedValueField === 'group') {
                stackSecondValues = { 'index': this.testBuckets_first.length, 'value': data.detail, '_id': data.id };
            } else {
                stackSecondValues = { 'index': this.testBuckets_first.length, 'value': data.label ? data.label : data.value, '_id': data.value };
            }
            this.value_second = data.label ? data.label : data.value ? data.value : data.detail;
            if (this.value_second !== undefined) {
                this.value_stack_second.push(stackSecondValues);
                this.value_second = '';
            }
        } else if (position === 3) {
            if (this.selectedValueField === 'group') {
                stackThirdValues = { 'index': this.testBuckets_first.length, 'value': data.detail, '_id': data.id };
            } else {
                stackThirdValues = { 'index': this.testBuckets_first.length, 'value': data.label ? data.label : data.value, '_id': data.value };
            }
            this.value_third = data.label ? data.label : data.value ? data.value : data.detail;
            if (this.value_third !== undefined) {
                this.value_stack_third.push(stackThirdValues);
                this.value_third = '';
            }

        }

        // this.searchTrendTag();
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
        let stackBucket = { 'position': this.stackBuckets.length };
        if (this.stackBuckets.length < 3) {
            if (this.stackBuckets[0] === undefined) {
                this.stackBuckets.push(stackBucket);
            } else if (this.stackBuckets[1] === undefined) {
                this.stackBuckets.push(stackBucket);
            } else if (this.stackBuckets[2] === undefined) {
                this.stackBuckets.push(stackBucket);
            }
        }
    }
    clickAddMiniBucket_first() {
        if (this.testBuckets_first.length > 0) {
            this.value_first = undefined;
        }
        let text1 = this.testBuckets_first.length;
        let miniBucket = { 'textPosition': text1 };
        this.testBuckets_first.push(miniBucket);
    }
    clickAddMiniBucket_second() {
        if (this.testBuckets_second.length > 0) {
            this.value_second = undefined;
        } else {
            let text2 = this.testBuckets_second.length;
            let miniBucket = { 'textPosition': text2 };
            this.testBuckets_second.push(miniBucket);
        }
    }
    clickAddMiniBucket_third() {
        if (this.testBuckets_third.length > 0) {
            this.value_third = undefined;
        } else {
            let text3 = this.testBuckets_third.length;
            let miniBucket = { 'textPosition': text3 };
            this.testBuckets_third.push(miniBucket);
        }
    }
    removeValue(position: number, index: number) {
        if (position === 1) {
            this.value_stack_first.splice(index, 1);
            this.value_first = '';
        } else if (position === 2) {
            this.value_stack_second.splice(index, 1);
            this.value_second = '';

        } else if (position === 3) {
            this.value_stack_third.splice(index, 1);
            this.value_third = '';
        }
    }

    removeEmployee(position: any, empIndex: number) {
        for (const bucket of this.stackBuckets) {
            if (bucket.position === empIndex) {
                if (bucket.position === 0) {
                    this.nameOneTitle = '';
                    this.stackBuckets.splice(empIndex, 1);
                    this.value_first = '';
                    for (let i = 0; i < this.stackBuckets.length; i++) {
                        this.stackBuckets[i].position = i;

                    }
                    for (let j = 0; j < this.value_stack_first.length; j++) {
                        this.value_stack_first.shift();
                    }
                    // update index
                } else if (bucket.position === 1) {
                    this.nameTwoTitle = '';
                    this.value_second = '';
                    this.stackBuckets.splice(empIndex, 1);
                    for (let i = 1; i < this.stackBuckets.length; i++) {
                        this.stackBuckets[i].position = i;;
                    }
                    for (let j = 0; j < this.value_stack_second.length; j++) {
                        this.value_stack_second.shift();
                    }
                    // update index                
                } else if (bucket.position === 2) {
                    this.nameThreeTitle = '';
                    this.value_third = '';
                    this.stackBuckets.splice(empIndex, 1);
                    for (let j = 0; j < this.value_stack_third.length; j++) {
                        this.value_stack_third.shift();
                    }
                }
            }
        }

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


    public async keyUpAutoComp(text, positionBucket: number) {
        try {
            const position = positionBucket;
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
    public resetAutocomp() {
        this.createdName = '';
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
        this.dataForm.hashTag = "";
        this.selectedValueField = "";
        this.selectedValueTitle = "";
        this.selectedValueType = "";
        this.nameOneTitle = "";
        this.nameTwoTitle = "";
        this.nameThreeTitle = "";
        this.limit = 10;
        this.selectedPosition = undefined;
        this.dataForm.ordering = undefined;

    }

    public changeData() {
        this.nameOneTitle = "";
        this.nameTwoTitle = "";
        this.nameThreeTitle = "";
        this.stackBuckets = [];
        this.value_stack_first.splice(0);
        this.value_stack_second.splice(0);
        this.value_stack_third.splice(0);
        this.testBuckets_first.splice(0);
        this.testBuckets_second.splice(0);
        this.testBuckets_third.splice(0);
    }

    public clickCreateForm(): void {
        this.setFields();
        this.selectedValueTitle = "";
        this.stackBuckets = [];
        this.value_stack_first.splice(0);
        this.value_stack_second.splice(0);
        this.value_stack_third.splice(0);
        this.testBuckets_first.splice(0)
        this.testBuckets_second.splice(0)
        this.testBuckets_third.splice(0)
        this.drawer.toggle();
    }

    public clickEditForm(data: any): void {
        let dataComp;
        this.setFields();
        this.drawer.toggle();
        let miniBuckets = undefined;
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
                dataComp = res;

                if (data.buckets.length > 0) {
                    for (let i = 0; i < data.buckets.length; i++) {
                        let stackBucket = { 'position': i };
                        miniBuckets = this.stackBuckets.push(stackBucket);
                    }
                }
                // testBuckets_first
                if (miniBuckets !== undefined) {
                    if (data.buckets[0] !== undefined) {
                        this.nameOneTitle = data.buckets[0].name;

                    } if (data.buckets[1] !== undefined) {
                        this.nameTwoTitle = data.buckets[1].name;

                    } if (data.buckets[2] !== undefined) {
                        this.nameThreeTitle = data.buckets[2].name;
                    }
                }
                if ((data.field !== 'count') && (data.field !== 'score')) {
                    if (data.buckets[0] !== undefined) {
                        for (let i = 0; i < data.buckets[0].values.length; i++) {
                            let miniBucket = { 'textPosition': i };
                            const bucketMiniF = this.testBuckets_first.push(miniBucket);
                            if (bucketMiniF !== undefined) {
                                let stackFirstValues = { 'index': i, 'value': dataComp[0][i].title ? dataComp[0][i].title : dataComp[0][i].name, '_id': dataComp[0][i]._id };
                                this.value_stack_first.push(stackFirstValues);
                            }
                        }
                    }
                    if (data.buckets[1] !== undefined) {
                        for (let y = 0; y < data.buckets[1].values.length; y++) {
                            let miniBucket = { 'textPosition': y };
                            const bucketMiniS = this.testBuckets_second.push(miniBucket);
                            if (bucketMiniS !== undefined) {
                                let stackSecondValues = { 'index': y, 'value': dataComp[1][y].title ? dataComp[1][y].title : dataComp[1][y].name, '_id': dataComp[1][y]._id };
                                this.value_stack_second.push(stackSecondValues);
                            }
                        }
                    }
                    if (data.buckets[2] !== undefined) {
                        for (let z = 0; z < data.buckets[2].values.length; z++) {
                            let miniBucket = { 'textPosition': z };
                            const bucketMiniT = this.testBuckets_third.push(miniBucket);
                            if (bucketMiniT !== undefined) {
                                let stackThirdValues = { 'index': z, 'value': dataComp[2][z].title ? dataComp[2][z].title : dataComp[2][z].name, '_id': dataComp[2][z]._id };
                                this.value_stack_third.push(stackThirdValues);
                            }
                        }
                    }
                }
                this.limit = data.limit;
            }
        }).catch((err) => {
            if (err) {
                if (data.buckets.length > 0) {
                    for (let i = 0; i < data.buckets.length; i++) {
                        let stackBucket = { 'position': i };
                        miniBuckets = this.stackBuckets.push(stackBucket);
                    }
                }
                // testBuckets_first
                if (miniBuckets !== undefined) {
                    if (data.buckets[0] !== undefined) {
                        this.nameOneTitle = data.buckets[0].name;

                    } if (data.buckets[1] !== undefined) {
                        this.nameTwoTitle = data.buckets[1].name;

                    } if (data.buckets[2] !== undefined) {
                        this.nameThreeTitle = data.buckets[2].name;
                    }
                }
                if ((data.field !== 'count') && (data.field !== 'score')) {
                    if (data.buckets[0] !== undefined) {
                        for (let i = 0; i < data.buckets[0].values.length; i++) {
                            let miniBucket = { 'textPosition': i };
                            const bucketMiniF = this.testBuckets_first.push(miniBucket);
                            if (bucketMiniF !== undefined) {
                                let stackFirstValues = { 'index': i, 'value': data.buckets[0].values[i], '_id': data.buckets[0].values[i] };
                                this.value_stack_first.push(stackFirstValues);
                            }
                        }
                    }
                    if (data.buckets[1] !== undefined) {
                        for (let y = 0; y < data.buckets[1].values.length; y++) {
                            let miniBucket = { 'textPosition': y };
                            const bucketMiniS = this.testBuckets_second.push(miniBucket);
                            if (bucketMiniS !== undefined) {
                                let stackSecondValues = { 'index': y, 'value': data.buckets[1].values[y], '_id': data.buckets[1].values[y] };
                                this.value_stack_second.push(stackSecondValues);
                            }
                        }
                    }
                    if (data.buckets[2] !== undefined) {
                        for (let z = 0; z < data.buckets[2].values.length; z++) {
                            let miniBucket = { 'textPosition': z };
                            const bucketMiniT = this.testBuckets_third.push(miniBucket);
                            if (bucketMiniT !== undefined) {
                                let stackThirdValues = { 'index': z, 'value': data.buckets[2].values[z], '_id': data.buckets[2].values[z] };
                                this.value_stack_third.push(stackThirdValues);
                            }
                        }
                    }
                }
                this.limit = data.limit;
            }
        })
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

    public clickSave() {
        const bucketF = [];
        const bucketS = [];
        const bucketT = [];
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

        if (this.edit === undefined) {
            if (this.value_stack_first.length > 0) {
                for (const valueStack_f of this.value_stack_first) {
                    if ((this.selectedValueField === 'group') || (this.selectedValueField === 'hashtag')) {
                        bucketF.push(valueStack_f.value);
                    } else {
                        bucketF.push(valueStack_f._id);
                    }
                }
            }
            if (this.value_stack_second.length > 0) {
                for (const valueStack_s of this.value_stack_second) {
                    if ((this.selectedValueField === 'group') || (this.selectedValueField === 'hashtag')) {
                        bucketS.push(valueStack_s.value);
                    } else {
                        bucketS.push(valueStack_s._id);
                    }
                }
            }
            if (this.value_stack_third.length > 0) {
                for (const valueStack_t of this.value_stack_third) {
                    if ((this.selectedValueField === 'group') || (this.selectedValueField === 'hashtag')) {
                        bucketT.push(valueStack_t.value);
                    } else {
                        bucketT.push(valueStack_t._id);
                    }
                }
            }
            const buckets = [{ 'name': this.nameOneTitle, 'values': bucketF }, { 'name': this.nameTwoTitle, 'values': bucketS }, { 'name': this.nameThreeTitle, 'values': bucketT }];
            const result: any = {};
            result.title = this.selectedValueTitle;
            result.type = this.selectedValueType;
            result.field = this.selectedValueField;
            result.flag = null;
            result.limit = this.limit;
            result.buckets = buckets;
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

            if (this.stackBuckets.length === 0 &&
                this.value_stack_first.length === 0 &&
                this.value_stack_second.length === 0 &&
                this.value_stack_third.length === 0
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

            this.todayPageFacade.create(result).then((res) => {
                this.table.searchData();
                if (!!this.value_stack_first) {
                    this.value_stack_first.splice(0)
                }
                if (!!this.value_stack_second) {
                    this.value_stack_second.splice(0)
                }
                if (!!this.value_stack_third) {
                    this.value_stack_third.splice(0)
                }
                this.edit = undefined;
                this.drawer.toggle();
            })
        } else {
            const id = this._id;
            if (this.value_stack_first.length > 0) {
                for (const valueStack_f of this.value_stack_first) {
                    if (this.selectedValueField === 'group') {
                        bucketF.push(valueStack_f.value);
                    } else {
                        bucketF.push(valueStack_f._id);
                    }
                }
            }
            if (this.value_stack_second.length > 0) {
                for (const valueStack_s of this.value_stack_second) {
                    if (this.selectedValueField === 'group') {
                        bucketS.push(valueStack_s.value);
                    } else {
                        bucketS.push(valueStack_s._id);
                    }
                }
            }
            if (this.value_stack_third.length > 0) {
                for (const valueStack_t of this.value_stack_third) {
                    if (this.selectedValueField === 'group') {
                        bucketT.push(valueStack_t.value);
                    } else {
                        bucketT.push(valueStack_t._id);
                    }
                }
            }
            const buckets = [{ 'name': this.nameOneTitle, 'values': bucketF }, { 'name': this.nameTwoTitle, 'values': bucketS }, { 'name': this.nameThreeTitle, 'values': bucketT }];
            const result: any = {};
            result.title = this.selectedValueTitle;
            result.type = this.selectedValueType;
            result.field = this.selectedValueField;
            result.flag = null;
            result.limit = this.limit;
            result.buckets = buckets;
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

            this.todayPageFacade.edit(id, result).then((res) => {
                this.table.searchData();
                if (!!this.value_stack_first) {
                    this.value_stack_first.splice(0)
                }
                if (!!this.value_stack_second) {
                    this.value_stack_second.splice(0)
                }
                if (!!this.value_stack_third) {
                    this.value_stack_third.splice(0)
                }
                this.edit = undefined;
                this.drawer.toggle();
                this.setFields();
            })
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

}
