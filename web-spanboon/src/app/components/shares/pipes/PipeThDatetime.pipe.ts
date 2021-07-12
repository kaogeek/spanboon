/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'thdatetime',
    pure: false
})

export class PipeThDatetime implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value) {
            const seconds = new Date(value);

            const date = seconds.toLocaleDateString('th-TH', {
                month: 'long',
                year: 'numeric',
            })

            const dateTime = (date)

            return dateTime;
        }

    }
}
