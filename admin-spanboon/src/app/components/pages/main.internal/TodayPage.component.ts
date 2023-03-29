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
    public orinalDataForm: EmergencyEvent;
    public submitted = false;
    public fileToUpload: File = null;
    private imageSrc: string = '';
    public value: string = '';
    public imageName: any;
    public ordering: number;
    public isSave: boolean = false;
    public position: number;
    public typeBucket: any = [{ value: 'page' }, { value: 'post' }, { value: 'hashtag' }];
    public titleBucket: any = [{ value: 'ก้าวไกลวันนี้' }, { value: 'ก้าวไกลทั่วไทย' }, { value: 'สภาก้าวไกล' }, { value: 'ก้าวไกลรอบด้าน' }];
    public fieldBucket: any = [{ value: 'id' }, { value: 'group' }, { value: 'province' }];
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
    public limit:number;
    public edit:string;
    public _id:string;
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
    refreshPage() {
        location.reload();
    }
    public ngOnInit() {
        this.setForm();
        this.formType = new FormGroup({
            'id': new FormControl(null, { validators: [Validators.required] })
        });
        this.search();
        this.searchUser_first.valueChanges
            .pipe(
                debounceTime(500)
                , takeUntil(this.unsubscriber)
            ).subscribe((value: any) => {
                const bucket_first = 1;
                this.debouncedValue = value;
                this.keyUpAutoComp(this.debouncedValue, bucket_first);
                const test = this.autoComp;
            });
        this.searchUser_second.valueChanges
            .pipe(
                debounceTime(500)
                , takeUntil(this.unsubscriber)
            ).subscribe((value: any) => {
                const bucket_second = 2;
                this.debouncedValue = value;
                this.keyUpAutoComp(this.debouncedValue, bucket_second);
            });
        this.searchUser_third.valueChanges
            .pipe(
                debounceTime(500)
                , takeUntil(this.unsubscriber)
            ).subscribe((value: any) => {
                const bucket_third = 3;
                this.debouncedValue = value;
                this.keyUpAutoComp(this.debouncedValue, bucket_third);
            });
    }
    public selectAutoComp(data, position?: number) {
        if (position === 1) {
            let stackValues = { 'index': this.testBuckets_first.length, 'value': data.label,'_id':data.value};
            this.value_first = data.label;
            if (this.value_first !== undefined) {
                this.value_stack_first.push(stackValues);
            }
        } else if (position === 2) {
            let stackSecondValues = { 'index': this.testBuckets_second.length, 'value': data.label,'_id':data.value };
            this.value_second = data.label;
            if (this.value_second !== undefined) {
                this.value_stack_second.push(stackSecondValues);
            }
        } else if (position === 3) {
            let stackThirdValues = { 'index': this.testBuckets_third.length, 'value': data.label,'_id':data.value };
            this.value_third = data.label;
            if (this.value_third !== undefined) {
                this.value_stack_third.push(stackThirdValues);
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
    removeValue(position:number,index:number){
        if(position === 1){
            this.value_stack_first.splice(index,1);
            this.value_first = '';
        }else if(position === 2){
            this.value_stack_second.splice(index,1);
            this.value_second = '';

        }else if(position === 3){
            this.value_stack_third.splice(index,1);
            this.value_third = '';
        }
    }

    removeEmployee(position: any, empIndex: number) {
        for(const bucket of this.stackBuckets){
            if(bucket.position === empIndex){
                if(bucket.position === 0){
                    this.nameOneTitle = '';
                    this.stackBuckets.splice(empIndex,1);
                    this.value_first = '';
                    for (let i = 0; i < this.stackBuckets.length; i++) {
                        this.stackBuckets[i].position = i;

                    }
                    for (let j =0; j<this.value_stack_first.length;j++){
                        this.value_stack_first.shift();
                    }
                    // update index
                }else if(bucket.position === 1){
                    this.nameTwoTitle = '';
                    this.value_second = '';
                    this.stackBuckets.splice(empIndex,1);
                    for (let i = 1; i < this.stackBuckets.length; i++) {
                        this.stackBuckets[i].position = i;;
                    }
                    for (let j =0; j<this.value_stack_second.length;j++){
                        this.value_stack_second.shift();
                    }
                    // update index                
                }else if(bucket.position === 2){
                    this.nameThreeTitle = '';
                    this.value_third = '';
                    this.stackBuckets.splice(empIndex,1);
                    for (let j =0; j<this.value_stack_third.length;j++){
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
                this.autoComp = res.result;
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
    public search() {
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
        if(data.buckets.length > 0){
            for(let i = 0;i<data.buckets.length;i++){
                let stackBucket = { 'position': i };
                miniBuckets = this.stackBuckets.push(stackBucket);
            }
        }
        // testBuckets_first
        if(miniBuckets !== undefined){
            if(data.buckets[0] !== undefined){
                this.nameOneTitle = data.buckets[0].name;

            }if(data.buckets[1] !== undefined){
                this.nameTwoTitle =data.buckets[1].name;

            }if(data.buckets[2] !== undefined){
                this.nameThreeTitle = data.buckets[2].name;
            }
        }
        if(data.buckets[0]!== undefined){
            for(let i = 0; i<data.buckets[0].values.length;i++){
                let miniBucket = { 'textPosition': i };
                const bucketMiniF = this.testBuckets_first.push(miniBucket);
                if(bucketMiniF !== undefined){
                    let stackFirstValues = { 'index': i, 'value': data.buckets[0].values[i],'_id':data.buckets[0].values[i]};
                    this.value_stack_first.push(stackFirstValues);
                }
            }
        }
        if(data.buckets[1]!== undefined){
            for(let y = 0; y<data.buckets[1].values.length;y++){
                let miniBucket = { 'textPosition': y };
                const bucketMiniS = this.testBuckets_second.push(miniBucket);
                if(bucketMiniS !== undefined){
                    let stackSecondValues = { 'index': y, 'value': data.buckets[1].values[y],'_id':data.buckets[1].values[y]};
                    this.value_stack_second.push(stackSecondValues);
                }
            }
        }
        if(data.buckets[2] !== undefined){
            for(let z = 0; z<data.buckets[2].values.length;z++){
                let miniBucket = { 'textPosition': z };
                const bucketMiniT = this.testBuckets_third.push(miniBucket);
                if(bucketMiniT !== undefined){
                    let stackThirdValues = { 'index': z, 'value': data.buckets[2].values[z],'_id':data.buckets[2].values[z]};
                    this.value_stack_third.push(stackThirdValues);
                }
            }
        }
        this.limit = data.limit;
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
        const bucketF = [];
        const bucketS = [];
        const bucketT = [];
        if(this.edit === undefined){
            if(this.value_stack_first.length > 0){
                for(const valueStack_f of this.value_stack_first){
                    bucketF.push(valueStack_f._id);
                }
            }
            if(this.value_stack_second.length > 0){
                for(const valueStack_s of this.value_stack_second){
                    bucketS.push(valueStack_s._id);
                }
            }
            if(this.value_stack_third.length > 0){
                for(const valueStack_t of this.value_stack_third){
                    bucketT.push(valueStack_t._id);
                }
            }
            const buckets = [{'name':this.nameOneTitle,'values':bucketF},{'name':this.nameTwoTitle,'values':bucketS},{'name':this.nameThreeTitle,'values':bucketT}];
            const result: any = {};
            result.title = this.selectedValueTitle;
            result.type = this.selectedValueType;
            result.field = this.selectedValueField;
            result.flag = null;
            result.limit = this.limit;
            result.buckets = buckets;
            result.position = this.selectedPosition;
            
            this.todayPageFacade.create(result).then((res) => {
                if (res) {
                    this.table.searchData();
                    this.drawer.toggle();
                }
            }) 
        }else{
            const id = this._id;
            if(this.value_stack_first.length > 0){
                for(const valueStack_f of this.value_stack_first){
                    bucketF.push(valueStack_f._id);
                }
            }
            if(this.value_stack_second.length > 0){
                for(const valueStack_s of this.value_stack_second){
                    bucketS.push(valueStack_s._id);
                }
            }
            if(this.value_stack_third.length > 0){
                for(const valueStack_t of this.value_stack_third){
                    bucketT.push(valueStack_t._id);
                }
            }
            const buckets = [{'name':this.nameOneTitle,'values':bucketF},{'name':this.nameTwoTitle,'values':bucketS},{'name':this.nameThreeTitle,'values':bucketT}];
            const result: any = {};
            result.title = this.selectedValueTitle;
            result.type = this.selectedValueType;
            result.field = this.selectedValueField;
            result.flag = null;
            result.limit = this.limit;
            result.buckets = buckets;
            result.position = this.selectedPosition;
            this.todayPageFacade.edit(id,result);
            console.log('pasdsadasda edit',result);
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
