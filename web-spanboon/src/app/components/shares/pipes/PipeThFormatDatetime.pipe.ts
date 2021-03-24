/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'thformatdatetime',
    pure: false
})

export class PipeThFormatDatetime implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value) {
            const seconds = new Date(value);

            const result = seconds.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
            })

            return result;
        }

    }
}
