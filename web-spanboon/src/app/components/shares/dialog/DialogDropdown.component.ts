/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AboutPageFacade, ObservableManager, PageFacade } from 'src/app/services/services';
import { DialogData } from '../../../models/models';

@Component({
    selector: 'dialog-dropdown',
    templateUrl: './DialogDropdown.component.html'

})

export class DialogDropdown {

    protected observManager: ObservableManager;
    private pageFacade: PageFacade;
    private aboutPageFacade: AboutPageFacade;
    private isbottom: boolean
    public selectedProvince: string;
    public selectedGroup: string;
    public pageId: string;
    public groups: any = [];
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

    constructor(public dialogRef: MatDialogRef<DialogDropdown>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData, aboutPageFacade: AboutPageFacade,
        pageFacade: PageFacade,
        observManager: ObservableManager) {
        this.aboutPageFacade = aboutPageFacade;
        this.pageFacade = pageFacade;
        this.observManager = observManager;
    }

    onConfirm(): void {
        let body;
        if (!!this.selectedProvince) {
            body = {
                province: this.selectedProvince
            }
        } else if (!!this.selectedGroup) {
            body = {
                group: this.selectedGroup
            }
        }
        if (!!this.selectedGroup || !!this.selectedProvince) {
            this.pageFacade.updateProfilePage(this.pageId, body).then((res) => {
                if (res.data) {
                    this.observManager.publish('page.about', res);
                    this.isbottom = true
                    this.dialogRef.close(this.isbottom);
                }
            }).catch((err) => {
                console.log('error ', err)
            });
        }
    }

    onClose(): void {
        this.isbottom = false
        this.dialogRef.close(this.isbottom);

        if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
            this.data.cancelClickedEvent.emit(false);
        }
    }

    public ngOnInit(): void {
        this.groups = this.data.group;
        this.pageId = this.data.pageId;
    }

    public selectType($event, text: string) {
        if (text === 'province') {
            this.selectedProvince = $event.value;
        } else if (text === 'group') {
            this.selectedGroup = $event.value;
        }
    }
}
