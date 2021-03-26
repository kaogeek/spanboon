/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'dateFormat',
    pure: false
})

export class PipeDatetime implements PipeTransform {
    transform(value: any): any {
        if (value) {
            const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);

            if (seconds < 29) {
                return 'ไม่กี่วินาทีที่ผ่านมา';
            }

            const intervals = {
                'ปี': 31536000,
                'เดือน': 2592000,
                'วัน': 86400,
                'ชั่วโมง': 3600,
                'นาที': 60,
                'วินาที': 1
            };

            let counter;

            for (const i in intervals) {
                counter = Math.floor(seconds / intervals[i]);
                if (counter > 0) {
                    if (counter === 1) {
                        return counter + ' ' + i + 'ที่แล้ว'; // singular (1 day ago)
                    } else {
                        return counter + ' ' + i + 'ที่แล้ว'; // plural (2 days ago)
                    }
                }
            }
        }

        return value;
    }
}
