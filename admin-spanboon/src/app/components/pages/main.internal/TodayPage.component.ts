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
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
    public typeBucket: any = [{ value: 'page' }, { value: 'post' }, { value: 'hashtag' }];
    public titleBucket: any = [{ value: 'ก้าวไกลวันนี้' }, { value: 'ก้าวไกลทั่วไทย' }, { value: 'สภาก้าวไกล' }, { value: 'ก้าวไกลรอบด้าน' }];
    public fieldBucket: any = [{ value: 'province' }, { value: 'emergency' }, { value: 'objective' }, { value: 'hashtag' }, { value: 'id' }, { value: 'pageCatagory' }];
    public formType: FormGroup;
    public selectedValueType: string;
    public selectedValueField: string;
    public selectedValueTitle: string;
    public bucketList: any[] = [];
    public valueList: any[] = [];
    public isShowClose: boolean = true;

    constructor(emergencyEventFacade: EmergencyEventFacade, hashTagFacade: HashTagFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.emergencyEventFacade = emergencyEventFacade;
        this.hashTagFacade = hashTagFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.imagesAvatar = {}
        this.fieldTable = [
            {
                name: "kaokai",
                label: "ก้าวไกลวันนี้",
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
                name: "bucket 2",
                label: "ถัง 2",
                width: "180pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            }, {
                name: "bucket 3",
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
        this.formType = new FormGroup({
            'id': new FormControl(null, { validators: [Validators.required] })
        });
        this.table.isEmer = true;
        this.getHashtag();
    }

    public getHashtag() {
        let filter = new SearchFilter();
        filter.limit = SEARCH_LIMIT;
        filter.offset = SEARCH_OFFSET;
        filter.relation = [],
            filter.whereConditions = {},
            filter.count = false;
        filter.orderBy = {}
        this.hashTagFacade.search(filter).then((res: any) => {
            this.hashtagList = res
        }).catch((err: any) => {
        })
    }

    private setFields(): void {
        this.dataForm = new EmergencyEvent();
        this.dataForm.title = "";
        this.dataForm.detail = "";
        this.dataForm.coverPageURL = "";
        this.dataForm.hashTag = "";
        this.imageName = false;
        this.dataForm.ordering = undefined;
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

    public clickCreateForm(): void {
        this.setFields();
        // this.myInputVariable.nativeElement.value = "";
        this.drawer.toggle();
    }

    public clickEditForm(data: any): void {
        this.setFields();
        this.drawer.toggle();
        this.myInputVariable.nativeElement.value = "";
        this.dataForm = JSON.parse(JSON.stringify(data));
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
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

    public clickSave(): void {
        if (!this.isSave) {
            this.isSave = true;
            this.submitted = true;
            let emailPattern = "[0-9]";
            if (!this.inputOrder!.nativeElement!.value.match(emailPattern)) {
                this.isSave = false;
                return;
            }
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

    public addBucket() {
        this.bucketList.push(this.bucketList.length);
    }

    public addValue(index, value: string) {
        this.valueList.push(this.valueList.length);
        // this.bucketList.splice(index, 0, [{ value: this.valueList.length }])
        // this.valueList.splice(index, 0, this.valueList.length);
        // this.valueList.splice(this.valueList.length);
    }

    public check55(index, value: string) {
        if (value === 'value') {
            // console.log("value", this.valueList)
        } else {
            // console.log("buck", this.bucketList)
        }
        // console.log("index", index)
    }
}
