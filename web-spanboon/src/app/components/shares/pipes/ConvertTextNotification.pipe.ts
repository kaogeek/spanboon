/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'textnoti'
})

export class ConvertTextNotification implements PipeTransform {

    private rejectlist: string[] = ['ได้แชร์โพสต์ของ', 'ดูการเติบโตของเพจ', 'ส่งรูปภาพไปให้', 'กดถูกใจโพสต์ของคุณ', 'กดถูกใจโพสต์ของเพจ', 'คอมเม้นต์โพสต์', 'กดติดตามเพจ', 'แสดงความคิดเห็นโพสต์ของ'];

    transform(text: string, date: string): string {
        for (let re of this.rejectlist) {
            text = text.split(re).join('<span class="textthin">' + re + '</span><br/>');
        }
        text = text.split('และ').join('<span class="textthin">' + 'และ' + '</span>');
        text = (text + ('<br/>' + '<span class="textdate">' + date + '</span>'));
        return text;
    }
}
