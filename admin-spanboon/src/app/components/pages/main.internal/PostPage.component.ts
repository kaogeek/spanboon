/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit } from '@angular/core';
import { SearchFilter } from '../../../models/SearchFilter';
import { Page } from '../../../models/Page';
import { BanRequest } from '../../../models/BanRequest';
import { PageApproveRequest } from '../../../models/PageApproveRequest';
import { PageFacade } from '../../../services/facade/PageFacade.service';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { PageGroupFacade } from '../../../services/facade/PageGroupFacade.service';

const PAGE_NAME: string = "page";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'admin-page-page',
    templateUrl: './PostPage.component.html'
})
export class PostPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public pageFacade: PageFacade;
    private authenManager: AuthenManager;
    private router: Router;
    public isSave: boolean = false;
    public pageGroupFacade: PageGroupFacade;
    public pageGroups: any = [];
    public stackGroups: any = [];
    public dataForm: Page;
    public valueBool: boolean;
    public valuetring: string;
    public valueNum: number;
    public orinalDataForm: Page;
    public submitted = false;
    public isOfficialPage: {};
    public orderBy: any = {};
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

    constructor(pageFacade: PageFacade, pageGroupFacade: PageGroupFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager) {
        super(PAGE_NAME, dialog);
        this.pageFacade = pageFacade;
        this.pageGroupFacade = pageGroupFacade;
        this.router = router;
        this.authenManager = authenManager;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.orderBy = { createdDate: -1 };
        this.fieldTable = [
            {
                name: "name",
                label: "ชื่อ",
                width: "330pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "group",
                label: "กลุ่ม",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            },
            {
                name: "province",
                label: "จังหวัด",
                width: "150pt",
                class: "", formatColor: false, formatImage: false,
                link: [],
                formatDate: false,
                formatId: false,
                align: "left"
            }
        ];
        this.actions = {
            isOfficial: true,
            isBan: true,
            isApprove: false,
            isUnApprove: false,
            isSelect: false,
            isCreate: false,
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
        this.dataForm = new Page();
        this.dataForm.name = "";
        this.dataForm.group = "";
        this.dataForm.province = "";
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
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
        this.pageFacade.search(filter).then((res: any) => {
        }).catch((err: any) => {
        })
    }

    public clickEditForm(data: any): void {
        const stackPageGroup = this.pageGroupFacade.finds().then((datas) => {
            this.stackGroups = datas;
        });

        this.drawer.toggle();
        this.valueBool = true;
        this.valuetring = "";
        this.valueNum = 0;
        this.dataForm = JSON.parse(JSON.stringify(data));
        this.orinalDataForm = JSON.parse(JSON.stringify(data));
    }

    public clickOfficial(data: any): void {
        let ap = new PageApproveRequest();

        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: data.isOfficial ? "คุณต้องการยกเลิกอนุมัติหรือไม่" : "คุณต้องการอนุมัติหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (data.isOfficial === null || data.isOfficial === undefined || data.isOfficial === '' || data.isOfficial === false) {
                    ap.name = data.name
                    ap.createdDate = data.createdDate
                    this.pageFacade.approve(data.id, ap).then((res: any) => {
                        let index = 0;
                        let data = this.table.data;
                        for (let d of data) {
                            if (d.name == res.name) {
                                data[index] = res;
                                this.isOfficialPage = {
                                    official: true,
                                    index: index,
                                    data: res
                                }
                                break;
                            }
                            index++;
                        }
                        this.table.isLoading = true;
                        setTimeout(() => {
                            this.table.setTableConfig(data);
                        }, 1000);
                    }).catch((err: any) => {
                        this.dialogWarning(err.error.message);
                    });
                } else {
                    ap.name = data.name
                    ap.createdDate = data.createdDate
                    this.pageFacade.unapprove(data.id, ap).then((res: any) => {
                        let index = 0;
                        let data = this.table.data;
                        for (let d of data) {
                            if (d.name == res.name) {
                                data[index] = res;
                                this.isOfficialPage = {
                                    official: false,
                                    index: index,
                                    data: res
                                }
                                break;
                            }
                            index++;
                        }
                        this.table.isLoading = true;
                        setTimeout(() => {
                            this.table.setTableConfig(data);
                        }, 1000);
                    }).catch((err: any) => {
                        this.dialogWarning(err.error.message);
                    });
                }
            }
        });
    }

    public clickBan(data: any): void {
        let ap = new PageApproveRequest();
        let bp = new BanRequest();

        let dialogRef = this.dialog.open(DialogWarningComponent, {
            data: {
                title: data.banned ? "คุณต้องการยกเลิกระงับการใช้งานหรือไม่" : "คุณต้องการระงับการใช้งานหรือไม่"
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (data.banned === null || data.banned === undefined || data.banned === '' || data.banned === false) {
                    bp.banned = true
                    this.pageFacade.ban(data.id, bp).then((res: any) => {
                        this.table.searchData();
                        this.dialogWarning("ระงับการใช้งานสำเร็จ");
                    }).catch((err: any) => {
                        this.dialogWarning(err.error.message);
                    });
                } else {
                    bp.banned = false
                    this.pageFacade.ban(data.id, bp).then((res: any) => {
                        this.table.searchData();
                        this.dialogWarning("ยกเลิกระงับการใช้งานสำเร็จ");
                    }).catch((err: any) => {
                        this.dialogWarning(err.error.message);
                    });
                }
            }
        });
    }
    public clickDelete(data: any): void {
        this.pageFacade.delete(data.id).then((res) => {
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
        let data = this.dataForm;
        this.isSave = true;
        this.submitted = true;
        this.pageFacade.edit(data.id, data).then((res) => {
            this.submitted = false;
            this.isSave = false;
            this.table.searchData();
            this.drawer.toggle();
        }).catch((err: any) => {
            this.isSave = false;
            this.table.searchData();
            this.dialogWarning(err.error.message);
        });
    }
    public seleceType(event) {
    }
}
