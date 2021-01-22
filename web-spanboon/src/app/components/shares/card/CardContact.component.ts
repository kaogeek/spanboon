/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FULFILLMENT_STATUS } from '../../../FulfillmentStatus';
import { ObservableManager } from '../../../services/services';

@Component({
    selector: 'card-contact',
    templateUrl: './CardContact.component.html'
})
export class CardContact {

    @Input()
    public statusColor: string = '#E5E3DD';
    @Input()
    public imageURL: string = '../../../assets/img/profile.svg';
    @Input()
    public title: string = 'จะแสดงข้อมูลเพื่อช่วยให้คุณเข้าใจวัตถุประสงค์ของเพจได้ดียิ่งขึ้น รวมถึงสามารถดูได้ว่าผู้ที่จัดการและโพสต์เนื้อหาบนเพจได้ดำเนินการอะไรไปบ้าง';
    @Input()
    public fulfillRequestCount: number = 0;
    @Input()
    public unreadMessageCount: number = 0;
    @Input()
    public isRead: boolean = false;
    @Input()
    public asPage: string = 'asPage';
    @Input()
    public statusRead: string = '#FD545A';
    @Input()
    public emergencyEvent: string = 'เหตุการณ์ด่วน';
    @Input()
    public objective: string = 'สิ่งที่กำลังทำ';
    @Input()
    public description: string = 'ขอความคอนเทนต์';
    @Input()
    public name: string = 'ชื่อ นามสกุล';
    @Input()
    public chatMessage: string = 'ข้อความ';
    @Input()
    public chatDate: string = '0/00/00';
    @Input()
    public isCaseSelected: boolean;
    @Input()
    public data: any;
    @Output()
    public onClick: EventEmitter<any> = new EventEmitter();

    public isActive: boolean = false; 

    ngOnInit(): void { 
        if (this.data.status === FULFILLMENT_STATUS.INPROGRESS && (this.data.fulfillmentPost === null || this.data.fulfillmentPost === undefined || this.data.fulfillmentPost === '')) {
            this.statusColor = "#E5E3DD";
        } else if (this.data.status === FULFILLMENT_STATUS.CONFIRM && (this.data.fulfillmentPost === null || this.data.fulfillmentPost === undefined || this.data.fulfillmentPost === '')) {
            this.statusColor = "#FFB800";
        } else if (this.data.status === FULFILLMENT_STATUS.CONFIRM && (this.data.fulfillmentPost !== null && this.data.fulfillmentPost !== undefined && this.data.fulfillmentPost !== '')) {
            this.statusColor = "green";
        } else if (this.data.status === FULFILLMENT_STATUS.CANCEL) {
            this.statusColor = "red";
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes !== null && changes !== undefined) {
            if (changes.isCaseSelected !== null && changes.isCaseSelected !== undefined) {
                if (changes.isCaseSelected.currentValue === true) {
                    this.isActive = true;
                } else {
                    this.isActive = false;
                }
            }
        }
    }

    public getFulfillmentCase(event: any) { 
        this.onClick.emit(this.data);
    }
}
