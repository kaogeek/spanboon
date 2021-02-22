/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform, NgZone, ChangeDetectorRef, OnDestroy } from "@angular/core";

@Pipe({
    name: 'dateFormat',
    pure: false
})

export class PipeDatetime implements PipeTransform, OnDestroy {
    private timer: number;
    constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) { }
    transform(value: string) {
        this.removeTimer();
        if(value){
            let d = new Date(value);
            let now = new Date();
            let seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
            let timeToUpdate = (Number.isNaN(seconds)) ? 1000 : this.getSecondsUntilUpdate(seconds) * 1000;
            this.timer = this.ngZone.runOutsideAngular(() => {
                if (typeof window !== 'undefined') {
                    return window.setTimeout(() => {
                        this.ngZone.run(() => this.changeDetectorRef.markForCheck());
                    }, timeToUpdate);
                }
                return null;
            });
    
            let minutes = Math.round(Math.abs(seconds / 60));
            let hours = Math.round(Math.abs(minutes / 60));
            let days = Math.round(Math.abs(hours / 24));
            let months = Math.round(Math.abs(days / 30.416));
            let years = Math.round(Math.abs(days / 365));
    
            if (Number.isNaN(seconds)) {
                return '';
            } else if (seconds <= 45) {
                return 'ไม่กี่วินาทีที่ผ่านมา';
            } if (minutes <= 45) {
                return minutes + ' นาทีที่แล้ว';
            } else if (hours <= 22) {
                return hours + ' ชั่วโมงที่แล้ว';
            } else if (days <= 25) {
                return days + ' วันที่แล้ว';
            } else if (days <= 345) {
                return months + ' เดือนที่แล้ว';
            } else {
                return years + ' ปีที่แล้ว';
            }
        } 
    }

    ngOnDestroy(): void {
        this.removeTimer();
    }

    private removeTimer() {
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
    }

    private getSecondsUntilUpdate(seconds: number) {
        let min = 60;
        let hr = min * 60;
        let day = hr * 24;
        if (seconds < min) { // less than 1 min, update every 2 secs
            return 2;
        } else if (seconds < hr) { // less than an hour, update every 30 secs
            return 30;
        } else if (seconds < day) { // less then a day, update every 5 mins
            return 300;
        } else { // update every hour
            return 3600;
        }
    }
}
